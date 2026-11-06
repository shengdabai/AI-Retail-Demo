/**
 * 用户认证状态管理
 * 管理用户登录、注册、登出等认证相关状态
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  // 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * 创建用户认证状态管理store
 * 使用persist中间件持久化用户登录状态
 */
export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    // 初始状态
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    /**
     * 用户登录
     * @param email 用户邮箱
     * @param password 用户密码
     */
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // TODO: 调用登录API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) {
          throw new Error('登录失败');
        }
        
        const data = await response.json();
        
        // Mock user data for development
        const mockUser: User = {
          id: '1',
          email,
          name: '测试用户',
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Store token in localStorage
        localStorage.setItem('token', data.token || 'mock-token');
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '登录失败',
          isLoading: false,
        });
        throw error;
      }
    },

    /**
     * 用户注册
     * @param userData 用户注册数据
     */
    register: async (userData) => {
      set({ isLoading: true, error: null });
      
      try {
        // TODO: 调用注册API
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          throw new Error('注册失败');
        }
        
        // Mock user data for development
        const mockUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Store token in localStorage
        localStorage.setItem('token', 'mock-token');
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '注册失败',
          isLoading: false,
        });
        throw error;
      }
    },

    /**
     * 用户登出
     */
    logout: () => {
      localStorage.removeItem('token');
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    },

    /**
     * 更新用户资料
     * @param userData 要更新的用户数据
     */
    updateProfile: async (userData) => {
      const { user } = get();
      if (!user) return;
      
      set({ isLoading: true, error: null });
      
      try {
        // TODO: 调用更新用户资料API
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          throw new Error('更新资料失败');
        }
        
        // Update user data
        const updatedUser = {
          ...user,
          ...userData,
          updatedAt: new Date().toISOString(),
        };
        
        set({
          user: updatedUser,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '更新资料失败',
          isLoading: false,
        });
      }
    },

    /**
     * 清除错误信息
     */
    clearError: () => {
      set({ error: null });
    },

    /**
     * 设置加载状态
     * @param loading 加载状态
     */
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },
  }),
  {
    name: 'auth-storage', // localStorage key
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
  }
));