import React, { useState } from 'react';
import { 
  Send, 
  MessageCircle, 
  BookOpen, 
  HelpCircle,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { database } from '../services/database';
import { supabase } from '../lib/supabase';

function Support() {
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I create a new AI project?',
      answer: 'Click on "New Project" from your dashboard, select your project type (Image Classification, Object Detection, etc.), upload your dataset, and configure your model settings. The system will guide you through the training process.'
    },
    {
      question: 'What file formats are supported for datasets?',
      answer: 'We support CSV, JSON, images (JPG, PNG), and compressed archives (ZIP). For image datasets, ensure they are properly labeled and organized in folders.'
    },
    {
      question: 'How do tokens work?',
      answer: 'Tokens are used to train models and run predictions. You receive 100 free tokens when you sign up. You can purchase more tokens or earn them by contributing to the marketplace.'
    },
    {
      question: 'Can I export my trained models?',
      answer: 'Yes! Once your model is trained, you can download it in various formats (TensorFlow, PyTorch, ONNX) from the Models page.'
    },
    {
      question: 'How long does model training take?',
      answer: 'Training time depends on your dataset size and model complexity. Small datasets typically take 5-15 minutes, while larger ones may take several hours. You\'ll receive an email when training completes.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties.'
    }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          subject: contactForm.subject,
          category: contactForm.category,
          message: contactForm.message,
          status: 'open',
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      setSuccess('Your message has been sent! We\'ll get back to you within 24 hours.');
      setContactForm({
        subject: '',
        category: 'general',
        message: ''
      });
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Help & Support</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 px-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Contact Us
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 px-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'faq'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`pb-3 px-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'docs'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Documentation
        </button>
      </div>

      {/* Contact Form */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Send us a message</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={contactForm.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={contactForm.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing & Payments</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide as much detail as possible..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 group">
              <summary className="font-semibold cursor-pointer flex items-center justify-between">
                {faq.question}
                <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      )}

      {/* Documentation */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Documentation</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Quick Start Guide</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Creating Your First Project</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Understanding Tokens</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Data Preparation</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Dataset Format Guidelines</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Image Labeling Best Practices</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Data Augmentation Techniques</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Model Training</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Choosing the Right Model Architecture</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Hyperparameter Tuning</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Evaluating Model Performance</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Deployment</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Deploying Your Model</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">API Integration Guide</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Monitoring & Analytics</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">API Reference</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">REST API Documentation</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">Python SDK</a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <a href="#" className="hover:text-blue-600 hover:underline">JavaScript SDK</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Support;