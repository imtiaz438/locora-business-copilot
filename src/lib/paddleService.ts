// Paddle Billing v2 Integration Client Service
// Manages Paddle.js initialization, checkout overlay/redirect, and payment event handling

import { initializePaddle, Paddle as PaddleInstance } from '@paddle/paddle-js';

export interface PaddleConfig {
  configured: boolean;
  clientToken: string;
  environment: 'sandbox' | 'production';
  hasApiKey: boolean;
  hasWebhookSecret: boolean;
  priceIds: {
    proMonthly: string;
    proYearly: string;
    agencyMonthly: string;
    agencyYearly: string;
  };
}

let cachedConfig: PaddleConfig | null = null;
let paddleInstance: PaddleInstance | null = null;
let isInitializing = false;

/**
 * Fetches public Paddle configuration from the server
 */
export async function getPaddleConfig(): Promise<PaddleConfig> {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch('/api/paddle/config');
    if (res.ok) {
      const data = await res.json();
      cachedConfig = data;
      return data;
    }
  } catch (err) {
    console.warn('[Paddle Service] Could not fetch Paddle config from server:', err);
  }

  return {
    configured: false,
    clientToken: '',
    environment: 'sandbox',
    hasApiKey: false,
    hasWebhookSecret: false,
    priceIds: {
      proMonthly: '',
      proYearly: '',
      agencyMonthly: '',
      agencyYearly: '',
    },
  };
}

/**
 * Initializes the Paddle.js SDK in the browser
 */
export async function initPaddleClient(eventCallback?: (event: any) => void): Promise<PaddleInstance | null> {
  if (paddleInstance) return paddleInstance;
  if (isInitializing) {
    // Wait for in-flight init
    await new Promise((r) => setTimeout(r, 400));
    if (paddleInstance) return paddleInstance;
  }

  isInitializing = true;
  try {
    const config = await getPaddleConfig();
    const clientToken = config.clientToken?.trim() || '';
    const environment = config.environment === 'production' ? 'production' : 'sandbox';

    if (clientToken) {
      paddleInstance = await initializePaddle({
        environment,
        token: clientToken,
        eventCallback: (event) => {
          console.log('[Paddle Event]', event.name, event.data);
          if (eventCallback) eventCallback(event);
        },
      });
      return paddleInstance;
    }

    // Check if global window.Paddle exists
    const winPaddle = (window as any).Paddle;
    if (winPaddle && typeof winPaddle.Initialize === 'function') {
      if (clientToken) {
        winPaddle.Initialize({
          token: clientToken,
          environment,
          eventCallback: (data: any) => {
            console.log('[Global Paddle Event]', data);
            if (eventCallback) eventCallback(data);
          },
        });
      }
      return winPaddle;
    }
  } catch (err: any) {
    console.warn('[Paddle Service] Paddle initialization notice:', err.message);
  } finally {
    isInitializing = false;
  }

  return paddleInstance;
}

export interface OpenPaddleCheckoutOptions {
  plan: 'pro' | 'agency';
  billingCycle: 'monthly' | 'yearly';
  email: string;
  name?: string;
  userId?: string;
  onSuccess?: (data?: any) => void;
  onClose?: () => void;
  onError?: (errMsg: string) => void;
}

/**
 * Initiates checkout using Paddle.js overlay or server checkout session fallback
 */
export async function openPaddleCheckout(options: OpenPaddleCheckoutOptions): Promise<{
  success: boolean;
  url?: string;
  checkoutUrl?: string;
  checkoutId?: string;
  transactionId?: string;
  priceId?: string;
  directSettled?: boolean;
}> {
  const { plan, billingCycle, email, name, userId, onSuccess, onClose, onError } = options;
  const isYearly = billingCycle === 'yearly';

  // 1. Request checkout transaction / price from backend
  const res = await fetch('/api/paddle/create-checkout', {
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
    const errorMsg = data.message || data.error || 'Failed to create Paddle checkout session.';
    if (onError) onError(errorMsg);
    throw new Error(errorMsg);
  }

  // If server directly provisioned (e.g. instant settlement fallback)
  if (data.directSettled) {
    if (onSuccess) onSuccess(data);
    return { success: true, directSettled: true, ...data };
  }

  const priceId = data.priceId;
  const transactionId = data.transactionId;
  const checkoutUrl = data.checkoutUrl || data.url;

  // 2. Try Paddle.js overlay checkout if priceId or transactionId is present
  try {
    const paddle = await initPaddleClient((event) => {
      if (
        event?.name === 'checkout.completed' ||
        event?.name === 'checkout.payment.succeeded' ||
        event?.name === 'checkout.loaded'
      ) {
        if (event.name !== 'checkout.loaded') {
          if (onSuccess) onSuccess(event.data);
        }
      }
      if (event?.name === 'checkout.closed' && onClose) {
        onClose();
      }
    });

    const host = window.location.origin;
    const successUrl = `${host}/?payment_status=success&provider=paddle&plan=${plan}&billing_cycle=${isYearly ? 'yearly' : 'monthly'}`;

    if (paddle && typeof paddle.Checkout?.open === 'function' && (priceId || transactionId)) {
      const checkoutOptions: any = {
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en',
          successUrl,
        },
        customer: {
          email,
        },
        customData: {
          user_id: userId || '',
          user_email: email,
          plan,
          billing_cycle: isYearly ? 'yearly' : 'monthly',
        },
      };

      if (transactionId) {
        checkoutOptions.transactionId = transactionId;
      } else if (priceId) {
        checkoutOptions.items = [{ priceId, quantity: 1 }];
      }

      paddle.Checkout.open(checkoutOptions);

      return {
        success: true,
        transactionId,
        checkoutUrl,
      };
    }
  } catch (sdkErr: any) {
    console.warn('[Paddle Service] Overlay launch fallback to hosted URL:', sdkErr.message);
  }

  // 3. Fallback: Hosted Checkout URL
  if (checkoutUrl) {
    try {
      const win = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      if (win) win.focus();
    } catch {
      window.location.href = checkoutUrl;
    }
    return { success: true, url: checkoutUrl };
  }

  return { success: true, ...data };
}
