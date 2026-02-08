import { IMPACT_WEIGHTS } from './constants';
export type ImpactLevel = typeof IMPACT_WEIGHTS[keyof typeof IMPACT_WEIGHTS];

export interface Trait {
  id: string;
  name: string;
  weight: ImpactLevel;
  isNoGo: boolean;
}

export interface Group {
  id: string;
  name: string;
}

export interface Friend {
  id: string;
  name: string;
  groupId?: string; // NEU: Optionaler Link zu einer Gruppe
  ratings: Record<string, number | boolean>;
}