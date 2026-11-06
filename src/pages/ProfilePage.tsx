/**
 * 用户中心页面组件
 * 个人信息管理和订单管理
 */

import { User } from 'lucide-react';

/**
 * 用户中心页面组件
 */
export function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          用户中心页面
        </h1>
        <p className="text-gray-500">
          此页面正在开发中，将展示个人信息管理、订单管理、推荐历史、偏好设置等功能。
        </p>
      </div>
    </div>
  );
}