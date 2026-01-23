import React from 'react';
import { Link } from 'react-router-dom';

const PageNav = () => {
    return (
        <nav className="navbar scrolled">
            <div className="navbar-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <i className="fas fa-bolt"></i>
                    </div>
                    <span className="logo-text-metallic">AIGO</span>
                </Link>
                <Link to="/" className="btn btn-ghost">
                    <i className="fas fa-arrow-left"></i> Back to Home
                </Link>
            </div>
        </nav>
    );
};

export default PageNav;
