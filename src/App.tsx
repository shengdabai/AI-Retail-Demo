/**
 * 零售推荐网站主应用组件
 * 配置路由和全局布局
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AIGuidePage } from './pages/AIGuidePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { ProfilePage } from './pages/ProfilePage';
import { SupplyChainPage } from './pages/SupplyChainPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatAssistant } from './components/ai/ChatAssistant';

/**
 * 主应用组件
 * 配置所有页面路由和全局组件
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 认证页面 - 无布局 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* 主要页面 - 带布局 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="ai-guide" element={<AIGuidePage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="supply-chain" element={<SupplyChainPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
        
        {/* 全局AI聊天助手 */}
        <ChatAssistant />
      </div>
    </Router>
  );
}

export default App;
