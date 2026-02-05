import { useState } from 'react';
import { useStore } from '../store';
import { Trash2, Plus, ShieldAlert } from 'lucide-react';
import type { ImpactLevel, Trait } from '../types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- KONFIGURATION ---

const WEIGHT_OPTIONS: { value: ImpactLevel; label: string; color: string; textClass: string }[] = [
  { value: -7, label: 'Schadet mir', color: 'bg-red-600 hover:bg-red-700', textClass: 'text-red-700' },
  { value: -3, label: 'Tut nicht gut', color: 'bg-orange-500 hover:bg-orange-600', textClass: 'text-orange-700' },
  { value: 3, label: 'Tut mir gut', color: 'bg-emerald-500 hover:bg-emerald-600', textClass: 'text-emerald-700' },
  { value: 7, label: 'Hilft mir sehr', color: 'bg-green-600 hover:bg-green-700', textClass: 'text-green-700' },
];

function getBadgeStyle(weight: ImpactLevel, isNoGo: boolean): string {
  if (isNoGo) return "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200";
  switch (weight) {
    case -7: return "bg-red-50 text-red-800 border-red-100";
    case -3: return "bg-orange-50 text-orange-800 border-orange-100";
    case 3:  return "bg-emerald-50 text-emerald-800 border-emerald-100";
    case 7:  return "bg-green-50 text-green-800 border-green-100";
    default: return "bg-slate-100 text-slate-800";
  }
}

export function SettingsPanel() {
  const { traits, addTrait, removeTrait } = useStore();

  const [traitName, setTraitName] = useState('');
  const [selectedWeight, setSelectedWeight] = useState<ImpactLevel>(3);
  const [isNoGo, setIsNoGo] = useState(false);

  const handleAddTrait = () => {
    if (!traitName.trim()) return;
    addTrait(traitName, selectedWeight, isNoGo);
    setTraitName('');
    setIsNoGo(false);
  };

  const renderTraitGroup = (title: string, items: Trait[], titleClass: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h3 className={clsx("text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1", titleClass)}>
          {title}
        </h3>
        <motion.div layout className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {items.map((trait) => (
              <motion.div 
                key={trait.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                className={clsx(
                  "flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-xs font-medium shadow-sm border transition-all hover:shadow-md cursor-default",
                  getBadgeStyle(trait.weight, trait.isNoGo)
                )}
              >
                <span>{trait.name}</span>
                <button 
                  onClick={() => removeTrait(trait.id)}
                  className="ml-1 p-0.5 hover:bg-black/10 rounded text-current/50 hover:text-current transition"
                  type="button"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      
      {/* --- CREATE TRAIT --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600" />
          Kriterien definieren
        </h2>

        <div className="space-y-4 p-1">
          <input
            type="text"
            placeholder="Neue Eigenschaft..."
            value={traitName}
            onChange={(e) => setTraitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTrait()}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />

          <div className="grid grid-cols-2 gap-2">
              {WEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedWeight(opt.value)}
                  className={clsx(
                    "text-xs py-2 px-1 rounded-md font-medium text-white transition-all shadow-sm truncate",
                    opt.color,
                    selectedWeight === opt.value ? "ring-2 ring-offset-1 ring-slate-400 scale-[1.02] shadow-md z-10" : "opacity-60 hover:opacity-100"
                  )}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <input 
              type="checkbox" 
              checked={isNoGo} 
              onChange={(e) => setIsNoGo(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition">
              Ist ein <strong>No-Go</strong> (K.O.-Kriterium)
            </span>
          </label>

          <button
            onClick={handleAddTrait}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium transition active:scale-95 shadow-sm"
            type="button"
          >
            <Plus className="w-4 h-4" /> Speichern
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* --- TRAIT LIST --- */}
      {traits.length > 0 && (
        <div className="space-y-2">
          {renderTraitGroup("No-Gos", traits.filter(t => t.isNoGo), "text-red-700")}
          {renderTraitGroup("Hilft mir sehr", traits.filter(t => !t.isNoGo && t.weight === 7), "text-green-700")}
          {renderTraitGroup("Tut mir gut", traits.filter(t => !t.isNoGo && t.weight === 3), "text-emerald-600")}
          {renderTraitGroup("Tut nicht gut", traits.filter(t => !t.isNoGo && t.weight === -3), "text-orange-600")}
          {renderTraitGroup("Schadet mir", traits.filter(t => !t.isNoGo && t.weight === -7), "text-red-600")}
        </div>
      )}

      {/* Gruppen und Personen sind hier entfernt worden */}

    </div>
  );
}