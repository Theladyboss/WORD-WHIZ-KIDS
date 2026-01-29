import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Shield, Globe, DollarSign, Terminal, Cpu, Eye, Linkedin, Mic, Activity, Lock, Zap } from 'lucide-react';
import LexaChat from './src/components/LexaChat';
import './FreedomAi.css';

// Dynamic AI Logo Component
const AiLogo = ({ size = 200 }: { size?: number }) => {
    return (
        <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer Ring */}
            <motion.div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid var(--color-blue)',
                    borderTopColor: 'transparent',
                    borderBottomColor: 'transparent',
                    position: 'absolute',
                    boxShadow: '0 0 15px var(--color-secondary-glow)'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Middle Ring */}
            <motion.div
                style={{
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    border: '2px solid var(--color-green)',
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    position: 'absolute',
                    boxShadow: '0 0 15px var(--color-primary-glow)'
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner Core */}
            <motion.div
                style={{
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--color-green) 0%, var(--color-blue) 100%)',
                    position: 'absolute',
                    filter: 'blur(8px)',
                    opacity: 0.8
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Core Solid */}
            <div style={{
                width: '20%',
                height: '20%',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                boxShadow: '0 0 20px #fff'
            }} />
        </div>
    );
};

// Reusable Brand Component for consistent "Ai" coloring
const BrandName = ({ size = "normal" }: { size?: "normal" | "large" }) => (
    <span className={`brand-text ${size === "large" ? "text-4xl" : ""}`}>
        FREEDOM<span className="brand-ai"><span className="brand-a">A</span><span className="brand-i">i</span></span>
    </span>
);

function FreedomAi() {
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    // Parallax and transformation effects
    const logoY = useTransform(scrollY, [0, 500], [0, 150]);
    const logoRotateX = useTransform(scrollY, [0, 500], [0, 25]);
    const logoScale = useTransform(scrollY, [0, 300], [1, 0.8]);

    const heroTextY = useTransform(scrollY, [0, 300], [0, 100]);
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="app">
            <div className="grid-bg" />
            <div className="mist-overlay" />

            {/* Navbar */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container nav-content">
                    <div className="logo">
                        <AiLogo size={40} />
                        <div style={{ width: 10 }}></div>
                        <BrandName />
                    </div>
                    <div className="nav-links">
                        <a href="#story" className="nav-link">My Story</a>
                        <a href="#workshop" className="nav-link">The Workshop</a>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-secret-agent"
                            style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem' }}
                            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <Shield size={14} style={{ marginRight: '5px' }} /> JOIN WAITLIST
                        </motion.button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-content">

                    {/* Advanced Floating Logo with Glow Ring */}
                    <div className="logo-wrapper">
                        <div className="logo-glow-ring" />
                        <motion.div
                            style={{ y: logoY, rotateX: logoRotateX, scale: logoScale, perspective: 1000 }}
                        >
                            <AiLogo size={220} />
                        </motion.div>
                    </div>

                    <motion.div style={{ y: heroTextY, opacity: heroOpacity }}>
                        <motion.h1
                            className="hero-title"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        >
                            Stop Drowning. <br />
                            <span className="text-gradient">Start Building.</span> <br />
                            Your AI Co-Pilot is Ready.
                        </motion.h1>

                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        >
                            I'm an educator, travel agency owner, and AI entrepreneur managing it all without losing my mind. I'll show you the exact AI system that lets me do the work of three people - so you can too.
                        </motion.p>

                        <motion.div
                            className="hero-buttons"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-secret-agent"
                                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <Shield size={18} /> JOIN THE WAITLIST
                            </motion.button>
                            <motion.a
                                href="https://www.linkedin.com/in/freedomaisolutions/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ textDecoration: 'none' }}
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Linkedin size={18} /> Connect
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Gemini Live Style Glow */}
                <div className="lexa-glow-container">
                    <div className="lexa-glow"></div>
                </div>
            </section>

            {/* Story Section */}
            <section id="story" className="features">
                <div className="container">
                    <motion.div
                        className="glass-panel"
                        style={{ padding: '4rem', position: 'relative', overflow: 'hidden' }}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--color-green), var(--color-blue))' }} />

                        {/* Background decorative elements */}
                        <div style={{ position: 'absolute', right: '-50px', top: '-50px', opacity: 0.05 }}>
                            <Terminal size={300} />
                        </div>

                        <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    background: 'rgba(43, 188, 154, 0.1)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    color: 'var(--color-green)',
                                    border: '1px solid rgba(43, 188, 154, 0.2)'
                                }}>
                                    <Activity size={28} />
                                </div>
                                <h2 className="section-title" style={{ fontSize: '2.5rem', margin: 0 }}>The Real Story</h2>
                            </div>
                        </div>
                        <div style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#e0e0e0', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
                            <p style={{ marginBottom: '1.5rem' }}>
                                I get it. You're building something while working full-time. You're juggling clients, kids, certifications, content creation, and trying to stay sane. You can't afford to hire help, and you're one crisis away from burnout.
                            </p>
                            <p style={{ marginBottom: '1.5rem' }}>
                                I was there six months ago. Then I built an AI system that became my virtual team. Now I manage a teaching career, a travel business, and an AI company without working 80-hour weeks.
                            </p>
                            <p>
                                I'm not selling theory. I'm sharing exactly what works - because I live it every day.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Workshop Section */}
            <section id="workshop" className="features">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">The AI Co-Pilot System</h2>
                        <p className="section-desc">
                            A 4-week workshop launching March 2025.
                        </p>
                    </div>

                    <div className="features-grid">
                        <FeatureCard
                            icon={<Eye />}
                            title="Communication Command Center"
                            desc="Automate email, client follow-ups, and social media content pipelines."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<Cpu />}
                            title="Business Operations Autopilot"
                            desc="Streamline proposals, invoices, and project management."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<DollarSign />}
                            title="Personal Intelligence System"
                            desc="Track learning, research competitors, and make better decisions faster."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Waitlist Section */}
            <section id="waitlist" className="features" style={{ paddingBottom: '12rem' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="glass-panel"
                        style={{
                            maxWidth: '600px',
                            margin: '0 auto',
                            padding: '4rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.15)'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at 50% 120%, rgba(43, 188, 154, 0.3), transparent 70%)',
                            zIndex: 0
                        }} />

                        <div style={{ zIndex: 1, marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Join the Waitlist</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Be the first to build your system.</p>
                        </div>

                        <motion.div
                            style={{
                                width: '90px',
                                height: '90px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-green), var(--color-blue))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 40px var(--color-primary-glow)',
                                zIndex: 1,
                                marginBottom: '2rem',
                                position: 'relative'
                            }}
                            animate={{ boxShadow: ['0 0 20px rgba(43, 188, 154, 0.4)', '0 0 50px rgba(43, 188, 154, 0.8)', '0 0 20px rgba(43, 188, 154, 0.4)'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <div style={{ position: 'absolute', inset: '-5px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', animation: 'spin 10s linear infinite' }} />
                            <Mic size={40} color="white" />
                        </motion.div>

                        {/* Email Form */}
                        <div style={{ zIndex: 1, width: '100%', maxWidth: '400px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-secret-agent"
                                style={{ justifyContent: 'center', width: '100%' }}
                                onClick={() => alert("You're on the list! (This is a demo)")}
                            >
                                JOIN WAITLIST
                            </motion.button>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                Launching March 2025. No spam, just freedom.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-content">
                    <div className="logo" style={{ fontSize: '1.2rem' }}>
                        <AiLogo size={24} />
                        <div style={{ width: 8 }}></div>
                        <BrandName />
                    </div>
                    <div className="footer-text">
                        © 2025 <BrandName /> SOLUTIONS. Classified.
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <a href="https://www.linkedin.com/in/freedomaisolutions/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }} className="hover:text-primary">
                            <Linkedin size={20} />
                        </a>
                        <a href="#" style={{ color: 'var(--color-text-muted)' }}><Globe size={20} /></a>
                    </div>
                </div>
            </footer>
            <LexaChat />
        </div>
    );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
    return (
        <motion.div
            className="glass-panel feature-card"
            initial={{ opacity: 0, y: 40, rotateX: -10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
            whileHover={{ y: -15, transition: { duration: 0.3 } }}
        >
            <div className="feature-icon">{icon}</div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-desc">{desc}</p>
        </motion.div>
    );
}

export default FreedomAi;
