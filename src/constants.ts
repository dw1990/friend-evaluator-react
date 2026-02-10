// src/constants.ts

export const IMPACT_WEIGHTS = {
  BONUS: 1,            // "Nice to have"
  IMPORTANT: 3,        // "Wichtig"
  VERY_IMPORTANT: 5,   // "Sehr Wichtig" (Schwellenwert für Toxizität bei Fehltritt)
  ESSENTIAL: 7,        // "Essentiell" (DNA)
} as const;

export const IMPACT_CONFIG = [
  { 
    value: IMPACT_WEIGHTS.BONUS, 
    label: 'Bonus', 
    color: 'bg-sky-400 hover:bg-sky-500', 
    textColor: 'text-sky-600',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-100',
    groupTitle: 'Nice to have (Bonus)'
  },
  { 
    value: IMPACT_WEIGHTS.IMPORTANT, 
    label: 'Wichtig', 
    color: 'bg-indigo-500 hover:bg-indigo-600', 
    textColor: 'text-indigo-700',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-100',
    groupTitle: 'Wichtige Werte'
  },
  { 
    value: IMPACT_WEIGHTS.VERY_IMPORTANT, 
    label: 'Sehr Wichtig', 
    color: 'bg-violet-600 hover:bg-violet-700', 
    textColor: 'text-violet-700',
    badgeClass: 'bg-violet-50 text-violet-800 border-violet-100',
    groupTitle: 'Sehr wichtige Werte'
  },
  { 
    value: IMPACT_WEIGHTS.ESSENTIAL, 
    label: 'Essentiell', 
    color: 'bg-fuchsia-600 hover:bg-fuchsia-700', 
    textColor: 'text-fuchsia-700',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100',
    groupTitle: 'Essentielle Werte (DNA)'
  },
] as const;

export function getImpactConfig(weight: number) {
  return IMPACT_CONFIG.find(c => c.value === weight);
}