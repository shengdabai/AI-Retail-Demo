/**
 * 商品状态管理
 * 管理商品列表、分类、搜索、详情等状态
 */

import { create } from 'zustand';
import type { Product, Category, SearchFilters } from '../types';

interface ProductState {
  // 状态
  products: Product[];
  categories: Category[];
  currentProduct: Product | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // 操作方法
  fetchProducts: (filters?: SearchFilters) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  searchProducts: (keyword: string) => Promise<void>;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  clearSearchFilters: () => void;
  setCurrentProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

// Mock数据
const mockCategories: Category[] = [
  {
    id: '1',
    name: '电子产品',
    slug: 'electronics',
    description: '手机、电脑、数码产品等',
    sortOrder: 1,
    icon: '📱',
  },
  {
    id: '2',
    name: '服装鞋帽',
    slug: 'clothing',
    description: '男装、女装、鞋子、配饰等',
    sortOrder: 2,
    icon: '👕',
  },
  {
    id: '3',
    name: '家居用品',
    slug: 'home',
    description: '家具、装饰、厨具等',
    sortOrder: 3,
    icon: '🏠',
  },
  {
    id: '4',
    name: '图书音像',
    slug: 'books',
    description: '图书、音乐、影视等',
    sortOrder: 4,
    icon: '📚',
  },
  {
    id: '5',
    name: '运动户外',
    slug: 'sports',
    description: '运动器材、户外用品等',
    sortOrder: 5,
    icon: '⚽',
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '苹果最新旗舰手机，搭载A17 Pro芯片，支持5G网络，拍照效果出色。',
    price: 7999,
    originalPrice: 8999,
    sku: 'IPHONE15PRO',
    categoryId: '1',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20smartphone%20product%20photo%20on%20white%20background&image_size=square_hd',
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20back%20view%20product%20photo&image_size=square_hd',
    ],
    specifications: {
      '屏幕尺寸': '6.1英寸',
      '处理器': 'A17 Pro',
      '存储容量': '128GB',
      '颜色': '深空黑色',
    },
    isActive: true,
    stock: 50,
    rating: 4.8,
    reviewCount: 1234,
    tags: ['热销', '新品', '5G'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    description: '轻薄笔记本电脑，搭载M3芯片，续航能力强，适合办公和学习。',
    price: 8999,
    sku: 'MACBOOKAIRM3',
    categoryId: '1',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Air%20laptop%20product%20photo%20on%20white%20background&image_size=square_hd',
    ],
    specifications: {
      '屏幕尺寸': '13.6英寸',
      '处理器': 'Apple M3',
      '内存': '8GB',
      '存储': '256GB SSD',
    },
    isActive: true,
    stock: 30,
    rating: 4.7,
    reviewCount: 856,
    tags: ['轻薄', '长续航'],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Nike Air Max',
    description: '经典运动鞋，舒适透气，适合日常运动和休闲穿着。',
    price: 899,
    originalPrice: 1099,
    sku: 'NIKEAIRMAX',
    categoryId: '2',
    images: [
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Nike%20Air%20Max%20sneakers%20product%20photo%20on%20white%20background&image_size=square_hd',
    ],
    specifications: {
      '尺码': '42',
      '颜色': '黑白配色',
      '材质': '网布+合成革',
    },
    isActive: true,
    stock: 100,
    rating: 4.5,
    reviewCount: 432,
    tags: ['经典', '舒适'],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

/**
 * 创建商品状态管理store
 */
let latestDetailRequest = 0;

export const useProductStore = create<ProductState>((set, get) => ({
  // 初始状态
  products: [],
  categories: [],
  currentProduct: null,
  searchFilters: {},
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  /**
   * 获取商品列表
   * @param filters 搜索过滤条件
   */
  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用商品列表API
      // const response = await fetch('/api/products?' + new URLSearchParams(filters));
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredProducts = [...mockProducts];
      
      // Apply filters
      if (filters.keyword) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(filters.keyword!.toLowerCase()) ||
          product.description.toLowerCase().includes(filters.keyword!.toLowerCase())
        );
      }
      
      if (filters.categoryId) {
        filteredProducts = filteredProducts.filter(product => 
          product.categoryId === filters.categoryId
        );
      }
      
      if (filters.priceRange) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= filters.priceRange!.min && 
          product.price <= filters.priceRange!.max
        );
      }

      if (filters.rating !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.rating >= filters.rating!);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
          let aValue: number, bValue: number;
          
          switch (filters.sortBy) {
            case 'price':
              aValue = a.price;
              bValue = b.price;
              break;
            case 'rating':
              aValue = a.rating;
              bValue = b.rating;
              break;
            case 'sales':
              aValue = a.reviewCount;
              bValue = b.reviewCount;
              break;
            case 'newest':
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
              break;
            default:
              return 0;
          }
          
          return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        });
      }
      
      set({
        products: filteredProducts,
        searchFilters: filters,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / 20),
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取商品列表失败',
        isLoading: false,
      });
    }
  },

  /**
   * 获取商品分类列表
   */
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用分类列表API
      // const response = await fetch('/api/categories');
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set({
        categories: mockCategories,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取分类列表失败',
        isLoading: false,
      });
    }
  },

  /**
   * 根据ID获取商品详情
   * @param id 商品ID
   */
  fetchProductById: async (id: string) => {
    const requestId = ++latestDetailRequest;
    set({ isLoading: true, error: null, currentProduct: null });
    
    try {
      // TODO: 调用商品详情API
      // const response = await fetch(`/api/products/${id}`);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (requestId !== latestDetailRequest) return;

      const product = mockProducts.find(p => p.id === id);
      
      if (!product) {
        throw new Error('商品不存在');
      }
      
      // Add category info
      const category = mockCategories.find(c => c.id === product.categoryId);
      const productWithCategory = { ...product, category };
      
      set({
        currentProduct: productWithCategory,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取商品详情失败',
        isLoading: false,
      });
    }
  },

  /**
   * 搜索商品
   * @param keyword 搜索关键词
   */
  searchProducts: async (keyword: string) => {
    const filters = { ...get().searchFilters, keyword };
    await get().fetchProducts(filters);
  },

  /**
   * 设置搜索过滤条件
   * @param filters 过滤条件
   */
  setSearchFilters: (filters: Partial<SearchFilters>) => {
    const currentFilters = get().searchFilters;
    set({ searchFilters: { ...currentFilters, ...filters } });
  },

  /**
   * 清除搜索过滤条件
   */
  clearSearchFilters: () => {
    set({ searchFilters: {} });
  },

  /**
   * 设置当前商品
   * @param product 商品对象
   */
  setCurrentProduct: (product: Product | null) => {
    set({ currentProduct: product });
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
