import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Globe, DollarSign, Terminal, Cpu, Eye, Linkedin } from 'lucide-react';
import logo from './assets/freedom-logo.png';
import './App.css';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <div className="logo">
            <img src={logo} alt="Freedom AI Logo" style={{ height: '40px', width: 'auto' }} />
            <span style={{ letterSpacing: '-0.5px' }}>FREEDOM<span className="text-gradient">Ai</span></span>
          </div>
          <div className="nav-links">
            <a href="#mission" className="nav-link">Mission</a>
            <a href="#solutions" className="nav-link">Solutions</a>
            <a href="#intelligence" className="nav-link">Intelligence</a>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
              Access Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: '100px',
            left: '5%',
            zIndex: 10
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0, 255, 157, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '100px',
            border: '1px solid rgba(0, 255, 157, 0.2)',
            color: 'var(--color-primary)',
            backdropFilter: 'blur(5px)'
          }}>
            <Shield size={16} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>YOUR SECRET AGENT</span>
          </div>
        </motion.div>

        <div className="container hero-content">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: [0, -15, 0],
            }}
            transition={{
              opacity: { duration: 0.5, delay: 0.1 },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            style={{
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <motion.img
              src={logo}
              alt="Freedom AI Emblem"
              style={{ height: '180px', filter: 'drop-shadow(0 0 30px rgba(0,255,157,0.3))' }}
              whileHover={{
                scale: 1.1,
                filter: 'drop-shadow(0 0 50px rgba(0,255,157,0.6))',
                transition: { duration: 0.3 }
              }}
            />
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The Clandestine Ally <br />
            <span className="text-gradient">Your Business Needs</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            A stealthy fusion of cutting-edge generative AI and strategic innovation, poised to infiltrate and elevate your most critical processes.
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button className="btn btn-primary">
              Initialize Agent <ArrowRight size={18} />
            </button>
            <a href="https://www.linkedin.com/in/freedomaisolutions/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              <Linkedin size={18} /> Connect
            </a>
          </motion.div>
        </div>
      </section>

      {/* Mission Briefing Section */}
      <section id="mission" className="features" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,157,0.03) 100%)' }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: '4rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-primary)' }} />
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Terminal className="text-gradient" />
                <h2 className="section-title" style={{ fontSize: '2rem', margin: 0 }}>Mission Briefing</h2>
              </div>
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#e0e0e0', maxWidth: '900px' }}>
              As your secret agent, we operate in the shadows of complexity, decoding challenges and unleashing AI-driven solutions that catalyze transformation, amplify creativity, and supercharge growth. With <span className="text-gradient" style={{ fontWeight: 700 }}>FREEDOMAi SOLUTIONS</span> as your covert partner, your organization gains an unparalleled advantage.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Operational Capabilities</h2>
            <p className="section-desc">
              Advanced weaponry for the modern financial battlefield.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<Eye />}
              title="Shadow Operations"
              desc="Operate in the shadows of complexity, decoding challenges before they become threats."
              delay={0}
            />
            <FeatureCard
              icon={<Cpu />}
              title="Generative Fusion"
              desc="A stealthy fusion of cutting-edge generative AI and strategic innovation."
              delay={0.1}
            />
            <FeatureCard
              icon={<DollarSign />}
              title="Growth Catalyst"
              desc="Unleash AI-driven solutions that catalyze transformation and supercharge growth."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="logo" style={{ fontSize: '1.2rem' }}>
            <img src={logo} alt="Logo" style={{ height: '24px', width: 'auto' }} />
            <span>FREEDOM<span className="text-gradient">Ai</span></span>
          </div>
          <div className="footer-text">
            © 2025 FREEDOMAi SOLUTIONS. Classified.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="https://www.linkedin.com/in/freedomaisolutions/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }} className="hover:text-primary">
              <Linkedin size={20} />
            </a>
            <a href="#" style={{ color: 'var(--color-text-muted)' }}><Globe size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      className="glass-panel feature-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </motion.div>
  );
}

export default App;
