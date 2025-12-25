import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { post, get } from '@/utils/request';
import type { User, BoosterProfile } from '@/types';

interface UserWithProfile extends Omit<User, 'createdAt' | 'updatedAt'> {
  boosterProfile?: BoosterProfile | null;
}

interface LoginResponse {
  token: string;
  user: UserWithProfile;
  isNewUser: boolean;
}

interface UserState {
  user: UserWithProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Actions
  login: () => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserWithProfile>) => Promise<void>;
  setUser: (user: UserWithProfile) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,

  login: async () => {
    try {
      set({ isLoading: true });
      
      // 获取微信登录 code
      const { code } = await Taro.login();
      
      // 调用后端登录接口
      const result = await post<LoginResponse>('/api/auth/login', { code });
      
      // 保存 token
      Taro.setStorageSync('token', result.token);
      
      // 更新状态
      set({
        user: result.user,
        isLoggedIn: true,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      set({ isLoading: false });
      console.error('登录失败:', error);
      return false;
    }
  },

  logout: () => {
    Taro.removeStorageSync('token');
    set({
      user: null,
      isLoggedIn: false,
    });
  },

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const user = await get<UserWithProfile>('/api/user/profile');
      set({
        user,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('获取用户信息失败:', error);
    }
  },

  updateProfile: async (data) => {
    try {
      const user = await post<UserWithProfile>('/api/user/profile', data);
      set({ user });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  },

  setUser: (user) => {
    set({ user, isLoggedIn: true });
  },
}));

