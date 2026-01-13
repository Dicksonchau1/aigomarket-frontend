import React, { useState, useEffect } from 'react';
import { Upload, Database, Trash2, Download, Search, FileText } from 'lucide-react';
import { database } from '../services/database';
import toast from 'react-hot-toast';

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await database.datasets.getAll();
      setDatasets(data);
    } catch (error) {
      toast.error('Failed to load datasets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'text/csv',
      'application/json',
      'application/x-tar',
      'application/gzip'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(zip|csv|json|tar|gz)$/)) {
      toast.error('Please upload a ZIP, CSV, JSON, TAR, or GZ file');
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 100MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await database.datasets.upload(file, {
        metadata: {
          uploaded_at: new Date().toISOString()
        }
      });
      
      setUploadProgress(100);
      toast.success('Dataset uploaded successfully');
      loadDatasets();
    } catch (error) {
      toast.error(error.message || 'Failed to upload dataset');
      console.error(error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDeleteDataset = async (datasetId) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;

    try {
      await database.datasets.delete(datasetId);
      toast.success('Dataset deleted successfully');
      loadDatasets();
    } catch (error) {
      toast.error('Failed to delete dataset');
      console.error(error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Datasets</h1>
            <p className="text-slate-400">Upload and manage your training data</p>
          </div>
          
          <label className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:from-cyan-400 hover:to-purple-500 transition cursor-pointer">
            <Upload size={20} />
            Upload Dataset
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".zip,.csv,.json,.tar,.gz"
              disabled={uploading}
            />
          </label>
        </div>

        {uploading && (
          <div className="mb-6 bg-[#0f172a] border-2 border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Uploading dataset...</span>
              <span className="text-cyan-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border-2 border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {filteredDatasets.length === 0 ? (
          <div className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-12 text-center">
            <Database className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No datasets yet</h3>
            <p className="text-slate-400 mb-6">Upload your first dataset to start training</p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition cursor-pointer">
              <Upload size={20} />
              Upload Dataset
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".zip,.csv,.json,.tar,.gz"
              />
            </label>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset) => (
              <div
                key={dataset.id}
                className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="text-cyan-400" size={24} />
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <a
                      href={dataset.file_url}
                      download
                      className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                    >
                      <Download size={16} className="text-cyan-400" />
                    </a>
                    <button
                      onClick={() => handleDeleteDataset(dataset.id)}
                      className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 truncate">{dataset.name}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Size: {formatFileSize(dataset.size)}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Uploaded {new Date(dataset.created_at).toLocaleDateString()}</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">
                    Ready
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