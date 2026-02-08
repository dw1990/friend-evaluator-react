import { useState } from 'react';
import { Plus, ShieldAlert } from 'lucide-react';
import type { ImpactLevel } from '../../types';
import { WeightSelector } from './WeightSelector';
import { IMPACT_WEIGHTS } from '../../constants';

interface Props {
  onAdd: (name: string, weight: ImpactLevel, isNoGo: boolean) => void;
}

export function TraitForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<ImpactLevel>(IMPACT_WEIGHTS.BENEFIT_LIGHT);
  const [isNoGo, setIsNoGo] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name, weight, isNoGo);
    // Reset
    setName('');
    setIsNoGo(false);
    // Weight lassen wir stehen, falls man mehrere ähnliche anlegt
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-indigo-600" />
        Kriterien definieren
      </h2>

      <div className="space-y-4 p-1">
        <input
          type="text"
          placeholder="Neue Eigenschaft..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
        />

        <WeightSelector value={weight} onChange={setWeight} />

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
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium transition active:scale-95 shadow-sm"
          type="button"
        >
          <Plus className="w-4 h-4" /> Speichern
        </button>
      </div>
    </div>
  );
}