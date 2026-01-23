import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import { 
  Database, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  PlayCircle, 
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Coins,
  FileText,
  Image as ImageIcon,
  Cpu,
  Zap,
  TrendingUp,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Datasets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [trainingJobs, setTrainingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userTokens, setUserTokens] = useState(0);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    name: '',
    description: '',
    type: 'text',
    file: null,
    price: 0,
    listInMarketplace: false,
    tags: ''
  });

  // Training form state
  const [trainingForm, setTrainingForm] = useState({
    modelName: '',
    architecture: 'transformer',
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001
  });

  useEffect(() => {
    if (user) {
      fetchDatasets();
      fetchTrainingJobs();
      fetchUserTokens();
    }
  }, [user]);

  const fetchUserTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tokens:', error);
      } else {
        setUserTokens(data?.balance || 0);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('training_jobs')
        .select('*, datasets(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrainingJobs(data || []);
    } catch (error) {
      console.error('Error fetching training jobs:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUploadDataset = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = uploadForm.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, uploadForm.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('datasets')
        .getPublicUrl(fileName);

      // Create dataset record
      const { data: dataset, error: dbError } = await supabase
        .from('datasets')
        .insert([{
          user_id: user.id,
          name: uploadForm.name,
          description: uploadForm.description,
          type: uploadForm.type,
          file_url: publicUrl,
          file_size: uploadForm.file.size,
          price: uploadForm.listInMarketplace ? uploadForm.price : 0,
          is_marketplace: uploadForm.listInMarketplace,
          tags: uploadForm.tags.split(',').map(t => t.trim()).filter(t => t),
          status: 'ready'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // If listing in marketplace, create marketplace entry
      if (uploadForm.listInMarketplace) {
        const { error: marketError } = await supabase
          .from('marketplace_items')
          .insert([{
            seller_id: user.id,
            item_type: 'dataset',
            dataset_id: dataset.id,
            title: uploadForm.name,
            description: uploadForm.description,
            price: uploadForm.price,
            category: uploadForm.type,
            tags: uploadForm.tags.split(',').map(t => t.trim()).filter(t => t),
            status: 'active'
          }]);

        if (marketError) throw marketError;
      }

      toast.success('Dataset uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({
        name: '',
        description: '',
        type: 'text',
        file: null,
        price: 0,
        listInMarketplace: false,
        tags: ''
      });
      fetchDatasets();
    } catch (error) {
      console.error('Error uploading dataset:', error);
      toast.error('Failed to upload dataset');
    } finally {
      setUploading(false);
    }
  };

  const handleStartTraining = async (e) => {
    e.preventDefault();

    if (!selectedDataset) {
      toast.error('Please select a dataset');
      return;
    }

    // Calculate token cost
    const tokenCost = trainingForm.epochs * 100;

    if (userTokens < tokenCost) {
      toast.error(`Insufficient tokens. Need ${tokenCost} tokens.`);
      return;
    }

    try {
      // Deduct tokens
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({ balance: userTokens - tokenCost })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Create training job
      const { data: job, error: jobError } = await supabase
        .from('training_jobs')
        .insert([{
          user_id: user.id,
          dataset_id: selectedDataset.id,
          model_name: trainingForm.modelName,
          architecture: trainingForm.architecture,
          config: {
            epochs: trainingForm.epochs,
            batch_size: trainingForm.batchSize,
            learning_rate: trainingForm.learningRate
          },
          status: 'queued',
          tokens_spent: tokenCost,
          progress: 0
        }])
        .select()
        .single();

      if (jobError) throw jobError;

      // Record transaction
      await supabase.from('token_transactions').insert([{
        user_id: user.id,
        amount: -tokenCost,
        type: 'training',
        description: `Training job: ${trainingForm.modelName}`,
        reference_id: job.id
      }]);

      toast.success(`Training started! Cost: ${tokenCost} tokens`);
      setShowTrainingModal(false);
      setSelectedDataset(null);
      setTrainingForm({
        modelName: '',
        architecture: 'transformer',
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001
      });
      
      fetchTrainingJobs();
      fetchUserTokens();
    } catch (error) {
      console.error('Error starting training:', error);
      toast.error('Failed to start training');
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;

    try {
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', datasetId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Dataset deleted successfully');
      fetchDatasets();
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast.error('Failed to delete dataset');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      queued: { icon: Clock, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Queued' },
      running: { icon: PlayCircle, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Running' },
      completed: { icon: CheckCircle, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Completed' },
      failed: { icon: XCircle, color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.queued;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <StatusIcon size={14} />
        {config.label}
      </span>
    );
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || dataset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Database className="text-cyan-400" />
                Datasets & Training
              </h1>
              <p className="text-slate-400">Upload datasets, train models, and manage your AI training jobs</p>
            </div>
            
            {/* Token Balance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Coins className="text-yellow-400" size={24} />
                <div>
                  <p className="text-slate-400 text-xs">Available Tokens</p>
                  <p className="text-yellow-400 text-2xl font-bold">{userTokens.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl p-6 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3 group"
          >
            <Upload size={24} className="group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <h3 className="font-bold text-lg">Upload Dataset</h3>
              <p className="text-cyan-100 text-sm">Upload your training data</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/training-queue')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl p-6 transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3 group"
          >
            <Cpu size={24} className="group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <h3 className="font-bold text-lg">Training Queue</h3>
              <p className="text-purple-100 text-sm">View all training jobs</p>
            </div>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>

        {/* Datasets Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="text-cyan-400" />
            My Datasets
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-slate-700 rounded mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 text-center">
              <Database className="mx-auto text-slate-600 mb-4" size={64} />
              <h3 className="text-xl font-bold text-white mb-2">No datasets found</h3>
              <p className="text-slate-400 mb-6">Upload your first dataset to get started</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Upload Dataset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map(dataset => (
                <div key={dataset.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {dataset.type === 'image' ? <ImageIcon className="text-cyan-400" size={24} /> : <FileText className="text-cyan-400" size={24} />}
                      <div>
                        <h3 className="font-bold text-white group-hover:text-cyan-400 transition">{dataset.name}</h3>
                        <p className="text-xs text-slate-500">{dataset.type}</p>
                      </div>
                    </div>
                    
                    {dataset.is_marketplace && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <ShoppingBag size={12} />
                        Listed
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{dataset.description || 'No description'}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>{(dataset.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>{new Date(dataset.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDataset(dataset);
                        setShowTrainingModal(true);
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      Train
                    </button>
                    
                    <button
                      onClick={() => handleDeleteDataset(dataset.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Training Jobs */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="text-purple-400" />
            Recent Training Jobs
          </h2>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 font-semibold">Model Name</th>
                  <th className="text-left p-4 text-slate-400 font-semibold">Dataset</th>
                  <th className="text-left p-4 text-slate-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-slate-400 font-semibold">Progress</th>
                  <th className="text-left p-4 text-slate-400 font-semibold">Tokens</th>
                  <th className="text-left p-4 text-slate-400 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {trainingJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-slate-500">
                      No training jobs yet
                    </td>
                  </tr>
                ) : (
                  trainingJobs.map(job => (
                    <tr key={job.id} className="border-t border-slate-700 hover:bg-slate-800/30">
                      <td className="p-4 text-white font-semibold">{job.model_name}</td>
                      <td className="p-4 text-slate-400">{job.datasets?.name || 'Unknown'}</td>
                      <td className="p-4">{getStatusBadge(job.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${job.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-slate-400 text-sm">{job.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-yellow-400 font-semibold">{job.tokens_spent || 0}</td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(job.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Upload className="text-cyan-400" />
                Upload Dataset
              </h2>

              <form onSubmit={handleUploadDataset} className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-2">Dataset Name *</label>
                  <input
                    type="text"
                    required
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="My Training Dataset"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    rows="3"
                    placeholder="Describe your dataset..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-slate-400 mb-2">Type *</label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-2">File *</label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:cursor-pointer hover:file:bg-cyan-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    placeholder="nlp, classification, sentiment"
                  />
                </div>

                <div className="border border-slate-700 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadForm.listInMarketplace}
                      onChange={(e) => setUploadForm({ ...uploadForm, listInMarketplace: e.target.checked })}
                      className="w-5 h-5 text-cyan-600 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-cyan-500"
                    />
                    <div>
                      <span className="text-white font-semibold">List in Marketplace</span>
                      <p className="text-slate-400 text-sm">Make this dataset available for others to purchase</p>
                    </div>
                  </label>

                  {uploadForm.listInMarketplace && (
                    <div className="mt-4">
                      <label className="block text-slate-400 mb-2">Price (tokens)</label>
                      <input
                        type="number"
                        min="0"
                        value={uploadForm.price}
                        onChange={(e) => setUploadForm({ ...uploadForm, price: parseInt(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    {uploading ? 'Uploading...' : 'Upload Dataset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Training Modal */}
        {showTrainingModal && selectedDataset && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="text-purple-400" />
                Start Training: {selectedDataset.name}
              </h2>

              <form onSubmit={handleStartTraining} className="space-y-4">
                <div>
                  <label className="block text-slate-400 mb-2">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={trainingForm.modelName}
                    onChange={(e) => setTrainingForm({ ...trainingForm, modelName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="My Custom Model"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-2">Architecture *</label>
                  <select
                    required
                    value={trainingForm.architecture}
                    onChange={(e) => setTrainingForm({ ...trainingForm, architecture: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="transformer">Transformer</option>
                    <option value="cnn">CNN</option>
                    <option value="rnn">RNN</option>
                    <option value="lstm">LSTM</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-2">Epochs</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={trainingForm.epochs}
                      onChange={(e) => setTrainingForm({ ...trainingForm, epochs: parseInt(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-2">Batch Size</label>
                    <input
                      type="number"
                      min="1"
                      max="256"
                      value={trainingForm.batchSize}
                      onChange={(e) => setTrainingForm({ ...trainingForm, batchSize: parseInt(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-2">Learning Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    max="1"
                    value={trainingForm.learningRate}
                    onChange={(e) => setTrainingForm({ ...trainingForm, learningRate: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Estimated Cost:</span>
                    <span className="text-yellow-400 font-bold text-lg">{trainingForm.epochs * 100} tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Your Balance:</span>
                    <span className={`font-bold ${userTokens >= trainingForm.epochs * 100 ? 'text-green-400' : 'text-red-400'}`}>
                      {userTokens.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTrainingModal(false);
                      setSelectedDataset(null);
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={userTokens < trainingForm.epochs * 100}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Start Training
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}