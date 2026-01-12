import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const benchmarkResults = [
    {
        model: 'MobileNet V3',
        originalSize: '34.2 MB',
        compressedSize: '3.4 MB',
        reduction: '90%',
        originalAccuracy: '75.8%',
        compressedAccuracy: '75.2%',
        accuracyLoss: '0.6%',
        inferenceSpeed: '12ms',
        icon: 'fa-image',
        color: 'cyan'
    },
    {
        model: 'YOLO Nano',
        originalSize: '42.1 MB',
        compressedSize: '4.2 MB',
        reduction: '90%',
        originalAccuracy: '68.4%',
        compressedAccuracy: '67.8%',
        accuracyLoss: '0.6%',
        inferenceSpeed: '18ms',
        icon: 'fa-crosshairs',
        color: 'purple'
    },
    {
        model: 'EfficientNet Lite',
        originalSize: '51.4 MB',
        compressedSize: '5.1 MB',
        reduction: '90%',
        originalAccuracy: '81.2%',
        compressedAccuracy: '80.5%',
        accuracyLoss: '0.7%',
        inferenceSpeed: '15ms',
        icon: 'fa-layer-group',
        color: 'emerald'
    }
];

const Benchmark = () => {
    const [selectedModel, setSelectedModel] = useState(benchmarkResults[0]);

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
                <div className="container max-w-1200">
                    {/* Header */}
                    <div className="page-header text-center">
                        <h1 className="page-title">Benchmark Results</h1>
                        <p className="page-subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
                            See how our Seed AI compression performs across different models
                        </p>
                    </div>

                    {/* Key Metrics */}
                    <div className="three-col mb-12">
                        <div className="card text-center">
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(6, 182, 212, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                color: 'var(--accent-cyan)',
                                fontSize: '24px'
                            }}>
                                <i className="fas fa-compress"></i>
                            </div>
                            <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                                Average Compression
                            </p>
                            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                                90%
                            </p>
                        </div>

                        <div className="card text-center">
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(168, 85, 247, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                color: 'var(--accent-purple)',
                                fontSize: '24px'
                            }}>
                                <i className="fas fa-tachometer-alt"></i>
                            </div>
                            <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                                Accuracy Loss
                            </p>
                            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-purple)' }}>
                                &lt;1%
                            </p>
                        </div>

                        <div className="card text-center">
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                                color: 'var(--accent-emerald)',
                                fontSize: '24px'
                            }}>
                                <i className="fas fa-bolt"></i>
                            </div>
                            <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
                                Inference Speed
                            </p>
                            <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                                15ms
                            </p>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="card mb-12">
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                            Model Comparison
                        </h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Model</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Original Size</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Compressed</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Reduction</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Accuracy</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Loss</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Speed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {benchmarkResults.map((result, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div className={`info-icon ${result.color}`} style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                                                        <i className={`fas ${result.icon}`}></i>
                                                    </div>
                                                    <span style={{ fontWeight: '600' }}>{result.model}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{result.originalSize}</td>
                                            <td style={{ padding: '16px', fontWeight: '600', color: 'var(--accent-cyan)' }}>{result.compressedSize}</td>
                                            <td style={{ padding: '16px' }}>
                                                <span className="tag emerald">{result.reduction}</span>
                                            </td>
                                            <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                                {result.originalAccuracy} → {result.compressedAccuracy}
                                            </td>
                                            <td style={{ padding: '16px', color: 'var(--accent-emerald)' }}>{result.accuracyLoss}</td>
                                            <td style={{ padding: '16px', fontWeight: '600' }}>{result.inferenceSpeed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* How We Test */}
                    <div className="two-col">
                        <div className="card">
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                                Testing Methodology
                            </h3>
                            <div className="content-block">
                                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    <li>All models tested on iPhone 13 Pro</li>
                                    <li>Benchmarks run on standard ImageNet dataset</li>
                                    <li>Inference time averaged over 100 runs</li>
                                    <li>Accuracy measured on 10,000 validation images</li>
                                </ul>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(168, 85, 247, 0.05))' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                                Want to see your model benchmarked?
                            </h3>
                            <p className="text-secondary mb-6" style={{ fontSize: '14px' }}>
                                Upload your model and we'll run comprehensive benchmarks for free.
                            </p>
                            <Link to="/upload-model" className="btn btn-gradient">
                                <i className="fas fa-upload"></i> Upload Model
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Benchmark;