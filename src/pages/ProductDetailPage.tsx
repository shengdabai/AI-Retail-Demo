/**
 * 商品详情页面组件
 * 显示商品详细信息、评价、相关推荐等
 */

import { useParams } from 'react-router-dom';
import { Package } from 'lucide-react';

/**
 * 商品详情页面组件
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          商品详情页面
        </h1>
        <p className="text-gray-600 mb-4">
          商品ID: {id}
        </p>
        <p className="text-gray-500">
          此页面正在开发中，将展示商品详细信息、用户评价、相关推荐等功能。
        </p>
      </div>
    </div>
  );
}