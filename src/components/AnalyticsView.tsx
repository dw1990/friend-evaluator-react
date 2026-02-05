import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { 
  AlertTriangle, Search, Trophy, Users, Star, AlertOctagon
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
// IMPORT DES SERVICE
import { evaluateFriend } from '../util/scoring';
import type { Group } from '../types';

export function AnalyticsView() {
  const { friends, traits, groups } = useStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');

  const filteredFriends = useMemo(() => {
    if (selectedGroupId === 'ALL') return friends;
    if (selectedGroupId === 'NONE') return friends.filter(f => !f.groupId);
    return friends.filter(f => f.groupId === selectedGroupId);
  }, [friends, selectedGroupId]);

  const missingValues = useMemo(() => {
    const importantTraits = traits.filter(t => t.weight === 7 && !t.isNoGo);
    if (importantTraits.length === 0 || filteredFriends.length === 0) return [];

    const stats = importantTraits.map(trait => {
      const totalScore = filteredFriends.reduce((sum, f) => {
        const val = (f.ratings[trait.id] as number) || 0;
        return sum + val;
      }, 0);
      const avg = totalScore / filteredFriends.length;
      return { trait, avg };
    });

    return stats.sort((a, b) => a.avg - b.avg).slice(0, 3);
  }, [filteredFriends, traits]);

  const topIssues = useMemo(() => {
    const negativeTraits = traits.filter(t => t.weight < 0 || t.isNoGo);
    if (negativeTraits.length === 0 || filteredFriends.length === 0) return [];

    const stats = negativeTraits.map(trait => {
      const affectedCount = filteredFriends.filter(f => {
        const val = f.ratings[trait.id];
        return trait.isNoGo ? val === true : (val as number) > 0;
      }).length;
      return { trait, count: affectedCount, percent: (affectedCount / filteredFriends.length) * 100 };
    });

    return stats.filter(s => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [filteredFriends, traits]);

  const groupRanking = useMemo(() => {
    if (selectedGroupId !== 'ALL' || groups.length === 0) return null;

    const ranking = groups.map(group => {
      const groupFriends = friends.filter(f => f.groupId === group.id);
      if (groupFriends.length === 0) return null;

      let validScoresCount = 0;
      let hasNoGo = false;

      // Wir summieren die Scores
      const totalScore = groupFriends.reduce((sum, f) => {
        // HIER DER CALL ZUM SERVICE
        const result = evaluateFriend(f, traits);
        
        if (result.isNoGo) {
          hasNoGo = true;
          return sum; // No-Go fließt nicht in den Durchschnitt ein
        }
        validScoresCount++;
        return sum + result.score; // Wir nehmen den raw score (-100 bis 100)
      }, 0);
      
      const avgScore = validScoresCount > 0 ? totalScore / validScoresCount : (hasNoGo ? -999 : 0);
      
      return { group, avgScore, count: groupFriends.length, hasNoGo };
    }).filter(Boolean) as { group: Group, avgScore: number, count: number, hasNoGo: boolean }[];

    return ranking.sort((a, b) => {
      if (a.avgScore === -999) return 1;
      if (b.avgScore === -999) return -1;
      return b.avgScore - a.avgScore;
    });
  }, [friends, groups, traits, selectedGroupId]);


  if (friends.length === 0) {
    return <div className="p-10 text-center text-slate-400">Erfasse erst ein paar Personen für eine Analyse.</div>;
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      
      {/* FILTER HEADER (Unverändert) */}
      <div className="bg-white border-b border-slate-200 p-4 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedGroupId('ALL')}
          className={clsx(
            "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition",
            selectedGroupId === 'ALL' ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          Alle ({friends.length})
        </button>
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroupId(g.id)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition",
              selectedGroupId === g.id ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
            )}
          >
            {g.name}
          </button>
        ))}
        <button
          onClick={() => setSelectedGroupId('NONE')}
          className={clsx(
            "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition",
            selectedGroupId === 'NONE' ? "bg-slate-400 text-white" : "bg-white border border-slate-200 text-slate-400 hover:border-slate-400"
          )}
        >
          Ohne Gruppe
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* INSIGHTS CARDS (Unverändert) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" /> Vermisste Werte (+7)
              </h3>
              {missingValues.length > 0 ? (
                <div className="space-y-4">
                  {missingValues.map(({ trait, avg }) => (
                    <div key={trait.id}>
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-slate-700">{trait.name}</span>
                        <span className={clsx("font-bold", avg < 2 ? "text-red-500" : "text-orange-500")}>
                          Nur {avg.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-300 rounded-full" 
                          style={{ width: `${(avg / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {avg < 1.5 ? "Kommt in diesem Kreis fast gar nicht vor." : "Ist unterdurchschnittlich vertreten."}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Alles bestens. Deine wichtigsten Werte werden hier gut erfüllt.</p>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Häufigste Probleme
              </h3>
              {topIssues.length > 0 ? (
                <div className="space-y-4">
                  {topIssues.map(({ trait, count, percent }) => (
                    <div key={trait.id} className="flex items-center gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                        trait.isNoGo ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                      )}>
                        {Math.round(percent)}%
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{trait.name}</div>
                        <div className="text-xs text-slate-500">
                          Betrifft <strong className="text-slate-700">{count}</strong> von {filteredFriends.length} Personen
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                  <Trophy className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Keine systemischen Probleme gefunden.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* GROUP RANKING */}
          {selectedGroupId === 'ALL' && groupRanking && groupRanking.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Gruppen-Ranking
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupRanking.map((item, index) => {
                  
                  // WICHTIG: Wir nutzen den Service-Dummy-Aufruf, um an die Config (Farben) zu kommen
                  // Das ist ein kleiner Trick, um DRY zu bleiben. 
                  // Wir erstellen ein Fake-Friend-Objekt nur für die Visualisierung der Gruppe
                  const dummyResult = evaluateFriend(
                    { ratings: { 'dummy': 5 } } as any, 
                    // Wir simulieren ein Trait mit dem Gewicht des Durchschnitts
                    [{ id: 'dummy', weight: item.avgScore / 5, name: 'dummy', isNoGo: false } as any]
                  );
                  
                  // Wenn avgScore -999 ist (nur NoGos), überschreiben wir das
                  const isNoGoGroup = item.avgScore === -999;
                  const config = isNoGoGroup 
                    ? { color: "text-red-700", barColor: "bg-red-700", label: "NO-GOs enthalten" }
                    : dummyResult; // Farben kommen aus dem Service!

                  const barPercent = Math.max(0, Math.min(100, item.avgScore));

                  return (
                    <div key={item.group.id} className={clsx("bg-white p-5 rounded-lg border shadow-sm relative overflow-hidden group transition hover:border-indigo-300", 
                      isNoGoGroup ? "border-red-100 bg-red-50/30" : "border-slate-200"
                    )}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-slate-800">{item.group.name}</h4>
                          <span className="text-xs text-slate-500">{item.count} Personen</span>
                        </div>
                        <div className={clsx("text-lg font-black", config.color)}>
                          {isNoGoGroup ? <AlertOctagon className="w-6 h-6" /> : `${Math.round(item.avgScore)}%`}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                        {!isNoGoGroup && (
                          <div 
                            className={clsx("h-full", config.barColor)}
                            style={{ width: `${barPercent}%` }}
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                         {index === 0 && item.avgScore > 25 && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                         {item.hasNoGo && <AlertTriangle className="w-3 h-3 text-red-500" />}
                         <span>
                          {item.hasNoGo ? "Vorsicht: NO-GOs!" : config.label}
                         </span>
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