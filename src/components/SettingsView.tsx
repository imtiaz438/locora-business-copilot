import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ACTIVE_PROVIDERS, UPCOMING_PROVIDERS } from '../services/aiProvider';
import { AIProviderId, CustomLogoConfig } from '../types';
import { TeamManagementSection } from './TeamManagementSection';
import { LocoraLogo } from './LocoraLogo';
import {
  Settings,
  Cpu,
  Building,
  Key,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Users,
  Clock,
  Lock,
  Zap,
  Download,
  Database,
  FileJson,
  Server,
  ExternalLink,
  KeyRound,
  Trash2,
  AlertTriangle,
  User,
  Upload,
  Sliders,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const AccountSecuritySection: React.FC = () => {
  const { user, logout } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' });
      } else {
        setPasswordMsg({ type: 'success', text: 'Your password has been updated and saved securely to the database!' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: 'Connection error while updating password.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setDeleteError(data.error || 'Failed to delete account.');
        setDeletingAccount(false);
      } else {
        logout();
      }
    } catch (err) {
      setDeleteError('Failed to connect to server to delete account.');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Password Update Card */}
      <form onSubmit={handleUpdatePassword} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#059669]" />
          <span>Update Account Password</span>
        </h3>
        <p className="text-slate-500 font-sans">
          Update the password associated with <strong>{user.email || 'your account'}</strong>. This will update your credentials in the database immediately.
        </p>

        {passwordMsg && (
          <div className={`p-3 rounded-xl flex items-center gap-2 font-medium ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 mb-1 font-semibold">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
            />
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-semibold">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Re-enter new password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={updatingPassword}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updatingPassword ? 'Updating Password...' : 'Save New Password'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Delete Account */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold font-heading text-rose-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Account & Data</span>
            </h3>
            <p className="text-xs text-rose-700 mt-1 max-w-lg">
              Permanently delete your user account (<strong>{user.email}</strong>) and erase your registered credentials from the database. This action is permanent and requires confirmation.
            </p>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold font-heading text-slate-900">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete your account <strong>{user.email}</strong>? This will permanently remove your user credentials and data from the database.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {deletingAccount ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, businessProfile, updateBusinessProfile, user, setCheckoutModalPlan } = useApp();

  const [activeTab, setSettingsTab] = useState<'providers' | 'profile' | 'account' | 'team'>('providers');
  const [profileForm, setProfileForm] = useState(() => ({
    ...businessProfile,
    email: user.email || businessProfile.email || '',
  }));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [keyErrorMsg, setKeyErrorMsg] = useState<string | null>(null);
  const [validatingKeys, setValidatingKeys] = useState(false);
  const [upcomingNotice, setUpcomingNotice] = useState<string | null>(null);
  const settingsMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (savedSuccess || keyErrorMsg) {
      settingsMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [savedSuccess, keyErrorMsg]);

  useEffect(() => {
    if (businessProfile) {
      setProfileForm({
        ...businessProfile,
        email: user.email || businessProfile.email || '',
      });
    }
  }, [businessProfile, user.email]);

  // Key state overrides
  const [geminiKey, setGeminiKey] = useState(settings.providerKeys.gemini || '');
  const [openaiKey, setOpenaiKey] = useState(settings.providerKeys.openai || '');
  const [claudeKey, setClaudeKey] = useState(settings.providerKeys.claude || settings.providerKeys.anthropic || '');
  const [perplexityKey, setPerplexityKey] = useState(settings.providerKeys.perplexity || '');
  const [opusKey, setOpusKey] = useState(settings.providerKeys.opus || '');
  const [cursorKey, setCursorKey] = useState(settings.providerKeys.cursor || '');
  const [grokKey, setGrokKey] = useState(settings.providerKeys.grok || '');

  useEffect(() => {
    if (settings?.providerKeys) {
      if (settings.providerKeys.gemini !== undefined) setGeminiKey(settings.providerKeys.gemini);
      if (settings.providerKeys.openai !== undefined) setOpenaiKey(settings.providerKeys.openai);
      if (settings.providerKeys.claude !== undefined || settings.providerKeys.anthropic !== undefined) {
        setClaudeKey(settings.providerKeys.claude || settings.providerKeys.anthropic || '');
      }
      if (settings.providerKeys.perplexity !== undefined) setPerplexityKey(settings.providerKeys.perplexity);
      if (settings.providerKeys.opus !== undefined) setOpusKey(settings.providerKeys.opus);
      if (settings.providerKeys.cursor !== undefined) setCursorKey(settings.providerKeys.cursor);
      if (settings.providerKeys.grok !== undefined) setGrokKey(settings.providerKeys.grok);
    }
  }, [settings.providerKeys]);

  // Logo & Branding state for User Profile
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrlInput, setLogoUrlInput] = useState(businessProfile?.logoUrl || businessProfile?.logoConfig?.url || '');
  const [logoConfigState, setLogoConfigState] = useState<CustomLogoConfig>(() => {
    return (
      businessProfile?.logoConfig || {
        url: businessProfile?.logoUrl || '',
        format: 'svg',
        height: 48,
        alignment: 'left',
        padding: 'compact',
        bgStyle: 'transparent',
        fit: 'contain',
      }
    );
  });

  useEffect(() => {
    if (businessProfile?.logoConfig) {
      setLogoConfigState(businessProfile.logoConfig);
      setLogoUrlInput(businessProfile.logoConfig.url || '');
    } else if (businessProfile?.logoUrl) {
      setLogoConfigState((prev) => ({ ...prev, url: businessProfile.logoUrl || '' }));
      setLogoUrlInput(businessProfile.logoUrl || '');
    }
  }, [businessProfile?.logoConfig, businessProfile?.logoUrl]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        const format = file.name.endsWith('.svg') ? 'svg' : file.type.includes('png') ? 'png' : 'jpg';
        const updated: CustomLogoConfig = {
          ...logoConfigState,
          url: result,
          format,
          fileName: file.name,
        };
        setLogoConfigState(updated);
        setLogoUrlInput(result);
        updateBusinessProfile({ logoUrl: result, logoConfig: updated });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoUrl = () => {
    if (logoUrlInput.trim()) {
      const updated: CustomLogoConfig = { ...logoConfigState, url: logoUrlInput.trim() };
      setLogoConfigState(updated);
      updateBusinessProfile({ logoUrl: logoUrlInput.trim(), logoConfig: updated });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleUpdateLogoHeight = (height: number) => {
    const updated: CustomLogoConfig = { ...logoConfigState, height };
    setLogoConfigState(updated);
    updateBusinessProfile({ logoConfig: updated });
  };

  const handleUpdateLogoBg = (bgStyle: 'transparent' | 'light' | 'dark' | 'glass') => {
    const updated: CustomLogoConfig = { ...logoConfigState, bgStyle };
    setLogoConfigState(updated);
    updateBusinessProfile({ logoConfig: updated });
  };

  const handleClearLogo = () => {
    const cleared: CustomLogoConfig = {
      ...logoConfigState,
      url: '',
      fileName: undefined,
    };
    setLogoConfigState(cleared);
    setLogoUrlInput('');
    updateBusinessProfile({ logoUrl: '', logoConfig: cleared });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveProviders = async () => {
    setValidatingKeys(true);
    setKeyErrorMsg(null);
    setSavedSuccess(false);

    const res = await updateSettings({
      providerKeys: {
        gemini: geminiKey,
        openai: openaiKey,
        claude: claudeKey,
        perplexity: perplexityKey,
        opus: opusKey,
        cursor: cursorKey,
        grok: grokKey,
      },
    });

    setValidatingKeys(false);

    if (!res.success) {
      setKeyErrorMsg(res.error || 'Invalid API key provided. Key was not saved.');
    } else {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleUpcomingClick = (modelName: string) => {
    setUpcomingNotice(`🚀 ${modelName} is tagged as an Upcoming Feature! It will be enabled in a future release.`);
    setTimeout(() => setUpcomingNotice(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#059669]" />
          <span>Settings & AI Configurations</span>
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Switch active AI models, view upcoming model roadmap (Opus, Cursor, Grok), configure API keys, and update your business profile context.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSettingsTab('providers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'providers' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Model Providers</span>
        </button>

        <button
          onClick={() => setSettingsTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Business Profile Context</span>
        </button>

        <button
          onClick={() => setSettingsTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'team' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team Members & Invites</span>
        </button>

        <button
          onClick={() => setSettingsTab('account')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'account' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Account & Security</span>
        </button>
      </div>

      {/* TAB 1: AI PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          {/* Upcoming Notice Banner */}
          {upcomingNotice && (
            <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs animate-fade-in font-sans">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{upcomingNotice}</span>
            </div>
          )}

          {/* ACTIVE AI PROVIDERS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#059669]" />
                <span>Active AI Model Providers</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                4 Models Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACTIVE_PROVIDERS.map((prov) => {
                const isSelected = settings.activeProvider === prov.id;
                const isLockedForFree = user.planTier === 'free' && prov.id !== 'gemini';
                return (
                  <div
                    key={prov.id}
                    onClick={() => {
                      if (isLockedForFree) {
                        alert(`Accessing ${prov.name} requires a Pro Growth ($19/mo) or Agency Elite plan. Free Starter includes Gemini 3.6 Flash.`);
                        setCheckoutModalPlan('pro');
                        return;
                      }
                      updateSettings({ activeProvider: prov.id });
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-50 border-[#059669] text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 font-heading flex items-center gap-1.5">
                        <span>{prov.name}</span>
                        {isLockedForFree && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                            PRO
                          </span>
                        )}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/30 font-bold font-sans">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold font-sans">
                          {isLockedForFree ? 'Locked' : 'Select'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-sans">{prov.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPCOMING / COMING SOON AI MODELS */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 space-y-4 shadow-md border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-indigo-300" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold uppercase tracking-wider font-mono">
                    Roadmap Features
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Coming Soon</span>
                </div>
                <h3 className="text-base font-bold font-heading text-white mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Upcoming AI Models & Engines</span>
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-sm">
                Next-generation models tagged for upcoming release. These premium models will be unlocked in upcoming platform versions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {UPCOMING_PROVIDERS.map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => handleUpcomingClick(prov.name)}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-xl p-4 transition-all cursor-pointer group relative flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-mono">
                        {prov.category || 'Upcoming'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500 text-white shadow-xs font-sans flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>COMING SOON</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white font-heading group-hover:text-purple-300 transition-colors">
                        {prov.name}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-1">
                        {prov.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-purple-300">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>
                        {user.planTier === 'agency' ? 'Priority Waitlist Access' : 'Upcoming Feature Tag'}
                      </span>
                    </span>
                    <span className="text-slate-400 group-hover:text-white transition-colors">View Info →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Keys Configuration */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#059669]" />
              <span>Provider API Keys</span>
            </h3>

            <p className="text-xs text-slate-500 font-sans">
              Google Gemini is pre-configured via server runtime environment variables. You can optionally supply custom keys for OpenAI, Claude, or Perplexity below.
            </p>

            {user.planTier === 'free' && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-sans space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pro Plan Model Activation Notice</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  You are currently on the Free Starter plan (utilizing Gemini 3.6 Flash). You can paste custom keys below, but switching active models to OpenAI GPT-4o, Claude 3.5 Sonnet, or Perplexity requires activating a <strong>Pro Growth ($19/mo)</strong> or <strong>Agency Elite ($49/mo)</strong> plan.
                </p>
              </div>
            )}

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Google Gemini API Key (Default)</label>
                <input
                  type="password"
                  placeholder="Managed automatically via process.env.GEMINI_API_KEY"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">OpenAI API Key (Optional)</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Anthropic Claude API Key (Optional)</label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Perplexity API Key (Optional)</label>
                <input
                  type="password"
                  placeholder="pplx-..."
                  value={perplexityKey}
                  onChange={(e) => setPerplexityKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono">
                  Upcoming Model API Keys (Preview Reservations)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-slate-500 text-[11px] font-medium mb-1">Claude 3.7 Opus Key (Coming Soon)</label>
                    <input
                      type="password"
                      placeholder="Reserved for upcoming release"
                      value={opusKey}
                      onChange={(e) => setOpusKey(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2 text-slate-700 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] font-medium mb-1">Cursor Agent Key (Coming Soon)</label>
                    <input
                      type="password"
                      placeholder="Reserved for upcoming release"
                      value={cursorKey}
                      onChange={(e) => setCursorKey(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2 text-slate-700 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] font-medium mb-1">xAI Grok Key (Coming Soon)</label>
                    <input
                      type="password"
                      placeholder="Reserved for upcoming release"
                      value={grokKey}
                      onChange={(e) => setGrokKey(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2 text-slate-700 text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div ref={settingsMsgRef} className="flex-1">
                {savedSuccess && (
                  <span className="text-xs text-[#059669] font-bold flex items-center gap-1 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Validated & saved successfully!
                  </span>
                )}
                {keyErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{keyErrorMsg}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveProviders}
                disabled={validatingKeys}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:bg-slate-400 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer font-sans shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${validatingKeys ? 'animate-spin' : 'hidden'}`} />
                <Save className={`w-4 h-4 ${validatingKeys ? 'hidden' : 'block'}`} />
                <span>{validatingKeys ? 'Validating Keys...' : 'Save Provider Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS PROFILE CONTEXT */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Custom Brand Logo Customizer Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4.5 h-4.5 text-[#059669]" />
                  <span>Invoice & Client Document White-Label Logo</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Upload your custom business logo image or SVG to white-label client invoices, proposals, and reports.
                </p>
              </div>
              {user.planTier === 'pro' || user.planTier === 'elite' ? (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0">
                  White-Label Enabled ({user.planTier.toUpperCase()})
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shrink-0 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Pro & Elite Exclusive
                </span>
              )}
            </div>

            {user.planTier === 'pro' || user.planTier === 'elite' ? (
              <>
                <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-sans">
                  <strong>Note:</strong> This custom logo applies strictly to your business account&apos;s client documents (Invoices, Proposals, SEO Reports). It is independent and will never alter the main website platform navigation logo.
                </p>

                {/* Live Logo Preview & Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Live Preview Card */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Document Brand Preview</span>
                    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center min-h-[140px] text-center space-y-2">
                      <LocoraLogo isUserDoc={true} size={logoConfigState.height || 48} />
                      <div className="text-xs font-bold text-slate-800 font-heading">
                        {businessProfile.name || 'Your Business Name'}
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">
                        {logoConfigState.url ? (logoConfigState.fileName || 'Custom Logo Active') : 'Text Logo Active (Upload logo below)'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-sans">
                      <span>Height: {logoConfigState.height || 48}px</span>
                      <span>Style: {logoConfigState.bgStyle || 'transparent'}</span>
                      <span>Format: {logoConfigState.format?.toUpperCase() || 'SVG/PNG'}</span>
                    </div>
                  </div>

                  {/* Right Column: Upload Controls & Customization */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Upload Logo Image (PNG, SVG, JPG, WebP)</label>
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        onChange={handleLogoFileUpload}
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choose Logo File</span>
                        </button>

                        {logoConfigState.url && (
                          <button
                            type="button"
                            onClick={handleClearLogo}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer font-sans flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Logo</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Direct Image URL Option */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-600">Or Paste Image/Logo URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/my-logo.png"
                          value={logoUrlInput}
                          onChange={(e) => setLogoUrlInput(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyLogoUrl}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Logo Height Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Display Logo Height</span>
                        <span className="font-bold text-[#059669]">{logoConfigState.height || 48}px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="96"
                        value={logoConfigState.height || 48}
                        onChange={(e) => handleUpdateLogoHeight(Number(e.target.value))}
                        className="w-full accent-[#059669] cursor-pointer"
                      />
                    </div>

                    {/* Background Container Style */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Logo Container Style</label>
                      <div className="flex items-center gap-2">
                        {(['transparent', 'light', 'dark', 'glass'] as const).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => handleUpdateLogoBg(style)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize border transition-all cursor-pointer ${
                              logoConfigState.bgStyle === style
                                ? 'bg-emerald-50 border-[#059669] text-[#059669]'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-heading text-white">White-Label Customization Locked</h4>
                      <p className="text-xs text-slate-300 font-sans mt-1 max-w-xl leading-relaxed">
                        Free plan subscribers receive default verified Locora AI branding on client invoices, proposals, and SEO reports. Upgrade to <strong>Pro</strong> or <strong>Elite</strong> to upload your own custom business logo, replace default badges, and white-label all client deliverables.
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Tied directly to your user account — completely separate from platform site logo settings.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCheckoutModalPlan('pro')}
                    className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 shrink-0 transition-all cursor-pointer font-sans"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Upgrade to Pro / Elite</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs font-sans shadow-2xs">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#059669]" />
              <span>Business Profile & Identity</span>
            </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Business Name *</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Tagline</label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Industry</label>
              <input
                type="text"
                value={profileForm.industry}
                onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Website URL</label>
              <input
                type="text"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 mb-1 font-medium">Business Description (AI Prompt Context)</label>
              <textarea
                rows={3}
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Tone of Voice</label>
              <input
                type="text"
                value={profileForm.toneOfVoice}
                onChange={(e) => setProfileForm({ ...profileForm, toneOfVoice: e.target.value })}
                placeholder="e.g. Professional, Friendly, Authoritative"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Target Audience</label>
              <input
                type="text"
                value={profileForm.targetAudience}
                onChange={(e) => setProfileForm({ ...profileForm, targetAudience: e.target.value })}
                placeholder="e.g. Local home service clients, patients, consumers"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Phone</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 mb-1 font-medium">Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Default Currency</label>
              <input
                type="text"
                value={profileForm.currency}
                onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Default Tax Rate (%)</label>
              <input
                type="number"
                value={profileForm.taxRate}
                onChange={(e) => setProfileForm({ ...profileForm, taxRate: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-[#059669] font-bold flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" /> Profile Updated!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS */}
      {activeTab === 'team' && <TeamManagementSection />}

      {/* TAB 4: ACCOUNT SECURITY & DELETION */}
      {activeTab === 'account' && <AccountSecuritySection />}
    </div>
  );
};
