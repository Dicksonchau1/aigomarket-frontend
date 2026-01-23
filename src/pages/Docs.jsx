import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Book, 
  Code, 
  Terminal, 
  Key, 
  Zap, 
  Shield, 
  Copy, 
  Check,
  ExternalLink,
  FileText,
  Webhook,
  Database,
  Lock,
  Globe,
  Cpu,
  Layout,
  ChevronRight,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Docs = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Shield },
    { id: 'endpoints', label: 'API Endpoints', icon: Terminal },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'examples', label: 'Code Examples', icon: Code },
    { id: 'sdks', label: 'SDKs & Libraries', icon: Layout }
  ];

  const codeExamples = {
    javascript: `// Initialize Aigo SDK
import { AigoClient } from '@aigo/sdk';

const client = new AigoClient({
  apiKey: 'your_api_key_here',
  baseURL: 'https://api.aigo.market'
});

// Create a new project
const project = await client.projects.create({
  name: 'My AI App',
  category: 'ai-agents',
  description: 'An intelligent chatbot',
  pricing: {
    type: 'paid',
    price: 29.99
  }
});

// Deploy to custom domain
await client.domains.deploy({
  projectId: project.id,
  domain: 'myapp.example.com'
});

console.log('Project deployed:', project.url);`,

    python: `# Install: pip install aigo-sdk
from aigo import AigoClient

# Initialize client
client = AigoClient(
    api_key='your_api_key_here',
    base_url='https://api.aigo.market'
)

# Create project
project = client.projects.create(
    name='My AI App',
    category='ai-agents',
    description='An intelligent chatbot',
    pricing={
        'type': 'paid',
        'price': 29.99
    }
)

# Deploy to domain
client.domains.deploy(
    project_id=project.id,
    domain='myapp.example.com'
)

print(f'Project deployed: {project.url}')`,

    curl: `# Create a new project
curl -X POST https://api.aigo.market/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My AI App",
    "category": "ai-agents",
    "description": "An intelligent chatbot",
    "pricing": {
      "type": "paid",
      "price": 29.99
    }
  }'

# Deploy to custom domain
curl -X POST https://api.aigo.market/v1/domains/deploy \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "proj_123456",
    "domain": "myapp.example.com"
  }'`
  };

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/v1/projects',
      description: 'Create a new project',
      auth: true
    },
    {
      method: 'GET',
      endpoint: '/v1/projects',
      description: 'List all projects',
      auth: true
    },
    {
      method: 'GET',
      endpoint: '/v1/projects/:id',
      description: 'Get project details',
      auth: true
    },
    {
      method: 'PUT',
      endpoint: '/v1/projects/:id',
      description: 'Update project',
      auth: true
    },
    {
      method: 'DELETE',
      endpoint: '/v1/projects/:id',
      description: 'Delete project',
      auth: true
    },
    {
      method: 'POST',
      endpoint: '/v1/domains',
      description: 'Add custom domain',
      auth: true
    },
    {
      method: 'POST',
      endpoint: '/v1/domains/:id/verify',
      description: 'Verify domain DNS',
      auth: true
    },
    {
      method: 'GET',
      endpoint: '/v1/analytics',
      description: 'Get analytics data',
      auth: true
    },
    {
      method: 'POST',
      endpoint: '/v1/webhooks',
      description: 'Create webhook',
      auth: true
    },
    {
      method: 'GET',
      endpoint: '/v1/marketplace/projects',
      description: 'Browse marketplace',
      auth: false
    }
  ];

  const webhookEvents = [
    {
      event: 'project.created',
      description: 'Triggered when a new project is created',
      payload: { projectId: 'string', name: 'string', createdAt: 'timestamp' }
    },
    {
      event: 'project.deployed',
      description: 'Triggered when a project is deployed',
      payload: { projectId: 'string', url: 'string', deployedAt: 'timestamp' }
    },
    {
      event: 'domain.verified',
      description: 'Triggered when a custom domain is verified',
      payload: { domainId: 'string', domain: 'string', verifiedAt: 'timestamp' }
    },
    {
      event: 'payment.received',
      description: 'Triggered when payment is received',
      payload: { amount: 'number', currency: 'string', buyerId: 'string' }
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Getting Started with Aigo API</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                The Aigo API allows you to programmatically manage your AI applications, custom domains, 
                analytics, and marketplace listings. This comprehensive guide will help you integrate 
                Aigo into your workflow.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <Zap className="text-cyan-400 mb-3" size={32} />
                  <h3 className="text-white font-bold text-lg mb-2">Fast & Reliable</h3>
                  <p className="text-slate-300 text-sm">99.9% uptime SLA with global CDN</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                  <Shield className="text-purple-400 mb-3" size={32} />
                  <h3 className="text-white font-bold text-lg mb-2">Secure</h3>
                  <p className="text-slate-300 text-sm">Enterprise-grade security & encryption</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                  <Code className="text-green-400 mb-3" size={32} />
                  <h3 className="text-white font-bold text-lg mb-2">Developer-Friendly</h3>
                  <p className="text-slate-300 text-sm">RESTful API with comprehensive SDKs</p>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Key size={20} className="text-cyan-400" />
                  API Base URL
                </h3>
                <div className="bg-[#0f1420] border border-slate-800 rounded-lg p-4 font-mono">
                  <div className="flex items-center justify-between">
                    <code className="text-cyan-400">https://api.aigo.market/v1</code>
                    <button
                      onClick={() => copyToClipboard('https://api.aigo.market/v1', 'base-url')}
                      className="p-2 hover:bg-slate-800 rounded transition"
                    >
                      {copiedCode === 'base-url' ? (
                        <Check size={16} className="text-green-400" />
                      ) : (
                        <Copy size={16} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'authentication':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Authentication</h2>
              <p className="text-slate-300 text-lg mb-6">
                All API requests require authentication using your API key. Include your key in the 
                Authorization header of every request.
              </p>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Lock className="text-orange-400 mt-1" size={24} />
                  <div>
                    <h3 className="text-white font-bold mb-2">Keep Your API Key Secret</h3>
                    <p className="text-slate-300 text-sm">
                      Never expose your API key in client-side code, public repositories, or logs. 
                      Use environment variables in production.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Authentication Header</h3>
                <div className="bg-[#0f1420] border border-slate-800 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-slate-400">Authorization: <span className="text-cyan-400">Bearer YOUR_API_KEY</span></code>
                    <button
                      onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                      className="p-1 hover:bg-slate-800 rounded transition"
                    >
                      {copiedCode === 'auth-header' ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Example Request</h3>
                <div className="bg-[#0f1420] border border-slate-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">
{`curl https://api.aigo.market/v1/projects \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mt-6">
                <h3 className="text-white font-bold mb-2">Get Your API Key</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Generate your API key from the Settings page in your dashboard.
                </p>
                <a
                  href="/dashboard/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition"
                >
                  Go to Settings
                  <ChevronRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>
        );

      case 'endpoints':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">API Endpoints</h2>
              <p className="text-slate-300 text-lg mb-6">
                Comprehensive list of all available API endpoints and their usage.
              </p>

              <div className="space-y-3">
                {apiEndpoints.map((endpoint, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl p-5 transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded font-mono text-xs font-bold ${
                            endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-cyan-400 font-mono text-sm">{endpoint.endpoint}</code>
                          {endpoint.auth && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-semibold">
                              🔒 Auth Required
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm">{endpoint.description}</p>
                      </div>
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition">
                        <ExternalLink size={16} className="text-slate-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'webhooks':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Webhooks</h2>
              <p className="text-slate-300 text-lg mb-6">
                Receive real-time notifications when events occur in your Aigo account.
              </p>

              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Setup Webhook</h3>
                <div className="bg-[#0f1420] border border-slate-800 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-slate-300">
{`POST /v1/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://yourdomain.com/webhooks",
  "events": ["project.created", "payment.received"],
  "secret": "whsec_abc123..."
}`}
                  </pre>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">Available Events</h3>
              <div className="space-y-3">
                {webhookEvents.map((webhook, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Webhook className="text-purple-400 mt-1" size={20} />
                      <div className="flex-1">
                        <code className="text-cyan-400 font-mono text-sm font-bold">{webhook.event}</code>
                        <p className="text-slate-300 text-sm mt-1">{webhook.description}</p>
                      </div>
                    </div>
                    <div className="bg-[#0f1420] border border-slate-800 rounded-lg p-3 font-mono text-xs">
                      <pre className="text-slate-400">
{JSON.stringify(webhook.payload, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">Code Examples</h2>
              <p className="text-slate-300 text-lg mb-6">
                Ready-to-use code snippets in multiple programming languages.
              </p>

              {Object.entries(codeExamples).map(([lang, code], index) => (
                <motion.div
                  key={lang}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <Code className="text-cyan-400" size={20} />
                      <span className="text-white font-semibold capitalize">{lang}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(code, lang)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
                    >
                      {copiedCode === lang ? (
                        <>
                          <Check size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6 bg-[#0f1420] overflow-x-auto">
                    <pre className="text-slate-300 text-sm font-mono leading-relaxed">
                      {code}
                    </pre>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );

      case 'sdks':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">SDKs & Libraries</h2>
              <p className="text-slate-300 text-lg mb-6">
                Official SDKs and community libraries for popular programming languages.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'JavaScript/TypeScript', package: '@aigo/sdk', icon: '🟨', status: 'official' },
                  { name: 'Python', package: 'aigo-sdk', icon: '🐍', status: 'official' },
                  { name: 'Go', package: 'github.com/aigo/go-sdk', icon: '🔷', status: 'official' },
                  { name: 'Ruby', package: 'aigo-ruby', icon: '💎', status: 'community' },
                  { name: 'PHP', package: 'aigo/php-sdk', icon: '🐘', status: 'community' },
                  { name: 'Java', package: 'com.aigo.sdk', icon: '☕', status: 'community' }
                ].map((sdk, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{sdk.icon}</span>
                        <div>
                          <h3 className="text-white font-bold">{sdk.name}</h3>
                          <code className="text-xs text-slate-400 font-mono">{sdk.package}</code>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        sdk.status === 'official' 
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {sdk.status}
                      </span>
                    </div>
                    <button className="w-full mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                      <ExternalLink size={16} />
                      View Documentation
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420]">
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block w-64 border-r border-slate-800 min-h-screen sticky top-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">API Docs</h2>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        activeTab === tab.id
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden w-full border-b border-slate-800 p-4 sticky top-0 bg-[#0f1420] z-10">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Docs;