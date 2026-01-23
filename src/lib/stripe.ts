import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase.js'

// Stripe Publishable Key (Live Mode)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_live_51SPFUUK16GbLKgfGpgxz9s42wKYJB9iV0z93I4xZeVEhS7eXa3Ti0lJur9mEEV2gUFETXPozdUA7UEFdh0Yx6Aek00TuxWsJGR'

// Validate Stripe key on initialization
if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY === 'pk_test_YOUR_KEY_HERE') {
  console.error('⚠️ Missing or invalid Stripe publishable key')
}

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

// TypeScript types
export interface TokenPackage {
  packageId: string
  packageName: string
  tokens: number
  price: number
  description?: string
}

export interface PurchaseResponse {
  url: string
  sessionId?: string
}

export interface TokenTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus'
  description: string
  metadata?: Record<string, any>
  created_at: string
}

/**
 * Purchase tokens using Stripe Checkout
 * Redirects user to Stripe payment page
 */
export async function purchaseTokens(tokenPackage: TokenPackage): Promise<void> {
  try {
    // 1. Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Please login to purchase tokens')
    }

    console.log('🛒 Initiating token purchase:', {
      package: tokenPackage.packageName,
      tokens: tokenPackage.tokens,
      price: tokenPackage.price,
      userId: user.id
    })

    // 2. Call Supabase Edge Function to create Stripe Checkout session
    const { data, error } = await supabase.functions.invoke<PurchaseResponse>(
      'create-checkout-session',
      {
        body: {
          packageId: tokenPackage.packageId,
          packageName: tokenPackage.packageName,
          tokens: tokenPackage.tokens,
          price: tokenPackage.price,
          userId: user.id,
          userEmail: user.email,
          type: 'token_purchase',
        },
      }
    )

    if (error) {
      console.error('❌ Checkout session error:', error)
      throw new Error(error.message || 'Failed to create checkout session')
    }

    if (!data?.url) {
      throw new Error('No checkout URL received from server')
    }

    console.log('✅ Checkout session created, redirecting to Stripe...')

    // 3. Redirect to Stripe Checkout
    window.location.href = data.url
    
  } catch (error: any) {
    console.error('❌ Purchase error:', error)
    throw new Error(error.message || 'Failed to initiate purchase')
  }
}

/**
 * Check if user has enough tokens for an operation
 */
export async function hasEnoughTokens(requiredTokens: number): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('⚠️ No authenticated user found')
      return false
    }

    const { data: wallet, error } = await supabase
      .from('user_token_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('❌ Error fetching wallet:', error)
      return false
    }

    const currentBalance = wallet?.balance || 0
    const hasTokens = currentBalance >= requiredTokens

    console.log('💰 Token check:', {
      required: requiredTokens,
      current: currentBalance,
      hasEnough: hasTokens
    })

    return hasTokens
  } catch (error) {
    console.error('❌ Error checking token balance:', error)
    return false
  }
}

/**
 * Get current user's token balance
 */
export async function getTokenBalance(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('⚠️ No authenticated user found')
      return 0
    }

    const { data: wallet, error } = await supabase
      .from('user_token_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('❌ Error fetching token balance:', error)
      return 0
    }

    const balance = wallet?.balance || 0
    console.log('💰 Current token balance:', balance)

    return balance
  } catch (error) {
    console.error('❌ Error fetching token balance:', error)
    return 0
  }
}

/**
 * Get user's token transaction history
 */
export async function getTokenHistory(limit: number = 10): Promise<TokenTransaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('⚠️ No authenticated user found')
      return []
    }

    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching token history:', error)
      return []
    }

    console.log(`📜 Fetched ${data?.length || 0} token transactions`)

    return (data || []) as TokenTransaction[]
  } catch (error) {
    console.error('❌ Error fetching token history:', error)
    return []
  }
}

/**
 * Deduct tokens from user's wallet (for AI operations)
 * Returns true if successful, false if insufficient tokens or error
 */
export async function deductTokens(
  amount: number,
  description: string = 'AI operation'
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('User not authenticated')
    }

    // Check if user has enough tokens
    const hasTokens = await hasEnoughTokens(amount)
    if (!hasTokens) {
      console.error('❌ Insufficient tokens:', { required: amount })
      throw new Error(`Insufficient tokens. Need ${amount} tokens.`)
    }

    console.log('💸 Deducting tokens:', { amount, description, userId: user.id })

    // Insert transaction record (database triggers will update wallet balance)
    const { error } = await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount: -amount, // Negative for deduction
        type: 'usage',
        description,
        metadata: {
          operation: description,
          timestamp: new Date().toISOString(),
        },
      })

    if (error) {
      console.error('❌ Error deducting tokens:', error)
      throw error
    }

    console.log('✅ Tokens deducted successfully')
    return true

  } catch (error: any) {
    console.error('❌ Error deducting tokens:', error)
    throw new Error(error.message || 'Failed to deduct tokens')
  }
}

/**
 * Add bonus tokens to user's wallet (admin/promotional use)
 */
export async function addBonusTokens(
  amount: number,
  description: string = 'Bonus tokens'
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    console.log('🎁 Adding bonus tokens:', { amount, description })

    const { error } = await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        type: 'bonus',
        description,
        metadata: {
          reason: description,
          timestamp: new Date().toISOString(),
        },
      })

    if (error) throw error

    console.log('✅ Bonus tokens added successfully')
    return true

  } catch (error) {
    console.error('❌ Error adding bonus tokens:', error)
    return false
  }
}

/**
 * Predefined token packages
 */
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    packageId: 'starter',
    packageName: 'Starter Pack',
    tokens: 1000,
    price: 9.99,
    description: 'Perfect for trying out AI features',
  },
  {
    packageId: 'pro',
    packageName: 'Pro Pack',
    tokens: 5000,
    price: 39.99,
    description: 'Best value for regular users',
  },
  {
    packageId: 'enterprise',
    packageName: 'Enterprise Pack',
    tokens: 20000,
    price: 129.99,
    description: 'For power users and teams',
  },
]

// Export Stripe promise for advanced usage
export { stripePromise }