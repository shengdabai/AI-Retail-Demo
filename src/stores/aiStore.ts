/**
 * AI推荐状态管理
 * 管理AI导购、智能推荐、聊天助手等AI相关状态
 */

import { create } from 'zustand';
import type { Recommendation, ChatMessage, Product, UserPreference } from '../types';

interface AIState {
  // 状态
  recommendations: Recommendation[];
  chatMessages: ChatMessage[];
  userPreferences: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  isChatOpen: boolean;
  
  // 操作方法
  fetchRecommendations: (userId: string, type?: string, limit?: number) => Promise<void>;
  fetchUserPreferences: (userId: string) => Promise<void>;
  updateUserPreferences: (userId: string, preferences: Partial<UserPreference>) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  clearChatMessages: () => void;
  toggleChat: () => void;
  getSearchSuggestions: (query: string, userId?: string) => Promise<string[]>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

// Mock推荐数据
const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    userId: 'current-user',
    productId: '1',
    type: 'personalized',
    score: 0.95,
    reason: '基于您的浏览历史和购买偏好推荐',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: 'current-user',
    productId: '2',
    type: 'similar',
    score: 0.88,
    reason: '与您关注的商品相似',
    createdAt: '2024-01-15T10:05:00Z',
  },
  {
    id: '3',
    userId: 'current-user',
    productId: '3',
    type: 'trending',
    score: 0.82,
    reason: '当前热门商品',
    createdAt: '2024-01-15T10:10:00Z',
  },
];

// Mock用户偏好数据
const mockUserPreferences: UserPreference = {
  id: '1',
  userId: 'current-user',
  categories: ['1', '2'], // 电子产品、服装鞋帽
  brands: ['Apple', 'Nike', 'Adidas'],
  priceRange: {
    min: 100,
    max: 10000,
  },
  behaviorData: {
    viewedCategories: ['1', '2', '3'],
    searchKeywords: ['手机', '运动鞋', '笔记本'],
    purchaseHistory: ['1'],
    clickedProducts: ['1', '2', '3'],
  },
  updatedAt: '2024-01-15T00:00:00Z',
};

// Mock商品数据（用于聊天推荐）
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '苹果最新旗舰手机',
    price: 7999,
    sku: 'IPHONE15PRO',
    categoryId: '1',
    images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20smartphone&image_size=square'],
    specifications: {},
    isActive: true,
    stock: 50,
    rating: 4.8,
    reviewCount: 1234,
    tags: ['热销', '新品'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    description: '轻薄笔记本电脑',
    price: 8999,
    sku: 'MACBOOKAIRM3',
    categoryId: '1',
    images: ['https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Air%20laptop&image_size=square'],
    specifications: {},
    isActive: true,
    stock: 30,
    rating: 4.7,
    reviewCount: 856,
    tags: ['轻薄', '长续航'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

/**
 * 创建AI推荐状态管理store
 */
export const useAIStore = create<AIState>((set, get) => ({
  // 初始状态
  recommendations: [],
  chatMessages: [
    {
      id: '1',
      type: 'assistant',
      content: '您好！我是您的AI购物助手，有什么可以帮助您的吗？',
      timestamp: new Date().toISOString(),
    },
  ],
  userPreferences: null,
  isLoading: false,
  error: null,
  isChatOpen: false,

  /**
   * 获取个性化推荐
   * @param userId 用户ID
   * @param type 推荐类型
   * @param limit 推荐数量限制
   */
  fetchRecommendations: async (userId: string, type = 'personalized', limit = 10) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用推荐API
      // const response = await fetch(`/api/recommendations/personal?userId=${userId}&type=${type}&limit=${limit}`);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredRecommendations = mockRecommendations;
      
      if (type !== 'all') {
        filteredRecommendations = mockRecommendations.filter(rec => rec.type === type);
      }
      
      // Add product details to recommendations
      const recommendationsWithProducts = filteredRecommendations.map(rec => ({
        ...rec,
        product: mockProducts.find(p => p.id === rec.productId),
      }));
      
      set({
        recommendations: recommendationsWithProducts.slice(0, limit),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取推荐失败',
        isLoading: false,
      });
    }
  },

  /**
   * 获取用户偏好设置
   * @param userId 用户ID
   */
  fetchUserPreferences: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用用户偏好API
      // const response = await fetch(`/api/users/${userId}/preferences`);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      set({
        userPreferences: mockUserPreferences,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取用户偏好失败',
        isLoading: false,
      });
    }
  },

  /**
   * 更新用户偏好设置
   * @param userId 用户ID
   * @param preferences 偏好设置
   */
  updateUserPreferences: async (userId: string, preferences: Partial<UserPreference>) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用更新用户偏好API
      // const response = await fetch(`/api/users/${userId}/preferences`, {
      //   method: 'PUT',
      //   body: JSON.stringify(preferences)
      // });
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { userPreferences } = get();
      const updatedPreferences = {
        ...userPreferences,
        ...preferences,
        updatedAt: new Date().toISOString(),
      } as UserPreference;
      
      set({
        userPreferences: updatedPreferences,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新用户偏好失败',
        isLoading: false,
      });
    }
  },

  /**
   * 发送聊天消息
   * @param message 用户消息内容
   */
  sendChatMessage: async (message: string) => {
    const { chatMessages } = get();
    
    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    set({ chatMessages: [...chatMessages, userMessage] });
    
    // 模拟AI回复
    set({ isLoading: true });
    
    try {
      // TODO: 调用AI聊天API
      // const response = await fetch('/api/ai/chat', {
      //   method: 'POST',
      //   body: JSON.stringify({ message, userId: 'current-user' })
      // });
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成AI回复
      let aiResponse = '';
      let productRecommendations: Product[] = [];
      
      if (message.toLowerCase().includes('手机') || message.toLowerCase().includes('iphone')) {
        aiResponse = '我为您推荐几款热门手机，iPhone 15 Pro是目前最受欢迎的选择，性能强劲，拍照效果出色。';
        productRecommendations = [mockProducts[0]];
      } else if (message.toLowerCase().includes('电脑') || message.toLowerCase().includes('笔记本')) {
        aiResponse = '根据您的需求，我推荐MacBook Air M3，轻薄便携，续航能力强，非常适合日常办公和学习。';
        productRecommendations = [mockProducts[1]];
      } else if (message.toLowerCase().includes('推荐')) {
        aiResponse = '基于您的浏览历史，我为您推荐以下商品，它们都是当前热门且评价很好的产品。';
        productRecommendations = mockProducts;
      } else {
        aiResponse = '感谢您的咨询！我会根据您的需求为您提供最合适的商品推荐。您可以告诉我您想要什么类型的商品，或者有什么特殊要求吗？';
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        productRecommendations: productRecommendations.length > 0 ? productRecommendations : undefined,
      };
      
      const updatedMessages = [...get().chatMessages, aiMessage];
      set({
        chatMessages: updatedMessages,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'AI回复失败',
        isLoading: false,
      });
    }
  },

  /**
   * 清空聊天记录
   */
  clearChatMessages: () => {
    set({
      chatMessages: [
        {
          id: '1',
          type: 'assistant',
          content: '您好！我是您的AI购物助手，有什么可以帮助您的吗？',
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },

  /**
   * 切换聊天窗口显示状态
   */
  toggleChat: () => {
    const { isChatOpen } = get();
    set({ isChatOpen: !isChatOpen });
  },

  /**
   * 获取搜索建议
   * @param query 搜索查询
   * @param userId 用户ID（可选）
   * @returns 搜索建议列表
   */
  getSearchSuggestions: async (query: string) => {
    try {
      // TODO: 调用搜索建议API
      // const response = await fetch('/api/ai/search-suggestions', {
      //   method: 'POST',
      //   body: JSON.stringify({ query, userId })
      // });
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 生成搜索建议
      const suggestions: string[] = [];
      
      if (query.toLowerCase().includes('手机')) {
        suggestions.push('iPhone 15 Pro', '华为 Mate 60', '小米14', '三星 Galaxy S24');
      } else if (query.toLowerCase().includes('电脑')) {
        suggestions.push('MacBook Air', '联想ThinkPad', '戴尔XPS', '华硕灵耀');
      } else if (query.toLowerCase().includes('鞋')) {
        suggestions.push('Nike Air Max', 'Adidas Ultra Boost', '安踏跑鞋', '李宁运动鞋');
      } else {
        suggestions.push(`${query} 推荐`, `${query} 热销`, `${query} 新品`, `${query} 优惠`);
      }
      
      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      return [];
    }
  },

  /**
   * 设置加载状态
   * @param loading 加载状态
   */
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  /**
   * 清除错误信息
   */
  clearError: () => {
    set({ error: null });
  },
}));