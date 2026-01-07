import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Shield, Globe, DollarSign, Terminal, Cpu, Eye, Linkedin, Mic, Activity, Lock, Zap } from 'lucide-react';
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
                        <a href="#mission" className="nav-link">Mission</a>
                        <a href="#solutions" className="nav-link">Solutions</a>
                        <a href="#intelligence" className="nav-link">Intelligence</a>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-secret-agent"
                            style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem' }}
                        >
                            <Shield size={14} style={{ marginRight: '5px' }} /> ACCESS PORTAL
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
                            The Clandestine Ally <br />
                            <span className="text-gradient">Your Business Needs</span>
                        </motion.h1>

                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        >
                            A stealthy fusion of cutting-edge generative <BrandName /> and strategic innovation, poised to infiltrate and elevate your most critical processes.
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
                            >
                                <Shield size={18} /> YOUR SECRET AGENT
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

            {/* Mission Briefing Section */}
            <section id="mission" className="features">
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
                                <h2 className="section-title" style={{ fontSize: '2.5rem', margin: 0 }}>Mission Briefing</h2>
                            </div>
                        </div>
                        <p style={{ fontSize: '1.3rem', lineHeight: '1.8', color: '#e0e0e0', maxWidth: '900px', position: 'relative', zIndex: 1 }}>
                            As your secret agent, we operate in the shadows of complexity, decoding challenges and unleashing <BrandName />-driven solutions that catalyze transformation, amplify creativity, and supercharge growth. With <BrandName /> as your covert partner, your organization gains an unparalleled advantage.
                        </p>
                    </motion.div>
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
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<DollarSign />}
                            title="Growth Catalyst"
                            desc="Unleash AI-driven solutions that catalyze transformation and supercharge growth."
                            delay={0.4}
                        />
                    </div>
                </div>
            </section>

            {/* Lexa / Voice Interaction Demo Section */}
            <section id="intelligence" className="features" style={{ paddingBottom: '12rem' }}>
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
                            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Talk to Lexa</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Your <BrandName /> Strategic Advisor</p>
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
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ boxShadow: ['0 0 20px rgba(43, 188, 154, 0.4)', '0 0 50px rgba(43, 188, 154, 0.8)', '0 0 20px rgba(43, 188, 154, 0.4)'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <div style={{ position: 'absolute', inset: '-5px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', animation: 'spin 10s linear infinite' }} />
                            <Mic size={40} color="white" />
                        </motion.div>

                        <div style={{
                            marginTop: '2.5rem',
                            display: 'flex',
                            gap: '6px',
                            height: '40px',
                            alignItems: 'center',
                            zIndex: 1
                        }}>
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [10, 35, 10], opacity: [0.5, 1, 0.5] }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        width: '6px',
                                        background: i % 2 === 0 ? 'var(--color-green)' : 'var(--color-blue)',
                                        borderRadius: '3px',
                                        boxShadow: '0 0 10px rgba(255,255,255,0.2)'
                                    }}
                                />
                            ))}
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
