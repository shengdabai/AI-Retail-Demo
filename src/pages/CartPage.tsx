/**
 * 购物车页面组件
 * 管理购物车商品和结算功能
 */

import { ShoppingCart } from 'lucide-react';

/**
 * 购物车页面组件
 */
export function CartPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          购物车页面
        </h1>
        <p className="text-gray-500">
          此页面正在开发中，将展示购物车商品管理、价格计算、优惠券应用等功能。
        </p>
      </div>
    </div>
  );
}