import { useMemo } from 'react';
import { Users, Star, AlertTriangle, AlertOctagon } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { evaluateFriend, getCategory } from '../../util/scoring';
import type { Friend, Group, Trait } from '../../types';
import { InfoTooltip } from '../InfoTooltip';

interface Props {
  friends: Friend[];
  groups: Group[];
  traits: Trait[];
}

export function GroupRanking({ friends, groups, traits }: Props) {
  const ranking = useMemo(() => {
    if (groups.length === 0) return null;
    const res = groups.map(group => {
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
    }).filter(Boolean) as { group: Group, avgScore: number, count: number, hasNoGo: boolean }[];
    
    return res.sort((a, b) => {
      if (a.avgScore === -999) return 1;
      if (b.avgScore === -999) return -1;
      return b.avgScore - a.avgScore;
    });
  }, [friends, groups, traits]);

  if (!ranking || ranking.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-indigo-600" /> Gruppen-Ranking
        <InfoTooltip text="Durchschnittliche Qualität der Beziehungen innerhalb deiner definierten Gruppen." />
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ranking.map((item, index) => {
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
  );
}