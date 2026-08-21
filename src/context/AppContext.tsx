import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BusinessProfile,
  AppSettings,
  Customer,
  Project,
  Note,
  Invoice,
  Proposal,
  DocumentItem,
  AIConversation,
  AIMessage,
  LocalSeoItem,
  WebsiteAuditResult,
  MarketingPlannerOutput,
  AIProviderId,
  UserProfile,
  UserPlan,
  UserRole,
  SubscriptionInvoice,
  BillingCycle,
  ActivityLogItem,
} from '../types';

interface AppContextType {
  user: UserProfile;
  updateUser: (data: Partial<UserProfile>) => void;
  login: (email: string, name?: string, company?: string, plan?: UserPlan, initialCreditsUsed?: number, role?: UserRole, userId?: string) => void;
  logout: () => void;
  resetDemoCredits: () => void;
  subscribePlan: (plan: UserPlan, billingCycle?: BillingCycle, paymentDetails?: { cardLast4: string; cardBrand: string; expDate: string }) => void;
  hasEnoughCredits: (amount?: number) => boolean;
  consumeAiCredit: (amount?: number) => boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  checkoutModalPlan: UserPlan | null;
  checkoutModalCycle: BillingCycle;
  setCheckoutModalPlan: (plan: UserPlan | null, cycle?: BillingCycle) => void;
  initiateStripeCheckout: (plan: UserPlan, billingCycle?: BillingCycle) => Promise<void>;
  pendingPlanAfterAuth: { plan: UserPlan; cycle: BillingCycle } | null;
  setPendingPlanAfterAuth: (value: { plan: UserPlan; cycle: BillingCycle } | null) => void;
  subscriptionInvoices: SubscriptionInvoice[];
  activityLogs: ActivityLogItem[];
  logActivity: (type: string, title: string, description?: string) => void;

  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteNote: (id: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  deleteInvoice: (id: string) => void;
  proposals: Proposal[];
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt'>) => void;
  updateProposalStatus: (id: string, status: Proposal['status']) => void;
  deleteProposal: (id: string) => void;
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt'>) => void;
  deleteDocument: (id: string) => void;
  conversations: AIConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  createConversation: (title?: string) => string;
  addMessageToConversation: (conversationId: string, message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  deleteConversation: (id: string) => void;
  localSeoItems: LocalSeoItem[];
  addLocalSeoItem: (item: Omit<LocalSeoItem, 'id' | 'createdAt'>) => void;
  deleteLocalSeoItem: (id: string) => void;
  latestWebsiteAudit: WebsiteAuditResult | null;
  setLatestWebsiteAudit: (audit: WebsiteAuditResult) => void;
  latestMarketingPlan: MarketingPlannerOutput | null;
  setLatestMarketingPlan: (plan: MarketingPlannerOutput) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}


const DEFAULT_PROFILE: BusinessProfile = {
  id: 'bp_1',
  name: 'My Business Workspace',
  tagline: 'Local Service & Business Workspace',
  industry: 'Services',
  description: '',
  targetAudience: '',
  toneOfVoice: 'Professional, helpful and results-driven',
  website: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  currency: 'USD',
  taxRate: 0,
  taxId: '',
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  activeProvider: 'groq',
  activeModelVersion: 'llama-3.3-70b-versatile',
  providerModels: {
    groq: 'llama-3.3-70b-versatile',
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o',
    claude: 'claude-3-7-sonnet-20250219',
    perplexity: 'sonar-pro',
    deepseek: 'deepseek-chat',
  },
  providerKeys: {
    gemini: '',
    openai: '',
    claude: '',
    perplexity: '',
    deepseek: '',
    groq: '',
    opus: '',
    cursor: '',
    grok: '',
  },
  theme: 'dark',
  autoSave: true,
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  userKeyStatus: {},
};

const DEFAULT_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Guest User',
  email: '',
  companyName: '',
  role: 'customer',
  planTier: 'free',
  subscriptionStatus: 'active',
  billingCycle: 'monthly',
  monthlyAiCredits: 15,
  aiCreditsUsed: 0,
  invoicesCreatedCount: 0,
  memberSince: new Date().toISOString(),
  nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
  autoRenew: true,
  paymentMethod: undefined,
  isAuthenticated: false,
};

const DEFAULT_SUBSCRIPTION_INVOICES: SubscriptionInvoice[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '').trim();
      if (path === 'admin') return 'admin';
      if (path === 'features') return 'features';
      if (path === 'pricing') return 'pricing_public';
      if (path === 'about') return 'about';
      if (path === 'contact') return 'contact';
      if (path === 'login') return 'login';
      if (path === 'signup') return 'signup';
      if (path === 'dashboard') return 'dashboard';
      if (window.location.pathname.startsWith('/for/')) return 'industry_pseo';
    }
    return 'home';
  });

const TAB_TO_PATH: Record<string, string> = {
  home: '/',
  features: '/features',
  pricing_public: '/pricing',
  about: '/about',
  contact: '/contact',
  login: '/login',
  signup: '/signup',
  privacy: '/privacy',
  terms: '/terms',
  security: '/security',
  dashboard: '/dashboard',
  chat: '/chat',
  crm: '/crm',
  projects: '/projects',
  invoices: '/invoices',
  proposals: '/proposals',
  documents: '/documents',
  website_review: '/website-audit',
  local_seo: '/local-seo',
  marketing: '/marketing-planner',
  marketing_planner: '/marketing-planner',
  pricing: '/pricing-plans',
  subscription: '/subscription',
  settings: '/settings',
  admin: '/admin',
};

const PATH_TO_TAB: Record<string, string> = {
  '': 'home',
  'features': 'features',
  'pricing': 'pricing_public',
  'about': 'about',
  'contact': 'contact',
  'login': 'login',
  'signup': 'signup',
  'privacy': 'privacy',
  'privacy-policy': 'privacy',
  'terms': 'terms',
  'terms-of-service': 'terms',
  'terms-conditions': 'terms',
  'terms-and-conditions': 'terms',
  'term-condition': 'terms',
  'terms-condition': 'terms',
  'security': 'security',
  'dashboard': 'dashboard',
  'chat': 'chat',
  'crm': 'crm',
  'projects': 'projects',
  'invoices': 'invoices',
  'proposals': 'proposals',
  'documents': 'documents',
  'website-audit': 'website_review',
  'local-seo': 'local_seo',
  'marketing-planner': 'marketing',
  'pricing-plans': 'pricing',
  'subscription': 'subscription',
  'settings': 'settings',
  'admin': 'admin',
};

  const setActiveTab = useCallback((tab: string) => {
    let targetTab = tab;
    if (typeof window !== 'undefined') {
      const isAuth = user.isAuthenticated;

      if (isAuth && (tab === 'login' || tab === 'signup')) {
        targetTab = 'dashboard';
      }

      let newPath = TAB_TO_PATH[targetTab] || `/${targetTab}`;
      if (targetTab === 'industry_pseo') {
        if (window.location.pathname.startsWith('/for/')) {
          newPath = window.location.pathname;
        } else {
          newPath = '/for/restaurants';
        }
      }

      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    }
    setActiveTabState((prev) => (prev !== targetTab ? targetTab : prev));
  }, [user.isAuthenticated]);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [checkoutModalPlan, setCheckoutModalPlanState] = useState<UserPlan | null>(null);
  const [checkoutModalCycle, setCheckoutModalCycleState] = useState<BillingCycle>('monthly');
  const [pendingPlanAfterAuth, setPendingPlanAfterAuth] = useState<{ plan: UserPlan; cycle: BillingCycle } | null>(null);

  // Hydrate user session directly from PostgreSQL database on load only if active window session exists
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasActiveSession = sessionStorage.getItem('locora_active_session') === 'true';
    const lastActiveStr = sessionStorage.getItem('locora_last_active');
    const lastActive = lastActiveStr ? Number(lastActiveStr) : 0;
    const now = Date.now();
    const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes inactivity limit

    // If window or browser was closed and reopened, sessionStorage will be empty
    // In that case, enforce logged-out state and clear any stale cookie
    if (!hasActiveSession) {
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      setUser(DEFAULT_USER);
      return;
    }

    // If inactivity timeout exceeded within the same session
    if (lastActive && (now - lastActive > INACTIVITY_TIMEOUT_MS)) {
      sessionStorage.removeItem('locora_active_session');
      sessionStorage.removeItem('locora_last_active');
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      setUser(DEFAULT_USER);
      return;
    }

    // Active window session is valid: fetch user data
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('No active session');
        return res.json();
      })
      .then((data) => {
        if (data && data.user && data.user.email) {
          const normalizedEmailToFetch = data.user.email.toLowerCase().trim();
          const isSuperAdminEmail = normalizedEmailToFetch === 'imtiazbaloch3322@gmail.com' || normalizedEmailToFetch === 'support@locoraai.com';
          sessionStorage.setItem('locora_active_session', 'true');
          sessionStorage.setItem('locora_last_active', String(Date.now()));
          setUser({
            ...data.user,
            role: isSuperAdminEmail ? 'admin' : (data.user.role || 'customer'),
            isAuthenticated: true,
          });
        } else {
          sessionStorage.removeItem('locora_active_session');
          sessionStorage.removeItem('locora_last_active');
          setUser(DEFAULT_USER);
        }
      })
      .catch(() => {
        sessionStorage.removeItem('locora_active_session');
        sessionStorage.removeItem('locora_last_active');
        setUser(DEFAULT_USER);
      });
  }, []);

  // Global listener for OAuth cross-window message events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOAuthPostMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS' && event.data.user) {
        const u = event.data.user;
        login(
          u.email,
          u.name,
          u.companyName,
          u.planTier || 'free',
          u.aiCreditsUsed || 0,
          u.role,
          u.id
        );
        setActiveTabState('dashboard');
        setAuthModalOpen(false);
      }
    };

    window.addEventListener('message', handleOAuthPostMessage);
    return () => window.removeEventListener('message', handleOAuthPostMessage);
  }, []);

  // Inactivity Watcher & Window Activity Tracker
  useEffect(() => {
    if (typeof window === 'undefined' || !user.isAuthenticated) return;

    let lastThrottle = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottle > 10000) { // update at most once every 10s
        lastThrottle = now;
        sessionStorage.setItem('locora_last_active', String(now));
      }
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('mousedown', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });

    // Periodic check for inactivity timeout (every 30 seconds)
    const intervalId = setInterval(() => {
      const lastActiveStr = sessionStorage.getItem('locora_last_active');
      const lastActive = lastActiveStr ? Number(lastActiveStr) : Date.now();
      const now = Date.now();
      const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 mins
      if (lastActive && (now - lastActive > INACTIVITY_TIMEOUT_MS)) {
        logout();
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      clearInterval(intervalId);
    };
  }, [user.isAuthenticated]);

  const setCheckoutModalPlan = (plan: UserPlan | null, cycle: BillingCycle = 'monthly') => {
    if (plan && (!user.isAuthenticated || !user.email)) {
      setPendingPlanAfterAuth({ plan, cycle: cycle || 'monthly' });
      setCheckoutModalPlanState(null);
      setAuthModalOpen(true);
      return;
    }
    setCheckoutModalPlanState(plan);
    setCheckoutModalCycleState(cycle || 'monthly');
  };

  const [subscriptionInvoices, setSubscriptionInvoices] = useState<SubscriptionInvoice[]>(DEFAULT_SUBSCRIPTION_INVOICES);

  // Purge any legacy localStorage keys to enforce database-only persistence
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove = [
        'locora_user',
        'locora_profile',
        'locora_settings',
        'locora_customers',
        'locora_projects',
        'locora_notes',
        'locora_invoices',
        'locora_proposals',
        'locora_documents',
        'locora_conversations',
        'locora_activity_logs',
        'locora_local_seo',
        'locora_sub_invoices',
        'locora_admin_key',
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    }
  }, []);

  // Ensure monthlyAiCredits aligns with current planTier (25/mo for Starter, 15 for Demo Guest, 250 for Pro, 9999 for Agency)
  useEffect(() => {
    const isDemo = user.email?.toLowerCase() === 'free.user@starterbiz.com' || !user.email;
    const creditsMap: Record<UserPlan, number> = { free: isDemo ? 15 : 25, pro: 250, agency: 9999 };
    const expected = creditsMap[user.planTier || 'free'] || 25;
    if (!user.monthlyAiCredits || (user.planTier === 'free' && user.monthlyAiCredits !== expected)) {
      setUser((prev) => ({
        ...prev,
        monthlyAiCredits: expected,
      }));
    }
  }, [user.planTier, user.email]);

  // Monthly credit auto-renewal lifecycle for registered users
  useEffect(() => {
    if (user.isAuthenticated && user.nextBillingDate && user.planTier !== 'agency') {
      const nextDate = new Date(user.nextBillingDate).getTime();
      if (!isNaN(nextDate) && Date.now() > nextDate) {
        // Reset credits for the new monthly cycle
        setUser((prev) => ({
          ...prev,
          aiCreditsUsed: 0,
          nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        }));
      }
    }
  }, [user.isAuthenticated, user.nextBillingDate, user.planTier]);

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...data };
      if (updated.email) {
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: updated.email,
            name: updated.name,
            companyName: updated.companyName,
            planTier: updated.planTier,
            monthlyAiCredits: updated.monthlyAiCredits,
            aiCreditsUsed: updated.aiCreditsUsed,
            autoRenew: updated.autoRenew,
            billingCycle: updated.billingCycle,
            subscriptionStatus: updated.subscriptionStatus,
          }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const login = (
    email: string,
    name?: string,
    company?: string,
    plan: UserPlan = 'free',
    initialCreditsUsed?: number,
    role?: UserRole,
    userId?: string
  ) => {
    const isProOrAgency = plan === 'pro' || plan === 'agency';
    const userEmail = (email || 'user@example.com').toLowerCase().trim();
    const isDemoAccount = userEmail === 'free.user@starterbiz.com' || userEmail === 'usr_guest' || !userEmail;
    const credits = plan === 'agency' ? 9999 : plan === 'pro' ? 250 : isDemoAccount ? 15 : 25;
    const isDemo = userEmail === 'alex@apexdigitalsolutions.com' || userEmail === 'agency.owner@locoramarketing.com';
    const companyName = company || (name ? `${name}'s Business` : 'My Business Workspace');

    let usedCredits = 0;
    if (typeof initialCreditsUsed === 'number' && !isNaN(initialCreditsUsed)) {
      usedCredits = initialCreditsUsed;
    }

    const isSuperAdmin = userEmail === 'imtiazbaloch3322@gmail.com' || userEmail === 'support@locoraai.com';
    const assignedRole: UserRole = isSuperAdmin ? 'admin' : (role || 'customer');

    const newUser: UserProfile = {
      id: userId || `usr_${Date.now()}`,
      name: name || (userEmail ? userEmail.split('@')[0] : 'Locora User'),
      email: userEmail,
      companyName,
      role: assignedRole,
      planTier: plan,
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      monthlyAiCredits: credits,
      aiCreditsUsed: usedCredits,
      memberSince: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      paymentMethod: undefined,
      isAuthenticated: true,
    };

    setUser(newUser);

    // Set active session in sessionStorage so it only persists for the current window/tab session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('locora_active_session', 'true');
      sessionStorage.setItem('locora_last_active', String(Date.now()));
    }

    // Sync user state with backend DB and hydrate latest session from database
    fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUser.email,
        name: newUser.name,
        companyName: newUser.companyName,
        planTier: newUser.planTier,
        monthlyAiCredits: newUser.monthlyAiCredits,
        aiCreditsUsed: newUser.aiCreditsUsed,
        role: newUser.role,
      }),
    })
      .then(() => fetch(`/api/auth/me?email=${encodeURIComponent(userEmail)}`))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setUser((prev) => ({
            ...prev,
            ...data.user,
            isAuthenticated: true,
          }));
        }
      })
      .catch(() => {});

    // Initialize clean user business profile & fresh workspace if non-demo account
    if (!isDemo) {
      setBusinessProfile((prev) => ({
        ...prev,
        id: `bp_${newUser.id}`,
        name: companyName || prev.name,
        email: userEmail,
        updatedAt: new Date().toISOString(),
      }));
      setCustomers([]);
      setProjects([]);
      setNotes([]);
      setInvoices([]);
      setProposals([]);
      setDocuments([]);
      setConversations([]);
      setActivityLogs([]);
      setLocalSeoItems([]);
    }

    setAuthModalOpen(false);
    setActiveTab('dashboard');

    // If user attempted to upgrade before registering/logging in, trigger checkout modal automatically now
    if (pendingPlanAfterAuth) {
      const targetPlan = pendingPlanAfterAuth.plan;
      const targetCycle = pendingPlanAfterAuth.cycle;
      setPendingPlanAfterAuth(null);
      setTimeout(() => {
        setCheckoutModalPlanState(targetPlan);
        setCheckoutModalCycleState(targetCycle);
      }, 300);
    }
  };

  const initiateStripeCheckout = async (plan: UserPlan, billingCycle: BillingCycle = checkoutModalCycle || 'monthly') => {
    if (!user.isAuthenticated || !user.email) {
      setPendingPlanAfterAuth({ plan, cycle: billingCycle });
      setCheckoutModalPlanState(null);
      setAuthModalOpen(true);
      throw new Error('Please register or sign in to your account first before upgrading your plan.');
    }

    if (plan === 'free') {
      setUser((prev) => ({
        ...prev,
        planTier: 'free',
        role: prev.role === 'admin' ? 'admin' : 'customer',
      }));
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          planTier: 'free',
          role: user.role === 'admin' ? 'admin' : 'customer',
        }),
      }).catch(() => {});
      setActiveTab('dashboard');
      return;
    }

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          billingCycle,
          email: user.email,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.message || data.error || 'Stripe Checkout is not currently configured.');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Unable to generate Stripe checkout URL. Please check payment gateway configuration.');
      }
    } catch (err: any) {
      console.error('Stripe Checkout Error:', err);
      alert(err.message || 'Payment system error. Please check your network connection.');
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('locora_active_session');
      sessionStorage.removeItem('locora_last_active');
    }
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(DEFAULT_USER);
    setAuthModalOpen(false);
    setActiveTab('home');
  };

  const resetDemoCredits = () => {
    setUser((prev) => {
      const userEmail = (prev.email || 'free.user@starterbiz.com').toLowerCase();
      const updated = { ...prev, aiCreditsUsed: 0 };
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          aiCreditsUsed: 0,
        }),
      }).catch(() => {});
      return updated;
    });
  };

  const subscribePlan = (
    plan: UserPlan,
    billingCycle: BillingCycle = 'monthly',
    paymentDetails?: { cardLast4: string; cardBrand: string; expDate: string }
  ) => {
    const creditsMap: Record<UserPlan, number> = {
      free: 25,
      pro: 250,
      agency: 9999,
    };
    const priceMapMonthly: Record<UserPlan, number> = { free: 0, pro: 19, agency: 49 };
    const priceMapYearly: Record<UserPlan, number> = { free: 0, pro: 15 * 12, agency: 39 * 12 };

    const amount = billingCycle === 'yearly' ? priceMapYearly[plan] : priceMapMonthly[plan];

    setUser((prev) => {
      const newCredits = creditsMap[plan] || 25;
      const updatedUser: UserProfile = {
        ...prev,
        planTier: plan,
        subscriptionStatus: 'active',
        billingCycle,
        autoRenew: prev.autoRenew !== undefined ? prev.autoRenew : true,
        monthlyAiCredits: newCredits,
        aiCreditsUsed: 0, // Reset credits used on fresh subscription or plan upgrade
        paymentMethod: paymentDetails || prev.paymentMethod || { cardLast4: '8888', cardBrand: 'Mastercard', expDate: '08/29' },
      };

      if (updatedUser.email) {
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: updatedUser.email,
            name: updatedUser.name,
            companyName: updatedUser.companyName,
            planTier: updatedUser.planTier,
            monthlyAiCredits: updatedUser.monthlyAiCredits,
            aiCreditsUsed: 0,
            autoRenew: updatedUser.autoRenew,
            billingCycle: updatedUser.billingCycle,
            subscriptionStatus: 'active',
          }),
        }).catch(() => {});
      }

      return updatedUser;
    });

    if (amount > 0) {
      const newSubInv: SubscriptionInvoice = {
        id: `sub_inv_${Date.now().toString().slice(-5)}`,
        amount,
        date: new Date().toISOString(),
        status: 'paid',
        planName: `${plan.toUpperCase()} Plan (${billingCycle})`,
      };
      setSubscriptionInvoices((prev) => [newSubInv, ...prev]);
    }

    setCheckoutModalPlan(null);
  };

  const hasEnoughCredits = (amount = 1): boolean => {
    if (user.planTier === 'agency') return true;
    const limit = user.monthlyAiCredits || (user.email ? 25 : 15);
    const used = user.aiCreditsUsed || 0;
    if (used + amount > limit) {
      setCheckoutModalPlan(user.planTier === 'free' ? 'pro' : 'agency');
      return false;
    }
    return true;
  };

  const consumeAiCredit = (amount = 1): boolean => {
    if (!hasEnoughCredits(amount)) return false;

    setUser((prev) => {
      const updatedUsed = (prev.aiCreditsUsed || 0) + amount;
      const updated = { ...prev, aiCreditsUsed: updatedUsed };
      if (updated.email) {
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: updated.email,
            planTier: updated.planTier,
            monthlyAiCredits: updated.monthlyAiCredits,
            aiCreditsUsed: updated.aiCreditsUsed,
          }),
        }).catch(() => {});
      }
      return updated;
    });

    return true;
  };

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [localSeoItems, setLocalSeoItems] = useState<LocalSeoItem[]>([]);

  const [latestWebsiteAudit, setLatestWebsiteAudit] = useState<WebsiteAuditResult | null>(null);
  const [latestMarketingPlan, setLatestMarketingPlan] = useState<MarketingPlannerOutput | null>(null);

  // Fetch PostgreSQL Live Data on Mount or User Change
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const queryEmail = user.email ? encodeURIComponent(user.email) : '';
        const res = await fetch(`/api/workspace/data${queryEmail ? `?email=${queryEmail}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (data.businessProfile) {
            setBusinessProfile((prev) => {
              const isApex = (n?: string) => !n || n === 'Apex Digital Solutions' || n === 'My Business Workspace';
              const resolvedName =
                (!isApex(user.companyName) ? user.companyName : null) ||
                (!isApex(data.businessProfile.name) ? data.businessProfile.name : null) ||
                (!isApex(prev.name) ? prev.name : null) ||
                (user.name ? `${user.name}'s Business` : 'My Business Workspace');

              const mergedConfig = data.businessProfile.logoConfig || prev.logoConfig;
              const mergedUrl = data.businessProfile.logoUrl || prev.logoUrl || '';

              return {
                ...prev,
                ...data.businessProfile,
                name: resolvedName,
                email: user.email || data.businessProfile.email || prev.email || '',
                logoUrl: mergedUrl,
                logoConfig: mergedConfig,
              };
            });
          }
          if (data.settings) {
            setSettings((prev) => ({
              ...prev,
              ...data.settings,
              providerKeys: {
                ...prev.providerKeys,
                ...(data.settings.providerKeys || {}),
              },
            }));
          }
          if (Array.isArray(data.customers)) setCustomers(data.customers);
          if (Array.isArray(data.projects)) setProjects(data.projects);
          if (Array.isArray(data.invoices)) setInvoices(data.invoices);
          const remoteCreatedCount = data.invoicesCreatedCount || 0;
          setUser((prev) => {
            const maxCreated = Math.max(prev.invoicesCreatedCount || 0, remoteCreatedCount, (data.invoices || []).length);
            return { ...prev, invoicesCreatedCount: maxCreated };
          });
          if (Array.isArray(data.proposals)) setProposals(data.proposals);
          if (Array.isArray(data.documents)) setDocuments(data.documents);
          if (Array.isArray(data.conversations)) {
            const normalizedConvs = data.conversations.map((c: any) => ({
              ...c,
              messages: Array.isArray(c.messages) ? c.messages : [],
            }));
            setConversations(normalizedConvs);
            if (normalizedConvs.length > 0) setActiveConversationId(normalizedConvs[0].id);
          }
          if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
        }
      } catch (err) {
        console.warn('Could not load remote DB workspace data:', err);
      }
    };
    fetchWorkspaceData();
  }, [user.email]);

  const logActivity = (type: string, title: string, description?: string) => {
    const newLog: ActivityLogItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      description: description || '',
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    fetch(`/api/workspace/activity-logs?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, description, userEmail: user.email }),
    }).catch(() => {});
  };

  const updateBusinessProfile = (profile: Partial<BusinessProfile>) => {
    setBusinessProfile((prev) => {
      const updated = {
        ...prev,
        ...profile,
        email: profile.email || user.email || prev.email || '',
        logoConfig: profile.logoConfig !== undefined ? profile.logoConfig : prev.logoConfig,
        logoUrl: profile.logoUrl !== undefined ? profile.logoUrl : prev.logoUrl,
        updatedAt: new Date().toISOString(),
      };
      fetch(`/api/workspace/business-profile?email=${encodeURIComponent(user.email || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, userEmail: user.email }),
      }).catch(() => {});
      return updated;
    });
    logActivity('profile', 'Business Profile Updated', `Updated details for Workspace`);
  };

  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/workspace/settings?email=${encodeURIComponent(user.email || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSettings, userEmail: user.email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, error: data.error || 'Failed to validate API key settings.' };
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error updating settings.' };
    }
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    fetch(`/api/workspace/customers?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCust, userEmail: user.email }),
    }).catch(() => {});
    logActivity('customer', `Customer Added: ${newCust.name}`, `Added customer record for ${newCust.company || newCust.name}`);
  };

  const updateCustomer = (id: string, updatedData: Partial<Customer>) => {
    setCustomers((prev) => {
      const list = prev.map((c) => (c.id === id ? { ...c, ...updatedData, updatedAt: new Date().toISOString() } : c));
      const target = list.find((c) => c.id === id);
      if (target) {
        fetch(`/api/workspace/customers?email=${encodeURIComponent(user.email || '')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, userEmail: user.email }),
        }).catch(() => {});
        logActivity('customer', `Client Updated: ${target.name}`, `Pipeline status: ${target.status}`);
      }
      return list;
    });
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    fetch(`/api/workspace/customers/${id}?email=${encodeURIComponent(user.email || '')}`, { method: 'DELETE' }).catch(() => {});
    logActivity('customer', 'Client Removed', `Deleted customer record (${id})`);
  };

  const addProject = (projData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj: Project = {
      ...projData,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    fetch(`/api/workspace/projects?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProj, userEmail: user.email }),
    }).catch(() => {});
    logActivity('project', `New Project: ${newProj.title}`, `Project assigned to ${newProj.customerName || 'Workspace'}`);
  };

  const updateProject = (id: string, projData: Partial<Project>) => {
    setProjects((prev) => {
      const list = prev.map((p) => (p.id === id ? { ...p, ...projData } : p));
      const target = list.find((p) => p.id === id);
      if (target) {
        fetch(`/api/workspace/projects?email=${encodeURIComponent(user.email || '')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, userEmail: user.email }),
        }).catch(() => {});
        logActivity('project', `Project Updated: ${target.title}`, `Status: ${target.status}`);
      }
      return list;
    });
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/workspace/projects/${id}?email=${encodeURIComponent(user.email || '')}`, { method: 'DELETE' }).catch(() => {});
    logActivity('project', 'Project Deleted', `Removed project record (${id})`);
  };

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: `note_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInv: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);

    const updatedCreatedCount = Math.max(user.invoicesCreatedCount || 0, invoices.length) + 1;
    setUser((prev) => ({ ...prev, invoicesCreatedCount: updatedCreatedCount }));

    fetch(`/api/workspace/invoices?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newInv, userEmail: user.email }),
    }).catch(() => {});
    logActivity('invoice', `Invoice Created: ${newInv.invoiceNumber}`, `Total: $${newInv.total} for ${newInv.customerName}`);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) => {
      const list = prev.map((inv) => (inv.id === id ? { ...inv, status } : inv));
      const target = list.find((i) => i.id === id);
      if (target) {
        fetch(`/api/workspace/invoices/${id}/status?email=${encodeURIComponent(user.email || '')}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, userEmail: user.email }),
        }).catch(() => {});
        logActivity('invoice', `Invoice Status: ${status.toUpperCase()}`, `Invoice ${target.invoiceNumber} marked as ${status}`);
      }
      return list;
    });
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/workspace/invoices/${id}?email=${encodeURIComponent(user.email || '')}`, { method: 'DELETE' }).catch(() => {});
    logActivity('invoice', 'Invoice Deleted', `Invoice (${id}) removed`);
  };

  const addProposal = (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    const newProp: Proposal = {
      ...proposalData,
      id: `prop_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [newProp, ...prev]);
    fetch(`/api/workspace/proposals?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProp, userEmail: user.email }),
    }).catch(() => {});
    logActivity('proposal', `AI Proposal Created: ${newProp.title}`, `For ${newProp.customerName}`);
  };

  const updateProposalStatus = (id: string, status: Proposal['status']) => {
    setProposals((prev) => {
      const list = prev.map((p) => (p.id === id ? { ...p, status } : p));
      const target = list.find((p) => p.id === id);
      if (target) {
        fetch(`/api/workspace/proposals/${id}/status?email=${encodeURIComponent(user.email || '')}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, userEmail: user.email }),
        }).catch(() => {});
        logActivity('proposal', `Proposal Status: ${status.toUpperCase()}`, `Proposal "${target.title}" updated to ${status}`);
      }
      return list;
    });
  };

  const deleteProposal = (id: string) => {
    setProposals((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/workspace/proposals/${id}?email=${encodeURIComponent(user.email || '')}`, { method: 'DELETE' }).catch(() => {});
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    fetch(`/api/workspace/documents?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newDoc, userEmail: user.email }),
    }).catch(() => {});
    logActivity('document', `Document Generated: ${newDoc.title}`, `Type: ${newDoc.type}`);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    fetch(`/api/workspace/documents/${id}?email=${encodeURIComponent(user.email || '')}`, { method: 'DELETE' }).catch(() => {});
  };

  const createConversation = (title?: string) => {
    const newId = `conv_${Date.now()}`;
    const newConv: AIConversation = {
      id: newId,
      title: title || 'New AI Business Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    logActivity('chat', `AI Session Started`, `Topic: ${newConv.title}`);

    fetch('/api/workspace/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: newConv, userEmail: user.email }),
    }).catch(() => {});

    return newId;
  };

  const addMessageToConversation = (
    conversationId: string,
    msgData: Omit<AIMessage, 'id' | 'timestamp'>
  ) => {
    const newMsg: AIMessage = {
      ...msgData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) => {
      let targetConv: AIConversation | null = null;
      const updatedList = prev.map((conv) => {
        if (conv.id === conversationId) {
          const currentMsgs = Array.isArray(conv.messages) ? conv.messages : [];
          const updatedMessages = [...currentMsgs, newMsg];
          const autoTitle =
            currentMsgs.length === 0 && msgData.sender === 'user'
              ? msgData.text.slice(0, 32) + (msgData.text.length > 32 ? '...' : '')
              : conv.title;
          targetConv = {
            ...conv,
            title: autoTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          };
          return targetConv;
        }
        return conv;
      });

      if (targetConv) {
        fetch('/api/workspace/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation: targetConv, userEmail: user.email }),
        }).catch(() => {});
      }

      return updatedList;
    });
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    fetch(`/api/workspace/conversations/${id}?email=${encodeURIComponent(user.email || '')}`, { method: 'DELETE' }).catch(() => {});
  };

  const addLocalSeoItem = (itemData: Omit<LocalSeoItem, 'id' | 'createdAt'>) => {
    const newItem: LocalSeoItem = {
      ...itemData,
      id: `lseo_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLocalSeoItems((prev) => [newItem, ...prev]);
  };

  const deleteLocalSeoItem = (id: string) => {
    setLocalSeoItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        login,
        logout,
        resetDemoCredits,
        subscribePlan,
        hasEnoughCredits,
        consumeAiCredit,
        authModalOpen,
        setAuthModalOpen,
        checkoutModalPlan,
        checkoutModalCycle,
        setCheckoutModalPlan,
        initiateStripeCheckout,
        pendingPlanAfterAuth,
        setPendingPlanAfterAuth,
        subscriptionInvoices,
        activityLogs,
        logActivity,
        businessProfile,
        updateBusinessProfile,
        settings,
        updateSettings,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        projects,
        addProject,
        updateProject,
        deleteProject,
        notes,
        addNote,
        deleteNote,
        invoices,
        addInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        proposals,
        addProposal,
        updateProposalStatus,
        deleteProposal,
        documents,
        addDocument,
        deleteDocument,
        conversations,
        activeConversationId,
        setActiveConversationId,
        createConversation,
        addMessageToConversation,
        deleteConversation,
        localSeoItems,
        addLocalSeoItem,
        deleteLocalSeoItem,
        latestWebsiteAudit,
        setLatestWebsiteAudit,
        latestMarketingPlan,
        setLatestMarketingPlan,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
