import { useMemo } from 'react';
import { AlertTriangle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { IMPACT_WEIGHTS } from '../../constants';
import type { Friend, Trait } from '../../types';
import { InfoTooltip } from '../InfoTooltip';

interface Props {
  friends: Friend[];
  traits: Trait[];
}

export function SystemicIssuesCard({ friends, traits }: Props) {
  const topIssues = useMemo(() => {
    if (traits.length === 0 || friends.length === 0) return [];
   
    const relevantTraits = traits.filter(t => t.weight >= IMPACT_WEIGHTS.IMPORTANT);

    const stats = relevantTraits.map(trait => {
      // 2. PROBLEM-ZÄHLER
      // Bei wie vielen Leuten ist dieser WICHTIGE Wert im Minus?
      const negativeCount = friends.filter(f => {
        const val = f.ratings[trait.id];
        
        // No-Go ist immer ein Problem
        if (trait.isNoGo && val === true) return true;
        
        // Negativer Wert (-1 bis -5) ist ein Problem
        if (typeof val === 'number' && val < 0) return true;
        
        return false;
      }).length;

      const percent = (negativeCount / friends.length) * 100;
      
      return { trait, count: negativeCount, percent };
    });

    // 3. SCHWELLENWERT & SORTIERUNG
    // Wir zeigen nur Probleme an, die ein Muster sind (>= 20% der Freunde).
    // Sortiert nach Häufigkeit (die weitverbreitetste "Krankheit" zuerst).
    return stats
      .filter(s => s.percent >= 20) 
      .sort((a, b) => b.percent - a.percent) 
      .slice(0, 3);
  }, [friends, traits]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-orange-500" /> Systemische Probleme
        <InfoTooltip text="Zeigt wichtige Eigenschaften, die bei mehr als 20% deiner Kontakte negativ sind (Häufigkeit)." />
      </h3>
      {topIssues.length > 0 ? (
        <div className="space-y-4 flex-1">
          {topIssues.map(({ trait, count, percent }) => (
            <div key={trait.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-orange-100 text-orange-600 border border-orange-200">
                {Math.round(percent)}%
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">{trait.name}</div>
                <div className="text-[10px] text-slate-500">
                  Negativ bei <strong className="text-slate-900">{count}</strong> von {friends.length} Personen
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center px-4">
          <Trophy className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm italic">
            Keine gehäuften Muster bei wichtigen Werten.
          </p>
        </div>
      )}
    </motion.div>
  );
}