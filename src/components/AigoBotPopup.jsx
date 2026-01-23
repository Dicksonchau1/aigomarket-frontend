import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Bot,
  Lightbulb,
  Code,
  Rocket,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AigoBotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hi! I'm Aigo AI Assistant. How can I help you build and deploy your AI application today?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: Rocket, label: 'Deploy a project', action: 'deploy' },
    { icon: Code, label: 'Generate code', action: 'code' },
    { icon: Lightbulb, label: 'Get ideas', action: 'ideas' },
    { icon: HelpCircle, label: 'Help with API', action: 'api' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (userMessage = message.trim()) => {
    if (!userMessage) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await axios.post(
        `${API_URL}/ai/chat`,
        { 
          message: userMessage,
          context: 'aigo_assistant',
          history: messages.slice(-5).map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }))
        },
        { 
          headers: { 
            Authorization: session?.access_token ? `Bearer ${session.access_token}` : undefined 
          } 
        }
      );

      if (response.data.success) {
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('AI response failed');
      }

    } catch (error) {
      console.error('AI chat error:', error);
      
      // Fallback intelligent responses
      const fallbackResponse = generateFallbackResponse(userMessage);
      
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: fallbackResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateFallbackResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();

    // Deploy related
    if (lowerMsg.includes('deploy') || lowerMsg.includes('launch')) {
      return `🚀 To deploy your project:

1. Go to Dashboard → Projects
2. Click on your project
3. Configure your settings
4. Click "Deploy to Production"

Your app will be live in seconds! Need a custom domain? Head to the Domains page.`;
    }

    // Custom domain
    if (lowerMsg.includes('domain') || lowerMsg.includes('dns')) {
      return `🌐 Setting up a custom domain:

1. Navigate to Dashboard → Domains
2. Enter your domain name
3. Add these DNS records to your provider:
   • Type: CNAME
   • Name: @ or subdomain
   • Value: app.aigo.market
   • TTL: 3600

4. Click "Verify DNS" to activate

SSL certificates are automatically provisioned!`;
    }

    // API related
    if (lowerMsg.includes('api') || lowerMsg.includes('endpoint')) {
      return `🔧 Using the Aigo API:

**Base URL:** https://api.aigo.market/v1

**Authentication:**
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

**Common endpoints:**
• POST /projects - Create project
• GET /analytics - Get stats
• POST /domains - Add domain

Check the Docs page for complete API reference!`;
    }

    // Code generation
    if (lowerMsg.includes('code') || lowerMsg.includes('generate') || lowerMsg.includes('example')) {
      return `💻 Here's a quick example to create a project via API:

\`\`\`javascript
const response = await fetch('https://api.aigo.market/v1/projects', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My AI App',
    category: 'ai-agents',
    pricing: { type: 'free' }
  })
});

const project = await response.json();
console.log('Project created:', project.url);
\`\`\`

Want more examples? Visit the Docs page!`;
    }

    // Analytics
    if (lowerMsg.includes('analytic') || lowerMsg.includes('stats') || lowerMsg.includes('track')) {
      return `📊 Track your performance in Analytics:

• Real-time views & downloads
• Revenue trends
• User engagement metrics
• Geographic data
• Top performing projects

Access detailed analytics from Dashboard → Analytics`;
    }

    // Pricing
    if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('payment')) {
      return `💰 Aigo Pricing:

**Free Tier:**
• Unlimited projects
• Basic analytics
• Community support

**Pro ($29/mo):**
• Custom domains
• Advanced analytics
• Priority support
• API access

**Enterprise:**
• Custom solutions
• Dedicated support
• SLA guarantees

Upgrade anytime from Settings!`;
    }

    // Ideas/inspiration
    if (lowerMsg.includes('idea') || lowerMsg.includes('inspiration') || lowerMsg.includes('what can')) {
      return `💡 Popular AI apps to build:

1. **AI Chatbots** - Customer support, Q&A
2. **Content Generators** - Blogs, social posts
3. **Image Tools** - Photo editing, art creation
4. **Data Analysis** - Business insights, predictions
5. **Automation** - Workflow helpers, schedulers

Browse the Marketplace for inspiration or start building from the Dashboard!`;
    }

    // Help/support
    if (lowerMsg.includes('help') || lowerMsg.includes('support') || lowerMsg.includes('problem')) {
      return `🆘 I'm here to help!

**Quick Links:**
• 📖 [Documentation](/docs)
• 💬 [Community Forum](https://community.aigo.market)
• 📧 Email: support@aigo.market
• 🐛 [Report Bug](https://github.com/aigo/issues)

What specific issue are you facing? I can provide detailed guidance!`;
    }

    // Default intelligent response
    return `I'd be happy to help! Here's what I can assist with:

🚀 **Deployment** - Launch your apps to production
🌐 **Custom Domains** - Connect your own domain
💻 **Code Examples** - API integration guides
📊 **Analytics** - Track performance metrics
💡 **Project Ideas** - Inspiration for your next build
🔧 **Troubleshooting** - Solve technical issues

What would you like to know more about?`;
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      deploy: "How do I deploy my project to production?",
      code: "Can you show me code examples for the API?",
      ideas: "What are some popular AI app ideas?",
      api: "Help me understand the API authentication"
    };

    handleSendMessage(actionMessages[action]);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-full shadow-2xl shadow-cyan-500/50 flex items-center justify-center z-50 transition-all group"
          >
            <MessageCircle className="text-white" size={28} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '600px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 w-96 bg-[#1a1f2e] border-2 border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/20 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold flex items-center gap-2">
                    Aigo AI Assistant
                    <Sparkles size={14} className="text-yellow-300" />
                  </h3>
                  <p className="text-cyan-100 text-xs">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
                >
                  {isMinimized ? (
                    <Maximize2 className="text-white" size={16} />
                  ) : (
                    <Minimize2 className="text-white" size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
                >
                  <X className="text-white" size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1420]">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                          : 'bg-slate-800 text-slate-100'
                      } rounded-2xl px-4 py-3 shadow-lg`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-60">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-800 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                  <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-800">
                    <p className="text-xs text-slate-400 mb-2 font-semibold">Quick Actions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.action}
                            onClick={() => handleQuickAction(action.action)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition text-xs"
                          >
                            <Icon size={14} />
                            <span>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-[#1a1f2e] border-t-2 border-slate-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                      disabled={isTyping}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!message.trim() || isTyping}
                      className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 rounded-xl flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                    >
                      <Send className="text-white" size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Powered by AI • Always learning
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AigoBotPopup;