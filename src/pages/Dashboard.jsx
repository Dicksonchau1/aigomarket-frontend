import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FolderOpen, Database, Cpu, Wallet, CheckCircle, Activity, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    datasets: 0,
    trainingJobs: 0,
    balance: 0
  });

  const [checklist, setChecklist] = useState([
    { id: 'backend', label: 'Backend Connected', checked: false },
    { id: 'apikey', label: 'API Key Valid', checked: false },
    { id: 'database', label: 'Database Linked', checked: false },
    { id: 'auth', label: 'Auth Configured', checked: false },
    { id: 'webhooks', label: 'Webhooks Active', checked: false },
    { id: 'storage', label: 'Storage Ready', checked: false }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simulate loading
    setStats({
      projects: 0,
      datasets: 0,
      trainingJobs: 0,
      balance: 0
    });
  };

  const completedCount = checklist.filter(item => item.checked).length;

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-8">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Founder's Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.email?.split('@')[0] || 'Founder'}</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/upload')}
          className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-100 transition flex items-center gap-2"
        >
          <Plus size={20} /> New Project
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Projects */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <FolderOpen size={24} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">PROJECTS</p>
              <p className="text-3xl font-black text-white">--</p>
            </div>
          </div>
        </div>

        {/* Datasets */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Database size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">DATASETS</p>
              <p className="text-3xl font-black text-white">--</p>
            </div>
          </div>
        </div>

        {/* Training Jobs */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Cpu size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">TRAINING JOBS</p>
              <p className="text-3xl font-black text-white">--</p>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Wallet size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">WALLET BALANCE</p>
              <p className="text-3xl font-black text-white">$0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Projects */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Projects</h2>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
              View All →
            </button>
          </div>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FolderOpen size={40} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No projects yet</h3>
            <button 
              onClick={() => navigate('/dashboard/architect')}
              className="mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition"
            >
              Create Your First Project
            </button>
          </div>
        </div>

        {/* Training Queue */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Cpu size={24} className="text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Training Queue</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
              <Activity size={16} />
              System Healthy
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Cpu size={40} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No training jobs yet</h3>
            <button className="mt-4 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition">
              View All Jobs →
            </button>
          </div>
        </div>
      </div>

      {/* MVP Deployment Checklist */}
      <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">MVP Deployment Checklist</h2>
          <p className="text-slate-400 text-sm mb-4">
            <span className="text-white font-bold">{completedCount}/6 detected</span>
          </p>
          <p className="text-slate-500 text-sm">
            Enter your infrastructure details below. The system will auto-detect and validate your configuration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                item.checked
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                item.checked ? 'bg-emerald-500' : 'bg-slate-700'
              }`}>
                {item.checked && <CheckCircle size={16} className="text-white" />}
              </div>
              <span className={`text-sm font-semibold ${
                item.checked ? 'text-emerald-400' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}