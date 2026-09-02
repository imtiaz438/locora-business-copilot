import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { SubscriptionInvoiceModal } from './components/SubscriptionInvoiceModal';
import { SubscriptionInvoice } from './types';

// View Modules
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { CRMView } from './components/CRMView';
import { InvoiceView } from './components/InvoiceView';
import { ProposalView } from './components/ProposalView';
import { DocumentGeneratorView } from './components/DocumentGeneratorView';
import { WebsiteReviewView } from './components/WebsiteReviewView';
import { LocalSeoView } from './components/LocalSeoView';
import { MarketingPlannerView } from './components/MarketingPlannerView';
import { SettingsView } from './components/SettingsView';
import { PricingView } from './components/PricingView';
import { SubscriptionView } from './components/SubscriptionView';
import { LandingPageView } from './components/LandingPageView';
import { AdminView } from './components/AdminView';
import { LeadProspectorView } from './components/LeadProspectorView';
import { MasterclassKitView } from './components/MasterclassKitView';

// Public Marketing & SEO Architecture Views
import { HomeView } from './components/public/HomeView';
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

const PATH_TO_TAB: Record<string, string> = {
  '': 'home',
  'features': 'features',
  'use-cases': 'use_cases_hub',
  'use-cases/': 'use_cases_hub',
  'resources': 'resources_hub',
  'resources/': 'resources_hub',
  'blog': 'resources_hub',
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
  'chat': 'chat',
  'crm': 'crm',
  'projects': 'projects',
  'lead-prospector': 'lead_prospector',
  'leads': 'lead_prospector',
  'lead-vault': 'lead_prospector',
  'invoices': 'invoices',
  'proposals': 'proposals',
  'documents': 'documents',
  'website-audit': 'website_review',
  'local-seo': 'local_seo',
  'marketing-planner': 'marketing',
  'masterclass': 'masterclass_kit',
  'growth-kit': 'masterclass_kit',
  'pricing-plans': 'pricing',
  'subscription': 'subscription',
  'settings': 'settings',
  'admin': 'admin',
  'checkout/success': 'dashboard',
  'billing/success': 'dashboard',
  'payment/success': 'dashboard',
};

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, subscribePlan, user, updateUser } = useApp();
  const [successInvoice, setSuccessInvoice] = useState<SubscriptionInvoice | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFullInvoiceModal, setShowFullInvoiceModal] = useState(false);

  // Handle initial URL path routing and popstate events
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const rawPath = window.location.pathname;
      const path = rawPath.replace(/^\//, '').trim();

      if (rawPath.startsWith('/features/')) {
        const slug = rawPath.replace(/^\/features\//, '').trim();
        setActiveTab(`feature_${slug}`);
      } else if (rawPath.startsWith('/use-cases/')) {
        const slug = rawPath.replace(/^\/use-cases\//, '').trim();
        setActiveTab(`usecase_${slug}`);
      } else if (rawPath.startsWith('/resources/')) {
        const slug = rawPath.replace(/^\/resources\//, '').trim();
        setActiveTab(`resource_${slug}`);
      } else if (rawPath.startsWith('/blog/')) {
        const slug = rawPath.replace(/^\/blog\//, '').trim();
        setActiveTab(`resource_${slug}`);
      } else if (rawPath.startsWith('/for/')) {
        setActiveTab('industry_pseo');
      } else if (PATH_TO_TAB[path]) {
        const targetTab = PATH_TO_TAB[path];
        if ((targetTab === 'login' || targetTab === 'signup') && user.isAuthenticated) {
          setActiveTab('dashboard');
        } else {
          setActiveTab(targetTab);
        }
      }
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

  const renderViewContent = () => {
    // Dynamic Layer 1: Product Pages
    if (activeTab.startsWith('feature_')) {
      return <FeatureDetailPage slug={activeTab.replace(/^feature_/, '')} />;
    }

    // Dynamic Layer 2: Use Cases
    if (activeTab === 'use_cases_hub') return <UseCasesHubView />;
    if (activeTab.startsWith('usecase_') || activeTab.startsWith('use_case_')) {
      return <UseCaseDetailPage slug={activeTab.replace(/^usecase_/, '').replace(/^use_case_/, '')} />;
    }

    // Dynamic Layer 3: Industry Pages
    if (activeTab === 'industry_pseo') return <IndustryPseoView />;

    // Dynamic Layer 4: Educational Content & SOPs
    if (activeTab === 'resources_hub') return <ResourcesHubView />;
    if (activeTab.startsWith('resource_')) {
      return <ResourceDetailPage slug={activeTab.replace(/^resource_/, '')} />;
    }

    // Other Public Routes
    if (activeTab === 'home') return <HomeView />;
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

    // Authenticated OS Modules
    if (activeTab === 'dashboard') return <DashboardView />;
    if (activeTab === 'chat') return <ChatView />;
    if (activeTab === 'crm') return <CRMView />;
    if (activeTab === 'projects') return <CRMView initialTab="projects" />;
    if (activeTab === 'lead_prospector' || activeTab === 'lead_vault' || activeTab === 'b2b_vault' || activeTab === 'leads' || activeTab === 'lead-prospector') return <LeadProspectorView />;
    if (activeTab === 'invoices') return <InvoiceView />;
    if (activeTab === 'proposals') return <ProposalView />;
    if (activeTab === 'documents') return <DocumentGeneratorView />;
    if (activeTab === 'website_review') return <WebsiteReviewView />;
    if (activeTab === 'local_seo') return <LocalSeoView />;
    if (activeTab === 'marketing' || activeTab === 'marketing_planner') return <MarketingPlannerView />;
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
