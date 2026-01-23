import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AigoBotPopup from '../components/AigoBotPopup';
import {
  Search,
  Filter,
  Star,
  Download,
  Coins,
  TrendingUp,
  Crown,
  Database,
  Brain,
  Code,
  Eye,
  FileText,
  Zap,
  Package,
  Sparkles,
  CheckCircle,
  ChevronRight,
  Flame,
  Plus,
  ShoppingCart,
  Award,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const categories = [
    { id: 'all', name: 'All Items', icon: Package },
    { id: 'computer-vision', name: 'Computer Vision', icon: Eye },
    { id: 'nlp', name: 'NLP & Text', icon: FileText },
    { id: 'audio', name: 'Audio & Speech', icon: Zap },
    { id: 'datasets', name: 'Datasets', icon: Database },
    { id: 'algorithms', name: 'Algorithms', icon: Code }
  ];

  const marketplaceItems = [
    {
      id: 'face-recognition-pro',
      name: 'Face Recognition Pro',
      type: 'model',
      category: 'computer-vision',
      description: 'Advanced facial recognition model with 99.2% accuracy. Trained on 5M+ faces with real-time detection capabilities.',
      tokens: 3500,
      rating: 4.9,
      reviews: 2847,
      downloads: 12500,
      seller: 'AI Vision Labs',
      sellerRating: 4.8,
      featured: true,
      bestseller: true,
      trending: true,
      image: '🎭',
      tags: ['Face Detection', 'Real-time', 'High Accuracy', 'Pre-trained'],
      features: [
        'Multi-face detection in single frame',
        'Age and gender estimation',
        'Emotion recognition (7 emotions)',
        'Face landmarks (68 points)',
        'Anti-spoofing detection',
        'Low-light optimization'
      ],
      specs: {
        accuracy: '99.2%',
        speed: '30 FPS',
        modelSize: '45 MB',
        framework: 'PyTorch & TensorFlow'
      }
    },
    {
      id: 'journal-dataset-premium',
      name: 'Academic Journal Dataset',
      type: 'dataset',
      category: 'nlp',
      description: 'Comprehensive dataset of 500K+ academic journal articles across 25 disciplines. Perfect for NLP research and training.',
      tokens: 1500,
      rating: 4.8,
      reviews: 1523,
      downloads: 8900,
      seller: 'DataScience Corp',
      sellerRating: 4.9,
      featured: true,
      bestseller: true,
      image: '📚',
      tags: ['Academic', 'NLP', 'Research', 'Labeled'],
      features: [
        '500K+ journal articles',
        '25 academic disciplines',
        'Full-text with metadata',
        'Citation networks included',
        'Pre-processed & cleaned',
        'Regular updates'
      ],
      specs: {
        size: '125 GB',
        format: 'JSON, CSV, Parquet',
        articles: '500,000+',
        timespan: '2000-2024'
      }
    },
    {
      id: 'sentiment-analyzer',
      name: 'Sentiment Analysis Engine',
      type: 'model',
      category: 'nlp',
      description: 'State-of-the-art sentiment analysis with context understanding. Supports 15+ languages.',
      tokens: 2800,
      rating: 4.7,
      reviews: 1872,
      downloads: 15600,
      seller: 'NLP Solutions',
      sellerRating: 4.7,
      trending: true,
      image: '💬',
      tags: ['NLP', 'Multi-language', 'Context-aware'],
      features: [
        'Multi-language support (15+)',
        'Context-aware analysis',
        'Aspect-based sentiment',
        'Real-time processing',
        'Custom domain training'
      ],
      specs: {
        accuracy: '94.5%',
        languages: '15+',
        speed: '1000 req/sec',
        framework: 'BERT-based'
      }
    },
    {
      id: 'object-detection-yolo',
      name: 'YOLO v8 Object Detector',
      type: 'model',
      category: 'computer-vision',
      description: 'Latest YOLO v8 implementation with 80+ object classes. Optimized for edge devices.',
      tokens: 4000,
      rating: 4.9,
      reviews: 3241,
      downloads: 18900,
      seller: 'Vision AI Pro',
      sellerRating: 4.9,
      bestseller: true,
      image: '🎯',
      tags: ['Object Detection', 'YOLO', 'Real-time', 'Edge-ready'],
      features: [
        '80+ object classes',
        'Edge device optimized',
        'Real-time detection',
        'Custom training support',
        'Mobile deployment ready'
      ],
      specs: {
        accuracy: '95.3% mAP',
        speed: '60 FPS',
        modelSize: '25 MB',
        framework: 'PyTorch'
      }
    },
    {
      id: 'medical-images-dataset',
      name: 'Medical Images Dataset',
      type: 'dataset',
      category: 'computer-vision',
      description: '100K+ labeled medical images (X-rays, MRI, CT scans) for diagnosis model training.',
      tokens: 1500,
      rating: 4.8,
      reviews: 892,
      downloads: 3400,
      seller: 'MedTech AI',
      sellerRating: 4.8,
      featured: true,
      image: '🏥',
      tags: ['Medical', 'Healthcare', 'Labeled', 'HIPAA-compliant'],
      features: [
        '100K+ medical images',
        'Expert annotations',
        'Multiple modalities',
        'HIPAA-compliant',
        'Research approved'
      ],
      specs: {
        size: '85 GB',
        images: '100,000+',
        format: 'DICOM, PNG',
        modalities: 'X-ray, MRI, CT'
      }
    },
    {
      id: 'speech-recognition',
      name: 'Multi-Language Speech-to-Text',
      type: 'model',
      category: 'audio',
      description: 'High-accuracy speech recognition supporting 50+ languages with noise cancellation.',
      tokens: 3200,
      rating: 4.6,
      reviews: 1456,
      downloads: 9800,
      seller: 'Audio AI Labs',
      sellerRating: 4.6,
      trending: true,
      image: '🎤',
      tags: ['Speech', 'STT', 'Multi-language', 'Noise-canceling'],
      features: [
        '50+ language support',
        'Noise cancellation',
        'Real-time transcription',
        'Speaker diarization',
        'Custom vocabulary'
      ],
      specs: {
        accuracy: '92% WER',
        languages: '50+',
        latency: '<100ms',
        framework: 'Whisper-based'
      }
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    await Promise.all([
      loadWallet(),
      loadPurchases()
    ]);
  };

  const loadWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: 0 })
          .select()
          .single();
        
        if (!createError) setWallet(newWallet);
      } else if (!error) {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_purchases')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.tokens - b.tokens;
      case 'price-high':
        return b.tokens - a.tokens;
      default:
        return 0;
    }
  });

  const featuredItems = marketplaceItems.filter(item => item.featured);
  const bestsellerItems = marketplaceItems.filter(item => item.bestseller);
  const trendingItems = marketplaceItems.filter(item => item.trending);

  const addToCart = (item) => {
    if (cart.find(i => i.id === item.id)) {
      toast.error('Item already in cart');
      return;
    }
    setCart([...cart, item]);
    toast.success('Added to cart!');
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
    toast.success('Removed from cart');
  };

  const handlePurchase = async (item) => {
    if (!user) {
      toast.error('Please sign in to purchase');
      navigate('/login');
      return;
    }

    if (isPurchased(item.id)) {
      toast.error('You already own this item');
      return;
    }

    if (!wallet || wallet.balance < item.tokens) {
      toast.error(`Insufficient tokens! You need ${item.tokens.toLocaleString()} tokens.`, {
        duration: 4000,
        icon: <AlertCircle className="text-red-500" />
      });
      
      setTimeout(() => {
        if (window.confirm('Would you like to buy more tokens?')) {
          navigate('/wallet');
        }
      }, 1000);
      return;
    }

    try {
      toast.loading('Processing purchase...', { id: 'purchase' });

      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance - item.tokens,
          total_spent: (wallet.total_spent || 0) + item.tokens
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'marketplace_purchase',
          amount: item.tokens,
          description: `Purchased: ${item.name}`,
          status: 'completed',
          metadata: { 
            item_id: item.id,
            item_type: item.type,
            seller: item.seller
          }
        });

      if (txError) throw txError;

      const { error: purchaseError } = await supabase
        .from('marketplace_purchases')
        .insert({
          user_id: user.id,
          item_id: item.id,
          item_name: item.name,
          item_type: item.type,
          tokens: item.tokens,
          seller: item.seller
        });

      if (purchaseError) throw purchaseError;

      toast.success(`🎉 Successfully purchased ${item.name}!`, { id: 'purchase' });
      
      await loadUserData();
      removeFromCart(item.id);

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.', { id: 'purchase' });
    }
  };

  const checkoutCart = async () => {
    if (cart.length === 0) return;

    const totalTokens = cart.reduce((sum, item) => sum + item.tokens, 0);

    if (!wallet || wallet.balance < totalTokens) {
      toast.error(`Insufficient tokens! You need ${totalTokens.toLocaleString()} tokens total.`);
      
      setTimeout(() => {
        if (window.confirm('Would you like to buy more tokens?')) {
          navigate('/wallet');
        }
      }, 1000);
      return;
    }

    try {
      toast.loading('Processing checkout...', { id: 'checkout' });
      
      for (const item of cart) {
        await handlePurchase(item);
      }

      setCart([]);
      setShowCart(false);
      toast.success('🎉 All items purchased successfully!', { id: 'checkout' });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed', { id: 'checkout' });
    }
  };

  const isPurchased = (itemId) => {
    return purchases.some(p => p.item_id === itemId);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.tokens, 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {user && wallet && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-2 border-cyan-500/40 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Coins size={28} className="text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Your Token Balance</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{wallet.balance.toLocaleString()}</span>
                      <span className="text-slate-400">tokens</span>
                      <span className="text-slate-500 text-sm">(≈ ${(wallet.balance * 0.01).toFixed(2)})</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate('/wallet')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition border border-slate-700"
                  >
                    View Wallet
                  </button>
                  <button 
                    onClick={() => navigate('/wallet')}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Buy Tokens
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-2 border-yellow-500/40 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <Crown size={32} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-black text-white">70% Creator Commission</h2>
                      <Flame className="text-orange-500 animate-pulse" size={24} />
                    </div>
                    <p className="text-yellow-200 text-lg font-semibold">
                      Sell your AI models & datasets • Keep 70% of every sale • Top seller bonuses
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/upload-product')}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition flex items-center gap-2"
                >
                  <Zap size={20} />
                  Start Selling
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-black text-white mb-2">AI Marketplace</h1>
                <p className="text-slate-400 text-lg">
                  Premium AI models, datasets & algorithms • Pay with tokens
                </p>
              </div>
              
              <button 
                onClick={() => setShowCart(!showCart)}
                className="relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition flex items-center gap-2"
              >
                <ShoppingCart size={20} />
                Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Search models, datasets, algorithms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Types</option>
                <option value="model">Models</option>
                <option value="dataset">Datasets</option>
                <option value="algorithm">Algorithms</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                      selectedCategory === cat.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={18} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {searchQuery === '' && selectedCategory === 'all' && selectedType === 'all' && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Crown className="text-yellow-500" size={28} />
                  <h2 className="text-2xl font-bold text-white">Bestsellers</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bestsellerItems.slice(0, 2).map(item => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onAddToCart={addToCart}
                      onPurchase={handlePurchase}
                      isPurchased={isPurchased(item.id)}
                      wallet={wallet}
                      featured={true}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="text-cyan-400" size={28} />
                  <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {trendingItems.slice(0, 3).map(item => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onAddToCart={addToCart}
                      onPurchase={handlePurchase}
                      isPurchased={isPurchased(item.id)}
                      wallet={wallet}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-purple-400" size={28} />
              <h2 className="text-2xl font-bold text-white">
                {searchQuery || selectedCategory !== 'all' || selectedType !== 'all' 
                  ? 'Search Results' 
                  : 'All Items'}
              </h2>
              <span className="px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-400">
                {sortedItems.length} items
              </span>
            </div>

            {sortedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={addToCart}
                    onPurchase={handlePurchase}
                    isPurchased={isPurchased(item.id)}
                    wallet={wallet}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-12 text-center">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
                <p className="text-slate-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-md bg-[#1a1f2e] border-l-2 border-cyan-500 shadow-2xl overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-800 sticky top-0 bg-[#1a1f2e] z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
                <button 
                  onClick={() => setShowCart(false)}
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition"
                >
                  <ChevronRight size={20} className="text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400">{cart.length} items</p>
            </div>

            <div className="p-6">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{item.image}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">{item.name}</h3>
                            <p className="text-sm text-slate-400 mb-2">{item.seller}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Coins className="text-cyan-400" size={16} />
                                <span className="text-xl font-bold text-cyan-400">{item.tokens.toLocaleString()}</span>
                                <span className="text-sm text-slate-500">tokens</span>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-300 font-semibold">Total Cost</span>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Coins className="text-cyan-400" size={20} />
                          <span className="text-3xl font-bold text-white">{cartTotal.toLocaleString()}</span>
                        </div>
                        <span className="text-sm text-slate-500">tokens (≈ ${(cartTotal * 0.01).toFixed(2)})</span>
                      </div>
                    </div>

                    {wallet && (
                      <div className="flex items-center justify-between py-3 border-t border-slate-700 mb-4">
                        <span className="text-slate-400 text-sm">Your Balance</span>
                        <span className="text-white font-semibold">{wallet.balance.toLocaleString()} tokens</span>
                      </div>
                    )}

                    {wallet && wallet.balance < cartTotal && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-red-400 font-semibold text-sm">Insufficient Balance</p>
                            <p className="text-slate-400 text-xs">
                              You need {(cartTotal - wallet.balance).toLocaleString()} more tokens
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={checkoutCart}
                      disabled={!wallet || wallet.balance < cartTotal}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={20} />
                      Complete Purchase
                    </button>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Award className="text-yellow-500 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-yellow-400 font-semibold text-sm mb-1">Creator Support</p>
                        <p className="text-slate-300 text-xs">
                          70% of your purchase goes directly to the creators
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Your cart is empty</h3>
                  <p className="text-slate-400 mb-6">Browse the marketplace to add items</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* AI BOT POPUP */}
      <AigoBotPopup />
    </DashboardLayout>
  );
};

const ItemCard = ({ item, onAddToCart, onPurchase, isPurchased, wallet, featured = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const canAfford = wallet && wallet.balance >= item.tokens;

  return (
    <>
      <div className={`bg-[#1a1f2e] border ${featured ? 'border-yellow-500/50' : 'border-slate-800'} hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all group ${featured ? 'ring-2 ring-yellow-500/20' : ''}`}>
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8">
          <div className="text-6xl mb-4 text-center">{item.image}</div>
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {item.bestseller && (
              <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-lg flex items-center gap-1">
                <Crown size={12} />
                Bestseller
              </span>
            )}
            {item.trending && (
              <span className="px-2 py-1 bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                <TrendingUp size={12} />
                Trending
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
              item.type === 'model' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              item.type === 'dataset' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              {item.type.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">
            {item.name}
          </h3>
          
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="text-yellow-500" size={14} fill="currentColor" />
                <span className="text-sm font-bold text-white">{item.rating}</span>
              </div>
              <span className="text-xs text-slate-500">{item.reviews} reviews</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Download className="text-cyan-400" size={14} />
                <span className="text-sm font-bold text-white">{(item.downloads / 1000).toFixed(1)}K</span>
              </div>
              <span className="text-xs text-slate-500">downloads</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="text-purple-400" size={14} />
                <span className="text-sm font-bold text-white">{item.sellerRating}</span>
              </div>
              <span className="text-xs text-slate-500">seller</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {item.seller[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{item.seller}</p>
              <p className="text-xs text-slate-500">Verified Seller</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <Coins className="text-cyan-400" size={24} />
              <span className="text-3xl font-bold text-white">{item.tokens.toLocaleString()}</span>
              <span className="text-slate-400 text-sm">tokens</span>
            </div>
            <p className="text-center text-slate-500 text-xs mt-1">
              ≈ ${(item.tokens * 0.01).toFixed(2)} USD
            </p>
          </div>

          {wallet && !canAfford && !isPurchased && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-3">
              <p className="text-red-400 text-xs text-center">
                Insufficient balance ({wallet.balance.toLocaleString()} tokens)
              </p>
            </div>
          )}

          <div className="space-y-2">
            {isPurchased ? (
              <button className="w-full py-3 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-default">
                <CheckCircle size={18} />
                Purchased
              </button>
            ) : (
              <>
                <button
                  onClick={() => onPurchase(item)}
                  disabled={!canAfford}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Coins size={18} />
                  Buy Now
                </button>
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add to Cart
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowDetails(true)}
              className="w-full py-3 bg-slate-900/50 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              View Details
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setShowDetails(false)}>
          <div className="bg-[#1a1f2e] border-2 border-slate-800 rounded-3xl p-8 max-w-4xl w-full my-8 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition z-10"
            >
              <ChevronRight size={20} className="text-slate-400" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="text-7xl mb-6 text-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8">
                  {item.image}
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-3">{item.name}</h2>
                  <p className="text-slate-400 mb-4">{item.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {item.specs && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                    <h3 className="font-bold text-white mb-3">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(item.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-slate-400 capitalize">{key}:</span>
                          <span className="text-white font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                {item.features && (
                  <div className="mb-6">
                    <h3 className="font-bold text-white mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Coins className="text-cyan-400" size={32} />
                      <span className="text-5xl font-bold text-white">{item.tokens.toLocaleString()}</span>
                    </div>
                    <p className="text-center text-slate-400">tokens (≈ ${(item.tokens * 0.01).toFixed(2)} USD)</p>
                  </div>

                  {isPurchased ? (
                    <button className="w-full py-4 bg-green-500/20 border-2 border-green-500 text-green-400 font-bold rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle size={20} />
                      Already Purchased
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onPurchase(item);
                          setShowDetails(false);
                        }}
                        disabled={!canAfford}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Coins size={20} />
                        Purchase Now
                      </button>
                      {!canAfford && wallet && (
                        <p className="text-red-400 text-sm text-center mb-3">
                          Need {(item.tokens - wallet.balance).toLocaleString()} more tokens
                        </p>
                      )}
                      <button
                        onClick={() => {
                          onAddToCart(item);
                          setShowDetails(false);
                        }}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
                      >
                        <Plus size={20} />
                        Add to Cart
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Marketplace;