import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { database } from '../services/database';
import toast from 'react-hot-toast';

export default function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'classification',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);

    try {
      await database.projects.create(formData);
      toast.success('Project created successfully');
      navigate('/projects');
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </button>

          <div className="bg-[#1a1f2e] border-2 border-slate-800 rounded-2xl p-8">
            <h1 className="text-3xl font-black text-white mb-6">Create New Project</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  placeholder="My AI Project"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                  rows={4}
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Project Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="classification">Image Classification</option>
                  <option value="detection">Object Detection</option>
                  <option value="segmentation">Image Segmentation</option>
                  <option value="nlp">Natural Language Processing</option>
                  <option value="forecasting">Time Series Forecasting</option>
                  <option value="recommendation">Recommendation System</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="flex-1 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-purple-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
