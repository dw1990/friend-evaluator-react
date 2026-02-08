import { useState } from 'react';
import { useStore } from '../store';
import { Trash2, Users, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { evaluateFriend } from '../util/scoring';
import { ActionToolbar } from './matrix/ActionToolbar';

export function FriendMatrix() {
  // Wir holen uns nur die Daten/Actions, die die Tabelle selbst braucht
  const { friends, traits, setRating, removeFriend, groups, assignGroup } = useStore();

  // Lokaler UI-State für den Filter
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const toggleFilter = (groupId: string | null) => {
    if (activeGroupId === groupId) setActiveGroupId(null);
    else setActiveGroupId(groupId);
  };

  const visibleFriends = activeGroupId 
    ? friends.filter(f => f.groupId === activeGroupId)
    : friends;

  return (
    <div className="h-full flex flex-col gap-4">
      
      {/* --- ACTION TOOLBAR (Smart Component) --- */}
      {/* Kümmert sich um Hinzufügen von Freunden/Gruppen und Filter-Buttons */}
      <ActionToolbar 
        activeGroupId={activeGroupId}
        onToggleFilter={toggleFilter}
      />

      {/* --- TABELLE --- */}
      {visibleFriends.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-lg border-dashed">
          <div className="p-4 bg-slate-50 rounded-full mb-4">
            {activeGroupId ? <Filter className="w-12 h-12 opacity-50" /> : <Users className="w-12 h-12 opacity-50" />}
          </div>
          <p className="font-medium">
            {activeGroupId ? "Keine Personen in dieser Gruppe." : "Liste ist leer."}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-slate-200 rounded-lg shadow-sm bg-white relative">
          <table className="w-full text-left border-collapse">
            
            {/* STICKY HEADER */}
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 font-bold text-slate-700 min-w-[150px] border-b border-slate-200 sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Name
                </th>
                <th className="p-4 font-bold text-slate-700 w-[130px] text-center border-b border-slate-200">
                  Status
                </th>
                {traits.map((trait) => (
                  <th key={trait.id} className="p-2 min-w-[120px] text-center border-b border-slate-200">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-800 truncate block max-w-[100px]" title={trait.name}>
                        {trait.name}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-4 w-[50px] border-b border-slate-200"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 relative">
              <AnimatePresence>
                {visibleFriends.map((friend) => {
                  
                  // Zentrale Berechnung des Status (inkl. Toxisch-Override)
                  const result = evaluateFriend(friend, traits);
                  const StatusIcon = result.icon;

                  return (
                    <motion.tr 
                      key={friend.id} 
                      layout 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      className="hover:bg-slate-50 transition group bg-white"
                    >
                      {/* NAME SPALTE */}
                      <td className="p-4 font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                        <div className="flex flex-col">
                          <span>{friend.name}</span>
                          <select 
                            value={friend.groupId || ""}
                            onChange={(e) => assignGroup(friend.id, e.target.value || undefined)}
                            className="text-[10px] text-slate-400 mt-1 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-indigo-500 max-w-[100px]"
                          >
                            <option value="">Keine Gruppe</option>
                            {groups.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* STATUS SPALTE */}
                      <td className="p-4 text-center h-[60px] relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={result.label} // Key change triggert Animation
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.8, position: 'absolute' }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className={clsx(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/5 mx-auto shadow-sm",
                              result.bg, 
                              result.color
                            )}
                          >
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-xs font-bold">{result.label}</span>
                          </motion.div>
                        </AnimatePresence>
                      </td>

                      {/* TRAITS SPALTEN */}
                      {traits.map((trait) => (
                        <td key={trait.id} className="p-2 text-center">
                          {trait.isNoGo ? (
                            <input
                              type="checkbox"
                              checked={(friend.ratings[trait.id] as boolean) || false}
                              onChange={(e) => setRating(friend.id, trait.id, e.target.checked)}
                              className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600 transition hover:scale-110"
                            />
                          ) : (
                            <input
                              type="number"
                              min="-5" // ERLAUBT JETZT NEGATIVE WERTE
                              max="5"
                              value={(friend.ratings[trait.id] as number) ?? 0}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                // Hard Clamp für Sicherheit
                                if (val < -5) val = -5;
                                if (val > 5) val = 5;
                                setRating(friend.id, trait.id, val);
                              }}
                              className={clsx(
                                "w-12 text-center py-1 rounded border outline-none transition-all font-bold shadow-sm",
                                // Dynamisches Coloring für besseres Feedback
                                (friend.ratings[trait.id] as number) > 0 
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 focus:ring-2 focus:ring-indigo-500" // Positiv
                                  : (friend.ratings[trait.id] as number) < 0
                                    ? "border-red-300 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-500" // Negativ (Warnung)
                                    : "border-slate-200 text-slate-300 focus:ring-2 focus:ring-slate-300 focus:text-slate-600" // Neutral
                              )}
                            />
                          )}
                        </td>
                      ))}

                      {/* DELETE ACTION */}
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => removeFriend(friend.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition active:scale-95"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}