import { FaLightbulb, FaBrain, FaCog, FaDatabase, FaCompressAlt, FaMobileAlt, FaGlobe, FaServer } from 'react-icons/fa';

export default function FeaturesSection() {
  const features = [
    {
      icon: <FaLightbulb className="text-accent-gold" />,
      title: "MVP Architect",
      description: "Idea or sketch → Complete technical blueprint with stack recommendations."
    },
    {
      icon: <FaBrain className="text-accent-indigo" />,
      title: "Edge AI Models",
      description: "50+ optimized models for vision, NLP, audio. 10ms on-device inference."
    },
    {
      icon: <FaCog className="text-accent-cyan" />,
      title: "Algorithm Library",
      description: "Plug-and-play: object detection, sentiment, recommendations, and more."
    },
    {
      icon: <FaDatabase className="text-accent-emerald" />,
      title: "Dataset Curation",
      description: "AI-recommended datasets. Properly licensed. Training-ready."
    },
    {
      icon: <FaCompressAlt className="text-accent-purple" />,
      title: "Seed AI Compression",
      description: "Lossless compression → 90% smaller models. Perfect for mobile & IoT."
    },
    {
      icon: <FaMobileAlt className="text-accent-silver" />,
      title: "One-Click Mobile Export",
      description: "Native iOS + Android apps with embedded AI. App Store ready."
    },
    {
      icon: <FaGlobe className="text-accent-cyan" />,
      title: "Custom Domain Connect",
      description: "Your domain, your app. SSL handled automatically."
    },
    {
      icon: <FaServer className="text-accent-indigo" />,
      title: "Backend/Frontend Pairing",
      description: "Railway + Netlify. Env variables & CORS auto-configured."
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Core Features</span>
          </h2>
          <p className="text-xl text-text-secondary font-outfit">Everything You Need</p>
          <p className="text-text-muted font-outfit">Idea → Blueprint → Deploy. Complete toolkit, startup budget.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-bg-card border border-border-color rounded-xl p-6 hover:border-accent-silver/50 transition-all hover:scale-105"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold font-outfit mb-2 text-text-primary">{feature.title}</h3>
              <p className="text-text-secondary text-sm font-outfit">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}