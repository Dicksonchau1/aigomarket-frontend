import { FaCheck } from 'react-icons/fa';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Simple Pricing</span>
          </h2>
          <p className="text-xl text-text-secondary font-outfit">Launch Today</p>
          <p className="text-text-muted font-outfit">Simple pricing. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-bg-card border border-border-color rounded-2xl p-8 hover:border-accent-silver/50 transition-all">
            <h3 className="text-2xl font-bold font-outfit mb-2 text-text-primary">Free Tier</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold font-orbitron text-text-primary">$0</span>
              <span className="text-text-secondary font-outfit">/forever</span>
            </div>
            <p className="text-text-secondary mb-6 font-outfit">Perfect for exploring the platform</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> 1 Edge AI Model
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> 100MB Dataset Storage
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> Basic Seed AI Compression
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> Community Support
              </li>
            </ul>
            <button className="w-full px-6 py-3 bg-bg-secondary border border-accent-silver/30 text-text-primary font-bold rounded-lg hover:border-accent-silver transition-colors">
              Get Started Free
            </button>
          </div>

          {/* Founder Tier */}
          <div className="bg-bg-card border-2 border-accent-gold rounded-2xl p-8 relative hover:scale-105 transition-transform">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent-gold text-bg-primary px-4 py-1 rounded-full text-sm font-bold font-outfit">
              EARLY BUNDLE
            </div>
            <h3 className="text-2xl font-bold font-outfit mb-2 text-text-primary">Founder</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold font-orbitron text-text-primary">$29.90</span>
              <span className="text-text-secondary font-outfit">/one-time</span>
            </div>
            <p className="text-text-secondary mb-6 font-outfit">Everything you need to launch your MVP</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> 3 Edge AI Model Licenses
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> 10GB Dataset Storage
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> Advanced Seed AI Compression
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> Mobile Export (iOS + Android)
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> Custom Domain Connect
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> Backend/Frontend Pairing
              </li>
              <li className="flex items-center gap-2 text-text-secondary font-outfit">
                <FaCheck className="text-accent-emerald" /> Priority Support
              </li>
            </ul>
            <button className="w-full px-6 py-3 bg-gradient-primary text-bg-primary font-bold rounded-lg hover:opacity-90 transition-opacity">
              Secure Early Access
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
