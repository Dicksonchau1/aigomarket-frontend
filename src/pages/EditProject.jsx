import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { database } from '../services/database';
import toast from 'react-hot-toast';

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'classification',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await database.projects.getById(id);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        type: data.type || 'classification',
      });
    } catch (error) {
      toast.error('Failed to load project');
      console.error(error);
      navigate('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setSaving(true);

    try {
      await database.projects.update(id, formData);
      toast.success('Project updated successfully');
      navigate('/dashboard/projects');
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await database.projects.delete(id);
      toast.success('Project deleted successfully');
      navigate('/dashboard/projects');
    } catch (error) {
      toast.error('Failed to delete project');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard/projects')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>

        <div className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-black text-white">Edit Project</h1>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
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
                onClick={() => navigate('/dashboard/projects')}
                className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
                disabled={saving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:from-cyan-400 hover:to-purple-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}