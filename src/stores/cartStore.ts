/**
 * 购物车状态管理
 * 管理购物车商品、数量、价格计算等状态
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Coupon, CartState } from '../types';

interface CartStoreState extends CartState {
  // 操作方法
  addToCart: (product: Product, quantity?: number, selectedSpecs?: Record<string, string>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  calculateTotals: () => void;
  getCartItem: (productId: string, selectedSpecs?: Record<string, string>) => CartItem | undefined;
}

const specKey = (specs: Record<string, string> = {}) =>
  JSON.stringify(Object.entries(specs).sort(([a], [b]) => a.localeCompare(b)));
const validQuantity = (quantity: number) => Number.isSafeInteger(quantity) && quantity > 0;
const roundMoney = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
const subtotalOf = (items: CartItem[]) => roundMoney(items.reduce(
  (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0,
));

function couponError(coupon: Coupon, subtotal: number): string | undefined {
  const nonnegative = (value: number | undefined) => value === undefined
    || (Number.isFinite(value) && value >= 0);
  if (!Number.isFinite(coupon.value) || coupon.value < 0
    || !['percentage', 'fixed'].includes(coupon.type)
    || (coupon.type === 'percentage' && coupon.value > 100)
    || !nonnegative(coupon.minOrderAmount) || !nonnegative(coupon.maxDiscountAmount)
    || !Number.isSafeInteger(coupon.usedCount) || coupon.usedCount < 0
    || (coupon.usageLimit !== undefined
      && (!Number.isSafeInteger(coupon.usageLimit) || coupon.usageLimit < 0))) {
    return '优惠券信息无效';
  }
  if (!coupon.isActive) return '优惠券已失效';
  if (subtotal < (coupon.minOrderAmount ?? 0)) {
    return `订单金额需满${coupon.minOrderAmount}元才能使用此优惠券`;
  }
  const start = new Date(coupon.startDate).getTime();
  const end = new Date(coupon.endDate).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || now < start || now > end) {
    return '优惠券不在有效期内';
  }
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return '优惠券已达到使用上限';
  }
}

function totalsFor(items: CartItem[], coupon?: Coupon) {
  const subtotal = subtotalOf(items);
  const appliedCoupon = items.length && coupon && !couponError(coupon, subtotal) ? coupon : undefined;
  const shippingFee = items.length === 0 || subtotal >= 99 ? 0 : 10;
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.type === 'percentage'
      ? subtotal * appliedCoupon.value / 100 : appliedCoupon.value;
    if (appliedCoupon.maxDiscountAmount !== undefined) {
      discount = Math.min(discount, appliedCoupon.maxDiscountAmount);
    }
  }
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: roundMoney(Math.max(0, subtotal - Math.min(subtotal, roundMoney(discount))) + shippingFee),
    shippingFee,
    appliedCoupon,
  };
}

// Mock优惠券数据
const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    name: '新用户优惠券',
    description: '新用户专享10%折扣',
    type: 'percentage',
    value: 10,
    minOrderAmount: 100,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 0,
    isActive: true,
  },
  {
    id: '2',
    code: 'SAVE50',
    name: '满减优惠券',
    description: '满500减50',
    type: 'fixed',
    value: 50,
    minOrderAmount: 500,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    usageLimit: 500,
    usedCount: 0,
    isActive: true,
  },
];

/**
 * 创建购物车状态管理store
 * 使用persist中间件持久化购物车数据
 */
export const useCartStore = create<CartStoreState>()(persist(
  (set, get) => ({
    // 初始状态
    items: [],
    totalItems: 0,
    totalAmount: 0,
    appliedCoupon: undefined,
    shippingFee: 0,

    /**
     * 添加商品到购物车
     * @param product 商品信息
     * @param quantity 数量，默认为1
     * @param selectedSpecs 选中的规格
     */
    addToCart: (product: Product, quantity = 1, selectedSpecs = {}) => {
      if (!validQuantity(quantity) || !Number.isFinite(product.price) || product.price < 0) return;
      const { items } = get();
      const existingItemIndex = items.findIndex(
        item => item.productId === product.id && 
        specKey(item.selectedSpecs) === specKey(selectedSpecs)
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // 如果商品已存在，更新数量
        if (!validQuantity(items[existingItemIndex].quantity + quantity)) return;
        newItems = items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity, updatedAt: new Date().toISOString() }
            : item
        );
      } else {
        // 添加新商品
        const newItem: CartItem = {
          id: JSON.stringify([product.id, specKey(selectedSpecs)]),
          userId: 'current-user', // TODO: 从auth store获取
          productId: product.id,
          product,
          quantity,
          selectedSpecs: { ...selectedSpecs },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newItems = [...items, newItem];
      }

      set({ items: newItems });
      get().calculateTotals();
    },

    /**
     * 从购物车移除商品
     * @param itemId 购物车项目ID（包含规格）
     */
    removeFromCart: (itemId: string) => {
      const { items } = get();
      const newItems = items.filter(item => item.id !== itemId);
      
      set({ items: newItems });
      get().calculateTotals();
    },

    /**
     * 更新商品数量
     * @param itemId 购物车项目ID（包含规格）
     * @param quantity 新数量
     */
    updateQuantity: (itemId: string, quantity: number) => {
      if (quantity === 0) {
        get().removeFromCart(itemId);
        return;
      }

      if (!validQuantity(quantity)) return;
      const { items } = get();
      const newItems = items.map(item => 
        item.id === itemId 
          ? { ...item, quantity, updatedAt: new Date().toISOString() }
          : item
      );

      set({ items: newItems });
      get().calculateTotals();
    },

    /**
     * 清空购物车
     */
    clearCart: () => {
      set({
        items: [],
        totalItems: 0,
        totalAmount: 0,
        appliedCoupon: undefined,
        shippingFee: 0,
      });
    },

    /**
     * 应用优惠券
     * @param coupon 优惠券信息
     */
    applyCoupon: (coupon: Coupon) => {
      const error = couponError(coupon, subtotalOf(get().items));
      if (error) throw new Error(error);

      set({ appliedCoupon: coupon });
      get().calculateTotals();
    },

    /**
     * 移除优惠券
     */
    removeCoupon: () => {
      set({ appliedCoupon: undefined });
      get().calculateTotals();
    },

    /**
     * 计算购物车总计
     */
    calculateTotals: () => {
      const { items, appliedCoupon } = get();
      set(totalsFor(items, appliedCoupon));
    },

    /**
     * 获取购物车中的指定商品
     * @param productId 商品ID
     * @returns 购物车商品项或undefined
     */
    getCartItem: (productId: string, selectedSpecs = {}) => {
      const { items } = get();
      return items.find(item => item.productId === productId && specKey(item.selectedSpecs) === specKey(selectedSpecs));
    },
  }),
  {
    name: 'cart-storage', // localStorage key
    // Restore the stored inputs and derive totals before subscribers see the cart.
    merge: (persisted, current) => {
      const saved = persisted as Partial<Pick<CartState, 'items' | 'appliedCoupon'>> | undefined;
      const restored = Array.isArray(saved?.items) ? saved.items : [];
      const byVariant = new Map<string, CartItem>();
      for (const item of restored) {
        if (!validQuantity(item.quantity)) continue;
        const id = JSON.stringify([item.productId, specKey(item.selectedSpecs)]);
        const existing = byVariant.get(id);
        byVariant.set(id, existing
          ? { ...existing, quantity: existing.quantity + item.quantity }
          : { ...item, id });
      }
      const items = [...byVariant.values()];
      return { ...current, items, ...totalsFor(items, saved?.appliedCoupon) };
    },
    partialize: (state) => ({
      items: state.items,
      appliedCoupon: state.appliedCoupon,
    }),
  }
));

// 导出mock优惠券数据供其他组件使用
export { mockCoupons };
