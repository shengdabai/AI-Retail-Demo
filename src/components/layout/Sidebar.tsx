/**
 * 侧边栏导航组件
 * 包含主要功能模块的导航链接
 */

import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bot, 
  Package, 
  ShoppingCart, 
  User, 
  TruckIcon as Truck, 
  BarChart3, 
  X 
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// 导航菜单项配置
const navigationItems = [
  {
    name: '首页',
    href: '/',
    icon: Home,
    description: '商品展示和推荐',
  },
  {
    name: 'AI导购',
    href: '/ai-guide',
    icon: Bot,
    description: '智能推荐和购物助手',
  },
  {
    name: '购物车',
    href: '/cart',
    icon: ShoppingCart,
    description: '管理购买商品',
  },
  {
    name: '个人中心',
    href: '/profile',
    icon: User,
    description: '个人信息和订单',
  },
];

// 管理功能菜单项（需要特定权限）
const managementItems = [
  {
    name: '供应链管理',
    href: '/supply-chain',
    icon: Truck,
    description: '库存和供应商管理',
    roles: ['retailer', 'admin'],
  },
  {
    name: '数据看板',
    href: '/dashboard',
    icon: BarChart3,
    description: '销售统计和分析',
    roles: ['retailer', 'admin'],
  },
];

/**
 * 侧边栏导航组件
 * @param isOpen 是否打开
 * @param onClose 关闭回调
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();

  /**
   * 检查用户是否有权限访问某个菜单项
   * @param roles 允许的角色列表
   * @returns 是否有权限
   */
  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return user && roles.includes(user.role);
  };

  /**
   * 检查当前路径是否匹配菜单项
   * @param href 菜单项路径
   * @returns 是否匹配
   */
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* 侧边栏 */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">零售推荐</span>
            </div>
            
            {/* 移动端关闭按钮 */}
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* 主要功能 */}
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={clsx(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                      active
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon
                      className={clsx(
                        'mr-3 h-5 w-5 transition-colors duration-200',
                        active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* 管理功能分隔线 */}
            {managementItems.some(item => hasPermission(item.roles)) && (
              <div className="pt-6">
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    管理功能
                  </h3>
                </div>
                <div className="space-y-1">
                  {managementItems.map((item) => {
                    if (!hasPermission(item.roles)) return null;
                    
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={clsx(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                          active
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        <Icon
                          className={clsx(
                            'mr-3 h-5 w-5 transition-colors duration-200',
                            active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>

          {/* 侧边栏底部 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">零售推荐系统</p>
                <p className="text-xs text-gray-500">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}