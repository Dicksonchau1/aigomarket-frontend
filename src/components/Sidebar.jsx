import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

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
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Marketplace', badge: 'Hot', path: '/marketplace' },
    { icon: Upload, label: 'Upload Projects', path: '/upload-product' },
    
    { 
      icon: Cpu,
      label: 'Training & Seed',
      submenu: [
        { icon: Database, label: 'Training Queue', path: '/training-queue' },
        { icon: Zap, label: 'Compression', path: '/seed-ai' },
        { icon: Smartphone, label: 'Mobile Export', path: '/mobile-export' }
      ]
    },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Support', path: '/support' }
  ];

  const isActive = (path) => location.pathname === path;
  const isParentActive = (submenu) => submenu?.some(item => location.pathname === item.path);

  return (
    <div className="w-64 bg-[#1a1f2e] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      {/* User Profile */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-slate-400 text-xs">Free Tier</p>
          </div>
        </div>
      </div>

      {/* Available Tokens */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Available Tokens</p>
          <p className="text-2xl font-black text-white">0</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem, subIndex) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive(subItem.path)
                                ? 'bg-cyan-500/10 text-cyan-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>

      {/* AIGO Logo */}
      <div className="p-4 text-center border-t border-slate-800">
        <div className="inline-block animate-float">
          <img 
            src="/logo.png" 
            alt="AIGO" 
            className="w-16 h-16 mx-auto rounded-2xl shadow-2xl shadow-cyan-500/50"
          />
        </div>
        <p className="text-xs text-slate-500 mt-3">© 2024 AIGO</p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}