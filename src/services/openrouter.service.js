const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_URL = import.meta.env.VITE_API_URL || 'https://aigomarket-backend-production-8b8d.up.railway.app/api';

// Helper to get Supabase auth token
const getAuthToken = () => {
  try {
    const authData = localStorage.getItem('sb-cwhthtgynavwinpbjplt-auth-token');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.access_token || null;
    }
  } catch (error) {
    console.error('Error parsing auth token:', error);
  }
  return null;
};

class OpenRouterService {
  constructor() {
    this.apiKey = null;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async generateArchitecture(requirements, onProgress) {
    // Use instance key OR env variable
    const apiKey = this.apiKey || import.meta.env.VITE_OPENROUTER_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_KEY to your .env file.');
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AIGO Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect. Generate detailed technical specifications for AI applications including frontend, backend, database schema, API endpoints, and deployment strategy.'
          },
          {
            role: 'user',
            content: `Create a complete architecture for: ${requirements}`
          }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.statusText} - ${errorData.error?.message || ''}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              fullResponse += content;
              onProgress?.(fullResponse);
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      // Log token usage for billing
      await this.logTokenUsage('architecture_generation', fullResponse.length);

      return fullResponse;
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  async logTokenUsage(feature, tokenCount) {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.warn('No auth token - skipping usage logging');
        return { success: false };
      }

      const response = await fetch(`${API_URL}/usage/log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feature,
          tokens: tokenCount,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('Failed to log usage:', await response.text());
        return { success: false };
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging token usage:', error);
      return { success: false };
    }
  }
}

export const openRouterService = new OpenRouterService();