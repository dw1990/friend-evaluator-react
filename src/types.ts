export type ImpactLevel = -7 | -3 | 3 | 7;

export interface Trait {
  id: string;
  name: string;
  weight: ImpactLevel;
  isNoGo: boolean;
}

// NEU: Gruppe
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