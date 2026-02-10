import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { 
  AlertTriangle, Search, Trophy, Users, Star, AlertOctagon, 
  Zap, Battery, Fingerprint, Activity
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { evaluateFriend, getCategory } from '../util/scoring';
import { IMPACT_WEIGHTS } from '../constants'; // Import für Thresholds

export function AnalyticsView() {
  const { friends, traits, groups } = useStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');

  const filteredFriends = useMemo(() => {
    if (selectedGroupId === 'ALL') return friends;
    if (selectedGroupId === 'NONE') return friends.filter(f => !f.groupId);
    return friends.filter(f => f.groupId === selectedGroupId);
  }, [friends, selectedGroupId]);

  // 1. MISSING VALUES (Lücken-Analyse)
  // Wir schauen auf Essentielle (7) und Sehr Wichtige (5) Werte
  const missingValues = useMemo(() => {
    const importantTraits = traits.filter(t => t.weight >= IMPACT_WEIGHTS.VERY_IMPORTANT && !t.isNoGo);
    if (importantTraits.length === 0 || filteredFriends.length === 0) return [];

    const stats = importantTraits.map(trait => {
      const totalScore = filteredFriends.reduce((sum, f) => {
        // Wir nehmen hier nur positive Werte, da negative ja "Gegenteil" bedeuten
        // und wir wissen wollen "wo fehlt das Gute?"
        const val = (f.ratings[trait.id] as number) || 0;
        return sum + Math.max(0, val);
      }, 0);
      const avg = totalScore / filteredFriends.length;
      return { trait, avg };
    });

    return stats.sort((a, b) => a.avg - b.avg).slice(0, 3);
  }, [filteredFriends, traits]);

  // 2. TOXIK-RADAR (Systemische Probleme)
  // NEUE LOGIK: Wir suchen Traits, die am meisten negativen Impact erzeugen
  const topIssues = useMemo(() => {
    if (traits.length === 0 || filteredFriends.length === 0) return [];

    const stats = traits.map(trait => {
      // Sammle alle negativen Impacts für diesen Trait
      const negativeImpacts = filteredFriends.map(f => {
        const val = f.ratings[trait.id];
        
        // No-Go: Zählt pauschal als schwerer Fehler (-35 äquivalent)
        if (trait.isNoGo && val === true) return -35;

        // Normale Traits: Berechne Impact wenn Bewertung negativ
        if (typeof val === 'number' && val < 0) {
          return val * trait.weight; // z.B. -5 * 7 = -35
        }
        return 0;
      }).filter(impact => impact < 0);

      const count = negativeImpacts.length;
      const totalIntensity = negativeImpacts.reduce((sum, impact) => sum + Math.abs(impact), 0);

      return { trait, count, percent: (count / filteredFriends.length) * 100, intensity: totalIntensity };
    });

    // Nur Traits anzeigen, die wirklich Schmerz verursachen
    return stats.filter(s => s.intensity > 0).sort((a, b) => b.intensity - a.intensity).slice(0, 3);
  }, [filteredFriends, traits]);  
  
  const ambivalentFriends = useMemo(() => {
    if (filteredFriends.length === 0) return [];

    return filteredFriends.map(f => {
      let posScore = 0;
      let negScore = 0;

      traits.forEach(t => {
        const val = f.ratings[t.id];
        if (t.isNoGo || typeof val !== 'number') return;        
      
        const impact = t.weight * val;

        if (impact > 0) {
          posScore += impact;
        } else if (impact < 0) {
          negScore += Math.abs(impact);
        }
      });

      // Konflikt ist hoch, wenn BEIDE Konten gefüllt sind
      const conflictScore = Math.min(posScore, negScore);

      return { friend: f, conflictScore, posScore, negScore };
    })
    .filter(res => res.conflictScore > 30) 
    .sort((a, b) => b.conflictScore - a.conflictScore)
    .slice(0, 3);
  }, [filteredFriends, traits]);

  const energyStats = useMemo(() => {
    let chargers = 0;
    let drainers = 0;
    let neutrals = 0;
    let total = 0;
    filteredFriends.forEach(f => {
      const result = evaluateFriend(f, traits);
      if (result.isNoGo || result.label === 'Belastend' || result.label === 'Toxisch') drainers++;
      else if (result.label === 'Super' || result.label === 'Gut') chargers++;
      else neutrals++;
      total++;
    });
    return { chargers, drainers, neutrals, total };
  }, [filteredFriends, traits]);

  const dominantTraits = useMemo(() => {
    // Hier schauen wir auf Traits, die am meisten positive Punkte bringen
    const positiveTraits = traits.filter(t => !t.isNoGo); 
    if (positiveTraits.length === 0 || filteredFriends.length === 0) return [];

    const stats = positiveTraits.map(trait => {
      const totalIntensity = filteredFriends.reduce((sum, f) => {
        const val = (f.ratings[trait.id] as number) || 0;
        // Nur positive Beiträge zählen zur "Dominanz"
        return sum + Math.max(0, val * trait.weight);
      }, 0);
      return { trait, totalIntensity };
    });

    return stats.sort((a, b) => b.totalIntensity - a.totalIntensity).slice(0, 3);
  }, [filteredFriends, traits]);

  // ... GroupRanking bleibt gleich (nutzt evaluateFriend) ...
  const groupRanking = useMemo(() => {
    if (selectedGroupId !== 'ALL' || groups.length === 0) return null;
    const ranking = groups.map(group => {
      const groupFriends = friends.filter(f => f.groupId === group.id);
      if (groupFriends.length === 0) return null;
      let validScoresCount = 0;
      let hasNoGo = false;
      const totalScore = groupFriends.reduce((sum, f) => {
        const result = evaluateFriend(f, traits);
        if (result.isNoGo) { hasNoGo = true; return sum; }
        validScoresCount++;
        return sum + result.score;
      }, 0);
      const avgScore = validScoresCount > 0 ? totalScore / validScoresCount : (hasNoGo ? -999 : 0);
      return { group, avgScore, count: groupFriends.length, hasNoGo };
    }).filter(Boolean) as { group: any, avgScore: number, count: number, hasNoGo: boolean }[];
    return ranking.sort((a, b) => {
      if (a.avgScore === -999) return 1;
      if (b.avgScore === -999) return -1;
      return b.avgScore - a.avgScore;
    });
  }, [friends, groups, traits, selectedGroupId]);

  if (friends.length === 0) return <div className="p-10 text-center text-slate-400">Erfasse erst ein paar Personen für eine Analyse.</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* FILTER HEADER (Unverändert) */}
      <div className="bg-white border-b border-slate-200 p-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setSelectedGroupId('ALL')} className={clsx("px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition", selectedGroupId === 'ALL' ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>Alle ({friends.length})</button>
        {groups.map(g => (
          <button key={g.id} onClick={() => setSelectedGroupId(g.id)} className={clsx("px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition", selectedGroupId === g.id ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300")}>{g.name}</button>
        ))}
        <button onClick={() => setSelectedGroupId('NONE')} className={clsx("px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition", selectedGroupId === 'NONE' ? "bg-slate-400 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-slate-400")}>Ohne Gruppe</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* MISSING VALUES */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Search className="w-4 h-4" /> Vermisste Werte</h3>
              {missingValues.length > 0 ? (
                <div className="space-y-4 flex-1">
                  {missingValues.map(({ trait, avg }) => (
                    <div key={trait.id}>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-slate-700">{trait.name}</span>
                        <span className={clsx("font-bold", avg < 2 ? "text-red-500" : "text-orange-500")}>Ø {avg.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-300 rounded-full" style={{ width: `${Math.max(0, (avg / 5) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm italic flex-1 flex items-center">Wichtige Werte sind gut vertreten.</p>}
            </motion.div>

            {/* AMBIVALENZ */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-500" /> Ambivalenz-Radar</h3>
              {ambivalentFriends.length > 0 ? (
                <div className="space-y-3 flex-1">
                  {ambivalentFriends.map(({ friend, posScore, negScore }) => (
                    <div key={friend.id} className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 text-sm">{friend.name}</span>
                        <span className="text-[10px] font-bold text-purple-600 bg-white px-1.5 rounded border border-purple-200">Zwiespältig</span>
                      </div>
                      <div className="flex gap-1 h-1.5 mt-2">
                        <div className="bg-green-400 rounded-l-full" style={{ flex: posScore || 1 }} />
                        <div className="bg-red-400 rounded-r-full" style={{ flex: negScore || 1 }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>+{Math.round(posScore)} Impact</span><span>-{Math.round(negScore)} Impact</span></div>
                    </div>
                  ))}
                </div>
              ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><Fingerprint className="w-8 h-8 mb-2 opacity-20" /><p className="text-sm italic">Keine "Jekyll & Hyde" Beziehungen.</p></div>}
            </motion.div>

            {/* TOXIK RADAR (Neu: Systemische Probleme) */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Systemische Probleme</h3>
              {topIssues.length > 0 ? (
                <div className="space-y-4 flex-1">
                  {topIssues.map(({ trait, count, percent }) => (
                    <div key={trait.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-orange-100 text-orange-600">
                        {Math.round(percent)}%
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{trait.name}</div>
                        
                        {/* HIER ÄNDERN: Statt "Betrifft" schreiben wir "Negativ bei" */}
                        <div className="text-[10px] text-slate-500">
                          Negativ bei <strong className="text-slate-700">{count}</strong> Personen
                        </div>
                        
                      </div>
                    </div>
                  ))}
                                  </div>
              ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><Trophy className="w-8 h-8 mb-2 opacity-20" /><p className="text-sm italic">Keine systemischen Probleme.</p></div>}
            </motion.div>
          </div>

          {/* ROW 2 & 3 (Energy / Values / Groups) - Unverändert zur Vorversion, nur Props-Passing entfällt im UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2"><Battery className="w-4 h-4 text-green-600" /> Energie-Bilanz</h3>
              <div className="flex items-center gap-2 h-8 rounded-full overflow-hidden bg-slate-100 mb-4">
                {energyStats.chargers > 0 && <div className="h-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${(energyStats.chargers / energyStats.total) * 100}%` }}>{energyStats.chargers}</div>}
                {energyStats.neutrals > 0 && <div className="h-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold" style={{ width: `${(energyStats.neutrals / energyStats.total) * 100}%` }}>{energyStats.neutrals}</div>}
                {energyStats.drainers > 0 && <div className="h-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${(energyStats.drainers / energyStats.total) * 100}%` }}>{energyStats.drainers}</div>}
              </div>
              <div className="flex justify-between text-xs text-slate-500 px-1">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Kraftgeber</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300" /> Neutral</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> Zehrer</div>
              </div>
            </motion.div>

             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Dominante Werte</h3>
              <div className="flex flex-wrap gap-2">
                {dominantTraits.map((t, i) => (
                   <div key={t.trait.id} className={clsx("px-3 py-1.5 rounded-lg text-sm font-bold border", i === 0 ? "bg-indigo-50 text-indigo-700 border-indigo-100 ring-1 ring-indigo-100" : "bg-white text-slate-600 border-slate-200")}>{i+1}. {t.trait.name}</div>
                ))}
                {dominantTraits.length === 0 && <span className="text-slate-400 text-sm italic">Zu wenig Daten.</span>}
              </div>
            </motion.div>
          </div>

          {/* GROUP RANKING */}
          {selectedGroupId === 'ALL' && groupRanking && groupRanking.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" /> Gruppen-Ranking</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupRanking.map((item, index) => {
                  const config = getCategory(item.avgScore, item.hasNoGo);
                  const barPercent = Math.max(0, Math.min(100, item.avgScore));
                  return (
                    <div key={item.group.id} className={clsx("bg-white p-5 rounded-lg border shadow-sm relative overflow-hidden group transition hover:border-indigo-300", item.hasNoGo ? "border-red-100 bg-red-50/30" : "border-slate-200")}>
                      <div className="flex justify-between items-start mb-2">
                        <div><h4 className="font-bold text-slate-800">{item.group.name}</h4><span className="text-xs text-slate-500">{item.count} Personen</span></div>
                        <div className={clsx("text-lg font-black", config.color)}>{item.hasNoGo ? <AlertOctagon className="w-6 h-6" /> : `${Math.round(item.avgScore)}%`}</div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">{!item.hasNoGo && <div className={clsx("h-full", config.barColor)} style={{ width: `${barPercent}%` }} />}</div>
                      <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                         {index === 0 && item.avgScore > 25 && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                         {item.hasNoGo && <AlertTriangle className="w-3 h-3 text-red-500" />}
                         <span>{item.hasNoGo ? "Vorsicht: NO-GOs!" : config.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}