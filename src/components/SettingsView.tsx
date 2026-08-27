import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ACTIVE_PROVIDERS, UPCOMING_PROVIDERS, getProviderModelsWithFallback, getModelDisplayName } from '../services/aiProvider';
import { AIProviderId, CustomLogoConfig } from '../types';
import { TeamManagementSection } from './TeamManagementSection';
import { LocoraLogo } from './LocoraLogo';
import { SubscriptionInvoiceModal } from './SubscriptionInvoiceModal';
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
  CreditCard,
  Globe2,
  Globe,
  FileText,
  RotateCcw,
  Check,
  ArrowUpRight,
  Receipt,
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
  const { settings, updateSettings, businessProfile, updateBusinessProfile, user, updateUser, setCheckoutModalPlan, subscriptionInvoices } = useApp();

  const [activeTab, setSettingsTab] = useState<'providers' | 'profile' | 'account' | 'team' | 'billing'>('providers');
  const [profileForm, setProfileForm] = useState(() => ({
    ...businessProfile,
    email: user.email || businessProfile.email || '',
  }));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [keyErrorMsg, setKeyErrorMsg] = useState<string | null>(null);
  const [validatingKeys, setValidatingKeys] = useState(false);
  const [upcomingNotice, setUpcomingNotice] = useState<string | null>(null);
  const settingsMsgRef = useRef<HTMLDivElement>(null);

  // Billing & Auto-Renew state
  const [showCancelAutoRenewModal, setShowCancelAutoRenewModal] = useState(false);
  const [cancellingAutoRenew, setCancellingAutoRenew] = useState(false);
  const [resumingAutoRenew, setResumingAutoRenew] = useState(false);
  const [autoRenewFeedback, setAutoRenewFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<any | null>(null);

  const handleCancelAutoRenew = async () => {
    setCancellingAutoRenew(true);
    setAutoRenewFeedback(null);
    try {
      const res = await fetch('/api/user/cancel-auto-renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAutoRenewFeedback({ type: 'error', msg: data.error || 'Failed to cancel auto-renewal.' });
      } else {
        updateUser({
          autoRenew: false,
          cancelAtPeriodEnd: true,
        });
        const formattedDate = user.nextBillingDate
          ? new Date(user.nextBillingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
          : 'the end of your current cycle';
        setAutoRenewFeedback({
          type: 'success',
          msg: `Auto-renewal cancelled successfully. You retain full access to ${user.planTier.toUpperCase()} until ${formattedDate}. You will not be billed again.`,
        });
        setShowCancelAutoRenewModal(false);
      }
    } catch (err: any) {
      setAutoRenewFeedback({ type: 'error', msg: 'Network error while requesting auto-renew cancellation.' });
    } finally {
      setCancellingAutoRenew(false);
    }
  };

  const handleResumeAutoRenew = async () => {
    setResumingAutoRenew(true);
    setAutoRenewFeedback(null);
    try {
      const res = await fetch('/api/user/resume-auto-renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAutoRenewFeedback({ type: 'error', msg: data.error || 'Failed to resume auto-renewal.' });
      } else {
        updateUser({
          autoRenew: true,
          cancelAtPeriodEnd: false,
        });
        setAutoRenewFeedback({
          type: 'success',
          msg: 'Auto-renewal resumed successfully! Your subscription will continue seamlessly.',
        });
      }
    } catch (err: any) {
      setAutoRenewFeedback({ type: 'error', msg: 'Network error while resuming auto-renewal.' });
    } finally {
      setResumingAutoRenew(false);
    }
  };

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
  const [geminiKey, setGeminiKey] = useState(settings.providerKeys?.gemini || '');
  const [openaiKey, setOpenaiKey] = useState(settings.providerKeys?.openai || '');
  const [claudeKey, setClaudeKey] = useState(settings.providerKeys?.claude || settings.providerKeys?.anthropic || '');
  const [perplexityKey, setPerplexityKey] = useState(settings.providerKeys?.perplexity || '');
  const [deepseekKey, setDeepseekKey] = useState(settings.providerKeys?.deepseek || '');
  const [groqKey, setGroqKey] = useState(settings.providerKeys?.groq || '');
  const [opusKey, setOpusKey] = useState(settings.providerKeys?.opus || '');
  const [cursorKey, setCursorKey] = useState(settings.providerKeys?.cursor || '');
  const [grokKey, setGrokKey] = useState(settings.providerKeys?.grok || '');
  const [googleMapsKey, setGoogleMapsKey] = useState(settings.providerKeys?.googleMaps || settings.providerKeys?.google_maps || '');
  const [pageSpeedKey, setPageSpeedKey] = useState(settings.providerKeys?.pageSpeed || settings.providerKeys?.pagespeed || '');
  const [hunterKey, setHunterKey] = useState(settings.providerKeys?.hunter || '');
  const [apolloKey, setApolloKey] = useState(settings.providerKeys?.apollo || '');

  // Provider model selections
  const [providerModels, setProviderModels] = useState<Record<string, string>>(() => ({
    gemini: settings.providerModels?.gemini || 'gemini-3.6-flash',
    openai: settings.providerModels?.openai || 'gpt-5.6-sol',
    claude: settings.providerModels?.claude || 'claude-3-7-sonnet-20250219',
    perplexity: settings.providerModels?.perplexity || 'sonar-pro',
    deepseek: settings.providerModels?.deepseek || 'deepseek-chat',
    groq: settings.providerModels?.groq || 'llama-3.3-70b-versatile',
  }));

  // Dynamic discovered model variants per provider based on API key capabilities
  const [discoveredModels, setDiscoveredModels] = useState<Record<string, Array<{ id: string; name: string; description?: string; badge?: string; isAutoSelected?: boolean }>>>(
    () => settings.detectedProviderModels || {}
  );
  const [detectingProvider, setDetectingProvider] = useState<string | null>(null);

  // Per-key validation tester state
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [keyTestResults, setKeyTestResults] = useState<Record<string, { valid?: boolean; message?: string; warning?: string; error?: string }>>({});

  useEffect(() => {
    if (settings?.providerKeys) {
      if (settings.providerKeys.gemini !== undefined) setGeminiKey(settings.providerKeys.gemini);
      if (settings.providerKeys.openai !== undefined) setOpenaiKey(settings.providerKeys.openai);
      if (settings.providerKeys.claude !== undefined || settings.providerKeys.anthropic !== undefined) {
        setClaudeKey(settings.providerKeys.claude || settings.providerKeys.anthropic || '');
      }
      if (settings.providerKeys.perplexity !== undefined) setPerplexityKey(settings.providerKeys.perplexity);
      if (settings.providerKeys.deepseek !== undefined) setDeepseekKey(settings.providerKeys.deepseek);
      if (settings.providerKeys.groq !== undefined) setGroqKey(settings.providerKeys.groq);
      if (settings.providerKeys.opus !== undefined) setOpusKey(settings.providerKeys.opus);
      if (settings.providerKeys.cursor !== undefined) setCursorKey(settings.providerKeys.cursor);
      if (settings.providerKeys.grok !== undefined) setGrokKey(settings.providerKeys.grok);
      if (settings.providerKeys.googleMaps !== undefined || settings.providerKeys.google_maps !== undefined) {
        setGoogleMapsKey(settings.providerKeys.googleMaps || settings.providerKeys.google_maps || '');
      }
      if (settings.providerKeys.pageSpeed !== undefined || settings.providerKeys.pagespeed !== undefined) {
        setPageSpeedKey(settings.providerKeys.pageSpeed || settings.providerKeys.pagespeed || '');
      }
      if (settings.providerKeys.hunter !== undefined) setHunterKey(settings.providerKeys.hunter);
      if (settings.providerKeys.apollo !== undefined) setApolloKey(settings.providerKeys.apollo);
    }
    if (settings?.providerModels) {
      setProviderModels((prev) => ({ ...prev, ...settings.providerModels }));
    }
    if (settings?.detectedProviderModels) {
      setDiscoveredModels((prev) => ({ ...prev, ...settings.detectedProviderModels }));
    }
  }, [settings.providerKeys, settings.providerModels, settings.detectedProviderModels]);

  // Dynamic AI Model Discovery according to API Key usage
  const handleDetectModels = async (provider: string, apiKeyOverride?: string) => {
    setDetectingProvider(provider);
    try {
      const keyToUse = apiKeyOverride !== undefined ? apiKeyOverride : (
        provider === 'gemini' ? geminiKey :
        provider === 'openai' ? openaiKey :
        provider === 'claude' ? claudeKey :
        provider === 'perplexity' ? perplexityKey :
        provider === 'deepseek' ? deepseekKey :
        provider === 'groq' ? groqKey : ''
      );
      const res = await fetch('/api/ai/detect-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: (keyToUse || '').trim(),
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid && Array.isArray(data.accessibleModels)) {
        setDiscoveredModels((prev) => ({
          ...prev,
          [provider]: data.accessibleModels,
        }));
        if (data.detectedModel) {
          setProviderModels((prev) => ({
            ...prev,
            [provider]: data.detectedModel,
          }));
          if (settings.activeProvider === provider) {
            updateSettings({
              activeModelVersion: data.detectedModel,
              providerModels: { ...(settings.providerModels || providerModels), [provider]: data.detectedModel },
              detectedProviderModels: {
                ...(settings.detectedProviderModels || {}),
                [provider]: data.accessibleModels,
              },
            });
          }
        }
        return data;
      }
    } catch (err) {
      console.warn('Model discovery error:', err);
    } finally {
      setDetectingProvider(null);
    }
  };

  // Initial automatic scan for the active provider
  useEffect(() => {
    if (settings.activeProvider) {
      handleDetectModels(settings.activeProvider);
    }
  }, [settings.activeProvider]);

  const handleTestKey = async (provider: string, rawKey: string) => {
    if (!rawKey || !rawKey.trim()) {
      setKeyTestResults((prev) => ({
        ...prev,
        [provider]: { error: 'Please enter an API key to test validation.' },
      }));
      return;
    }
    setTestingProvider(provider);
    setKeyTestResults((prev) => ({ ...prev, [provider]: undefined as any }));

    try {
      const res = await fetch('/api/ai/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: rawKey.trim(),
          modelVersion: providerModels[provider],
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        if (Array.isArray(data.accessibleModels) && data.accessibleModels.length > 0) {
          setDiscoveredModels((prev) => ({
            ...prev,
            [provider]: data.accessibleModels,
          }));
        }
        if (data.model) {
          setProviderModels((prev) => ({
            ...prev,
            [provider]: data.model,
          }));
          if (settings.activeProvider === provider) {
            updateSettings({
              activeModelVersion: data.model,
              providerModels: { ...(settings.providerModels || providerModels), [provider]: data.model },
              detectedProviderModels: {
                ...(settings.detectedProviderModels || {}),
                [provider]: data.accessibleModels || [],
              },
            });
          }
        }
        setKeyTestResults((prev) => ({
          ...prev,
          [provider]: {
            valid: true,
            message: data.message || `API key verified! Auto-selected model variant: ${data.model}`,
            warning: data.warning,
          },
        }));
      } else {
        setKeyTestResults((prev) => ({
          ...prev,
          [provider]: { valid: false, error: data.error || 'API Key validation failed.' },
        }));
      }
    } catch (err: any) {
      setKeyTestResults((prev) => ({
        ...prev,
        [provider]: { valid: false, error: 'Connection error while testing key.' },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

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

    const activeModel = providerModels[settings.activeProvider] || 'gemini-2.5-flash';

    const res = await updateSettings({
      providerKeys: {
        gemini: geminiKey,
        openai: openaiKey,
        claude: claudeKey,
        perplexity: perplexityKey,
        deepseek: deepseekKey,
        groq: groqKey,
        opus: opusKey,
        cursor: cursorKey,
        grok: grokKey,
        googleMaps: googleMapsKey,
        google_maps: googleMapsKey,
        pageSpeed: pageSpeedKey,
        pagespeed: pageSpeedKey,
        hunter: hunterKey,
        apollo: apolloKey,
      },
      providerModels,
      activeModelVersion: activeModel,
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
          Switch active AI models, choose exact model versions, manage private BYOK API keys, and customize your business profile.
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
          onClick={() => setSettingsTab('billing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'billing' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Subscription & Billing</span>
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
          {/* User Isolation Security Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 font-sans shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900 font-heading">
                  Private User Key Isolation & System Default Quota
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  API keys entered here are stored strictly in your personal account (<strong>{user.email || 'Current User'}</strong>). They are never shared or visible to other users. Key fields remain empty by default, routing through the system starter plan / pay-as-you-go quota until you provide your own personal key.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
              <span className="px-2.5 py-1 bg-white text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold font-mono">
                {user.email || 'Isolated User'}
              </span>
            </div>
          </div>

          {/* Region Policy Resilient Notice */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-3 text-xs text-blue-950 font-sans">
            <Globe2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-blue-900">Automatic Region Resilience & Location Support</span>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                If cloud AI providers return a region error (e.g. <em>User location is not supported</em>), Locora’s multi-region intelligence engine synthesizes your request with zero downtime.
              </p>
            </div>
          </div>

          {/* Upcoming Notice Banner */}
          {upcomingNotice && (
            <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs animate-fade-in font-sans">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{upcomingNotice}</span>
            </div>
          )}

          {/* ACTIVE AI PROVIDERS & MODEL VERSION SELECTION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#059669]" />
                  <span>Active AI Engines & Model Versions</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Select which AI engine powers your dashboard and choose the specific model version for optimal reasoning and speed.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono shrink-0">
                {ACTIVE_PROVIDERS.length} Providers Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACTIVE_PROVIDERS.map((prov) => {
                const isSelected = settings.activeProvider === prov.id;
                const isLockedForFree = user.planTier === 'free' && prov.id !== 'groq';
                const accessibleVariants = getProviderModelsWithFallback(prov.id, discoveredModels);
                const currentSubModel = providerModels[prov.id] || accessibleVariants[0]?.id || prov.model || '';

                return (
                  <div
                    key={prov.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/40 border-[#059669] text-slate-900 shadow-2xs ring-1 ring-[#059669]/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => {
                            if (isLockedForFree) {
                              alert(`Accessing ${prov.name} requires a Pro Growth ($19/mo) or Agency Elite plan. Free Starter includes Groq (Meta Llama 3.3 70B & 3.1 8B).`);
                              setCheckoutModalPlan('pro');
                              return;
                            }
                            updateSettings({
                              activeProvider: prov.id,
                              activeModelVersion: currentSubModel,
                            });
                          }}
                          className="font-bold text-sm text-slate-900 font-heading flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{prov.name}</span>
                          {isLockedForFree && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                              PRO
                            </span>
                          )}
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#059669] text-white font-bold font-sans flex items-center gap-1 shadow-2xs">
                            <Check className="w-3 h-3" /> ACTIVE
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (isLockedForFree) {
                                setCheckoutModalPlan('pro');
                                return;
                              }
                              updateSettings({
                                activeProvider: prov.id,
                                activeModelVersion: currentSubModel,
                              });
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-300 hover:border-slate-400 text-slate-600 font-semibold cursor-pointer"
                          >
                            {isLockedForFree ? 'Unlock in Pro' : 'Set as Active'}
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-sans leading-relaxed">
                        {prov.description}
                      </p>

                      {/* Dynamic Model Version Dropdown (Auto-Selected & Locked according to API Key) */}
                      {accessibleVariants && accessibleVariants.length > 0 && (
                        <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <span>Model Variant:</span>
                              <span className="text-[10px] font-mono font-semibold bg-emerald-100/90 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300/80">
                                Auto-Selected
                              </span>
                            </label>
                            <span
                              className="text-[10px] text-slate-500 font-mono flex items-center gap-1"
                              title="Dynamic model detection automatically discovers and locks the optimal compatible variant for this key."
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Key-Locked</span>
                            </span>
                          </div>

                          <div className="relative">
                            <select
                              value={currentSubModel}
                              disabled={true}
                              title="Model version is dynamically detected & auto-configured based on your API key capabilities. Manual override is locked to prevent incompatibility."
                              className="w-full bg-slate-100/90 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-semibold cursor-not-allowed opacity-90 select-none pr-8"
                            >
                              {accessibleVariants.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} {m.badge ? `(${m.badge})` : ''} {m.id === currentSubModel ? '★ Active' : ''}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1 text-slate-600 truncate max-w-[210px]">
                              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{accessibleVariants.find((m) => m.id === currentSubModel)?.description || 'Dynamically verified for key usage'}</span>
                            </span>
                            <span className="font-mono text-slate-400 font-medium shrink-0">
                              {accessibleVariants.length} variant{accessibleVariants.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Category: {prov.category}</span>
                      <span className="font-semibold text-slate-600">
                        {prov.statusTag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PER-USER API KEY MANAGER WITH LIVE VALIDATION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#059669]" />
                  <span>Bring Your Own Keys (BYOK) & Validation</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Optionally paste your personal API keys for each provider. Leaving fields empty will use the platform starter plan / pay-as-you-go quota.
                </p>
              </div>
            </div>

            {user.planTier === 'free' && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-sans space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pro Plan Model Activation Notice</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  You are currently on the Free Starter plan (powered by <strong>Groq Ultra-Fast LPU & Meta Llama 3.3 / 3.1</strong>). You can paste and test custom keys below, while switching active platform generation to OpenAI GPT-5.6/4o, Claude 3.7 Sonnet, DeepSeek, or Gemini is available with a <strong>Pro Growth ($19/mo)</strong> or <strong>Agency Elite ($49/mo)</strong> plan.
                </p>
              </div>
            )}

            <div className="space-y-4 text-xs font-sans">
              {/* 1. Google Gemini */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="block text-slate-800 font-bold">
                    Google Gemini API Key
                  </label>
                  <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Selected: <strong>{providerModels.gemini || 'gemini-3.6-flash'}</strong></span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    placeholder="Empty = Uses system starter quota (AI Studio Server)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#059669]"
                  />
                  <button
                    type="button"
                    disabled={testingProvider === 'gemini'}
                    onClick={() => handleTestKey('gemini', geminiKey)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {testingProvider === 'gemini' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{testingProvider === 'gemini' ? 'Detecting Models...' : 'Test & Auto-Select Model'}</span>
                  </button>
                </div>
                {keyTestResults.gemini && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${keyTestResults.gemini.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {keyTestResults.gemini.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{keyTestResults.gemini.valid ? (keyTestResults.gemini.message || 'Key verified successfully!') : keyTestResults.gemini.error}</span>
                  </div>
                )}
              </div>

              {/* 2. OpenAI */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="block text-slate-800 font-bold">
                    OpenAI API Key (GPT-5.6 / GPT-4o)
                  </label>
                  <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Selected: <strong>{providerModels.openai || 'gpt-4o'}</strong></span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    placeholder="sk-... (Empty = Uses system quota)"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#059669]"
                  />
                  <button
                    type="button"
                    disabled={testingProvider === 'openai'}
                    onClick={() => handleTestKey('openai', openaiKey)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {testingProvider === 'openai' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{testingProvider === 'openai' ? 'Detecting Models...' : 'Test & Auto-Select Model'}</span>
                  </button>
                </div>
                {keyTestResults.openai && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${keyTestResults.openai.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {keyTestResults.openai.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{keyTestResults.openai.valid ? (keyTestResults.openai.message || 'Key verified successfully!') : keyTestResults.openai.error}</span>
                  </div>
                )}
              </div>

              {/* 3. Anthropic Claude */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="block text-slate-800 font-bold">
                    Anthropic Claude API Key (Claude 3.7 Sonnet / Opus / Haiku)
                  </label>
                  <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Selected: <strong>{providerModels.claude || 'claude-3-7-sonnet-20250219'}</strong></span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    placeholder="sk-ant-... (Empty = Uses system quota)"
                    value={claudeKey}
                    onChange={(e) => setClaudeKey(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#059669]"
                  />
                  <button
                    type="button"
                    disabled={testingProvider === 'claude'}
                    onClick={() => handleTestKey('claude', claudeKey)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {testingProvider === 'claude' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{testingProvider === 'claude' ? 'Detecting Models...' : 'Test & Auto-Select Model'}</span>
                  </button>
                </div>
                {keyTestResults.claude && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${keyTestResults.claude.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {keyTestResults.claude.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{keyTestResults.claude.valid ? (keyTestResults.claude.message || 'Key verified successfully!') : keyTestResults.claude.error}</span>
                  </div>
                )}
              </div>

              {/* 4. Perplexity AI */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="block text-slate-800 font-bold">
                    Perplexity API Key (Sonar Pro Search)
                  </label>
                  <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Selected: <strong>{providerModels.perplexity || 'sonar-pro'}</strong></span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    placeholder="pplx-... (Empty = Uses system quota)"
                    value={perplexityKey}
                    onChange={(e) => setPerplexityKey(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#059669]"
                  />
                  <button
                    type="button"
                    disabled={testingProvider === 'perplexity'}
                    onClick={() => handleTestKey('perplexity', perplexityKey)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {testingProvider === 'perplexity' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{testingProvider === 'perplexity' ? 'Detecting Models...' : 'Test & Auto-Select Model'}</span>
                  </button>
                </div>
                {keyTestResults.perplexity && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${keyTestResults.perplexity.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {keyTestResults.perplexity.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{keyTestResults.perplexity.valid ? (keyTestResults.perplexity.message || 'Key verified successfully!') : keyTestResults.perplexity.error}</span>
                  </div>
                )}
              </div>

              {/* 5. DeepSeek */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="block text-slate-800 font-bold">
                    DeepSeek API Key (DeepSeek-V3 / R1)
                  </label>
                  <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Selected: <strong>{providerModels.deepseek || 'deepseek-chat'}</strong></span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    placeholder="sk-... (Empty = Uses system quota)"
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#059669]"
                  />
                  <button
                    type="button"
                    disabled={testingProvider === 'deepseek'}
                    onClick={() => handleTestKey('deepseek', deepseekKey)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {testingProvider === 'deepseek' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{testingProvider === 'deepseek' ? 'Detecting Models...' : 'Test & Auto-Select Model'}</span>
                  </button>
                </div>
                {keyTestResults.deepseek && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${keyTestResults.deepseek.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {keyTestResults.deepseek.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{keyTestResults.deepseek.valid ? (keyTestResults.deepseek.message || 'Key verified successfully!') : keyTestResults.deepseek.error}</span>
                  </div>
                )}
              </div>

              {/* 6. Groq */}
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="block text-slate-800 font-bold">
                    Groq API Key (Meta Llama 3.3 70B & 3.1)
                  </label>
                  <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Auto-Selected: <strong>{providerModels.groq || 'llama-3.3-70b-versatile'}</strong></span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    placeholder="gsk_... (Empty = Uses system quota)"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#059669]"
                  />
                  <button
                    type="button"
                    disabled={testingProvider === 'groq'}
                    onClick={() => handleTestKey('groq', groqKey)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {testingProvider === 'groq' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{testingProvider === 'groq' ? 'Detecting Models...' : 'Test & Auto-Select Model'}</span>
                  </button>
                </div>
                {keyTestResults.groq && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${keyTestResults.groq.valid ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    {keyTestResults.groq.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{keyTestResults.groq.valid ? (keyTestResults.groq.message || 'Key verified successfully!') : keyTestResults.groq.error}</span>
                  </div>
                )}
              </div>

              {/* Upcoming Roadmap Reservations */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-mono">
                  Upcoming Model API Keys (Roadmap Reservations)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-slate-500 text-[11px] font-medium mb-1">xAI Grok Key (Grok 3 Reasoning)</label>
                    <input
                      type="password"
                      placeholder="Reserved for upcoming release"
                      value={grokKey}
                      onChange={(e) => setGrokKey(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2 text-slate-700 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] font-medium mb-1">Cursor Agent Key (v2 Protocol)</label>
                    <input
                      type="password"
                      placeholder="Reserved for upcoming release"
                      value={cursorKey}
                      onChange={(e) => setCursorKey(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2 text-slate-700 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] font-medium mb-1">Meta Llama 4 Key (Frontier 400B+)</label>
                    <input
                      type="password"
                      placeholder="Reserved for upcoming release"
                      value={opusKey}
                      onChange={(e) => setOpusKey(e.target.value)}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2 text-slate-700 text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
              <div ref={settingsMsgRef} className="flex-1">
                {savedSuccess && (
                  <span className="text-xs text-[#059669] font-bold flex items-center gap-1 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" /> All provider settings and keys saved securely!
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
                className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:bg-slate-400 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer font-sans shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${validatingKeys ? 'animate-spin' : 'hidden'}`} />
                <Save className={`w-4 h-4 ${validatingKeys ? 'hidden' : 'block'}`} />
                <span>{validatingKeys ? 'Saving & Validating...' : 'Save Settings & Keys'}</span>
              </button>
            </div>
          </div>

          {/* UPCOMING / COMING SOON AI MODELS BANNER */}
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

      {/* TAB 4: SUBSCRIPTION & BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Feedback message */}
          {autoRenewFeedback && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                autoRenewFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {autoRenewFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{autoRenewFeedback.msg}</span>
              </div>
              <button
                onClick={() => setAutoRenewFeedback(null)}
                className="text-xs opacity-60 hover:opacity-100 font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Current Active Plan Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Active Subscription Tier
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-xl font-extrabold text-slate-900 font-heading capitalize">
                    {user.planTier === 'free'
                      ? 'Free Starter Plan'
                      : user.planTier === 'pro'
                      ? 'Pro Growth Plan'
                      : 'Agency Elite Plan'}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      user.planTier === 'free'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : user.cancelAtPeriodEnd || user.autoRenew === false
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {user.planTier === 'free'
                      ? 'FREE TIER'
                      : user.cancelAtPeriodEnd || user.autoRenew === false
                      ? 'CANCELLING AT PERIOD END'
                      : 'ACTIVE'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  {user.planTier === 'free'
                    ? '10 AI Copilot starter credits. Upgrade to unlock all premium AI engines (OpenAI, Claude, Perplexity) and high-volume limits.'
                    : user.planTier === 'pro'
                    ? '$19.00 / month ($180 / year) • 250 AI Copilot credits monthly • All AI models unlocked'
                    : '$49.00 / month ($468 / year) • Unlimited AI Copilot credits • Priority dedicated AI engines & white-labeling'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {user.planTier === 'free' ? (
                  <button
                    onClick={() => setCheckoutModalPlan('pro')}
                    className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade to Pro ($19/mo)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCheckoutModalPlan('agency')}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Change / Switch Plan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Plan Metrics & Renewal Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  AI Credits Balance
                </span>
                <p className="text-lg font-extrabold text-slate-900 font-mono">
                  {user.planTier === 'agency'
                    ? 'Unlimited'
                    : `${Math.max(0, (user.planTier === 'pro' ? 250 : 10) - (user.creditsUsed || 0))} Credits`}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user.creditsUsed || 0} credits used this billing cycle
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Billing Cycle & Renewal
                </span>
                <p className="text-lg font-extrabold text-slate-900 font-mono">
                  {user.nextBillingDate
                    ? new Date(user.nextBillingDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A (Free)'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user.cancelAtPeriodEnd || user.autoRenew === false
                    ? 'Access remains active until this date'
                    : 'Next automatic renewal scheduled'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Auto-Renewal Status
                </span>
                <p className="text-lg font-extrabold font-mono flex items-center gap-1.5">
                  {user.planTier === 'free' ? (
                    <span className="text-slate-600">Free Tier</span>
                  ) : user.cancelAtPeriodEnd || user.autoRenew === false ? (
                    <span className="text-amber-600">Off (Ends Period)</span>
                  ) : (
                    <span className="text-emerald-600">Enabled</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user.autoRenew === false
                    ? 'Will not renew upon cycle end'
                    : 'Renews automatically each cycle'}
                </p>
              </div>
            </div>

            {/* Auto-Renewal Management Notice & Control */}
            {user.planTier !== 'free' && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-heading flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Subscription Auto-Renewal Setting</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {user.cancelAtPeriodEnd || user.autoRenew === false
                        ? `Auto-renewal is currently disabled. Your access remains active until ${
                            user.nextBillingDate
                              ? new Date(user.nextBillingDate).toLocaleDateString()
                              : 'your next renewal date'
                          }. You can resume anytime.`
                        : 'Your subscription is set to renew automatically. If cancelled, your benefits stay active until the next renewal date.'}
                    </p>
                  </div>

                  <div>
                    {user.cancelAtPeriodEnd || user.autoRenew === false ? (
                      <button
                        onClick={handleResumeAutoRenew}
                        disabled={resumingAutoRenew}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${resumingAutoRenew ? 'animate-spin' : ''}`} />
                        <span>{resumingAutoRenew ? 'Resuming...' : 'Re-enable Auto-Renewal'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCancelAutoRenewModal(true)}
                        className="px-3.5 py-2 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-300 hover:border-rose-300 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Cancel Auto-Renewal</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Important Policy Note */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cancellation Policy:</strong> When you cancel auto-renewal, your cancellation applies from your <strong>next renewal date</strong>. You will retain all Pro/Agency privileges and Copilot credits throughout your active paid period.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods & Invoices Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#059669]" />
                  <span>Billing History & Invoices</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and download receipts for all your processed card and Payoneer subscription transactions.
                </p>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-sans font-semibold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Plan Tier</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {subscriptionInvoices && subscriptionInvoices.length > 0 ? (
                    subscriptionInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {inv.id}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-[10px] text-slate-800 border border-slate-200">
                            {inv.planTier}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ${inv.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {inv.paymentMethod?.brand ? (
                            <span className="flex items-center gap-1.5 font-mono text-[11px]">
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              <span>{inv.paymentMethod.brand} •••• {inv.paymentMethod.last4}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-orange-700 font-semibold text-[11px]">
                              <Globe2 className="w-3.5 h-3.5 text-orange-600" />
                              <span>Payoneer</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Paid</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedInvoiceForView(inv)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No billing history or invoices found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNT SECURITY & DELETION */}
      {activeTab === 'account' && <AccountSecuritySection />}

      {/* MODAL: CANCEL AUTO-RENEW CONFIRMATION */}
      {showCancelAutoRenewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 font-heading text-base">
                  Cancel Subscription Auto-Renewal?
                </h3>
                <p className="text-xs text-slate-500">
                  Effective from your next renewal date
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                Here is what happens when you cancel:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                <li>
                  Your subscription will <strong>remain 100% active</strong> until{' '}
                  <strong className="text-slate-900">
                    {user.nextBillingDate
                      ? new Date(user.nextBillingDate).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'the end of your current cycle'}
                  </strong>.
                </li>
                <li>
                  You retain full access to all {user.planTier.toUpperCase()} features and Copilot AI credits until that date.
                </li>
                <li>
                  No additional charges will occur on your card or Payoneer account.
                </li>
                <li>
                  You can easily re-enable auto-renewal anytime before the cycle ends.
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelAutoRenewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Keep Subscription Active
              </button>

              <button
                type="button"
                onClick={handleCancelAutoRenew}
                disabled={cancellingAutoRenew}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{cancellingAutoRenew ? 'Cancelling...' : 'Confirm Cancellation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL SUBSCRIPTION INVOICE & RECEIPT VIEWER */}
      {selectedInvoiceForView && (
        <SubscriptionInvoiceModal
          invoice={selectedInvoiceForView}
          user={user}
          onClose={() => setSelectedInvoiceForView(null)}
        />
      )}
    </div>
  );
};
