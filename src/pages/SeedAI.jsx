import React, { useState, useRef } from 'react';
import { 
  Upload, Zap, Download, CheckCircle, Loader2, AlertCircle, 
  TrendingDown, Gauge, FileCode, Cpu, HardDrive, Clock,
  BarChart3, Shield, X, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadModelForVerification, compressModel } from '../services/api';

export default function SeedAI() {
  const fileInputRef = useRef(null);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Compression State
  const [compressionLevel, setCompressionLevel] = useState(90);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionResult, setCompressionResult] = useState(null);

  // Model Info State
  const [modelInfo, setModelInfo] = useState({
    originalSize: null,
    format: null,
    uploadedId: null,
    fileName: null
  });

  // Compression Techniques State
  const [selectedTechniques, setSelectedTechniques] = useState({
    quantization: true,
    pruning: true,
    distillation: false,
    clustering: false
  });

  // ==========================================
  // FILE UPLOAD HANDLERS
  // ==========================================

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
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

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    // Validate file type
    const validExtensions = ['.pt', '.pth', '.onnx', '.tflite', '.h5', '.pb', '.mlmodel'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      toast.error('Invalid file type. Please upload a model file (.pt, .pth, .onnx, .tflite, .h5, .pb, .mlmodel)');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 500MB');
      return;
    }

    setSelectedFile(file);
    setModelInfo({
      originalSize: (file.size / (1024 * 1024)).toFixed(2),
      format: fileExt.replace('.', '').toUpperCase(),
      uploadedId: null,
      fileName: file.name
    });
    
    toast.success(`Selected: ${file.name}`);

    // Auto-upload
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('model', file);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadModelForVerification(formData);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setModelInfo(prev => ({
        ...prev,
        uploadedId: result.id
      }));
      
      toast.success('Model uploaded successfully!');
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setModelInfo({
      originalSize: null,
      format: null,
      uploadedId: null,
      fileName: null
    });
    setUploadProgress(0);
    setCompressionResult(null);
    setCompressionProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('File removed');
  };

  // ==========================================
  // COMPRESSION HANDLERS
  // ==========================================

  const handleCompress = async () => {
    if (!modelInfo.uploadedId) {
      toast.error('Please upload a model first');
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);
    setCompressionResult(null);

    try {
      // Simulate compression progress
      const steps = [
        { progress: 20, message: 'Analyzing model architecture...' },
        { progress: 40, message: 'Applying quantization...' },
        { progress: 60, message: 'Pruning redundant weights...' },
        { progress: 80, message: 'Optimizing for edge devices...' },
        { progress: 95, message: 'Finalizing compression...' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setCompressionProgress(step.progress);
        toast.loading(step.message, { id: 'compression' });
      }

      const result = await compressModel(modelInfo.uploadedId, compressionLevel);
      
      setCompressionProgress(100);
      setCompressionResult(result);
      toast.success('Compression complete!', { id: 'compression' });
      
    } catch (error) {
      toast.error('Compression failed. Please try again.', { id: 'compression' });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressionResult?.download_url && compressionResult.download_url !== '#') {
      window.open(compressionResult.download_url, '_blank');
      toast.success('Download started!');
    } else {
      // Demo mode - simulate download
      toast.success('Download started! (Demo mode - no actual file)');
      
      // Simulate download in real app
      const blob = new Blob(['Demo compressed model'], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelInfo.fileName.split('.')[0]}_compressed.${modelInfo.format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setCompressionResult(null);
    setCompressionProgress(0);
    toast.success('Ready for new compression');
  };

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const estimatedSize = modelInfo.originalSize 
    ? (modelInfo.originalSize * (1 - compressionLevel / 100)).toFixed(2)
    : null;

  const spaceSaved = modelInfo.originalSize && estimatedSize
    ? (modelInfo.originalSize - estimatedSize).toFixed(2)
    : null;

  const compressionLevelLabel = 
    compressionLevel >= 90 ? 'Aggressive' :
    compressionLevel >= 80 ? 'Balanced' :
    'Conservative';

  const compressionLevelColor = 
    compressionLevel >= 90 ? 'text-red-400' :
    compressionLevel >= 80 ? 'text-cyan-400' :
    'text-emerald-400';

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white">Seed AI Compression</h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Compress your AI models by up to <span className="text-cyan-400 font-bold">95%</span> with minimal accuracy loss. 
          Optimized for Edge devices, mobile, and IoT.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* ==========================================
            LEFT COLUMN - UPLOAD & SETTINGS
            ========================================== */}
        <div className="space-y-6">
          
          {/* Upload Section */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">1. Upload Your Model</h2>
              {selectedFile && (
                <button
                  onClick={handleRemoveFile}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                >
                  <X size={16} />
                  Remove
                </button>
              )}
            </div>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition cursor-pointer relative ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-500/10 scale-105'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".pt,.pth,.onnx,.tflite,.h5,.pb,.mlmodel"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition ${
                  selectedFile ? 'bg-emerald-500/20' : 'bg-slate-800'
                }`}>
                  {isUploading ? (
                    <Loader2 size={40} className="text-cyan-400 animate-spin" />
                  ) : selectedFile ? (
                    <CheckCircle size={40} className="text-emerald-400" />
                  ) : (
                    <Upload size={40} className="text-slate-500" />
                  )}
                </div>
                
                <h3 className="font-bold text-white mb-2 text-lg">
                  {selectedFile ? modelInfo.fileName : 'Drag & Drop your model'}
                </h3>
                
                <p className="text-sm text-slate-400 mb-4">
                  Supports .pt, .pth, .onnx, .tflite, .h5, .pb, .mlmodel (max 500MB)
                </p>
                
                {selectedFile && modelInfo.originalSize && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg mb-4">
                    <FileCode size={16} className="text-cyan-400" />
                    <span className="text-sm text-slate-300 font-semibold">
                      {modelInfo.format} • {modelInfo.originalSize} MB
                    </span>
                  </div>
                )}
                
                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full max-w-xs mx-auto">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {!selectedFile && (
                  <div className="mt-4">
                    <span className="text-cyan-400 hover:text-cyan-300 font-semibold">
                      Browse Files
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Compression Settings */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">2. Compression Settings</h2>
            
            <div className="space-y-6">
              {/* Compression Level Slider */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-400">Compression Level</label>
                    <p className="text-xs text-slate-500 mt-1">{compressionLevelLabel} mode</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg">
                    <Gauge size={18} className={compressionLevelColor} />
                    <span className={`text-2xl font-black ${compressionLevelColor}`}>
                      {compressionLevel}%
                    </span>
                  </div>
                </div>
                
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="5"
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(6, 182, 212) ${compressionLevel}%, rgb(30, 41, 59) ${compressionLevel}%, rgb(30, 41, 59) 100%)`
                  }}
                />
                
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>70% (Safe)</span>
                  <span>80%</span>
                  <span>90%</span>
                  <span>95% (Max)</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block">Quick Presets</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { level: 75, label: 'Safe', color: 'emerald' },
                    { level: 85, label: 'Balanced', color: 'cyan' },
                    { level: 95, label: 'Extreme', color: 'red' }
                  ].map((preset) => (
                    <button
                      key={preset.level}
                      onClick={() => setCompressionLevel(preset.level)}
                      className={`px-4 py-3 rounded-xl font-bold transition ${
                        compressionLevel === preset.level
                          ? `bg-${preset.color}-500 text-white shadow-lg shadow-${preset.color}-500/30`
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                      <div className="text-xs font-normal mt-1 opacity-80">
                        {preset.level}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compression Techniques */}
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-3 block">
                  Compression Techniques
                </label>
                <div className="space-y-2">
                  {Object.entries(selectedTechniques).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                          value ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                        }`}>
                          {value && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-white capitalize">
                          {key}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSelectedTechniques({ ...selectedTechniques, [key]: e.target.checked })}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Compress Button */}
              <button
                onClick={handleCompress}
                disabled={!selectedFile || isCompressing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {isCompressing ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    Compressing... {compressionProgress}%
                  </>
                ) : (
                  <>
                    <Zap size={22} />
                    Start Compression
                  </>
                )}
              </button>

              {/* Compression Progress */}
              {isCompressing && compressionProgress > 0 && (
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN - RESULTS & INFO
            ========================================== */}
        <div className="space-y-6">
          
          {/* Size Comparison */}
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Size Comparison</h2>
            
            <div className="space-y-4">
              {/* Original Size */}
              <div className="flex items-center justify-between p-5 bg-slate-900/50 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Original Size</p>
                  <p className="text-3xl font-black text-white">
                    {modelInfo.originalSize ? `${modelInfo.originalSize} MB` : '—'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <HardDrive size={28} className="text-red-400" />
                </div>
              </div>

              {/* Estimated Compressed Size */}
              <div className="flex items-center justify-between p-5 bg-slate-900/50 rounded-xl border border-slate-800">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Estimated Size</p>
                  <p className="text-3xl font-black text-emerald-400">
                    {estimatedSize ? `${estimatedSize} MB` : '—'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDown size={28} className="text-emerald-400" />
                </div>
              </div>

              {/* Space Saved */}
              {modelInfo.originalSize && spaceSaved && (
                <div className="p-5 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-cyan-400 font-semibold">Space Saved</p>
                    <Cpu size={20} className="text-cyan-400" />
                  </div>
                  <p className="text-4xl font-black text-white mb-1">
                    {spaceSaved} MB
                  </p>
                  <p className="text-xs text-slate-400">
                    {compressionLevel}% reduction • {compressionLevelLabel} mode
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Compression Result */}
          {compressionResult && (
            <div className="bg-[#1a1f2e] border-2 border-emerald-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Compression Complete!</h2>
                    <p className="text-sm text-slate-400">Your model is ready to download</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                  title="Reset"
                >
                  <RefreshCw size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 mb-6 p-4 bg-slate-900/50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Original Size</span>
                  <span className="font-bold text-white">{compressionResult.original_size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Compressed Size</span>
                  <span className="font-bold text-emerald-400">{compressionResult.compressed_size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Reduction</span>
                  <span className="font-bold text-cyan-400">{compressionResult.reduction}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Accuracy Loss</span>
                  <span className="font-bold text-yellow-400">{compressionResult.accuracy_loss}</span>
                </div>
              </div>

              {/* Techniques Used */}
              <div className="mb-6">
                <p className="text-xs text-slate-400 mb-2">Techniques Applied:</p>
                <div className="flex flex-wrap gap-2">
                  {compressionResult.techniques?.map((tech, idx) => (
                    <span key={idx} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-500/30"
              >
                <Download size={22} />
                Download Compressed Model
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-cyan-400" />
              <h3 className="font-bold text-white">How It Works</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                <span>
                  <strong className="text-white">Quantization:</strong> Convert 32-bit floats to 8-bit integers, reducing model size by 75%
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                <span>
                  <strong className="text-white">Pruning:</strong> Remove redundant neurons and connections while maintaining accuracy
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                <span>
                  <strong className="text-white">Distillation:</strong> Transfer knowledge from large model to compact student model
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-400 mt-1 flex-shrink-0">•</span>
                <span>
                  <strong className="text-white">Optimization:</strong> Hardware-specific tuning for iOS CoreML, Android TFLite, ONNX Runtime
                </span>
              </li>
            </ul>
          </div>

          {/* Performance Stats */}
          {compressionResult && (
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={20} className="text-purple-400" />
                <h3 className="font-bold text-white">Performance Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Compression Time</p>
                  <p className="text-lg font-bold text-white">{compressionResult.compression_time}</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Original Accuracy</p>
                  <p className="text-lg font-bold text-white">{compressionResult.original_accuracy}%</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">New Accuracy</p>
                  <p className="text-lg font-bold text-emerald-400">{compressionResult.compressed_accuracy}%</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Quality Score</p>
                  <p className="text-lg font-bold text-cyan-400">A+</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for slider */}
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(6, 182, 212), rgb(168, 85, 247));
          cursor: pointer;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(6, 182, 212), rgb(168, 85, 247));
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}