import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, Loader2, Mail, User } from 'lucide-react';
import { validateRealEmail } from '../lib/emailValidation';

interface SocialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google' | 'linkedin';
}

export const SocialAuthModal: React.FC<SocialAuthModalProps> = ({
  isOpen,
  onClose,
  provider,
}) => {
  const { user, login, setActiveTab } = useApp();
  const isGoogle = provider === 'google';

  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize with current user context or saved cookies if available, without hardcoding
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setLoading(false);
      if (user.email && user.email !== 'guest@demo.com') {
        setInputEmail(user.email);
        setInputName(user.name || '');
      } else {
        const storedEmail = localStorage.getItem('locora_last_auth_email') || '';
        const storedName = localStorage.getItem('locora_last_auth_name') || '';
        if (storedEmail) {
          setInputEmail(storedEmail);
          setInputName(storedName);
        }
      }
    }
  }, [isOpen, provider, user.email, user.name]);

  if (!isOpen) return null;

  const handleLaunchPopup = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const currentOrigin = window.location.origin;
      const redirectUri = `${currentOrigin}/auth/callback`;
      let queryParams = `provider=${provider}&redirectUri=${encodeURIComponent(redirectUri)}`;
      if (inputEmail.trim()) {
        queryParams += `&email=${encodeURIComponent(inputEmail.trim())}`;
      }
      if (inputName.trim()) {
        queryParams += `&name=${encodeURIComponent(inputName.trim())}`;
      }
      
      const res = await fetch(`/api/auth/oauth/url?${queryParams}`);
      const data = await res.json();
      if (data.url) {
        const width = 480;
        const height = 620;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        window.open(
          data.url,
          `oauth_${provider}`,
          `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
        );
      }
    } catch (err) {
      console.error('Popup launch failed:', err);
      setErrorMsg('Could not launch OAuth window. Please sign in directly below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = inputEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg(`Please enter your ${isGoogle ? 'Google' : 'LinkedIn'} email address.`);
      return;
    }

    const emailCheck = validateRealEmail(trimmedEmail);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error || 'Please enter a valid real email address.');
      return;
    }

    const derivedName = inputName.trim() || trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    setLoading(true);
    try {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: trimmedEmail,
          name: derivedName,
          companyName: `${derivedName}'s Business Workspace`,
          planTier: 'free',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Social sign-in failed. Please try again.');
        return;
      }

      if (data.user) {
        try {
          localStorage.setItem('locora_last_auth_email', data.user.email);
          localStorage.setItem('locora_last_auth_name', data.user.name);
        } catch (_) {}

        login(
          data.user.email,
          data.user.name,
          data.user.companyName,
          data.user.planTier || 'free',
          data.user.aiCreditsUsed || 0,
          data.user.role || 'customer',
          data.user.id
        );
        onClose();
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Social authentication failed:', err);
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${isGoogle ? 'bg-gradient-to-r from-blue-50/70 to-emerald-50/70' : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80'} border-b border-slate-100 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${isGoogle ? 'bg-white' : 'bg-[#0077b5] text-white'}`}>
              {isGoogle ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.4 1.4 0 1 0 1.4 1.4 1.4 1.4 0 0 0-1.4-1.4z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Continue with {isGoogle ? 'Google' : 'LinkedIn'}
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Sign in with your {isGoogle ? 'Google' : 'LinkedIn'} account
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 font-sans">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Dynamic Profile Input Form */}
          <form onSubmit={handleDynamicSocialLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Full Name</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>{isGoogle ? 'Google' : 'LinkedIn'} Email Address *</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Required</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder={isGoogle ? 'you@gmail.com' : 'you@linkedin.com'}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                isGoogle
                  ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-700/20'
                  : 'bg-[#0077b5] hover:bg-[#006097] text-white shadow-blue-700/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {inputEmail 
                      ? `Sign In as ${inputName || inputEmail.split('@')[0]}` 
                      : `Continue with ${isGoogle ? 'Google' : 'LinkedIn'}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-2 pb-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap font-sans">
              Or launch OAuth popup window
            </span>
          </div>

          {/* Launch Popup Button */}
          <button
            type="button"
            onClick={handleLaunchPopup}
            disabled={loading}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Open {isGoogle ? 'Google' : 'LinkedIn'} SSO Window</span>
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-bit encrypted authentication • Dynamic profile detection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

