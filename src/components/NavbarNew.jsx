import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavbarNew() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-content">
        <Link to="/" className="logo">
          <img 
            src="/logo.png" 
            alt="AIGO Logo" 
            className="logo-img"
          />
          <span className="logo-text-metallic">AIGO</span>
        </Link>

        <div className="nav-links">
          <a onClick={() => scrollToSection('features')}>Features</a>
          <a onClick={() => scrollToSection('pricing')}>Pricing</a>
        </div>

        <div className="nav-cta">
          <button 
            onClick={() => navigate('/auth')} 
            className="btn btn-ghost"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="btn btn-primary"
          >
            Get Started
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu">
          <a onClick={() => scrollToSection('features')}>Features</a>
          <a onClick={() => scrollToSection('pricing')}>Pricing</a>
          <button 
            onClick={() => { 
              navigate('/auth'); 
              setIsMenuOpen(false); 
            }} 
            className="btn btn-ghost"
          >
            Sign In
          </button>
          <button 
            onClick={() => { 
              navigate('/auth'); 
              setIsMenuOpen(false); 
            }}
            className="btn btn-primary"
          >
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
