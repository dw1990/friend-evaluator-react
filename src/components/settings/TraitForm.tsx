import { useState } from 'react';
import { Plus, ShieldAlert, Info } from 'lucide-react';
import type { ImpactLevel } from '../../types';
import { WeightSelector } from './WeightSelector';
import { IMPACT_WEIGHTS } from '../../constants';

interface Props {
  onAdd: (name: string, weight: ImpactLevel, isNoGo: boolean) => void;
}

export function TraitForm({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<ImpactLevel>(IMPACT_WEIGHTS.IMPORTANT);
  const [isNoGo, setIsNoGo] = useState(false);

  // HELPER: Macht den ersten Buchstaben groß
  const formatInput = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(formatInput(name), weight, isNoGo);
    setName('');
    setIsNoGo(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-indigo-600" />
        Werte definieren
      </h2>

      {/* NEU: Onboarding-Hilfe für neue Nutzer */}
      <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg mb-6 text-xs text-indigo-800 leading-relaxed flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Hier legst du deine Maßstäbe fest. Was erwartest du von deinem Umfeld? 
          Jeder Wert, den du hier speicherst, wird zu einer <strong>Spalte in deiner Freundesübersicht</strong>.
        </p>
      </div>

      <div className="space-y-4 p-1">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Bezeichnung</label>
          <input
            type="text"
            placeholder="z.B. Ehrlichkeit, Humor..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Formuliere positiv (z.B. "Friedfertigkeit"). Negative Bewertung erfolgt später in der Matrix durch Minuspunkte (-5).
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Wichtigkeit</label>
          <WeightSelector value={weight} onChange={setWeight} />
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
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
          <p className="text-[10px] text-slate-400 mt-1 pl-6">
            Für harte Fakten (z.B. "Raucher"). Bei Verhalten lieber "Essentiell" wählen und dann negativ bewerten.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 font-medium transition active:scale-95 shadow-sm"
          type="button"
        >
          <Plus className="w-4 h-4" /> Speichern
        </button>
      </div>
    </div>
  );
}