import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects, getDatasets, getWalletBalance, getMarketplaceItems } from '../services/api';
import { sendMessageToAIGO } from '../services/chatService';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, pending: 0 });
  const [marketplace, setMarketplace] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'aigo',
      content: 'Hey founder! ?? Drop your idea or upload a sketch. I\'ll analyze and return: Edge AI model, tech stack, algorithms, datasets, and estimated budget.'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsData, datasetsData, walletData, marketplaceData] = await Promise.all([
        getProjects(),
        getDatasets(),
        getWalletBalance(),
        getMarketplaceItems()
      ]);
      setProjects(projectsData);
      setDatasets(datasetsData);
      setWallet(walletData);
      setMarketplace(marketplaceData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { type: 'user', content: userInput };
    setChatMessages(prev => [...prev, newMessage]);
    const messageText = userInput;
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await sendMessageToAIGO(messageText, chatMessages);
      const aiResponse = {
        type: 'aigo',
        content: response.message || 'Here\'s your MVP blueprint!',
        blueprint: response.blueprint
      };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        type: 'aigo',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src="/aigo-logo.png" alt="AIGO" />
          <span>AIGO</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-home"></i>
            Overview
          </button>
          <button
            className={activeTab === 'marketplace' ? 'active' : ''}
            onClick={() => setActiveTab('marketplace')}
          >
            <i className="fas fa-store"></i>
            Marketplace
          </button>
          <button
            className={activeTab === 'architect' ? 'active' : ''}
            onClick={() => setActiveTab('architect')}
          >
            <i className="fas fa-brain"></i>
            MVP Architect
          </button>
          <button
            className={activeTab === 'datasets' ? 'active' : ''}
            onClick={() => setActiveTab('datasets')}
          >
            <i className="fas fa-database"></i>
            Datasets
          </button>
          <button
            className={activeTab === 'training' ? 'active' : ''}
            onClick={() => setActiveTab('training')}
          >
            <i className="fas fa-cogs"></i>
            Training Queue
          </button>
          <button
            className={activeTab === 'wallet' ? 'active' : ''}
            onClick={() => setActiveTab('wallet')}
          >
            <i className="fas fa-wallet"></i>
            Wallet
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1>Founder's Dashboard</h1>
          <div className="user-info">
            <span>{user?.email || 'Founder'}</span>
            <div className="user-avatar">
              {user?.email?.[0]?.toUpperCase() || 'F'}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-project-diagram"></i>
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Projects</div>
                    <div className="stat-value">{projects.length}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Datasets</div>
                    <div className="stat-value">{datasets.length}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-wallet"></i>
                  </div>
                  <div className="stat-info">
                    <div className="stat-label">Wallet Balance</div>
                    <div className="stat-value">${wallet.balance.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="recent-projects">
                <h2>Recent Projects</h2>
                {projects.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-folder-open"></i>
                    <p>No projects yet</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab('architect')}>
                      Create Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="projects-list">
                    {projects.map(project => (
                      <div key={project.id} className="project-card">
                        <h3>{project.name}</h3>
                        <p>{project.description}</p>
                        <span className={`status ${project.status}`}>{project.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'architect' && (
            <div className="architect-section">
              <h2>MVP Architect</h2>
              <p>Your AI-powered assistant for building and deploying MVPs</p>

              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.type}`}>
                      <div className="message-avatar">
                        {msg.type === 'aigo' ? '??' : '?‘¤'}
                      </div>
                      <div className="message-content">
                        <p>{msg.content}</p>
                        {msg.blueprint && (
                          <div className="blueprint-card">
                            <h4>MVP Blueprint</h4>
                            <div className="blueprint-details">
                              <p><strong>Project:</strong> {msg.blueprint.projectName}</p>
                              <p><strong>Timeline:</strong> {msg.blueprint.timeline}</p>
                              <p><strong>Budget:</strong> {msg.blueprint.budget}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="chat-message aigo">
                      <div className="message-avatar">??</div>
                      <div className="message-content">
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Describe your idea..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>

                <div className="quick-templates">
                  <span>Try:</span>
                  <button onClick={() => setUserInput('Build me a plant detector app')}>
                    ?Œ± Plant detector
                  </button>
                  <button onClick={() => setUserInput('Create a fitness coach AI')}>
                    ?’ª Fitness coach
                  </button>
                  <button onClick={() => setUserInput('Smart home automation system')}>
                    ?? Smart home
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="marketplace-section">
              <h2>AI Marketplace</h2>
              <p>Get datasets, AI models, and algorithms to power your training</p>

              <div className="marketplace-grid">
                {marketplace.map(item => (
                  <div key={item.id} className="marketplace-card">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="marketplace-footer">
                      <span className="price">
                        {item.price === 0 ? 'Free' : `$${item.price}`}
                      </span>
                      <span className="downloads">
                        <i className="fas fa-download"></i> {item.downloads}
                      </span>
                    </div>
                    <button className="btn btn-primary">
                      {item.price === 0 ? 'Download' : 'Buy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="wallet-section">
              <h2>Creator Wallet</h2>
              <p>Manage your earnings and Stripe payouts</p>

              <div className="wallet-cards">
                <div className="wallet-card">
                  <div className="wallet-label">Available Balance</div>
                  <div className="wallet-value">${wallet.balance.toFixed(2)}</div>
                  <button className="btn btn-primary">Withdraw to Stripe</button>
                </div>
                <div className="wallet-card">
                  <div className="wallet-label">Pending Payout</div>
                  <div className="wallet-value">${wallet.pending.toFixed(2)}</div>
                  <p className="wallet-note">Processing in 3-5 business days</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
