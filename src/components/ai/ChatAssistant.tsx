/**
 * AI聊天助手组件
 * 提供智能客服对话功能
 */

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  ShoppingCart,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useAIStore } from '../../stores/aiStore';
import { useCartStore } from '../../stores/cartStore';
import type { ChatMessage, Product } from '../../types';

/**
 * 消息气泡组件
 */
function MessageBubble({ message }: { message: ChatMessage }) {
  const { addToCart } = useCartStore();
  const isUser = message.type === 'user';

  /**
   * 添加推荐商品到购物车
   */
  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 头像 */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-600' : 'bg-gray-600'
          }`}>
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>
        </div>
        
        {/* 消息内容 */}
        <div className="flex flex-col">
          <div className={`px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-900'
          }`}>
            <p className="text-sm">{message.content}</p>
          </div>
          
          {/* 商品推荐卡片 */}
          {message.productRecommendations && message.productRecommendations.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.productRecommendations.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.images[0] || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=product%20placeholder&image_size=square'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-red-600 font-semibold">
                        ¥{product.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 时间戳 */}
          <div className={`text-xs text-gray-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AI聊天助手组件
 */
export function ChatAssistant() {
  const {
    chatMessages,
    isChatOpen,
    isLoading,
    toggleChat,
    sendChatMessage,
    clearChatMessages
  } = useAIStore();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 滚动到消息底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isChatOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isChatOpen, isMinimized]);

  /**
   * 发送消息
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    await sendChatMessage(message);
  };

  /**
   * 处理键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // 如果聊天窗口未打开，显示浮动按钮
  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
      >
        <MessageCircle className="h-6 w-6" />
        {/* 未读消息提示 */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {/* 聊天窗口头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium">AI购物助手</h3>
            <p className="text-xs text-blue-100">在线为您服务</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 聊天内容区域 */}
      {!isMinimized && (
        <>
          {/* 消息列表 */}
          <div className="h-80 overflow-y-auto p-4 space-y-2">
            {chatMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {/* 加载指示器 */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors duration-200"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            
            {/* 快捷操作 */}
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={clearChatMessages}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                清空对话
              </button>
              <div className="text-xs text-gray-400">
                按 Enter 发送
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}