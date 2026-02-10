import { useState } from 'react';
import { useStore } from '../store';
import { Trash2, ArrowRight, ArrowUp, Gem } from 'lucide-react'; // Icons importieren
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { evaluateFriend } from '../util/scoring';
import { ActionToolbar } from './matrix/ActionToolbar';

export function FriendMatrix() {
  const { friends, traits, setRating, removeFriend, groups, assignGroup } = useStore();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const toggleFilter = (groupId: string | null) => {
    if (activeGroupId === groupId) setActiveGroupId(null);
    else setActiveGroupId(groupId);
  };

  const visibleFriends = activeGroupId 
    ? friends.filter(f => f.groupId === activeGroupId)
    : friends;

  // --- ONBOARDING LOGIK ---
  
  // Fall 1: Nutzer hat noch gar keine Werte definiert.
  // Die Matrix macht noch keinen Sinn. Wir müssen ihn nach rechts schicken.
  if (traits.length === 0) {
    return (
      <div className="h-full flex flex-col gap-4">
        {/* Toolbar ist inaktiv/ausgegraut */}
        <div className="opacity-50 pointer-events-none grayscale">
           <ActionToolbar activeGroupId={null} onToggleFilter={() => {}} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
            <Gem className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">
            Willkommen bei Prisma
          </h2>
          <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
            Dein Prisma ist noch leer. Bevor du Menschen analysieren kannst, musst du festlegen, 
            <strong> durch welche Facetten</strong> (Werte) du sie betrachtest.
          </p>
          
          <div className="flex items-center gap-4 text-indigo-600 font-bold bg-indigo-50 px-6 py-3 rounded-full animate-pulse">
            <span>Beginne rechts im Menü</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  // Fall 2: Werte sind da, aber noch keine Freunde.
  // Jetzt zeigen wir nach OBEN.
  if (friends.length === 0) {
    return (
      <div className="h-full flex flex-col gap-4">
        <ActionToolbar activeGroupId={activeGroupId} onToggleFilter={toggleFilter} />
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-hidden">
          
          {/* Ein riesiger Pfeil im Hintergrund, der nach oben zeigt */}
          <ArrowUp className="absolute top-10 text-slate-100 w-64 h-64 -z-0 opacity-50" />

          <div className="relative z-10 bg-white/80 backdrop-blur p-6 rounded-2xl border border-slate-100 shadow-sm max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Das Prisma ist bereit!
            </h3>
            <p className="text-slate-500 mb-4 text-sm">
              Du hast deine Werte definiert. Jetzt kannst du Personen in dein System aufnehmen.
            </p>
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
              <ArrowUp className="w-4 h-4" />
              <span>Nutze die Eingabezeile oben</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- NORMALE MATRIX (Wenn Daten da sind) ---
  return (
    <div className="h-full flex flex-col gap-4">
      <ActionToolbar activeGroupId={activeGroupId} onToggleFilter={toggleFilter} />

      <div className="flex-1 overflow-auto border border-slate-200 rounded-lg shadow-sm bg-white relative">
        <table className="w-full text-left border-collapse">
          {/* ... HIER DEIN BESTEHENDER TABLE CODE (Header & Body) ... */}
          {/* (Kopiere den Inhalt aus deiner vorherigen Version hier rein) */}
          {/* Header... */}
           <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 font-bold text-slate-700 min-w-[150px] border-b border-slate-200 sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Name
                </th>
                <th className="p-4 font-bold text-slate-700 w-[130px] text-center border-b border-slate-200">
                  Status
                </th>
                {traits.map((trait) => (
                  <th key={trait.id} className="p-2 min-w-[120px] text-center border-b border-slate-200 align-middle">
                    <span 
                      className="text-xs font-bold text-slate-800 truncate block text-center" 
                      title={trait.name}
                    >
                      {trait.name}
                    </span>
                    {/* Optional: Kleines Badge für die Wichtigkeit */}
                    <div className="flex justify-center mt-1">
                       <div className={clsx("h-1 w-8 rounded-full", 
                         trait.weight === 7 ? "bg-fuchsia-400" : 
                         trait.weight === 5 ? "bg-violet-400" : 
                         trait.weight === 3 ? "bg-indigo-400" : "bg-sky-400"
                       )} />
                    </div>
                  </th>
                ))}
                <th className="p-4 w-[50px] border-b border-slate-200"></th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 relative">
              <AnimatePresence>
                {visibleFriends.map((friend) => {
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
                      <td className="p-4 text-center h-[60px] relative">
                         {/* Status Badge Code ... */}
                         <div className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/5 mx-auto shadow-sm", result.bg, result.color)}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-xs font-bold">{result.label}</span>
                         </div>
                      </td>
                      {traits.map((trait) => (
                        <td key={trait.id} className="p-2 text-center">
                          {trait.isNoGo ? (
                             <input type="checkbox" checked={(friend.ratings[trait.id] as boolean) || false} onChange={(e) => setRating(friend.id, trait.id, e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600" />
                          ) : (
                            <input
                              type="number"
                              min="-5"
                              max="5"
                              value={(friend.ratings[trait.id] as number) ?? 0}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                if (val < -5) val = -5; if (val > 5) val = 5;
                                setRating(friend.id, trait.id, val);
                              }}
                              className={clsx(
                                "w-12 text-center py-1 rounded border outline-none transition-all font-bold shadow-sm",
                                (friend.ratings[trait.id] as number) > 0 ? "border-indigo-300 bg-indigo-50 text-indigo-700" : 
                                (friend.ratings[trait.id] as number) < 0 ? "border-red-300 bg-red-50 text-red-700" : 
                                "border-slate-200 text-slate-300 focus:text-slate-600"
                              )}
                            />
                          )}
                        </td>
                      ))}
                      <td className="p-4 text-right">
                        <button onClick={() => removeFriend(friend.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
        </table>
      </div>
    </div>
  );
}