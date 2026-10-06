import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  Mail,
  ArrowRight,
  CheckCircle2,
  Heart,
  Globe,
  Lock,
  Loader2,
  Linkedin,
  Facebook,
  Youtube,
} from 'lucide-react';
import { LocoraLogo } from '../LocoraLogo';
import {
  navigateToMain,
  navigateToDirectory,
  isDirectorySubdomain,
} from '../../utils/domain';

export const PublicFooter: React.FC = () => {
  const { setActiveTab } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
        setNewsletterEmail('');
      } else {
        setErrorMsg(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter submission error:', err);
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateTo = (path: string, tabId: string) => {
    const isDir = isDirectorySubdomain();

    // 1. If clicking Directory link:
    if (tabId === 'directory' || tabId.startsWith('directory_') || path === '/directory') {
      const dirPath = path === '/directory' ? '/' : path;
      if (!isDir) {
        navigateToDirectory(dirPath, () => {
          window.history.pushState({}, '', path);
          setActiveTab(tabId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return;
      }
      window.history.pushState({}, '', dirPath);
      setActiveTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. If currently on directory subdomain, return to main site for non-directory links:
    if (isDir) {
      navigateToMain(path, () => {
        window.history.pushState({}, '', path);
        setActiveTab(tabId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return;
    }

    // 3. Standard in-app navigation on main site:
    window.history.pushState({}, '', path);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Newsletter & Banner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 bg-white border border-slate-200 rounded-3xl relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Locora Growth Dispatch</span>
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900">
              Get Weekly AI Local Business Strategies & SEO Prompts
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl font-sans">
              Join agency owners and service entrepreneurs receiving our weekly teardowns on closing local retainers with AI.
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            {subscribed ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>You're subscribed! Check your inbox for our Top 25 AI Proposal Prompts.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your work email address"
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669] transition-colors font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-70 font-heading"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe Free</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>
                )}
              </form>
            )}
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-sans">
              <Lock className="w-3 h-3 text-slate-400" /> No spam. Unsubscribe anytime with 1 click.
            </p>
          </div>
        </div>

        {/* Main Footer Links - 5 Column Semantic Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          {/* Brand Info & Social Media */}
          <div className="lg:col-span-1 space-y-4">
            <LocoraLogo size={30} className="flex-shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              The unified AI Operating System for agencies and local businesses. Automate proposals, local SEO, client CRM, and invoicing.
            </p>

            {/* Social Links */}
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-heading">
                Follow Locora AI
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="https://www.linkedin.com/company/locoracopilot"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#059669] hover:border-[#059669] flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61593321283379"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#059669] hover:border-[#059669] flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/@LocoraAIHQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#059669] hover:border-[#059669] flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs text-slate-600 pt-1 font-sans">
              <span className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security & privacy are core to our platform
              </span>
            </div>
          </div>

          {/* Layer 1: Product Features */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">Product Features</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => navigateTo('/products', 'products')} className="font-bold text-[#059669] hover:text-[#047857] transition-colors cursor-pointer text-left flex items-center gap-1">
                  <span>All Products Suite</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-sm font-bold">New</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/ai-proposal-generator', 'feature_ai-proposal-generator')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  AI Proposal Generator
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/seo-audit', 'feature_seo-audit')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  SEO Audit Engine
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/ai-business-audit', 'feature_ai-business-audit')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  AI Business Audit
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/marketing-planner', 'feature_marketing-planner')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Marketing Planner
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/crm', 'feature_crm')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Client CRM & Pipeline
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/invoicing', 'feature_invoicing')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  One-Click Invoicing
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/reputation-management', 'feature_reputation-management')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Reputation Management
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/document-generator', 'feature_document-generator')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Document Generator
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/features/ai-business-chat', 'feature_ai-business-chat')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  AI Business Chat
                </button>
              </li>
            </ul>
          </div>

          {/* Layer 2: Use Cases */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">Use Cases</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => navigateTo('/use-cases/local-seo', 'usecase_local-seo')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Local SEO & Google Maps
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/use-cases/lead-generation', 'usecase_lead-generation')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Lead Gen & Audit Pitches
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/use-cases/client-management', 'usecase_client-management')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Client Management & CRM
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/use-cases/marketing-planning', 'usecase_marketing-planning')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Marketing Planning
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/use-cases/agency-operations', 'usecase_agency-operations')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Agency Operations OS
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/use-cases/business-growth', 'usecase_business-growth')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Local Business Growth
                </button>
              </li>
            </ul>
          </div>

          {/* Layer 3 & 4: Industries & Educational Resources */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">Resources & SOPs</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => navigateTo('/resources/how-to-improve-local-seo', 'resource_how-to-improve-local-seo')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  How to Improve Local SEO
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/resources/how-to-create-seo-proposal', 'resource_how-to-create-seo-proposal')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Creating Winning Proposals
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/resources/google-business-profile-guide', 'resource_google-business-profile-guide')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Google Business Profile Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/resources/local-business-audit-checklist', 'resource_local-business-audit-checklist')} className="hover:text-[#059669] transition-colors cursor-pointer text-left">
                  40-Point Local Audit Checklist
                </button>
              </li>
              <li className="pt-2 border-t border-slate-200">
                <button onClick={() => navigateTo('/for/dentists', 'industry_pseo')} className="font-semibold text-emerald-700 hover:text-[#059669] transition-colors cursor-pointer text-left">
                  Explore 8+ Industry Solutions →
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">Company</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => navigateTo('/', 'home')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/directory', 'directory')} className="font-semibold text-emerald-700 hover:text-[#059669] transition-colors cursor-pointer">
                  Business Directory
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/about', 'about')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/pricing', 'pricing_public')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/contact', 'contact')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('/login', 'login')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Account Sign In
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Featured-on badges */}
        <div className="pt-8 border-t border-slate-200">
          <p className="text-[11px] font-bold font-heading uppercase tracking-wider text-slate-400 text-center mb-4">
            Featured On
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <a href="https://launchstag.com/p/locora-ai" target="_blank" rel="noopener">
              <img src="https://launchstag.com/badge-light.svg" alt="Featured on Launchstag" width="198" height="62" />
            </a>
            <a href="https://tools.cafe" target="_blank" rel="noopener">
              <img src="https://tools.cafe/b/light.svg" alt="Featured on tools.cafe" width="256" height="80" />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-sans">
          <p>© {new Date().getFullYear()} Locora AI Platform, Inc. All rights reserved.</p>

          <div className="flex items-center gap-6 flex-wrap">
            <button
              onClick={() => navigateTo('/privacy', 'privacy')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigateTo('/terms', 'terms')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigateTo('/refund', 'refund')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <button
              onClick={() => navigateTo('/security', 'security')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Security Overview
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open_cookie_settings'));
              }}
              className="hover:text-[#059669] transition-colors cursor-pointer font-medium text-slate-700 underline underline-offset-2 flex items-center gap-1"
            >
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
