// src/config/api.js - Railway Backend Configuration (AI/ML/Webhooks ONLY)

/**
 * Railway Backend Base URL
 * Uses environment variable or defaults to production URL
 */
const RAILWAY_URL = import.meta.env.VITE_API_URL || 'https://aigomarket-backend-production-8b8d.up.railway.app';

// Remove trailing slash if present
const BASE_URL = RAILWAY_URL.replace(/\/$/, '');

/**
 * Railway API Endpoints
 * Only for features that REQUIRE server-side processing:
 * - RunPod AI/ML operations
 * - OpenRouter AI chat
 * - Stripe webhook handling
 * - Server-side file validation
 */
export const RAILWAY_ENDPOINTS = {
  // ============================================
  // RUNPOD AI/ML ENDPOINTS
  // ============================================
  
  /**
   * POST /api/compress
   * Submit algorithm compression job to RunPod
   * @body { algorithm_code: string, compression_method: string }
   * @returns { job_id: string, status: string }
   */
  COMPRESS: `${BASE_URL}/api/compress`,
  
  /**
   * POST /api/verify
   * Submit algorithm verification job to RunPod
   * @body { algorithm_code: string, datasets: string[] }
   * @returns { job_id: string, status: string }
   */
  VERIFY: `${BASE_URL}/api/verify`,
  
  /**
   * GET /api/job-status/:jobId
   * Check RunPod job status
   * @param jobId - RunPod job ID
   * @returns { status: string, output: any, error: any }
   */
  JOB_STATUS: (jobId) => `${BASE_URL}/api/job-status/${jobId}`,
  
  // ============================================
  // OPENROUTER AI ENDPOINTS (Future)
  // ============================================
  
  /**
   * POST /api/ai/chat
   * OpenRouter AI chat endpoint
   * @body { messages: array, model: string }
   */
  AI_CHAT: `${BASE_URL}/api/ai/chat`,
  
  // ============================================
  // MODEL UPLOAD PROCESSING
  // ============================================
  
  /**
   * POST /api/upload/model
   * Server-side model upload validation & processing
   * @body FormData with model file
   */
  UPLOAD_MODEL: `${BASE_URL}/api/upload/model`,
  
  /**
   * POST /api/upload/dataset
   * Server-side dataset upload validation
   * @body FormData with dataset file
   */
  UPLOAD_DATASET: `${BASE_URL}/api/upload/dataset`,
  
  // ============================================
  // STRIPE PAYMENT ENDPOINTS
  // ============================================
  
  /**
   * POST /api/stripe/create-checkout-session
   * Create Stripe checkout session
   * @body { priceId: string, successUrl: string, cancelUrl: string }
   * @returns { sessionId: string, url: string }
   */
  STRIPE_CHECKOUT: `${BASE_URL}/api/stripe/create-checkout-session`,
  
  /**
   * POST /api/stripe/webhook
   * Stripe webhook endpoint (handled by backend)
   * DO NOT call this from frontend - Stripe calls it directly
   */
  STRIPE_WEBHOOK: `${BASE_URL}/api/stripe/webhook`,
  
  /**
   * GET /api/stripe/verify/:sessionId
   * Verify Stripe payment session
   * @param sessionId - Stripe session ID
   */
  STRIPE_VERIFY: (sessionId) => `${BASE_URL}/api/stripe/verify/${sessionId}`,
  
  // ============================================
  // HEALTH CHECK
  // ============================================
  
  /**
   * GET /health
   * Server health check
   */
  HEALTH: `${BASE_URL}/health`,
  
  /**
   * GET /api/health
   * API health check with service status
   */
  API_HEALTH: `${BASE_URL}/api/health`
};

/**
 * Axios configuration for Railway backend
 */
export const RAILWAY_CONFIG = {
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true, // Send cookies
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Check if Railway backend is available
 */
export async function checkRailwayHealth() {
  try {
    const response = await fetch(RAILWAY_ENDPOINTS.HEALTH);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('??Railway backend unreachable:', error);
    return false;
  }
}

// Export base URL for convenience
export { BASE_URL as RAILWAY_BASE_URL };

export default RAILWAY_ENDPOINTS;
