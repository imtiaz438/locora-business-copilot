// Backward compatibility forwarder - Redirects legacy references to Whop Checkout Service
import {
  getWhopConfig,
  openWhopCheckout,
  getWhopCustomerPortalUrl,
  WhopConfig,
  OpenWhopCheckoutOptions,
} from './whopService';

export type PaddleConfig = WhopConfig;
export type OpenPaddleCheckoutOptions = OpenWhopCheckoutOptions;

export const getPaddleConfig = getWhopConfig;
export const openPaddleCheckout = openWhopCheckout;
export const getPaddleCustomerPortalUrl = getWhopCustomerPortalUrl;
export const initPaddleClient = async () => null;
