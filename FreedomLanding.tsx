import React, { useState, useEffect } from 'react';

const FreedomLanding = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            background: '#0f172a',
            color: '#f8fafc',
            minHeight: '100vh',
            overflowX: 'hidden'
        }}>
            {/* Navigation */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1000,
                background: scrolled ? 'rgba(15, 23, 42, 0.8)' : 'transparent',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                transition: 'all 0.3s ease',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '1px' }}>
                    FREEDOM<span style={{ color: '#3b82f6' }}>Ai</span>
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>Features</a>
                    <a href="#solutions" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>Solutions</a>
                    <a href="#about" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500' }}>About</a>
                    <button style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '50px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
                    }}>
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0) 50%)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '300px',
                    height: '300px',
                    background: '#3b82f6',
                    filter: 'blur(150px)',
                    opacity: 0.2,
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: '#8b5cf6',
                    filter: 'blur(150px)',
                    opacity: 0.2,
                    borderRadius: '50%'
                }} />

                <h1 style={{
                    fontSize: '5rem',
                    fontWeight: '900',
                    marginBottom: '20px',
                    lineHeight: '1.1',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Unleash the Power<br />
                    of <span style={{ color: '#3b82f6', WebkitTextFillColor: '#3b82f6' }}>Artificial Intelligence</span>
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#94a3b8',
                    maxWidth: '600px',
                    marginBottom: '40px',
                    lineHeight: '1.6'
                }}>
                    Transform your workflow with next-generation AI solutions designed for freedom, flexibility, and future-proof scalability.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button style={{
                        background: 'white',
                        color: '#0f172a',
                        border: 'none',
                        padding: '16px 32px',
                        borderRadius: '50px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        Start Building
                    </button>
                    <button style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px 32px',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)'
                    }}>
                        View Demo
                    </button>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '60px' }}>Why FREEDOMAi?</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    {[
                        { title: 'Autonomous Agents', desc: 'Deploy intelligent agents that work 24/7 to solve complex tasks.' },
                        { title: 'Secure Infrastructure', desc: 'Enterprise-grade security ensuring your data remains private and protected.' },
                        { title: 'Seamless Integration', desc: 'Connect with your existing tools and workflows in minutes, not days.' }
                    ].map((feature, i) => (
                        <div key={i} style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '40px',
                            borderRadius: '20px',
                            transition: 'transform 0.3s',
                            cursor: 'default'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }} />
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{feature.title}</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '60px 40px',
                textAlign: 'center',
                color: '#64748b'
            }}>
                <p>&copy; 2025 FREEDOMAi Solutions. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default FreedomLanding;
