export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Define Your MVP",
      description: "Text or sketch ??Blueprint with AI models, tech stack, and estimated costs."
    },
    {
      number: "2",
      title: "Select & Train",
      description: "Choose Edge AI models. Get AI-recommended datasets. Fine-tune for your use case."
    },
    {
      number: "3",
      title: "Optimize with Seed AI",
      description: "90% model compression, accuracy maintained. Set benchmarks, we optimize."
    },
    {
      number: "4",
      title: "Deploy Everywhere",
      description: "One-click export to iOS, Android, web, IoT. Custom domain + backend ready."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-orbitron mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">How It Works</span>
          </h2>
          <p className="text-xl text-text-secondary font-outfit">Idea ??Production in 4 Steps</p>
          <p className="text-text-muted font-outfit">Concept to deployed AI product. Faster than ever.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-bg-card border border-border-color rounded-xl p-8 hover:border-accent-silver/50 transition-all">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-3xl font-bold text-bg-primary mb-6 font-orbitron">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold font-outfit mb-4 text-text-primary">{step.title}</h3>
                <p className="text-text-secondary font-outfit">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-primary"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
