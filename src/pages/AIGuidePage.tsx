/**
 * AI导购页面组件
 * 提供智能推荐引擎和购物助手功能
 */

import { useEffect, useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Filter, 
  SortAsc, 
  Grid, 
  List,
  Star,
  ShoppingCart,
  Heart,
  MessageCircle,
  Zap
} from 'lucide-react';
import { useAIStore } from '../stores/aiStore';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import type { Recommendation } from '../types';

/**
 * 推荐商品卡片组件
 */
function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const { addToCart } = useCartStore();
  const [isLiked, setIsLiked] = useState(false);
  
  if (!recommendation.product) return null;
  
  const product = recommendation.product;

  /**
   * 添加到购物车
   */
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  /**
   * 获取推荐类型显示文本
   */
  const getRecommendationType = (type: string) => {
    switch (type) {
      case 'personalized': return '个性化推荐';
      case 'similar': return '相似商品';
      case 'trending': return '热门推荐';
      case 'collaborative': return '协同过滤';
      default: return '智能推荐';
    }
  };

  /**
   * 获取推荐类型颜色
   */
  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'personalized': return 'bg-blue-100 text-blue-800';
      case 'similar': return 'bg-green-100 text-green-800';
      case 'trending': return 'bg-red-100 text-red-800';
      case 'collaborative': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* 商品图片 */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=product%20placeholder&image_size=square'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
        
        {/* 推荐标签 */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getRecommendationColor(recommendation.type)}`}>
            {getRecommendationType(recommendation.type)}
          </span>
        </div>
        
        {/* 推荐分数 */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
          {Math.round(recommendation.score * 100)}%
        </div>
        
        {/* 收藏按钮 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute bottom-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors duration-200"
        >
          <Heart 
            className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
          />
        </button>
      </div>
      
      {/* 商品信息 */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {/* 推荐理由 */}
        <p className="text-sm text-blue-600 mb-2">
          {recommendation.reason}
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
  );
}

/**
 * 快捷问题按钮组件
 */
function QuickQuestions() {
  const { sendChatMessage, toggleChat } = useAIStore();
  
  const quickQuestions = [
    '推荐一些热门手机',
    '有什么性价比高的笔记本电脑？',
    '适合运动的鞋子推荐',
    '最新的数码产品有哪些？',
    '家居用品推荐',
    '有什么优惠活动吗？',
  ];

  /**
   * 处理快捷问题点击
   */
  const handleQuickQuestion = (question: string) => {
    sendChatMessage(question);
    toggleChat();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">快速咨询</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuickQuestion(question)}
            className="text-left p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200 text-sm"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * AI导购页面组件
 */
export function AIGuidePage() {
  const { 
    recommendations, 
    isLoading, 
    fetchRecommendations, 
    toggleChat 
  } = useAIStore();
  const { fetchCategories } = useProductStore();
  
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'rating'>('score');

  useEffect(() => {
    // 获取推荐数据
    fetchRecommendations('current-user', selectedType === 'all' ? undefined : selectedType, 12);
    fetchCategories();
  }, [selectedType, fetchRecommendations, fetchCategories]);

  /**
   * 获取排序后的推荐列表
   */
  const getSortedRecommendations = () => {
    const sorted = [...recommendations].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.product?.price || 0) - (b.product?.price || 0);
        case 'rating':
          return (b.product?.rating || 0) - (a.product?.rating || 0);
        case 'score':
        default:
          return b.score - a.score;
      }
    });
    return sorted;
  };

  /**
   * 推荐类型选项
   */
  const recommendationTypes = [
    { key: 'all', label: '全部推荐', icon: Sparkles },
    { key: 'personalized', label: '个性化', icon: Bot },
    { key: 'similar', label: '相似商品', icon: Grid },
    { key: 'trending', label: '热门推荐', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-2">AI智能导购</h1>
            <p className="text-blue-100">
              基于您的偏好和行为，为您推荐最合适的商品
            </p>
          </div>
          <button
            onClick={toggleChat}
            className="flex items-center shrink-0 whitespace-nowrap px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
          >
            <Bot className="h-5 w-5 mr-2" />
            AI助手
          </button>
        </div>
      </div>

      {/* 快捷问题 */}
      <QuickQuestions />

      {/* 筛选和排序控制 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* 推荐类型筛选 */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">推荐类型:</span>
            <div className="flex flex-wrap gap-1">
              {recommendationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                      selectedType === type.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 排序和视图控制 */}
          <div className="flex items-center space-x-4">
            {/* 排序 */}
            <div className="flex items-center space-x-2">
              <SortAsc className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="score">推荐度</option>
                <option value="price">价格</option>
                <option value="rating">评分</option>
              </select>
            </div>

            {/* 视图模式 */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 推荐结果 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            为您推荐 ({recommendations.length})
          </h2>
          
          {selectedType !== 'all' && (
            <div className="text-sm text-gray-500">
              当前显示: {recommendationTypes.find(t => t.key === selectedType)?.label}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {getSortedRecommendations().map((recommendation) => (
              <RecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无推荐商品
            </h3>
            <p className="text-gray-500 mb-4">
              AI正在学习您的偏好，请稍后再试
            </p>
            <button
              onClick={() => fetchRecommendations('current-user', undefined, 12)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              重新获取推荐
            </button>
          </div>
        )}
      </div>
    </div>
  );
}