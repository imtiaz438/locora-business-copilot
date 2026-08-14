import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { AuthModal } from './AuthModal';
import { CheckoutModal } from './CheckoutModal';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { LocoraLogo } from './LocoraLogo';
import { PublicNavbar } from './public/PublicNavbar';
import { PublicFooter } from './public/PublicFooter';
import { CookieConsentBanner } from './CookieConsentBanner';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { activeTab, setActiveTab, user } = useApp();
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

  const isPublicRoute =
    activeTab === 'home' ||
    activeTab === 'features' ||
    activeTab === 'industry_pseo' ||
    activeTab === 'pricing_public' ||
    activeTab === 'about' ||
    activeTab === 'contact' ||
    activeTab === 'landing_page' ||
    activeTab === 'login' ||
    activeTab === 'signup' ||
    activeTab === 'privacy' ||
    activeTab === 'terms' ||
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

      {/* Main OS View Wrapper */}
      <div ref={mainRef} className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
        <Header
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 pb-12">{children}</main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <AuthModal />
      <CheckoutModal />
      <CookieConsentBanner />
    </div>
  );
};
