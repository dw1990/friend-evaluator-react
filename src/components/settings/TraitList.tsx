import { Trash2 } from 'lucide-react';
import type { Trait } from '../../types';
import { IMPACT_CONFIG, getImpactConfig } from '../../constants'; // <--- Import
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  traits: Trait[];
  onRemove: (id: string) => void;
}

export function TraitList({ traits, onRemove }: Props) {

  const renderTraitBadge = (trait: Trait) => {
    // Style dynamisch ermitteln
    let styleClass = "bg-slate-100 text-slate-800"; // Fallback
    
    if (trait.isNoGo) {
      styleClass = "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200";
    } else {
      const config = getImpactConfig(trait.weight);
      if (config) styleClass = config.badgeClass;
    }

    return (
      <motion.div 
        key={trait.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
        className={clsx(
          "flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-xs font-medium shadow-sm border transition-all hover:shadow-md cursor-default",
          styleClass
        )}
      >
        <span>{trait.name}</span>
        <button 
          onClick={() => onRemove(trait.id)}
          className="ml-1 p-0.5 hover:bg-black/10 rounded text-current/50 hover:text-current transition"
          type="button"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </motion.div>
    );
  };

  const renderGroup = (title: string, items: Trait[], titleClass: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h3 className={clsx("text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1", titleClass)}>
          {title}
        </h3>
        <motion.div layout className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {items.map(renderTraitBadge)}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  if (traits.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* 1. No-Gos immer extra (Sonderfall) */}
      {renderGroup("No-Gos", traits.filter(t => t.isNoGo), "text-red-700")}

      {/* 2. Dynamische Gruppen basierend auf Config (Reihenfolge kehren wir um: Positiv zuerst) */}
      {[...IMPACT_CONFIG].reverse().map(config => (
        <div key={config.value}>
          {renderGroup(
            config.groupTitle, 
            traits.filter(t => !t.isNoGo && t.weight === config.value),
            config.textColor
          )}
        </div>
      ))}
    </div>
  );
}