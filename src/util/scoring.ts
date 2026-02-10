import { 
  AlertOctagon, 
  HeartHandshake, 
  Smile, 
  Meh, 
  Frown, 
  AlertTriangle
} from 'lucide-react';
import type { Friend, Trait } from '../types';

export interface ScoreResult {
  score: number;
  percentage: number;
  label: string;
  color: string;
  bg: string;
  barColor: string;
  icon: any;
  isNoGo: boolean;
}

// TOXIC THRESHOLD
const TOXIC_THRESHOLD = -20; 

export function getCategory(percentage: number, isNoGo: boolean, negativeScore: number = 0): ScoreResult {
  
  // 1. NO-GO Check
  if (isNoGo) {
    return {
      score: -999,
      percentage: 100, 
      label: 'NO-GO',
      color: 'text-red-700',
      bg: 'bg-red-50',
      barColor: 'bg-red-600',
      icon: AlertOctagon,
      isNoGo: true
    };
  }

  const uiPercentage = Math.max(0, Math.min(100, percentage));

  // 2. TOXIC OVERRIDE
  if (negativeScore <= TOXIC_THRESHOLD) {
    return {
      score: percentage, percentage: uiPercentage, 
      label: 'Toxisch', color: 'text-amber-700', bg: 'bg-amber-100', barColor: 'bg-amber-500', 
      icon: AlertTriangle, isNoGo: false
    };
  }

  // 3. REALISTISCHE SKALA (Basiert auf -5 bis +5 Logik)

  // SUPER: Ab 60% (Entspricht Ø Rating 3.0 von 5)
  // Das ist sehr stark. Eine 3 ist "Wichtig".
  if (percentage >= 60) {
    return {
      score: percentage,
      percentage: uiPercentage,
      label: 'Super',
      color: 'text-green-600',
      bg: 'bg-green-50',
      barColor: 'bg-green-500',
      icon: HeartHandshake,
      isNoGo: false
    };
  }

  // GUT: Ab 30% (Entspricht Ø Rating 1.5 von 5)
  // Wer im Schnitt 1.5 hat, liegt stabil im Plus. Das ist ein guter Freund.
  if (percentage >= 30) {
    return {
      score: percentage,
      percentage: uiPercentage,
      label: 'Gut',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      barColor: 'bg-emerald-500',
      icon: Smile,
      isNoGo: false
    };
  }

  // NEUTRAL: Ab 5% (Entspricht Ø Rating 0.25 von 5)
  // Hauptsache nicht negativ.
  if (percentage >= 5) {
    return {
      score: percentage,
      percentage: uiPercentage,
      label: 'Neutral',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      barColor: 'bg-indigo-500',
      icon: Meh,
      isNoGo: false
    };
  }

  // UNSCHEINBAR: Bereich um die 0 (-5% bis 5%)
  if (percentage > -5) {
    return {
      score: percentage,
      percentage: uiPercentage,
      label: 'Unscheinbar',
      color: 'text-slate-400',
      bg: 'bg-slate-100',
      barColor: 'bg-slate-300',
      icon: Meh,
      isNoGo: false
    };
  }

  // BELASTEND (< -5%)
  return {
    score: percentage,
    percentage: uiPercentage,
    label: 'Belastend',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    barColor: 'bg-orange-500',
    icon: Frown,
    isNoGo: false
  };
}

// Die Hauptfunktion für einzelne Freunde
export function evaluateFriend(friend: Friend, traits: Trait[]): ScoreResult {
  let currentScore = 0;
  let maxPotential = 0;
  let hasNoGo = false;

  traits.forEach((trait) => {
    const val = friend.ratings[trait.id];

    if (trait.isNoGo && val === true) {
      hasNoGo = true;
    }

    if (!trait.isNoGo && trait.weight > 0) {
      maxPotential += (trait.weight * 5);
    }

    if (!trait.isNoGo && typeof val === 'number') {
      currentScore += (trait.weight * val);
    }
  });

  if (hasNoGo) {
    return getCategory(0, true);
  }

  // Berechnung
  const rawPercentage = maxPotential > 0 ? (currentScore / maxPotential) * 100 : 0;
  
  // Nutzung der extrahierten Logik
  return getCategory(rawPercentage, false);
}