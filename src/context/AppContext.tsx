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
  ClientBusiness,
  PriorityAction,
  FixItDraft,
  LocoraNotification,
  AIAction,
} from '../types';
import { INITIAL_BUSINESSES, INITIAL_PRIORITY_ACTIONS } from '../data/mockBusinesses';

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
  addBusiness: (data: Partial<ClientBusiness>) => void;
  addLocation: (businessId: string, location: { name: string; address: string; city?: string; state?: string; country?: string; zip?: string; phone?: string }) => void;
  priorityActions: PriorityAction[];
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
}

const getInitialCachedProfile = (): BusinessProfile => {
  const base: BusinessProfile = {
    id: 'bp_austin_dental',
    name: 'Austin Dental Care',
    tagline: 'Gentle, Modern Dental Care & 24/7 Emergency Relief',
    industry: 'Family & Emergency Dental',
    description: 'Providing gentle, high-quality family and emergency dental care in downtown Austin with state-of-the-art technology and same-day pain relief.',
    targetAudience: 'Austin residents, downtown professionals, and families seeking reliable, gentle dental care.',
    toneOfVoice: 'Warm, empathetic, authoritative and reassuring',
    website: 'austindentalcare.com',
    phone: '(512) 555-0199',
    email: 'info@austindentalcare.com',
    address: '100 Congress Ave, Suite 400',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    country: 'United States',
    currency: 'USD',
    taxRate: 0,
    taxId: '',
    services: [
      'Emergency Dental Care',
      'Preventative Cleanings',
      'Same-Day Crowns',
      'Invisalign Orthodontics',
      'Dental Implants',
      'Teeth Whitening',
    ],
    targetLocations: ['Austin, TX', 'Round Rock, TX', 'Westlake Hills, TX', 'South Austin, TX'],
    primaryCompetitors: ['Apex Dental Specialists', 'Austin Emergency Smiles', 'Capital City Dental Studio'],
    currentOffers: ['$99 New Patient Diagnostic Exam & X-Rays', 'Same-Day Emergency Relief Priority Booking'],
    businessGoals: [
      'Capture Top 3 Local Google Maps Pack for Emergency Dentist',
      'Publish Dedicated Same-Day Crown Landing Page',
      'Respond to 100% of Patient Google Reviews',
    ],
    googleBusiness: {
      connected: true,
      listingName: 'Austin Dental Care (Google Maps)',
      rating: 4.8,
      reviewCount: 142,
      unansweredReviews: 17,
      category: 'Dentist & Emergency Dental Clinic',
    },
    brainReadinessScore: 94,
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

const DEFAULT_NOTIFICATIONS: LocoraNotification[] = [
  {
    id: 'notif_1',
    type: 'action_needed',
    title: 'Your rating dropped from 4.9 → 4.7',
    message: '2 recent negative reviews on Google Maps regarding wait times require response.',
    evidence: 'Unanswered reviews by Marcus T. and Elena R. on Google Maps',
    actionLabel: '[ Investigate ]',
    actionTargetTab: 'reputation',
    isRead: false,
    createdAt: '10m ago',
  },
  {
    id: 'notif_2',
    type: 'opportunity',
    title: 'You could target 4 new local searches.',
    message: 'New high-intent keyword gaps identified: Emergency dentist Austin, Same day crowns Austin.',
    evidence: '420 monthly local searches with low competitor density',
    actionLabel: '[ View ]',
    actionTargetTab: 'visibility',
    isRead: false,
    createdAt: '2h ago',
  },
  {
    id: 'notif_3',
    type: 'completed',
    title: 'Weekly growth analysis is ready.',
    message: 'Locora evaluated your digital presence and identified your highest-leverage growth actions.',
    evidence: 'Locora Growth Health calculated at 78/100 across 6 components',
    actionLabel: '[ View Report ]',
    actionTargetTab: 'reports',
    isRead: false,
    createdAt: '1d ago',
  },
];

const DEFAULT_AI_ACTIONS: AIAction[] = [
  {
    id: 'action_1',
    type: 'CREATE_REVIEW_REPLY',
    title: 'Reply to Google Review: Patient wait time concern',
    business_id: 'austin-dental',
    input: { reviewId: 'rev_101', rating: 1, author: 'Marcus T.' },
    output: 'Thank you for visiting Austin Dental Care. We sincerely apologize for the unexpected 35-minute delay during our peak morning emergency triage. Our clinical director Dr. Davis has revised our morning scheduling protocols to ensure patient promptness. Please contact us directly so we may care for your next visit.',
    status: 'draft',
    created_by: 'ai',
    isSafeInternal: false,
    explanation: {
      diagnosis: 'Marcus T. posted a 1-star review mentioning a 35-minute wait time with zero owner response.',
      whyItMatters: 'Reviews with attentive owner replies convert 38% higher on Google Local 3-Pack rankings.',
      previewSummary: 'Drafted empathetic owner response addressing the wait time and emphasizing scheduling improvements.',
      expectedImpact: 'Restores 100% reply rate and improves Google Maps sentiment rating.',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'action_2',
    type: 'CREATE_GBP_POST',
    title: 'Publish Google Post: Same-Day Emergency Dental Relief',
    business_id: 'austin-dental',
    input: { offer: 'Emergency Triage & Pain Relief', targetLocation: 'Austin, TX' },
    output: 'Experiencing sudden tooth pain in Austin? Austin Dental Care offers same-day emergency triage and gentle pain relief with immediate appointment availability. Call (512) 555-0199 or walk in today!',
    status: 'draft',
    created_by: 'ai',
    isSafeInternal: false,
    explanation: {
      diagnosis: 'No Google Business Profile update published in the last 14 days.',
      whyItMatters: 'Weekly GBP posts signal active business status to Google local ranking algorithms.',
      previewSummary: 'Created a Google Business post promoting emergency availability with direct call CTA.',
      expectedImpact: '+14% local search impressions and elevated Google Maps ranking.',
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'action_3',
    type: 'CREATE_SERVICE_PAGE',
    title: 'Generate Dedicated Emergency Dentist Service Page',
    business_id: 'austin-dental',
    input: { service: 'Emergency Dentist', targetKeyword: 'emergency dentist austin' },
    output: 'Drafted /services/emergency-dentist-austin with localized H1, urgent care checklist, FAQ schema, and 1-click booking CTA.',
    status: 'draft',
    created_by: 'ai',
    isSafeInternal: false,
    explanation: {
      diagnosis: 'Austin Dental Care is #8 for "emergency dentist austin" because competitors A & B have dedicated service URLs.',
      whyItMatters: 'A dedicated URL with LocalBusiness schema and targeted copy allows ranking #1–#3.',
      previewSummary: 'Drafted high-converting emergency dental landing page targeting 850 monthly local searches.',
      expectedImpact: 'Projected rank jump from #8 → #3, generating ~18 additional patient calls monthly.',
    },
    createdAt: new Date().toISOString(),
  },
];

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
  ai_manager: '/ai-manager',
  chat: '/ai-manager',
  growth: '/growth',
  visibility: '/visibility',
  reputation: '/reputation',
  competitors: '/competitors',
  content: '/content',
  customers: '/customers',
  work: '/work',
  reports: '/reports',
  clients: '/clients',
  crm: '/customers',
  projects: '/projects',
  lead_prospector: '/lead-prospector',
  invoices: '/work',
  proposals: '/work',
  documents: '/content',
  website_review: '/reports',
  local_seo: '/visibility',
  marketing: '/growth',
  marketing_planner: '/growth',
  masterclass_kit: '/agency-vault',
  pricing: '/pricing-plans',
  subscription: '/subscription',
  settings: '/settings',
  admin: '/admin',
};

const PATH_TO_TAB: Record<string, string> = {
  '': 'home',
  'home': 'home',
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
  'home-dashboard': 'dashboard',
  'ai-manager': 'ai_manager',
  'ai_manager': 'ai_manager',
  'chat': 'ai_manager',
  'growth': 'growth',
  'visibility': 'visibility',
  'reputation': 'reputation',
  'competitors': 'competitors',
  'content': 'content',
  'customers': 'customers',
  'work': 'work',
  'reports': 'reports',
  'clients': 'clients',
  'crm': 'customers',
  'projects': 'projects',
  'lead-prospector': 'lead_prospector',
  'lead_prospector': 'lead_prospector',
  'lead-vault': 'lead_prospector',
  'lead_vault': 'lead_prospector',
  'b2b-vault': 'lead_prospector',
  'b2b_vault': 'lead_prospector',
  'b2b': 'lead_prospector',
  'leads': 'lead_prospector',
  'prospector': 'lead_prospector',
  'invoices': 'work',
  'proposals': 'work',
  'documents': 'content',
  'website-audit': 'reports',
  'website_review': 'reports',
  'local-seo': 'visibility',
  'local_seo': 'visibility',
  'marketing-planner': 'growth',
  'marketing_planner': 'growth',
  'marketing': 'growth',
  'masterclass': 'masterclass_kit',
  'masterclass-kit': 'masterclass_kit',
  'masterclass_kit': 'masterclass_kit',
  'agency-vault': 'masterclass_kit',
  'agency_vault': 'masterclass_kit',
  'growth-vault': 'masterclass_kit',
  'growth_vault': 'masterclass_kit',
  'agency-growth-vault': 'masterclass_kit',
  'agency_growth_vault': 'masterclass_kit',
  'growth-kit': 'masterclass_kit',
  'growth_kit': 'masterclass_kit',
  'vault': 'masterclass_kit',
  'pricing-plans': 'pricing',
  'subscription': 'subscription',
  'settings': 'settings',
  'admin': 'admin',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const [activeTab, setActiveTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '').trim();
      if (path === '' || path === 'home') return 'home';
      if (path && PATH_TO_TAB[path]) return PATH_TO_TAB[path];
      if (path === 'admin') return 'admin';
      if (path === 'features') return 'features';
      if (path === 'pricing') return 'pricing_public';
      if (path === 'about') return 'about';
      if (path === 'contact') return 'contact';
      if (path === 'login') return 'login';
      if (path === 'signup') return 'signup';
      if (path === 'dashboard') return 'dashboard';
      if (path === 'lead-prospector' || path === 'lead_prospector' || path === 'lead-vault' || path === 'lead_vault' || path === 'b2b-vault' || path === 'b2b_vault' || path === 'leads' || path === 'prospector') return 'lead_prospector';
      if (path === 'agency-vault' || path === 'agency_vault' || path === 'masterclass' || path === 'masterclass-kit' || path === 'masterclass_kit' || path === 'growth-vault' || path === 'growth_vault' || path === 'vault') return 'masterclass_kit';
      if (window.location.pathname.startsWith('/features/')) {
        return `feature_${window.location.pathname.replace(/^\/features\//, '').trim()}`;
      }
      if (window.location.pathname.startsWith('/use-cases/')) {
        return `usecase_${window.location.pathname.replace(/^\/use-cases\//, '').trim()}`;
      }
      if (window.location.pathname.startsWith('/resources/')) {
        return `resource_${window.location.pathname.replace(/^\/resources\//, '').trim()}`;
      }
      if (window.location.pathname.startsWith('/blog/')) {
        return `resource_${window.location.pathname.replace(/^\/blog\//, '').trim()}`;
      }
      if (window.location.pathname.startsWith('/for/')) return 'industry_pseo';
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

    // Active session hydration via /api/auth/me
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
        }
      })
      .catch(() => {
        // Unauthenticated visitor: keep default user without destroying application state
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
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [localSeoItems, setLocalSeoItems] = useState<LocalSeoItem[]>([]);

  const [latestWebsiteAudit, setLatestWebsiteAudit] = useState<WebsiteAuditResult | null>(null);
  const [latestMarketingPlan, setLatestMarketingPlan] = useState<MarketingPlannerOutput | null>(null);

  // Multi-Client & Business Selector State
  const [businesses, setBusinesses] = useState<ClientBusiness[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_businesses_list');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return INITIAL_BUSINESSES;
  });

  const [activeBusinessId, setActiveBusinessId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_active_business_id');
        if (cached) return cached;
      } catch {}
    }
    return 'austin-dental';
  });

  const [priorityActions, setPriorityActions] = useState<PriorityAction[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('locora_priority_actions');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return INITIAL_PRIORITY_ACTIONS;
  });

  const [rightAiPanelOpen, setRightAiPanelOpen] = useState<boolean>(false);
  const toggleRightAiPanel = useCallback(() => setRightAiPanelOpen((prev) => !prev), []);

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId) || businesses[0] || INITIAL_BUSINESSES[0];

  const switchBusiness = useCallback((id: string) => {
    const target = businesses.find((b) => b.id === id);
    if (!target) return;
    setActiveBusinessId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locora_active_business_id', id);
    }
    setBusinessProfile((prev) => ({
      ...prev,
      id: `bp_${target.id}`,
      name: target.name,
      tagline: target.tagline,
      industry: target.category,
      address: target.address,
      city: target.city,
      state: target.state,
      zip: target.zip,
      phone: target.phone,
      website: target.website,
      services: target.services,
      primaryCompetitors: target.competitors,
      googleBusiness: {
        ...prev.googleBusiness,
        connected: true,
        listingName: `${target.name} (Google Maps)`,
        rating: target.googleRating,
        reviewCount: target.reviewCount,
        unansweredReviews: target.unansweredReviews,
        category: target.category,
      },
    }));
  }, [businesses]);

  const addBusiness = useCallback((data: Partial<ClientBusiness>) => {
    const newId = `biz_${Date.now()}`;
    const newBiz: ClientBusiness = {
      id: newId,
      name: data.name || 'New Client Business',
      category: data.category || 'General Local Business',
      tagline: data.tagline || 'Local Business & Customer Care',
      locationName: data.locationName || 'Main Location',
      address: data.address || '100 Main St',
      city: data.city || 'Austin',
      state: data.state || 'TX',
      zip: data.zip || '78701',
      phone: data.phone || '(512) 555-0100',
      website: data.website || 'example.com',
      healthScore: 75,
      healthDelta: 3,
      highImpactCount: 2,
      opportunityCount: 4,
      healthyAreaCount: 8,
      isMainLocation: true,
      locations: [
        {
          id: `loc_${Date.now()}`,
          name: data.locationName || 'Main Location',
          isMain: true,
          address: data.address || '100 Main St',
          city: data.city || 'Austin',
          state: data.state || 'TX',
          zip: data.zip || '78701',
          phone: data.phone || '(512) 555-0100',
        },
      ],
      services: data.services || ['Primary Service', 'Secondary Service'],
      competitors: data.competitors || ['Local Competitor'],
      googleRating: 4.8,
      reviewCount: 30,
      unansweredReviews: 4,
      gbpCompleteness: 90,
    };
    setBusinesses((prev) => {
      const next = [...prev, newBiz];
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_businesses_list', JSON.stringify(next));
      }
      return next;
    });
    switchBusiness(newId);
  }, [switchBusiness]);

  const addLocation = useCallback((businessId: string, loc: { name: string; address: string; city?: string; state?: string; country?: string; zip?: string; phone?: string }) => {
    setBusinesses((prev) => {
      const next = prev.map((b) => {
        if (b.id !== businessId) return b;
        const newLoc = {
          id: `loc_${Date.now()}`,
          name: loc.name,
          address: loc.address,
          city: loc.city || b.city,
          state: loc.state || b.state,
          country: loc.country || b.country || 'United States',
          zip: loc.zip || b.zip || '',
          phone: loc.phone || b.phone,
          isMain: false,
        };
        return {
          ...b,
          locations: [...(b.locations || []), newLoc],
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_businesses_list', JSON.stringify(next));
      }
      return next;
    });
  }, []);

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('locora_businesses_list', JSON.stringify(next));
      }
      return next;
    });

    setBusinessProfile((prev) => ({
      ...prev,
      name: data.name || prev.name,
      industry: data.category || prev.industry,
      website: data.website || prev.website,
      phone: data.phone || prev.phone,
      address: data.address || prev.address,
      city: data.city || prev.city,
      state: data.state || prev.state,
      country: data.country || prev.country,
    }));
  }, [activeBusinessId]);

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

  const approveAndExecuteAIAction = useCallback(async (actionId: string) => {
    setAiActions((prev) => {
      const next = prev.map((act) => {
        if (act.id !== actionId) return act;
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
    logActivity('ai_action_executed', 'AI Action Executed', `Action ${actionId} approved and executed successfully`);
  }, []);

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
      const queryEmail = user.email ? encodeURIComponent(user.email) : '';
      const res = await fetch(`/api/workspace/data${queryEmail ? `?email=${queryEmail}` : ''}`, {
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

      // Sync isolated business record from Locora Database (SINGLE SOURCE OF TRUTH)
      if (user.email) {
        try {
          const bizRes = await fetch(`/api/data-engine/businesses?email=${queryEmail}`);
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
                city: r.identity?.city || 'Austin',
                state: r.identity?.state || 'TX',
                zip: r.identity?.zip || '78701',
                phone: r.identity?.phone || '',
                website: r.identity?.website || '',
                healthScore: r.businessBrain?.score || 82,
                healthDelta: 5,
                highImpactCount: (r.businessBrain?.priorityActions || []).filter((a: any) => a.urgency === 'high').length,
                opportunityCount: (r.businessBrain?.priorityActions || []).filter((a: any) => a.urgency === 'opportunity').length,
                healthyAreaCount: 10,
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
                googleRating: r.gbpData?.rating || 4.8,
                reviewCount: r.gbpData?.reviewCount || 34,
                unansweredReviews: r.gbpData?.unansweredReviews || 0,
                gbpCompleteness: 92,
                rankingAvg: r.localPack?.averageRank || 3.2,
                monthlySearches: r.traffic?.sessions || 1200,
                opportunitiesCount: r.businessBrain?.swot?.opportunities?.length || 4,
                monthlyOrganicTraffic: r.traffic?.sessions || 1200,
                aiReadinessScore: r.businessBrain?.readinessScore || 85,
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
        addBusiness,
        addLocation,
        priorityActions,
        fixItAction,
        publishDraft,
        rightAiPanelOpen,
        setRightAiPanelOpen,
        toggleRightAiPanel,

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
