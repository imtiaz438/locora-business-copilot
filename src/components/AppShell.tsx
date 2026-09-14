import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { AuthModal } from './AuthModal';
import { CheckoutModal } from './CheckoutModal';
import { FuelPackModal } from './FuelPackModal';
import { RightAiPanel } from './RightAiPanel';
import { Lock, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { LocoraLogo } from './LocoraLogo';
import { PublicNavbar } from './public/PublicNavbar';
import { PublicFooter } from './public/PublicFooter';
import { CookieConsentBanner } from './CookieConsentBanner';
import { AuthView } from './public/AuthView';
import { isAppSubdomain, getMainSiteUrl } from '../utils/domain';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { activeTab, setActiveTab, user, fuelPackModalOpen, setFuelPackModalOpen, fuelPackReason } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isApp = isAppSubdomain();

  // App Subdomain (app.locoraai.com) Authentication Guard & Layout
  if (isApp && (!user.isAuthenticated || activeTab === 'login' || activeTab === 'signup')) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
        <header className="h-16 px-6 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <LocoraLogo className="w-8 h-8" />
            <span className="font-heading font-black text-slate-900 text-lg tracking-tight">Locora</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">App</span>
          </div>
          <a
            href={getMainSiteUrl('/')}
            className="text-xs font-semibold text-slate-600 hover:text-[#059669] flex items-center gap-1.5 transition-colors"
          >
            <span>Visit Website (locoraai.com)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <AuthView initialMode={activeTab === 'signup' ? 'signup' : 'login'} />
        </main>

        <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-100">
          © {new Date().getFullYear()} Locora AI Inc. All rights reserved. Secure Cloud Dashboard.
        </footer>
        <CookieConsentBanner />
      </div>
    );
  }

  const isPublicRoute =
    activeTab === 'home' ||
    activeTab === 'products' ||
    activeTab === 'product' ||
    activeTab === 'features' ||
    activeTab.startsWith('feature_') ||
    activeTab === 'use-cases' ||
    activeTab === 'use_cases' ||
    activeTab === 'use_cases_hub' ||
    activeTab.startsWith('usecase_') ||
    activeTab.startsWith('use_case_') ||
    activeTab === 'resources' ||
    activeTab === 'resources_hub' ||
    activeTab.startsWith('resource_') ||
    activeTab === 'industry_pseo' ||
    activeTab.startsWith('industry_') ||
    activeTab === 'pricing_public' ||
    activeTab === 'about' ||
    activeTab === 'contact' ||
    activeTab === 'landing_page' ||
    activeTab === 'login' ||
    activeTab === 'signup' ||
    activeTab === 'privacy' ||
    activeTab === 'terms' ||
    activeTab === 'refund' ||
    activeTab === 'security';

  // Render Public Website Layout
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <AuthModal />
        <CheckoutModal />
        <FuelPackModal
          isOpen={fuelPackModalOpen}
          onClose={() => setFuelPackModalOpen(false)}
          initialReason={fuelPackReason}
        />
        <CookieConsentBanner />
      </div>
    );
  }

  // Render Auth Guard for Unauthenticated Users attempting App routes
  if (!user.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <LocoraLogo className="w-20 h-20 mx-auto drop-shadow-sm" />

            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
                Authentication Required
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
                Please sign up or sign in to your Locora account to access the app operating system, client CRM, AI Copilot, and business tools.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setActiveTab('signup')}
                className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Register Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('login')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer font-sans"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </div>
        <PublicFooter />
        <AuthModal />
        <CheckoutModal />
        <FuelPackModal
          isOpen={fuelPackModalOpen}
          onClose={() => setFuelPackModalOpen(false)}
          initialReason={fuelPackReason}
        />
        <CookieConsentBanner />
      </div>
    );
  }

  // Render Authenticated App Shell OS
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 antialiased overflow-hidden selection:bg-emerald-600 selection:text-white">
      {/* Persistent Left Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main OS View Wrapper with Optional Right AI Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <Header
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <div className="flex-1 flex min-w-0 overflow-hidden">
          <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto pb-12">
            {children}
          </main>
          <RightAiPanel />
        </div>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <AuthModal />
      <CheckoutModal />
      <FuelPackModal
        isOpen={fuelPackModalOpen}
        onClose={() => setFuelPackModalOpen(false)}
        initialReason={fuelPackReason}
      />
      <CookieConsentBanner />
    </div>
  );
};
