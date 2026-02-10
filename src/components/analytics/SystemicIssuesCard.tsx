import { useMemo } from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Friend, Trait } from '../../types';

interface Props {
  friends: Friend[];
  traits: Trait[];
}

export function SystemicIssuesCard({ friends, traits }: Props) {
  const topIssues = useMemo(() => {
    if (traits.length === 0 || friends.length === 0) return [];
    const stats = traits.map(trait => {
      const negativeImpacts = friends.map(f => {
        const val = f.ratings[trait.id];
        if (trait.isNoGo && val === true) return -35;
        if (typeof val === 'number' && val < 0) return val * trait.weight;
        return 0;
      }).filter(impact => impact < 0);

      const count = negativeImpacts.length;
      const totalIntensity = negativeImpacts.reduce((sum, impact) => sum + Math.abs(impact), 0);
      return { trait, count, percent: (count / friends.length) * 100, intensity: totalIntensity };
    });
    return stats.filter(s => s.intensity > 0).sort((a, b) => b.intensity - a.intensity).slice(0, 3);
  }, [friends, traits]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-orange-500" /> Systemische Probleme
      </h3>
      {topIssues.length > 0 ? (
        <div className="space-y-4 flex-1">
          {topIssues.map(({ trait, count, percent }) => (
            <div key={trait.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-orange-100 text-orange-600">
                {Math.round(percent)}%
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">{trait.name}</div>
                <div className="text-[10px] text-slate-500">
                  Negativ bei <strong className="text-slate-700">{count}</strong> Personen
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><Trophy className="w-8 h-8 mb-2 opacity-20" /><p className="text-sm italic">Keine systemischen Probleme.</p></div>}
    </motion.div>
  );
}