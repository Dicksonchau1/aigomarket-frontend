// frontend/js/ml-client.js
class AIGOMLClient {
    constructor() {
        this.apiBase = '/api/ml';
        this.userId = this.getUserId();
        this.sessionStart = Date.now();
        this.sessionData = {
            duration: 0,
            clicks: 0,
            scrollDepth: 0,
            mouseActivity: 0
        };
        
        this.init();
    }
    
    getUserId() {
        let uid = localStorage.getItem('aigo_user_id');
        if (!uid) {
            uid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('aigo_user_id', uid);
        }
        return uid;
    }
    
    init() {
        // Track clicks
        document.addEventListener('click', () => {
            this.sessionData.clicks++;
            this.trackEvent('click', { count: this.sessionData.clicks });
        });
        
        // Track scroll
        window.addEventListener('scroll', () => {
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop';
            const sh = 'scrollHeight';
            const scrollPct = Math.round(
                (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100
            );
            this.sessionData.scrollDepth = Math.max(this.sessionData.scrollDepth, scrollPct);
        });
        
        // Track mouse movement
        let mouseThrottle = 0;
        document.addEventListener('mousemove', () => {
            if (Date.now() - mouseThrottle > 100) {
                this.sessionData.mouseActivity++;
                mouseThrottle = Date.now();
            }
        });
        
        // Update duration every second
        setInterval(() => {
            this.sessionData.duration = Date.now() - this.sessionStart;
        }, 1000);
        
        // Initial personalization load
        this.loadPersonalization();
        
        // Analyze session every 15 seconds
        setInterval(() => this.analyzeSession(), 15000);
    }
    
    async loadPersonalization() {
        try {
            const userHistory = {
                totalVisits: localStorage.getItem('aigo_visits') || 0,
                lastVisit: localStorage.getItem('aigo_last_visit')
            };
            
            const params = new URLSearchParams(userHistory);
            const response = await fetch(`${this.apiBase}/personalize/${this.userId}?${params}`);
            const result = await response.json();
            
            if (result.success) {
                this.applyPersonalization(result.data);
            }
            
            // Update visit tracking
            const visits = parseInt(userHistory.totalVisits) + 1;
            localStorage.setItem('aigo_visits', visits);
            localStorage.setItem('aigo_last_visit', new Date().toISOString());
            
        } catch (error) {
            console.error('Personalization failed:', error);
        }
    }
    
    async analyzeSession() {
        try {
            const userHistory = {
                totalVisits: localStorage.getItem('aigo_visits') || 0,
                lastVisit: localStorage.getItem('aigo_last_visit')
            };
            
            const response = await fetch(`${this.apiBase}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    sessionData: this.sessionData,
                    userHistory
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.updateDashboard(result.data);
                console.log('🧠 AIGO ML Analysis:', result.data);
            }
        } catch (error) {
            console.error('Session analysis failed:', error);
        }
    }
    
    async trackEvent(eventType, eventData) {
        try {
            await fetch(`${this.apiBase}/track-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userId,
                    eventType,
                    eventData
                })
            });
        } catch (error) {
            // Silent fail for tracking
        }
    }
    
    applyPersonalization(data) {
        // Update page heading
        const heading = document.querySelector('[data-ml-heading]');
        if (heading) heading.textContent = data.content.heading;
        
        const subheading = document.querySelector('[data-ml-subheading]');
        if (subheading) subheading.textContent = data.content.subheading;
        
        // Update CTAs
        const primaryCTA = document.querySelector('[data-ml-cta-primary]');
        if (primaryCTA) {
            primaryCTA.innerHTML = `${data.content.cta.primary.text} ${data.content.cta.primary.icon}`;
        }
        
        const secondaryCTA = document.querySelector('[data-ml-cta-secondary]');
        if (secondaryCTA) {
            secondaryCTA.innerHTML = `${data.content.cta.secondary.text} ${data.content.cta.secondary.icon}`;
        }
        
        // Update user type badge
        const badge = document.querySelector('[data-ml-badge]');
        if (badge) {
            badge.innerHTML = `${data.userType.icon} ${data.userType.label}`;
            badge.style.display = 'inline-flex';
        }
        
        // Update greeting
        const greeting = document.querySelector('[data-ml-greeting]');
        if (greeting) {
            greeting.textContent = `${data.greeting.icon} ${data.greeting.greeting}`;
        }
        
        console.log('✅ Personalization applied:', data.userType.type);
    }
    
    updateDashboard(data) {
        // Update conversion probability
        const convEl = document.querySelector('[data-ml-conversion]');
        if (convEl) {
            convEl.textContent = `${data.predictions.conversion.probability}%`;
        }
        
        // Update engagement score
        const engEl = document.querySelector('[data-ml-engagement]');
        if (engEl) {
            engEl.textContent = data.behaviorMetrics.engagementScore;
        }
        
        // Update recommended path
        const pathEl = document.querySelector('[data-ml-path]');
        if (pathEl) {
            pathEl.textContent = data.predictions.path.path;
        }
        
        // Show priority actions
        if (data.predictions.path.priority === 'high') {
            const urgentCTA = document.querySelector('[data-ml-urgent]');
            if (urgentCTA) urgentCTA.style.display = 'block';
        }
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aigoML = new AIGOMLClient();
    });
} else {
    window.aigoML = new AIGOMLClient();
}