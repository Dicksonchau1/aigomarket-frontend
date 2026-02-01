import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Upload, 
  Cpu, 
  Wallet, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Database,
  Zap,
  Smartphone,
  TrendingUp,
  HelpCircle,
  Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch token balance from Supabase
  useEffect(() => {
    if (user?.id) {
      fetchTokenBalance();
      
      // ✅ Set up real-time subscription for token updates
      const channel = supabase
        .channel('token-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔄 Token balance updated:', payload.new.tokens);
            setTokens(payload.new.tokens || 0);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchTokenBalance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('tokens, subscription_tier')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching tokens:', error);
        throw error;
      }

      setTokens(data?.tokens || 0);
    } catch (error) {
      console.error('❌ Error fetching token balance:', error);
      toast.error('Failed to load token balance');
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      icon: ShoppingBag, 
      label: 'Marketplace', 
      badge: 'Hot', 
      path: '/marketplace' 
    },
    { 
      icon: Upload, 
      label: 'Upload Projects', 
      path: '/upload-product' 
    },
    { 
      icon: Cpu,
      label: 'Training & Seed',
      submenu: [
        { icon: Database, label: 'Training Queue', path: '/training-queue' },
        { icon: Zap, label: 'Compression', path: '/seed-ai' },
        { icon: Smartphone, label: 'Mobile Export', path: '/mobile-export' }
      ]
    },
    { 
      icon: TrendingUp, 
      label: 'Analytics', 
      path: '/analytics' 
    },
    { 
      icon: Wallet, 
      label: 'Wallet', 
      path: '/wallet',
      badge: tokens > 0 ? tokens.toLocaleString() : null
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings' 
    },
    { 
      icon: HelpCircle, 
      label: 'Support', 
      path: '/support' 
    }
  ];

  const isActive = (path) => location.pathname === path;
  const isParentActive = (submenu) => submenu?.some(item => location.pathname === item.path);

  return (
    <div className="w-64 bg-[#1a1f2e] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* User Profile Section */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-slate-400 text-xs font-medium">Free Tier</p>
          </div>
        </div>
      </div>

      {/* Available Tokens Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4 shadow-lg hover:shadow-yellow-500/20 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Available Tokens
            </p>
            <Coins className="text-yellow-400" size={18} />
          </div>
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-sm">Loading...</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-white">
                {tokens.toLocaleString()}
              </p>
              <span className="text-slate-400 text-sm font-medium">AIGO</span>
            </div>
          )}
          <button
            onClick={() => navigate('/wallet')}
            className="mt-3 w-full py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-900 text-xs font-bold rounded-lg transition-all transform hover:scale-105"
          >
            + Add Tokens
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus[item.label];
          const active = isActive(item.path) || isParentActive(item.submenu);

          return (
            <div key={index} className="mb-1">
              {hasSubmenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10' 
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={active ? 'text-cyan-400' : ''} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-3">
                      {item.submenu.map((subItem, subIndex) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive(subItem.path)
                                ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                            }`}
                          >
                            <SubIcon size={18} />
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    active 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10' 
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-cyan-400' : ''} />
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                  {item.badge && typeof item.badge === 'string' && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && typeof item.badge === 'number' && (
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 font-semibold hover:scale-105 transform"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* AIGO Logo & Copyright */}
      <div className="p-4 text-center border-t border-slate-800 bg-slate-900/30">
        <div className="inline-block animate-float">
          <img 
            src="/logo.png" 
            alt="AIGO" 
            className="w-14 h-14 mx-auto rounded-2xl shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-shadow"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-3 font-medium">
          © {new Date().getFullYear()} AIGO
        </p>
        <p className="text-[10px] text-slate-600 mt-1">
          v1.2.0
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-8px) rotate(2deg); 
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}