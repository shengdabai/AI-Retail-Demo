/**
 * 零售推荐网站类型定义
 * 定义所有业务相关的TypeScript接口和类型
 */

// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'vip' | 'retailer' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 商品相关类型
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  sku: string;
  categoryId: string;
  category?: Category;
  images: string[];
  specifications: Record<string, unknown>;
  isActive: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 商品分类类型
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  sortOrder: number;
  icon?: string;
}

// 购物车项目类型
export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
  selectedSpecs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// 订单相关类型
export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedSpecs?: Record<string, string>;
}

// 地址类型
export interface Address {
  id?: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
}

// 评价类型
export interface Review {
  id: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'avatar'>;
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
  isHelpful?: boolean;
  helpfulCount: number;
  createdAt: string;
}

// AI推荐相关类型
export interface Recommendation {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  type: 'similar' | 'trending' | 'personalized' | 'collaborative';
  score: number;
  reason: string;
  createdAt: string;
}

// 用户偏好类型
export interface UserPreference {
  id: string;
  userId: string;
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  behaviorData: Record<string, unknown>;
  updatedAt: string;
}

// 库存相关类型
export interface Inventory {
  id: string;
  productId: string;
  product?: Product;
  supplierId?: string;
  supplier?: Supplier;
  stockQuantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  lastUpdated: string;
}

// 供应商类型
export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: Record<string, unknown>;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

// 需求预测类型
export interface DemandForecast {
  id: string;
  productId: string;
  product?: Product;
  timeRange: 'week' | 'month' | 'quarter';
  predictedDemand: number;
  confidence: number;
  factors: string[];
  createdAt: string;
}

// 销售统计类型
export interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    product: Product;
    sales: number;
    revenue: number;
  }>;
  regionStats: Array<{
    region: string;
    sales: number;
    revenue: number;
  }>;
  timeRange: string;
}

// 聊天消息类型
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  productRecommendations?: Product[];
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页类型
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 搜索过滤器类型
export interface SearchFilters {
  keyword?: string;
  categoryId?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  sortBy?: 'price' | 'rating' | 'sales' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

// 通知类型
export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'promotion' | 'system' | 'recommendation';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// 优惠券类型
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

// 购物车状态类型
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  appliedCoupon?: Coupon;
  shippingFee: number;
}

// 表单验证错误类型
export interface FormErrors {
  [key: string]: string | undefined;
}

// 加载状态类型
export interface LoadingState {
  [key: string]: boolean;
}

// 模态框状态类型
export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: unknown;
}

// 主题类型
export type Theme = 'light' | 'dark';

// 语言类型
export type Language = 'zh-CN' | 'en-US';

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// 导出所有类型的联合类型
export type EntityType = 
  | User 
  | Product 
  | Category 
  | CartItem 
  | Order 
  | OrderItem 
  | Address 
  | Review 
  | Recommendation 
  | UserPreference 
  | Inventory 
  | Supplier 
  | DemandForecast 
  | SalesStats 
  | ChatMessage 
  | Notification 
  | Coupon;