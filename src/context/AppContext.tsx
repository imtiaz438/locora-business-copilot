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
  WorkTask,
  WorkTemplate,
  ContentRecord,
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
  ClientBusiness,
  PriorityAction,
  FixItDraft,
  LocoraNotification,
  AIAction,
  BusinessTruth,
} from '../types';
import { getBusinessTruth, invalidateBusinessTruth } from '../services/businessTruthService';
import { INITIAL_BUSINESSES, INITIAL_PRIORITY_ACTIONS } from '../data/initialBusinesses';
import { isAppSubdomain } from '../utils/domain';
import { resolveRouteFromPath, resolvePathFromTab, PATH_TO_TAB, TAB_TO_PATH } from '../utils/routeUtils';
import { dashboardService } from '../services/dashboardService';
import type { NormalizedDashboardData } from '../types/production';

interface AppContextType {
  // Production Data Architecture
  productionDashboard: NormalizedDashboardData | null;
  refreshProductionDashboard: (businessId?: string) => Promise<NormalizedDashboardData | null>;
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
  fuelPackModalOpen: boolean;
  setFuelPackModalOpen: (open: boolean) => void;
  fuelPackReason?: string;
  setFuelPackReason: (reason?: string) => void;
  initiateStripeCheckout: (plan: UserPlan, billingCycle?: BillingCycle) => Promise<void>;
  pendingPlanAfterAuth: { plan: UserPlan; cycle: BillingCycle } | null;
  setPendingPlanAfterAuth: (value: { plan: UserPlan; cycle: BillingCycle } | null) => void;
  subscriptionInvoices: SubscriptionInvoice[];
  activityLogs: ActivityLogItem[];
  logActivity: (type: string, title: string, description?: string) => void;

  businessProfile: BusinessProfile;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<{ success: boolean; error?: string }>;
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
  workTasks: WorkTask[];
  addWorkTask: (task: Omit<WorkTask, 'id' | 'createdAt'>) => Promise<WorkTask>;
  updateWorkTask: (id: string, task: Partial<WorkTask>) => Promise<WorkTask>;
  deleteWorkTask: (id: string) => Promise<void>;
  workTemplates: WorkTemplate[];
  addWorkTemplate: (template: Omit<WorkTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkTemplate>;
  deleteWorkTemplate: (id: string) => Promise<void>;
  contentRecords: ContentRecord[];
  addContentRecord: (record: Omit<ContentRecord, 'id' | 'created_at' | 'updated_at'>) => Promise<ContentRecord>;
  updateContentRecord: (id: string, updates: Partial<ContentRecord>) => Promise<ContentRecord>;
  deleteContentRecord: (id: string) => Promise<void>;
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
  refreshWorkspaceData: () => Promise<void>;

  // AI Business Manager & Top Business Selector
  businesses: ClientBusiness[];
  activeBusinessId: string;
  activeBusiness: ClientBusiness;
  switchBusiness: (id: string) => void;
  updateActiveBusiness: (data: Partial<ClientBusiness>) => void;
  syncGoogleBusinessProfile: (data: Partial<ClientBusiness>) => void;
  isGbpSyncModalOpen: boolean;
  setIsGbpSyncModalOpen: (open: boolean) => void;
  addBusiness: (data: Partial<ClientBusiness>) => void;
  deleteBusiness: (businessId: string) => Promise<void>;
  addLocation: (businessId: string, location: { name: string; address: string; city?: string; state?: string; country?: string; zip?: string; phone?: string }) => void;
  priorityActions: PriorityAction[];
  setPriorityActions: React.Dispatch<React.SetStateAction<PriorityAction[]>>;
  fixItAction: (actionId: string, draftData?: Partial<FixItDraft>) => void;
  publishDraft: (actionId: string) => void;
  rightAiPanelOpen: boolean;
  setRightAiPanelOpen: (open: boolean) => void;
  toggleRightAiPanel: () => void;

  // SECTION 28 & 32 & 33 & 35 & 38 & 40 NEW OS CAPABILITIES
  notifications: LocoraNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<LocoraNotification, 'id' | 'createdAt'>) => void;
  aiActions: AIAction[];
  selectedAIActionForApproval: AIAction | null;
  setSelectedAIActionForApproval: (action: AIAction | null) => void;
  approveAndExecuteAIAction: (actionId: string) => Promise<void>;
  createAIAction: (action: Omit<AIAction, 'id' | 'createdAt'>) => void;
  agencyMode: boolean;
  setAgencyMode: (agency: boolean) => void;
  onboardingModalOpen: boolean;
  setOnboardingModalOpen: (open: boolean) => void;
  growthStoreModalOpen: boolean;
  setGrowthStoreModalOpen: (open: boolean) => void;

  // Canonical Business Truth Service
  businessTruth: BusinessTruth | null;
  isLoadingBusinessTruth: boolean;
  getBusinessTruth: (businessId: string, forceFresh?: boolean) => Promise<BusinessTruth | null>;
  refreshBusinessTruth: (businessId?: string) => Promise<BusinessTruth | null>;
}

const getInitialCachedProfile = (): BusinessProfile => {
  const base: BusinessProfile = {
    id: 'bp_workspace',
    name: 'My Business Workspace',
    tagline: 'Autonomous Growth & Local SEO Intelligence',
    industry: 'Professional Services',
    description: '',
    targetAudience: '',
    toneOfVoice: 'Authoritative, caring, and locally rooted',
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
    services: [],
    targetLocations: [],
    primaryCompetitors: [],
    currentOffers: [],
    businessGoals: [],
    googleBusiness: {
      connected: false,
      listingName: '',
      rating: 0,
      reviewCount: 0,
      unansweredReviews: 0,
      category: '',
    },
    brainReadinessScore: 0,
    lastBrainSyncAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      const cachedLogo = localStorage.getItem('locora_business_profile_logo') || localStorage.getItem('locora_site_logo');
      const cachedConfigStr = localStorage.getItem('locora_site_logo_config');
      const cachedConfig = cachedConfigStr ? JSON.parse(cachedConfigStr) : undefined;
      if (cachedLogo) {
        base.logoUrl = cachedLogo;
      }
      if (cachedConfig) {
        base.logoConfig = cachedConfig;
      }
    } catch {}
  }
  return base;
};

const getInitialCachedSettings = (): AppSettings => {
  const base: AppSettings = {
    activeProvider: 'groq',
    activeModelVersion: 'llama-3.3-70b-versatile',
    providerModels: {
      groq: 'llama-3.3-70b-versatile',
      claude: 'claude-3-7-sonnet-20250219',
    },
    providerKeys: {
      groq: '',
      claude: '',
    },
    theme: 'light',
    autoSave: true,
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    userKeyStatus: {},
  };
  if (typeof window !== 'undefined') {
    try {
      const cachedLogo = localStorage.getItem('locora_site_logo') || localStorage.getItem('locora_business_profile_logo');
      const cachedConfigStr = localStorage.getItem('locora_site_logo_config');
      const cachedConfig = cachedConfigStr ? JSON.parse(cachedConfigStr) : undefined;
      if (cachedLogo) {
        base.siteLogoUrl = cachedLogo;
      }
      if (cachedConfig) {
        base.siteLogoConfig = cachedConfig;
      }
    } catch {}
  }
  return base;
};

const DEFAULT_PROFILE = getInitialCachedProfile();
const DEFAULT_SETTINGS = getInitialCachedSettings();

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

// Production Mode: Empty / Setup initial notifications only
const DEFAULT_NOTIFICATIONS: LocoraNotification[] = [
  {
    id: 'notif_welcome',
    type: 'action_needed',
    title: 'Workspace Initialized',
    message: 'Connect your Google Business Profile and run a technical website crawl to begin tracking live metrics.',
    evidence: 'Onboarding step pending',
    actionLabel: 'Connect Listing',
    actionTargetTab: 'reputation',
    isRead: false,
    createdAt: 'Just now',
  },
];

const DEFAULT_AI_ACTIONS: AIAction[] = [];

export const UNCONFIGURED_BUSINESS: ClientBusiness = {
  id: 'workspace_pending',
  name: 'No business yet',
  category: '',
  tagline: 'No business configured yet. Connect or register your business to begin.',
  locationName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  website: '',
  healthScore: 0,
  healthDelta: 0,
  highImpactCount: 0,
  opportunityCount: 0,
  healthyAreaCount: 0,
  isMainLocation: true,
  locations: [],
  services: [],
  competitors: [],
  googleRating: 0,
  reviewCount: 0,
  unansweredReviews: 0,
  gbpCompleteness: 0,
  gbpConnected: false,
  reviews: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const isApp = isAppSubdomain();
      const resolved = resolveRouteFromPath(window.location.pathname, isApp);
      // Clean up legacy URL in address bar if needed without page refresh
      if (!resolved.isCanonical && window.location.pathname !== resolved.canonicalPath) {
        window.history.replaceState({}, '', resolved.canonicalPath);
      }
      return resolved.targetTab;
    }
    return 'home';
  });

  const setActiveTab = useCallback((tab: string) => {
    let targetTab = tab;
    if (typeof window !== 'undefined') {
      const isAuth = user.isAuthenticated;

      if (isAuth && (tab === 'login' || tab === 'signup')) {
        targetTab = 'dashboard';
      }

      const newPath = resolvePathFromTab(targetTab, window.location.pathname);

      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    }
    setActiveTabState((prev) => (prev !== targetTab ? targetTab : prev));
  }, [user.isAuthenticated]);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [checkoutModalPlan, setCheckoutModalPlanState] = useState<UserPlan | null>(null);
  const [checkoutModalCycle, setCheckoutModalCycleState] = useState<BillingCycle>('monthly');
  const [fuelPackModalOpen, setFuelPackModalOpen] = useState<boolean>(false);
  const [fuelPackReason, setFuelPackReason] = useState<string | undefined>(undefined);
  const [pendingPlanAfterAuth, setPendingPlanAfterAuth] = useState<{ plan: UserPlan; cycle: BillingCycle } | null>(null);

  // Hydrate user session directly from database/API on load and sync global branding
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Immediately fetch public branding to guarantee uploaded logo is shown everywhere
    fetch('/api/public/branding')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.siteLogoUrl) {
            try {
              localStorage.setItem('locora_site_logo', data.siteLogoUrl);
            } catch {}
            setSettings((prev) => ({
              ...prev,
              siteLogoUrl: data.siteLogoUrl,
              siteLogoConfig: data.siteLogoConfig || prev.siteLogoConfig,
            }));
            setBusinessProfile((prev) => ({
              ...prev,
              logoUrl: prev.logoUrl || data.siteLogoUrl,
              logoConfig: prev.logoConfig || data.siteLogoConfig,
            }));
          }
          if (data.siteLogoConfig) {
            try {
              localStorage.setItem('locora_site_logo_config', JSON.stringify(data.siteLogoConfig));
            } catch {}
          }
        }
      })
      .catch(() => {});

    // Active session & database businesses hydration
    const storedAuthEmail = typeof window !== 'undefined' ? localStorage.getItem('locora_auth_email') : null;
    const authHeaders: Record<string, string> = {};
    if (storedAuthEmail) {
      authHeaders['x-user-email'] = storedAuthEmail;
    }
    const authMeUrl = storedAuthEmail ? `/api/auth/me?email=${encodeURIComponent(storedAuthEmail)}` : '/api/auth/me';

    fetch(authMeUrl, { credentials: 'include', headers: authHeaders })
      .then((res) => {
        if (!res.ok) throw new Error('No active session');
        return res.json();
      })
      .then((data) => {
        if (data && data.user && data.user.email) {
          const normalizedEmailToFetch = data.user.email.toLowerCase().trim();
          if (typeof window !== 'undefined') {
            localStorage.setItem('locora_auth_email', normalizedEmailToFetch);
            sessionStorage.setItem('locora_active_session', 'true');
            sessionStorage.setItem('locora_last_active', String(Date.now()));
          }
          const isSuperAdminEmail = normalizedEmailToFetch === 'imtiazbaloch3322@gmail.com' || normalizedEmailToFetch === 'support@locoraai.com';
          setUser({
            ...data.user,
            role: isSuperAdminEmail ? 'admin' : (data.user.role || 'customer'),
            planTier: isSuperAdminEmail ? 'agency' : (data.user.planTier || 'free'),
            monthlyAiCredits: isSuperAdminEmail ? 9999 : (data.user.monthlyAiCredits || 250),
            isAuthenticated: true,
          });

          // Pure Database-Driven Hydration: Query PostgreSQL via production businesses API
          return fetch(`/api/production/businesses?email=${encodeURIComponent(normalizedEmailToFetch)}`, {
            credentials: 'include',
            headers: { 'x-user-email': normalizedEmailToFetch },
          });
        }
        return null;
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setBusinesses((prev) => {
            const mapped: ClientBusiness[] = list.map((b: any) => {
              const existing = prev.find((p) => p.id === b.id);
              return {
                id: b.id,
                name: b.name || '',
                category: b.category || b.industry || 'Local Services',
                tagline: b.tagline || existing?.tagline || '',
                locationName: 'Primary Location',
                address: b.address || existing?.address || '',
                city: b.city || existing?.city || '',
                state: b.state || existing?.state || '',
                country: b.country || existing?.country || 'United States',
                zip: b.zip || existing?.zip || '',
                phone: b.phone || existing?.phone || '',
                website: b.website || existing?.website || '',
                email: b.email || existing?.email || '',
                description: b.description || existing?.description || '',
                healthScore: typeof b.healthScore === 'number' && b.healthScore > 0 ? b.healthScore : (existing?.healthScore || 0),
                healthDelta: 0,
                highImpactCount: 0,
                opportunityCount: 0,
                healthyAreaCount: 0,
                isMainLocation: true,
                locations: existing?.locations || [],
                services: Array.isArray(b.services) ? b.services : (existing?.services || []),
                competitors: existing?.competitors || [],
                googleRating: existing?.googleRating || 0,
                reviewCount: existing?.reviewCount || 0,
                unansweredReviews: 0,
                gbpCompleteness: b.gbpConnected ? 100 : (existing?.gbpCompleteness || 0),
                gbpConnected: b.gbpConnected || existing?.gbpConnected || false,
                reviews: existing?.reviews || [],
              };
            });

            if (typeof window !== 'undefined') {
              localStorage.setItem('locora_onboarding_completed', 'true');
              localStorage.removeItem('locora_pending_public_audit');
            }

            // Sync business profile state
            if (mapped.length > 0) {
              setBusinessProfile((prev) => ({
                ...prev,
                id: `bp_${mapped[0].id}`,
                name: mapped[0].name || prev.name,
                category: mapped[0].category || prev.category,
                phone: mapped[0].phone || prev.phone,
                website: mapped[0].website || prev.website,
                address: mapped[0].address || prev.address,
                city: mapped[0].city || prev.city,
                state: mapped[0].state || prev.state,
                country: mapped[0].country || prev.country,
                zip: mapped[0].zip || prev.zip,
                tagline: mapped[0].tagline || prev.tagline,
                gbpConnected: mapped[0].gbpConnected,
              }));
            }

            return mapped;
          });

          setActiveBusinessId((currentId) => {
            const hasCurrent = list.some((b: any) => b.id === currentId);
            if (hasCurrent && currentId && currentId !== 'workspace_pending') {
              return currentId;
            }
            const fallbackId = list[0].id;
            if (typeof window !== 'undefined') {
              localStorage.setItem('locora_active_business_id', fallbackId);
            }
            return fallbackId;
          });
        }
      })
      .catch((err) => {
        console.warn('[AppContext] Session / businesses hydration:', err);
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
    const creditsMap: Record<UserPlan, number> = { free: isDemo ? 15 : 25, pro: 250, agency: 9999, elite: 9999 };
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('locora_auth_email', userEmail);
    }

    // Hydrate existing user business records or initialize clean workspace if brand new
    if (!isDemo) {
      const alreadyCompletedOnboarding =
        typeof window !== 'undefined' &&
        (localStorage.getItem('locora_onboarding_completed') === 'true' ||
          localStorage.getItem('locora_onboarding_done') === 'true');

      // Hydrate user's authentic businesses from PostgreSQL database
      fetch(`/api/production/businesses?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include',
        headers: { 'x-user-email': userEmail },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((list) => {
          if (Array.isArray(list) && list.length > 0) {
            // User already has permanent businesses in database!
            const mapped: ClientBusiness[] = list.map((b: any) => ({
              id: b.id,
              name: b.name || '',
              category: b.category || b.industry || 'Local Services',
              tagline: b.tagline || b.description || '',
              locationName: 'Primary Location',
              address: b.address || '',
              city: b.city || '',
              state: b.state || '',
              country: b.country || 'United States',
              zip: b.zip || '',
              phone: b.phone || '',
              website: b.website || '',
              email: b.email || userEmail,
              description: b.description || '',
              healthScore: typeof b.healthScore === 'number' && b.healthScore > 0 ? b.healthScore : 0,
              healthDelta: 0,
              highImpactCount: 0,
              opportunityCount: 0,
              healthyAreaCount: 0,
              isMainLocation: true,
              locations: [],
              services: Array.isArray(b.services) ? b.services : [],
              competitors: [],
              googleRating: b.googleRating || 0,
              reviewCount: b.reviewCount || 0,
              unansweredReviews: 0,
              gbpCompleteness: b.gbpConnected ? 100 : 0,
              gbpConnected: !!b.gbpConnected,
              reviews: [],
            }));

            setBusinesses(mapped);
            const activeId = mapped[0].id;
            setActiveBusinessId(activeId);

            // Update business profile
            setBusinessProfile((prev) => ({
              ...prev,
              id: `bp_${activeId}`,
              name: mapped[0].name || prev.name,
              category: mapped[0].category || prev.category,
              industry: mapped[0].category || prev.industry,
              phone: mapped[0].phone || prev.phone,
              website: mapped[0].website || prev.website,
              address: mapped[0].address || prev.address,
              city: mapped[0].city || prev.city,
              state: mapped[0].state || prev.state,
              country: mapped[0].country || prev.country,
              zip: mapped[0].zip || prev.zip,
              email: userEmail,
              tagline: mapped[0].tagline || prev.tagline,
              updatedAt: new Date().toISOString(),
            }));

            if (typeof window !== 'undefined') {
              localStorage.setItem('locora_active_business_id', activeId);
              localStorage.setItem('locora_onboarding_completed', 'true');
              localStorage.removeItem('locora_pending_public_audit');
            }
          } else {
            // First-time user with no business in DB yet
            let pendingAuditData: any = null;
            let pendingDirectoryClaimData: any = null;
            if (typeof window !== 'undefined') {
              try {
                const raw = localStorage.getItem('locora_pending_public_audit');
                if (raw) pendingAuditData = JSON.parse(raw);
              } catch {}
              try {
                const rawClaim = localStorage.getItem('locora_pending_directory_claim');
                if (rawClaim) pendingDirectoryClaimData = JSON.parse(rawClaim);
              } catch {}
            }

            // If user came via Directory Claim flow, finalize claim on server
            if (pendingDirectoryClaimData?.businessId) {
              fetch('/api/directory/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  businessId: pendingDirectoryClaimData.businessId,
                  userEmail,
                  fullName: newUser.name,
                }),
              }).catch(() => {});
            }

            setBusinessProfile((prev) => ({
              ...prev,
              id: pendingDirectoryClaimData?.businessId ? `bp_${pendingDirectoryClaimData.businessId}` : `bp_${newUser.id}`,
              name: pendingDirectoryClaimData?.businessName || pendingAuditData?.businessName || companyName || prev.name,
              email: userEmail,
              website: pendingDirectoryClaimData?.websiteUrl || pendingAuditData?.domain || pendingAuditData?.url || prev.website,
              phone: pendingDirectoryClaimData?.phone || pendingAuditData?.detectedBusinessData?.phone || prev.phone,
              address: pendingDirectoryClaimData?.address || pendingAuditData?.detectedBusinessData?.address || prev.address,
              tagline: pendingDirectoryClaimData?.tagline || pendingAuditData?.detectedBusinessData?.metaDescription || prev.tagline,
              updatedAt: new Date().toISOString(),
            }));

            if (pendingAuditData?.auditId) {
              fetch('/api/public/claim-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  auditId: pendingAuditData.auditId,
                  userEmail,
                  businessId: pendingDirectoryClaimData?.businessId || pendingAuditData.businessId,
                }),
              }).catch(() => {});
            }

            const hasInitialBusiness = !!(
              pendingDirectoryClaimData?.businessName ||
              pendingAuditData?.businessName ||
              (companyName && companyName.trim() && companyName.toLowerCase() !== 'my business' && companyName.toLowerCase() !== 'no business yet')
            );

            if (hasInitialBusiness) {
              const newBizId = pendingDirectoryClaimData?.businessId || `biz_${newUser.id}`;
              const newBizName = pendingDirectoryClaimData?.businessName || pendingAuditData?.businessName || companyName || '';
              const newBizCategory = pendingDirectoryClaimData?.categoryName || pendingAuditData?.detectedBusinessData?.schemaTypes?.[0] || 'Local Services';
              const newBiz: ClientBusiness = {
                id: newBizId,
                name: newBizName,
                category: newBizCategory,
                tagline: pendingDirectoryClaimData?.tagline || pendingAuditData?.detectedBusinessData?.metaDescription || '',
                locationName: 'Main Location',
                address: pendingDirectoryClaimData?.address || pendingAuditData?.detectedBusinessData?.address || '',
                city: pendingDirectoryClaimData?.cityName || '',
                state: pendingDirectoryClaimData?.stateCode || '',
                country: 'United States',
                zip: '',
                phone: pendingDirectoryClaimData?.phone || pendingAuditData?.detectedBusinessData?.phone || '',
                website: pendingDirectoryClaimData?.websiteUrl || pendingAuditData?.domain || pendingAuditData?.url || '',
                healthScore: pendingAuditData?.overallScore || 0,
                healthDelta: 0,
                highImpactCount: 0,
                opportunityCount: 0,
                healthyAreaCount: 0,
                isMainLocation: true,
                services: [],
                competitors: [],
                googleRating: pendingDirectoryClaimData?.averageRating || 0,
                reviewCount: pendingDirectoryClaimData?.reviewCount || 0,
                unansweredReviews: 0,
                gbpCompleteness: 0,
              };

              setBusinesses([newBiz]);
              setActiveBusinessId(newBizId);

              // Persist this initial business permanently into PostgreSQL database
              fetch('/api/production/businesses', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-email': userEmail,
                },
                body: JSON.stringify({
                  id: newBizId,
                  name: newBizName,
                  category: newBizCategory,
                  address: newBiz.address,
                  city: newBiz.city,
                  state: newBiz.state,
                  phone: newBiz.phone,
                  website: newBiz.website,
                  email: userEmail,
                }),
              }).catch((err) => console.warn('Could not persist initial business to DB:', err));

              if (typeof window !== 'undefined') {
                localStorage.setItem('locora_active_business_id', newBizId);
                localStorage.removeItem('locora_pending_directory_claim');
              }
            } else {
              setBusinesses([]);
              setActiveBusinessId('');
              if (typeof window !== 'undefined') {
                localStorage.removeItem('locora_active_business_id');
                localStorage.removeItem('locora_pending_directory_claim');
              }
            }

            if (!alreadyCompletedOnboarding) {
              setTimeout(() => {
                setOnboardingModalOpen(true);
              }, 400);
            }
          }
        })
        .catch((err) => {
          console.warn('[AppContext] Error fetching businesses during login:', err);
        });
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
      localStorage.removeItem('locora_auth_email');
      localStorage.removeItem('locora_active_business_id');
    }
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(DEFAULT_USER);
    setBusinesses([]);
    setActiveBusinessId('');
    setProductionDashboard(null);
    setBusinessTruth(null);
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
      elite: 9999,
    };
    const priceMapMonthly: Record<UserPlan, number> = { free: 0, pro: 19, agency: 49, elite: 99 };
    const priceMapYearly: Record<UserPlan, number> = { free: 0, pro: 15 * 12, agency: 39 * 12, elite: 79 * 12 };

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
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [workTemplates, setWorkTemplates] = useState<WorkTemplate[]>([]);
  const [contentRecords, setContentRecords] = useState<ContentRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_content_records');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [localSeoItems, setLocalSeoItems] = useState<LocalSeoItem[]>([]);

  const [latestWebsiteAudit, setLatestWebsiteAudit] = useState<WebsiteAuditResult | null>(null);
  const [latestMarketingPlan, setLatestMarketingPlan] = useState<MarketingPlannerOutput | null>(null);

  // Multi-Client & Business Selector State - Pure Database-Driven Single Source of Truth
  const [businesses, setBusinesses] = useState<ClientBusiness[]>([]);

  const [activeBusinessId, setActiveBusinessId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_active_business_id');
        if (cached && cached !== 'austin-dental' && cached !== 'smith-plumbing' && cached !== 'demo-growth-workspace') {
          return cached;
        }
        localStorage.removeItem('locora_active_business_id');
      } catch {}
    }
    return '';
  });

  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_priority_actions');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && !parsed.some((a: any) => String(a.title).toLowerCase().includes('dental') || String(a.id).includes('dental') || String(a.title).toLowerCase().includes('austin'))) {
            return parsed;
          }
          localStorage.removeItem('locora_priority_actions');
        }
      } catch {}
    }
    return INITIAL_PRIORITY_ACTIONS;
  });

  const [productionDashboard, setProductionDashboard] = useState<NormalizedDashboardData | null>(null);

  const refreshProductionDashboard = useCallback(async (businessId?: string) => {
    try {
      const data = await dashboardService.getDashboard(businessId, true);
      setProductionDashboard(data);
      return data;
    } catch (err) {
      console.warn('Could not refresh production dashboard:', err);
      return null;
    }
  }, []);

  // Canonical Business Truth State
  const [businessTruth, setBusinessTruth] = useState<BusinessTruth | null>(null);
  const [isLoadingBusinessTruth, setIsLoadingBusinessTruth] = useState<boolean>(false);

  const refreshBusinessTruth = useCallback(async (businessId?: string) => {
    const id = (businessId || activeBusinessId || '').trim();
    if (!id) {
      setBusinessTruth(null);
      return null;
    }
    setIsLoadingBusinessTruth(true);
    try {
      const truth = await getBusinessTruth(id, true);
      setBusinessTruth(truth);
      return truth;
    } catch (err) {
      console.error('[BusinessTruth] Error loading canonical business truth:', err);
      return null;
    } finally {
      setIsLoadingBusinessTruth(false);
    }
  }, [activeBusinessId]);

  const refreshBusinessCustomers = useCallback(async (bId: string) => {
    if (!bId) return;
    try {
      const res = await fetch(`/api/workspace/customers?businessId=${encodeURIComponent(bId)}&email=${encodeURIComponent(user.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      }
    } catch (err) {
      console.warn('Error fetching business customers:', err);
    }
  }, [user.email]);

  useEffect(() => {
    if (activeBusinessId) {
      refreshBusinessTruth(activeBusinessId);
      refreshBusinessCustomers(activeBusinessId);
      refreshProductionDashboard(activeBusinessId);
    } else {
      setBusinessTruth(null);
    }
  }, [activeBusinessId, refreshBusinessTruth, refreshBusinessCustomers, refreshProductionDashboard]);

  const [rightAiPanelOpen, setRightAiPanelOpen] = useState<boolean>(false);
  const toggleRightAiPanel = useCallback(() => setRightAiPanelOpen((prev) => !prev), []);

  const [isGbpSyncModalOpen, setIsGbpSyncModalOpen] = useState<boolean>(false);

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId) || businesses[0] || UNCONFIGURED_BUSINESS;

  const switchBusiness = useCallback((id: string) => {
    setActiveBusinessId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locora_active_business_id', id);
    }
    const target = businesses.find((b) => b.id === id);
    if (target) {
      setBusinessProfile((prev) => ({
        ...prev,
        id: `bp_${target.id}`,
        name: target.name,
        tagline: target.tagline,
        industry: target.category,
        address: target.address,
        city: target.city,
        state: target.state,
        country: target.country || prev.country || 'Australia',
        zip: target.zip,
        phone: target.phone,
        website: target.website,
        services: target.services,
        primaryCompetitors: target.competitors,
        googleBusiness: {
          ...prev.googleBusiness,
          connected: Boolean(target.gbpConnected),
          listingName: target.gbpConnected ? `${target.name} (Google Maps)` : '',
          rating: target.googleRating || 0,
          reviewCount: target.reviewCount || 0,
          unansweredReviews: target.unansweredReviews || 0,
          category: target.category,
        },
      }));
    }
    refreshBusinessTruth(id);
    refreshProductionDashboard(id);
  }, [businesses, refreshBusinessTruth, refreshProductionDashboard]);

  const syncGoogleBusinessProfile = useCallback((data: Partial<ClientBusiness>) => {
    setBusinesses((prev) => {
      const idx = prev.findIndex((b) => b.id === activeBusinessId);
      const target = idx >= 0 ? prev[idx] : activeBusiness;
      const updatedBusiness: ClientBusiness = {
        ...target,
        ...data,
        name: data.name || target.name,
        category: data.category || target.category,
        city: data.city !== undefined ? data.city : target.city,
        state: data.state !== undefined ? data.state : target.state,
        country: data.country !== undefined ? data.country : (target.country || 'United States'),
        address: data.address !== undefined ? data.address : target.address,
        zip: data.zip !== undefined ? data.zip : target.zip,
        phone: data.phone !== undefined ? data.phone : target.phone,
        website: data.website !== undefined ? data.website : target.website,
        googleRating: data.googleRating !== undefined ? data.googleRating : ((data as any).rating || target.googleRating),
        reviewCount: data.reviewCount !== undefined ? data.reviewCount : target.reviewCount,
        unansweredReviews: data.unansweredReviews !== undefined ? data.unansweredReviews : target.unansweredReviews,
        services: data.services && data.services.length > 0 ? data.services : target.services,
        gbpCompleteness: 98,
        gbpConnected: true,
        reviews: (data as any).reviews || target.reviews || [],
      };

      let nextList: ClientBusiness[];
      if (idx >= 0) {
        nextList = [...prev];
        nextList[idx] = updatedBusiness;
      } else {
        nextList = [updatedBusiness, ...prev];
      }
      return nextList;
    });

    if (activeBusinessId && user.email) {
      fetch(`/api/production/business/${encodeURIComponent(activeBusinessId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          phone: data.phone,
          website: data.website,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
        }),
      }).catch((err) => console.warn('Failed to sync GBP profile to backend:', err));
    }

    setBusinessProfile((prev) => ({
      ...prev,
      name: data.name || prev.name,
      city: data.city !== undefined ? data.city : prev.city,
      state: data.state !== undefined ? data.state : prev.state,
      country: data.country !== undefined ? data.country : prev.country,
      address: data.address !== undefined ? data.address : prev.address,
      zip: data.zip !== undefined ? data.zip : prev.zip,
      phone: data.phone !== undefined ? data.phone : prev.phone,
      website: data.website !== undefined ? data.website : prev.website,
      industry: data.category || prev.industry,
      services: data.services && data.services.length > 0 ? data.services : prev.services,
      googleBusiness: {
        connected: true,
        listingName: data.name || prev.name,
        rating: data.googleRating !== undefined ? data.googleRating : ((data as any).rating || 0),
        reviewCount: data.reviewCount || 0,
        unansweredReviews: data.unansweredReviews || 0,
        category: data.category || prev.industry,
      },
    }));
  }, [activeBusinessId, activeBusiness]);

  const addBusiness = useCallback((data: Partial<ClientBusiness>) => {
    const newId = data.id || `biz_${Date.now()}`;
    const newBiz: ClientBusiness = {
      id: newId,
      name: data.name || 'New Client Business',
      category: data.category || 'General Local Business',
      tagline: data.tagline || '',
      locationName: data.locationName || 'Main Location',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || 'United States',
      zip: data.zip || '',
      phone: data.phone || '',
      website: data.website || '',
      healthScore: data.healthScore || 0,
      healthDelta: 0,
      highImpactCount: 0,
      opportunityCount: 0,
      healthyAreaCount: 0,
      isMainLocation: true,
      locations: [
        {
          id: `loc_${Date.now()}`,
          name: data.locationName || 'Main Location',
          isMain: true,
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'United States',
          zip: data.zip || '',
          phone: data.phone || '',
        },
      ],
      services: data.services || [],
      competitors: data.competitors || [],
      googleRating: data.googleRating || 0,
      reviewCount: data.reviewCount || 0,
      unansweredReviews: 0,
      gbpCompleteness: data.gbpCompleteness || 0,
      gbpConnected: data.gbpConnected || false,
      reviews: data.reviews || [],
    };
    setBusinesses((prev) => {
      const filtered = prev.filter((b) => b.id !== newId);
      const next = [newBiz, ...filtered];
      return next;
    });

    if (user.email) {
      fetch('/api/production/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          id: newId,
          name: data.name || 'New Client Business',
          category: data.category || 'General Local Business',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
          country: data.country || 'United States',
          phone: data.phone || '',
          website: data.website || '',
          email: data.email || user.email,
        }),
      }).catch((err) => console.warn('Failed to save new business to DB:', err));
    }

    switchBusiness(newId);
  }, [switchBusiness, user.email]);

  const addLocation = useCallback((businessId: string, loc: { name: string; address: string; city?: string; state?: string; country?: string; zip?: string; phone?: string }) => {
    setBusinesses((prev) => {
      const next = prev.map((b) => {
        if (b.id !== businessId) return b;
        const newLoc = {
          id: `loc_${Date.now()}`,
          name: loc.name,
          address: loc.address,
          city: loc.city || b.city || '',
          state: loc.state || b.state || '',
          country: loc.country || b.country || 'United States',
          zip: loc.zip || b.zip || '',
          phone: loc.phone || b.phone || '',
          isMain: false,
        };
        return {
          ...b,
          locations: [...(b.locations || []), newLoc],
        };
      });
      return next;
    });

    if (businessId && user.email) {
      fetch(`/api/production/business/${encodeURIComponent(businessId)}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify({
          name: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          country: loc.country,
          zip: loc.zip,
          phone: loc.phone,
          isPrimary: false,
        }),
      }).catch((err) => console.warn('Failed to save location to DB:', err));
    }
  }, [user.email]);

  const deleteBusiness = useCallback(async (businessId: string) => {
    try {
      await fetch(`/api/workspace/businesses/${encodeURIComponent(businessId)}?email=${encodeURIComponent(user.email || '')}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email || '',
        },
      });
    } catch (err) {
      console.warn('Failed to delete business from server:', err);
    }
    setBusinesses((prev) => {
      const next = prev.filter((b) => b.id !== businessId);
      return next;
    });
    if (activeBusinessId === businessId) {
      const remaining = businesses.filter((b) => b.id !== businessId);
      const nextId = remaining[0]?.id || '';
      switchBusiness(nextId);
    }
  }, [user.email, activeBusinessId, businesses, switchBusiness]);

  const updateActiveBusiness = useCallback((data: Partial<ClientBusiness>) => {
    setBusinesses((prev) => {
      const next = prev.map((b) => {
        if (b.id !== activeBusinessId) return b;
        return {
          ...b,
          ...data,
          locationName: data.locationName !== undefined ? data.locationName : (data.name ? `${data.name} (Main)` : b.locationName),
          address: data.address !== undefined ? data.address : b.address,
          city: data.city !== undefined ? data.city : b.city,
          state: data.state !== undefined ? data.state : b.state,
          country: data.country !== undefined ? data.country : b.country,
          zip: data.zip !== undefined ? data.zip : b.zip,
          phone: data.phone !== undefined ? data.phone : b.phone,
          website: data.website !== undefined ? data.website : b.website,
        };
      });
      return next;
    });

    if (activeBusinessId && user.email) {
      fetch(`/api/production/business/${encodeURIComponent(activeBusinessId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email,
        },
        body: JSON.stringify(data),
      }).catch((err) => console.warn('Failed to patch business in DB:', err));
    }

    setBusinessProfile((prev) => {
      const updated = {
        ...prev,
        name: data.name || prev.name,
        industry: data.category || prev.industry,
        website: data.website || prev.website,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        city: data.city || prev.city,
        state: data.state || prev.state,
        country: data.country || prev.country,
        zip: data.zip !== undefined ? data.zip : prev.zip,
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('locora_business_profile', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    if (data.name) {
      setUser((prev) => ({
        ...prev,
        companyName: data.name || prev.companyName,
      }));
    }

    if (activeBusinessId) {
      fetch(`/api/production/business/${encodeURIComponent(activeBusinessId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
    }

    fetch(`/api/workspace/business-profile?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        userEmail: user.email,
        name: data.name,
        industry: data.category,
      }),
    }).catch(() => {});
  }, [activeBusinessId, user.email]);

  const fixItAction = useCallback((actionId: string) => {
    setPriorityActions((prev) => {
      const next = prev.map((act) => {
        if (act.id !== actionId) return act;
        return {
          ...act,
          isFixed: true,
          fixedAt: new Date().toISOString(),
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_priority_actions', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const updateActionDraft = useCallback((actionId: string, draftData?: any) => {
    setPriorityActions((prev) => {
      const next = prev.map((act) => {
        if (act.id !== actionId) return act;
        const existingDraft = act.draft || {
          id: `draft_${Date.now()}`,
          actionId,
          title: `${act.recommendationTitle} Draft`,
          slug: `/content/${actionId}`,
          seoTitle: `${act.recommendationTitle} | ${businessProfile.name}`,
          metaDescription: act.whyItMatters,
          schemaType: 'LocalBusiness',
          schemaJson: '{}',
          headings: act.itemsToCreate || [],
          bodyCopy: 'Draft generated by Locora AI Business Manager.',
          faqs: [],
          internalLinks: [],
          status: 'draft' as const,
          createdAt: new Date().toISOString(),
        };
        return {
          ...act,
          draft: {
            ...existingDraft,
            ...draftData,
            status: (draftData?.status || 'draft') as any,
          },
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_priority_actions', JSON.stringify(next));
      }
      return next;
    });
  }, [businessProfile.name]);

  const publishDraft = useCallback((actionId: string) => {
    setPriorityActions((prev) => {
      const next = prev.map((act) => {
        if (act.id !== actionId) return act;
        return {
          ...act,
          isFixed: true,
          fixedAt: new Date().toISOString(),
          draft: act.draft ? { ...act.draft, status: 'published' as const } : undefined,
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_priority_actions', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // SECTION 28: Notification System
  const [notifications, setNotifications] = useState<LocoraNotification[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_notifications');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_notifications', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_notifications', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const addNotification = useCallback((notification: Omit<LocoraNotification, 'id' | 'createdAt'>) => {
    const newNotif: LocoraNotification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: 'Just now',
    };
    setNotifications((prev) => {
      const next = [newNotif, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_notifications', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // SECTION 32 & 33: AI Action System
  const [aiActions, setAiActions] = useState<AIAction[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_ai_actions');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_AI_ACTIONS;
  });

  const [selectedAIActionForApproval, setSelectedAIActionForApproval] = useState<AIAction | null>(null);

  const createAIAction = useCallback((action: Omit<AIAction, 'id' | 'createdAt'>) => {
    const newAction: AIAction = {
      ...action,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAiActions((prev) => {
      const next = [newAction, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_ai_actions', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // SECTION 38: Top-Level Agency Mode Switch [ My Business ] [ Agency ]
  const [agencyMode, setAgencyMode] = useState<boolean>(false);

  // SECTION 35: Onboarding Wizard
  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(false);

  // SECTION 40: Growth Store
  const [growthStoreModalOpen, setGrowthStoreModalOpen] = useState<boolean>(false);

  // Fetch PostgreSQL Live Data on Mount, User Change, and Focus
  const fetchWorkspaceData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (user.email) params.append('email', user.email);
      if (activeBusinessId) params.append('businessId', activeBusinessId);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/workspace/data${queryString}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.businessProfile) {
          if (data.businessProfile.logoUrl) {
            try {
              localStorage.setItem('locora_business_profile_logo', data.businessProfile.logoUrl);
            } catch {}
          }
          if (data.businessProfile.logoConfig) {
            try {
              localStorage.setItem('locora_site_logo_config', JSON.stringify(data.businessProfile.logoConfig));
            } catch {}
          }
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
          if (data.settings.siteLogoUrl) {
            try {
              localStorage.setItem('locora_site_logo', data.settings.siteLogoUrl);
            } catch {}
          }
          if (data.settings.siteLogoConfig) {
            try {
              localStorage.setItem('locora_site_logo_config', JSON.stringify(data.settings.siteLogoConfig));
            } catch {}
          }
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
        if (Array.isArray(data.workTasks)) setWorkTasks(data.workTasks);
        if (Array.isArray(data.workTemplates)) setWorkTemplates(data.workTemplates);
        if (Array.isArray(data.contentRecords)) {
          setContentRecords(data.contentRecords);
          try {
            localStorage.setItem('locora_content_records', JSON.stringify(data.contentRecords));
          } catch {}
        }
        if (Array.isArray(data.conversations)) {
          const normalizedConvs = data.conversations.map((c: any) => ({
            ...c,
            messages: Array.isArray(c.messages) ? c.messages : [],
          }));
          setConversations(normalizedConvs);
          if (normalizedConvs.length > 0) setActiveConversationId((current) => current || normalizedConvs[0].id);
        }
        if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);
      }

      // Sync from Production Data Architecture Service Layer (SINGLE SOURCE OF TRUTH)
      try {
        const prodData = await dashboardService.getDashboard();
        if (prodData && prodData.business) {
          setProductionDashboard(prodData);

          const primaryLoc = prodData.primaryLocation || prodData.locations[0];
          const calculated = prodData.calculatedMetrics;

          const mappedBiz: ClientBusiness = {
            id: prodData.business.id,
            name: prodData.business.name,
            category: prodData.business.category || 'Local Services',
            tagline: prodData.business.tagline || '',
            locationName: primaryLoc?.name || 'Main Location',
            address: primaryLoc?.address || '',
            city: primaryLoc?.city || '',
            state: primaryLoc?.state || '',
            country: primaryLoc?.country || 'United States',
            zip: primaryLoc?.zip || '',
            phone: prodData.business.phone || primaryLoc?.phone || '',
            website: prodData.business.website || '',
            healthScore: calculated.healthScore,
            healthDelta: 0,
            highImpactCount: prodData.opportunities.filter((o) => o.urgency === 'high').length,
            opportunityCount: prodData.opportunities.filter((o) => o.urgency === 'opportunity').length,
            healthyAreaCount: prodData.opportunities.filter((o) => o.status === 'completed').length,
            isMainLocation: true,
            locations: prodData.locations.map((l) => ({
              id: l.id,
              name: l.name,
              isMain: l.isPrimary,
              address: l.address || '',
              city: l.city || '',
              state: l.state || '',
              zip: l.zip || '',
              phone: l.phone || '',
            })),
            services: [],
            competitors: prodData.collectedData.competitors.map((c) => c.name),
            googleRating: calculated.averageRating,
            reviewCount: calculated.reviewCount,
            unansweredReviews: calculated.unansweredReviewsCount,
            gbpCompleteness: prodData.collectedData.googleProfile?.completenessScore || (prodData.collectedData.googleProfile ? 90 : 0),
            rankingAvg: calculated.averageMapRank,
          };

          let allMappedBizs: ClientBusiness[] = [mappedBiz];
          try {
            const bizListRes = await fetch('/api/production/businesses', { credentials: 'include' });
            if (bizListRes.ok) {
              const bizListJson = await bizListRes.json();
              if (Array.isArray(bizListJson) && bizListJson.length > 0) {
                allMappedBizs = bizListJson.map((b: any) => ({
                  id: b.id,
                  name: b.name,
                  category: b.category || b.industry || 'Local Services',
                  tagline: b.tagline || '',
                  locationName: b.cityName ? `${b.cityName} Location` : 'Main Location',
                  address: b.address || '',
                  city: b.city || b.cityName || '',
                  state: b.state || b.stateCode || '',
                  country: b.country || 'United States',
                  zip: b.zip || '',
                  phone: b.phone || '',
                  website: b.website || '',
                  healthScore: typeof b.healthScore === 'number' ? b.healthScore : 0,
                  healthDelta: 0,
                  highImpactCount: 0,
                  opportunityCount: 0,
                  healthyAreaCount: 0,
                  isMainLocation: true,
                  directorySlug: b.slug,
                  isPublishedInDirectory: b.isPublishedInDirectory ?? true,
                  services: b.services || [],
                  competitors: [],
                  googleRating: typeof b.googleRating === 'number' ? b.googleRating : 0,
                  reviewCount: typeof b.reviewCount === 'number' ? b.reviewCount : 0,
                  unansweredReviews: 0,
                  gbpCompleteness: b.gbpConnected ? 100 : 0,
                  rankingAvg: typeof b.rankingAvg === 'number' ? b.rankingAvg : 0,
                }));
              }
            }
          } catch (listErr) {
            console.warn('Could not load businesses list:', listErr);
          }

          setBusinesses(allMappedBizs);
          const cachedActiveId = typeof window !== 'undefined' ? localStorage.getItem('locora_active_business_id') : null;
          const chosenId = (cachedActiveId && allMappedBizs.some((b) => b.id === cachedActiveId))
            ? cachedActiveId
            : (allMappedBizs[0]?.id || mappedBiz.id);
          setActiveBusinessId(chosenId);

          setBusinessProfile((prev) => ({
            ...prev,
            name: prodData.business.name,
            website: prodData.business.website || prev.website,
            city: primaryLoc?.city || prev.city,
            phone: prodData.business.phone || prev.phone,
            address: primaryLoc?.address || prev.address,
          }));

          // Sync database opportunities directly into priorityActions
          if (Array.isArray(prodData.opportunities)) {
            const mappedActions: PriorityAction[] = prodData.opportunities.map((opp) => ({
              id: opp.id,
              urgency: opp.urgency,
              urgencyLabel: opp.urgency === 'high' ? 'HIGH IMPACT' : opp.urgency === 'opportunity' ? 'OPPORTUNITY' : 'GOOD',
              title: opp.title,
              recommendationTitle: opp.title,
              actionLabel: opp.urgency === 'high' ? '[ Fix This ]' : '[ Take Action ]',
              category: (opp.metadata?.category as any) || 'local_seo',
              problem: opp.description,
              whyItMatters: opp.whyItMatters || 'Strengthens presence and engagement',
              evidence: opp.evidence || 'Identified by AI Business Brain synthesis',
              expectedImpact: opp.expectedImpact || 'Increase local rank & leads',
              actionType: (opp.actionType as any) || 'custom',
              isFixed: opp.status === 'completed',
              fixedAt: opp.metadata?.completedAt || undefined,
              source: opp.source,
              severity: opp.severity,
              confidence: opp.confidence,
              createdAt: opp.createdAt,
              businessId: opp.businessId,
            }));
            setPriorityActions(mappedActions);
          }
        }
      } catch (prodErr) {
        console.warn('Could not sync production dashboard data:', prodErr);
      }

      // Sync isolated business record from Locora Database (SINGLE SOURCE OF TRUTH)
      if (user.email) {
        try {
          const bizRes = await fetch(`/api/data-engine/businesses?email=${encodeURIComponent(user.email)}`);
          if (bizRes.ok) {
            const bizData = await bizRes.json();
            if (Array.isArray(bizData.businesses) && bizData.businesses.length > 0) {
              const mappedBusinesses: ClientBusiness[] = bizData.businesses.map((r: any) => ({
                id: r.id,
                name: r.identity?.name || 'My Local Business',
                category: r.identity?.category || 'Local Services',
                tagline: r.identity?.tagline || '',
                locationName: 'Main Location',
                address: r.identity?.address || '',
                city: r.identity?.city || '',
                state: r.identity?.state || '',
                country: r.identity?.country || 'United States',
                zip: r.identity?.zip || '',
                phone: r.identity?.phone || '',
                website: r.identity?.website || '',
                healthScore: r.businessBrain?.score || (r.gbpData?.connected ? 65 : 0),
                healthDelta: 0,
                highImpactCount: (r.businessBrain?.priorityActions || []).filter((a: any) => a.urgency === 'high').length,
                opportunityCount: (r.businessBrain?.priorityActions || []).filter((a: any) => a.urgency === 'opportunity').length,
                healthyAreaCount: (r.businessBrain?.priorityActions || []).filter((a: any) => a.isFixed).length,
                isMainLocation: true,
                locations: [
                  {
                    id: `loc_${r.id}`,
                    name: 'Main Location',
                    isMain: true,
                    address: r.identity?.address || '',
                    city: r.identity?.city || '',
                    state: r.identity?.state || '',
                    zip: r.identity?.zip || '',
                    phone: r.identity?.phone || '',
                  },
                ],
                services: r.identity?.services || [],
                competitors: (r.competitors || []).map((c: any) => c.name || c),
                googleRating: r.gbpData?.rating || 0,
                reviewCount: r.gbpData?.reviewCount || 0,
                unansweredReviews: r.gbpData?.unansweredReviews || 0,
                gbpCompleteness: r.gbpData?.connected ? (r.gbpData?.reviewCount > 0 ? 95 : 70) : 0,
                rankingAvg: r.localPack?.averageRank || 0,
                monthlySearches: r.traffic?.sessions || 0,
                opportunitiesCount: r.businessBrain?.swot?.opportunities?.length || 0,
                monthlyOrganicTraffic: r.traffic?.sessions || 0,
                aiReadinessScore: r.businessBrain?.readinessScore || 0,
              }));

              setBusinesses(mappedBusinesses);
              setActiveBusinessId((curr) => {
                if (mappedBusinesses.some((b) => b.id === curr)) return curr;
                return mappedBusinesses[0].id;
              });

              // Also sync businessProfile name and website
              const activeDbBiz = bizData.businesses[0];
              if (activeDbBiz?.identity) {
                setBusinessProfile((prev) => ({
                  ...prev,
                  name: activeDbBiz.identity.name || prev.name,
                  website: activeDbBiz.identity.website || prev.website,
                  city: activeDbBiz.identity.city || prev.city,
                  phone: activeDbBiz.identity.phone || prev.phone,
                  address: activeDbBiz.identity.address || prev.address,
                }));
              }
            }
          }
        } catch (bizErr) {
          console.warn('Could not sync Locora DB businesses:', bizErr);
        }
      }
    } catch (err) {
      console.warn('Could not load remote DB workspace data:', err);
    }
  }, [user.email, user.companyName, user.name]);

  useEffect(() => {
    fetchWorkspaceData();

    // Auto-refresh when user tabs back or switches back into view
    const handleFocus = () => {
      fetchWorkspaceData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchWorkspaceData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchWorkspaceData]);

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
    if (profile.logoUrl) {
      try {
        localStorage.setItem('locora_business_profile_logo', profile.logoUrl);
        localStorage.setItem('locora_site_logo', profile.logoUrl);
      } catch {}
    }
    if (profile.logoConfig) {
      try {
        localStorage.setItem('locora_site_logo_config', JSON.stringify(profile.logoConfig));
      } catch {}
    }
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
    if (newSettings.siteLogoUrl) {
      try {
        localStorage.setItem('locora_site_logo', newSettings.siteLogoUrl);
        localStorage.setItem('locora_business_profile_logo', newSettings.siteLogoUrl);
      } catch {}
    }
    if (newSettings.siteLogoConfig) {
      try {
        localStorage.setItem('locora_site_logo_config', JSON.stringify(newSettings.siteLogoConfig));
      } catch {}
    }
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
    const bizId = customerData.businessId || activeBusiness?.id || '';
    const source = customerData.source || customerData.leadSource || 'manual';
    const newCust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      businessId: bizId,
      source,
      leadSource: source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactAt: customerData.lastContactAt || new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    fetch(`/api/workspace/customers?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(bizId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCust, businessId: bizId, userEmail: user.email }),
    }).catch(() => {});
    logActivity('customer', `Customer Added: ${newCust.name}`, `Added customer record for ${newCust.company || newCust.name} [Source: ${source}]`);
  };

  const updateCustomer = (id: string, updatedData: Partial<Customer>) => {
    const bizId = updatedData.businessId || activeBusiness?.id || '';
    setCustomers((prev) => {
      const list = prev.map((c) => (c.id === id ? { ...c, ...updatedData, businessId: c.businessId || bizId, updatedAt: new Date().toISOString() } : c));
      const target = list.find((c) => c.id === id);
      if (target) {
        fetch(`/api/workspace/customers?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(bizId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, businessId: bizId, userEmail: user.email }),
        }).catch(() => {});
        logActivity('customer', `Client Updated: ${target.name}`, `Status: ${target.status}`);
      }
      return list;
    });
  };

  const deleteCustomer = (id: string) => {
    const bizId = activeBusiness?.id || '';
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    fetch(`/api/workspace/customers/${id}?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(bizId)}`, { method: 'DELETE' }).catch(() => {});
    logActivity('customer', 'Client Removed', `Deleted customer record (${id})`);
  };

  const addProject = (projData: Omit<Project, 'id' | 'createdAt'>) => {
    const currentBizId = projData.businessId || activeBusinessId || activeBusiness?.id || 'biz_1';
    const calculatedProgress = projData.tasks && projData.tasks.length > 0
      ? Math.round((projData.tasks.filter((t) => t.completed).length / projData.tasks.length) * 100)
      : (projData.progress || 0);

    const newProj: Project = {
      ...projData,
      businessId: currentBizId,
      name: projData.name || projData.title || 'Untitled Project',
      title: projData.title || projData.name || 'Untitled Project',
      progress: calculatedProgress,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    fetch(`/api/workspace/projects?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProj, businessId: currentBizId, userEmail: user.email }),
    }).catch(() => {});
    logActivity('project', `New Project: ${newProj.title || newProj.name}`, `Assigned to ${newProj.customerName || 'Workspace'}`);
  };

  const updateProject = (id: string, projData: Partial<Project>) => {
    setProjects((prev) => {
      const list = prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...projData, updatedAt: new Date().toISOString() };
          if (merged.tasks && merged.tasks.length > 0) {
            merged.progress = Math.round((merged.tasks.filter((t) => t.completed).length / merged.tasks.length) * 100);
          }
          return merged;
        }
        return p;
      });
      const target = list.find((p) => p.id === id);
      if (target) {
        const currentBizId = target.businessId || activeBusinessId || activeBusiness?.id || 'biz_1';
        fetch(`/api/workspace/projects/${id}?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...target, businessId: currentBizId, userEmail: user.email }),
        }).catch(() => {});
        logActivity('project', `Project Updated: ${target.title || target.name}`, `Status: ${target.status}`);
      }
      return list;
    });
  };

  const deleteProject = (id: string) => {
    const currentBizId = activeBusinessId || activeBusiness?.id || 'biz_1';
    setProjects((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/workspace/projects/${id}?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, { method: 'DELETE' }).catch(() => {});
    logActivity('project', 'Project Deleted', `Removed project record (${id})`);
  };

  const addWorkTask = async (taskData: Omit<WorkTask, 'id' | 'createdAt'>): Promise<WorkTask> => {
    const currentBizId = taskData.businessId || activeBusinessId || activeBusiness?.id || 'biz_1';
    const newTask: WorkTask = {
      ...taskData,
      businessId: currentBizId,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWorkTasks((prev) => [newTask, ...prev]);
    try {
      const res = await fetch('/api/workspace/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.task) {
          setWorkTasks((prev) => prev.map((t) => (t.id === newTask.id ? data.task : t)));
          return data.task;
        }
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
    return newTask;
  };

  const updateWorkTask = async (id: string, taskData: Partial<WorkTask>): Promise<WorkTask> => {
    let updated: WorkTask | null = null;
    setWorkTasks((prev) => {
      return prev.map((t) => {
        if (t.id === id) {
          updated = { ...t, ...taskData };
          return updated;
        }
        return t;
      });
    });
    try {
      const res = await fetch(`/api/workspace/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.task) {
          setWorkTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
          return data.task;
        }
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
    return updated || ({ id, ...taskData } as any);
  };

  const deleteWorkTask = async (id: string): Promise<void> => {
    setWorkTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/workspace/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
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
    const currentBizId = invoiceData.businessId || activeBusinessId || activeBusiness?.id || 'biz_1';
    const newInv: Invoice = {
      ...invoiceData,
      businessId: currentBizId,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);

    const updatedCreatedCount = Math.max(user.invoicesCreatedCount || 0, invoices.length) + 1;
    setUser((prev) => ({ ...prev, invoicesCreatedCount: updatedCreatedCount }));

    fetch(`/api/workspace/invoices?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newInv, businessId: currentBizId, userEmail: user.email }),
    }).catch(() => {});
    logActivity('invoice', `Invoice Created: ${newInv.invoiceNumber}`, `Total: $${newInv.total} for ${newInv.customerName}`);
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const currentBizId = activeBusinessId || activeBusiness?.id || 'biz_1';
    setInvoices((prev) => {
      const list = prev.map((inv) => (inv.id === id ? { ...inv, status } : inv));
      const target = list.find((i) => i.id === id);
      if (target) {
        fetch(`/api/workspace/invoices/${id}/status?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, businessId: currentBizId, userEmail: user.email }),
        }).catch(() => {});
        logActivity('invoice', `Invoice Status: ${status.toUpperCase()}`, `Invoice ${target.invoiceNumber} marked as ${status}`);
      }
      return list;
    });
  };

  const deleteInvoice = (id: string) => {
    const currentBizId = activeBusinessId || activeBusiness?.id || 'biz_1';
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/workspace/invoices/${id}?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, { method: 'DELETE' }).catch(() => {});
    logActivity('invoice', 'Invoice Deleted', `Invoice (${id}) removed`);
  };

  const addProposal = (proposalData: Omit<Proposal, 'id' | 'createdAt'>) => {
    const currentBizId = proposalData.businessId || activeBusinessId || activeBusiness?.id || 'biz_1';
    const newProp: Proposal = {
      ...proposalData,
      businessId: currentBizId,
      id: `prop_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [newProp, ...prev]);
    fetch(`/api/workspace/proposals?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProp, businessId: currentBizId, userEmail: user.email }),
    }).catch(() => {});
    logActivity('proposal', `AI Proposal Created: ${newProp.title}`, `For ${newProp.customerName}`);
  };

  const updateProposalStatus = (id: string, status: Proposal['status']) => {
    const currentBizId = activeBusinessId || activeBusiness?.id || 'biz_1';
    setProposals((prev) => {
      const list = prev.map((p) => (p.id === id ? { ...p, status } : p));
      const target = list.find((p) => p.id === id);
      if (target) {
        fetch(`/api/workspace/proposals/${id}/status?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, businessId: currentBizId, userEmail: user.email }),
        }).catch(() => {});
        logActivity('proposal', `Proposal Status: ${status.toUpperCase()}`, `Proposal "${target.title}" updated to ${status}`);
      }
      return list;
    });
  };

  const deleteProposal = (id: string) => {
    const currentBizId = activeBusinessId || activeBusiness?.id || 'biz_1';
    setProposals((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/workspace/proposals/${id}?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, { method: 'DELETE' }).catch(() => {});
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt'>) => {
    const currentBizId = docData.businessId || activeBusinessId || activeBusiness?.id || 'biz_1';
    const newDoc: DocumentItem = {
      ...docData,
      businessId: currentBizId,
      id: `doc_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    fetch(`/api/workspace/documents?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newDoc, businessId: currentBizId, userEmail: user.email }),
    }).catch(() => {});
    logActivity('document', `Document Generated: ${newDoc.title}`, `Type: ${newDoc.type}`);
  };

  const deleteDocument = (id: string) => {
    const currentBizId = activeBusinessId || activeBusiness?.id || 'biz_1';
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    fetch(`/api/workspace/documents/${id}?email=${encodeURIComponent(user.email || '')}&businessId=${encodeURIComponent(currentBizId)}`, { method: 'DELETE' }).catch(() => {});
  };

  const addWorkTemplate = async (templateData: Omit<WorkTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkTemplate> => {
    const currentBizId = templateData.businessId || activeBusinessId || activeBusiness?.id || 'biz_1';
    const newTemplate: WorkTemplate = {
      ...templateData,
      businessId: currentBizId,
      id: `tmpl_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkTemplates((prev) => [newTemplate, ...prev]);
    try {
      const res = await fetch('/api/workspace/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.template) {
          setWorkTemplates((prev) => prev.map((t) => (t.id === newTemplate.id ? data.template : t)));
          return data.template;
        }
      }
    } catch (err) {
      console.error('Failed to create template:', err);
    }
    return newTemplate;
  };

  const deleteWorkTemplate = async (id: string): Promise<void> => {
    setWorkTemplates((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/workspace/templates/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const addContentRecord = async (recordData: Omit<ContentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ContentRecord> => {
    const newRecord: ContentRecord = {
      ...recordData,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setContentRecords((prev) => {
      const updated = [newRecord, ...prev];
      try { localStorage.setItem('locora_content_records', JSON.stringify(updated)); } catch {}
      return updated;
    });

    fetch(`/api/workspace/content?email=${encodeURIComponent(user.email || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRecord, userEmail: user.email }),
    }).catch(() => {});

    logActivity('content', `Content Created: ${newRecord.title}`, `Type: ${newRecord.content_type} • Status: ${newRecord.status}`);
    return newRecord;
  };

  const updateContentRecord = async (id: string, updates: Partial<ContentRecord>): Promise<ContentRecord> => {
    let updatedRecord: ContentRecord | null = null;
    setContentRecords((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          updatedRecord = { ...item, ...updates, updated_at: new Date().toISOString() };
          return updatedRecord;
        }
        return item;
      });
      try { localStorage.setItem('locora_content_records', JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (updatedRecord) {
      fetch(`/api/workspace/content?email=${encodeURIComponent(user.email || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedRecord, userEmail: user.email }),
      }).catch(() => {});
    }

    return updatedRecord || ({} as ContentRecord);
  };

  const deleteContentRecord = async (id: string) => {
    setContentRecords((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try { localStorage.setItem('locora_content_records', JSON.stringify(updated)); } catch {}
      return updated;
    });

    fetch(`/api/workspace/content/${id}?email=${encodeURIComponent(user.email || '')}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const approveAndExecuteAIAction = useCallback(async (actionId: string) => {
    let targetAct: AIAction | undefined;
    setAiActions((prev) => {
      const next = prev.map((act) => {
        if (act.id !== actionId) return act;
        targetAct = act;
        return {
          ...act,
          status: 'completed' as const,
          approvedAt: new Date().toISOString(),
          executedAt: new Date().toISOString(),
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_ai_actions', JSON.stringify(next));
      }
      return next;
    });

    if (targetAct) {
      const act = targetAct as AIAction;
      if (act.type === 'CREATE_TASK' || act.type === 'CREATE_DIRECTORY_TASK') {
        const tData = act.input?.taskData || {};
        await addWorkTask({
          businessId: act.business_id || 'biz_locora_canonical',
          title: tData.title || act.title,
          description: tData.description || act.explanation.previewSummary || act.explanation.diagnosis,
          priority: tData.priority || 'high',
          status: 'todo',
          dueDate: tData.dueDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        });
      } else if (act.type === 'CREATE_SERVICE_PAGE' || act.type === 'CREATE_DIRECTORY_CONTENT') {
        const cData = act.input?.contentData || {};
        await addContentRecord({
          business_id: act.business_id || 'biz_locora_canonical',
          title: cData.title || act.title,
          content_type: cData.contentType || 'landing_page',
          platform: cData.platform || 'website',
          status: 'draft',
          source: 'business_brain',
          created_by: 'AI Growth Manager',
          AI_generated: true,
          target_service: cData.targetService || 'Directory Service Offering',
          target_location: cData.targetLocation || 'Local Service Area',
          body: cData.body || act.explanation.previewSummary || 'Drafted content for directory optimization.',
        });
      } else if (act.type === 'UPDATE_DIRECTORY_PROFILE') {
        try {
          const updatePayload = act.input?.profileUpdates || {};
          await fetch('/api/directory/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: act.business_id,
              ...updatePayload,
            }),
          });
        } catch (e) {
          console.warn('Profile update call completed with local fallback', e);
        }
      }
    }

    logActivity('ai_action_executed', 'AI Action Executed', `Action ${actionId} approved and executed successfully`);
  }, [addWorkTask, addContentRecord, logActivity]);

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
        fuelPackModalOpen,
        setFuelPackModalOpen,
        fuelPackReason,
        setFuelPackReason,
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
        workTasks,
        addWorkTask,
        updateWorkTask,
        deleteWorkTask,
        workTemplates,
        addWorkTemplate,
        deleteWorkTemplate,
        contentRecords,
        addContentRecord,
        updateContentRecord,
        deleteContentRecord,
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
        refreshWorkspaceData: fetchWorkspaceData,

        // AI Business Manager & Business Selector
        businesses,
        activeBusinessId,
        activeBusiness,
        switchBusiness,
        updateActiveBusiness,
        syncGoogleBusinessProfile,
        isGbpSyncModalOpen,
        setIsGbpSyncModalOpen,
        addBusiness,
        deleteBusiness,
        addLocation,
        priorityActions,
        setPriorityActions,
        fixItAction,
        publishDraft,
        rightAiPanelOpen,
        setRightAiPanelOpen,
        toggleRightAiPanel,

        // Production Data Architecture
        productionDashboard,
        refreshProductionDashboard,

        // SECTION 28, 32, 33, 35, 38, 40 capabilities
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        aiActions,
        selectedAIActionForApproval,
        setSelectedAIActionForApproval,
        approveAndExecuteAIAction,
        createAIAction,
        agencyMode,
        setAgencyMode,
        onboardingModalOpen,
        setOnboardingModalOpen,
        growthStoreModalOpen,
        setGrowthStoreModalOpen,

        // Canonical Business Truth Service
        businessTruth,
        isLoadingBusinessTruth,
        getBusinessTruth,
        refreshBusinessTruth,
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
