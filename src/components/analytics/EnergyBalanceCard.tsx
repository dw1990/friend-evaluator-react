import { useMemo } from 'react';
import { Battery } from 'lucide-react';
import { motion } from 'framer-motion';
import { evaluateFriend } from '../../util/scoring';
import type { Friend, Trait } from '../../types';
import { InfoTooltip } from '../InfoTooltip';

interface Props {
  friends: Friend[];
  traits: Trait[];
}

export function EnergyBalanceCard({ friends, traits }: Props) {
  const energyStats = useMemo(() => {
    let chargers = 0, drainers = 0, neutrals = 0, total = 0;
    friends.forEach(f => {
      const result = evaluateFriend(f, traits);
      if (result.isNoGo || result.label === 'Belastend' || result.label === 'Toxisch') drainers++;
      else if (result.label === 'Super' || result.label === 'Gut') chargers++;
      else neutrals++;
      total++;
    });
    return { chargers, drainers, neutrals, total };
  }, [friends, traits]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
        <Battery className="w-4 h-4 text-green-600" /> Energie-Bilanz
        <InfoTooltip text="Verhältnis von Kraftgebern (Super/Gut) zu Zehrern (Belastend/Toxisch) im gesamten Netzwerk." />
      </h3>
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
  );
}