import { useMemo } from 'react';
import { Activity, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Friend, Trait } from '../../types';
import { InfoTooltip } from '../InfoTooltip';

interface Props {
  friends: Friend[];
  traits: Trait[];
}

export function AmbivalenceCard({ friends, traits }: Props) {
  const ambivalentFriends = useMemo(() => {
    if (friends.length === 0) return [];
    return friends.map(f => {
      let posScore = 0;
      let negScore = 0;
      traits.forEach(t => {
        const val = f.ratings[t.id];
        if (t.isNoGo || typeof val !== 'number') return;        
        const impact = t.weight * val;
        if (impact > 0) posScore += impact;
        else if (impact < 0) negScore += Math.abs(impact);
      });
      const conflictScore = Math.min(posScore, negScore);
      return { friend: f, conflictScore, posScore, negScore };
    })
    .filter(res => res.conflictScore > 30)
    .sort((a, b) => b.conflictScore - a.conflictScore)
    .slice(0, 3);
  }, [friends, traits]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-purple-500" /> Ambivalenz-Radar
        <InfoTooltip text="Zeigt Personen, die gleichzeitig sehr positive UND sehr negative Eigenschaften haben (hoher innerer Konflikt)." />
      </h3>
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
  );
}