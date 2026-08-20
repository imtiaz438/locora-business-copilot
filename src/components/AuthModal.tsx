import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, Search, TrendingUp, Shield, Zap, Sparkles, ExternalLink, KeyRound, Link as LinkIcon } from 'lucide-react';
import { UserPlan } from '../types';
import { validateRealEmail } from '../lib/emailValidation';
import { LocoraLogo } from './LocoraLogo';
import { SocialAuthModal } from './SocialAuthModal';
import { triggerGoogleSSO, triggerLinkedInSSO } from '../lib/oauthService';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, pendingPlanAfterAuth, setActiveTab } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'google' | 'linkedin'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('free');

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

    setDemoSubmitting(true);
    try {
      const res = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: demoSenderName.trim(),
          senderEmail: demoSenderEmail.trim(),
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

  // Password Reset State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'success'>('request');
  const [magicToken, setMagicToken] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetInfoMsg, setResetInfoMsg] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Automatically check URL parameters for Magic Link reset tokens
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token') || params.get('magic_token');
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
          } else if (data.error) {
            setErrorMessage(data.error);
          }
        })
        .catch(() => {
          setErrorMessage('Failed to verify magic link token.');
        });
    }

    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS' && event.data.user) {
        const u = event.data.user;
        login(u.email, u.name, u.companyName, u.planTier || 'pro', u.aiCreditsUsed || 0, u.role, u.id);
        setAuthModalOpen(false);
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [login, setActiveTab, setAuthModalOpen]);

  if (!authModalOpen) return null;

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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Failed to send password reset email.');
      } else {
        setResetInfoMsg(`Password reset email sent to ${trimmedEmail}. Check your inbox for instructions.`);
        if (data.magicToken) setMagicToken(data.magicToken);
        setForgotStep('verify');
      }
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

    if (isSignUp) {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please check and try again.');
        return;
      }
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
        login(data.user.email, data.user.name, data.user.companyName, data.user.planTier, data.user.aiCreditsUsed, data.user.role, data.user.id);
        setAuthModalOpen(false);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Auth error in modal:', err);
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    login('free.user@starterbiz.com', 'David Miller', 'Miller Plumbing Services', 'free');
    setAuthModalOpen(false);
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
            login(
              authenticatedUser.email,
              authenticatedUser.name,
              authenticatedUser.companyName || `${authenticatedUser.name}'s Business Workspace`,
              authenticatedUser.planTier || 'free',
              authenticatedUser.aiCreditsUsed || 0,
              authenticatedUser.role,
              authenticatedUser.id
            );
            setAuthModalOpen(false);
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
            login(
              authenticatedUser.email,
              authenticatedUser.name,
              authenticatedUser.companyName || `${authenticatedUser.name}'s Business Workspace`,
              authenticatedUser.planTier || 'free',
              authenticatedUser.aiCreditsUsed || 0,
              authenticatedUser.role,
              authenticatedUser.id
            );
            setAuthModalOpen(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px] max-h-[92vh]">
        {/* Close Button top-right */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL - Forest Green Brand Experience */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#022c22] via-[#047857] to-[#034e38] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#10b981]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <LocoraLogo
              assetType="auth"
              className="w-12 h-12 flex-shrink-0"
              variant="dark"
            />
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
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="font-medium">500+ businesses served</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white">
                    <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300">
                      <Search className="w-4 h-4" />
                    </div>
                    <span className="font-medium">95% audit accuracy</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-white">
                    <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Enterprise-grade security</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading leading-tight text-white">
                  Join 500+ businesses <span className="text-emerald-300">growing with Locora</span>
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-sans">
                  Get your first local SEO audit free. No credit card required, no commitments.
                </p>

                <ul className="space-y-3.5 pt-2 text-xs sm:text-sm text-emerald-50">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span>Free audit every month — no credit card needed</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span>AI-powered local SEO analysis & schema</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span>Actionable recommendations in seconds</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                    </div>
                    <span>Join 500+ growing local businesses</span>
                  </li>
                </ul>
              </>
            )}
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 text-[11px] text-emerald-200/60 font-sans">
            © 2026 Locora. All rights reserved.
          </div>
        </div>

        {/* RIGHT PANEL - Clean White Form Panel */}
        <div className="w-full md:w-7/12 p-8 sm:p-10 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Form Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
                {isForgotPassword
                  ? 'Reset your password'
                  : isSignUp
                  ? 'Create your account'
                  : 'Welcome back'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-sans">
                {isForgotPassword
                  ? 'Follow the steps to recover access to your account'
                  : isSignUp
                  ? 'Start your local SEO journey — free forever'
                  : 'Sign in to your dashboard'}
              </p>
            </div>

            {/* Pending Plan Upgrade Alert */}
            {pendingPlanAfterAuth && (
              <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl text-xs font-semibold text-amber-900 font-sans flex items-start gap-2.5 animate-fadeIn shadow-xs">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 block">Registration & Sign In Required</span>
                  <span className="text-amber-800 text-[11px] font-normal leading-normal block">
                    To upgrade to the <strong className="uppercase font-bold text-amber-950">{pendingPlanAfterAuth.plan} Plan</strong>, please register an account or sign in first. You will be redirected to complete your upgrade immediately after signing in.
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

            {/* Info Message Banner */}
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
                        placeholder="you@business.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
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
                      className="w-full py-3 px-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </span>
                      ) : (
                        <span>Confirm & Update Password</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
                    >
                      ← Request New Magic Link
                    </button>
                  </form>
                )}

                {forgotStep === 'success' && (
                  <div className="space-y-4 text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#059669] mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Password Reset Completed</h4>
                      <p className="text-xs text-slate-500 mt-1">You can now sign in using your email and updated password.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setIsSignUp(false);
                        setForgotStep('request');
                      }}
                      className="w-full py-3 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer font-sans"
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

                {/* Credentials Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Jane Smith"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company / Business Name</label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Apex Digital Solutions"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
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
                        placeholder={isSignUp ? 'Minimum 8 characters' : 'Your password'}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
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

                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat your password"
                          className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
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
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-sans cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Free Account' : 'Sign in'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Social Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap font-sans">
                {isSignUp ? 'Or sign up with' : 'Or continue with'}
              </span>
            </div>

            {/* Social Sign-In Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleOAuthConnect('google')}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs font-sans"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthConnect('linkedin')}
                className="w-full py-2.5 px-4 bg-[#0077b5] hover:bg-[#006097] text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs font-sans"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.4 1.4 0 1 0 1.4 1.4 1.4 1.4 0 0 0-1.4-1.4z" />
                </svg>
                <span>Continue with LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Switch Mode Toggle Footer */}
          <div className="text-center pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-600 font-medium hover:text-[#059669] transition-colors cursor-pointer"
            >
              {isSignUp ? (
                <span>Already have an account? <strong className="text-[#059669]">Sign in</strong></span>
              ) : (
                <span>Don't have an account? <strong className="text-[#059669]">Register free</strong></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Social Auth Modal */}
      <SocialAuthModal
        isOpen={socialModalOpen}
        onClose={() => {
          setSocialModalOpen(false);
          setAuthModalOpen(false);
        }}
        provider={socialProvider}
      />
    </div>
  );
};

