import { FaBolt, FaRocket, FaComments } from 'react-icons/fa';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent-indigo/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card border border-accent-silver/20 rounded-full mb-8">
            <FaBolt className="text-accent-gold" />
            <span className="text-sm font-outfit text-text-secondary">Fastest AI Builder for Founders</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold font-orbitron mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">BUILD YOUR AI MVP</span>
            <br />
            <span className="text-text-primary">IN MINUTES, NOT MONTHS</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-10 font-outfit">
            Upload an idea or sketch. AIGO designs your on-device AI model, tech stack, datasets, and budget — ready to deploy on mobile, web, or IoT.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group px-8 py-4 bg-gradient-primary text-bg-primary font-bold rounded-lg hover:scale-105 transition-transform flex items-center gap-2">
              <FaRocket />
              Start Building
            </button>
            <button className="px-8 py-4 bg-bg-card border border-accent-silver/30 text-text-primary font-bold rounded-lg hover:border-accent-silver transition-colors flex items-center gap-2">
              <FaComments />
              Ask AIGO
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16">
          <FeaturePill icon="🤖" label="50+ Edge AI Models" />
          <FeaturePill icon="📦" label="90% Compression" />
          <FeaturePill icon="💰" label="From $0/month" />
          <FeaturePill icon="⚡" label="Full API Access" />
        </div>
      </div>
    </section>
  );
}

function FeaturePill({ icon, label }) {
  return (
    <div className="bg-bg-card border border-border-color rounded-lg p-4 text-center hover:border-accent-silver/50 transition-colors">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-outfit text-text-secondary">{label}</div>
    </div>
  );
}