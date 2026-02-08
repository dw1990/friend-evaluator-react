// Die rohen Werte (für Logik & Vergleiche)
export const IMPACT_WEIGHTS = {
  DAMAGE_HEAVY: -7,
  DAMAGE_LIGHT: -3,
  BENEFIT_LIGHT: 3,
  BENEFIT_HEAVY: 7,
} as const;

// Die UI-Konfiguration (für Selectors, Badges, Listen)
// Wir nutzen ein Array, damit die Reihenfolge im UI (z.B. Buttons) garantiert ist.
export const IMPACT_CONFIG = [
  { 
    value: IMPACT_WEIGHTS.DAMAGE_HEAVY, 
    label: 'Schadet mir', 
    color: 'bg-red-600 hover:bg-red-700', 
    textColor: 'text-red-700',
    badgeClass: 'bg-red-50 text-red-800 border-red-100',
    groupTitle: 'Schadet mir'
  },
  { 
    value: IMPACT_WEIGHTS.DAMAGE_LIGHT, 
    label: 'Tut nicht gut', 
    color: 'bg-orange-500 hover:bg-orange-600', 
    textColor: 'text-orange-700',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-100',
    groupTitle: 'Tut nicht gut'
  },
  { 
    value: IMPACT_WEIGHTS.BENEFIT_LIGHT, 
    label: 'Tut mir gut', 
    color: 'bg-emerald-500 hover:bg-emerald-600', 
    textColor: 'text-emerald-700',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-100',
    groupTitle: 'Tut mir gut'
  },
  { 
    value: IMPACT_WEIGHTS.BENEFIT_HEAVY, 
    label: 'Hilft mir sehr', 
    color: 'bg-green-600 hover:bg-green-700', 
    textColor: 'text-green-700',
    badgeClass: 'bg-green-50 text-green-800 border-green-100',
    groupTitle: 'Hilft mir sehr'
  },
] as const;

// Helper um schnell an Config für einen Wert zu kommen (Lookup)
export function getImpactConfig(weight: number) {
  return IMPACT_CONFIG.find(c => c.value === weight);
}