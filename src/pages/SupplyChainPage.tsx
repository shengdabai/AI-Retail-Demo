/**
 * 供应链管理页面组件
 * 库存监控和需求预测
 */

import { Truck } from 'lucide-react';

/**
 * 供应链管理页面组件
 */
export function SupplyChainPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          供应链管理页面
        </h1>
        <p className="text-gray-500">
          此页面正在开发中，将展示库存监控、需求预测、供应商管理、数据分析等功能。
        </p>
      </div>
    </div>
  );
}