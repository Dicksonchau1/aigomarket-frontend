import React from 'react';
import { Check, Zap, Rocket, Crown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    const plans = [
        {
            name: "Free",
            price: "0",
            desc: "For solo founders validating their first Edge AI MVP.",
            features: ["2 Edge AI Capacity", "5 Gold Datasets", "1 Deployment", "Basic Pitch Video"],
            button: "Start Building",
            icon: <Zap className="text-slate-400" />
        },
        {
            name: "Early Founder",
            price: "29.9",
            period: "/mo",
            desc: "Special package for early adopters including built-in tokens.",
            features: ["10 Edge AI Capacity", "Unlimited Datasets", "5 Deployments", "Included Token Package", "Priority Training Queue"],
            button: "Claim Founder Tier",
            icon: <Star className="text-yellow-400" />,
            popular: true
        },
        {
            name: "Standard",
            price: "29.9",
            period: "/mo",
            desc: "Base subscription for professionals.",
            features: ["10 Edge AI Capacity", "Unlimited Datasets", "5 Deployments", "+ $19.9 Token Package (Required)", "Full Diagnostics Suite"],
            button: "Get Standard",
            icon: <Rocket className="text-indigo-400" />
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "Custom infrastructure for industrial-scale deployment.",
            features: ["Dedicated GPU Nodes", "SLA Guarantees", "Unlimited Deployments", "Dedicated Support Manager"],
            button: "Contact Sales",
            icon: <Crown className="text-purple-400" />
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white font-['Outfit'] pb-20">
            <div className="pt-32 pb-16 text-center px-6">
                <h1 className="text-5xl font-black italic mb-6 uppercase tracking-tight">Founder <span className="text-cyan-400">Economics</span></h1>
                <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">Real GPU power priced for creators, not corporations.</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan, i) => (
                    <div key={i} className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-yellow-500 bg-[#0f172a] shadow-[0_0_40px_rgba(234,179,8,0.15)]' : 'border-slate-800 bg-[#0f172a]/50'}`}>
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Early Adopter Special</div>
                        )}
                        <div className="mb-6">{plan.icon}</div>
                        <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-black">{plan.price !== "Custom" && "$"}{plan.price}</span>
                            {plan.period && <span className="text-slate-500 font-bold text-sm">{plan.period}</span>}
                        </div>
                        <p className="text-slate-400 text-xs mb-8 leading-relaxed h-12">{plan.desc}</p>
                        
                        <ul className="space-y-4 mb-10 border-t border-slate-800 pt-6">
                            {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs font-medium text-slate-300">
                                    <Check size={14} className="text-emerald-500 mt-0.5" /> {feat}
                                </li>
                            ))}
                        </ul>

                        <Link to="/login">
                            <button className={`w-full py-3 rounded-xl font-bold text-sm transition ${plan.popular ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-white text-black hover:bg-slate-200'}`}>
                                {plan.button}
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 text-center text-slate-500 text-sm">
                <p>All prices in USD. Token packages can be refilled at any time from the Dashboard.</p>
            </div>
        </div>
    );
};

export default Pricing;