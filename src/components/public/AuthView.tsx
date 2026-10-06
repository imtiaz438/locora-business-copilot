import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  Shield,
  ScanSearch,
  BadgeCheck,
  Coins,
  LayoutDashboard,
  LogOut,
  Sparkles,
  User,
  Zap,
  ExternalLink,
  X,
} from 'lucide-react';
import { UserPlan } from '../../types';
import { validateRealEmail } from '../../lib/emailValidation';
import { LocoraLogo } from '../LocoraLogo';
import { triggerGoogleSSO, triggerLinkedInSSO } from '../../lib/oauthService';
import { trackSignupStarted, trackSignupCompleted } from '../../lib/analytics';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login' }) => {
  const { user, login, logout, setActiveTab, pendingPlanAfterAuth } = useApp();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('free');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAudit, setPendingAudit] = useState<{ domain?: string; businessName?: string } | null>(null);
  const [pendingDirectoryClaim, setPendingDirectoryClaim] = useState<{ businessId: string; businessName: string; slug: string; timestamp?: number } | null>(null);

  const handleCancelDirectoryClaim = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('locora_pending_directory_claim');
    }
    setPendingDirectoryClaim(null);
    setCompany('');
  };

  const handleCancelPendingAudit = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('locora_pending_public_audit');
    }
    setPendingAudit(null);
    setCompany('');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const hasClaimParam = params.get('claim') === 'true' || Boolean(params.get('businessId'));
        const modeParam = params.get('mode');

        if (modeParam === 'signup') {
          setIsSignUp(true);
        } else if (modeParam === 'login') {
          setIsSignUp(false);
        }

        if (params.get('email')) {
          setEmail(params.get('email')!);
        }

        const raw = localStorage.getItem('locora_pending_public_audit');
        if (raw) {
          const parsed = JSON.parse(raw);
          setPendingAudit(parsed);
          if (parsed.businessName && !hasClaimParam) {
            setCompany((curr) => curr || parsed.businessName);
          }
        }

        // Cross-domain checkup handoff: ?auditId=... arrives from the marketing
        // site (localStorage doesn't cross origins). Fetch the audit and stage
        // it so the post-signup claim fires on this domain.
        const urlAuditId = params.get('auditId');
        if (urlAuditId && !raw) {
          fetch(`/api/public/checkup/${encodeURIComponent(urlAuditId)}`)
            .then((auditRes) => (auditRes.ok ? auditRes.json() : null))
            .then((audit) => {
              if (audit?.auditId) {
                try {
                  localStorage.setItem('locora_pending_public_audit', JSON.stringify(audit));
                } catch {}
                setPendingAudit({ domain: audit.domain, businessName: audit.businessName });
                if (audit.businessName) {
                  setCompany((curr) => curr || audit.businessName);
                }
              }
            })
            .catch(() => {});
        }

        const rawCheckup = sessionStorage.getItem('locora_pending_checkup');
        if (rawCheckup) {
          try {
            const parsedCheckup = JSON.parse(rawCheckup);
            if (parsedCheckup?.businessName && !hasClaimParam) {
              setCompany((curr) => curr || parsedCheckup.businessName);
            }
          } catch {}
        }

        if (initialMode === 'signup' || modeParam === 'signup') {
          trackSignupStarted('/signup', 'email');
        }

        const rawClaim = localStorage.getItem('locora_pending_directory_claim');
        if (rawClaim) {
          const parsedClaim = JSON.parse(rawClaim);
          // Only auto-attach directory claim if user arrived via an explicit claim link (?claim=true or ?businessId=...)
          // If the user navigated to /auth, /signup, or /login normally without claim intent, do NOT hijack their signup!
          if (hasClaimParam) {
            setPendingDirectoryClaim(parsedClaim);
            if (parsedClaim.businessName) {
              setCompany(parsedClaim.businessName);
            }
            setIsSignUp(true);
          } else {
            // Stale claim leftover from prior directory browsing session — clear it cleanly
            localStorage.removeItem('locora_pending_directory_claim');
            setPendingDirectoryClaim(null);
          }
        }
      } catch {}
    }
  }, []);

  // Book Demo CTA State
  const [showBookDemo, setShowBookDemo] = useState(false);
  const [demoSenderName, setDemoSenderName] = useState('');
  const [demoSenderEmail, setDemoSenderEmail] = useState('');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccessMsg, setDemoSuccessMsg] = useState<string | null>(null);
  const [demoErrorMsg, setDemoErrorMsg] = useState<string | null>(null);

  const handleBookDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoErrorMsg(null);
    setDemoSuccessMsg(null);

    if (!demoSenderName.trim() || !demoSenderEmail.trim()) {
      setDemoErrorMsg('Please enter both your name and email address.');
      return;
    }

    const emailCheck = validateRealEmail(demoSenderEmail);
    if (!emailCheck.valid) {
      setDemoErrorMsg(emailCheck.error || 'Please enter a valid real email address.');
      return;
    }

    setDemoSubmitting(true);
    try {
      const res = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: demoSenderName.trim(),
          senderEmail: emailCheck.normalizedEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setDemoErrorMsg(data.error || 'Failed to submit demo access request.');
        return;
      }

      setDemoSuccessMsg(data.message || 'Demo request submitted! Admin will email you the guest demo password shortly.');
      setDemoSenderName('');
      setDemoSenderEmail('');
    } catch (err) {
      setDemoErrorMsg('Connection error. Please try again.');
    } finally {
      setDemoSubmitting(false);
    }
  };
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'success'>('request');
  const [magicToken, setMagicToken] = useState<string | null>(null);
  const [magicResetUrl, setMagicResetUrl] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetInfoMsg, setResetInfoMsg] = useState<string | null>(null);

  // Automatically check URL parameters for Magic Link or Firebase reset tokens
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token') || params.get('magic_token') || params.get('oobCode');
    const emailParam = params.get('email');

    if (token) {
      setIsForgotPassword(true);
      setMagicToken(token);
      if (emailParam) setEmail(emailParam);
      setForgotStep('verify');

      // Validate magic token against server
      fetch('/api/auth/verify-magic-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.email) {
            setEmail(data.email);
            setResetInfoMsg(`Password reset link verified for ${data.email}. Enter your new password below.`);
          } else if (data.email) {
            setEmail(data.email);
            setResetInfoMsg(`Enter your new password for ${data.email} below.`);
          } else {
            setResetInfoMsg(`Enter your registered email and new password below.`);
          }
        })
        .catch(() => {
          setResetInfoMsg('Password reset link loaded. Enter your new password below.');
        });
    }

    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS' && event.data.user) {
        const u = event.data.user;
        login(u.email, u.name, u.companyName, u.planTier || 'pro', u.aiCreditsUsed || 0, u.role, u.id);
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [login, setActiveTab]);

  useEffect(() => {
    if (user.isAuthenticated) {
      setActiveTab('dashboard');
    }
  }, [user.isAuthenticated, setActiveTab]);

  const handleRequestMagicResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetInfoMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      // 1. Check with system database server first if email is registered
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'This email address is not registered. Password reset is only available for registered accounts.');
        return;
      }

      setResetInfoMsg(`Password reset email sent to ${trimmedEmail}. Check your inbox for instructions.`);
      if (data.magicToken) setMagicToken(data.magicToken);
      setForgotStep('verify');
    } catch (err) {
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: magicToken,
          email: email.trim(),
          resetCode: resetCode.trim(),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Failed to reset password.');
      } else {
        setForgotStep('success');
        setPassword(newPassword);
        setResetInfoMsg('Password updated securely! You can now sign in.');
        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (err) {
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      setErrorMessage(emailCheck.error || 'Please enter a valid real email address.');
      return;
    }
    const trimmedEmail = emailCheck.normalizedEmail!;

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (isSignUp && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp
        ? { name: fullName, email: trimmedEmail, companyName: company, plan: selectedPlan, password }
        : { email: trimmedEmail, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        if (isSignUp) {
          trackSignupCompleted({
            email: data.user.email,
            planTier: data.user.planTier,
            companyName: data.user.companyName,
            method: 'email',
          });
        }
        login(data.user.email, data.user.name, data.user.companyName, data.user.planTier, data.user.aiCreditsUsed, data.user.role, data.user.id);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Auth connection error:', err);
      setErrorMessage('Server error. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    login('free.user@starterbiz.com', 'David Miller', 'Miller Plumbing Services', 'free');
    setActiveTab('dashboard');
  };

  const handleOAuthConnect = async (provider: 'linkedin' | 'google') => {
    try {
      setLoading(true);
      setErrorMessage(null);
      if (provider === 'google') {
        await triggerGoogleSSO({
          onStart: () => setLoading(true),
          onSuccess: (authenticatedUser) => {
            trackSignupCompleted({
              email: authenticatedUser.email,
              planTier: authenticatedUser.planTier,
              companyName: authenticatedUser.companyName,
              method: 'google',
            });
            login(
              authenticatedUser.email,
              authenticatedUser.name,
              authenticatedUser.companyName || `${authenticatedUser.name}'s Business Workspace`,
              authenticatedUser.planTier || 'free',
              authenticatedUser.aiCreditsUsed || 0,
              authenticatedUser.role,
              authenticatedUser.id
            );
            setActiveTab('dashboard');
            setLoading(false);
          },
          onError: (err) => {
            console.warn('Google sign-in error:', err);
            setErrorMessage(err);
            setLoading(false);
          },
        });
      } else {
        await triggerLinkedInSSO({
          onStart: () => setLoading(true),
          onSuccess: (authenticatedUser) => {
            trackSignupCompleted({
              email: authenticatedUser.email,
              planTier: authenticatedUser.planTier,
              companyName: authenticatedUser.companyName,
              method: 'linkedin',
            });
            login(
              authenticatedUser.email,
              authenticatedUser.name,
              authenticatedUser.companyName || `${authenticatedUser.name}'s Business Workspace`,
              authenticatedUser.planTier || 'free',
              authenticatedUser.aiCreditsUsed || 0,
              authenticatedUser.role,
              authenticatedUser.id
            );
            setActiveTab('dashboard');
            setLoading(false);
          },
          onError: (err) => {
            console.warn('LinkedIn sign-in error:', err);
            setErrorMessage(err);
            setLoading(false);
          },
        });
      }
    } catch (err: any) {
      console.error('OAuth launch error:', err);
      setErrorMessage(`Could not start ${provider === 'google' ? 'Google' : 'LinkedIn'} sign-in.`);
      setLoading(false);
    }
  };

  // If already authenticated, show full-width Account Overview + Sign Out
  if (user.isAuthenticated) {
    return (
      <div className="py-16 px-4 sm:px-6 max-w-3xl mx-auto font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 text-slate-900">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-extrabold text-2xl font-heading shadow-md">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading text-slate-900">{user.name || 'Account User'}</h1>
                <p className="text-xs text-slate-500 font-sans">{user.email}</p>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 text-[10px] font-bold uppercase font-heading">
                  <Sparkles className="w-3 h-3" />
                  <span>{user.planTier} Plan Member</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setActiveTab('home');
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider font-heading">Company Name</p>
              <p className="text-sm font-bold text-slate-900">{user.companyName || 'Not Set'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider font-heading">AI Copilot Credits</p>
              <p className="text-sm font-bold text-[#059669]">
                {`${user.aiCreditsUsed} / ${user.monthlyAiCredits} Used`}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex-1 py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Launch App Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('pricing_public')}
              className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer font-sans"
            >
              Change Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 max-w-6xl mx-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* LEFT PANEL - Emerald Brand Experience */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#022c22] via-[#047857] to-[#034e38] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#10b981]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo — white chip so the dark wordmark reads on the dark banner */}
          <div className="relative z-10">
            <div className="inline-flex bg-white rounded-2xl px-4 py-2.5 shadow-lg">
              <LocoraLogo
                assetType="auth"
                size={38}
                className="flex-shrink-0"
              />
            </div>
          </div>

          {/* Center Pitch */}
          <div className="relative z-10 my-8 space-y-6">
            {!isSignUp ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading leading-tight text-white">
                  Your local search visibility, <span className="text-emerald-300">demystified.</span>
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                  See your business through Google's eyes. Identify exactly what it takes to rank #1 in your area.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white">
                    <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300">
                      <ScanSearch className="w-4 h-4" />
                    </div>
                    <span className="font-medium">40-point live website &amp; SEO audit</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white">
                    <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300">
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                    <span className="font-medium">100% real Google signals — zero fake data</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white">
                    <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300">
                      <Coins className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Free plan: 25 AI credits every month</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading leading-tight text-white">
                  Your <span className="text-emerald-300">AI copilot</span> for local business growth
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                  Get your free copilot account today. 25 free AI credits monthly, no credit card required.
                </p>

                <ul className="space-y-3.5 pt-2 text-xs sm:text-sm text-emerald-50 font-sans">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span>Free 25 AI credits every month — no card needed</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span>AI-powered proposal generator & local SEO</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span>Client CRM & white-label PDF invoicing</span>
                  </li>
                </ul>
              </>
            )}
          </div>

          <div className="relative z-10 text-[11px] text-emerald-200/70 font-sans">
            © 2026 Locora AI. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL - Clean Light Form Panel */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Nav Mode Switcher Pills */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 max-w-xs font-heading">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  !isSignUp ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isSignUp ? 'bg-[#059669] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register Free
              </button>
            </div>

            {/* Form Title */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                {isForgotPassword
                  ? 'Reset your password'
                  : isSignUp
                  ? 'Create your account'
                  : 'Welcome back to Locora AI'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-sans">
                {isForgotPassword
                  ? 'Recover access to your Locora business workspace'
                  : isSignUp
                  ? 'Start your local business growth — free forever'
                  : 'Sign in to access your business copilot dashboard'}
              </p>
            </div>

            {/* Pending Plan Upgrade Alert */}
            {pendingPlanAfterAuth && (
              <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs font-semibold text-amber-900 font-sans flex items-start gap-2.5 animate-fadeIn shadow-xs">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 block">Registration & Sign In Required</span>
                  <span className="text-amber-800 text-[11px] font-normal leading-normal block">
                    To upgrade to the <strong className="uppercase font-bold text-amber-950">{pendingPlanAfterAuth.plan} Plan</strong>, please register an account or sign in first.
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 font-sans flex items-start gap-2 animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Info Banner */}
            {resetInfoMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 font-sans flex items-start gap-2 animate-fadeIn">
                <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                <span>{resetInfoMsg}</span>
              </div>
            )}

            {/* PASSWORD RESET FLOW */}
            {isForgotPassword ? (
              <div className="space-y-4 font-sans">
                {forgotStep === 'request' && (
                  <form onSubmit={handleRequestMagicResetLink} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Reset Email...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Send Password Reset Email</span>
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setErrorMessage(null);
                        setResetInfoMsg(null);
                      }}
                      className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
                    >
                      ← Return to Sign In
                    </button>
                  </form>
                )}

                {forgotStep === 'verify' && (
                  <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </span>
                      ) : (
                        <span>Confirm & Reset Password</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
                    >
                      ← Request New Code
                    </button>
                  </form>
                )}

                {forgotStep === 'success' && (
                  <div className="space-y-4 text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#059669] mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Password Reset Successfully</h4>
                      <p className="text-xs text-slate-500 mt-1">Your password has been updated. Sign in with your email and new password.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setIsSignUp(false);
                        setForgotStep('request');
                      }}
                      className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer font-sans"
                    >
                      Proceed to Sign In
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Book Demo CTA Bar & Request Form */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                      Try Demo Access
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowBookDemo(!showBookDemo)}
                      className="text-xs font-bold text-[#059669] hover:underline cursor-pointer"
                    >
                      {showBookDemo ? 'Hide Demo Form' : 'Book Demo CTA'}
                    </button>
                  </div>

                  {!showBookDemo ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        Want to test the full Locora AI Workspace? Request a guest demo password directly from the admin.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowBookDemo(true)}
                        className="w-full py-2.5 px-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Book Demo (Request Guest Password)</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBookDemoSubmit} className="space-y-3 pt-1 border-t border-emerald-200/60">
                      {demoSuccessMsg && (
                        <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs rounded-xl font-medium border border-emerald-200">
                          {demoSuccessMsg}
                        </div>
                      )}
                      {demoErrorMsg && (
                        <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium border border-rose-200">
                          {demoErrorMsg}
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sender Name</label>
                        <input
                          type="text"
                          required
                          value={demoSenderName}
                          onChange={(e) => setDemoSenderName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sender Email</label>
                        <input
                          type="email"
                          required
                          value={demoSenderEmail}
                          onChange={(e) => setDemoSenderEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#059669]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={demoSubmitting}
                        className="w-full py-2 px-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {demoSubmitting ? 'Sending Request...' : 'Submit Demo Request to Admin'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                  {isSignUp && pendingDirectoryClaim && (
                    <div className="p-4 bg-emerald-50/95 border border-emerald-300 rounded-2xl text-xs text-emerald-950 space-y-3 shadow-xs animate-fadeIn">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Sparkles className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold block text-emerald-900 font-heading text-sm">
                              🏢 Claiming Directory Profile: {pendingDirectoryClaim.businessName}
                            </span>
                            <span className="text-slate-600 block leading-relaxed font-sans text-xs">
                              You are connecting your new Locora account directly as the verified owner of{' '}
                              <strong className="text-slate-900">{pendingDirectoryClaim.businessName}</strong>. This unlocks customer inquiries, verified reviews, and activates your Business Brain.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelDirectoryClaim}
                          className="text-[11px] font-bold text-slate-600 hover:text-rose-600 px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Cancel claiming this business and create a fresh standard account"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel & Register Different Business</span>
                        </button>
                      </div>
                      <div className="pt-2 border-t border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-emerald-800">
                        <span>Not your business? Cancel above to register your own company or agency.</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleCancelDirectoryClaim();
                            setActiveTab('directory');
                          }}
                          className="font-semibold text-emerald-900 underline hover:text-emerald-950 cursor-pointer text-left"
                        >
                          Browse Directory (thousands of listings) →
                        </button>
                      </div>
                    </div>
                  )}

                  {isSignUp && pendingAudit && !pendingDirectoryClaim && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block text-emerald-900 font-heading">
                            🎯 Quick Checkup Preserved!
                          </span>
                          <span className="text-slate-600 block leading-relaxed font-sans">
                            Creating your account will claim your scan for{' '}
                            <strong className="text-slate-900">{pendingAudit.businessName || pendingAudit.domain}</strong> and initialize your verified Business Brain.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelPendingAudit}
                        className="text-[11px] text-slate-500 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                        title="Dismiss scan and register fresh business"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isSignUp && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Vance"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Agency Name</label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Apex Digital Solutions"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">Password</label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotStep('request');
                            setErrorMessage(null);
                          }}
                          className="text-[11px] font-semibold text-[#059669] hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignUp ? 'Minimum 8 characters' : 'Enter your password'}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Social Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap font-sans">
                Or continue with
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3 font-sans">
              <button
                type="button"
                onClick={() => handleOAuthConnect('google')}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthConnect('linkedin')}
                className="py-2.5 px-3 bg-[#0077b5] hover:bg-[#006097] text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.4 1.4 0 1 0 1.4 1.4 1.4 1.4 0 0 0-1.4-1.4z" />
                </svg>
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-100 mt-6 font-sans">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-600 font-medium hover:text-[#059669] transition-colors cursor-pointer"
            >
              {isSignUp ? (
                <span>Already registered? <strong className="text-[#059669]">Sign In</strong></span>
              ) : (
                <span>Need an account? <strong className="text-[#059669]">Register Free</strong></span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
