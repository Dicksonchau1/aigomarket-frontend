import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import {
  Upload,
  Brain,
  TrendingUp,
  Store,
  Rocket,
  Plus,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Globe,
  ChevronDown,
  ChevronRight,
  Square,
  CheckSquare,
  Code,
  Server,
  Trash2,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTrainings: 0,
    deployments: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);

  // Backend & Frontend Task Lists
  const backendTasks = [
    { id: 'api', label: 'API Endpoints Setup', description: 'Configure REST API endpoints' },
    { id: 'database', label: 'Database Connection', description: 'Connect to Supabase/PostgreSQL' },
    { id: 'auth', label: 'Authentication', description: 'Implement user authentication' },
    { id: 'middleware', label: 'Middleware Setup', description: 'Configure CORS and security' },
    { id: 'deployment', label: 'Backend Deployment', description: 'Deploy to production server' }
  ];

  const frontendTasks = [
    { id: 'ui', label: 'UI Components', description: 'Build React components' },
    { id: 'routing', label: 'Routing Setup', description: 'Configure React Router' },
    { id: 'state', label: 'State Management', description: 'Setup Context/Redux' },
    { id: 'api-integration', label: 'API Integration', description: 'Connect to backend APIs' },
    { id: 'deployment', label: 'Frontend Deployment', description: 'Deploy to Vercel/Netlify' }
  ];

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (projectsError) throw projectsError;

      setRecentProjects(projects || []);
      setStats({
        totalProjects: projects?.length || 0,
        activeTrainings: projects?.filter(p => p.status === 'training').length || 0,
        deployments: projects?.filter(p => p.status === 'deployed').length || 0
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      toast.loading('Deleting project...', { id: 'delete' });

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id); // Security check

      if (error) throw error;

      toast.success('Project deleted successfully', { id: 'delete' });
      loadDashboardData(); // Reload projects
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project', { id: 'delete' });
    }
  };

  const toggleTaskCompletion = async (projectId, taskType, taskId) => {
    try {
      const project = recentProjects.find(p => p.id === projectId);
      const currentTasks = project[`${taskType}_tasks`] || {};
      const updatedTasks = {
        ...currentTasks,
        [taskId]: !currentTasks[taskId]
      };

      const { error } = await supabase
        .from('projects')
        .update({ [`${taskType}_tasks`]: updatedTasks })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      setRecentProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, [`${taskType}_tasks`]: updatedTasks }
          : p
      ));

      // Check if all tasks are completed for auto-pairing
      checkAutoPairing(projectId, taskType, updatedTasks);

    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const checkAutoPairing = async (projectId, taskType, tasks) => {
    const allTasksCompleted = Object.keys(tasks).length === 5 && Object.values(tasks).every(v => v === true);
    
    if (allTasksCompleted) {
      const { error } = await supabase
        .from('projects')
        .update({ [`${taskType}_paired`]: true })
        .eq('id', projectId);

      if (!error) {
        toast.success(`${taskType.charAt(0).toUpperCase() + taskType.slice(1)} auto-paired successfully! 🎉`);
        loadDashboardData();
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'active':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'training':
      case 'pending':
      case 'pending_verification':
        return <Clock className="text-yellow-400" size={20} />;
      case 'failed':
      case 'rejected':
        return <AlertCircle className="text-red-400" size={20} />;
      default:
        return <Clock className="text-yellow-400" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'active':
        return 'text-green-400';
      case 'training':
      case 'pending':
      case 'pending_verification':
        return 'text-yellow-400';
      case 'failed':
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getPerformanceScore = (project) => {
    const backendComplete = Object.values(project.backend_tasks || {}).filter(v => v).length;
    const frontendComplete = Object.values(project.frontend_tasks || {}).filter(v => v).length;
    const totalComplete = backendComplete + frontendComplete;
    const score = Math.floor((totalComplete / 10) * 100);
    return score;
  };

  const getTaskProgress = (tasks) => {
    if (!tasks || Object.keys(tasks).length === 0) return 0;
    const completed = Object.values(tasks).filter(v => v === true).length;
    const total = 5;
    return Math.floor((completed / total) * 100);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="text-cyan-400" size={32} />
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}!
                </h1>
              </div>
              <p className="text-slate-300 text-lg">
                Manage your AI projects, track development progress, and deploy to production
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Upload className="text-cyan-400" size={24} />
                  <span className="text-sm px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400">
                    Active
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stats.totalProjects}</div>
                <div className="text-slate-400">Total Projects</div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Brain className="text-purple-400" size={24} />
                  <span className="text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                    Running
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stats.activeTrainings}</div>
                <div className="text-slate-400">Active Trainings</div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Rocket className="text-green-400" size={24} />
                  <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                    Live
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stats.deployments}</div>
                <div className="text-slate-400">Deployments</div>
              </div>
            </div>

            {/* Recent Projects - NO +NEW BUTTON */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Current Projects</h2>
              </div>

              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => {
                    const performanceScore = getPerformanceScore(project);
                    const isExpanded = expandedProject === project.id;
                    const backendProgress = getTaskProgress(project.backend_tasks);
                    const frontendProgress = getTaskProgress(project.frontend_tasks);
                    const status = project.verification_status || project.status || 'pending';
                    const isRejected = status === 'rejected';
                    
                    return (
                      <div
                        key={project.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                              {getStatusIcon(status)}
                              <span className={`text-sm capitalize ${getStatusColor(status)}`}>
                                {status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                              {project.description || 'No description provided'}
                            </p>
                          </div>

                          {/* DELETE BUTTON - Only for rejected projects */}
                          {isRejected && (
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="ml-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition flex items-center gap-2 font-semibold"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>

                        {/* Performance Score & Metrics */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="text-cyan-400" size={16} />
                              <span className="text-xs text-slate-400">Progress</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{performanceScore}%</div>
                          </div>

                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Globe className="text-purple-400" size={16} />
                              <span className="text-xs text-slate-400">Domain</span>
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {project.domain ? '✓ Linked' : 'Not Linked'}
                            </div>
                          </div>

                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Server className="text-green-400" size={16} />
                              <span className="text-xs text-slate-400">Backend</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-green-400">
                                {project.backend_paired ? '✓ Paired' : `${backendProgress}%`}
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Code className="text-blue-400" size={16} />
                              <span className="text-xs text-slate-400">Frontend</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold text-blue-400">
                                {project.frontend_paired ? '✓ Paired' : `${frontendProgress}%`}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Task Lists */}
                        <div className="space-y-3">
                          {/* Backend Tasks */}
                          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
                            <button
                              onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <Server className="text-green-400" size={20} />
                                <span className="text-white font-semibold">Backend Development</span>
                                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                                    style={{ width: `${backendProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400">{backendProgress}%</span>
                              </div>
                              {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-2">
                                {backendTasks.map(task => {
                                  const isCompleted = project.backend_tasks?.[task.id] || false;
                                  return (
                                    <div
                                      key={task.id}
                                      onClick={() => toggleTaskCompletion(project.id, 'backend', task.id)}
                                      className="flex items-start gap-3 p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg cursor-pointer transition group"
                                    >
                                      {isCompleted ? (
                                        <CheckSquare size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                                      ) : (
                                        <Square size={20} className="text-slate-600 group-hover:text-slate-400 mt-0.5 flex-shrink-0" />
                                      )}
                                      <div className="flex-1">
                                        <p className={`font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                                          {task.label}
                                        </p>
                                        <p className="text-xs text-slate-500">{task.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Frontend Tasks */}
                          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
                            <button
                              onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <Code className="text-blue-400" size={20} />
                                <span className="text-white font-semibold">Frontend Development</span>
                                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                                    style={{ width: `${frontendProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400">{frontendProgress}%</span>
                              </div>
                              {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 space-y-2">
                                {frontendTasks.map(task => {
                                  const isCompleted = project.frontend_tasks?.[task.id] || false;
                                  return (
                                    <div
                                      key={task.id}
                                      onClick={() => toggleTaskCompletion(project.id, 'frontend', task.id)}
                                      className="flex items-start gap-3 p-3 bg-slate-900/50 hover:bg-slate-900 rounded-lg cursor-pointer transition group"
                                    >
                                      {isCompleted ? (
                                        <CheckSquare size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                      ) : (
                                        <Square size={20} className="text-slate-600 group-hover:text-slate-400 mt-0.5 flex-shrink-0" />
                                      )}
                                      <div className="flex-1">
                                        <p className={`font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                                          {task.label}
                                        </p>
                                        <p className="text-xs text-slate-500">{task.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Domain Status */}
                        {project.domain && (
                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <Globe className="text-cyan-400" size={16} />
                            <span className="text-slate-400">Deployed at:</span>
                            <a 
                              href={`https://${project.domain}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline font-semibold"
                            >
                              {project.domain}
                            </a>
                            <CheckCircle className="text-green-400" size={16} />
                          </div>
                        )}

                        {/* View Details Button */}
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <button
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition flex items-center justify-center gap-2"
                          >
                            <Eye size={16} />
                            View Full Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-12 text-center">
                  <Upload className="mx-auto mb-4 text-slate-600" size={48} />
                  <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
                  <p className="text-slate-400 mb-6">Get started by creating your first AI project</p>
                  <button
                    onClick={() => navigate('/upload-product')}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Create Your First Project
                  </button>
                </div>
              )}
            </div>

            {/* Explore Marketplace */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="text-yellow-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">70% Creator Commission!</h2>
                  </div>
                  <p className="text-slate-300 mb-4">
                    Sell AI models, datasets & algorithms. Earn 70% commission + best seller bonuses!
                  </p>
                </div>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Explore Marketplace
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}