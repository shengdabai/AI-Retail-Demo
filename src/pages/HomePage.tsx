/**
 * 首页组件
 * 展示商品推荐、分类导航、热门商品等
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Bot
} from 'lucide-react';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useAIStore } from '../stores/aiStore';
import type { Product, Category } from '../types';

/**
 * 商品卡片组件
 */
function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCartStore();
  const [isLiked, setIsLiked] = useState(false);

  /**
   * 添加到购物车
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  /**
   * 切换收藏状态
   */
  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* 商品图片 */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images[0] || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=product%20placeholder&image_size=square'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* 收藏按钮 */}
          <button
            onClick={handleToggleLike}
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
          >
            <Heart 
              className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
            />
          </button>
          
          {/* 标签 */}
          {product.tags && product.tags.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* 商品信息 */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {product.description}
          </p>
          
          {/* 评分 */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-500">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
          
          {/* 价格和操作 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-red-600">
                ¥{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  ¥{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * 分类卡片组件
 */
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/?category=${category.id}`}
      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
        <span className="text-2xl">{category.icon}</span>
      </div>
      <span className="text-sm font-medium text-gray-900">{category.name}</span>
    </Link>
  );
}

/**
 * 首页组件
 */
export function HomePage() {
  const { products, categories, isLoading, fetchProducts, fetchCategories } = useProductStore();
  const { recommendations, fetchRecommendations } = useAIStore();
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'new'>('all');

  useEffect(() => {
    // 获取商品和分类数据
    fetchProducts();
    fetchCategories();
    
    // 获取AI推荐（模拟用户ID）
    fetchRecommendations('current-user', 'personalized', 6);
  }, [fetchProducts, fetchCategories, fetchRecommendations]);

  /**
   * 根据标签页过滤商品
   */
  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'trending':
        return products.filter(p => p.tags.includes('热销')).slice(0, 8);
      case 'new':
        return products.filter(p => p.tags.includes('新品')).slice(0, 8);
      default:
        return products.slice(0, 8);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">欢迎来到AI零售推荐平台</h1>
          <p className="text-blue-100 mb-4">
            通过智能推荐算法，为您提供个性化的购物体验
          </p>
          <Link
            to="/ai-guide"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            体验AI导购
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* 商品分类 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">商品分类</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* AI个性化推荐 */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">为您推荐</h2>
            </div>
            <Link
              to="/ai-guide"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              查看更多
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 6).map((rec) => (
              rec.product && (
                <div key={rec.id} className="relative">
                  <ProductCard product={rec.product} />
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    推荐度 {Math.round(rec.score * 100)}%
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {/* 热门商品 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">热门商品</h2>
          
          {/* 标签页切换 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: '全部', icon: null },
              { key: 'trending', label: '热销', icon: TrendingUp },
              { key: 'new', label: '新品', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getFilteredProducts().map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 底部CTA */}
      <section className="bg-gray-100 rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          发现更多精彩商品
        </h3>
        <p className="text-gray-600 mb-4">
          使用AI导购助手，获得更精准的商品推荐
        </p>
        <Link
          to="/ai-guide"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          <Bot className="h-5 w-5 mr-2" />
          开始AI导购
        </Link>
      </section>
    </div>
  );
}