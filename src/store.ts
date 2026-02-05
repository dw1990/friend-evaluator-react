import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Friend, Trait, ImpactLevel, Group } from './types';

interface AppState {
  friends: Friend[];
  traits: Trait[];
  groups: Group[];

  // Actions: Friends
  addFriend: (name: string, groupId?: string) => void;
  removeFriend: (id: string) => void;
  assignGroup: (friendId: string, groupId: string | undefined) => void;
  setRating: (friendId: string, traitId: string, value: number | boolean) => void;

  // Actions: Traits
  addTrait: (name: string, weight: ImpactLevel, isNoGo: boolean) => void;
  removeTrait: (id: string) => void;

  // Actions: Groups
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;

  // Actions: System
  loadData: (data: { friends: Friend[]; traits: Trait[]; groups?: Group[] }) => void;
  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      friends: [],
      traits: [],
      groups: [],

      // --- FRIENDS ---
      
      addFriend: (name, groupId) =>
        set((state) => ({
          friends: [
            ...state.friends,
            { id: uuidv4(), name, groupId, ratings: {} },
          ],
        })),

      removeFriend: (id) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== id),
        })),

      assignGroup: (friendId, groupId) =>
        set((state) => ({
          friends: state.friends.map(f => 
            f.id === friendId ? { ...f, groupId } : f
          )
        })),

      setRating: (friendId, traitId, value) =>
        set((state) => ({
          friends: state.friends.map((friend) =>
            friend.id === friendId
              ? {
                  ...friend,
                  ratings: { ...friend.ratings, [traitId]: value },
                }
              : friend
          ),
        })),

      // --- TRAITS ---

      addTrait: (name, weight, isNoGo) =>
        set((state) => ({
          traits: [
            ...state.traits,
            { id: uuidv4(), name, weight, isNoGo },
          ],
        })),

      removeTrait: (id) =>
        set((state) => {
          // Cleanup: Wenn ein Trait gelöscht wird, muss er auch aus den Ratings der Freunde raus
          // Sonst sammeln wir Datenmüll an
          const newFriends = state.friends.map(friend => {
            const newRatings = { ...friend.ratings };
            delete newRatings[id];
            return { ...friend, ratings: newRatings };
          });

          return {
            traits: state.traits.filter((t) => t.id !== id),
            friends: newFriends,
          };
        }),

      // --- GROUPS ---

      addGroup: (name) => 
        set((state) => ({
          groups: [...state.groups, { id: uuidv4(), name }]
        })),

      removeGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter(g => g.id !== id),
          // Cleanup: Wenn Gruppe gelöscht wird, verlieren die Freunde ihre Zugehörigkeit
          friends: state.friends.map(f => 
            f.groupId === id ? { ...f, groupId: undefined } : f
          )
        })),

      // --- SYSTEM ---

      loadData: (data) => set({ 
        friends: data.friends, 
        traits: data.traits,
        // WICHTIG: Fallback für alte Backups, die noch kein "groups" Array hatten
        groups: data.groups || [] 
      }),

      resetAll: () => set({ friends: [], traits: [], groups: [] }),
    }),
    {
      name: 'friend-evaluator-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);