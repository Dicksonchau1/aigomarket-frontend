import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Zap, Send, Download, Copy, Check, Sparkles, DollarSign } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { openRouterService } from '../services/openrouter.service';
import { useTokens } from '../context/TokenContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import toast from 'react-hot-toast';

const Architect = () => {
  const [requirements, setRequirements] = useState('');
  const [architecture, setArchitecture] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const { deductTokens } = useTokens();
  const outputRef = useRef(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
    });
  }, []);

  // Render mermaid diagrams
  useEffect(() => {
    if (architecture && outputRef.current) {
      mermaid.contentLoaded();
    }
  }, [architecture]);

  const models = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', cost: 'Medium' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', cost: 'Medium' },
    { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', cost: 'High' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', cost: 'Low' },
  ];

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      toast.error('Please describe your project requirements');
      return;
    }

    setIsGenerating(true);
    setArchitecture('');
    setTokenCount(0);
    setEstimatedCost(0);

    try {
      const result = await openRouterService.generateArchitecture(requirements, {
        model: selectedModel,
        onProgress: (content) => {
          setArchitecture(content);
        },
        onTokenCount: (tokens) => {
          setTokenCount(tokens);
          const cost = openRouterService.calculateCost(tokens, selectedModel);
          setEstimatedCost(cost);
        },
        maxTokens: 4000
      });

      // Deduct tokens from user balance
      const tokensToDeduct = Math.ceil(result.cost * 1000); // Convert USD to tokens
      await deductTokens(tokensToDeduct, 'Architecture Generation');
      toast.success('Architecture generated successfully!');

    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error('Architecture generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(architecture);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([architecture], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `architecture-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Architecture downloaded!');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0f1420] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Cpu className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">MVP Architect</h1>
                <p className="text-slate-400">AI-powered architecture generation with OpenRouter</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Project Requirements</h2>
                
                {/* Model Selection */}
                <div className="mb-4">
                  <label className="text-sm text-slate-400 mb-2 block font-semibold">AI Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.cost} Cost
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe your project in detail...&#10;&#10;Example:&#10;I need a real-time chat application with:&#10;- User authentication&#10;- Group messaging&#10;- File sharing&#10;- Video calls&#10;- Mobile apps for iOS and Android"
                  className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                />

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !requirements.trim()}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      Generating Architecture...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Architecture
                    </>
                  )}
                </button>

                {/* Cost Estimate */}
                {(isGenerating || tokenCount > 0) && (
                  <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Tokens Used:</span>
                      <span className="text-purple-400 font-bold">{tokenCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Estimated Cost:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <DollarSign size={14} />
                        {estimatedCost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Generated Architecture</h2>
                  {architecture && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        title="Download as Markdown"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div
                  ref={outputRef}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-6 min-h-[500px] max-h-[700px] overflow-y-auto custom-scrollbar"
                >
                  {architecture ? (
                    <ReactMarkdown
                      className="prose prose-invert prose-purple max-w-none"
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          
                          if (match && match[1] === 'mermaid') {
                            return (
                              <div className="mermaid my-4">
                                {String(children).replace(/\n$/, '')}
                              </div>
                            );
                          }
                          
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg my-4"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {architecture}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <Cpu size={48} className="mb-4 opacity-20" />
                      <p className="text-center">
                        {isGenerating
                          ? 'AI is analyzing your requirements...'
                          : 'Your generated architecture will appear here'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgb(15 23 42);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgb(71 85 105);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgb(100 116 139);
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default Architect;
