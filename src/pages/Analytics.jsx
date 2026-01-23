import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Eye,
  Download,
  Star,
  Calendar,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    totalViews: 0,
    totalDownloads: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalProjects: 0,
    publicProjects: 0,
    viewsChange: 0,
    downloadsChange: 0,
    revenueChange: 0,
    ratingChange: 0
  });
  const [viewsData, setViewsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch analytics from backend
      const response = await axios.get(`${API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        params: { timeRange }
      });

      if (response.data.success) {
        const {
          overview,
          views_timeline,
          revenue_timeline,
          category_distribution,
          top_projects,
          performance_metrics
        } = response.data;

        setStats({
          totalViews: overview.total_views || 0,
          totalDownloads: overview.total_downloads || 0,
          totalRevenue: overview.total_revenue || 0,
          averageRating: overview.average_rating || 0,
          totalProjects: overview.total_projects || 0,
          publicProjects: overview.public_projects || 0,
          viewsChange: overview.views_change || 0,
          downloadsChange: overview.downloads_change || 0,
          revenueChange: overview.revenue_change || 0,
          ratingChange: overview.rating_change || 0
        });

        setViewsData(views_timeline || []);
        setRevenueData(revenue_timeline || []);
        setCategoryData(category_distribution || []);
        setTopProjects(top_projects || []);
        setPerformanceData(performance_metrics || []);
      }

    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  const StatCard = ({ label, value, icon: Icon, color, change }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`text-${color}-400`} size={24} />
        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
          change >= 0 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {change >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    Analytics Dashboard
                  </h1>
                  <p className="text-slate-400 text-lg">
                    Track your project performance and insights
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-slate-400" size={20} />
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                  <button
                    onClick={loadAnalytics}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                    title="Refresh"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Views"
                  value={stats.totalViews.toLocaleString()}
                  icon={Eye}
                  color="cyan"
                  change={stats.viewsChange}
                />
                <StatCard
                  label="Downloads"
                  value={stats.totalDownloads.toLocaleString()}
                  icon={Download}
                  color="purple"
                  change={stats.downloadsChange}
                />
                <StatCard
                  label="Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  color="green"
                  change={stats.revenueChange}
                />
                <StatCard
                  label="Avg Rating"
                  value={stats.averageRating.toFixed(1)}
                  icon={Star}
                  color="yellow"
                  change={stats.ratingChange}
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views & Downloads Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-cyan-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Views & Downloads</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Legend wrapperStyle={{ color: '#94a3b8' }} />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#06b6d4" 
                        strokeWidth={2}
                        dot={{ fill: '#06b6d4', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="downloads" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Revenue Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-green-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Revenue Trend</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155', 
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#10b981" 
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="text-purple-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Projects by Category</h2>
                  </div>
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #334155', 
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-slate-500">No category data available</p>
                    </div>
                  )}
                </motion.div>

                {/* Top Projects */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="text-yellow-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Top Performing Projects</h2>
                  </div>
                  <div className="space-y-3">
                    {topProjects.length > 0 ? (
                      topProjects.map((project, index) => (
                        <div 
                          key={project.id} 
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{project.name}</div>
                              <div className="text-xs text-slate-400">{project.views || 0} views</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-semibold">${project.revenue || 0}</div>
                            <div className="text-xs text-slate-400">{project.downloads || 0} downloads</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        No projects data available
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Performance Metrics */}
              {performanceData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-cyan-400" size={20} />
                    <h2 className="text-xl font-bold text-white">Performance Metrics</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {performanceData.map((metric, index) => (
                      <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        {metric.trend && (
                          <div className={`text-xs flex items-center gap-1 mt-1 ${
                            metric.trend >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {metric.trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            {Math.abs(metric.trend)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Summary Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Project Overview</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Projects</span>
                      <span className="text-white font-bold">{stats.totalProjects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Public Projects</span>
                      <span className="text-white font-bold">{stats.publicProjects}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Average Rating</span>
                      <span className="text-yellow-400 font-bold flex items-center gap-1">
                        <Star size={16} fill="currentColor" />
                        {stats.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Engagement Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Views</span>
                      <span className="text-white font-bold">{stats.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Downloads</span>
                      <span className="text-white font-bold">{stats.totalDownloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Conversion Rate</span>
                      <span className="text-green-400 font-bold">
                        {stats.totalViews > 0 
                          ? ((stats.totalDownloads / stats.totalViews) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}