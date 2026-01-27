import React, { useState } from 'react';
import { 
  Send, 
  MessageCircle, 
  BookOpen, 
  HelpCircle,
  Mail,
  Phone,
  Building2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Support() {
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I create a new AI project?',
      answer: 'Click on "New Project" from your dashboard, select your project type, upload your dataset, and configure your model settings.'
    },
    {
      question: 'What file formats are supported for datasets?',
      answer: 'We support CSV, JSON, images (JPG, PNG), and compressed archives (ZIP).'
    },
    {
      question: 'How do tokens work?',
      answer: 'Tokens are used to train models and run predictions. You receive 100 free tokens when you sign up.'
    },
    {
      question: 'Can I export my trained models?',
      answer: 'Yes! Once your model is trained, you can download it in various formats (TensorFlow, PyTorch, ONNX).'
    },
    {
      question: 'How long does model training take?',
      answer: 'Training time depends on dataset size. Small datasets take 5-15 minutes, larger ones may take several hours.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. All data is encrypted in transit and at rest using industry-standard security practices.'
    }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

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

      toast.success('Message sent! We\'ll respond within 24 hours.');
      setContactForm({
        subject: '',
        category: 'general',
        message: ''
      });
    } catch (err) {
      toast.error('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-2">Help & Support</h1>
            <p className="text-slate-400">Get assistance with your AIGO account and projects</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-800">
            {[
              { id: 'contact', label: 'Contact Us', icon: MessageCircle },
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'docs', label: 'Documentation', icon: BookOpen }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-bold transition relative ${
                    activeTab === tab.id
                      ? 'text-cyan-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Contact Form */}
              {activeTab === 'contact' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Send us a message</h2>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        placeholder="Brief description of your issue"
                        className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                      >
                        <option value="general">General Question</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Bug Report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Please provide as much detail as possible..."
                        rows="6"
                        className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send size={18} />
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}

              {/* FAQ */}
              {activeTab === 'faq' && (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 group">
                      <summary className="font-bold text-white cursor-pointer flex items-center justify-between list-none">
                        <span className="flex-1">{faq.question}</span>
                        <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="mt-4 text-slate-400 leading-relaxed">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              )}

              {/* Documentation */}
              {activeTab === 'docs' && (
                <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6 lg:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Documentation</h2>
                  
                  <div className="space-y-8">
                    {/* Getting Started */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Getting Started</h3>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#quick-start"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Quick Start Guide</div>
                              <p className="text-sm text-slate-500">Learn the basics of AIGO platform and create your first Edge AI project in minutes.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#first-project"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Creating Your First Project</div>
                              <p className="text-sm text-slate-500">Step-by-step tutorial on building your first AI model from idea to deployment.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#tokens"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Understanding Tokens</div>
                              <p className="text-sm text-slate-500">How tokens work, pricing structure, and tips to optimize your token usage.</p>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Data Preparation */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Data Preparation</h3>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#dataset-formats"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Dataset Format Guidelines</div>
                              <p className="text-sm text-slate-500">Supported formats, file structure requirements, and best practices for organizing datasets.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#image-labeling"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Image Labeling Best Practices</div>
                              <p className="text-sm text-slate-500">Professional techniques for accurate labeling and annotation to improve model accuracy.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#data-augmentation"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Data Augmentation Techniques</div>
                              <p className="text-sm text-slate-500">Expand your dataset using rotation, flipping, cropping, and other augmentation methods.</p>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Model Training */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Model Training</h3>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#model-selection"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Choosing the Right Architecture</div>
                              <p className="text-sm text-slate-500">Guide to selecting optimal Edge AI models: YOLO, MobileNet, EfficientNet, and more.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#hyperparameters"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Hyperparameter Tuning</div>
                              <p className="text-sm text-slate-500">Optimize learning rate, batch size, epochs, and other parameters for peak performance.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#evaluation"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Evaluating Model Performance</div>
                              <p className="text-sm text-slate-500">Understanding accuracy, precision, recall, F1 score, and interpreting training metrics.</p>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Deployment */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Deployment</h3>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="#deployment-guide"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Deploying Your Model</div>
                              <p className="text-sm text-slate-500">Export to iOS, Android, web, and IoT devices. One-click deployment to production.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#api-integration"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">API Integration Guide</div>
                              <p className="text-sm text-slate-500">Connect your app to AIGO models using REST APIs, SDKs, and webhooks.</p>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="#monitoring"
                            className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition group"
                          >
                            <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-slate-200 font-semibold group-hover:text-white transition mb-1">Monitoring & Analytics</div>
                              <p className="text-sm text-slate-500">Track model performance, user engagement, and optimization opportunities in real-time.</p>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Email</p>
                      <a href="mailto:support@aigo.ai" className="text-sm text-cyan-400 hover:underline">
                        support@aigo.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Phone</p>
                      <a href="tel:+85234958559" className="text-sm text-purple-400 hover:underline">
                        +852 3495 8559
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Company</p>
                      <p className="text-sm text-slate-400">AIGO is a product by</p>
                      <p className="text-sm text-indigo-400 font-semibold">AuraSense Limited</p>
                      <p className="text-xs text-slate-500 mt-1">Incorporated in Hong Kong</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Fast Response</h3>
                  <p className="text-sm text-slate-400">
                    We typically respond within <span className="text-cyan-400 font-bold">24 hours</span>
                  </p>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-bold text-emerald-400">All Systems Operational</p>
                    <p className="text-xs text-slate-400">Last updated: Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}