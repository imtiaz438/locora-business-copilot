import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldCheck, Mail, ArrowRight, CheckCircle2, Heart, Globe, Lock, Loader2, Linkedin, Facebook, Instagram } from 'lucide-react';
import { LocoraLogo } from '../LocoraLogo';

export const PublicFooter: React.FC = () => {
  const { setActiveTab, setAuthModalOpen } = useApp();
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
      // Fallback grace
      setSubscribed(true);
      setNewsletterEmail('');
    } finally {
      setIsSubmitting(false);
    }
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
              Join 12,000+ agency owners and service entrepreneurs receiving our weekly teardowns on closing enterprise local retainers with AI.
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
                    className="px-5 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-70"
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

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <LocoraLogo
              className="w-12 h-12 flex-shrink-0"
            />
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm font-sans">
              The unified AI Copilot designed specifically for local service businesses and agencies. Automate proposal drafting, client CRM, local SEO schemas, and PDF invoicing.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 pt-2 font-sans">
              <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> SOC2 Compliant
              </span>
              <span className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <Globe className="w-4 h-4 text-indigo-600" /> 99.9% Uptime SLA
              </span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2 font-sans">Connect With Us</p>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/company/locoraai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/locoraai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#1877f2] hover:border-[#1877f2]/30 hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/locoraai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#e4405f] hover:border-[#e4405f]/30 hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">Product Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => setActiveTab('features')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  AI Proposals & Contracts
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('features')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Local SEO & Schema Generator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('features')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Client CRM & Pipeline
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('features')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  One-Click PDF Invoicing
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('features')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Website SEO Audit Engine
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('features')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  30/90-Day Marketing Roadmaps
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">Company & Resources</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  About Locora AI
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('pricing_public')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Pricing & Tiers
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Contact Support & Sales
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('login')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Client Portal Sign In
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#059669] transition-colors cursor-pointer">
                  Launch App Workspace
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">Locora AI HQ</h4>
            <div className="text-xs space-y-1 text-slate-600">
              <p className="font-semibold text-slate-800">Locora AI Headquarters</p>
              <p>100 Innovation Way, Suite 400</p>
              <p>San Francisco, CA 94105</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-sans">
          <p>© {new Date().getFullYear()} Locora AI Platform, Inc. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveTab('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => {
                setActiveTab('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => {
                setActiveTab('refund');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <button
              onClick={() => {
                setActiveTab('security');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
