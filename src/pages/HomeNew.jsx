import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bolt, Brain, Check, Database, Globe, Link as LinkIcon, Loader2, MessageCircle, CirclePercent, Rocket, Shield, Smartphone, Sparkles, Upload, ChartColumn, Wallet, ShieldCheck, TrendingUp, Users, Mic, Eye, Layers, Zap, Crown } from 'lucide-react';
import NavbarNew from "../components/NavbarNew";
import { useMLPersonalization } from '../hooks/useMLPersonalization';
import { useAuth } from '../context/AuthContext';

function HomeNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [mlStatus, setMlStatus] = useState('Initializing AI Engine...');
  const [chatMessages, setChatMessages] = useState([{
    type: 'assistant',
    content: "Hey founder! 👋 Drop your idea or upload a sketch.\n\nI'll analyze and return:\n**Edge AI model, tech stack, algorithms, datasets, Seed AI compression target, and estimated budget.**"
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState('');
  const chatRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const logoFadeRef = useRef(null);

  // ML Personalization
  const { personalization, trackClick } = useMLPersonalization(user?.id);

  useEffect(() => {
    // ML Loading Sequence
    const loadingSteps = [
      { text: 'Initializing AI Engine...', delay: 500 },
      { text: 'Loading Neural Networks...', delay: 1000 },
      { text: 'Personalizing Experience...', delay: 1500 },
      { text: 'Ready to Launch!', delay: 2000 }
    ];

    loadingSteps.forEach(step => {
      setTimeout(() => {
        setMlStatus(step.text);
      }, step.delay);
    });

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Neural Network Canvas Animation
  useEffect(() => {
    if (!canvasRef.current || !showSplash) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 120;
    canvas.height = 120;

    const nodes = [];
    for (let i = 0; i < 8; i++) {
      nodes.push({
        x: Math.random() * 120,
        y: Math.random() * 120,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }

    let animationId;
    function animate() {
      ctx.clearRect(0, 0, 120, 120);

      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > 120) node.vx *= -1;
        if (node.y < 0 || node.y > 120) node.vy *= -1;

        nodes.forEach((other, j) => {
          if (i < j) {
            const dist = Math.hypot(node.x - other.x, node.y - other.y);
            if (dist < 60) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 60})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        });

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [showSplash]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setUploadedPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadedPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !uploadedFile) || isProcessing) return;

    trackClick('button', 'ask-aigo-send');

    const userMessage = { type: 'user', content: inputValue.trim(), image: uploadedPreview };
    setChatMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    setChatMessages(prev => [...prev, { type: 'assistant', status: 'typing' }]);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockBlueprint = {
        model: 'YOLOv10-Nano (Edge-optimized)',
        stack: 'React Native + ONNX Runtime',
        algorithms: ['Object Detection', 'Bounding Box Regression'],
        dataset: 'COCO 2017 (Subset: 5000 images)',
        seedAITarget: '90% compression → 2.4MB model',
        budget: '$450 (AWS Lambda + S3 + CloudFront)'
      };

      setChatMessages(prev => {
        const filtered = prev.filter(msg => msg.status !== 'typing');
        return [...filtered, {
          type: 'assistant',
          content: 'Here is an MVP blueprint tailored to your idea. Fine-tune any detail before exporting.',
          blueprint: mockBlueprint,
          hasImage: Boolean(uploadedFile)
        }];
      });
    } catch (error) {
      setChatMessages(prev => {
        const filtered = prev.filter(msg => msg.status !== 'typing');
        return [...filtered, { type: 'assistant', content: '⚠️ Unable to reach the MVP Builder. Please try again.' }];
      });
    } finally {
      setIsProcessing(false);
      resetUpload();
    }
  };

  const suggestionSeeds = ['🌱 Plant detector', '💪 Fitness coach', '🏠 Smart home'];

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          {/* Logo with Neural Network Canvas */}
          <div className="splash-logo-container">
            <div className="splash-neural-bg">
              <canvas ref={canvasRef} />
            </div>
            <div 
              ref={logoFadeRef}
              className="splash-logo-wrapper"
            >
              <img 
                src="/logo.png" 
                alt="AIGO" 
                className="splash-logo-image"
              />
            </div>
          </div>

          {/* Brand Name */}
          <h1 className="splash-brand-name">
            AIGO
          </h1>
          
          <p className="splash-tagline">Edge AI Platform for Founders</p>

          {/* ML Status */}
          <div className="splash-status">
            <div className="splash-status-dot" />
            <span>{mlStatus}</span>
          </div>

          {/* Loading Dots */}
          <div className="splash-loading-dots">
            <div className="splash-dot" style={{ animationDelay: '0s' }} />
            <div className="splash-dot" style={{ animationDelay: '0.16s' }} />
            <div className="splash-dot" style={{ animationDelay: '0.32s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavbarNew />

      {/* REVISED HERO SECTION */}
      <section id="hero" className="hero-section-wrapper">
        {/* Background Elements */}
        <div className="hero-bg-elements">
          <div className="hero-grid-pattern" />
          
          <div className="hero-gradient-orbs">
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />
          </div>

          <div className="hero-bg-logo-container">
            <img 
              src="/logo.png" 
              alt="AIGO Background" 
              className="hero-bg-logo"
            />
          </div>

          <div className="hero-particles">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="hero-particle" />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="hero-content-container">
          <motion.div 
            className="hero-content-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="hero-badge">
              <Sparkles className="h-3 w-3" />
              <span>Bring your dream from cloud to edge</span>
            </span>

            <h1 className="hero-title-3d">
              <span className="hero-title-line">AIGO provides the foundation</span>
              <span className="hero-title-line">for building your</span>
              <span className="hero-title-line bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">on-device intelligence.</span>
            </h1>

            <p className="hero-subtitle-enhanced">
              We believe in your talent. So should you.
            </p>

            <div className="hero-cta-buttons">
              <button 
                onClick={() => {
                  trackClick('button', 'hero-get-started');
                  navigate('/auth');
                }}
                className="hero-btn-primary"
              >
                <span>Get Started</span>
                <Rocket className="h-5 w-5" />
              </button>
              <button 
                onClick={() => {
                  trackClick('button', 'hero-ask-aigo');
                  scrollToSection('ask-aigo');
                }}
                className="hero-btn-secondary"
              >
                <span>Ask AIGO</span>
                <MessageCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="hero-stats-row">
              <motion.div 
                className="hero-stat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="hero-stat-value">2.4K+</div>
                <div className="hero-stat-label">Active Talents</div>
              </motion.div>
              <motion.div 
                className="hero-stat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="hero-stat-value">847</div>
                <div className="hero-stat-label">AI Models</div>
              </motion.div>
              <motion.div 
                className="hero-stat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className="hero-stat-value">94%</div>
                <div className="hero-stat-label">Match Success</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ASK AIGO SECTION */}
      <section id="ask-aigo" className="border-y border-slate-900 bg-slate-900/40 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">Try It Now</p>
          <h2 className="text-4xl font-black text-white mb-2">Ask AIGO</h2>
          <p className="text-lg text-slate-400">Your idea or image → Budget MVP infrastructure. Try it free.</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-900 p-5 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600">
                  <Bolt className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">AIGO AI Architect</p>
                  <p className="text-xs text-slate-400">Powered by OpenRouter • Vision + Text Understanding</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">Online</span>
              </div>
            </div>

            <div className="p-6" style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }} ref={chatRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 mb-6 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${msg.type === 'user' ? 'bg-slate-800' : 'bg-indigo-600'}`}>
                    {msg.type === 'user' ? <Upload className="h-4 w-4" /> : <Bolt className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 max-w-2xl ${msg.type === 'user' ? 'bg-slate-900/80' : 'bg-slate-900/60'}`}>
                    {msg.status === 'typing' ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AIGO is building your MVP blueprint...</span>
                      </div>
                    ) : (
                      <>
                        {msg.image && <img src={msg.image} alt="Upload" className="mb-3 w-full rounded-xl border border-slate-800" />}
                        {msg.content && <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                        {msg.blueprint && (
                          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                              <Brain className="h-4 w-4" />
                              <span>MVP Infrastructure</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              {Object.entries(msg.blueprint).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-xs uppercase text-slate-500">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <div className="font-mono text-white text-xs mt-1">{Array.isArray(value) ? value.join(', ') : value}</div>
                                </div>
                              ))}
                            </div>
                            <button 
                              onClick={() => {
                                trackClick('button', 'start-building-mvp');
                                navigate('/auth');
                              }}
                              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase text-white transition hover:bg-indigo-500"
                            >
                              Start Building This MVP
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-900 p-5 bg-slate-900/30">
              {uploadedPreview && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs">
                  <span className="text-slate-300">Image attached</span>
                  <button onClick={resetUpload} className="text-slate-400 hover:text-white">Remove</button>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    trackClick('button', 'upload-sketch');
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Sketch</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                  placeholder="Describe your app idea..."
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  rows={1}
                />
                
                <button 
                  onClick={handleSendMessage}
                  disabled={isProcessing || (!inputValue.trim() && !uploadedFile)}
                  className="flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3 text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>Try:</span>
                {suggestionSeeds.map(seed => (
                  <button 
                    key={seed}
                    onClick={() => {
                      trackClick('button', `suggestion-${seed}`);
                      setInputValue(seed.substring(3));
                    }}
                    className="rounded-full border border-slate-800 px-3 py-1 text-slate-300 transition hover:bg-slate-900"
                  >
                    {seed}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORDS FROM FOUNDER SECTION */}
      <section id="founder" className="px-6 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-20 animate-float" />
        
        <div className="mx-auto max-w-4xl relative">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-12 shadow-2xl backdrop-blur">
            
            {/* ML Personalization Badge */}
            {personalization && (
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg shadow-emerald-500/30 animate-slide-in-right">
                <Sparkles className="h-3 w-3" />
                <span>AI Personalized</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-cyan-500">
              <span className="text-cyan-400 text-xl">✦</span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Words from Founder</span>
            </div>

            <h2 className="text-4xl font-black mb-8 bg-gradient-to-r from-white via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              The Era of Collective Talent
            </h2>

            <div className="space-y-6 text-lg text-slate-400 leading-relaxed mb-10">
              <p className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                "In today's volatile economy, the path of the solo founder has never been more challenging. As <span className="text-white font-semibold relative inline-block">Edge AI<span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-50"></span></span> reshapes the world—moving intelligence from distant servers to the very devices we hold—the demand for specialized algorithms is exploding. Yet, many of the world's greatest talents remain isolated.
              </p>
              
              <p className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                AIGO was born from a simple realization: <span className="text-white font-semibold relative inline-block">No one should have to build alone.<span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-50"></span></span>
              </p>
              
              <p className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                We are here to provide the <strong className="text-white">anchor</strong>. We are building more than a marketplace; we are forging a community where individual capability is amplified by collective strength. We provide the platform to reveal your unique talents to the world."
              </p>
            </div>

            {/* ML Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 border border-cyan-500/20 rounded-2xl">
              <div className="text-center p-4 bg-slate-900/50 rounded-xl hover:transform hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  <Users className="h-10 w-10 mx-auto mb-2 text-cyan-400" />
                  2.4K+
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Active Talents</div>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-xl hover:transform hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  <Brain className="h-10 w-10 mx-auto mb-2 text-indigo-400" />
                  847
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500">AI Models</div>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-xl hover:transform hover:-translate-y-1 transition-transform">
                <div className="text-4xl font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 text-emerald-400" />
                  94%
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Match Success</div>
              </div>
            </div>

            <div className="flex items-center gap-5 pt-8 border-t border-slate-800">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-indigo-500/40">
                A
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-1">AIGO Founder</h4>
                <p className="text-sm text-cyan-400 font-semibold">Visionary Leader & AI Advocate</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => {
                  trackClick('button', 'founder-explore-marketplace');
                  navigate('/marketplace');
                }}
                className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition hover:scale-105 overflow-hidden group"
              >
                <span className="relative z-10">Explore Marketplace</span>
                <ArrowRight className="h-5 w-5 relative z-10" />
                <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-xs font-black px-2 py-1 rounded-bl-lg">
                  AI Pick
                </div>
                <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 rounded-full transition-transform duration-600 origin-center" />
              </button>

              <button
                onClick={() => {
                  trackClick('button', 'founder-join-community');
                  navigate('/auth');
                }}
                className="flex items-center gap-3 px-8 py-4 border-2 border-cyan-500 text-cyan-400 font-bold rounded-xl transition hover:bg-cyan-500/10"
              >
                <span>Join Community</span>
                <Sparkles className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONDENSED FEATURES SECTION */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">Core Features</h2>
          <p className="text-lg text-slate-400">Everything You Need</p>
          <p className="text-sm text-slate-500 mt-2">Idea → Blueprint → Deploy</p>
        </div>
        
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">MVP Architect</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Complete technical blueprint with stack recommendations.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Edge AI Models</h3>
            <p className="text-sm text-slate-400 leading-relaxed">50+ models for vision, NLP, audio. 10ms inference.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Algorithm Library</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Object detection, sentiment, dyslexia detection.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dataset Curation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Licensed, training-ready datasets with AI recommendations.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <CirclePercent className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Seed AI Compression</h3>
            <p className="text-sm text-slate-400 leading-relaxed">90% smaller models. Perfect for mobile & IoT.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">One-Click Export</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Native iOS + Android apps. App Store ready.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Speech & Lip Sync</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Real-time lip analysis for pronunciation feedback.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dyslexia Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Eye-tracking and adaptive learning pathways.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="pipeline" className="border-y border-slate-900 bg-slate-900/40 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">How It Works</p>
          <h2 className="text-4xl font-black text-white mb-2">Idea → Production in 4 Steps</h2>
          <p className="text-lg text-slate-400">Concept to deployed AI product. Faster than ever.</p>
        </div>
        
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              1
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Define Your MVP</h3>
            <p className="text-sm text-slate-400">Text or sketch → Blueprint with AI models, tech stack, and estimated costs.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              2
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Select & Train</h3>
            <p className="text-sm text-slate-400">Choose Edge AI models. Get AI-recommended datasets. Fine-tune for your use case.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              3
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Optimize with Seed AI</h3>
            <p className="text-sm text-slate-400">90% model compression, accuracy maintained. Set benchmarks, we optimize.</p>
          </div>

          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              4
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Deploy Everywhere</h3>
            <p className="text-sm text-slate-400">One-click export to iOS, Android, web, IoT. Custom domain + backend ready.</p>
          </div>
        </div>
      </section>

{/* REVISED CREATORS SECTION */}
{/* REVISED CREATORS SECTION */}
<section id="creator" className="px-6 py-20">
  <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
    <div>
      <h2 className="text-4xl font-black text-white mb-4">
        Become an <span className="text-purple-400">AI Creator</span>
      </h2>
      <p className="text-lg text-slate-400 mb-8">
        We're dedicated to empowering talent—offering <span className="text-white font-semibold">up to 95% commission</span> on every model, dataset, and algorithm you publish.
      </p>
      
      <div className="space-y-5">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
            <ChartColumn className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Real-Time Analytics</h4>
            <p className="text-sm text-slate-400">Track downloads, usage, and earnings</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">IP Protection</h4>
            <p className="text-sm text-slate-400">Your models are encrypted and secured</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          trackClick('button', 'start-publishing');
          navigate('/auth');
        }}
        className="mt-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
      >
        Start Publishing
      </button>
    </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-900 bg-slate-950/70 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white bg-cyan-500">
            JC
          </div>
          <div>
            <p className="text-sm font-bold text-white">James Chen</p>
            <p className="text-xs text-slate-500">Vision Model Creator</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">This Month</p>
          <p className="font-mono text-sm font-bold text-white">$2,847</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-900 bg-slate-950/70 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white bg-purple-500">
            SK
          </div>
          <div>
            <p className="text-sm font-bold text-white">Sarah Kim</p>
            <p className="text-xs text-slate-500">NLP Specialist</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">This Month</p>
          <p className="font-mono text-sm font-bold text-white">$1,923</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-900 bg-slate-950/70 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white bg-emerald-500">
            MP
          </div>
          <div>
            <p className="text-sm font-bold text-white">Mike Park</p>
            <p className="text-xs text-slate-500">Audio AI Expert</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">This Month</p>
          <p className="font-mono text-sm font-bold text-white">$3,156</p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* REVISED PRICING SECTION - ANNUAL POWER PASS */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-2">Annual Power Pass</h2>
          <p className="text-lg text-slate-400">Unlock full platform access. Build unlimited AI products.</p>
          <p className="text-sm text-slate-500 mt-2">Simple pricing. No hidden fees.</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Free Tier */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-slate-400" />
              <h3 className="text-xl font-bold text-white">Free</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-sm text-slate-500">/forever</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">For solo founders validating their first Edge AI MVP.</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Platform access</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>5 Gold Datasets</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Community support</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Basic Pitch Video</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                trackClick('button', 'pricing-free-tier');
                navigate('/auth');
              }}
              className="w-full rounded-2xl border border-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900"
            >
              Start Building
            </button>
          </div>

          {/* Basic - $29/year */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Basic</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white">$29</span>
              <span className="text-sm text-slate-500">/year</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Everything to launch your first AI product.</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>500 free tokens/month</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>50GB dataset storage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>10 AI models</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Priority email support</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                trackClick('button', 'pricing-basic-tier');
                navigate('/auth');
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-5 py-3 text-sm font-bold transition hover:opacity-90"
            >
              Get Basic
            </button>
          </div>

          {/* Pro - $99/year (Most Popular) */}
          <div className="relative rounded-3xl border-2 border-purple-500 bg-slate-950/60 p-8 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Most Popular
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Pro</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white">$99</span>
              <span className="text-sm text-slate-500">/year</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">For serious builders shipping multiple AI products.</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">2,000 free tokens/month</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">500GB dataset storage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Unlimited AI models</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">24/7 priority support</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                trackClick('button', 'pricing-pro-tier');
                navigate('/auth');
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white px-5 py-3 text-sm font-bold transition"
            >
              Get Pro
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">Enterprise</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white">Custom</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Custom infrastructure for industrial-scale deployment.</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Dedicated GPU Nodes</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>SLA Guarantees</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Unlimited Deployments</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Dedicated Support</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                trackClick('button', 'pricing-enterprise');
                navigate('/auth');
              }}
              className="w-full rounded-2xl bg-white text-black hover:bg-slate-200 px-5 py-3 text-sm font-bold transition"
            >
              Contact Sales
            </button>
          </div>
        </div>

        {/* Token Packs Add-on Section */}
        <div className="mx-auto max-w-3xl mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-white mb-2">Need More Tokens?</h3>
            <p className="text-slate-400">Purchase additional tokens for training and deployments</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white">500 Tokens</h4>
                  <p className="text-xs text-slate-500">For small projects</p>
                </div>
                <div className="text-2xl font-black text-white">$9.90</div>
              </div>
              <button 
                onClick={() => {
                  trackClick('button', 'buy-tokens-500');
                  navigate('/wallet');
                }}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-sm font-semibold transition"
              >
                Purchase
              </button>
            </div>

            <div className="rounded-2xl border border-slate-900 bg-slate-950/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white">1,500 Tokens</h4>
                  <p className="text-xs text-slate-500">Best value</p>
                </div>
                <div className="text-2xl font-black text-white">$19.90</div>
              </div>
              <button 
                onClick={() => {
                  trackClick('button', 'buy-tokens-1500');
                  navigate('/wallet');
                }}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2 text-sm font-semibold transition"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-2 text-white mb-6">
            <img 
              src="/logo.png" 
              alt="AIGO Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-black italic">AIGO</span>
          </div>
          
          <p className="text-center text-sm text-slate-500 mb-6">Edge AI for founders. Launch your MVP without the enterprise budget.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-slate-600 mb-8">
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-400 transition">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-400 transition">Pricing</button>
            <button onClick={() => navigate('/marketplace')} className="hover:text-slate-400 transition">Marketplace</button>
            <button onClick={() => navigate('/docs')} className="hover:text-slate-400 transition">Documentation</button>
            <button onClick={() => scrollToSection('creator')} className="hover:text-slate-400 transition">Creators</button>
            <button onClick={() => navigate('/contact')} className="hover:text-slate-400 transition">Contact</button>
          </div>
          
          <p className="text-center text-xs text-slate-600">© 2026 AIGO. Product by AuraSense Limited. Incorporated in Hong Kong.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomeNew;