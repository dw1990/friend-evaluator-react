import { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { Friend, Trait } from '../../types';

interface Props {
  friends: Friend[];
  traits: Trait[];
}

export function DominantTraitsCard({ friends, traits }: Props) {
  const dominantTraits = useMemo(() => {
    const positiveTraits = traits.filter(t => !t.isNoGo); 
    if (positiveTraits.length === 0 || friends.length === 0) return [];
    const stats = positiveTraits.map(trait => {
      const totalIntensity = friends.reduce((sum, f) => {
        const val = (f.ratings[trait.id] as number) || 0;
        return sum + Math.max(0, val * trait.weight);
      }, 0);
      return { trait, totalIntensity };
    });
    return stats.sort((a, b) => b.totalIntensity - a.totalIntensity).slice(0, 3);
  }, [friends, traits]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-500" /> Dominante Werte
      </h3>
      <div className="flex flex-wrap gap-2">
        {dominantTraits.map((t, i) => (
           <div key={t.trait.id} className={clsx("px-3 py-1.5 rounded-lg text-sm font-bold border", i === 0 ? "bg-indigo-50 text-indigo-700 border-indigo-100 ring-1 ring-indigo-100" : "bg-white text-slate-600 border-slate-200")}>{i+1}. {t.trait.name}</div>
        ))}
        {dominantTraits.length === 0 && <span className="text-slate-400 text-sm italic">Zu wenig Daten.</span>}
      </div>
    </motion.div>
  );
}