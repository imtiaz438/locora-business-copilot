import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
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
      const userEmail = user.email || localStorage.getItem('locora_user_email') || '';

      // Verify and sync Whop checkout session immediately with backend
      fetch(`/api/whop/verify-session?session=${encodeURIComponent(sessionId)}&payment_id=${encodeURIComponent(paymentId)}&state_id=${encodeURIComponent(stateId)}&plan=${encodeURIComponent(plan)}&billing_cycle=${encodeURIComponent(billingCycle)}&email=${encodeURIComponent(userEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            subscribePlan(data.user.planTier || (plan as any), (data.user.billingCycle || billingCycle) as any);
            updateUser({
              ...data.user,
              isAuthenticated: true,
            });
          } else {
            subscribePlan(plan as any, billingCycle as any);
          }

          if (data.invoice) {
            setSuccessInvoice(data.invoice);
            setShowSuccessModal(true);
          } else {
            const fallbackInv: SubscriptionInvoice = {
              id: `INV-${new Date().getFullYear()}-WHOP`,
              amount: plan === 'agency' ? (billingCycle === 'yearly' ? 468 : 49) : (billingCycle === 'yearly' ? 180 : 19),
              date: new Date().toISOString(),
              status: 'paid',
              planName: `LOCORA AI ${plan.toUpperCase()} PLAN (${billingCycle.toUpperCase()})`,
              planTier: plan as any,
              billingCycle: billingCycle as any,
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
          subscribePlan(plan as any, billingCycle as any);
        });

      // Clean URL params and transition cleanly to the user's dashboard
      try {
        const cleanPath = window.location.pathname.replace(/\/checkout\/success|\/billing\/success|\/payment\/success/, '') || '/';
        window.history.replaceState({}, document.title, cleanPath);
      } catch (e) {}
      setActiveTab('dashboard');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, subscribePlan, updateUser, user.email, user.isAuthenticated, user.name]);

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
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
