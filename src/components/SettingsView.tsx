import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CustomLogoConfig } from '../types';
import { TeamManagementSection } from './TeamManagementSection';
import { IntegrationsSettingsTab } from './IntegrationsSettingsTab';
import { LocoraLogo } from './LocoraLogo';
import { SubscriptionInvoiceModal } from './SubscriptionInvoiceModal';
import { GoogleAddressAutocomplete, LocationData } from './GoogleAddressAutocomplete';
import { CountryAutocomplete } from './CountryAutocomplete';
import { getDirectorySiteUrl, getDirectoryBusinessUrl } from '../utils/domain';
import { DirectoryPublishingCard } from './DirectoryPublishingCard';
import { businessService } from '../services/businessService';
import { AiEngineHealthCard } from './AiEngineHealthCard';
import { creditsForPlan, remainingCredits } from '../lib/credits';
import { BusinessesManagementSection } from './BusinessesManagementSection';
import {
  Settings,
  Cpu,
  Building,
  Building2,
  Brain,
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
  BarChart3,
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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('locora_active_business_id');
          localStorage.removeItem('locora_business_profile');
          localStorage.removeItem('locora_user_storage');
          localStorage.removeItem('locora_workspace_data');
        }
        setShowDeleteModal(false);
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
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto my-auto relative">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>

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

interface SettingsViewProps {
  initialTab?: 'businesses' | 'profile' | 'integrations' | 'account' | 'team' | 'billing';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'businesses' }) => {
  const { settings, updateSettings, businessProfile, updateBusinessProfile, activeBusiness, updateActiveBusiness, user, updateUser, setCheckoutModalPlan, subscriptionInvoices } = useApp();

  const isAdmin = Boolean(
    user.isAuthenticated && (
      user.role === 'admin' ||
      user.role === 'owner' ||
      user.email === 'imtiazbaloch3322@gmail.com' ||
      user.email === 'support@locoraai.com'
    )
  );

  const isWhiteLabelUnlocked = Boolean(
    isAdmin ||
    ['pro', 'agency', 'elite'].includes((user.planTier || '').toLowerCase())
  );

  const [activeTab, setSettingsTab] = useState<'businesses' | 'profile' | 'integrations' | 'account' | 'team' | 'billing'>(initialTab);
  const [profileSubTab, setProfileSubTab] = useState<'details' | 'directory' | 'logo'>('details');
  const [profileForm, setProfileForm] = useState(() => ({
    ...businessProfile,
    email: user.email || businessProfile.email || '',
    services: businessProfile.services || [],
    targetLocations: businessProfile.targetLocations || [],
    primaryCompetitors: businessProfile.primaryCompetitors || [],
    currentOffers: businessProfile.currentOffers || [],
    businessGoals: businessProfile.businessGoals || [],
  }));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [publishingDirectory, setPublishingDirectory] = useState(false);
  const [directoryFeedback, setDirectoryFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionFeedback, setDescriptionFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleAutoGenerateDescription = async () => {
    if (!activeBusiness?.id || isGeneratingDescription) return;
    setIsGeneratingDescription(true);
    setDescriptionFeedback(null);
    try {
      const result = await businessService.generateDescription(activeBusiness.id);
      const draft = (result.draft || '').trim();
      if (!draft) throw new Error('Empty draft returned');
      setProfileForm((prev) => ({ ...prev, description: draft }));
      setDescriptionFeedback({ type: 'success', msg: '✦ Description auto-generated from your website. Review it, then save.' });
    } catch (err: any) {
      const msg = err?.code === 'CREDITS_EXHAUSTED'
        ? 'AI credits exhausted — top up credits to auto-generate the description.'
        : err?.code === 'NOT_ENOUGH_FACTS'
          ? 'Could not detect enough verified facts — add your website above and try again.'
          : 'Auto-generation is unavailable right now. Please try again.';
      setDescriptionFeedback({ type: 'error', msg });
    } finally {
      setIsGeneratingDescription(false);
    }
  };
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
    if (savedSuccess) {
      settingsMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [savedSuccess]);

  useEffect(() => {
    if (businessProfile) {
      setProfileForm({
        ...businessProfile,
        email: user.email || businessProfile.email || '',
        services: businessProfile.services || [],
        targetLocations: businessProfile.targetLocations || [],
        primaryCompetitors: businessProfile.primaryCompetitors || [],
        currentOffers: businessProfile.currentOffers || [],
        businessGoals: businessProfile.businessGoals || [],
      });
    }
  }, [businessProfile, user.email]);

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

  const handleLocationSelect = (loc: LocationData) => {
    setProfileForm((prev) => ({
      ...prev,
      address: loc.address || prev.address,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      country: loc.country || prev.country,
      zip: loc.zip || prev.zip,
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(profileForm);
    if (updateActiveBusiness) {
      updateActiveBusiness({
        name: profileForm.name,
        category: profileForm.industry,
        website: profileForm.website,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        zip: profileForm.zip,
        country: profileForm.country,
        phone: profileForm.phone,
        email: profileForm.email,
        description: profileForm.description,
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleDirectory = async (publish: boolean) => {
    setProfileForm((prev) => ({ ...prev, isPublishedInDirectory: publish }));
    setPublishingDirectory(true);
    setDirectoryFeedback(null);
    try {
      const endpoint = publish ? '/api/directory/publish' : '/api/directory/unpublish';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateBusinessProfile({ isPublishedInDirectory: publish });
        setDirectoryFeedback({
          type: 'success',
          msg: publish
            ? 'Business listing successfully published live to the public directory!'
            : 'Business listing unpublished from public directory.',
        });
        setTimeout(() => setDirectoryFeedback(null), 4000);
      } else {
        setDirectoryFeedback({ type: 'error', msg: data.error || 'Failed to update directory status.' });
      }
    } catch (err: any) {
      setDirectoryFeedback({ type: 'error', msg: err.message || 'Network error updating directory status.' });
    } finally {
      setPublishingDirectory(false);
    }
  };

  const handlePushDirectoryNow = async () => {
    setPublishingDirectory(true);
    setDirectoryFeedback(null);
    try {
      const res = await fetch('/api/directory/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBusiness.id,
          userEmail: user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileForm((prev) => ({ ...prev, isPublishedInDirectory: true }));
        updateBusinessProfile({ isPublishedInDirectory: true });
        setDirectoryFeedback({
          type: 'success',
          msg: '🎉 Profile pushed to business directory! Your verified listing is live.',
        });
        setTimeout(() => setDirectoryFeedback(null), 5000);
      } else {
        const errorMsg = data.reasons?.length ? data.reasons.join(' ') : (data.error || 'Failed to push business to directory.');
        setDirectoryFeedback({ type: 'error', msg: errorMsg });
      }
    } catch (err: any) {
      setDirectoryFeedback({ type: 'error', msg: err.message || 'Network error pushing to directory.' });
    } finally {
      setPublishingDirectory(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#059669]" />
          <span>Profile & Workspace Settings</span>
        </h2>
        <p className="text-xs text-slate-500 font-sans">
          Manage your Business Brain, company profile, subscription billing, and account security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSettingsTab('businesses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'businesses' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Businesses</span>
        </button>

        <button
          onClick={() => setSettingsTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Business Profile & Brain</span>
        </button>

        <button
          onClick={() => setSettingsTab('integrations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'integrations' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Google Analytics (GA4)</span>
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

        {(user.planTier === 'pro' || user.planTier === 'agency' || isAdmin) && (
          <button
            onClick={() => setSettingsTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'team' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 font-sans'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Members</span>
          </button>
        )}
      </div>

      {/* TAB 1: BUSINESSES MANAGEMENT (Primary Place for managing businesses) */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          <AiEngineHealthCard />
          <BusinessesManagementSection
            onNavigateToBusinessTab={(subTab) => {
              if (subTab === 'profile') {
                setSettingsTab('profile');
                setProfileSubTab('details');
              } else if (subTab === 'directory') {
                setSettingsTab('profile');
                setProfileSubTab('directory');
              }
            }}
          />
        </div>
      )}

      {/* TAB 2: BUSINESS PROFILE CONTEXT */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Sub-tab navigation bar: Details / Directory / Logo */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/80">
            <button
              type="button"
              onClick={() => setProfileSubTab('details')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                profileSubTab === 'details'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>Profile Details</span>
            </button>

            <button
              type="button"
              onClick={() => setProfileSubTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                profileSubTab === 'directory'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Directory</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                profileForm.isPublishedInDirectory
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {profileForm.isPublishedInDirectory ? 'Live & Published' : 'Directory Settings'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProfileSubTab('logo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                profileSubTab === 'logo'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Invoice Logo</span>
            </button>
          </div>

          {/* Sub-tab: DIRECTORY PUBLISHING */}
          {profileSubTab === 'directory' && (
            <DirectoryPublishingCard
              activeBusiness={activeBusiness}
              businessProfile={businessProfile}
              user={user}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              updateBusinessProfile={updateBusinessProfile}
              onNavigateToProfileDetails={() => setProfileSubTab('details')}
            />
          )}

          {/* Sub-tab: WHITE-LABEL LOGO */}
          {profileSubTab === 'logo' && (
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
              {isWhiteLabelUnlocked ? (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shrink-0">
                  White-Label Enabled ({(user.planTier || 'PRO').toUpperCase()})
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shrink-0 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Pro & Agency Exclusive
                </span>
              )}
            </div>

            {isWhiteLabelUnlocked ? (
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
                        Free plan subscribers receive default verified Locora AI branding on client invoices, proposals, and SEO reports. Upgrade to <strong>Pro</strong> or <strong>Agency</strong> to upload your own custom business logo, replace default badges, and white-label all client deliverables.
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
                    <span>Upgrade to Pro / Agency</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Sub-tab: PROFILE DETAILS FORM */}
          {profileSubTab === 'details' && (
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-600 font-medium">Business Description (AI Prompt Context)</label>
                <button
                  type="button"
                  disabled={isGeneratingDescription}
                  onClick={handleAutoGenerateDescription}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingDescription ? 'Detecting…' : '✦ Auto-generate from website'}
                </button>
              </div>
              {descriptionFeedback && (
                <p className={`text-[11px] rounded-lg px-2.5 py-1.5 mb-1.5 ${descriptionFeedback.type === 'success' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
                  {descriptionFeedback.msg}
                </p>
              )}
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

            {/* Core Business Brain Section */}
            <div className="sm:col-span-2 pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#059669]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Business Brain & Local Growth Context
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Services Catalog (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(profileForm.services) ? profileForm.services.join(', ') : ''}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        services: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Emergency Repair, Installation, Diagnostics, Maintenance"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Target Locations & Service Areas
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(profileForm.targetLocations) ? profileForm.targetLocations.join(', ') : ''}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        targetLocations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Metro Area, Downtown, North Suburbs"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Top Local Competitors (tracked by AI)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(profileForm.primaryCompetitors) ? profileForm.primaryCompetitors.join(', ') : ''}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        primaryCompetitors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. Capital City Pro Services, Apex Masters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">
                    Current Offers & Promotions
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(profileForm.currentOffers) ? profileForm.currentOffers.join(', ') : ''}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        currentOffers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="e.g. 15% Off First Service, Free Diagnostic Inspection"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
              </div>
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

            <div className="sm:col-span-2 space-y-3">
              <GoogleAddressAutocomplete
                label="Street Address (Google Places & Geocoding Autocomplete)"
                placeholder="Start typing street address (e.g. 220 Collins Street, Melbourne)..."
                initialValue={profileForm.address || ''}
                value={profileForm.address || ''}
                onChange={(val) => setProfileForm({ ...profileForm, address: val })}
                onSelectLocation={handleLocationSelect}
                helperText="Select a location to automatically populate City, State / Province, Postal Code, and Country."
              />

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1 font-medium">City</label>
                  <input
                    type="text"
                    value={profileForm.city || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="e.g. Melbourne"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">State / Province</label>
                  <input
                    type="text"
                    value={profileForm.state || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                    placeholder="e.g. Victoria"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Postal / Zip Code</label>
                  <input
                    type="text"
                    value={profileForm.zip || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, zip: e.target.value })}
                    placeholder="e.g. 3000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-slate-600 mb-1 font-medium">Country</label>
                  <CountryAutocomplete
                    value={profileForm.country || 'Australia'}
                    onChange={(c) => setProfileForm({ ...profileForm, country: c })}
                    placeholder="Select country..."
                  />
                </div>
              </div>
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

            {/* Embedded Directory Publishing Card */}
            <div className="sm:col-span-2">
              <DirectoryPublishingCard
                activeBusiness={activeBusiness}
                businessProfile={businessProfile}
                user={user}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                updateBusinessProfile={updateBusinessProfile}
                onNavigateToProfileDetails={() => setProfileSubTab('details')}
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
        )}
        </div>
      )}

      {/* TAB: CONNECTED APIS & FEEDS (GA4, GBP, DATAFORSEO, LOCORA DB) */}
      {activeTab === 'integrations' && <IntegrationsSettingsTab />}

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
                    ? 'Free Explorer tier. Upgrade to unlock full Business Brain, proactive growth detection, and Claude 3.7 models.'
                    : user.planTier === 'pro'
                    ? '$29.00 / month ($249 / year) • Full Business Brain • AI Local SEO Copilot'
                    : '$99.00 / month ($790 / year) • 10 Businesses • AI Client Manager • White-label PDFs'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {user.planTier === 'free' ? (
                  <button
                    onClick={() => setCheckoutModalPlan('pro')}
                    className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade to Pro ($29/mo)</span>
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
                    : `${remainingCredits(user.monthlyAiCredits || creditsForPlan(user.planTier, !user.email), user.aiCreditsUsed || user.creditsUsed || 0)} Credits`}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user.aiCreditsUsed || user.creditsUsed || 0} credits used this billing cycle
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
                          {(inv.paymentMethod as any)?.brand ? (
                            <span className="flex items-center gap-1.5 font-mono text-[11px]">
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              <span>{(inv.paymentMethod as any).brand} •••• {(inv.paymentMethod as any).last4}</span>
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
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCancelAutoRenewModal(false);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
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
              <button
                type="button"
                onClick={() => setShowCancelAutoRenewModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
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
