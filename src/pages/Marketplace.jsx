import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Star, 
  Download, 
  TrendingUp,
  Filter,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { database } from '../services/database';

function Marketplace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { id: 'all', name: 'All Models' },
    { id: 'image', name: 'Image Classification' },
    { id: 'object', name: 'Object Detection' },
    { id: 'nlp', name: 'Natural Language' },
    { id: 'audio', name: 'Audio Processing' }
  ];

  useEffect(() => {
    loadMarketplaceModels();
  }, []);

  useEffect(() => {
    filterModels();
  }, [searchQuery, selectedCategory, models]);

  const loadMarketplaceModels = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('marketplace_models')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .order('downloads', { ascending: false });

      if (fetchError) throw fetchError;

      setModels(data || []);
    } catch (err) {
      setError('Failed to load marketplace: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = models;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredModels(filtered);
  };

  const handlePurchase = async (model) => {
    try {
      setError('');
      setSuccess('');

      const balance = await database.wallet.getBalance();
      
      if (balance < model.price) {
        setError('Insufficient tokens. Please add more tokens to your account.');
        return;
      }

      // Deduct tokens
      await database.wallet.updateBalance(model.price, 'debit');

      // Record purchase
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: purchaseError } = await supabase
        .from('model_purchases')
        .insert([{
          user_id: user.id,
          model_id: model.id,
          price: model.price,
          created_at: new Date().toISOString()
        }]);

      if (purchaseError) throw purchaseError;

      // Update download count
      await supabase
        .from('marketplace_models')
        .update({ downloads: model.downloads + 1 })
        .eq('id', model.id);

      setSuccess(`Successfully purchased "${model.name}"! Check your Models page to download.`);
      loadMarketplaceModels();
    } catch (err) {
      setError('Failed to purchase model: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Model Marketplace</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No models found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div key={model.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              {/* Model Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-6xl font-bold opacity-20">
                  {model.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{model.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <img
                        src={model.profiles?.avatar_url || '/default-avatar.png'}
                        alt={model.profiles?.display_name}
                        className="w-5 h-5 rounded-full"
                        onError={(e) => e.target.src = '/default-avatar.png'}
                      />
                      <span>{model.profiles?.display_name || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{model.rating || '5.0'}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {model.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{model.downloads || 0} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{model.accuracy || 0}% accuracy</span>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div>
                    {model.price === 0 ? (
                      <span className="text-lg font-bold text-green-600">Free</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold">{model.price}</span>
                        <span className="text-sm text-gray-600">tokens</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handlePurchase(model)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {model.price === 0 ? 'Download' : 'Purchase'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Marketplace;