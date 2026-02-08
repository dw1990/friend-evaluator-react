import clsx from 'clsx';
import type { ImpactLevel } from '../../types';
import { IMPACT_CONFIG } from '../../constants';

interface Props {
  value: ImpactLevel;
  onChange: (val: ImpactLevel) => void;
}

export function WeightSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {IMPACT_CONFIG.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "text-xs py-2 px-1 rounded-md font-medium text-white transition-all shadow-sm truncate",
            opt.color, // Kommt jetzt aus der Config
            value === opt.value 
              ? "ring-2 ring-offset-1 ring-slate-400 scale-[1.02] shadow-md z-10" 
              : "opacity-60 hover:opacity-100"
          )}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}