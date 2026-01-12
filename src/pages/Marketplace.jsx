import React, { useState } from 'react';
import { ShoppingCart, Download, Package, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('datasets');
  const [formatFilter, setFormatFilter] = useState('all');
  const [tokens, setTokens] = useState(2450);

  // Dataset items
  const datasets = [
    {
      id: 1,
      name: 'Student Performance',
      category: 'Education • Classification',
      description: 'Educational dataset for predicting student outcomes and performance metrics.',
      format: 'CSV',
      records: '1K+',
      type: 'B2I',
      file: 'student+performance.zip',
      price: 150,
      icon: '🎓',
      color: 'emerald'
    },
    {
      id: 2,
      name: 'E-commerce Transactions',
      category: 'Commerce • Prediction',
      description: 'Customer behavior and transaction data for recommendation engines.',
      format: 'JSON',
      records: '5K+',
      type: 'B2C',
      file: 'ecommerce_transactions.json',
      price: 280,
      icon: '🛒',
      color: 'pink'
    },
    {
      id: 3,
      name: 'Language Detection',
      category: 'NLP • Classification',
      description: 'Multilingual text classification for language identification.',
      format: 'CSV',
      records: '10K+',
      type: 'B2B',
      file: 'language_detection.csv',
      price: 350,
      icon: '🌐',
      color: 'purple'
    },
    {
      id: 4,
      name: 'Reddit Sentiment',
      category: 'Social • Sentiment',
      description: 'Reddit posts with sentiment labels for opinion mining.',
      format: 'CSV',
      records: '31K+',
      type: 'B2B',
      file: 'reddit_sentiment.csv',
      price: 420,
      icon: '💬',
      color: 'orange'
    },
    {
      id: 5,
      name: 'Anime Multimodal',
      category: 'Vision • Embeddings',
      description: 'Image embeddings and references for multimodal training.',
      format: 'Parquet',
      records: '+Images',
      type: 'B2C',
      file: 'anime_multimodal.parquet',
      price: 580,
      icon: '🎨',
      color: 'indigo'
    },
    {
      id: 6,
      name: 'YouTube Recommendations',
      category: 'Media • Recommendation',
      description: 'Video engagement data for recommendation systems.',
      format: 'CSV',
      records: '537',
      type: 'B2C',
      file: 'youtube_recommendation.csv',
      price: 200,
      icon: '📺',
      color: 'red'
    }
  ];

  // Edge AI Models
  const edgeModels = [
    {
      id: 1,
      name: 'YOLOv10-Edge',
      category: 'Vision • Object Detection',
      description: 'Real-time object detection optimized for mobile and IoT devices.',
      format: 'TFLite',
      size: '5MB',
      fps: '30 FPS',
      downloads: '12.4K',
      price: 500,
      icon: '🎯',
      color: 'cyan'
    },
    {
      id: 2,
      name: 'MoveNet-Lightning',
      category: 'Vision • Pose Estimation',
      description: 'Ultra-fast pose estimation for fitness and gesture control.',
      format: 'TFLite',
      size: '3MB',
      fps: '50 FPS',
      downloads: '18.9K',
      price: 450,
      icon: '🏃',
      color: 'emerald'
    },
    {
      id: 3,
      name: 'Whisper-Nano',
      category: 'Audio • Speech Recognition',
      description: 'Lightweight speech-to-text for offline transcription.',
      format: 'ONNX',
      size: '40MB',
      fps: 'Multilingual',
      downloads: '8.2K',
      price: 600,
      icon: '🎤',
      color: 'purple'
    },
    {
      id: 4,
      name: 'DistilBERT-Edge',
      category: 'NLP • Sentiment Analysis',
      description: 'Compact NLP model for text classification on device.',
      format: 'TFLite',
      size: '66MB',
      fps: 'CPU',
      downloads: '9.1K',
      price: 380,
      icon: '📝',
      color: 'blue'
    },
    {
      id: 5,
      name: 'FaceDetect-Lite',
      category: 'Vision • Face Detection',
      description: 'Ultra-fast face detection for edge cameras and access control.',
      format: 'TFLite',
      size: '1.2MB',
      fps: '60 FPS',
      downloads: '22.1K',
      price: 320,
      icon: '👤',
      color: 'pink'
    },
    {
      id: 6,
      name: 'GestureNet-Mini',
      category: 'Vision • Gesture Control',
      description: 'Hand gesture recognition for touchless interfaces.',
      format: 'TFLite',
      size: '2.5MB',
      fps: '45 FPS',
      downloads: '6.8K',
      price: 280,
      icon: '👋',
      color: 'orange'
    }
  ];

  // Multimodal AI Models
  const multimodalModels = [
    {
      id: 1,
      name: 'CLIP-Lite',
      category: 'Text + Image • Zero-shot',
      description: 'Connect text and images for zero-shot classification and search.',
      format: 'PyTorch',
      size: '150MB',
      arch: 'ViT-B/32',
      downloads: '5.6K',
      price: 850,
      icon: '🔗',
      color: 'cyan'
    },
    {
      id: 2,
      name: 'LLaVA-Mini',
      category: 'Vision + Language • Q&A',
      description: 'Visual question answering and image captioning model.',
      format: 'GGUF',
      size: '4GB',
      arch: '7B params',
      downloads: '3.2K',
      price: 1200,
      icon: '💭',
      color: 'purple'
    },
    {
      id: 3,
      name: 'VideoMAE-Lite',
      category: 'Video • Understanding',
      description: 'Video understanding and action recognition model.',
      format: 'PyTorch',
      size: '300MB',
      arch: 'Temporal',
      downloads: '2.1K',
      price: 950,
      icon: '🎬',
      color: 'red'
    },
    {
      id: 4,
      name: 'AudioVisual-Sync',
      category: 'Audio + Video • Sync',
      description: 'Audio-visual synchronization and lip-sync detection.',
      format: 'PyTorch',
      size: '180MB',
      arch: 'Real-time',
      downloads: '4.5K',
      price: 720,
      icon: '🎵',
      color: 'emerald'
    },
    {
      id: 5,
      name: 'DocuVision-OCR',
      category: 'Document • OCR + NLP',
      description: 'Document understanding combining OCR with semantic analysis.',
      format: 'ONNX',
      size: '120MB',
      arch: 'Layout',
      downloads: '7.3K',
      price: 680,
      icon: '📄',
      color: 'blue'
    },
    {
      id: 6,
      name: 'CaptionGen-Pro',
      category: 'Image • Captioning',
      description: 'Generate natural language descriptions from images.',
      format: 'PyTorch',
      size: '250MB',
      arch: 'Multilingual',
      downloads: '5.9K',
      price: 580,
      icon: '📸',
      color: 'pink'
    }
  ];

  // Algorithms
  const algorithms = [
    {
      id: 1,
      name: 'Neural Sort Pro',
      category: 'Optimization • Sorting',
      description: 'Differentiable sorting for end-to-end neural network training.',
      language: 'Python',
      framework: 'PyTorch',
      license: 'MIT License',
      price: 29.90,
      icon: '🔢',
      color: 'cyan'
    },
    {
      id: 2,
      name: 'GraphNet-Cluster',
      category: 'Graph • Clustering',
      description: 'Advanced graph clustering with neural message passing.',
      language: 'Python',
      framework: 'PyG',
      license: 'Apache 2.0',
      price: 49.90,
      icon: '🕸️',
      color: 'purple'
    },
    {
      id: 3,
      name: 'TimeSeries-Prophet',
      category: 'Forecasting • Time Series',
      description: 'Neural time series forecasting with uncertainty estimation.',
      language: 'Python',
      framework: 'TensorFlow',
      license: 'MIT License',
      price: 39.90,
      icon: '📈',
      color: 'emerald'
    },
    {
      id: 4,
      name: 'ModelPrune-Ultra',
      category: 'Optimization • Pruning',
      description: 'Advanced model pruning for 90%+ compression with minimal accuracy loss.',
      language: 'Python',
      framework: 'PyTorch',
      license: 'Commercial',
      price: 59.90,
      icon: '✂️',
      color: 'orange'
    },
    {
      id: 5,
      name: 'AutoAugment-ML',
      category: 'Data • Augmentation',
      description: 'Learned data augmentation policies for improved training.',
      language: 'Python',
      framework: 'PyTorch',
      license: 'MIT License',
      price: 34.90,
      icon: '🎨',
      color: 'pink'
    },
    {
      id: 6,
      name: 'AdversarialGuard',
      category: 'Security • Robustness',
      description: 'Adversarial training and defense for robust ML models.',
      language: 'Python',
      framework: 'TensorFlow',
      license: 'Commercial',
      price: 79.90,
      icon: '🛡️',
      color: 'red'
    }
  ];

  const colorClasses = {
    cyan: 'from-cyan-500 to-cyan-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    pink: 'from-pink-500 to-pink-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  const handleBuy = (item) => {
    if (activeTab === 'algorithms') {
      toast.success(`Purchased ${item.name} for $${item.price}!`);
    } else {
      if (tokens >= item.price) {
        setTokens(tokens - item.price);
        toast.success(`Purchased ${item.name} for ${item.price} tokens!`);
      } else {
        toast.error('Not enough tokens!');
      }
    }
  };

  const filteredDatasets = formatFilter === 'all' 
    ? datasets 
    : datasets.filter(d => d.format.toLowerCase() === formatFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-[#0a0f1e] p-8">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">AI Marketplace</h1>
          <p className="text-slate-400">Get datasets, AI models, and algorithms to power your training</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
            <Coins size={20} className="text-white" />
            <span className="font-bold text-white">{tokens.toLocaleString()}</span>
            <span className="text-yellow-100 text-sm">tokens</span>
          </div>
          <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-slate-100 transition">
            + Buy Tokens
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setActiveTab('datasets')}
          className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'datasets'
              ? 'bg-white text-black'
              : 'bg-[#1a1f2e] text-slate-400 hover:text-white'
          }`}
        >
          <Package size={20} />
          Datasets
        </button>
        <button
          onClick={() => setActiveTab('edge')}
          className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'edge'
              ? 'bg-white text-black'
              : 'bg-[#1a1f2e] text-slate-400 hover:text-white'
          }`}
        >
          Edge AI
        </button>
        <button
          onClick={() => setActiveTab('multimodal')}
          className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'multimodal'
              ? 'bg-white text-black'
              : 'bg-[#1a1f2e] text-slate-400 hover:text-white'
          }`}
        >
          Multimodal AI
        </button>
        <button
          onClick={() => setActiveTab('algorithms')}
          className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
            activeTab === 'algorithms'
              ? 'bg-white text-black'
              : 'bg-[#1a1f2e] text-slate-400 hover:text-white'
          }`}
        >
          Algorithms
        </button>
      </div>

      {/* DATASETS TAB */}
      {activeTab === 'datasets' && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">Training Datasets</h2>
            <p className="text-slate-400 mb-4">Purchase datasets with tokens to train your AI models</p>
            
            {/* Format Filters */}
            <div className="flex gap-2">
              {['All', 'CSV', 'JSON', 'Parquet'].map((format) => (
                <button
                  key={format}
                  onClick={() => setFormatFilter(format.toLowerCase())}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    formatFilter === format.toLowerCase()
                      ? 'bg-cyan-500 text-white'
                      : 'bg-[#1a1f2e] text-slate-400 hover:text-white'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Datasets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDatasets.map((dataset) => (
              <div key={dataset.id} className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[dataset.color]} rounded-xl flex items-center justify-center text-2xl`}>
                    {dataset.icon}
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center gap-1">
                    <Coins size={14} className="text-white" />
                    <span className="font-bold text-white text-sm">{dataset.price}</span>
                  </div>
                </div>
                
                <h3 className="font-black text-lg text-white mb-1 group-hover:text-cyan-400 transition">
                  {dataset.name}
                </h3>
                <p className="text-sm text-cyan-400 mb-3">{dataset.category}</p>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{dataset.description}</p>
                
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{dataset.format}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{dataset.records} records</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{dataset.type}</span>
                </div>
                
                <div className="mb-4 text-xs text-slate-500 flex items-center gap-1">
                  📦 {dataset.file}
                </div>
                
                <button 
                  onClick={() => handleBuy(dataset)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Buy
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* EDGE AI TAB */}
      {activeTab === 'edge' && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">Edge AI Models</h2>
            <p className="text-slate-400">Lightweight models optimized for edge deployment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {edgeModels.map((model) => (
              <div key={model.id} className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[model.color]} rounded-xl flex items-center justify-center text-2xl`}>
                    {model.icon}
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center gap-1">
                    <Coins size={14} className="text-white" />
                    <span className="font-bold text-white text-sm">{model.price}</span>
                  </div>
                </div>
                
                <h3 className="font-black text-lg text-white mb-1 group-hover:text-cyan-400 transition">
                  {model.name}
                </h3>
                <p className="text-sm text-cyan-400 mb-3">{model.category}</p>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{model.description}</p>
                
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{model.format}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{model.size}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{model.fps}</span>
                </div>
                
                <div className="mb-4 text-xs text-slate-500 flex items-center gap-1">
                  <Download size={12} /> {model.downloads} downloads
                </div>
                
                <button 
                  onClick={() => handleBuy(model)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Buy
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MULTIMODAL AI TAB */}
      {activeTab === 'multimodal' && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">Multimodal AI Models</h2>
            <p className="text-slate-400">Models that process text, images, audio, and video together</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {multimodalModels.map((model) => (
              <div key={model.id} className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[model.color]} rounded-xl flex items-center justify-center text-2xl`}>
                    {model.icon}
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center gap-1">
                    <Coins size={14} className="text-white" />
                    <span className="font-bold text-white text-sm">{model.price}</span>
                  </div>
                </div>
                
                <h3 className="font-black text-lg text-white mb-1 group-hover:text-cyan-400 transition">
                  {model.name}
                </h3>
                <p className="text-sm text-cyan-400 mb-3">{model.category}</p>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{model.description}</p>
                
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{model.format}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{model.size}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{model.arch}</span>
                </div>
                
                <div className="mb-4 text-xs text-slate-500 flex items-center gap-1">
                  <Download size={12} /> {model.downloads} downloads
                </div>
                
                <button 
                  onClick={() => handleBuy(model)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Buy
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ALGORITHMS TAB */}
      {activeTab === 'algorithms' && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">Algorithms</h2>
            <p className="text-slate-400">One-time license for premium algorithms and code packages</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {algorithms.map((algo) => (
              <div key={algo.id} className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/50 transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[algo.color]} rounded-xl flex items-center justify-center text-2xl`}>
                    {algo.icon}
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
                    One-Time License
                  </div>
                </div>
                
                <h3 className="font-black text-lg text-white mb-1 group-hover:text-cyan-400 transition">
                  {algo.name}
                </h3>
                <p className="text-sm text-cyan-400 mb-3">{algo.category}</p>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{algo.description}</p>
                
                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{algo.language}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{algo.framework}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">{algo.license}</span>
                </div>
                
                <div className="mb-4 text-slate-500 text-xs">
                  Lifetime access
                </div>
                
                <button 
                  onClick={() => handleBuy(algo)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  ${algo.price}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}