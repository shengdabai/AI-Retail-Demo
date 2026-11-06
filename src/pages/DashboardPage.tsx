/**
 * 数据看板页面组件
 * 销售统计和分析报告
 */

import { BarChart3 } from 'lucide-react';

/**
 * 数据看板页面组件
 */
export function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          数据看板页面
        </h1>
        <p className="text-gray-500">
          此页面正在开发中，将展示销售统计、用户行为分析、推荐效果、运营指标等功能。
        </p>
      </div>
    </div>
  );
}