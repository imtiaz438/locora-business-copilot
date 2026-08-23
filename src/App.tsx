import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';

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

// Public Marketing Views
import { HomeView } from './components/public/HomeView';
import { FeaturesView } from './components/public/FeaturesView';
import { PricingPublicView } from './components/public/PricingPublicView';
import { AboutView } from './components/public/AboutView';
import { ContactView } from './components/public/ContactView';
import { AuthView } from './components/public/AuthView';
import { PrivacyPolicyView } from './components/public/PrivacyPolicyView';
import { TermsOfServiceView } from './components/public/TermsOfServiceView';
import { SecurityOverviewView } from './components/public/SecurityOverviewView';
import { RefundPolicyView } from './components/public/RefundPolicyView';
import { IndustryPseoView } from './components/public/IndustryPseoView';

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
  'refund': 'refund',
  'refunds': 'refund',
  'refund-policy': 'refund',
  'cancellation-policy': 'refund',
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

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, subscribePlan, user } = useApp();

  // Handle initial URL path routing and popstate events
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const rawPath = window.location.pathname;
      const path = rawPath.replace(/^\//, '').trim();
      if (rawPath.startsWith('/for/')) {
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
    const isPaymentReturn =
      query.get('payment_status') === 'success' ||
      query.get('status') === 'success' ||
      query.get('checkout_status') === 'success' ||
      query.get('checkout_success') === 'true' ||
      Boolean(query.get('receipt_id')) ||
      Boolean(query.get('payment_id'));

    if (hasResetToken) {
      setActiveTab('login');
    } else if (isPaymentReturn) {
      const paymentId = query.get('payment_id') || query.get('receipt_id') || '';
      const stateId = query.get('state_id') || '';
      const plan = (query.get('plan') || 'pro').toLowerCase();
      const billingCycle = (query.get('billing_cycle') || 'monthly').toLowerCase();

      // Verify and sync Whop checkout immediately with backend
      fetch(`/api/whop/verify-session?payment_id=${encodeURIComponent(paymentId)}&state_id=${encodeURIComponent(stateId)}&plan=${encodeURIComponent(plan)}&billing_cycle=${encodeURIComponent(billingCycle)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            subscribePlan(data.user.planTier || (plan as any), (data.user.billingCycle || billingCycle) as any);
          } else {
            subscribePlan(plan as any, billingCycle as any);
          }
        })
        .catch(() => {
          subscribePlan(plan as any, billingCycle as any);
        });

      // Clean URL params and transition cleanly to the user's dashboard
      window.history.replaceState({}, document.title, window.location.pathname);
      setActiveTab('dashboard');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, subscribePlan, user.isAuthenticated]);

  return (
    <AppShell>
      {/* Public Routes */}
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'features' && <FeaturesView />}
      {activeTab === 'pricing_public' && <PricingPublicView />}
      {activeTab === 'about' && <AboutView />}
      {activeTab === 'contact' && <ContactView />}
      {activeTab === 'industry_pseo' && <IndustryPseoView />}
      {activeTab === 'landing_page' && <LandingPageView />}
      {activeTab === 'login' && <AuthView initialMode="login" />}
      {activeTab === 'signup' && <AuthView initialMode="signup" />}
      {activeTab === 'privacy' && <PrivacyPolicyView />}
      {activeTab === 'terms' && <TermsOfServiceView />}
      {activeTab === 'refund' && <RefundPolicyView />}
      {activeTab === 'security' && <SecurityOverviewView />}

      {/* Authenticated OS Modules */}
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'chat' && <ChatView />}
      {activeTab === 'crm' && <CRMView />}
      {activeTab === 'projects' && <CRMView initialTab="projects" />}
      {activeTab === 'invoices' && <InvoiceView />}
      {activeTab === 'proposals' && <ProposalView />}
      {activeTab === 'documents' && <DocumentGeneratorView />}
      {activeTab === 'website_review' && <WebsiteReviewView />}
      {activeTab === 'local_seo' && <LocalSeoView />}
      {activeTab === 'marketing' && <MarketingPlannerView />}
      {activeTab === 'marketing_planner' && <MarketingPlannerView />}
      {activeTab === 'pricing' && <PricingView />}
      {activeTab === 'subscription' && <SubscriptionView />}
      {activeTab === 'settings' && <SettingsView />}
      {activeTab === 'admin' && (user.isAuthenticated && (user.role === 'admin' || user.role === 'owner' || user.email === 'imtiazbaloch3322@gmail.com' || user.email === 'support@locoraai.com') ? <AdminView /> : <DashboardView />)}
    </AppShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
