import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Domains = () => {
    const [customDomain, setCustomDomain] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(null);

    const domains = [
        { 
            id: 1, 
            domain: 'myai.app', 
            status: 'Active', 
            ssl: true, 
            connected: '2 days ago',
            statusColor: 'emerald'
        },
        { 
            id: 2, 
            domain: 'demo.aiapp.io', 
            status: 'Pending', 
            ssl: false, 
            connected: '1 hour ago',
            statusColor: 'orange'
        }
    ];

    const handleVerify = () => {
        setVerificationStatus('verifying');
        setTimeout(() => {
            setVerificationStatus('success');
        }, 2000);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Navbar */}
            <nav className="navbar scrolled">
                <div className="navbar-content">
                    <Link to="/" className="logo">
                        <div className="logo-icon">
                            <i className="fas fa-bolt"></i>
                        </div>
                        <span className="logo-text-metallic">AIGO</span>
                    </Link>
                    <Link to="/dashboard" className="btn btn-ghost">
                        <i className="fas fa-arrow-left"></i> Dashboard
                    </Link>
                </div>
            </nav>

            <main className="page-main">
                <div className="container max-w-1100">
                    {/* Header */}
                    <div className="page-header">
                        <h1 className="page-title">Custom Domains</h1>
                        <p className="page-subtitle">
                            Connect your own domain to your AI-powered app
                        </p>
                    </div>

                    {/* Add New Domain */}
                    <div className="card mb-10">
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
                            Add Custom Domain
                        </h2>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <input
                                type="text"
                                placeholder="yourdomain.com"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-gradient" onClick={handleVerify}>
                                <i className="fas fa-plus"></i> Add Domain
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="info-box">
                            <div className="info-icon cyan">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="info-content">
                                <h3>How to connect your domain</h3>
                                <p>
                                    Add a CNAME record pointing to <code style={{ 
                                        background: 'var(--bg-tertiary)', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}>app.aigo.market</code> in your DNS settings
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Existing Domains */}
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                            Your Domains
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {domains.map((domain) => (
                                <div key={domain.id} className="card">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                                            <div className="info-icon cyan">
                                                <i className="fas fa-globe"></i>
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                                    {domain.domain}
                                                </h3>
                                                <p className="text-muted" style={{ fontSize: '13px' }}>
                                                    Connected {domain.connected}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <span className={`tag ${domain.statusColor}`}>
                                                {domain.status}
                                            </span>
                                            {domain.ssl && (
                                                <span className="tag emerald">
                                                    <i className="fas fa-lock" style={{ marginRight: '4px' }}></i>
                                                    SSL Active
                                                </span>
                                            )}
                                            <button className="btn btn-ghost">
                                                <i className="fas fa-cog"></i>
                                            </button>
                                            <button className="btn btn-ghost" style={{ color: 'var(--accent-red)' }}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DNS Configuration Guide */}
                    <div className="card mt-12" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(168, 85, 247, 0.05))' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                            DNS Configuration
                        </h3>
                        <div className="content-block">
                            <p>To connect your custom domain, add these DNS records:</p>
                            <div style={{
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '20px',
                                marginTop: '16px',
                                fontFamily: 'monospace',
                                fontSize: '13px'
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <strong>Type:</strong> CNAME<br />
                                    <strong>Name:</strong> @ (or your subdomain)<br />
                                    <strong>Value:</strong> app.aigo.market<br />
                                    <strong>TTL:</strong> 3600
                                </div>
                            </div>
                            <p style={{ marginTop: '16px', fontSize: '14px' }}>
                                Need help? Check out our{' '}
                                <a href="/docs/custom-domains" style={{ color: 'var(--accent-cyan)' }}>
                                    custom domain setup guide
                                </a>{' '}
                                or contact support.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Domains;