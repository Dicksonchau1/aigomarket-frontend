import React from 'react';
import PageNav from '../components/PageNav';
import PageFooter from '../components/PageFooter';

const About = () => {
    return (
        <div className="page-wrapper">
            <PageNav />

            <main className="page-main">
                <div className="container max-w-800">
                    <h1 className="section-title mb-6">About AIGO</h1>

                    <div className="content-block">
                        <p style={{ fontSize: '18px', marginBottom: '32px' }}>
                            AIGO is an Edge AI platform built for founders who want to launch AI-powered products without the enterprise budget.
                        </p>

                        <h2>Our Mission</h2>
                        <p>
                            We believe every founder should have access to cutting-edge AI technology. Our mission is to democratize AI development by providing optimized Edge AI models, curated datasets, and intelligent compression tools that run efficiently on any device.
                        </p>

                        <h2>What We Offer</h2>
                        <ul>
                            <li>50+ Edge AI models optimized for mobile and IoT devices</li>
                            <li>AI-curated datasets with proper licensing</li>
                            <li>Seed AI compression technology for 90% model size reduction</li>
                            <li>One-click mobile export for iOS and Android</li>
                            <li>Custom domain connectivity and backend pairing</li>
                        </ul>

                        <h2>The Team</h2>
                        <p>
                            We're a team of AI researchers, full-stack engineers, and startup veterans based in Hong Kong. Our combined experience spans machine learning, edge computing, and product development for startups and enterprises alike.
                        </p>

                        <h2>Contact Us</h2>
                        <p>
                            Have questions? Reach out at{' '}
                            <a href="mailto:hello@aigo.market">hello@aigo.market</a>
                            {' '}or join our{' '}
                            <a href="https://discord.gg/aigo" target="_blank" rel="noopener noreferrer">Discord community</a>.
                        </p>
                    </div>
                </div>
            </main>

            <PageFooter />
        </div>
    );
};

export default About;