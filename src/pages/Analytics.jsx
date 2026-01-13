import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Users, DollarSign, BarChart3 } from 'lucide-react';
import { database } from '../services/database';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    totalModels: 0,
    totalDatasets: 0,
    tokensUsed: 0,
    tokensEarned: 0,
    modelAccuracy: 0,
    projectsGrowth: 0,
    modelsGrowth: 0
  });

  const [chartData, setChartData] = useState({
    projectsOverTime: [],
    modelsOverTime: [],
    tokenUsage: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [projects, models, datasets, transactions] = await Promise.all([
        database.projects.getAll(),
        database.models.getAll(),
        database.datasets.getAll(),
        database.wallet.getTransactions()
      ]);

      // Calculate date threshold
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - parseInt(timeRange));

      // Filter by time range
      const recentProjects = projects.filter(p => new Date(p.created_at) > threshold);
      const recentModels = models.filter(m => new Date(m.created_at) > threshold);
      const recentTransactions = transactions.filter(t => new Date(t.created_at) > threshold);

      // Calculate tokens
      const tokensUsed = recentTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const tokensEarned = recentTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate average model accuracy
      const avgAccuracy = models.length > 0
        ? models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length
        : 0;

      // Calculate growth (compare with previous period)
      const previousThreshold = new Date(threshold);
      previousThreshold.setDate(previousThreshold.getDate() - parseInt(timeRange));
      
      const previousProjects = projects.filter(
        p => new Date(p.created_at) > previousThreshold && new Date(p.created_at) <= threshold
      );
      const previousModels = models.filter(
        p => new Date(p.created_at) > previousThreshold && new Date(p.created_at) <= threshold
      );

      const projectsGrowth = previousProjects.length > 0
        ? ((recentProjects.length - previousProjects.length) / previousProjects.length) * 100
        : 0;
      
      const modelsGrowth = previousModels.length > 0
        ? ((recentModels.length - previousModels.length) / previousModels.length) * 100
        : 0;

      setAnalytics({
        totalProjects: projects.length,
        totalModels: models.length,
        totalDatasets: datasets.length,
        tokensUsed,
        tokensEarned,
        modelAccuracy: avgAccuracy,
        projectsGrowth,
        modelsGrowth
      });

      // Generate chart data (simplified - group by week)
      const projectsByWeek = generateTimeSeriesData(recentProjects, parseInt(timeRange));
      const modelsByWeek = generateTimeSeriesData(recentModels, parseInt(timeRange));
      
      setChartData({
        projectsOverTime: projectsByWeek,
        modelsOverTime: modelsByWeek,
        tokenUsage: generateTokenUsageData(recentTransactions, parseInt(timeRange))
      });

    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = (items, days) => {
    const data = [];
    const now = new Date();
    const buckets = days > 30 ? 4 : days; // weeks or days
    
    for (let i = 0; i < buckets; i++) {
      const end = new Date(now);
      end.setDate(now.getDate() - (i * Math.floor(days / buckets)));
      const start = new Date(end);
      start.setDate(end.getDate() - Math.floor(days / buckets));
      
      const count = items.filter(item => {
        const date = new Date(item.created_at);
        return date >= start && date < end;
      }).length;
      
      data.unshift({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count
      });
    }
    
    return data;
  };

  const generateTokenUsageData = (transactions, days) => {
    const data = [];
    const now = new Date();
    const buckets = Math.min(days, 7);
    
    for (let i = 0; i < buckets; i++) {
      const end = new Date(now);
      end.setDate(now.getDate() - i);
      const start = new Date(end);
      start.setDate(end.getDate() - 1);
      
      const used = transactions
        .filter(t => t.type === 'debit' && new Date(t.created_at) >= start && new Date(t.created_at) < end)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const earned = transactions
        .filter(t => t.type === 'credit' && new Date(t.created_at) >= start && new Date(t.created_at) < end)
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.unshift({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        used,
        earned
      });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Projects */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            {analytics.projectsGrowth !== 0 && (
              <span className={`text-sm font-medium ${analytics.projectsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.projectsGrowth > 0 ? '+' : ''}{analytics.projectsGrowth.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics.totalProjects}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>

        {/* Total Models */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            {analytics.modelsGrowth !== 0 && (
              <span className={`text-sm font-medium ${analytics.modelsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.modelsGrowth > 0 ? '+' : ''}{analytics.modelsGrowth.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics.totalModels}</div>
          <div className="text-sm text-gray-600">Models Trained</div>
        </div>

        {/* Tokens Used */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics.tokensUsed}</div>
          <div className="text-sm text-gray-600">Tokens Used</div>
        </div>

        {/* Tokens Earned */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics.tokensEarned}</div>
          <div className="text-sm text-gray-600">Tokens Earned</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Projects Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Projects Over Time</h3>
          <div className="h-64">
            <SimpleBarChart data={chartData.projectsOverTime} color="#3B82F6" />
          </div>
        </div>

        {/* Models Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Models Over Time</h3>
          <div className="h-64">
            <SimpleBarChart data={chartData.modelsOverTime} color="#10B981" />
          </div>
        </div>
      </div>

      {/* Token Usage Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Token Usage</h3>
        <div className="h-64">
          <TokenUsageChart data={chartData.tokenUsage} />
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <h3 className="text-lg font-semibold mb-4">Average Model Accuracy</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${analytics.modelAccuracy}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {analytics.modelAccuracy.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Simple Bar Chart Component
function SimpleBarChart({ data, color }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end justify-between h-full gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
            <div
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: color,
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: item.value > 0 ? '4px' : '0px'
              }}
            />
          </div>
          <div className="text-xs text-gray-600 text-center">{item.label}</div>
          <div className="text-xs font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// Token Usage Chart Component
function TokenUsageChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-400">No data available</div>;
  }

  const maxValue = Math.max(...data.flatMap(d => [d.used, d.earned]), 1);

  return (
    <div className="flex items-end justify-between h-full gap-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex gap-1 items-end" style={{ height: '200px' }}>
            <div className="flex-1 flex flex-col justify-end">
              <div
                className="w-full bg-red-500 rounded-t transition-all duration-300"
                style={{
                  height: `${(item.used / maxValue) * 100}%`,
                  minHeight: item.used > 0 ? '4px' : '0px'
                }}
                title={`Used: ${item.used}`}
              />
            </div>
            <div className="flex-1 flex flex-col justify-end">
              <div
                className="w-full bg-green-500 rounded-t transition-all duration-300"
                style={{
                  height: `${(item.earned / maxValue) * 100}%`,
                  minHeight: item.earned > 0 ? '4px' : '0px'
                }}
                title={`Earned: ${item.earned}`}
              />
            </div>
          </div>
          <div className="text-xs text-gray-600 text-center">{item.label}</div>
        </div>
      ))}
      <div className="flex gap-4 text-xs mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span>Used</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Earned</span>
        </div>
      </div>
    </div>
  );
}

export default Analytics;