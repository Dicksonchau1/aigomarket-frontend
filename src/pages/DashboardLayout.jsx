import React from 'react';
import { Outlet, NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Cpu, 
  Shield, 
  Wallet, 
  Settings, 
  Globe, 
  Zap, 
  Sparkles,
  Upload,
  LogOut,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Custom NavLink Component
const NavLink = ({ to, icon, children, active }) => (
  <RouterNavLink
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active
        ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    {icon}
    <span>{children}</span>
  </RouterNavLink>
);

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            AIGO
          </h1>
          <p className="text-xs text-slate-500 mt-1">AI-Powered Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} active={isActive('/dashboard')}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/marketplace" icon={<ShoppingBag size={18} />} active={isActive('/dashboard/marketplace')}>
            Marketplace
          </NavLink>
          <NavLink to="/dashboard/architect" icon={<Cpu size={18} />} active={isActive('/dashboard/architect')}>
            Architect
          </NavLink>
          <NavLink to="/dashboard/upload" icon={<Upload size={18} />} active={isActive('/dashboard/upload')}>
            Upload Product
          </NavLink>
          <NavLink to="/dashboard/verification-guard" icon={<Shield size={18} />} active={isActive('/dashboard/verification-guard')}>
            Verification Guard
          </NavLink>
          <NavLink to="/dashboard/seed-ai" icon={<Sparkles size={18} />} active={isActive('/dashboard/seed-ai')}>
            Seed AI
          </NavLink>
          <NavLink to="/dashboard/one-click" icon={<Zap size={18} />} active={isActive('/dashboard/one-click')}>
            One-Click Deploy
          </NavLink>
          <NavLink to="/dashboard/domains" icon={<Globe size={18} />} active={isActive('/dashboard/domains')}>
            Domains
          </NavLink>
          <NavLink to="/dashboard/wallet" icon={<Wallet size={18} />} active={isActive('/dashboard/wallet')}>
            Wallet
          </NavLink>
          <NavLink to="/dashboard/settings" icon={<Settings size={18} />} active={isActive('/dashboard/settings')}>
            Settings
          </NavLink>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <NavLink to="/docs" icon={<FileText size={18} />} active={isActive('/docs')}>
              API Docs
            </NavLink>
          </div>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}