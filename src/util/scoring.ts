import { 
  AlertOctagon, 
  HeartHandshake, 
  Smile, 
  Meh, 
  Frown 
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

// NEU: Reine UI-Mapping Funktion (Public, damit wir sie auch in der Analyse nutzen können)
export function getCategory(percentage: number, isNoGo: boolean): ScoreResult {
  
  // 1. NO-GO Fall
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

  // Clamp percentage für die UI Bars (0-100)
  const uiPercentage = Math.max(0, Math.min(100, percentage));

  // 2. Super (> 80%)
  if (percentage >= 80) {
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

  // 3. Gut (> 60%)
  if (percentage >= 60) {
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

  // 4. Neutral (> 25%)
  if (percentage >= 25) {
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

  // 5. Unscheinbar / Stein (> -15%)
  if (percentage > -15) {
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

  // 6. Belastend (< -15%)
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