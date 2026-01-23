// src/hooks/useMLPersonalization.js
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useMLPersonalization(userId) {
  const [personalization, setPersonalization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session tracking
  const [sessionData, setSessionData] = useState({
    startTime: Date.now(),
    clicks: 0,
    scrollDepth: 0,
    duration: 0,
    interactions: []
  });

  // Fetch personalized content
  const fetchPersonalization = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/ml/personalize/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch personalization');
      }

      const result = await response.json();
      
      if (result.success) {
        setPersonalization(result.data);
      }
    } catch (err) {
      console.error('ML Personalization Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Track clicks
  const trackClick = useCallback((elementType, elementId) => {
    setSessionData(prev => ({
      ...prev,
      clicks: prev.clicks + 1,
      interactions: [...prev.interactions, {
        type: 'click',
        element: elementType,
        id: elementId,
        timestamp: Date.now()
      }]
    }));
  }, []);

  // Track scroll depth
  const trackScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;

    setSessionData(prev => ({
      ...prev,
      scrollDepth: Math.max(prev.scrollDepth, scrollPercent)
    }));
  }, []);

  // Send analytics to backend
  const sendAnalytics = useCallback(async () => {
    if (!userId) return;

    const duration = Date.now() - sessionData.startTime;
    
    try {
      await fetch(`${API_BASE_URL}/api/ml/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionData: {
            ...sessionData,
            duration
          },
          userHistory: {
            totalVisits: parseInt(localStorage.getItem('totalVisits') || '0') + 1,
            lastVisit: new Date().toISOString()
          }
        })
      });

      // Update visit count
      const totalVisits = parseInt(localStorage.getItem('totalVisits') || '0') + 1;
      localStorage.setItem('totalVisits', totalVisits.toString());
      localStorage.setItem('lastVisit', new Date().toISOString());
    } catch (err) {
      console.error('Analytics error:', err);
    }
  }, [userId, sessionData]);

  // Initialize
  useEffect(() => {
    fetchPersonalization();
  }, [fetchPersonalization]);

  // Track scroll
  useEffect(() => {
    window.addEventListener('scroll', trackScroll, { passive: true });
    return () => window.removeEventListener('scroll', trackScroll);
  }, [trackScroll]);

  // Send analytics on unmount
  useEffect(() => {
    return () => {
      sendAnalytics();
    };
  }, [sendAnalytics]);

  return {
    personalization,
    loading,
    error,
    trackClick,
    refresh: fetchPersonalization
  };
}