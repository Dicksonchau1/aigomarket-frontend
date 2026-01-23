import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Play, 
  Pause, 
  Trash2, 
  Clock, 
  Zap, 
  Database,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Brain,
  Copy,
  Save,
  Coins,
  TrendingUp,
  Settings,
  Filter,
  ArrowUpDown,
  FileText,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TrainingQueue() {
  const [jobs, setJobs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [tokenStats, setTokenStats] = useState({
    total_spent: 0,
    total_allocated: 0,
    total_remaining: 0
  });
  
  const [newJob, setNewJob] = useState({
    dataset_id: '',
    model_name: '',
    architecture: 'transformer',
    epochs: 10,
    batch_size: 32,
    learning_rate: 0.001,
    max_tokens: 10000,
    priority: 'normal',
    template_id: null
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    architecture: 'transformer',
    config: {
      epochs: 10,
      batch_size: 32,
      learning_rate: 0.001,
      optimizer: 'adam',
      warmup_steps: 1000
    }
  });

  useEffect(() => {
    fetchJobs();
    fetchDatasets();
    fetchTemplates();
    fetchTokenStats();
    
    // Subscribe to real-time updates
    const jobsChannel = supabase
      .channel('training_jobs_queue')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'training_jobs' },
        () => {
          fetchJobs();
          fetchTokenStats();
        }
      )
      .subscribe();

    const templatesChannel = supabase
      .channel('training_templates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'training_templates' },
        () => fetchTemplates()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(templatesChannel);
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setJobs([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('training_jobs')
        .select(`
          *,
          datasets (name, size, format),
          training_templates (name)
        `)
        .eq('user_id', user.id)
        .order(sortBy, { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]); // Set empty array instead of throwing
      } else {
        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ready');

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('training_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchTokenStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('training_jobs')
        .select('tokens_spent, max_tokens, status')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        total_spent: data.reduce((sum, job) => sum + (job.tokens_spent || 0), 0),
        total_allocated: data.reduce((sum, job) => sum + (job.max_tokens || 0), 0),
        total_remaining: data
          .filter(job => ['queued', 'running'].includes(job.status))
          .reduce((sum, job) => sum + ((job.max_tokens || 0) - (job.tokens_spent || 0)), 0)
      };

      setTokenStats(stats);
    } catch (error) {
      console.error('Error fetching token stats:', error);
    }
  };

  const createJob = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Validate token allocation
      if (newJob.max_tokens < 1000) {
        toast.error('Minimum token allocation is 1,000');
        return;
      }

      // Get user's wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!wallet || wallet.balance < newJob.max_tokens) {
        toast.error('Insufficient token balance');
        return;
      }

      const { error } = await supabase
        .from('training_jobs')
        .insert({
          user_id: user.id,
          dataset_id: newJob.dataset_id,
          model_name: newJob.model_name,
          architecture: newJob.architecture,
          template_id: newJob.template_id,
          config: {
            epochs: newJob.epochs,
            batch_size: newJob.batch_size,
            learning_rate: newJob.learning_rate
          },
          status: 'queued',
          priority: newJob.priority,
          progress: 0,
          max_tokens: newJob.max_tokens,
          tokens_spent: 0,
          queued_at: new Date().toISOString()
        });

      if (error) throw error;

      setShowNewJobModal(false);
      resetNewJobForm();
      toast.success('Training job created and queued!');
      fetchJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create training job');
    }
  };

  const createTemplate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('training_templates')
        .insert({
          user_id: user.id,
          name: newTemplate.name,
          description: newTemplate.description,
          architecture: newTemplate.architecture,
          config: newTemplate.config,
          is_public: false
        });

      if (error) throw error;

      setShowTemplateModal(false);
      resetTemplateForm();
      toast.success('Template created successfully!');
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const applyTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setNewJob({
      ...newJob,
      template_id: templateId,
      architecture: template.architecture,
      epochs: template.config.epochs,
      batch_size: template.config.batch_size,
      learning_rate: template.config.learning_rate
    });

    toast.success(`Template "${template.name}" applied!`);
  };

  const updateJobPriority = async (jobId, priority) => {
    try {
      const { error } = await supabase
        .from('training_jobs')
        .update({ priority })
        .eq('id', jobId);

      if (error) throw error;
      toast.success('Priority updated');
      fetchJobs();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const pauseJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('training_jobs')
        .update({ 
          status: 'paused',
          paused_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;
      toast.success('Job paused');
      fetchJobs();
    } catch (error) {
      console.error('Error pausing job:', error);
      toast.error('Failed to pause job');
    }
  };

  const resumeJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('training_jobs')
        .update({ 
          status: 'queued',
          paused_at: null
        })
        .eq('id', jobId);

      if (error) throw error;
      toast.success('Job resumed');
      fetchJobs();
    } catch (error) {
      console.error('Error resuming job:', error);
      toast.error('Failed to resume job');
    }
  };

  const cancelJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('training_jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (error) throw error;
      toast.success('Job cancelled');
      fetchJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast.error('Failed to cancel job');
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('training_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      toast.success('Job deleted');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const resetNewJobForm = () => {
    setNewJob({
      dataset_id: '',
      model_name: '',
      architecture: 'transformer',
      epochs: 10,
      batch_size: 32,
      learning_rate: 0.001,
      max_tokens: 10000,
      priority: 'normal',
      template_id: null
    });
  };

  const resetTemplateForm = () => {
    setNewTemplate({
      name: '',
      description: '',
      architecture: 'transformer',
      config: {
        epochs: 10,
        batch_size: 32,
        learning_rate: 0.001,
        optimizer: 'adam',
        warmup_steps: 1000
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-orange-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-slate-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'running':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paused':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'normal':
        return 'text-blue-400';
      case 'low':
        return 'text-slate-400';
      default:
        return 'text-slate-400';
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['queued', 'running'].includes(job.status);
    return job.status === filter;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0f1420] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Loading training queue...</p>
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
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Brain className="w-10 h-10 text-cyan-400" />
                  Training Queue
                </h1>
                <p className="text-slate-400 text-lg">Monitor and manage your training pipeline</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700"
                >
                  <FileText className="w-5 h-5" />
                  Templates
                </button>
                <button
                  onClick={() => setShowNewJobModal(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  New Training Job
                </button>
              </div>
            </div>
          </motion.div>

          {/* Token Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <Coins className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Tokens Spent</p>
                  <p className="text-3xl font-bold text-white">{tokenStats.total_spent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Allocated</p>
                  <p className="text-3xl font-bold text-white">{tokenStats.total_allocated.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Remaining</p>
                  <p className="text-3xl font-bold text-white">{tokenStats.total_remaining.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Queue Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Queued</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {jobs.filter(j => j.status === 'queued').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Running</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {jobs.filter(j => j.status === 'running').length}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Completed</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {jobs.filter(j => j.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-400 opacity-50" />
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total</p>
                  <p className="text-2xl font-bold text-white">
                    {jobs.length}
                  </p>
                </div>
                <Brain className="w-8 h-8 text-slate-400 opacity-50" />
              </div>
            </div>
          </motion.div>

          {/* Filter & Sort Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Filter className="w-5 h-5 text-slate-400" />
                <span className="text-slate-400 font-medium">Filter:</span>
                {['all', 'active', 'queued', 'running', 'paused', 'completed', 'failed'].map(status => (
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
              
              <div className="flex items-center gap-3">
                <ArrowUpDown className="w-5 h-5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    fetchJobs();
                  }}
                  className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="created_at">Created Date</option>
                  <option value="priority">Priority</option>
                  <option value="progress">Progress</option>
                  <option value="tokens_spent">Tokens Spent</option>
                </select>
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
                  <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No jobs in queue</h3>
                  <p className="text-slate-400 mb-6">
                    {filter === 'all' ? 'Start your first training job' : `No ${filter} jobs at the moment`}
                  </p>
                  <button
                    onClick={() => setShowNewJobModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Create Training Job
                  </button>
                </motion.div>
              ) : (
                filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">{getStatusIcon(job.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{job.model_name}</h3>
                            {job.training_templates && (
                              <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded">
                                {job.training_templates.name}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-2">
                            <span className="font-semibold text-slate-300">
                              {job.architecture.toUpperCase()}
                            </span>
                            {job.datasets && (
                              <span className="flex items-center gap-1">
                                <Database className="w-4 h-4" />
                                {job.datasets.name}
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${getPriorityColor(job.priority)}`}>
                              <TrendingUp className="w-4 h-4" />
                              {job.priority.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span>Epochs: {job.config?.epochs || 'N/A'}</span>
                            <span>Batch: {job.config?.batch_size || 'N/A'}</span>
                            <span>LR: {job.config?.learning_rate || 'N/A'}</span>
                            <span className="flex items-center gap-1 text-cyan-400">
                              <Coins className="w-4 h-4" />
                              {job.tokens_spent?.toLocaleString() || 0} / {job.max_tokens?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg font-semibold text-sm capitalize border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {['running', 'paused'].includes(job.status) && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                          <span>Progress</span>
                          <span className="text-cyan-400">{job.progress?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress || 0}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {job.status === 'running' && (
                        <button
                          onClick={() => pauseJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/30 transition text-sm font-medium"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      )}
                      {job.status === 'paused' && (
                        <button
                          onClick={() => resumeJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm font-medium"
                        >
                          <Play className="w-4 h-4" />
                          Resume
                        </button>
                      )}
                      {['queued', 'running', 'paused'].includes(job.status) && (
                        <button
                          onClick={() => cancelJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-slate-400">Priority:</span>
                        <select
                          value={job.priority}
                          onChange={(e) => updateJobPriority(job.id, e.target.value)}
                          disabled={!['queued', 'running'].includes(job.status)}
                          className="bg-slate-800 border border-slate-700 text-white text-sm px-3 py-1 rounded focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Job Modal */}
      <AnimatePresence>
        {showNewJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewJobModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1f2e] border border-slate-700 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create New Training Job</h2>
              
              <div className="space-y-4">
                {/* Template Selection */}
                {templates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Use Template (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template.id)}
                          className={`p-3 rounded-lg border text-left transition ${
                            newJob.template_id === template.id
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <p className="font-semibold text-white text-sm">{template.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{template.architecture}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={newJob.model_name}
                    onChange={(e) => setNewJob({ ...newJob, model_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="my-awesome-model"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dataset
                  </label>
                  <select
                    value={newJob.dataset_id}
                    onChange={(e) => setNewJob({ ...newJob, dataset_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select a dataset</option>
                    {datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name} - {dataset.size} rows ({dataset.format})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Architecture
                  </label>
                  <select
                    value={newJob.architecture}
                    onChange={(e) => setNewJob({ ...newJob, architecture: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="transformer">Transformer</option>
                    <option value="lstm">LSTM</option>
                    <option value="gpt">GPT</option>
                    <option value="bert">BERT</option>
                    <option value="cnn">CNN</option>
                    <option value="rnn">RNN</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newJob.priority}
                      onChange={(e) => setNewJob({ ...newJob, priority: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={newJob.max_tokens}
                      onChange={(e) => setNewJob({ ...newJob, max_tokens: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      min="1000"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Epochs
                    </label>
                    <input
                      type="number"
                      value={newJob.epochs}
                      onChange={(e) => setNewJob({ ...newJob, epochs: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      value={newJob.batch_size}
                      onChange={(e) => setNewJob({ ...newJob, batch_size: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newJob.learning_rate}
                      onChange={(e) => setNewJob({ ...newJob, learning_rate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowNewJobModal(false);
                    resetNewJobForm();
                  }}
                  className="px-6 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createJob}
                  disabled={!newJob.model_name || !newJob.dataset_id}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  Start Training
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1f2e] border border-slate-700 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Training Template</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="GPT Fine-tuning Config"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    rows="3"
                    placeholder="Optimized settings for GPT model fine-tuning..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Architecture
                  </label>
                  <select
                    value={newTemplate.architecture}
                    onChange={(e) => setNewTemplate({ ...newTemplate, architecture: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="transformer">Transformer</option>
                    <option value="lstm">LSTM</option>
                    <option value="gpt">GPT</option>
                    <option value="bert">BERT</option>
                    <option value="cnn">CNN</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Epochs
                    </label>
                    <input
                      type="number"
                      value={newTemplate.config.epochs}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        config: { ...newTemplate.config, epochs: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      value={newTemplate.config.batch_size}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        config: { ...newTemplate.config, batch_size: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newTemplate.config.learning_rate}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        config: { ...newTemplate.config, learning_rate: parseFloat(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Warmup Steps
                    </label>
                    <input
                      type="number"
                      value={newTemplate.config.warmup_steps}
                      onChange={(e) => setNewTemplate({
                        ...newTemplate,
                        config: { ...newTemplate.config, warmup_steps: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    resetTemplateForm();
                  }}
                  className="px-6 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createTemplate}
                  disabled={!newTemplate.name}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  Save Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}