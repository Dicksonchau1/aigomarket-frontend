import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bolt, Brain, Check, Database, Globe, Link as LinkIcon, Loader2, MessageCircle, CirclePercent, Rocket, Shield, Smartphone, Sparkles, Upload, ChartColumn, Wallet, ShieldCheck } from 'lucide-react';
import NavbarNew from "../components/NavbarNew";
import AuthModal from '../components/AuthModal';

function HomeNew() {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [showSplash, setShowSplash] = useState(true);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenAuthModal = (mode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
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

  // SIMPLIFIED Animation Variants for Framer Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 animate-fade-out">
        <div className="text-center animate-fade-in">
          <img 
            src="/logo.jpeg" 
            alt="AIGO" 
            className="h-32 w-32 mx-auto mb-6 object-contain drop-shadow-[0_0_80px_rgba(6,182,212,0.6)] animate-pulse-slow"
          />
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">AIGO</h1>
          <p className="text-slate-400 text-sm">Edge AI Platform for Founders</p>
        </div>
        
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes fade-out {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          .animate-fade-out {
            animation: fade-out 0.5s ease-out 2s forwards;
          }
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavbarNew onOpenAuthModal={handleOpenAuthModal} scrollToSection={scrollToSection} navigate={navigate} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />

      {/* ============================================ */}
      {/* HERO SECTION - FIXED SPACING */}
      {/* ============================================ */}
      <section id="hero" className="px-6 py-20" style={{ paddingTop: '120px' }}>
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          
          {/* LEFT COLUMN - TEXT CONTENT */}
          <motion.div 
            className="space-y-8 lg:pr-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* BADGE */}
            <motion.span 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400"
            >
              <Bolt className="h-3 w-3" />
              <span>Fastest AI Builder</span>
            </motion.span>

            {/* HERO TITLE - FIXED SPACING */}
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl font-black leading-[1.1] text-white md:text-6xl" 
              style={{ letterSpacing: '-0.02em' }}
            >
              Edge AI Platform
              <br />
              for Founders.
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-slate-400 md:text-xl leading-relaxed"
            >
              Upload an idea or sketch. AIGO designs your on‑device AI model, tech stack, datasets, and budget — ready to deploy on mobile, web, or IoT.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => scrollToSection('ask-aigo')} 
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105 hover:shadow-indigo-500/40"
              >
                <span>Start Building</span>
                <Rocket className="h-5 w-5" />
              </button>
              <button 
                onClick={() => scrollToSection('ask-aigo')} 
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                <span>Ask AIGO</span>
                <MessageCircle className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN - LOGO IMAGE */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-12 shadow-2xl backdrop-blur flex items-center justify-center">
              <img 
                src="/logo.jpeg" 
                alt="AIGO Platform" 
                className="h-auto w-full max-w-md object-contain drop-shadow-[0_0_50px_rgba(6,182,212,0.5)]"
              />
            </div>
            
            {/* FLOATING BADGE */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -top-6 left-6 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20">
                <Brain className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">YOLOv10-Edge</p>
                <p className="text-xs text-slate-400">Deployed in 3.2s</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ASK AIGO SECTION - FIXED SPACING */}
      {/* ============================================ */}
      <section id="ask-aigo" className="border-y border-slate-900 bg-slate-900/40 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">Try It Now</p>
          <h2 className="text-4xl font-black text-white mb-2">Ask AIGO</h2>
          <p className="text-lg text-slate-400">Your idea or image → Budget MVP infrastructure. Try it free.</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden">
            
            {/* CHAT HEADER */}
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

            {/* CHAT MESSAGES */}
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
                            <button onClick={() => handleOpenAuthModal('register')} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold uppercase text-white transition hover:bg-indigo-500">
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

            {/* CHAT INPUT */}
            <div className="border-t border-slate-900 p-5 bg-slate-900/30">
              {uploadedPreview && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs">
                  <span className="text-slate-300">Image attached</span>
                  <button onClick={resetUpload} className="text-slate-400 hover:text-white">Remove</button>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
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
                
                <button onClick={handleSendMessage} disabled={isProcessing || (!inputValue.trim() && !uploadedFile)} className="flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3 text-white transition hover:opacity-90 disabled:opacity-40">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>Try:</span>
                {suggestionSeeds.map(seed => (
                  <button key={seed} onClick={() => setInputValue(seed.substring(3))} className="rounded-full border border-slate-800 px-3 py-1 text-slate-300 transition hover:bg-slate-900">
                    {seed}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION - FIXED SPACING */}
      {/* ============================================ */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-3">Core Features</h2>
          <p className="text-lg text-slate-400">Everything You Need</p>
          <p className="text-sm text-slate-500 mt-2">Idea → Blueprint → Deploy. Complete toolkit, startup budget.</p>
        </div>
        
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Feature 1 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">MVP Architect</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Idea or sketch → Complete technical blueprint with stack recommendations.</p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Edge AI Models</h3>
            <p className="text-sm text-slate-400 leading-relaxed">50+ optimized models for vision, NLP, audio. 10ms on-device inference.</p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Algorithm Library</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Plug-and-play: object detection, sentiment, recommendations, and more.</p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Dataset Curation</h3>
            <p className="text-sm text-slate-400 leading-relaxed">AI-recommended datasets. Properly licensed. Training-ready.</p>
          </div>

          {/* Feature 5 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <CirclePercent className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Seed AI Compression</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Lossless compression → 90% smaller models. Perfect for mobile & IoT.</p>
          </div>

          {/* Feature 6 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">One-Click Mobile Export</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Native iOS + Android apps with embedded AI. App Store ready.</p>
          </div>

          {/* Feature 7 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Custom Domain Connect</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Your domain, your app. SSL handled automatically.</p>
          </div>

          {/* Feature 8 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
              <LinkIcon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Backend/Frontend Pairing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Railway + Netlify. Env variables & CORS auto-configured.</p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS SECTION - FIXED SPACING */}
      {/* ============================================ */}
      <section id="pipeline" className="border-y border-slate-900 bg-slate-900/40 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">How It Works</p>
          <h2 className="text-4xl font-black text-white mb-2">Idea → Production in 4 Steps</h2>
          <p className="text-lg text-slate-400">Concept to deployed AI product. Faster than ever.</p>
        </div>
        
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {/* Step 1 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              1
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Define Your MVP</h3>
            <p className="text-sm text-slate-400">Text or sketch → Blueprint with AI models, tech stack, and estimated costs.</p>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              2
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Select & Train</h3>
            <p className="text-sm text-slate-400">Choose Edge AI models. Get AI-recommended datasets. Fine-tune for your use case.</p>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              3
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Optimize with Seed AI</h3>
            <p className="text-sm text-slate-400">90% model compression, accuracy maintained. Set benchmarks, we optimize.</p>
          </div>

          {/* Step 4 */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-lg font-black text-white">
              4
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Deploy Everywhere</h3>
            <p className="text-sm text-slate-400">One-click export to iOS, Android, web, IoT. Custom domain + backend ready.</p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CREATORS SECTION - FIXED SPACING */}
      {/* ============================================ */}
      <section id="creator" className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          
          {/* LEFT COLUMN */}
          <div>
            <h2 className="text-4xl font-black text-white mb-4">
              Become an <span className="text-purple-400">AI Creator</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">Publish models, datasets, algorithms. Earn commission on every use.</p>
            
            <div className="space-y-5">
              {/* Benefit 1 */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
                  <CirclePercent className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">70% Revenue Share</h4>
                  <p className="text-sm text-slate-400">Industry-leading creator commission</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
                  <ChartColumn className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Real-Time Analytics</h4>
                  <p className="text-sm text-slate-400">Track downloads, usage, and earnings</p>
                </div>
              </div>

              {/* Benefit 3 */}
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

            <button onClick={() => handleOpenAuthModal('register')} className="mt-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90">
              Start Publishing
            </button>
          </div>

          {/* RIGHT COLUMN - CREATOR CARDS */}
          <div className="space-y-4">
            {/* Creator 1 */}
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

            {/* Creator 2 */}
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

            {/* Creator 3 */}
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

      {/* ============================================ */}
      {/* PRICING SECTION - FIXED SPACING */}
      {/* ============================================ */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center mb-12">
          <h2 className="text-4xl font-black text-white mb-2">Simple Pricing</h2>
          <p className="text-lg text-slate-400">Launch Today</p>
          <p className="text-sm text-slate-500 mt-2">Simple pricing. No hidden fees.</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          
          {/* FREE TIER */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-8">
            <h3 className="text-xl font-bold text-white mb-1">Free Tier</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-sm text-slate-500">/forever</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Perfect for exploring the platform</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>1 Edge AI Model</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>100MB Dataset Storage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Basic Seed AI Compression</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Community Support</span>
              </li>
            </ul>
            
            <button onClick={() => handleOpenAuthModal('register')} className="w-full rounded-2xl border border-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900">
              Get Started Free
            </button>
          </div>

          {/* FOUNDER TIER */}
          <div className="relative rounded-3xl border border-cyan-500 bg-slate-950/60 p-8 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
            <div className="absolute right-6 top-6 rounded-full bg-cyan-500 px-3 py-1 text-xs font-black text-slate-950">
              EARLY BUNDLE
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">Founder</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-black text-white">$29.90</span>
              <span className="text-sm text-slate-500">one-time</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Everything you need to launch your MVP</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>3 Edge AI Model Licenses</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>10GB Dataset Storage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Advanced Seed AI Compression</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Mobile Export (iOS + Android)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Custom Domain Connect</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Backend/Frontend Pairing</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-200">
                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Priority Support</span>
              </li>
            </ul>
            
            <button onClick={() => handleOpenAuthModal('register')} className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2">
              <span>Secure Early Access</span>
              <Wallet className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER - FIXED SPACING */}
      {/* ============================================ */}
      <footer className="border-t border-slate-900 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          
          {/* LOGO */}
          <div className="flex items-center justify-center gap-2 text-white mb-6">
            <img 
              src="/logo.jpeg" 
              alt="AIGO Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-black italic">AIGO</span>
          </div>
          
          {/* TAGLINE */}
          <p className="text-center text-sm text-slate-500 mb-6">Edge AI for founders. Launch your MVP without the enterprise budget.</p>
          
          {/* FOOTER LINKS */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-widest text-slate-600 mb-8">
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-400 transition">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-400 transition">Pricing</button>
            <button onClick={() => navigate('/marketplace')} className="hover:text-slate-400 transition">Marketplace</button>
            <button onClick={() => navigate('/docs')} className="hover:text-slate-400 transition">Documentation</button>
            <button onClick={() => scrollToSection('creator')} className="hover:text-slate-400 transition">Creators</button>
            <button onClick={() => handleOpenAuthModal('login')} className="hover:text-slate-400 transition">Contact</button>
          </div>
          
          {/* COPYRIGHT */}
          <p className="text-center text-xs text-slate-600">© 2026 AIGO. Product by AuraSense Limited. Incorporated in Hong Kong.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomeNew;