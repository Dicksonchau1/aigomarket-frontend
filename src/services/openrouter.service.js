const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterService {
  constructor() {
    this.apiKey = null;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async generateArchitecture(requirements, onProgress) {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AIGO Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software architect. Generate detailed technical specifications.'
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
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

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
  }

  async logTokenUsage(feature, tokenCount) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/usage/log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        feature,
        tokens: tokenCount,
        timestamp: new Date().toISOString()
      })
    });

    return response.json();
  }
}

export const openRouterService = new OpenRouterService();