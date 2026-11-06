/**
 * 供应链管理状态管理
 * 管理库存、供应商、需求预测等供应链相关状态
 */

import { create } from 'zustand';
import type { Inventory, Supplier, DemandForecast, SalesStats } from '../types';

interface SupplyChainState {
  // 状态
  inventory: Inventory[];
  suppliers: Supplier[];
  demandForecasts: DemandForecast[];
  salesStats: SalesStats | null;
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  fetchInventory: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  fetchDemandForecasts: (timeRange?: 'week' | 'month' | 'quarter') => Promise<void>;
  fetchSalesStats: (timeRange?: string) => Promise<void>;
  updateInventory: (productId: string, quantity: number) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
}

// Mock库存数据
const mockInventory: Inventory[] = [
  {
    id: '1',
    productId: '1',
    supplierId: '1',
    stockQuantity: 50,
    reservedQuantity: 5,
    reorderPoint: 10,
    lastUpdated: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    productId: '2',
    supplierId: '2',
    stockQuantity: 30,
    reservedQuantity: 3,
    reorderPoint: 15,
    lastUpdated: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    productId: '3',
    supplierId: '3',
    stockQuantity: 100,
    reservedQuantity: 10,
    reorderPoint: 20,
    lastUpdated: '2024-01-15T11:45:00Z',
  },
];

// Mock供应商数据
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: '苹果官方供应商',
    contactEmail: 'contact@apple-supplier.com',
    contactPhone: '+86-400-123-4567',
    address: {
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区',
    },
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '联想供应链',
    contactEmail: 'supply@lenovo.com',
    contactPhone: '+86-400-987-6543',
    address: {
      province: '北京市',
      city: '北京市',
      district: '海淀区',
      detail: '中关村软件园',
    },
    status: 'active',
    createdAt: '2023-02-01T00:00:00Z',
  },
  {
    id: '3',
    name: '耐克中国',
    contactEmail: 'china@nike.com',
    contactPhone: '+86-400-555-0123',
    address: {
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴金融区',
    },
    status: 'active',
    createdAt: '2023-03-01T00:00:00Z',
  },
];

// Mock需求预测数据
const mockDemandForecasts: DemandForecast[] = [
  {
    id: '1',
    productId: '1',
    timeRange: 'month',
    predictedDemand: 200,
    confidence: 0.85,
    factors: ['季节性趋势', '历史销量', '市场热度'],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    productId: '2',
    timeRange: 'month',
    predictedDemand: 150,
    confidence: 0.78,
    factors: ['新品发布', '竞品分析', '用户反馈'],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    productId: '3',
    timeRange: 'month',
    predictedDemand: 300,
    confidence: 0.92,
    factors: ['运动季节', '促销活动', '品牌影响力'],
    createdAt: '2024-01-15T00:00:00Z',
  },
];

// Mock销售统计数据
const mockSalesStats: SalesStats = {
  totalRevenue: 1250000,
  totalOrders: 3456,
  averageOrderValue: 361.5,
  conversionRate: 3.2,
  topProducts: [
    {
      product: {
        id: '1',
        name: 'iPhone 15 Pro',
        description: '苹果最新旗舰手机',
        price: 7999,
        sku: 'IPHONE15PRO',
        categoryId: '1',
        images: [],
        specifications: {},
        isActive: true,
        stock: 50,
        rating: 4.8,
        reviewCount: 1234,
        tags: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      sales: 156,
      revenue: 1247844,
    },
    {
      product: {
        id: '2',
        name: 'MacBook Air M3',
        description: '轻薄笔记本电脑',
        price: 8999,
        sku: 'MACBOOKAIRM3',
        categoryId: '1',
        images: [],
        specifications: {},
        isActive: true,
        stock: 30,
        rating: 4.7,
        reviewCount: 856,
        tags: [],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      sales: 89,
      revenue: 800911,
    },
  ],
  regionStats: [
    { region: '华东地区', sales: 1234, revenue: 450000 },
    { region: '华南地区', sales: 987, revenue: 380000 },
    { region: '华北地区', sales: 765, revenue: 290000 },
    { region: '西南地区', sales: 470, revenue: 130000 },
  ],
  timeRange: '本月',
};

/**
 * 创建供应链管理状态管理store
 */
export const useSupplyChainStore = create<SupplyChainState>((set, get) => ({
  // 初始状态
  inventory: [],
  suppliers: [],
  demandForecasts: [],
  salesStats: null,
  isLoading: false,
  error: null,

  /**
   * 获取库存信息
   */
  fetchInventory: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用库存API
      // const response = await fetch('/api/inventory');
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({
        inventory: mockInventory,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取库存信息失败',
        isLoading: false,
      });
    }
  },

  /**
   * 获取供应商列表
   */
  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用供应商API
      // const response = await fetch('/api/suppliers');
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      set({
        suppliers: mockSuppliers,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取供应商列表失败',
        isLoading: false,
      });
    }
  },

  /**
   * 获取需求预测数据
   * @param timeRange 时间范围
   */
  fetchDemandForecasts: async (timeRange = 'month') => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用需求预测API
      // const response = await fetch(`/api/supply-chain/demand-forecast?timeRange=${timeRange}`);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const filteredForecasts = mockDemandForecasts.filter(
        forecast => forecast.timeRange === timeRange
      );
      
      set({
        demandForecasts: filteredForecasts,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取需求预测失败',
        isLoading: false,
      });
    }
  },

  /**
   * 获取销售统计数据
   * @param timeRange 时间范围
   */
  fetchSalesStats: async (timeRange = 'month') => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用销售统计API
      // const response = await fetch(`/api/sales/stats?timeRange=${timeRange}`);
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      set({
        salesStats: { ...mockSalesStats, timeRange },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取销售统计失败',
        isLoading: false,
      });
    }
  },

  /**
   * 更新库存数量
   * @param productId 商品ID
   * @param quantity 新库存数量
   */
  updateInventory: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用更新库存API
      // const response = await fetch(`/api/inventory/${productId}`, {
      //   method: 'PUT',
      //   body: JSON.stringify({ quantity })
      // });
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { inventory } = get();
      const updatedInventory = inventory.map(item => 
        item.productId === productId 
          ? { ...item, stockQuantity: quantity, lastUpdated: new Date().toISOString() }
          : item
      );
      
      set({
        inventory: updatedInventory,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新库存失败',
        isLoading: false,
      });
    }
  },

  /**
   * 添加供应商
   * @param supplier 供应商信息
   */
  addSupplier: async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用添加供应商API
      // const response = await fetch('/api/suppliers', {
      //   method: 'POST',
      //   body: JSON.stringify(supplier)
      // });
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newSupplier: Supplier = {
        ...supplier,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      const { suppliers } = get();
      set({
        suppliers: [...suppliers, newSupplier],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '添加供应商失败',
        isLoading: false,
      });
    }
  },

  /**
   * 更新供应商信息
   * @param id 供应商ID
   * @param supplier 要更新的供应商信息
   */
  updateSupplier: async (id: string, supplier: Partial<Supplier>) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: 调用更新供应商API
      // const response = await fetch(`/api/suppliers/${id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(supplier)
      // });
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { suppliers } = get();
      const updatedSuppliers = suppliers.map(s => 
        s.id === id ? { ...s, ...supplier } : s
      );
      
      set({
        suppliers: updatedSuppliers,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新供应商失败',
        isLoading: false,
      });
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