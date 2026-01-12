export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-color py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold font-orbitron bg-gradient-primary bg-clip-text text-transparent mb-4">
              AIGO
            </h3>
            <p className="text-text-secondary text-sm font-outfit">
              Edge AI for founders. Launch your MVP without the enterprise budget.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 font-outfit">Product</h4>
            <ul className="space-y-2 text-text-secondary text-sm font-outfit">
              <li><a href="#features" className="hover:text-accent-silver transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-accent-silver transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-accent-silver transition-colors">Marketplace</a></li>
              <li><a href="#" className="hover:text-accent-silver transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 font-outfit">Company</h4>
            <ul className="space-y-2 text-text-secondary text-sm font-outfit">
              <li><a href="#" className="hover:text-accent-silver transition-colors">About</a></li>
              <li><a href="#" className="hover:text-accent-silver transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-accent-silver transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-accent-silver transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-text-primary mb-4 font-outfit">Legal</h4>
            <ul className="space-y-2 text-text-secondary text-sm font-outfit">
              <li><a href="#" className="hover:text-accent-silver transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-silver transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent-silver transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-color pt-8 text-center text-text-muted text-sm font-outfit">
          © 2026 AIGO. Product by AuraSense Limited. Incorporated in Hong Kong.
        </div>
      </div>
    </footer>
  );
}