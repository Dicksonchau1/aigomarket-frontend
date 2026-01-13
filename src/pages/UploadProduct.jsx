import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileCode, 
  Image, 
  Music, 
  Database,
  CheckCircle, 
  XCircle,
  Loader2, 
  AlertCircle,
  Info,
  Trash2,
  Eye,
  DollarSign,
  Tag,
  FileText,
  Zap,
  Shield,
  Globe,
  Sparkles,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadDataset, uploadModelForVerification } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UploadProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploadType, setUploadType] = useState('model');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: 0,
    license: 'MIT',
    tags: [],
    version: '1.0.0',
    framework: '',
    modelType: '',
    accuracy: '',
    size: '',
    requirements: '',
    documentation: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const acceptedFileTypes = {
    model: {
      extensions: ['.pt', '.pth', '.onnx', '.tflite', '.h5', '.pb', '.mlmodel', '.keras'],
      mimeTypes: ['application/octet-stream', 'application/x-hdf', 'model/*'],
      maxSize: 50 * 1024 * 1024 // 50 MB (FREE TIER LIMIT)
    },
    dataset: {
      extensions: ['.csv', '.json', '.parquet', '.zip', '.tar.gz', '.pkl', '.npz'],
      mimeTypes: ['text/csv', 'application/json', 'application/zip', 'application/x-tar'],
      maxSize: 50 * 1024 * 1024 // 50 MB
    },
    algorithm: {
      extensions: ['.py', '.ipynb', '.js', '.ts', '.zip'],
      mimeTypes: ['text/x-python', 'application/x-ipynb+json', 'text/javascript', 'application/zip'],
      maxSize: 50 * 1024 * 1024 // 50 MB
    }
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndAddFiles(selectedFiles);
  };

  const validateAndAddFiles = (fileList) => {
    const config = acceptedFileTypes[uploadType];
    const validFiles = [];
    const errors = [];

    fileList.forEach(file => {
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!config.extensions.includes(fileExt)) {
        errors.push(`${file.name}: Invalid file type. Expected ${config.extensions.join(', ')}`);
        return;
      }

      if (file.size > config.maxSize) {
        errors.push(`${file.name}: File too large. Max size: ${formatFileSize(config.maxSize)}`);
        return;
      }

      const metadata = extractFileMetadata(file);
      
      validFiles.push({
        file,
        metadata,
        id: Math.random().toString(36).substr(2, 9),
        uploadStatus: 'pending'
      });
    });

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
      
      if (!productDetails.name && validFiles.length === 1) {
        setProductDetails(prev => ({
          ...prev,
          name: validFiles[0].file.name.replace(/\.[^/.]+$/, "")
        }));
      }
    }
  };

  const extractFileMetadata = (file) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: '.' + file.name.split('.').pop().toLowerCase(),
      lastModified: new Date(file.lastModified).toISOString(),
      sizeFormatted: formatFileSize(file.size)
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File removed');
  };

  const handleInputChange = (field, value) => {
    setProductDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !productDetails.tags.includes(tagInput.trim())) {
      setProductDetails(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setProductDetails(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    if (!productDetails.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!productDetails.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!productDetails.category) {
      toast.error('Please select a category');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, uploadStatus: 'uploading' } : f
        ));

        const formData = new FormData();
        formData.append(uploadType, fileData.file);
        formData.append('metadata', JSON.stringify({
          ...productDetails,
          uploader: user?.email,
          uploadedAt: new Date().toISOString()
        }));

        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const increment = (100 / files.length) * ((i + 1) / files.length);
            return Math.min(prev + 5, increment * 0.9);
          });
        }, 200);

        let result;
        if (uploadType === 'model') {
          result = await uploadModelForVerification(formData);
        } else if (uploadType === 'dataset') {
          result = await uploadDataset(formData);
        } else {
          result = await uploadDataset(formData);
        }

        clearInterval(progressInterval);

        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, uploadStatus: 'success', result } : f
        ));

        setUploadProgress((i + 1) / files.length * 100);
      }

      toast.success('Upload completed successfully!');
      setCurrentStep(4);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
      setFiles(prev => prev.map(f => ({ ...f, uploadStatus: 'error' })));
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const goToNextStep = () => {
    if (currentStep === 1 && files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const categories = {
    model: [
      { value: 'vision', label: 'Computer Vision', subcategories: ['Object Detection', 'Image Classification', 'Segmentation', 'Pose Estimation'] },
      { value: 'nlp', label: 'Natural Language Processing', subcategories: ['Text Classification', 'Sentiment Analysis', 'Named Entity Recognition', 'Translation'] },
      { value: 'audio', label: 'Audio Processing', subcategories: ['Speech Recognition', 'Voice Classification', 'Audio Enhancement', 'Music Generation'] },
      { value: 'multimodal', label: 'Multimodal', subcategories: ['Vision + Language', 'Audio + Video', 'Document Understanding'] },
      { value: 'other', label: 'Other', subcategories: ['Custom', 'Experimental'] }
    ],
    dataset: [
      { value: 'vision', label: 'Vision Datasets', subcategories: ['Images', 'Videos', 'Annotations'] },
      { value: 'text', label: 'Text Datasets', subcategories: ['Documents', 'Social Media', 'News', 'Books'] },
      { value: 'audio', label: 'Audio Datasets', subcategories: ['Speech', 'Music', 'Environmental Sounds'] },
      { value: 'tabular', label: 'Tabular Data', subcategories: ['CSV', 'Excel', 'Database Dumps'] }
    ],
    algorithm: [
      { value: 'optimization', label: 'Optimization', subcategories: ['Pruning', 'Quantization', 'Distillation'] },
      { value: 'training', label: 'Training', subcategories: ['Loss Functions', 'Optimizers', 'Schedulers'] },
      { value: 'preprocessing', label: 'Preprocessing', subcategories: ['Data Augmentation', 'Normalization', 'Feature Engineering'] }
    ]
  };

  const selectedCategory = categories[uploadType]?.find(cat => cat.value === productDetails.category);

  // Check if any file is too large
  const hasOversizedFile = files.some(f => f.file.size > acceptedFileTypes[uploadType].maxSize);
  const oversizedFile = files.find(f => f.file.size > acceptedFileTypes[uploadType].maxSize);

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Upload Product</h1>
            <p className="text-slate-400">Share your AI models, datasets, or algorithms with the community</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-slate-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <div className="mb-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { num: 1, label: 'Upload Files' },
            { num: 2, label: 'Product Details' },
            { num: 3, label: 'Review & Publish' },
            { num: 4, label: 'Complete' }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  currentStep >= step.num
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {currentStep > step.num ? <CheckCircle size={20} /> : step.num}
                </div>
                <span className={`text-xs mt-2 font-semibold ${
                  currentStep >= step.num ? 'text-white' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < 3 && (
                <div className={`h-0.5 flex-1 transition ${
                  currentStep > step.num ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Select Upload Type</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: 'model', label: 'AI Model', icon: Zap, desc: 'Neural networks & ML models' },
                  { type: 'dataset', label: 'Dataset', icon: Database, desc: 'Training & validation data' },
                  { type: 'algorithm', label: 'Algorithm', icon: FileCode, desc: 'Code & notebooks' }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => {
                      setUploadType(item.type);
                      setFiles([]);
                    }}
                    className={`p-6 rounded-xl border-2 transition text-left ${
                      uploadType === item.type
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <item.icon size={32} className={uploadType === item.type ? 'text-cyan-400' : 'text-slate-400'} />
                    <h3 className="font-bold text-white mt-3 mb-1">{item.label}</h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Upload Files</h2>
              
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
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  accept={acceptedFileTypes[uploadType].extensions.join(',')}
                  className="hidden"
                />
                
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={40} className="text-slate-500" />
                </div>
                
                <h3 className="font-bold text-white mb-2">Drag & Drop your files here</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Supported formats: {acceptedFileTypes[uploadType].extensions.join(', ')}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Max size: {formatFileSize(acceptedFileTypes[uploadType].maxSize)}
                </p>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition"
                >
                  Browse Files
                </button>
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-bold text-white mb-3">Uploaded Files ({files.length})</h3>
                  {files.map(fileData => (
                    <div
                      key={fileData.id}
                      className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                          <FileCode size={20} className="text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{fileData.metadata.name}</p>
                          <p className="text-xs text-slate-400">
                            {fileData.metadata.sizeFormatted} • {fileData.metadata.extension}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {fileData.uploadStatus === 'success' && (
                          <CheckCircle size={20} className="text-emerald-400" />
                        )}
                        {fileData.uploadStatus === 'error' && (
                          <XCircle size={20} className="text-red-400" />
                        )}
                        {fileData.uploadStatus === 'uploading' && (
                          <Loader2 size={20} className="text-cyan-400 animate-spin" />
                        )}
                        <button
                          onClick={() => removeFile(fileData.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FILE TOO LARGE WARNING */}
              {hasOversizedFile && oversizedFile && (
                <div className="mt-6 p-5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 flex-shrink-0">
                      <AlertCircle size={24} className="text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-2">⚠️ File Too Large - Compression Required</h3>
                      <p className="text-slate-300 text-sm mb-1">
                        <strong>{oversizedFile.metadata.name}</strong> is {oversizedFile.metadata.sizeFormatted}.
                      </p>
                      <p className="text-slate-300 text-sm mb-4">
                        Free tier supports files up to <strong>50 MB</strong>. Use Seed AI to compress your model by up to 95% first.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Save current form data to localStorage
                            localStorage.setItem('uploadDraft', JSON.stringify({
                              ...productDetails,
                              fileName: oversizedFile.metadata.name
                            }));
                            navigate('/dashboard/seed-ai');
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition"
                        >
                          <Sparkles size={18} />
                          Compress with Seed AI
                        </button>
                        <button
                          onClick={() => removeFile(oversizedFile.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition"
                        >
                          <X size={18} />
                          Remove File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-cyan-400 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white mb-2">Upload Guidelines</h3>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• <strong className="text-white">50 MB limit</strong> on free tier - Use Seed AI to compress larger models</li>
                    <li>• Ensure your files are properly formatted and tested</li>
                    <li>• Include documentation and usage examples</li>
                    <li>• All uploads are scanned for security</li>
                    <li>• You retain full ownership of your intellectual property</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={goToNextStep}
                disabled={files.length === 0 || hasOversizedFile}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Product Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productDetails.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., YOLOv8-Edge Face Detector"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={productDetails.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your product, its features, and use cases..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                      Category *
                    </label>
                    <select
                      value={productDetails.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">Select category</option>
                      {categories[uploadType]?.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                      Subcategory
                    </label>
                    <select
                      value={productDetails.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      disabled={!productDetails.category}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">Select subcategory</option>
                      {selectedCategory?.subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <DollarSign size={18} className="absolute left-3 top-3.5 text-slate-500" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={productDetails.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Set to 0 for free products</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                      License
                    </label>
                    <select
                      value={productDetails.license}
                      onChange={(e) => handleInputChange('license', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="MIT">MIT License</option>
                      <option value="Apache-2.0">Apache 2.0</option>
                      <option value="GPL-3.0">GPL 3.0</option>
                      <option value="BSD-3-Clause">BSD 3-Clause</option>
                      <option value="Commercial">Commercial License</option>
                      <option value="Custom">Custom License</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags (e.g., computer-vision, real-time)"
                      className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      onClick={addTag}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition"
                    >
                      Add
                    </button>
                  </div>
                  {productDetails.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {productDetails.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-semibold flex items-center gap-2"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-cyan-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {uploadType === 'model' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">
                          Framework
                        </label>
                        <select
                          value={productDetails.framework}
                          onChange={(e) => handleInputChange('framework', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="">Select framework</option>
                          <option value="PyTorch">PyTorch</option>
                          <option value="TensorFlow">TensorFlow</option>
                          <option value="ONNX">ONNX</option>
                          <option value="TFLite">TensorFlow Lite</option>
                          <option value="CoreML">Core ML</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">
                          Accuracy (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={productDetails.accuracy}
                          onChange={(e) => handleInputChange('accuracy', e.target.value)}
                          placeholder="e.g., 94.5"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Documentation / Usage Instructions
                  </label>
                  <textarea
                    value={productDetails.documentation}
                    onChange={(e) => handleInputChange('documentation', e.target.value)}
                    placeholder="Include setup instructions, API usage, examples..."
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none resize-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition"
              >
                ← Back
              </button>
              <button
                onClick={goToNextStep}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition"
              >
                Review & Publish →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Review Your Product</h2>

              <div className="space-y-6">
                <div className="p-6 bg-slate-900/50 rounded-xl">
                  <h3 className="font-bold text-white mb-4">Product Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Name</p>
                      <p className="text-white font-semibold">{productDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Type</p>
                      <p className="text-white font-semibold capitalize">{uploadType}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Category</p>
                      <p className="text-white font-semibold">
                        {categories[uploadType]?.find(c => c.value === productDetails.category)?.label || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Price</p>
                      <p className="text-white font-semibold">
                        {productDetails.price > 0 ? `$${productDetails.price}` : 'Free'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 mb-2">Description</p>
                      <p className="text-white text-sm">{productDetails.description}</p>
                    </div>
                    {productDetails.tags.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-slate-400 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {productDetails.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/50 rounded-xl">
                  <h3 className="font-bold text-white mb-4">Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map(fileData => (
                      <div key={fileData.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                        <span className="text-white text-sm">{fileData.metadata.name}</span>
                        <span className="text-slate-400 text-xs">{fileData.metadata.sizeFormatted}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield size={20} className="text-cyan-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-white mb-2">Publishing Agreement</h3>
                      <ul className="text-sm text-slate-400 space-y-2">
                        <li>• You confirm that you have the right to publish this content</li>
                        <li>• You retain all intellectual property rights</li>
                        <li>• AIGO may use your product for platform demonstrations</li>
                        <li>• You agree to the AIGO <a href="/terms" className="text-cyan-400 hover:underline">Terms of Service</a></li>
                      </ul>
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded" required />
                        <span className="text-sm text-white">I agree to the terms above</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={goToPreviousStep}
                disabled={isUploading}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Uploading... {Math.round(uploadProgress)}%
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Publish Product
                  </>
                )}
              </button>
            </div>

            {isUploading && (
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Uploading...</span>
                  <span className="text-sm text-cyan-400">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Product Published Successfully!</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Your product is now live on the AIGO Marketplace. Users can discover and download it immediately.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard/marketplace')}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition"
              >
                View in Marketplace
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition"
              >
                Upload Another Product
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
              <div className="p-4 bg-[#1a1f2e] border border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Downloads</p>
                <p className="text-2xl font-black text-white">0</p>
              </div>
              <div className="p-4 bg-[#1a1f2e] border border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Rating</p>
                <p className="text-2xl font-black text-white">New</p>
              </div>
              <div className="p-4 bg-[#1a1f2e] border border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm mb-1">Earnings</p>
                <p className="text-2xl font-black text-white">$0</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}