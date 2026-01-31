import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import {
  Upload,
  Brain,
  Rocket,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Globe,
  ChevronDown,
  ChevronRight,
  Code,
  Server,
  Trash2,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

const backendAutoSignals = [
  {
    id: 'api',
    label: 'API Endpoints Setup',
    description: 'Configure REST API endpoints',
    sources: [
      { path: 'api_url', label: 'api_url' },
      { path: 'backend_url', label: 'backend_url' },
      { path: 'metadata.apiReady', label: 'metadata.apiReady' },
    ],
  },
  {
    id: 'database',
    label: 'Database Connection',
    description: 'Connect to Supabase/PostgreSQL',
    sources: [
      { path: 'database_url', label: 'database_url' },
      { path: 'metadata.databaseConnected', label: 'metadata.databaseConnected' },
    ],
  },
  {
    id: 'auth',
    label: 'Authentication',
    description: 'Implement user authentication',
    sources: [
      { path: 'auth_provider', label: 'auth_provider' },
      { path: 'metadata.authReady', label: 'metadata.authReady' },
    ],
  },
  {
    id: 'middleware',
    label: 'Middleware Setup',
    description: 'Configure CORS and security',
    sources: [
      { path: 'middleware_ready', label: 'middleware_ready' },
      { path: 'metadata.middleware', label: 'metadata.middleware' },
    ],
  },
  {
    id: 'deployment',
    label: 'Backend Deployment',
    description: 'Deploy to production server',
    sources: [
      { path: 'backend_paired', label: 'backend_paired' },
      { path: 'backend_deployed_at', label: 'backend_deployed_at' },
    ],
  },
];

const frontendAutoSignals = [
  {
    id: 'ui',
    label: 'UI Components',
    description: 'Build React components',
    sources: [
      { path: 'ui_library', label: 'ui_library' },
      { path: 'metadata.uiComplete', label: 'metadata.uiComplete' },
    ],
  },
  {
    id: 'routing',
    label: 'Routing Setup',
    description: 'Configure React Router',
    sources: [
      { path: 'routing_ready', label: 'routing_ready' },
      { path: 'metadata.routing', label: 'metadata.routing' },
    ],
  },
  {
    id: 'state',
    label: 'State Management',
    description: 'Setup Context/Redux',
    sources: [
      { path: 'state_manager', label: 'state_manager' },
      { path: 'metadata.stateManager', label: 'metadata.stateManager' },
    ],
  },
  {
    id: 'api-integration',
    label: 'API Integration',
    description: 'Connect to backend APIs',
    sources: [
      { path: 'api_integrated', label: 'api_integrated' },
      { path: 'metadata.apiIntegration', label: 'metadata.apiIntegration' },
    ],
  },
  {
    id: 'deployment',
    label: 'Frontend Deployment',
    description: 'Deploy to Vercel/Netlify',
    sources: [
      { path: 'frontend_paired', label: 'frontend_paired' },
      { path: 'domain', label: 'domain' },
      { path: 'frontend_deployed_at', label: 'frontend_deployed_at' },
    ],
  },
];

const getValueByPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

const evaluateAutoTasks = (project, signalSet) =>
  signalSet.map((task) => {
    const matchedSource = task.sources.find((source) => {
      const value = getValueByPath(project, source.path);
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value > 0;
      return Boolean(value);
    });

    return {
      ...task,
      completed: Boolean(matchedSource),
      detectedFrom: matchedSource?.label || null,
    };
  });

const getTaskProgressPercentage = (tasksArray) => {
  if (!tasksArray || tasksArray.length === 0) return 0;
  const completed = tasksArray.filter((task) => task.completed).length;
  return Math.floor((completed / tasksArray.length) * 100);
};

const getPerformanceScore = (backendTasks, frontendTasks) => {
  const totalTasks = backendTasks.length + frontendTasks.length;
  if (totalTasks === 0) return 0;
  const completed =
    backendTasks.filter((task) => task.completed).length +
    frontendTasks.filter((task) => task.completed).length;
  return Math.floor((completed / totalTasks) * 100);
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTrainings: 0,
    deployments: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);

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
        activeTrainings: projects?.filter((p) => p.status === 'training').length || 0,
        deployments: projects?.filter((p) => p.status === 'deployed').length || 0,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !window.confirm('Are you sure you want to delete this project? This action cannot be undone.')
    ) {
      return;
    }

    try:
      toast.loading('Deleting project...', { id: 'delete' });

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Project deleted successfully', { id: 'delete' });
      loadDashboardData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project', { id: 'delete' });
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

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="ml-64 flex-1 p-8">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 p-8">
              <div className="mb-3 flex items-center gap-3">
                <Sparkles className="text-cyan-400" size={32} />
                <h1 className="text-3xl font-bold text-white">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}!
                </h1>
              </div>
              <p className="text-lg text-slate-300">
                Manage your AI projects, track auto-detected progress, and push to production.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 transition-all hover:border-cyan-500/50">
                <div className="mb-4 flex items-center justify-between">
                  <Upload className="text-cyan-400" size={24} />
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm text-cyan-400">
                    Active
                  </span>
                </div>
                <div className="mb-2 text-4xl font-bold text-white">{stats.totalProjects}</div>
                <div className="text-slate-400">Total Projects</div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 transition-all hover:border-purple-500/50">
                <div className="mb-4 flex items-center justify-between">
                  <Brain className="text-purple-400" size={24} />
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-400">
                    Running
                  </span>
                </div>
                <div className="mb-2 text-4xl font-bold text-white">{stats.activeTrainings}</div>
                <div className="text-slate-400">Active Trainings</div>
              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 transition-all hover:border-green-500/50">
                <div className="mb-4 flex items-center justify-between">
                  <Rocket className="text-green-400" size={24} />
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
                    Live
                  </span>
                </div>
                <div className="mb-2 text-4xl font-bold text-white">{stats.deployments}</div>
                <div className="text-slate-400">Deployments</div>
              </div>
            </div>

            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Current Projects</h2>
              </div>

              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => {
                    const backendAutoTasks = evaluateAutoTasks(project, backendAutoSignals);
                    const frontendAutoTasks = evaluateAutoTasks(project, frontendAutoSignals);

                    const backendProgress = getTaskProgressPercentage(backendAutoTasks);
                    const frontendProgress = getTaskProgressPercentage(frontendAutoTasks);
                    const performanceScore = getPerformanceScore(
                      backendAutoTasks,
                      frontendAutoTasks
                    );

                    const backendComplete = backendAutoTasks.every((task) => task.completed);
                    const frontendComplete = frontendAutoTasks.every((task) => task.completed);
                    const status = project.verification_status || project.status || 'pending';
                    const isRejected = status === 'rejected';
                    const isExpanded = expandedProject === project.id;

                    return (
                      <div
                        key={project.id}
                        className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 transition-all hover:border-cyan-500/50"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                              {getStatusIcon(status)}
                              <span className={`text-sm capitalize ${getStatusColor(status)}`}>
                                {status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="mb-4 text-sm text-slate-400">
                              {project.description || 'No description provided'}
                            </p>
                          </div>

                          {isRejected && (
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="ml-4 flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 font-semibold text-red-400 transition hover:bg-red-500/30"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="mb-4 grid grid-cols-4 gap-4">
                          <div className="rounded-lg bg-slate-800/50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Activity className="text-cyan-400" size={16} />
                              <span className="text-xs text-slate-400">Progress</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{performanceScore}%</div>
                          </div>

                          <div className="rounded-lg bg-slate-800/50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Globe className="text-purple-400" size={16} />
                              <span className="text-xs text-slate-400">Domain</span>
                            </div>
                            <div className="text-sm font-semibold text-white">
                              {project.domain ? '✓ Linked' : 'Not Linked'}
                            </div>
                          </div>

                          <div className="rounded-lg bg-slate-800/50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Server className="text-green-400" size={16} />
                              <span className="text-xs text-slate-400">Backend</span>
                            </div>
                            <div className="text-sm font-semibold text-green-400">
                              {project.backend_paired
                                ? '✓ Paired'
                                : backendComplete
                                ? '✓ Auto-complete'
                                : `${backendProgress}%`}
                            </div>
                          </div>

                          <div className="rounded-lg bg-slate-800/50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Code className="text-blue-400" size={16} />
                              <span className="text-xs text-slate-400">Frontend</span>
                            </div>
                            <div className="text-sm font-semibold text-blue-400">
                              {project.frontend_paired
                                ? '✓ Paired'
                                : frontendComplete
                                ? '✓ Auto-complete'
                                : `${frontendProgress}%`}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
                            <button
                              onClick={() =>
                                setExpandedProject(isExpanded ? null : project.id)
                              }
                              className="flex w-full items-center justify-between p-4 transition hover:bg-slate-800/50"
                            >
                              <div className="flex items-center gap-3">
                                <Server className="text-green-400" size={20} />
                                <span className="font-semibold text-white">
                                  Backend Development
                                </span>
                                <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-700">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    style={{ width: `${backendProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {backendProgress}%
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronDown size={20} className="text-slate-400" />
                              ) : (
                                <ChevronRight size={20} className="text-slate-400" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="space-y-2 px-4 pb-4">
                                {backendAutoTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-start gap-3 rounded-lg bg-slate-900/50 p-3"
                                  >
                                    <div
                                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                                        task.completed
                                          ? 'bg-green-500/20 text-green-400'
                                          : 'bg-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {task.completed ? (
                                        <CheckCircle size={16} />
                                      ) : (
                                        <Clock size={16} />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p
                                        className={`font-medium ${
                                          task.completed ? 'text-slate-400' : 'text-white'
                                        }`}
                                      >
                                        {task.label}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {task.completed
                                          ? `Auto-detected via ${task.detectedFrom}`
                                          : task.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
                            <button
                              onClick={() =>
                                setExpandedProject(isExpanded ? null : project.id)
                              }
                              className="flex w-full items-center justify-between p-4 transition hover:bg-slate-800/50"
                            >
                              <div className="flex items-center gap-3">
                                <Code className="text-blue-400" size={20} />
                                <span className="font-semibold text-white">
                                  Frontend Development
                                </span>
                                <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-700">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                    style={{ width: `${frontendProgress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {frontendProgress}%
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronDown size={20} className="text-slate-400" />
                              ) : (
                                <ChevronRight size={20} className="text-slate-400" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="space-y-2 px-4 pb-4">
                                {frontendAutoTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-start gap-3 rounded-lg bg-slate-900/50 p-3"
                                  >
                                    <div
                                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                                        task.completed
                                          ? 'bg-blue-500/20 text-blue-400'
                                          : 'bg-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {task.completed ? (
                                        <CheckCircle size={16} />
                                      ) : (
                                        <Clock size={16} />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p
                                        className={`font-medium ${
                                          task.completed ? 'text-slate-400' : 'text-white'
                                        }`}
                                      >
                                        {task.label}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {task.completed
                                          ? `Auto-detected via ${task.detectedFrom}`
                                          : task.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {project.domain && (
                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <Globe className="text-cyan-400" size={16} />
                            <span className="text-slate-400">Deployed at:</span>
                            <a
                              href={`https://${project.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-cyan-400 hover:underline"
                            >
                              {project.domain}
                            </a>
                            <CheckCircle className="text-green-400" size={16} />
                          </div>
                        )}

                        <div className="mt-4 border-t border-slate-700 pt-4">
                          <button
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700"
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
                <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-12 text-center">
                  <Upload className="mx-auto mb-4 text-slate-600" size={48} />
                  <h3 className="mb-2 text-xl font-semibold text-white">No projects yet</h3>
                  <p className="mb-6 text-slate-400">
                    Get started by creating your first AI project
                  </p>
                  <button
                    onClick={() => navigate('/upload-product')}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-3 text-white transition-opacity hover:opacity-90"
                  >
                    Create Your First Project
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <Sparkles className="text-yellow-400" size={24} />
                    <h2 className="text-2xl font-bold text-white">70% Creator Commission!</h2>
                  </div>
                  <p className="mb-4 text-slate-300">
                    Sell AI models, datasets & algorithms. Earn 70% commission + best seller bonuses!
                  </p>
                </div>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-white transition-opacity hover:opacity-90"
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