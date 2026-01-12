import React, { useState } from 'react';
import { Upload, CheckCircle, FileCode, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AIVerificationGuard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const goldDatasets = [
    {
      id: 1,
      name: 'NLP-Gold',
      description: '10K multilingual samples',
      status: 'Active',
      color: 'cyan'
    },
    {
      id: 2,
      name: 'Vision-Gold',
      description: '50K labeled images',
      status: 'Active',
      color: 'purple'
    },
    {
      id: 3,
      name: 'Edge-Gold',
      description: 'IoT latency benchmarks',
      status: 'Active',
      color: 'emerald'
    },
    {
      id: 4,
      name: 'Multi-Gold',
      description: 'Audio + Video + Text fusion',
      status: 'Active',
      color: 'pink'
    }
  ];

  const certificationScores = {
    latency: 92,
    accuracy: 88,
    cpu: 76,
    ram: 84,
    gpu: 95
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validExtensions = ['.py', '.pkl', '.onnx', '.pt', '.h5'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.'));
    
    if (validExtensions.includes(fileExt)) {
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    } else {
      toast.error('Invalid file type. Please upload .py, .pkl, .onnx, .pt, or .h5 files');
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-white mb-3">
          AI Verification <span className="text-cyan-400">Guard</span>
        </h1>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Docker Sandbox execution. Gold Datasets for testing. Telemetry collection for fair comparison.
        </p>
      </header>

      {/* Sandbox Pipeline */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-cyan-400" />
          </div>
          <h2 className="text-2xl font-black text-cyan-400">Sandbox Pipeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Step 1: Upload Algorithm */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition group">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
              1
            </div>
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition">
              <Upload size={32} className="text-slate-400" />
            </div>
            <h3 className="font-black text-white mb-2">Upload Algorithm</h3>
            <p className="text-sm text-slate-400">Submit your model via API or dashboard</p>
          </div>

          {/* Step 2: Docker Sandbox */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition group">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
              2
            </div>
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition">
              <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 2.5h3v3h-3v-3zm0 4h3v3h-3v-3zm-4-4h3v3h-3v-3zm0 4h3v3h-3v-3zm-4-4h3v3h-3v-3zm0 4h3v3h-3v-3zm-4 0h3v3h-3v-3zm16 4h3v3h-3v-3zm-4 0h3v3h-3v-3zm-4 0h3v3h-3v-3zm-4 0h3v3h-3v-3zm-4 0h3v3h-3v-3zm12 4h3v3h-3v-3zm-4 0h3v3h-3v-3zm-4 0h3v3h-3v-3z"/>
              </svg>
            </div>
            <h3 className="font-black text-white mb-2">Docker Sandbox</h3>
            <p className="text-sm text-slate-400">Isolated container execution environment</p>
          </div>

          {/* Step 3: Gold Dataset Test */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition group">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
              3
            </div>
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition">
              <FileCode size={32} className="text-purple-400" />
            </div>
            <h3 className="font-black text-white mb-2">Gold Dataset Test</h3>
            <p className="text-sm text-slate-400">Benchmark against proprietary datasets</p>
          </div>

          {/* Step 4: Certification Complete */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition group">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
              4
            </div>
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition">
              <CheckCircle size={32} className="text-yellow-400" />
            </div>
            <h3 className="font-black text-white mb-2">Certification Complete</h3>
            <p className="text-sm text-slate-400">Radar chart scores stored in PostgreSQL</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-black text-white mb-6">Upload Algorithm for Verification</h2>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer ${
              isDragging
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              onChange={handleFileInputChange}
              accept=".py,.pkl,.onnx,.pt,.h5"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={40} className="text-slate-500" />
              </div>
              <h3 className="font-bold text-white mb-2">Drag & Drop your model file</h3>
              <p className="text-sm text-slate-400 mb-4">
                Supports .py, .pkl, .onnx, .pt, .h5 files (max 500MB)
              </p>
              {selectedFile && (
                <div className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg mb-4">
                  ✓ {selectedFile.name}
                </div>
              )}
              <div>
                <span className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Browse Files
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Gold Datasets */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-black text-white mb-2">Gold Datasets</h2>
          <p className="text-slate-400 mb-6">Proprietary testing benchmarks</p>

          <div className="space-y-3">
            {goldDatasets.map((dataset) => (
              <div
                key={dataset.id}
                className="bg-[#0a0f1e] border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div>
                  <h3 className="font-bold text-white mb-1">{dataset.name}</h3>
                  <p className="text-sm text-slate-400">{dataset.description}</p>
                </div>
                <span className={`px-3 py-1 bg-${dataset.color}-500/20 text-${dataset.color}-400 rounded-lg text-sm font-semibold`}>
                  {dataset.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certification Scores */}
      <div className="mt-8 bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-black text-white mb-6">Certification Scores</h2>
        <p className="text-slate-400 mb-8">Radar chart visualization</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Scores List */}
          <div className="space-y-4">
            {Object.entries(certificationScores).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white capitalize">{key}</span>
                  <span className="text-sm font-bold text-cyan-400">{value}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart Placeholder */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Pentagon Grid */}
                <polygon
                  points="100,20 180,70 160,150 40,150 20,70"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <polygon
                  points="100,50 150,80 140,130 60,130 50,80"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.3"
                />

                {/* Data Polygon */}
                <polygon
                  points="100,27 165,70 152,140 48,140 35,70"
                  fill="rgba(6, 182, 212, 0.2)"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />

                {/* Labels */}
                <text x="100" y="15" textAnchor="middle" fill="#94a3b8" fontSize="12">
                  Latency: {certificationScores.latency}
                </text>
                <text x="185" y="75" textAnchor="start" fill="#94a3b8" fontSize="12">
                  Accuracy: {certificationScores.accuracy}
                </text>
                <text x="165" y="160" textAnchor="start" fill="#94a3b8" fontSize="12">
                  CPU: {certificationScores.cpu}
                </text>
                <text x="35" y="160" textAnchor="end" fill="#94a3b8" fontSize="12">
                  RAM: {certificationScores.ram}
                </text>
                <text x="15" y="75" textAnchor="end" fill="#94a3b8" fontSize="12">
                  GPU: {certificationScores.gpu}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}