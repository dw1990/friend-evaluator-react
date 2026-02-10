import { useMemo } from 'react';
import { Search, AlertCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { IMPACT_WEIGHTS } from '../../constants';
import type { Friend, Trait } from '../../types';

interface Props {
  friends: Friend[];
  traits: Trait[];
}

export function MissingValuesCard({ friends, traits }: Props) {
  const missingValues = useMemo(() => {
    // 1. Nur relevante Werte betrachten (Sehr Wichtig & Essentiell)
    // Alles was "Bonus" oder "Egal" ist, darf fehlen.
    const importantTraits = traits.filter(t => t.weight >= IMPACT_WEIGHTS.VERY_IMPORTANT && !t.isNoGo);
    
    if (importantTraits.length === 0 || friends.length === 0) return [];

    const stats = importantTraits.map(trait => {
      // 2. VERSORGUNGS-CHECK (Supply Chain)
      // Wir suchen "Lieferanten", die diesen Wert stabil abdecken.
      // Ein Score von >= 3 bedeutet "Gut" bis "Super". 
      // Wer hier eine 3 hat, auf den ist Verlass.
      const providers = friends.filter(f => {
        const val = f.ratings[trait.id] as number;
        return typeof val === 'number' && val >= 3; 
      });

      return { 
        trait, 
        count: providers.length,
        // Wir merken uns den Besten (falls es nur einen gibt), um ihn namentlich zu nennen
        topProvider: providers.length > 0 ? providers[0].name : null
      };
    });

    // 3. FILTER: ECHTE MANGELWARE
    // Ein Wert fehlt, wenn ihn NIEMAND (0) oder nur EINER (1) abdeckt.
    // Das ist ein Risiko (Single Point of Failure).
    // Ab 2 Personen gilt das System als "stabil".
    return stats
      .filter(s => s.count < 2) 
      .sort((a, b) => a.count - b.count) // Die mit 0 (akut) nach oben
      .slice(0, 3);
  }, [friends, traits]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <Search className="w-4 h-4" /> Versorgungs-Lücken
      </h3>

      {missingValues.length > 0 ? (
        <div className="space-y-4 flex-1">
          {missingValues.map(({ trait, count, topProvider }) => (
            <div key={trait.id} className="border-b border-slate-50 last:border-0 pb-3 last:pb-0">
              
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-800 text-sm">{trait.name}</span>
                
                {/* STATUS BADGE */}
                {count === 0 ? (
                  <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">
                    Leer
                  </span>
                ) : (
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">
                    Knapp
                  </span>
                )}
              </div>

              {/* DETAILS */}
              <div className="text-xs text-slate-500 mt-1 flex items-start gap-2">
                {count === 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>Niemand in deinem Umfeld deckt diesen Wert ab.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <span>
                      Hängt allein an <strong>{topProvider}</strong>. <br/>
                      <span className="text-[10px] opacity-75">(Single Point of Failure)</span>
                    </span>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-4">
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-3">
             <span className="text-xl">👌</span>
          </div>
          <p className="text-sm italic">
            Dein Netzwerk ist stabil. Für alle wichtigen Werte gibt es mindestens 2 Ansprechpartner.
          </p>
        </div>
      )}
    </motion.div>
  );
}