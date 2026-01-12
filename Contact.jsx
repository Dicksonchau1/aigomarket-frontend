import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactNew = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In production, send to backend
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Navigation */}
            <nav className="navbar scrolled">
                <div className="navbar-content">
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <i className="fas fa-bolt"></i>
                        </div>
                        <span className="logo-text">AIGO</span>
                    </Link>
                    <Link to="/" className="btn btn-ghost">
                        <i className="fas fa-arrow-left"></i> Back to Home
                    </Link>
                </div>
            </nav>

            <main style={{ padding: '120px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 className="section-title" style={{ marginBottom: '16px' }}>Contact Us</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
                        Have questions? We'd love to hear from you.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
                    {/* Contact Info */}
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-cyan)',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>Email</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>hello@aigo.market</p>
                                    <p style={{ color: 'var(--text-muted)' }}>support@aigo.market</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-purple)',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>Office</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>AuraSense Limited</p>
                                    <p style={{ color: 'var(--text-muted)' }}>Central, Hong Kong</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--accent-emerald)',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-comments"></i>
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: '600', marginBottom: '4px' }}>Community</h3>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        <a href="https://discord.gg/aigo" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>
                                            Join our Discord
                                        </a>
                                    </p>
                                    <p style={{ color: 'var(--text-muted)' }}>
                                        <a href="https://twitter.com/aigomarket" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)' }}>
                                            Follow on Twitter
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        padding: '32px'
                    }}>
                        {submitted ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px',
                                    color: 'var(--accent-emerald)',
                                    fontSize: '28px'
                                }}>
                                    <i className="fas fa-check"></i>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Message Sent!</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>We'll get back to you within 24 hours.</p>
                                <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                color: 'var(--text-primary)',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                color: 'var(--text-primary)',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Subject</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                color: 'var(--text-primary)',
                                                fontSize: '16px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Message</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={4}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                background: 'var(--bg-primary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                color: 'var(--text-primary)',
                                                fontSize: '16px',
                                                resize: 'none'
                                            }}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-gradient" style={{ width: '100%', justifyContent: 'center' }}>
                                        <i className="fas fa-paper-plane"></i> Send Message
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>© 2026 AIGO. Product by AuraSense Limited. Incorporated in Hong Kong.</p>
            </footer>
        </div>
    );
};

export default ContactNew;
