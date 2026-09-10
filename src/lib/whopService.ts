// Whop Payments & Subscription Integration Client Service
// Manages Whop Checkout session generation, link generation, and subscription portal access

export interface WhopConfig {
  configured: boolean;
  companyId: string;
  environment: 'sandbox' | 'production';
  hasApiKey: boolean;
  hasWebhookSecret: boolean;
  planIds: {
    proMonthly: string;
    proYearly: string;
    agencyMonthly: string;
    agencyYearly: string;
  };
  checkoutUrls: {
    proMonthly: string;
    proYearly: string;
    agencyMonthly: string;
    agencyYearly: string;
  };
}

let cachedConfig: WhopConfig | null = null;

/**
 * Fetches public Whop configuration from the backend
 */
export async function getWhopConfig(): Promise<WhopConfig> {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch('/api/whop/config');
    if (res.ok) {
      const data = await res.json();
      cachedConfig = data;
      return data;
    }
  } catch (err) {
    console.warn('[Whop Service] Could not fetch Whop config from server:', err);
  }

  return {
    configured: false,
    companyId: '',
    environment: 'sandbox',
    hasApiKey: false,
    hasWebhookSecret: false,
    planIds: {
      proMonthly: '',
      proYearly: '',
      agencyMonthly: '',
      agencyYearly: '',
    },
    checkoutUrls: {
      proMonthly: '',
      proYearly: '',
      agencyMonthly: '',
      agencyYearly: '',
    },
  };
}

export interface OpenWhopOneTimeCheckoutOptions {
  productType: 'fuel_pack' | 'white_label_audit' | 'lead_list' | 'masterclass_kit';
  packId?: string;
  auditId?: string;
  leadsCount?: number;
  credits?: number;
  price: number;
  email: string;
  name?: string;
  userId?: string;
  metadata?: Record<string, any>;
  onSuccess?: (data?: any) => void;
  onError?: (errMsg: string) => void;
}

/**
 * Initiates a one-time Whop Checkout session for top-ups or à la carte white-label audit exports
 */
export async function openWhopOneTimeCheckout(options: OpenWhopOneTimeCheckoutOptions): Promise<{
  success: boolean;
  checkoutUrl?: string;
  directSettled?: boolean;
}> {
  const { productType, packId, auditId, credits, price, email, name, userId, metadata, onError } = options;

  try {
    const res = await fetch('/api/whop/create-onetime-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productType,
        packId,
        auditId,
        credits,
        price,
        email,
        name,
        userId,
        metadata,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMsg = data.message || data.error || 'Failed to create one-time checkout session.';
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const checkoutUrl = data.checkoutUrl || data.url;
    if (checkoutUrl) {
      try {
        const win = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        if (win) win.focus();
      } catch {}
    }

    return {
      success: true,
      checkoutUrl,
    };
  } catch (err: any) {
    const msg = err.message || 'Error launching one-time checkout.';
    if (onError) onError(msg);
    throw err;
  }
}


export interface OpenWhopCheckoutOptions {
  plan: 'pro' | 'agency' | 'free' | 'elite';
  billingCycle: 'monthly' | 'yearly';
  email: string;
  name?: string;
  userId?: string;
  onSuccess?: (data?: any) => void;
  onClose?: () => void;
  onError?: (errMsg: string) => void;
}

/**
 * Initiates checkout using Whop Checkout session or direct checkout link
 */

export async function openWhopCheckout(options: OpenWhopCheckoutOptions): Promise<{
  success: boolean;
  url?: string;
  checkoutUrl?: string;
  checkoutId?: string;
  planId?: string;
  companyId?: string;
  directSettled?: boolean;
}> {
  const { plan, billingCycle, email, name, userId, onSuccess, onError } = options;
  const isYearly = billingCycle === 'yearly';

  try {
    // 1. Request checkout session / verified checkout URL from backend
    const res = await fetch('/api/whop/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        billingCycle,
        email,
        name,
        userId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.message || data.error || 'Failed to create Whop checkout session. Please check gateway configuration.';
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    const checkoutUrl = data.checkoutUrl || data.url;
    const planId = data.planId;
    const companyId = data.companyId;

    if (!checkoutUrl) {
      const errorMsg = 'Whop checkout URL was not generated. Please configure your Whop API credentials or plan links.';
      if (onError) onError(errorMsg);
      throw new Error(errorMsg);
    }

    // 2. Open Whop Checkout in secure new tab/window or current page
    try {
      const win = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      if (win) {
        win.focus();
      }
    } catch {
      // ignore popup blocker error if any
    }

    return {
      success: true,
      url: checkoutUrl,
      checkoutUrl,
      planId,
      companyId,
    };
  } catch (err: any) {
    const msg = err.message || 'Error launching Whop checkout.';
    if (onError) onError(msg);
    throw err;
  }
}

export const WHOP_CUSTOMER_LOGIN_URL = 'https://whop.com/login?redirect_to=%2Fhub%2Forders';

/**
 * Fetches user billing portal / customer hub URL from Whop
 */
export async function getWhopCustomerPortalUrl(email?: string): Promise<string> {
  try {
    const res = await fetch('/api/whop/customer-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url || data.portalUrl) {
        return data.url || data.portalUrl;
      }
    }
  } catch (err) {
    console.warn('[Whop Service] Could not fetch portal URL:', err);
  }
  return WHOP_CUSTOMER_LOGIN_URL;
}
