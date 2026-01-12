import React from 'react';
import PageNav from '../components/PageNav';
import PageFooter from '../components/PageFooter';

const openings = [
    {
        id: 1,
        title: 'Senior ML Engineer',
        location: 'Hong Kong / Remote',
        type: 'Full-time',
        department: 'Engineering',
        icon: 'fa-brain',
        color: 'cyan'
    },
    {
        id: 2,
        title: 'Full Stack Engineer',
        location: 'Hong Kong / Remote',
        type: 'Full-time',
        department: 'Engineering',
        icon: 'fa-code',
        color: 'purple'
    },
    {
        id: 3,
        title: 'Product Designer',
        location: 'Hong Kong',
        type: 'Full-time',
        department: 'Design',
        icon: 'fa-palette',
        color: 'emerald'
    },
    {
        id: 4,
        title: 'Developer Advocate',
        location: 'Remote',
        type: 'Full-time',
        department: 'Marketing',
        icon: 'fa-bullhorn',
        color: 'cyan'
    }
];

const benefits = [
    { icon: 'fa-heart', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
    { icon: 'fa-plane', title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
    { icon: 'fa-laptop', title: 'Remote-First', description: 'Work from anywhere in the world' },
    { icon: 'fa-rocket', title: 'Equity Options', description: 'Share in our success with competitive equity packages' },
    { icon: 'fa-graduation-cap', title: 'Learning Budget', description: '$2,000/year for courses, conferences, and books' },
    { icon: 'fa-users', title: 'Team Retreats', description: 'Annual company-wide gatherings in amazing locations' }
];

const Careers = () => {
    return (
        <div className="page-wrapper">
            <PageNav />

            <main className="page-main">
                <div className="container max-w-1200">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="section-title mb-6">Join Our Team</h1>
                        <p className="text-secondary" style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
                            We're building the future of Edge AI. Join a team of talented engineers, designers, and builders who are democratizing AI for founders everywhere.
                        </p>
                    </div>

                    {/* Why AIGO */}
                    <div className="card mb-16" style={{ padding: '48px' }}>
                        <h2 className="section-subtitle text-center mb-12">Why AIGO?</h2>
                        <div className="three-col">
                            <div className="text-center">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: 'var(--accent-cyan)',
                                    fontSize: '28px'
                                }}>
                                    <i className="fas fa-rocket"></i>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                    High Impact
                                </h3>
                                <p className="text-muted" style={{ fontSize: '14px' }}>
                                    Your work directly impacts thousands of founders building AI products
                                </p>
                            </div>

                            <div className="text-center">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: 'var(--accent-purple)',
                                    fontSize: '28px'
                                }}>
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                    Fast Growth
                                </h3>
                                <p className="text-muted" style={{ fontSize: '14px' }}>
                                    Join a rapidly growing startup backed by top investors
                                </p>
                            </div>

                            <div className="text-center">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: 'var(--accent-emerald)',
                                    fontSize: '28px'
                                }}>
                                    <i className="fas fa-brain"></i>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                                    Cutting Edge
                                </h3>
                                <p className="text-muted" style={{ fontSize: '14px' }}>
                                    Work on bleeding-edge AI technology and Edge computing
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-16">
                        <h2 className="section-subtitle text-center mb-12">Benefits & Perks</h2>
                        <div className="three-col">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="info-box">
                                    <div className="info-icon cyan">
                                        <i className={`fas ${benefit.icon}`}></i>
                                    </div>
                                    <div className="info-content">
                                        <h3>{benefit.title}</h3>
                                        <p>{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Open Positions */}
                    <div>
                        <h2 className="section-subtitle text-center mb-12">Open Positions</h2>
                        <div className="auto-grid">
                            {openings.map((job) => (
                                <div key={job.id} className="card" style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                                        <div className={`info-icon ${job.color}`}>
                                            <i className={`fas ${job.icon}`}></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                                                {job.title}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <span className="tag">{job.department}</span>
                                                <span className="text-muted" style={{ fontSize: '14px' }}>
                                                    <i className="fas fa-map-marker-alt" style={{ marginRight: '6px' }}></i>
                                                    {job.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline" style={{ width: '100%' }}>
                                        View Details <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="card text-center mt-16" style={{
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(168, 85, 247, 0.05))',
                        padding: '48px 32px'
                    }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
                            Don't see a perfect fit?
                        </h3>
                        <p className="text-secondary mb-8" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
                            We're always looking for talented people. Send us your resume and tell us what you're passionate about.
                        </p>
                        <a href="mailto:careers@aigo.market" className="btn btn-gradient">
                            <i className="fas fa-envelope"></i> Email careers@aigo.market
                        </a>
                    </div>
                </div>
            </main>

            <PageFooter />
        </div>
    );
};

export default Careers;