import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Pause, Clock, AlertCircle, TrendingUp, Filter, Eye, ChevronDown, Play, RotateCcw, Loader2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

function TrainingJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedJob, setExpandedJob] = useState(null);

  // Fetch training jobs from Supabase
  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('training_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      // Transform data to match component structure
      const transformedJobs = data.map(job => ({
        ...job,
        started_at: job.started_at ? new Date(job.started_at) : null,
        completed_at: job.completed_at ? new Date(job.completed_at) : null,
        failed_at: job.failed_at ? new Date(job.failed_at) : null,
        paused_at: job.paused_at ? new Date(job.paused_at) : null,
        queued_at: job.queued_at ? new Date(job.queued_at) : null,
        metrics_history: job.metrics_history || []
      }));
      
      setJobs(transformedJobs);
      setError(null);
    } catch (err) {
      setError('Failed to load training jobs');
      console.error('Fetch error:', err);
      toast.error('Failed to load training jobs');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('training_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'training_jobs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newJob = {
              ...payload.new,
              started_at: payload.new.started_at ? new Date(payload.new.started_at) : null,
              completed_at: payload.new.completed_at ? new Date(payload.new.completed_at) : null,
              failed_at: payload.new.failed_at ? new Date(payload.new.failed_at) : null,
              paused_at: payload.new.paused_at ? new Date(payload.new.paused_at) : null,
              queued_at: payload.new.queued_at ? new Date(payload.new.queued_at) : null,
              metrics_history: payload.new.metrics_history || []
            };
            setJobs(prevJobs => [newJob, ...prevJobs]);
            toast.success('New training job started!');
          } 
          else if (payload.eventType === 'UPDATE') {
            setJobs(prevJobs =>
              prevJobs.map(job =>
                job.id === payload.new.id
                  ? {
                      ...payload.new,
                      started_at: payload.new.started_at ? new Date(payload.new.started_at) : null,
                      completed_at: payload.new.completed_at ? new Date(payload.new.completed_at) : null,
                      failed_at: payload.new.failed_at ? new Date(payload.new.failed_at) : null,
                      paused_at: payload.new.paused_at ? new Date(payload.new.paused_at) : null,
                      queued_at: payload.new.queued_at ? new Date(payload.new.queued_at) : null,
                      metrics_history: payload.new.metrics_history || []
                    }
                  : job
              )
            );
          } 
          else if (payload.eventType === 'DELETE') {
            setJobs(prevJobs => prevJobs.filter(job => job.id !== payload.old.id));
            toast.info('Training job deleted');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'running': 
        return <Activity className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'completed': 
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed': 
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'paused': 
        return <Pause className="w-5 h-5 text-yellow-400" />;
      case 'queued': 
        return <Clock className="w-5 h-5 text-slate-400" />;
      default: 
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'border-blue-500/50 bg-blue-500/5';
      case 'completed': return 'border-emerald-500/50 bg-emerald-500/5';
      case 'failed': return 'border-red-500/50 bg-red-500/5';
      case 'paused': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'queued': return 'border-slate-700 bg-slate-800/30';
      default: return 'border-slate-700 bg-slate-800/30';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'queued': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDuration = (date) => {
    if (!date) return 'N/A';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes < 1) return 'Less than 1 min';
    if (minutes < 60) return `${Math.floor(minutes)} min`;
    return `${Math.floor(minutes / 60)}h ${Math.floor(minutes % 60)}m`;
  };

  // Action handlers
  const handlePauseJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('training_jobs')
        .update({ 
          status: 'paused',
          paused_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast.success('Training job paused');
    } catch (err) {
      console.error('Error pausing job:', err);
      toast.error('Failed to pause job');
    }
  };

  const handleResumeJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('training_jobs')
        .update({ 
          status: 'running',
          paused_at: null
        })
        .eq('id', jobId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast.success('Training job resumed');
    } catch (err) {
      console.error('Error resuming job:', err);
      toast.error('Failed to resume job');
    }
  };

  const handleRetryJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('training_jobs')
        .update({ 
          status: 'queued',
          progress: 0,
          current_epoch: 0,
          error: null,
          failed_at: null,
          queued_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      toast.success('Training job queued for retry');
    } catch (err) {
      console.error('Error retrying job:', err);
      toast.error('Failed to retry job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const stats = {
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    queued: jobs.filter(j => j.status === 'queued').length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1420] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Loading training jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1420] flex items-center justify-center">
          <div className="text-center bg-[#1a1f2e] border border-red-500/30 p-8 rounded-xl">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-cyan-400" />
              Training Jobs
            </h1>
            <p className="text-slate-400 text-lg">Monitor and manage your model training sessions</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Running</p>
                  <p className="text-4xl font-bold text-blue-400">{stats.running}</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-full">
                  <Activity className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Completed</p>
                  <p className="text-4xl font-bold text-emerald-400">{stats.completed}</p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-full">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-red-500/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Failed</p>
                  <p className="text-4xl font-bold text-red-400">{stats.failed}</p>
                </div>
                <div className="bg-red-500/10 p-3 rounded-full">
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-slate-600 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Queued</p>
                  <p className="text-4xl font-bold text-slate-400">{stats.queued}</p>
                </div>
                <div className="bg-slate-500/10 p-3 rounded-full">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400 font-medium">Filter:</span>
              <div className="flex gap-2 flex-wrap">
                {['all', 'running', 'completed', 'failed', 'paused', 'queued'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === status
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Jobs List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredJobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-12 text-center"
                >
                  <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                  <p className="text-slate-400">
                    {filter === 'all' ? 'Start your first training job to see it here' : `No ${filter} jobs at the moment`}
                  </p>
                </motion.div>
              ) : (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-[#1a1f2e] rounded-xl p-6 border-2 ${getStatusColor(job.status)} hover:shadow-xl hover:shadow-cyan-500/10 transition-all`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">{getStatusIcon(job.status)}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{job.name}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-slate-300">Epoch:</span> {job.current_epoch}/{job.total_epochs}
                            </span>
                            {job.loss !== undefined && job.loss !== null && (
                              <span className="flex items-center gap-1">
                                <span className="font-semibold text-slate-300">Loss:</span> 
                                <span className="text-red-400">{job.loss.toFixed(3)}</span>
                              </span>
                            )}
                            {job.accuracy !== undefined && job.accuracy !== null && (
                              <span className="flex items-center gap-1">
                                <span className="font-semibold text-slate-300">Accuracy:</span> 
                                <span className="text-emerald-400">{job.accuracy.toFixed(1)}%</span>
                              </span>
                            )}
                            {job.gpu_usage !== undefined && job.gpu_usage !== null && (
                              <span className="flex items-center gap-1">
                                <span className="font-semibold text-slate-300">GPU:</span> 
                                <span className="text-cyan-400">{job.gpu_usage}%</span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
                            {job.batch_size && <span>Batch: {job.batch_size}</span>}
                            {job.learning_rate && <span>LR: {job.learning_rate}</span>}
                            <span>Started: {formatDuration(job.started_at)}</span>
                            {job.estimated_time_remaining !== undefined && job.status === 'running' && (
                              <span className="text-blue-400 font-medium">
                                ETA: {formatTimeRemaining(job.estimated_time_remaining)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-lg font-semibold text-sm capitalize border ${getStatusBadgeColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {job.status !== 'queued' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                          <span>Training Progress</span>
                          <span className="text-cyan-400">{job.progress?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress || 0}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-3 rounded-full transition-all ${
                              job.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                              job.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              job.status === 'paused' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                              'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {job.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                      >
                        <div className="flex items-start gap-2">
                          <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-red-400 mb-1">Error Details</p>
                            <p className="text-sm text-red-300">{job.error}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Metrics Chart */}
                    {expandedJob === job.id && job.metrics_history && job.metrics_history.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg"
                      >
                        <h4 className="text-sm font-semibold text-white mb-3">Training Metrics</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-2 font-medium">Loss Over Time</p>
                            <ResponsiveContainer width="100%" height={150}>
                              <LineChart data={job.metrics_history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="epoch" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#fff'
                                  }} 
                                />
                                <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-2 font-medium">Accuracy Over Time</p>
                            <ResponsiveContainer width="100%" height={150}>
                              <LineChart data={job.metrics_history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="epoch" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#fff'
                                  }} 
                                />
                                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        {expandedJob === job.id ? 'Hide' : 'View'} Metrics
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedJob === job.id ? 'rotate-180' : ''}`} />
                      </button>
                      {job.status === 'running' && (
                        <button 
                          onClick={() => handlePauseJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 rounded-lg transition font-medium text-sm"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      )}
                      {job.status === 'paused' && (
                        <button 
                          onClick={() => handleResumeJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition font-medium text-sm"
                        >
                          <Play className="w-4 h-4" />
                          Resume
                        </button>
                      )}
                      {job.status === 'failed' && (
                        <button 
                          onClick={() => handleRetryJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition font-medium text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retry
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TrainingJobs;