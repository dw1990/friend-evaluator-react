import { useState, useRef } from 'react';
import { useStore } from '../store';
import { Trash2, UserPlus, FolderPlus, Plus, Users, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
// IMPORT DES SERVICE
import { evaluateFriend } from '../util/scoring'; 

export function FriendMatrix() {
  const { friends, traits, setRating, removeFriend, groups, assignGroup, addFriend, addGroup, removeGroup } = useStore();

  const [newFriendName, setNewFriendName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const friendInputRef = useRef<HTMLInputElement>(null);

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    addFriend(newFriendName);
    setNewFriendName('');
    setTimeout(() => friendInputRef.current?.focus(), 0);
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    addGroup(newGroupName);
    setNewGroupName('');
  };

  const toggleFilter = (groupId: string | null) => {
    if (activeGroupId === groupId) setActiveGroupId(null);
    else setActiveGroupId(groupId);
  };

  const visibleFriends = activeGroupId 
    ? friends.filter(f => f.groupId === activeGroupId)
    : friends;

  return (
    <div className="h-full flex flex-col gap-4">
      
      {/* --- ACTION TOOLBAR (Unverändert) --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={friendInputRef}
              type="text"
              placeholder="Name einer neuen Person..."
              value={newFriendName}
              onChange={(e) => setNewFriendName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm"
            />
          </div>
          <button
            onClick={handleAddFriend}
            className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-900 transition active:scale-95 shadow-sm flex items-center justify-center font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Hinzufügen
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex gap-1">
            <div className="relative w-40">
              <FolderPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Neue Gruppe..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                className="w-full pl-8 pr-2 py-1.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-slate-50 focus:bg-white transition"
              />
            </div>
            <button
              onClick={handleAddGroup}
              className="bg-white text-slate-500 border border-slate-200 px-2 rounded-md hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setActiveGroupId(null)}
              className={clsx(
                "px-2.5 py-1 rounded-full text-xs font-bold border transition",
                activeGroupId === null ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              )}
            >
              Alle
            </button>
            <AnimatePresence mode="popLayout">
              {groups.map(g => (
                <motion.div 
                  key={g.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="relative group"
                >
                  <button
                    onClick={() => toggleFilter(g.id)}
                    className={clsx(
                      "pl-2.5 pr-7 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1",
                      activeGroupId === g.id ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100"
                    )}
                  >
                    {g.name}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeGroup(g.id); }}
                    className={clsx(
                      "absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/20 transition",
                      activeGroupId === g.id ? "text-white/70 hover:text-white" : "text-indigo-400 hover:text-red-600"
                    )}
                  >
                    {activeGroupId === g.id ? <X className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 font-bold text-slate-700 min-w-[150px] border-b border-slate-200 sticky left-0 bg-slate-50 z-20">Name</th>
                <th className="p-4 font-bold text-slate-700 w-[130px] text-center border-b border-slate-200">Status</th>
                {traits.map((trait) => (
                  <th key={trait.id} className="p-2 min-w-[120px] text-center border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 truncate block text-center" title={trait.name}>{trait.name}</span>
                  </th>
                ))}
                <th className="p-4 w-[50px] border-b border-slate-200"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 relative">
              <AnimatePresence>
                {visibleFriends.map((friend) => {
                  
                  // --- HIER IST JETZT DER CALL ZUM "SERVICE" ---
                  const result = evaluateFriend(friend, traits);
                  const StatusIcon = result.icon;
                  // ---------------------------------------------

                  return (
                    <motion.tr 
                      key={friend.id} 
                      layout 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      className="hover:bg-slate-50 transition group bg-white"
                    >
                      <td className="p-4 font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={result.label}
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.8, position: 'absolute' }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            // Nutzung der Farben aus dem Service:
                            className={clsx("inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/5 mx-auto", result.bg, result.color)}
                          >
                            <StatusIcon className="w-5 h-5" />
                            <span className="text-xs font-bold">{result.label}</span>
                          </motion.div>
                        </AnimatePresence>
                      </td>

                      {traits.map((trait) => (
                        <td key={trait.id} className="p-2 text-center">
                          {trait.isNoGo ? (
                            <input
                              type="checkbox"
                              checked={(friend.ratings[trait.id] as boolean) || false}
                              onChange={(e) => setRating(friend.id, trait.id, e.target.checked)}
                              className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                            />
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={(friend.ratings[trait.id] as number) ?? 0}
                              onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                if (val < 0) val = 0;
                                if (val > 5) val = 5;
                                setRating(friend.id, trait.id, val);
                              }}
                              className={clsx(
                                "w-12 text-center py-1 rounded border focus:ring-2 outline-none transition font-medium",
                                (friend.ratings[trait.id] as number) > 0 
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-900 focus:ring-indigo-500" 
                                  : "border-slate-200 text-slate-400 focus:ring-slate-400"
                              )}
                            />
                          )}
                        </td>
                      ))}

                      <td className="p-4 text-right">
                        <button 
                          onClick={() => removeFriend(friend.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
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