import { FaChartLine, FaShieldAlt, FaDollarSign } from 'react-icons/fa';

export default function CreatorSection() {
  const creators = [
    { initials: "JC", name: "James Chen", role: "Vision Model Creator", earnings: "$2,847" },
    { initials: "SK", name: "Sarah Kim", role: "NLP Specialist", earnings: "$1,923" },
    { initials: "MP", name: "Mike Park", role: "Audio AI Expert", earnings: "$3,156" }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Creator Cards */}
          <div className="space-y-6">
            {creators.map((creator, index) => (
              <div
                key={index}
                className="bg-bg-card border border-border-color rounded-xl p-6 flex items-center justify-between hover:border-accent-silver/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-2xl font-bold text-bg-primary font-orbitron">
                    {creator.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg font-outfit text-text-primary">{creator.name}</h4>
                    <p className="text-text-secondary text-sm font-outfit">{creator.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-sm font-outfit">This Month</p>
                  <p className="text-2xl font-bold text-accent-emerald font-orbitron">{creator.earnings}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: CTA */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-6">
              Become an <span className="bg-gradient-primary bg-clip-text text-transparent">AI Creator</span>
            </h2>
            <p className="text-xl text-text-secondary mb-8 font-outfit">
              Publish models, datasets, algorithms. Earn commission on every use.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <FaDollarSign className="text-accent-emerald text-2xl" />
                <div>
                  <h4 className="font-bold font-outfit text-text-primary">70% Revenue Share</h4>
                  <p className="text-text-secondary text-sm font-outfit">Industry-leading creator commission</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaChartLine className="text-accent-cyan text-2xl" />
                <div>
                  <h4 className="font-bold font-outfit text-text-primary">Real-Time Analytics</h4>
                  <p className="text-text-secondary text-sm font-outfit">Track downloads, usage, and earnings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-accent-indigo text-2xl" />
                <div>
                  <h4 className="font-bold font-outfit text-text-primary">IP Protection</h4>
                  <p className="text-text-secondary text-sm font-outfit">Your models are encrypted and secured</p>
                </div>
              </div>
            </div>

            <button className="px-8 py-4 bg-gradient-primary text-bg-primary font-bold rounded-lg hover:scale-105 transition-transform">
              Start Publishing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}