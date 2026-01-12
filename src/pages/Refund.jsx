import React from 'react';
import PageNav from '../components/PageNav';
import PageFooter from '../components/PageFooter';

const Refund = () => {
    return (
        <div className="page-wrapper">
            <PageNav />

            <main className="page-main">
                <div className="container max-w-800">
                    <h1 className="section-title mb-6">Refund Policy</h1>
                    <p className="last-updated">Last updated: January 2026</p>

                    <div className="content-block">
                        <h2>1. Satisfaction Guarantee</h2>
                        <p>
                            We want you to be completely satisfied with your purchase. If you're not happy with AIGO, we offer a 14-day money-back guarantee for all paid plans.
                        </p>

                        <h2>2. Eligibility for Refund</h2>
                        <p>To be eligible for a refund, you must:</p>
                        <ul>
                            <li>Request the refund within 14 days of your purchase</li>
                            <li>Not have used more than 50% of your included resources (models, storage, etc.)</li>
                            <li>Provide a valid reason for the refund request</li>
                        </ul>

                        <h2>3. How to Request a Refund</h2>
                        <p>
                            To request a refund, please email{' '}
                            <a href="mailto:billing@aigo.market">billing@aigo.market</a>
                            {' '}with your account email and order ID. Our team will process your request within 3-5 business days.
                        </p>

                        <h2>4. Non-Refundable Items</h2>
                        <p>The following are not eligible for refunds:</p>
                        <ul>
                            <li>Custom enterprise contracts</li>
                            <li>Third-party marketplace purchases</li>
                            <li>Add-on services already consumed</li>
                            <li>Accounts terminated for Terms of Service violations</li>
                        </ul>

                        <h2>5. Refund Processing</h2>
                        <p>
                            Once approved, refunds will be credited to your original payment method within 5-10 business days, depending on your bank or credit card company.
                        </p>

                        <h2>6. Contact Us</h2>
                        <p>
                            For any questions about this Refund Policy, please contact us at{' '}
                            <a href="mailto:billing@aigo.market">billing@aigo.market</a>.
                        </p>
                    </div>
                </div>
            </main>

            <PageFooter />
        </div>
    );
};

export default Refund;