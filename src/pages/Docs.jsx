import React, { useState } from 'react';
import { Terminal, Key, Zap, ShieldCheck, Globe, FileCode, Copy, Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Docs = () => {
    const [copied, setCopied] = useState(null);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const codeExamples = {
        auth: 'curl -H "Authorization: Bearer $AIGO_API_KEY" https://api.aigo/v1/me',
        compress: `{
  "model_id": "mdl_123",
  "compression_level": 90,
  "quantization": "int8_static",
  "pruning": "structured",
  "accuracy_target": 0.992,
  "target": "ios_a15_ne"
}`
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-['Outfit']">
            {/* Nav */}
            <nav className="border-b border-slate-800 p-6 flex justify-between items-center bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic shadow-[0_0_15px_rgba(79,70,229,0.4)]">A</div>
                    <span className="font-black italic tracking-wider text-xl">AIGO API</span>
                </Link>
                <Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-white transition">Back to Dashboard</Link>
            </nav>

            <main className="max-w-5xl mx-auto p-8 lg:p-20">
                {/* Header */}
                <header className="mb-16">
                    <h1 className="text-5xl font-black italic mb-6 uppercase tracking-tight leading-none">Developer <span className="text-cyan-400">Reference</span></h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
                        Automate your entire Edge AI workflow. This reference covers everything from Seed AI compression to Marketplace publishing. 
                        <span className="block mt-4 text-indigo-400 font-semibold italic">Note: All endpoints have migrated from "AIgoMarket" to the "AIGO" namespace.</span>
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Content */}
                    <div className="lg:col-span-2 space-y-16">
                        
                        {/* Base URL */}
                        <section>
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Globe size={14}/> Base URL & Versioning
                            </h2>
                            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
                                <p className="text-slate-400 text-sm mb-4">All examples target v1. Replace placeholder with your deployed API host.</p>
                                <div className="flex items-center justify-between bg-[#020617] p-4 rounded-xl border border-slate-800">
                                    <code className="text-cyan-400 font-mono font-bold">https://api.aigo/v1</code>
                                    <button onClick={() => handleCopy('https://api.aigo/v1', 'base')} className="text-slate-500 hover:text-white transition">
                                        {copied === 'base' ? <Check size={18} className="text-emerald-500"/> : <Copy size={18}/>}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Auth */}
                        <section>
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Key size={14}/> Authentication
                            </h2>
                            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
                                <p className="text-slate-400 text-sm mb-6">Use your dashboard API key as a Bearer token. Scoped to your workspace.</p>
                                <pre className="bg-[#020617] p-5 rounded-xl border border-slate-800 overflow-x-auto text-sm font-mono text-slate-300">
                                    {codeExamples.auth}
                                </pre>
                            </div>
                        </section>

                        {/* Seed AI */}
                        <section>
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Zap size={14} className="text-cyan-400"/> POST /v1/compressions
                            </h2>
                            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">
                                <p className="text-slate-400 text-sm mb-6 italic">Trigger Seed AI compression with quantization and structured pruning.</p>
                                <pre className="bg-[#020617] p-5 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-cyan-500 leading-relaxed shadow-inner">
                                    {codeExamples.compress}
                                </pre>
                            </div>
                        </section>
                    </div>

                    {/* Right: Sidebar Design Reference */}
                    <div className="space-y-6">
                        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShieldCheck size={14}/> Security & SLA
                            </h3>
                            <ul className="space-y-3 text-[11px] text-slate-400 font-medium">
                                <li className="flex gap-2 underline decoration-indigo-500/30 underline-offset-4">Virus-scanned uploads</li>
                                <li className="flex gap-2">AES-256 At-rest encryption</li>
                                <li className="flex gap-2">Signed URLs (60m expiry)</li>
                                <li className="flex gap-2">600 requests/minute limit</li>
                            </ul>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileCode size={14}/> Supported Formats
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {[".pt", ".pth", ".h5", ".onnx", ".tflite", ".mlmodel"].map(f => (
                                    <span key={f} className="px-2 py-1 bg-[#020617] border border-slate-800 rounded text-[10px] font-mono text-cyan-500">{f}</span>
                                ))}
                            </div>
                            <p className="mt-4 text-[10px] text-slate-500 italic">Max upload: 5 GB</p>
                        </div>

                        <div className="p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
                             <div className="text-emerald-500 text-xs font-black mb-2 flex items-center gap-2 italic underline decoration-emerald-500/50">
                                <Info size={14}/> Early Bundle Support
                             </div>
                             <p className="text-[10px] text-slate-400 leading-relaxed">Priority support and higher job concurrency are included for all Early Bundle users.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Docs;