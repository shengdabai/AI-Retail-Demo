/**
 * 头部导航栏组件
 * 包含logo、搜索框、用户菜单等
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Bell, 
  Menu,
  LogOut,
  Settings,
  Heart
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useProductStore } from '../../stores/productStore';

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * 头部导航栏组件
 * @param onMenuClick 菜单点击回调
 */
export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const { searchProducts } = useProductStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  /**
   * 处理搜索提交
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery.trim());
      navigate('/');
    }
  };

  /**
   * 处理用户登出
   */
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧：菜单按钮和Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link to="/" className="flex items-center ml-4 lg:ml-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 whitespace-nowrap hidden sm:inline">零售推荐</span>
              </div>
            </Link>
          </div>

          {/* 中间：搜索框 */}
          <div className="flex-1 min-w-0 max-w-lg mx-2 sm:mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="搜索商品..."
              />
            </form>
          </div>

          {/* 右侧：功能按钮和用户菜单 */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* 通知按钮 */}
            <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell className="h-6 w-6" />
            </button>

            {/* 收藏按钮 */}
            <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
              <Heart className="h-6 w-6" />
            </button>

            {/* 购物车按钮 */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* 用户菜单 */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name || '用户'}
                  </span>
                </button>

                {/* 用户下拉菜单 */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      个人中心
                    </Link>
                    <Link
                      to="/profile?tab=settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      设置
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 点击外部关闭用户菜单 */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}