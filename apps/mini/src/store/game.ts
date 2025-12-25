import { create } from 'zustand';
import { get } from '@/utils/request';
import type { GameCategory, GameServer, BoostType } from '@/types';

interface GameWithDetails extends GameCategory {
  servers: GameServer[];
  boostTypes: BoostType[];
}

interface GameState {
  games: GameWithDetails[];
  currentGame: GameWithDetails | null;
  isLoading: boolean;
  
  // Actions
  fetchGames: () => Promise<void>;
  fetchGameDetail: (id: string) => Promise<void>;
  setCurrentGame: (game: GameWithDetails | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  games: [],
  currentGame: null,
  isLoading: false,

  fetchGames: async () => {
    try {
      set({ isLoading: true });
      const games = await get<GameWithDetails[]>('/api/games?active=true');
      set({ games, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('获取游戏列表失败:', error);
    }
  },

  fetchGameDetail: async (id: string) => {
    try {
      set({ isLoading: true });
      const game = await get<GameWithDetails>(`/api/games/${id}`);
      set({ currentGame: game, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('获取游戏详情失败:', error);
    }
  },

  setCurrentGame: (game) => {
    set({ currentGame: game });
  },
}));

