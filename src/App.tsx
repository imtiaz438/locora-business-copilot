import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { SubscriptionInvoiceModal } from './components/SubscriptionInvoiceModal';
import { FirstTimeOnboardingModal } from './components/FirstTimeOnboardingModal';
import { AIActionApprovalModal } from './components/AIActionApprovalModal';
import { GrowthStoreModal } from './components/GrowthStoreModal';
import { GoogleBusinessSyncModal } from './components/GoogleBusinessSyncModal';
import { SubscriptionInvoice } from './types';
import {
  isAppSubdomain,
  isDirectorySubdomain,
  navigateToMain,
  navigateToDirectory,
  isProductionCustomDomain,
} from './utils/domain';

// View Modules
import { DashboardView } from './components/DashboardView';
import { AiManagerView } from './components/AiManagerView';
import { GrowthView } from './components/GrowthView';
import { CRMView } from './components/CRMView';
import { WorkHubView } from './components/WorkHubView';
import { InvoiceView } from './components/InvoiceView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { AgencyClientsView } from './components/AgencyClientsView';
import { WebsiteReviewView } from './components/WebsiteReviewView';
import { LocalVisibilityView } from './components/LocalVisibilityView';
import { ReputationView } from './components/ReputationView';
import { CompetitorIntelligenceView } from './components/CompetitorIntelligenceView';
import { ContentStudioView } from './components/ContentStudioView';
import { BusinessBrainView } from './components/BusinessBrainView';
import { BusinessHubView } from './components/BusinessHubView';
import { SettingsView } from './components/SettingsView';
import { PricingView } from './components/PricingView';
import { SubscriptionView } from './components/SubscriptionView';
import { LandingPageView } from './components/LandingPageView';
import { AdminView } from './components/AdminView';
import { LeadProspectorView } from './components/LeadProspectorView';
import { MasterclassKitView } from './components/MasterclassKitView';

// Public Marketing & SEO Architecture Views
import { HomeView } from './components/public/HomeView';
import { ProductView } from './components/public/ProductView';
import { FeaturesView } from './components/public/FeaturesView';
import { FeatureDetailPage } from './components/public/FeatureDetailPage';
import { UseCaseDetailPage } from './components/public/UseCaseDetailPage';
import { UseCasesHubView } from './components/public/UseCasesHubView';
import { ResourceDetailPage } from './components/public/ResourceDetailPage';
import { ResourcesHubView } from './components/public/ResourcesHubView';
import { IndustryPseoView } from './components/public/IndustryPseoView';
import { PricingPublicView } from './components/public/PricingPublicView';
import { AboutView } from './components/public/AboutView';
import { ContactView } from './components/public/ContactView';
import { AuthView } from './components/public/AuthView';
import { PrivacyPolicyView } from './components/public/PrivacyPolicyView';
import { TermsOfServiceView } from './components/public/TermsOfServiceView';
import { SecurityOverviewView } from './components/public/SecurityOverviewView';
import { RefundPolicyView } from './components/public/RefundPolicyView';
import { DirectoryHubView } from './components/directory/DirectoryHubView';
import { DirectoryBusinessDetailView } from './components/directory/DirectoryBusinessDetailView';
import { applyPageMetadata } from './utils/seoMetadata';
import { resolveRouteFromPath } from './utils/routeUtils';

const PATH_TO_TAB: Record<string, string> = {
  '': 'home',
  'home': 'home',
  'products': 'products',
  'product': 'products',
  'features': 'features',
  'agencies': 'agency_landing',
  'for/agencies': 'agency_landing',
  'for-agencies': 'agency_landing',
  'use-cases': 'use-cases',
  'use-cases/': 'use-cases',
  'use_cases': 'use-cases',
  'use_cases_hub': 'use-cases',
  'resources': 'resources',
  'resources/': 'resources',
  'resources_hub': 'resources',
  'blog': 'resources',
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
  'refund': 'refund',
  'refunds': 'refund',
  'refund-policy': 'refund',
  'cancellation-policy': 'refund',
  'security': 'security',
  'dashboard': 'dashboard',
  'app': 'dashboard',
  'growth-hub': 'dashboard',
  'growth': 'marketing',
  'local-visibility': 'visibility',
  'visibility': 'visibility',
  'reputation': 'reputation',
  'competitors': 'competitors',
  'content': 'content',
  'content-studio': 'content',
  'business-brain': 'business_brain',
  'brain': 'business_brain',
  'data-engine': 'dashboard',
  'data_engine': 'dashboard',
  'architecture': 'dashboard',
  'pipeline': 'dashboard',
  'customers': 'crm',
  'work': 'proposals',
  'reports': 'reports',
  'chat': 'chat',
  'crm': 'crm',
  'projects': 'projects',
  'lead-prospector': 'lead_prospector',
  'leads': 'lead_prospector',
  'lead-vault': 'lead_prospector',
  'invoices': 'invoices',
  'proposals': 'proposals',
  'documents': 'documents',
  'seo': 'seo',
  'seo-audit': 'seo',
  'seo_audit': 'seo',
  'audit': 'seo',
  'website-audit': 'seo',
  'website-review': 'seo',
  'website_review': 'seo',
  'local-seo': 'local_seo',
  'marketing-planner': 'marketing',
  'masterclass': 'masterclass_kit',
  'growth-kit': 'masterclass_kit',
  'pricing-plans': 'pricing',
  'subscription': 'subscription',
  'settings': 'settings',
  'admin': 'admin',
  'directory': 'directory',
  'checkout/success': 'dashboard',
  'billing/success': 'dashboard',
  'payment/success': 'dashboard',
};

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    subscribePlan,
    user,
    updateUser,
    onboardingModalOpen,
    setOnboardingModalOpen,
    selectedAIActionForApproval,
    setSelectedAIActionForApproval,
    approveAndExecuteAIAction,
    growthStoreModalOpen,
    setGrowthStoreModalOpen,
    isGbpSyncModalOpen,
    setIsGbpSyncModalOpen,
  } = useApp();
  const [successInvoice, setSuccessInvoice] = useState<SubscriptionInvoice | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFullInvoiceModal, setShowFullInvoiceModal] = useState(false);

  // Handle initial URL path routing and popstate events
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const rawPath = window.location.pathname;
      const isApp = isAppSubdomain();
      const isDirectory = isDirectorySubdomain();

      if (isApp) {
        // Redirect marketing routes on app subdomain to main website
        if (
          rawPath.startsWith('/features') ||
          rawPath.startsWith('/feature') ||
          rawPath.startsWith('/use-cases') ||
          rawPath.startsWith('/usecase') ||
          rawPath.startsWith('/resources') ||
          rawPath.startsWith('/resource') ||
          rawPath.startsWith('/blog') ||
          rawPath.startsWith('/for/') ||
          rawPath === '/agencies' ||
          rawPath === '/for-agencies'
        ) {
          navigateToMain(rawPath);
          return;
        }
      }

      if (isDirectory) {
        // If visitor is on directory subdomain, non-directory routes (home, resources, features, pricing, etc.)
        // must redirect back to the main website
        const isDirectoryRoute =
          rawPath === '/' ||
          rawPath === '' ||
          rawPath.startsWith('/directory') ||
          (rawPath.startsWith('/business/') && !['locations', 'directory', 'profile', 'brain', 'settings'].includes(rawPath.replace(/^\/business\//, '').split('/')[0].toLowerCase())) ||
          rawPath.startsWith('/biz/') ||
          rawPath.startsWith('/city/') ||
          rawPath.startsWith('/category/') ||
          rawPath.startsWith('/api/');

        if (!isDirectoryRoute) {
          navigateToMain(rawPath);
          return;
        }
      }

      // If visitor is on the main production domain or app subdomain and navigates to directory routes, redirect to directory subdomain:
      if (!isDirectory && isProductionCustomDomain()) {
        if (rawPath === '/directory' || rawPath === '/directory/') {
          navigateToDirectory('/');
          return;
        }
        if (rawPath.startsWith('/directory/business/')) {
          const slug = rawPath.replace(/^\/directory\/business\//, '');
          navigateToDirectory(`/biz/${slug}`);
          return;
        }
        if (rawPath.startsWith('/business/')) {
          const sub = rawPath.replace(/^\/business\//, '').split('/')[0];
          const reservedBusinessSubroutes = ['locations', 'directory', 'profile', 'brain', 'settings'];
          if (sub && !reservedBusinessSubroutes.includes(sub.toLowerCase())) {
            navigateToDirectory(`/biz/${sub}`);
            return;
          }
        }
        if (rawPath.startsWith('/biz/')) {
          const slug = rawPath.replace(/^\/biz\//, '');
          navigateToDirectory(`/biz/${slug}`);
          return;
        }
        if (rawPath.startsWith('/directory/city/')) {
          const slug = rawPath.replace(/^\/directory\/city\//, '');
          navigateToDirectory(`/city/${slug}`);
          return;
        }
        if (rawPath.startsWith('/city/')) {
          const slug = rawPath.replace(/^\/city\//, '');
          navigateToDirectory(`/city/${slug}`);
          return;
        }
        if (rawPath.startsWith('/directory/category/')) {
          const slug = rawPath.replace(/^\/directory\/category\//, '');
          navigateToDirectory(`/category/${slug}`);
          return;
        }
        if (rawPath.startsWith('/category/')) {
          const slug = rawPath.replace(/^\/category\//, '');
          navigateToDirectory(`/category/${slug}`);
          return;
        }
      }

      const resolved = resolveRouteFromPath(rawPath, isApp, isDirectory);
      let targetTab = resolved.targetTab;

      if ((targetTab === 'login' || targetTab === 'signup') && user.isAuthenticated) {
        targetTab = 'dashboard';
      }

      // If browser was pointed to an uncanonical alias (like /resource_google-business-profile-guide), clean it up silently
      if (!resolved.isCanonical && rawPath !== resolved.canonicalPath) {
        window.history.replaceState({}, '', resolved.canonicalPath);
      }

      setActiveTab(targetTab);
    };

    syncRouteFromLocation();

    const handlePopState = () => {
      syncRouteFromLocation();
    };

    window.addEventListener('popstate', handlePopState);

    const query = new URLSearchParams(window.location.search);
    const hasResetToken = query.get('reset_token') || query.get('magic_token') || query.get('oobCode') || query.get('mode') === 'resetPassword';
    
    // Check for any Whop return parameter or success path
    const sessionId = query.get('session') || query.get('session_id') || query.get('checkout_session') || '';
    const isPaymentReturn =
      query.get('payment_status') === 'success' ||
      query.get('status') === 'success' ||
      query.get('checkout_status') === 'success' ||
      query.get('checkout_success') === 'true' ||
      Boolean(sessionId) ||
      Boolean(query.get('receipt_id')) ||
      Boolean(query.get('payment_id')) ||
      window.location.pathname.includes('/checkout/success') ||
      window.location.pathname.includes('/billing/success');

    if (hasResetToken) {
      setActiveTab('login');
    } else if (isPaymentReturn) {
      const paymentId = query.get('payment_id') || query.get('receipt_id') || (sessionId.startsWith('chs_') ? sessionId : '');
      const stateId = query.get('state_id') || '';
      const plan = (query.get('plan') || (sessionId.includes('agency') ? 'agency' : 'pro')).toLowerCase();
      const billingCycle = (query.get('billing_cycle') || 'monthly').toLowerCase();
      const productType = query.get('product_type') || query.get('productType') || '';
      const packId = query.get('pack_id') || query.get('packId') || '';
      const amount = query.get('amount') || query.get('price') || '';
      const credits = query.get('credits') || '';
      const userEmail = query.get('email') || user.email || localStorage.getItem('locora_user_email') || '';

      // Verify and sync Whop checkout session immediately with backend
      const verifyUrl = `/api/whop/verify-session?session=${encodeURIComponent(sessionId)}&payment_id=${encodeURIComponent(paymentId)}&state_id=${encodeURIComponent(stateId)}&plan=${encodeURIComponent(plan)}&billing_cycle=${encodeURIComponent(billingCycle)}&email=${encodeURIComponent(userEmail)}&product_type=${encodeURIComponent(productType)}&pack_id=${encodeURIComponent(packId)}&amount=${encodeURIComponent(amount)}&credits=${encodeURIComponent(credits)}`;

      fetch(verifyUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            if (!productType) {
              subscribePlan(data.user.planTier || (plan as any), (data.user.billingCycle || billingCycle) as any);
            }
            updateUser({
              ...data.user,
              isAuthenticated: true,
            });
          } else if (!productType) {
            subscribePlan(plan as any, billingCycle as any);
          }

          if (data.invoice) {
            setSuccessInvoice(data.invoice);
            setShowSuccessModal(true);
          } else {
            const fallbackInv: SubscriptionInvoice = {
              id: `INV-${new Date().getFullYear()}-WHOP`,
              amount: productType ? Number(amount) || 12 : plan === 'agency' ? (billingCycle === 'yearly' ? 468 : 49) : (billingCycle === 'yearly' ? 180 : 19),
              date: new Date().toISOString(),
              status: 'paid',
              planName: productType ? `LOCORA AI ${productType.toUpperCase()}` : `LOCORA AI ${plan.toUpperCase()} PLAN (${billingCycle.toUpperCase()})`,
              planTier: plan as any,
              billingCycle: (productType ? 'monthly' : billingCycle) as any,
              paymentMethod: 'Whop Merchant of Record',
              whopMembershipId: data.user?.whopMembershipId || sessionId || paymentId,
              whopPaymentId: paymentId || sessionId,
              whopReceiptId: paymentId || sessionId,
              userEmail: user.email || userEmail,
              userName: user.name,
            };
            setSuccessInvoice(fallbackInv);
            setShowSuccessModal(true);
          }
        })
        .catch(() => {
          if (!productType) {
            subscribePlan(plan as any, billingCycle as any);
          }
        });

      // Clean URL params and transition cleanly to the appropriate view
      try {
        const cleanPath = window.location.pathname.replace(/\/checkout\/success|\/billing\/success|\/payment\/success/, '') || '/';
        window.history.replaceState({}, document.title, cleanPath);
      } catch (e) {}

      if (productType === 'masterclass_kit') {
        setActiveTab('masterclass_kit');
      } else if (productType === 'white_label_audit') {
        setActiveTab('website_review');
      } else if (productType === 'lead_list') {
        setActiveTab('lead_prospector');
      } else {
        setActiveTab('dashboard');
      }
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, subscribePlan, updateUser, user.email, user.isAuthenticated, user.name]);

  // Synchronize document.title, meta descriptions, and robots index/noindex directives
  useEffect(() => {
    applyPageMetadata(activeTab);
  }, [activeTab]);

  const renderViewContent = () => {
    // Dynamic Layer 1: Product Pages
    if (activeTab.startsWith('feature_')) {
      return <FeatureDetailPage slug={activeTab.replace(/^feature_/, '')} />;
    }

    // Dynamic Layer 2: Use Cases
    if (activeTab === 'use-cases' || activeTab === 'use_cases' || activeTab === 'use_cases_hub') return <UseCasesHubView />;
    if (activeTab.startsWith('usecase_') || activeTab.startsWith('use_case_')) {
      return <UseCaseDetailPage slug={activeTab.replace(/^usecase_/, '').replace(/^use_case_/, '')} />;
    }

    // Dynamic Layer 3: Industry & Agency Pages
    if (activeTab === 'agency_landing') return <IndustryPseoView industrySlug="agencies" />;
    if (activeTab === 'industry_pseo') return <IndustryPseoView />;

    // Dynamic Layer 4: Educational Content & SOPs
    if (activeTab === 'resources' || activeTab === 'resources_hub') return <ResourcesHubView />;
    if (activeTab.startsWith('resource_')) {
      return <ResourceDetailPage slug={activeTab.replace(/^resource_/, '')} />;
    }

    // Dynamic Layer 5: Local Business Directory (directory.locoraai.com & /directory)
    if (activeTab === 'directory') return <DirectoryHubView />;
    if (activeTab.startsWith('directory_biz_')) {
      return <DirectoryBusinessDetailView slug={activeTab.replace(/^directory_biz_/, '')} />;
    }
    if (activeTab.startsWith('directory_city_cat_')) {
      const parts = activeTab.replace(/^directory_city_cat_/, '').split('__');
      return <DirectoryHubView initialCity={parts[0]} initialCategory={parts[1]} />;
    }
    if (activeTab.startsWith('directory_city_')) {
      return <DirectoryHubView initialCity={activeTab.replace(/^directory_city_/, '')} />;
    }
    if (activeTab.startsWith('directory_cat_')) {
      return <DirectoryHubView initialCategory={activeTab.replace(/^directory_cat_/, '')} />;
    }

    // Other Public Routes
    if (activeTab === 'home') return <HomeView />;
    if (activeTab === 'products' || activeTab === 'product') return <ProductView />;
    if (activeTab === 'features') return <FeaturesView />;
    if (activeTab === 'pricing_public') return <PricingPublicView />;
    if (activeTab === 'about') return <AboutView />;
    if (activeTab === 'contact') return <ContactView />;
    if (activeTab === 'landing_page') return <LandingPageView />;
    if (activeTab === 'login') return <AuthView initialMode="login" />;
    if (activeTab === 'signup') return <AuthView initialMode="signup" />;
    if (activeTab === 'privacy') return <PrivacyPolicyView />;
    if (activeTab === 'terms') return <TermsOfServiceView />;
    if (activeTab === 'refund') return <RefundPolicyView />;
    if (activeTab === 'security') return <SecurityOverviewView />;

    // Authenticated OS Modules - Unified AI Manager Architecture
    if (activeTab === 'dashboard') return <DashboardView />;
    if (activeTab === 'business' || activeTab === 'business_profile') return <BusinessHubView initialTab="profile" />;
    if (activeTab === 'business_locations') return <BusinessHubView initialTab="locations" />;
    if (activeTab === 'business_directory') return <BusinessHubView initialTab="directory" />;
    if (activeTab === 'settings_businesses') return <SettingsView initialTab="businesses" />;
    if (activeTab === 'ai_manager' || activeTab === 'chat') return <AiManagerView />;
    if (activeTab === 'growth' || activeTab === 'marketing' || activeTab === 'marketing_planner') return <GrowthView />;
    if (activeTab === 'visibility' || activeTab === 'local_seo' || activeTab === 'seo_schema') return <LocalVisibilityView />;
    if (activeTab === 'reputation') return <ReputationView />;
    if (activeTab === 'competitors') return <CompetitorIntelligenceView />;
    if (activeTab === 'content' || activeTab === 'documents') return <ContentStudioView />;
    if (activeTab === 'business_brain' || activeTab === 'brain') return <BusinessBrainView />;
    if (activeTab === 'customers' || activeTab === 'crm') return <CRMView />;
    if (activeTab === 'work' || activeTab === 'proposals' || activeTab === 'invoices') return <WorkHubView />;
    if (activeTab === 'reports' || activeTab === 'growth_report' || activeTab === 'monthly_report') return <MonthlyReportView />;
    if (activeTab === 'clients' || activeTab === 'agency_clients') return <AgencyClientsView />;
    if (activeTab === 'website_review' || activeTab === 'audit' || activeTab === 'seo' || activeTab === 'seo_audit') return <WebsiteReviewView />;
    if (activeTab === 'projects') return <WorkHubView initialTab="projects" />;
    if (activeTab === 'lead_prospector' || activeTab === 'lead_vault' || activeTab === 'b2b_vault' || activeTab === 'leads' || activeTab === 'lead-prospector') return <LeadProspectorView />;
    if (activeTab === 'invoices') return <InvoiceView />;
    if (activeTab === 'masterclass_kit' || activeTab === 'agency_vault' || activeTab === 'growth_vault' || activeTab === 'masterclass') return <MasterclassKitView />;
    if (activeTab === 'pricing') return <PricingView />;
    if (activeTab === 'subscription') return <SubscriptionView />;
    if (activeTab === 'settings') return <SettingsView />;
    if (activeTab === 'admin') {
      return (user.isAuthenticated && (user.role === 'admin' || user.role === 'owner' || user.email === 'imtiazbaloch3322@gmail.com' || user.email === 'support@locoraai.com'))
        ? <AdminView />
        : <DashboardView />;
    }

    // Guaranteed Fallback — Prevents any white-out or unrendered state
    return user.isAuthenticated ? <DashboardView /> : <HomeView />;
  };

  return (
    <AppShell>
      <ErrorBoundary>
        {renderViewContent()}
      </ErrorBoundary>

      {/* Payment Success Instant Celebration & Activation Modal */}
      {showSuccessModal && (
        <PaymentSuccessModal
          invoice={successInvoice}
          user={user}
          onClose={() => setShowSuccessModal(false)}
          onViewInvoice={() => {
            setShowSuccessModal(false);
            setShowFullInvoiceModal(true);
          }}
        />
      )}

      {/* Official Tax Invoice & Order Management Modal */}
      {showFullInvoiceModal && successInvoice && (
        <SubscriptionInvoiceModal
          invoice={successInvoice}
          user={user}
          onClose={() => setShowFullInvoiceModal(false)}
        />
      )}

      {/* SECTION 35: First-Time Onboarding Wizard Modal */}
      <FirstTimeOnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
      />

      {/* SECTION 32 & 33: AI Action Approval & Execution Gate Modal */}
      <AIActionApprovalModal
        isOpen={selectedAIActionForApproval !== null}
        action={selectedAIActionForApproval}
        onClose={() => setSelectedAIActionForApproval(null)}
        onApproveAndExecute={approveAndExecuteAIAction}
      />

      {/* SECTION 40: Growth Store Modal */}
      <GrowthStoreModal
        isOpen={growthStoreModalOpen}
        onClose={() => setGrowthStoreModalOpen(false)}
      />

      {/* Live Google Business Profile & Custom Location Sync Modal */}
      <GoogleBusinessSyncModal
        isOpen={isGbpSyncModalOpen}
        onClose={() => setIsGbpSyncModalOpen(false)}
      />
    </AppShell>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
