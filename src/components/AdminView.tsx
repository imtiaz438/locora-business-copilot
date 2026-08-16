import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CustomLogoConfig } from '../types';
import { LocoraLogo } from './LocoraLogo';
import {
  Shield,
  ShieldCheck,
  Lock,
  Database,
  Users,
  Mail,
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Search,
  Key,
  Trash2,
  UserPlus,
  Send,
  Sparkles,
  Server,
  DollarSign,
  TrendingUp,
  Clock,
  XCircle,
  CheckCircle,
  UserCheck,
  Briefcase,
  Crown,
  Cpu,
  Plus,
  Save,
  Layers,
  HelpCircle,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Image as ImageIcon,
  Sun,
  Moon,
  Check,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { user, clients, invoices, updateInvoiceStatus, businessProfile, updateBusinessProfile, updateSettings } = useApp();

  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logo' | 'ai_tokens' | 'sales' | 'subscribers' | 'invoices' | 'dispatch'>('users');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [validatingKeys, setValidatingKeys] = useState<boolean>(false);
  const msgBannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (actionSuccessMsg || actionErrorMsg) {
      msgBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [actionSuccessMsg, actionErrorMsg]);

  // Logo settings state in Admin Portal
  const [adminLogoConfig, setAdminLogoConfig] = useState<CustomLogoConfig>(() => {
    return businessProfile?.logoConfig || {
      url: businessProfile?.logoUrl || '',
      format: 'svg',
      fileName: '',
      height: 48,
      alignment: 'left',
      padding: 'compact',
      bgStyle: 'transparent',
      fit: 'contain',
      showText: false,
      showTagline: false,
    };
  });
  const [adminUrlInput, setAdminUrlInput] = useState(adminLogoConfig.url || '');
  const [adminDragActive, setAdminDragActive] = useState(false);
  const [adminLogoPreviewTab, setAdminLogoPreviewTab] = useState<'light' | 'dark'>('light');
  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroIconInputRef = useRef<HTMLInputElement>(null);
  const authLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (businessProfile?.logoConfig) {
      setAdminLogoConfig(businessProfile.logoConfig);
      setAdminUrlInput(businessProfile.logoConfig.url || '');
    } else if (businessProfile?.logoUrl) {
      setAdminLogoConfig((prev) => ({ ...prev, url: businessProfile.logoUrl || '' }));
      setAdminUrlInput(businessProfile.logoUrl || '');
    }
  }, []);

  const handleFaviconFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const updated: CustomLogoConfig = { ...adminLogoConfig, faviconUrl: result };
        setAdminLogoConfig(updated);
        updateBusinessProfile({ logoConfig: updated });
        setActionSuccessMsg('Favicon updated successfully!');
        const faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
        if (faviconLink) {
          faviconLink.href = result;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeroIconFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const updated: CustomLogoConfig = {
          ...adminLogoConfig,
          heroIconConfig: {
            ...(adminLogoConfig.heroIconConfig || { height: 20, bgStyle: 'transparent', padding: 'compact' }),
            url: result,
          },
        };
        setAdminLogoConfig(updated);
        updateBusinessProfile({ logoConfig: updated });
        setActionSuccessMsg('Hero banner badge icon updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAuthLogoFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const updated: CustomLogoConfig = {
          ...adminLogoConfig,
          authLogoConfig: {
            ...(adminLogoConfig.authLogoConfig || { height: 48, bgStyle: 'transparent', padding: 'compact' }),
            url: result,
          },
        };
        setAdminLogoConfig(updated);
        updateBusinessProfile({ logoConfig: updated });
        setActionSuccessMsg('Login & Auth portal logo updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdminLogoFileChange = (file: File) => {
    setActionSuccessMsg(null);
    if (!file) return;

    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!validTypes.includes(file.type) && !['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      setActionSuccessMsg('Error: Please select a valid SVG, PNG, or JPG/JPEG image file.');
      return;
    }

    const format: CustomLogoConfig['format'] = ext === 'svg' || file.type.includes('svg') ? 'svg' : ext === 'png' ? 'png' : ext.includes('jp') ? 'jpg' : 'webp';

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        const updated: CustomLogoConfig = {
          ...adminLogoConfig,
          url: result,
          format,
          fileName: file.name,
        };
        setAdminLogoConfig(updated);
        setAdminUrlInput(result);
        updateSettings({ siteLogoUrl: result, siteLogoConfig: updated });
        setActionSuccessMsg(`Uploaded ${file.name} (${format.toUpperCase()}) successfully and applied to site brand logo!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdminSaveLogo = () => {
    updateSettings({
      siteLogoUrl: adminLogoConfig.url,
      siteLogoConfig: adminLogoConfig,
    });
    setActionSuccessMsg('Admin Platform Site Logo configuration saved!');
  };

  const handleAdminClearLogo = () => {
    const cleared: CustomLogoConfig = {
      url: '',
      format: 'svg',
      fileName: '',
      height: 48,
      alignment: 'left',
      padding: 'compact',
      bgStyle: 'transparent',
      fit: 'contain',
      showText: false,
      showTagline: false,
    };
    setAdminLogoConfig(cleared);
    setAdminUrlInput('');
    updateSettings({
      siteLogoUrl: '',
      siteLogoConfig: cleared,
    });
    setActionSuccessMsg('Platform site logo reset to default Locora AI brand lockup.');
  };

  // Admin DB State fetched from server
  const [dbStats, setDbStats] = useState<{
    totalUsers: number;
    totalSubscribers: number;
    lastNewsletterDispatch: string | null;
    totalEmailsSent: number;
    currentWeekIndex: number;
  } | null>(null);

  const [usersTable, setUsersTable] = useState<any[]>([]);
  const [subscribersTable, setSubscribersTable] = useState<any[]>([]);
  const [promptPacks, setPromptPacks] = useState<any[]>([]);
  const [newsletterState, setNewsletterState] = useState<any>(null);

  // AI Tokens Stats & Live API Key Inputs
  const [aiStats, setAiStats] = useState<any>(null);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [claudeKeyInput, setClaudeKeyInput] = useState('');
  const [perplexityKeyInput, setPerplexityKeyInput] = useState('');
  const [deepseekKeyInput, setDeepseekKeyInput] = useState('');

  // Admin Transfer & User Management State
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ email: string; name?: string } | null>(null);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');

  // Verify Admin Access
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/database-tables', {
        headers: {
          'x-user-email': user.email || '',
        },
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setIsAuthenticatedAdmin(false);
      } else {
        setIsAuthenticatedAdmin(true);
        setDbStats(data.stats);
        setUsersTable(data.tables.users || []);
        setSubscribersTable(data.tables.newsletterSubscribers || []);
        setPromptPacks(data.tables.promptPacks || []);
        setNewsletterState(data.tables.newsletterState);
        fetchAiTokenStats();
      }
    } catch (err) {
      setIsAuthenticatedAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiTokenStats = async () => {
    try {
      const res = await fetch('/api/admin/ai-tokens/stats', {
        headers: {
          'x-user-email': user.email || '',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiStats(data);
        if (data.savedKeys) {
          if (data.savedKeys.gemini) setGeminiKeyInput(data.savedKeys.gemini);
          if (data.savedKeys.openai) setOpenaiKeyInput(data.savedKeys.openai);
          if (data.savedKeys.anthropic) setClaudeKeyInput(data.savedKeys.anthropic);
          if (data.savedKeys.perplexity) setPerplexityKeyInput(data.savedKeys.perplexity);
          if (data.savedKeys.deepseek) setDeepseekKeyInput(data.savedKeys.deepseek);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI Token stats:', err);
    }
  };

  useEffect(() => {
    if (user.isAuthenticated && (user.role === 'admin' || user.role === 'owner' || user.email === 'imtiazbaloch3322@gmail.com' || user.email === 'support@locoraai.com')) {
      fetchAdminData();
    }
  }, [user.email, user.role, user.isAuthenticated]);

  const isOwner = user.isAuthenticated && (user.role === 'admin' || user.role === 'owner' || user.email === 'imtiazbaloch3322@gmail.com' || user.email === 'support@locoraai.com');

  const handleUpdateUserPlan = async (targetEmail: string, planTier: string) => {
    try {
      const newRole = planTier !== 'free' ? 'subscriber' : undefined;
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ email: targetEmail, planTier, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Updated ${targetEmail} plan to ${planTier.toUpperCase()}${newRole ? ' & role to SUBSCRIBER' : ''}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserAutoRenew = async (targetEmail: string, currentAutoRenew?: boolean) => {
    try {
      const nextVal = currentAutoRenew === false ? true : false;
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ email: targetEmail, autoRenew: nextVal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Set auto-renew to ${nextVal ? 'ENABLED' : 'DISABLED'} for ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserBillingCycle = async (targetEmail: string, billingCycle: string) => {
    try {
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ email: targetEmail, billingCycle }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Updated billing cycle to ${billingCycle.toUpperCase()} for ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserSubscriptionStatus = async (targetEmail: string, subscriptionStatus: string) => {
    try {
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ email: targetEmail, subscriptionStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Updated subscription status to ${subscriptionStatus.toUpperCase()} for ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (targetEmail: string, role: string) => {
    try {
      const res = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ email: targetEmail, role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Assigned role ${role.toUpperCase()} to ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ email: userToDelete.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Successfully deleted account for ${userToDelete.email}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setUserToDelete(null);
    }
  };

  const handleTransferAdminship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTargetEmail.trim()) return;
    await handleUpdateUserRole(transferTargetEmail.trim(), 'admin');
    setActionSuccessMsg(`Successfully granted ADMIN role to ${transferTargetEmail.trim()}!`);
    setTransferTargetEmail('');
  };

  const handleSaveAiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidatingKeys(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    try {
      const res = await fetch('/api/admin/ai-tokens/update-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({
          geminiKey: geminiKeyInput,
          openaiKey: openaiKeyInput,
          anthropicKey: claudeKeyInput,
          perplexityKey: perplexityKeyInput,
          deepseekKey: deepseekKeyInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg('Validated & updated Live AI Model API Keys in server configuration!');
        fetchAiTokenStats();
      } else {
        setActionErrorMsg(data.error || 'API Key validation failed. Key was not saved and tokens were not allocated.');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Failed to communicate with API key validation service.');
    } finally {
      setValidatingKeys(false);
    }
  };

  const handleRefillTokens = async (modelId?: string, amount?: number) => {
    try {
      const res = await fetch('/api/admin/ai-tokens/refill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ modelId, amount: amount || 5000000 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(data.message);
        fetchAiTokenStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubscriber = async (targetEmail: string) => {
    try {
      const res = await fetch('/api/admin/delete-subscriber', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Removed subscriber ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubEmail || !newSubEmail.includes('@')) return;

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newSubEmail.trim() }),
      });
      if (res.ok) {
        setActionSuccessMsg(`Added ${newSubEmail} to Newsletter Database!`);
        setNewSubEmail('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerDispatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/send-weekly-dispatch', {
        method: 'POST',
        headers: {
          'x-user-email': user.email || '',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Dispatched Week #${data.week} "${data.packTitle}" to ${data.sentCount} subscribers!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAdminDbExport = () => {
    window.open(`/api/database/export?userEmail=${encodeURIComponent(user.email || '')}`, '_blank');
  };

  const handleImportAdminDbJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/database/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Database imported: ${data.importedCounts?.users || 0} users, ${data.importedCounts?.newsletterSubscribers || 0} subscribers restored.`);
        fetchAdminData();
      } else {
        alert(data.error || 'Failed to import database file.');
      }
    } catch (err: any) {
      alert('Error parsing or importing database file: ' + err.message);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Restrict access if user is not Owner or Admin
  if (!isOwner) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Access Denied — Admin Role Required</h2>
          <p className="text-xs text-slate-500 font-sans mt-2 max-w-md mx-auto leading-relaxed">
            The Admin Portal is disabled by default for all standard users (`customer` and `subscriber` roles). Only users with the <strong>admin</strong> role can access this portal.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-mono space-y-1 text-left">
          <p><strong>Your Current Account:</strong> {user.email || 'Unauthenticated'}</p>
          <p><strong>Assigned Role:</strong> <span className="uppercase font-bold text-slate-900">{user.role || 'customer'}</span></p>
          <p><strong>Required Role:</strong> <span className="uppercase font-bold text-emerald-700">ADMIN</span></p>
        </div>

        <p className="text-[11px] text-slate-400 font-sans">
          To grant Admin access to an account, use the Role Transfer tool in the Admin Portal or update the role directly in the database.
        </p>
      </div>
    );
  }

  // Financial Calculations for Sold Plans & Invoices
  const proCount = usersTable.filter((u) => u.planTier === 'pro').length;
  const agencyCount = usersTable.filter((u) => u.planTier === 'agency').length;
  const freeCount = usersTable.filter((u) => u.planTier === 'free' || !u.planTier).length;

  const proMRR = proCount * 79;
  const agencyMRR = agencyCount * 199;
  const totalMRR = proMRR + agencyMRR;

  // Invoice Payment Stats
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'draft');
  const cancelledInvoices = invoices.filter((i) => i.status === 'overdue' || i.status === 'cancelled');

  const totalPaidRevenue = paidInvoices.reduce((acc, i) => acc + (i.total || 0), 0);
  const totalPendingAmount = pendingInvoices.reduce((acc, i) => acc + (i.total || 0), 0);

  const filteredUsers = usersTable.filter(
    (u) => u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.name?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredSubscribers = subscribersTable.filter((s) => s.email?.toLowerCase().includes(subSearch.toLowerCase()));

  const filteredInvoicesList = invoices.filter((i) => {
    if (invoiceFilter === 'paid') return i.status === 'paid';
    if (invoiceFilter === 'pending') return i.status === 'sent' || i.status === 'draft';
    if (invoiceFilter === 'cancelled') return i.status === 'overdue' || i.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto">
      {/* User Deletion Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Confirm Account Deletion</h3>
                <p className="text-xs text-slate-500 font-sans">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Target User:</strong> {userToDelete.name ? `${userToDelete.name} (${userToDelete.email})` : userToDelete.email}</p>
              <p className="text-[11px] text-slate-500">Deleting this account will remove user records, role permissions, and monthly AI credit allocations from the server memory and Firestore database.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer font-sans"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[11px] font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Role Session Authorized</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Full control panel to manage user roles (<strong>admin</strong>, <strong>customer</strong>, <strong>subscriber</strong>), monitor AI model credit quotas and live API keys, review revenue, and oversee subscribers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAdminData()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Portal</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadAdminDbExport}
              className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Database</span>
            </button>
            <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Database</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportAdminDbJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <p className="text-[11px] font-medium text-slate-400">Total Registered Users</p>
            <p className="text-2xl font-bold font-heading text-white mt-1">{usersTable.length}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <p className="text-[11px] font-medium text-slate-400">Monthly Recurring Revenue</p>
            <p className="text-2xl font-bold font-heading text-emerald-400 mt-1">${totalMRR.toLocaleString()} / mo</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <p className="text-[11px] font-medium text-slate-400">Active AI Models Monitored</p>
            <p className="text-2xl font-bold font-heading text-purple-400 mt-1">{aiStats?.summary?.activeModelsCount || 6} Models</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
            <p className="text-[11px] font-medium text-slate-400">Total Pool Tokens Remaining</p>
            <p className="text-xl font-bold font-heading text-emerald-300 mt-1">
              {aiStats?.summary ? (aiStats.summary.totalRemainingTokens / 1000000).toFixed(1) + 'M' : '130.0M'}
            </p>
          </div>
        </div>
      </div>

      <div ref={msgBannerRef} className="space-y-3">
        {actionSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button type="button" onClick={() => setActionSuccessMsg(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {actionErrorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
            <button type="button" onClick={() => setActionErrorMsg(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Roles & Accounts ({usersTable.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logo' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Logo & Brand Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_tokens')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ai_tokens' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-purple-300" />
          <span>AI Models & Credit Tokens Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'subscribers' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Subscribers ({subscribersTable.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sales' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Revenue Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'invoices' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Invoices ({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dispatch' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Weekly Dispatch</span>
        </button>
      </div>

      {/* TAB 1: USER ROLES & ACCOUNTS MANAGER */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Admin Role Transfer & Role Policy Info Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quick Admin Role Grant Box */}
            <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold font-heading text-xs">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Transfer or Grant Admin Role</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Enter any user email address below to grant full <strong>Admin</strong> privileges and unlock Admin Portal access.
              </p>
              <form onSubmit={handleTransferAdminship} className="space-y-2 pt-1">
                <input
                  type="email"
                  value={transferTargetEmail}
                  onChange={(e) => setTransferTargetEmail(e.target.value)}
                  placeholder="Enter target email (e.g. user@domain.com)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Grant Admin Privileges</span>
                </button>
              </form>
            </div>

            {/* Role Hierarchy Explanation Box */}
            <div className="md:col-span-2 bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-white font-bold font-heading text-xs">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>How to Manage & Change Admin Role Access</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-bold text-emerald-400 block mb-1">1. Admin Role</span>
                  <p>Only users with <code className="text-emerald-300">role: "admin"</code> can access Admin Portal features & AI controls.</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-bold text-blue-400 block mb-1">2. Customer Role</span>
                  <p>Default role for all newly registered accounts. Admin option is disabled in sidebar by default.</p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="font-bold text-purple-400 block mb-1">3. Subscriber Role</span>
                  <p>Assigned automatically when a user purchases a plan or subscribes to paid features.</p>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                💡 <strong>Direct Database Edit:</strong> Open Firestore Console &gt; <code className="text-emerald-400">users</code> collection &gt; edit field <code className="text-white">role = "admin"</code>.
              </div>
            </div>
          </div>

          {/* Registered Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#059669]" />
                  <span>Registered Accounts & Roles Table</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Change roles instantly between <strong>Admin</strong>, <strong>Customer</strong>, and <strong>Subscriber</strong>.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Plan & Cycle</th>
                    <th className="p-3">Auto-Renew</th>
                    <th className="p-3">Sub Status</th>
                    <th className="p-3">AI Credits</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 text-xs">
                        No accounts match search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{usr.name || 'User'}</td>
                        <td className="p-3 font-mono text-slate-700 text-[11px]">{usr.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            usr.role === 'admin' || usr.role === 'owner' ? 'bg-purple-100 text-purple-800 border border-purple-300 font-mono' :
                            usr.role === 'subscriber' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono' :
                            'bg-slate-100 text-slate-700 font-mono'
                          }`}>
                            {usr.role || 'customer'}
                          </span>
                        </td>
                        <td className="p-3 space-y-1">
                          {/* Plan Tier Select */}
                          <select
                            value={usr.planTier || 'free'}
                            onChange={(e) => handleUpdateUserPlan(usr.email, e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-bold uppercase text-slate-800 focus:outline-none focus:border-[#059669] cursor-pointer"
                          >
                            <option value="free">Free ($0)</option>
                            <option value="pro">Pro ($19/mo)</option>
                            <option value="agency">Agency ($49/mo)</option>
                          </select>
                          {/* Billing Cycle Select */}
                          <div className="text-[10px]">
                            <select
                              value={usr.billingCycle || 'monthly'}
                              onChange={(e) => handleUpdateUserBillingCycle(usr.email, e.target.value)}
                              className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 focus:outline-none cursor-pointer"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly (Save 20%)</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleUserAutoRenew(usr.email, usr.autoRenew)}
                            title="Toggle Auto-Renewal State for User"
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer border transition-colors ${
                              usr.autoRenew !== false
                                ? 'bg-emerald-50 text-[#059669] border-emerald-300 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            {usr.autoRenew !== false ? 'ON (Enabled)' : 'OFF (Disabled)'}
                          </button>
                        </td>
                        <td className="p-3">
                          <select
                            value={usr.subscriptionStatus || 'active'}
                            onChange={(e) => handleUpdateUserSubscriptionStatus(usr.email, e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-800 focus:outline-none cursor-pointer capitalize"
                          >
                            <option value="active">Active</option>
                            <option value="trial">Trial</option>
                            <option value="past_due">Past Due</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                          {usr.aiCreditsUsed || 0} / {usr.monthlyAiCredits || (usr.planTier === 'agency' ? 9999 : usr.planTier === 'pro' ? 250 : 25)}
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <div className="inline-flex gap-1 flex-wrap justify-end">
                            <button
                              onClick={() => handleUpdateUserRole(usr.email, 'admin')}
                              title="Grant Admin Role"
                              className="px-2 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 cursor-pointer"
                            >
                              + Admin
                            </button>
                            <button
                              onClick={() => handleUpdateUserRole(usr.email, 'subscriber')}
                              title="Set to Subscriber Role"
                              className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                            >
                              + Sub
                            </button>
                            <button
                              onClick={() => handleUpdateUserRole(usr.email, 'customer')}
                              title="Set to Customer Role"
                              className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer"
                            >
                              Customer
                            </button>
                            <button
                              onClick={() => setUserToDelete({ email: usr.email, name: usr.name })}
                              title="Delete User Account"
                              className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: LOGO & BRAND CUSTOMIZER CENTER */}
      {activeTab === 'logo' && (
        <div className="space-y-6 font-sans">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold font-mono uppercase">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Portal • Workspace Brand Identity</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white mt-2">
                  Brand Assets & Logo Management Hub
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Upload separate brand asset images for your Main Navigation Header, Browser Favicon, Hero Section Badge, and Login/Auth Portals with independent sizing and background options.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {adminLogoConfig.url && (
                  <button
                    type="button"
                    onClick={handleAdminClearLogo}
                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reset Assets</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAdminSaveLogo}
                  className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Brand Assets</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Asset Upload Sections (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* SECTION 1: Main Header Navigation Logo */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#059669]" />
                    <h4 className="text-sm font-bold font-heading text-slate-900">1. Main Navigation / Header Logo</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    {adminLogoConfig.height || 48}px Height
                  </span>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setAdminDragActive(true); }}
                  onDragLeave={() => setAdminDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setAdminDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleAdminLogoFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => adminFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    adminDragActive
                      ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={adminFileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml,.png,image/png,.jpg,.jpeg,image/jpeg,.webp"
                    onChange={(e) => e.target.files?.[0] && handleAdminLogoFileChange(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 font-heading">
                      Click to upload Header Logo (SVG, PNG, JPG)
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Used for primary navigation header across public and dashboard views
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block font-heading">
                    Header Logo URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={adminUrlInput}
                      onChange={(e) => setAdminUrlInput(e.target.value)}
                      placeholder="https://example.com/logo.svg"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (adminUrlInput.trim()) {
                          const updated: CustomLogoConfig = { ...adminLogoConfig, url: adminUrlInput.trim() };
                          setAdminLogoConfig(updated);
                          updateBusinessProfile({ logoUrl: adminUrlInput.trim(), logoConfig: updated });
                          setActionSuccessMsg('Header logo URL updated!');
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Sizing & Background Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  {/* Height Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <label>Header Logo Height:</label>
                      <span className="font-mono text-emerald-700">{adminLogoConfig.height || 48}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="120"
                      step="2"
                      value={adminLogoConfig.height || 48}
                      onChange={(e) =>
                        setAdminLogoConfig((prev) => ({ ...prev, height: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-[#059669] cursor-pointer"
                    />
                  </div>

                  {/* Container Frame Background */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block font-heading">Container Frame Background:</label>
                    <select
                      value={adminLogoConfig.bgStyle || 'transparent'}
                      onChange={(e) =>
                        setAdminLogoConfig((prev) => ({
                          ...prev,
                          bgStyle: e.target.value as CustomLogoConfig['bgStyle'],
                        }))
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="transparent">Transparent (Clean)</option>
                      <option value="light">White Card Box with Border</option>
                      <option value="dark">Dark Slate Box</option>
                      <option value="glass">Frosted Glass Badge</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Favicon & App Icon */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#059669]" />
                    <h4 className="text-sm font-bold font-heading text-slate-900">2. Browser Favicon & App Icon</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    Square 1:1 Recommended
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Icon Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 p-2 shadow-2xs">
                    {adminLogoConfig.faviconUrl ? (
                      <img
                        src={adminLogoConfig.faviconUrl}
                        alt="Favicon Preview"
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase text-center font-mono">
                        No Icon
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept=".svg,image/svg+xml,.png,image/png,.ico,.jpg,.webp"
                      onChange={(e) => e.target.files?.[0] && handleFaviconFileChange(e.target.files[0])}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Favicon</span>
                      </button>

                      {adminLogoConfig.faviconUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated: CustomLogoConfig = { ...adminLogoConfig, faviconUrl: '' };
                            setAdminLogoConfig(updated);
                            updateBusinessProfile({ logoConfig: updated });
                            setActionSuccessMsg('Favicon cleared.');
                          }}
                          className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          Clear Icon
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Upload custom favicon icon (32x32px or 64x64px SVG/PNG/ICO) displayed on browser tab bookmarks.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Hero Section & Top Banner Badge Icon */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#059669]" />
                    <h4 className="text-sm font-bold font-heading text-slate-900">3. Hero Section & Top Banner Badge Icon</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    {adminLogoConfig.heroIconConfig?.height || 20}px Height
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Hero Icon Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-center shrink-0 p-2 shadow-2xs">
                    {adminLogoConfig.heroIconConfig?.url || adminLogoConfig.url ? (
                      <img
                        src={adminLogoConfig.heroIconConfig?.url || adminLogoConfig.url}
                        alt="Hero Badge Icon Preview"
                        className="h-6 w-auto object-contain"
                      />
                    ) : (
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <input
                      ref={heroIconInputRef}
                      type="file"
                      accept=".svg,image/svg+xml,.png,image/png,.jpg,.webp"
                      onChange={(e) => e.target.files?.[0] && handleHeroIconFileChange(e.target.files[0])}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => heroIconInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Hero Icon</span>
                      </button>

                      {adminLogoConfig.heroIconConfig?.url && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated: CustomLogoConfig = { ...adminLogoConfig, heroIconConfig: undefined };
                            setAdminLogoConfig(updated);
                            updateBusinessProfile({ logoConfig: updated });
                            setActionSuccessMsg('Reset hero icon to header logo fallback.');
                          }}
                          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Use Main Logo
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {/* Height Slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span>Badge Icon Height:</span>
                          <span className="font-mono text-emerald-700">{adminLogoConfig.heroIconConfig?.height || 20}px</span>
                        </div>
                        <input
                          type="range"
                          min="12"
                          max="36"
                          step="2"
                          value={adminLogoConfig.heroIconConfig?.height || 20}
                          onChange={(e) => {
                            const height = parseInt(e.target.value, 10);
                            const updated: CustomLogoConfig = {
                              ...adminLogoConfig,
                              heroIconConfig: {
                                ...(adminLogoConfig.heroIconConfig || { bgStyle: 'transparent' }),
                                height,
                              },
                            };
                            setAdminLogoConfig(updated);
                          }}
                          className="w-full accent-[#059669] cursor-pointer"
                        />
                      </div>

                      {/* Frame Style */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Badge Frame Style:</label>
                        <select
                          value={adminLogoConfig.heroIconConfig?.bgStyle || 'transparent'}
                          onChange={(e) => {
                            const bgStyle = e.target.value as any;
                            const updated: CustomLogoConfig = {
                              ...adminLogoConfig,
                              heroIconConfig: {
                                ...(adminLogoConfig.heroIconConfig || { height: 20 }),
                                bgStyle,
                              },
                            };
                            setAdminLogoConfig(updated);
                          }}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="transparent">Transparent</option>
                          <option value="glass">Frosted Glass</option>
                          <option value="light">White Card</option>
                          <option value="dark">Dark Slate</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Login & Auth Portal Logo */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#059669]" />
                    <h4 className="text-sm font-bold font-heading text-slate-900">4. Login & Auth Portal Logo</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    {adminLogoConfig.authLogoConfig?.height || 48}px Height
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Auth Logo Preview */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-slate-800 flex items-center justify-center shrink-0 p-2 shadow-2xs">
                    {adminLogoConfig.authLogoConfig?.url || adminLogoConfig.url ? (
                      <img
                        src={adminLogoConfig.authLogoConfig?.url || adminLogoConfig.url}
                        alt="Auth Modal Logo Preview"
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <Shield className="w-8 h-8 text-emerald-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <input
                      ref={authLogoInputRef}
                      type="file"
                      accept=".svg,image/svg+xml,.png,image/png,.jpg,.webp"
                      onChange={(e) => e.target.files?.[0] && handleAuthLogoFileChange(e.target.files[0])}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => authLogoInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Auth Logo</span>
                      </button>

                      {adminLogoConfig.authLogoConfig?.url && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated: CustomLogoConfig = { ...adminLogoConfig, authLogoConfig: undefined };
                            setAdminLogoConfig(updated);
                            updateBusinessProfile({ logoConfig: updated });
                            setActionSuccessMsg('Reset auth logo to header logo fallback.');
                          }}
                          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                          Use Main Logo
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {/* Height Slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span>Auth Logo Height:</span>
                          <span className="font-mono text-emerald-700">{adminLogoConfig.authLogoConfig?.height || 48}px</span>
                        </div>
                        <input
                          type="range"
                          min="24"
                          max="80"
                          step="2"
                          value={adminLogoConfig.authLogoConfig?.height || 48}
                          onChange={(e) => {
                            const height = parseInt(e.target.value, 10);
                            const updated: CustomLogoConfig = {
                              ...adminLogoConfig,
                              authLogoConfig: {
                                ...(adminLogoConfig.authLogoConfig || { bgStyle: 'transparent' }),
                                height,
                              },
                            };
                            setAdminLogoConfig(updated);
                          }}
                          className="w-full accent-[#059669] cursor-pointer"
                        />
                      </div>

                      {/* Frame Style */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Auth Box Frame Style:</label>
                        <select
                          value={adminLogoConfig.authLogoConfig?.bgStyle || 'transparent'}
                          onChange={(e) => {
                            const bgStyle = e.target.value as any;
                            const updated: CustomLogoConfig = {
                              ...adminLogoConfig,
                              authLogoConfig: {
                                ...(adminLogoConfig.authLogoConfig || { height: 48 }),
                                bgStyle,
                              },
                            };
                            setAdminLogoConfig(updated);
                          }}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="transparent">Transparent</option>
                          <option value="glass">Frosted Glass Badge</option>
                          <option value="light">White Card Box</option>
                          <option value="dark">Dark Slate Box</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Placement Live Preview (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#059669]" />
                    <h4 className="text-sm font-bold font-heading text-slate-900">Live Asset Placements Preview</h4>
                  </div>

                  {/* Toggle Light / Dark Preview */}
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAdminLogoPreviewTab('light')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                        adminLogoPreviewTab === 'light' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      <Sun className="w-3 h-3 text-amber-500" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminLogoPreviewTab('dark')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                        adminLogoPreviewTab === 'dark' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      <Moon className="w-3 h-3 text-indigo-400" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Preview Cards */}
                <div className="space-y-4">
                  {/* 1. Header Navigation Preview */}
                  <div
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      adminLogoPreviewTab === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      1. Main Header Logo Preview ({adminLogoConfig.height || 48}px)
                    </span>
                    <div className="p-3 w-full flex items-center justify-center border border-dashed rounded-xl border-slate-300/40">
                      <LocoraLogo assetType="header" variant={adminLogoPreviewTab === 'dark' ? 'dark' : 'emerald'} />
                    </div>
                  </div>

                  {/* 2. Hero Pill Icon Preview */}
                  <div className="p-4 rounded-2xl border bg-gradient-to-r from-slate-900 to-emerald-950 text-white border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold block">
                      2. Hero Section Badge Icon Preview
                    </span>
                    <div className="p-2 w-full flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                        <LocoraLogo assetType="hero" size={20} />
                        <span>Workspace Copilot Active</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Auth Portal Logo Preview */}
                  <div className="p-4 rounded-2xl border bg-slate-900 text-white border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      3. Login & Signup Modal Preview
                    </span>
                    <div className="p-3 w-full flex items-center justify-center border border-dashed rounded-xl border-slate-700">
                      <LocoraLogo assetType="auth" variant="dark" />
                    </div>
                  </div>

                  {/* 4. Favicon Icon Preview */}
                  <div className="p-4 rounded-2xl border bg-slate-100 border-slate-200 text-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                        4. Browser Tab Favicon
                      </span>
                      <span className="text-xs font-bold text-slate-700">32x32 Tab Icon</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                      {adminLogoConfig.faviconUrl ? (
                        <img src={adminLogoConfig.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                      ) : (
                        <LocoraLogo assetType="favicon" size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Confirmation CTA */}
                <button
                  type="button"
                  onClick={handleAdminSaveLogo}
                  className="w-full py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply & Save All Brand Assets Workspace-Wide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI MODELS & CREDIT TOKENS MONITORING HUB */}
      {activeTab === 'ai_tokens' && (
        <div className="space-y-6 font-sans">
          {/* Top Token Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-bold font-mono uppercase">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Backend AI Model Token & Key Control Hub</span>
                </div>
                <h3 className="text-xl font-bold font-heading text-white mt-1">
                  Live AI Models & Token Monitoring System
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRefillTokens(undefined, 5000000)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Refill +5M Tokens All Models</span>
                </button>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Total Purchased Token Quotas</p>
                <p className="text-2xl font-bold font-heading text-white mt-1">
                  {aiStats?.summary ? (aiStats.summary.totalAllocatedTokens / 1000000).toFixed(1) + ' Million' : '130.0 Million'}
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Total Utilized Tokens</p>
                <p className="text-2xl font-bold font-heading text-indigo-400 mt-1">
                  {aiStats?.summary ? (aiStats.summary.totalUsedTokens / 1000000).toFixed(2) + ' Million' : '0.00 Million'}
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Remaining Available Tokens</p>
                <p className="text-2xl font-bold font-heading text-emerald-400 mt-1">
                  {aiStats?.summary ? (aiStats.summary.totalRemainingTokens / 1000000).toFixed(1) + ' Million' : '130.0 Million'}
                </p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Utilization Rate</p>
                <p className="text-2xl font-bold font-heading text-purple-300 mt-1">
                  {aiStats?.summary ? aiStats.summary.utilizationPercentage + '%' : '0.00%'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Models Quotas Cards Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#059669]" />
              <span>Live AI Models Credit Status & Utilization</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(aiStats?.models || []).map((m: any) => {
                const isActive = m.hasCustomKey && m.allocatedTokens > 0;
                const usedPct = m.allocatedTokens > 0 ? ((m.usedTokens / m.allocatedTokens) * 100).toFixed(1) : '0.0';
                return (
                  <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {m.provider}
                        </span>
                        {isActive ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            NO API KEY
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold font-heading text-slate-900">{m.name}</h5>

                      {/* Token Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-500">Remaining Pool</span>
                          <span className="font-bold text-slate-900">
                            {isActive ? `${(m.remainingTokens / 1000000).toFixed(2)}M Tokens` : '0.00M Tokens'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isActive ? 'bg-[#059669]' : 'bg-slate-300'}`}
                            style={{ width: isActive ? `${Math.max(0, 100 - parseFloat(usedPct))}%` : '0%' }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-sans">
                          {isActive ? (
                            <>
                              <span>Used: {(m.usedTokens / 1000000).toFixed(2)}M ({usedPct}%)</span>
                              <span>Quota: {(m.allocatedTokens / 1000000).toFixed(0)}M</span>
                            </>
                          ) : (
                            <span className="text-amber-700 font-medium">Add API key below to activate tokens</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRefillTokens(m.id, 2000000)}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Top-Up +2M Tokens</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live API Keys Management Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#059669]" />
                  <span>Update Live AI Model API Keys directly from Admin Portal</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Enter live API keys here to replenish model tokens dynamically without modifying codebase files.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAiKeys} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Google Gemini API Key (GEMINI_API_KEY)</label>
                  <input
                    type="password"
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="AIzaSy... (Leave empty to keep active server key)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">OpenAI API Key (OPENAI_API_KEY)</label>
                  <input
                    type="password"
                    value={openaiKeyInput}
                    onChange={(e) => setOpenaiKeyInput(e.target.value)}
                    placeholder="sk-proj-... (Leave empty to keep active key)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Anthropic Claude Key (ANTHROPIC_API_KEY)</label>
                  <input
                    type="password"
                    value={claudeKeyInput}
                    onChange={(e) => setClaudeKeyInput(e.target.value)}
                    placeholder="sk-ant-... (Leave empty to keep active key)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DeepSeek API Key (DEEPSEEK_API_KEY)</label>
                  <input
                    type="password"
                    value={deepseekKeyInput}
                    onChange={(e) => setDeepseekKeyInput(e.target.value)}
                    placeholder="sk-ds-... (Leave empty to keep active key)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={validatingKeys}
                  className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer font-sans"
                >
                  <RefreshCw className={`w-4 h-4 ${validatingKeys ? 'animate-spin' : 'hidden'}`} />
                  <Save className={`w-4 h-4 ${validatingKeys ? 'hidden' : 'block'}`} />
                  <span>{validatingKeys ? 'Validating & Verifying Keys...' : 'Save & Update Live Model API Keys'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SOLD SUBSCRIPTION PLANS ANALYTICS */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg uppercase">Free Plan</span>
                <span className="text-xs font-mono text-slate-400">$0 / mo</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-heading text-slate-900">{freeCount}</p>
                <p className="text-xs text-slate-500 mt-1">Free Tier Users (25 AI Credits / mo)</p>
              </div>
            </div>

            <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-2xs space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg uppercase">Pro Copilot Plan</span>
                <span className="text-xs font-mono text-emerald-700 font-bold">$79 / mo</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-heading text-slate-900">{proCount}</p>
                <p className="text-xs text-emerald-700 font-medium mt-1">MRR: ${proMRR.toLocaleString()} / mo</p>
              </div>
            </div>

            <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-2xs space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-lg uppercase">Agency Unlimited</span>
                <span className="text-xs font-mono text-purple-700 font-bold">$199 / mo</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-heading text-slate-900">{agencyCount}</p>
                <p className="text-xs text-purple-700 font-medium mt-1">MRR: ${agencyMRR.toLocaleString()} / mo</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900">Sold Subscriptions Break-down</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-3">Customer Email</th>
                    <th className="p-3">Plan Tier</th>
                    <th className="p-3">Monthly Cost</th>
                    <th className="p-3">Billing Cycle</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersTable.filter((u) => u.planTier && u.planTier !== 'free').length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No paid subscriptions sold yet.
                      </td>
                    </tr>
                  ) : (
                    usersTable
                      .filter((u) => u.planTier && u.planTier !== 'free')
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{u.email}</td>
                          <td className="p-3 font-bold uppercase text-emerald-700">{u.planTier}</td>
                          <td className="p-3 font-mono text-slate-800">${u.planTier === 'agency' ? '199' : '79'} / mo</td>
                          <td className="p-3 text-slate-600">{u.billingCycle || 'monthly'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                              Active Subscription
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS RECEIVED & INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden space-y-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#059669]" />
                <span>Financial Transactions & Payments Dashboard</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Review payments received, pending invoices, and cancelled transactions.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setInvoiceFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${invoiceFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({invoices.length})
              </button>
              <button
                onClick={() => setInvoiceFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${invoiceFilter === 'paid' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Paid ({paidInvoices.length})
              </button>
              <button
                onClick={() => setInvoiceFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${invoiceFilter === 'pending' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Pending ({pendingInvoices.length})
              </button>
              <button
                onClick={() => setInvoiceFilter('cancelled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${invoiceFilter === 'cancelled' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Cancelled ({cancelledInvoices.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Issue / Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Update Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoicesList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                      No invoices found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoicesList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-3 font-semibold text-slate-800">{inv.customerName}</td>
                      <td className="p-3 font-bold text-emerald-700">${inv.total?.toLocaleString()}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{inv.issueDate} / {inv.dueDate}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          inv.status === 'sent' || inv.status === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            updateInvoiceStatus(inv.id, 'paid');
                            setActionSuccessMsg(`Invoice ${inv.invoiceNumber} marked as PAID`);
                          }}
                          className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => {
                            updateInvoiceStatus(inv.id, 'sent');
                            setActionSuccessMsg(`Invoice ${inv.invoiceNumber} marked as PENDING`);
                          }}
                          className="px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 cursor-pointer"
                        >
                          Mark Pending
                        </button>
                        <button
                          onClick={() => {
                            updateInvoiceStatus(inv.id, 'cancelled');
                            setActionSuccessMsg(`Invoice ${inv.invoiceNumber} marked as CANCELLED`);
                          }}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SUBSCRIBERS TABLE */}
      {activeTab === 'subscribers' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden space-y-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#059669]" />
                <span>Newsletter Subscribers Table (`subscribersDb`)</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Subscribers receiving weekly local business AI prompt packs via Resend / SMTP.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Search subscribers..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
              />
            </div>
          </div>

          <form onSubmit={handleAddSubscriber} className="flex gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="email"
              value={newSubEmail}
              onChange={(e) => setNewSubEmail(e.target.value)}
              placeholder="Add new subscriber email..."
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Subscriber</span>
            </button>
          </form>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Subscriber Email</th>
                  <th className="p-3">Subscribed Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 text-xs">
                      No subscribers found.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{sub.email}</td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : 'Recent'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Dispatch
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.email)}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: WEEKLY DISPATCH CONTROL */}
      {activeTab === 'dispatch' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#059669]" />
                <span>Automated Weekly Prompt Newsletter Dispatch Center</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Manage automated weekly AI prompt pack deliveries to subscribers.
              </p>
            </div>

            <button
              onClick={handleTriggerDispatch}
              disabled={loading}
              className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Trigger Weekly Dispatch Now</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promptPacks.map((pack) => (
              <div key={pack.week} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 font-heading">Week #{pack.week}</span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    {pack.prompts.length} Prompts
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">{pack.title}</h4>
                <div className="space-y-1">
                  {pack.prompts.map((p: any, pIdx: number) => (
                    <div key={pIdx} className="text-[11px] text-slate-600 truncate bg-white p-2 rounded border border-slate-200 font-mono">
                      {p.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
