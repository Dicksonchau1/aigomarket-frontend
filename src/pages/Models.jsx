import React, { useState, useEffect } from 'react';
import { Cpu, Download, Play, Trash2, Search, Filter, AlertCircle } from 'lucide-react';
import { database } from '../services/database';
import toast from 'react-hot-toast';

export default function Models() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await database.models.getAll();
      setModels(data);
    } catch (error) {
      toast.error('Failed to load models');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (modelId) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      await database.models.delete(modelId);
      toast.success('Model deleted successfully');
      loadModels();
    } catch (error) {
      toast.error('Failed to delete model');
      console.error(error);
    }
  };

  const handleDeployModel = async (modelId) => {
    try {
      await database.models.deploy(modelId);
      toast.success('Model deployed successfully');
      loadModels();
    } catch (error) {
      toast.error('Failed to deploy model');
      console.error(error);
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || model.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">AI Models</h1>
          <p className="text-slate-400">Manage and deploy your trained models</p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border-2 border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 bg-[#0f172a] border-2 border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="trained">Trained</option>
              <option value="deployed">Deployed</option>
              <option value="training">Training</option>
            </select>
          </div>
        </div>

        {filteredModels.length === 0 ? (
          <div className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-12 text-center">
            <Cpu className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No models found</h3>
            <p className="text-slate-400 mb-4">Train your first model from a project</p>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 inline-block">
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <AlertCircle size={16} />
                <span>Models will appear here after training</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Cpu className="text-purple-400" size={24} />
                  </div>
                  
                  <div className="flex gap-2">
                    {model.status === 'trained' && (
                      <button
                        onClick={() => handleDeployModel(model.id)}
                        className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition"
                        title="Deploy model"
                      >
                        <Play size={16} className="text-emerald-400" />
                      </button>
                    )}
                    {model.download_url && (
                      <a
                        href={model.download_url}
                        download
                        className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                        title="Download model"
                      >
                        <Download size={16} className="text-cyan-400" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                      title="Delete model"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{model.name || 'Untitled Model'}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {model.accuracy ? `Accuracy: ${model.accuracy}%` : 'Training in progress'}
                  {model.size && ` • Size: ${model.size}`}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Created {new Date(model.created_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    model.status === 'deployed' ? 'bg-emerald-500/10 text-emerald-400' :
                    model.status === 'training' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    {model.status || 'Ready'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}