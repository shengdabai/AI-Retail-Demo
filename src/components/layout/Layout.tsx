/**
 * 主布局组件
 * 包含导航栏、侧边栏和主内容区域
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

/**
 * 主布局组件
 * 提供应用的整体布局结构
 */
export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* 页面内容 */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}