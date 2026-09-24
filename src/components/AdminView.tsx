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
  AlertTriangle,
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
  CreditCard,
  RotateCcw,
  Building2,
  ExternalLink,
  Filter,
  Globe2,
  MapPin,
  Star,
} from 'lucide-react';
import { PlanProviderAccessSummary } from './PlanProviderAccessSummary';
import { DataFreshnessPanel } from './DataFreshnessPanel';
import { DirectoryAdminPanel } from './admin/DirectoryAdminPanel';

export const AdminView: React.FC = () => {
  const {
    user,
    customers: clients = [],
    invoices,
    updateInvoiceStatus,
    businessProfile,
    updateBusinessProfile,
    updateSettings,
    businesses,
    switchBusiness,
    setActiveTab: setAppActiveTab,
  } = useApp();

  const [isAuthenticatedAdmin, setIsAuthenticatedAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    | 'workspaces'
    | 'users'
    | 'database_tables'
    | 'payments'
    | 'logo'
    | 'ai_tokens'
    | 'sales'
    | 'subscribers'
    | 'invoices'
    | 'dispatch'
    | 'email_server'
    | 'provider_access'
    | 'datasets'
    | 'directory_rules'
  >('workspaces');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [validatingKeys, setValidatingKeys] = useState<boolean>(false);
  const msgBannerRef = useRef<HTMLDivElement>(null);

  // Database Tables State
  const [businessesTable, setBusinessesTable] = useState<any[]>([]);
  const [locationsTable, setLocationsTable] = useState<any[]>([]);
  const [reviewsTable, setReviewsTable] = useState<any[]>([]);
  const [directoryProfilesTable, setDirectoryProfilesTable] = useState<any[]>([]);
  const [dataConnectionsTable, setDataConnectionsTable] = useState<any[]>([]);
  const [googleConnectionsTable, setGoogleConnectionsTable] = useState<any[]>([]);
  const [leadsTable, setLeadsTable] = useState<any[]>([]);
  const [customersTable, setCustomersTable] = useState<any[]>([]);
  const [activeDbTable, setActiveDbTable] = useState<'businesses' | 'locations' | 'directoryProfiles' | 'reviews' | 'dataConnections' | 'leads' | 'users'>('businesses');
  const [dbSearchTerm, setDbSearchTerm] = useState('');
  const [workspaceSearchTerm, setWorkspaceSearchTerm] = useState('');

  // Brevo Mail Server State
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testEmailSubject, setTestEmailSubject] = useState('Locora AI Brevo SMTP Delivery Verification');
  const [testEmailBody, setTestEmailBody] = useState('This is a test message dispatched from Locora AI Copilot via Brevo SMTP mail server.');
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [testMailFeedback, setTestMailFeedback] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  const fetchEmailStatus = async () => {
    try {
      const res = await fetch('/api/admin/email-status');
      const data = await res.json();
      if (res.ok) {
        setEmailStatus(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch Brevo email status:', err);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo || !testEmailTo.includes('@')) {
      setActionErrorMsg('Please enter a valid recipient email address.');
      return;
    }
    setSendingTestMail(true);
    setTestMailFeedback(null);
    try {
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailTo.trim(),
          subject: testEmailSubject,
          body: testEmailBody,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestMailFeedback({
          success: true,
          message: `Test email successfully dispatched to ${testEmailTo} via ${data.emailResult?.provider?.toUpperCase() || 'BREVO'}!`,
          details: data.emailResult,
        });
        setActionSuccessMsg(`Test email sent to ${testEmailTo}`);
        fetchEmailStatus();
      } else {
        setTestMailFeedback({
          success: false,
          message: data.error || 'Failed to dispatch test email.',
        });
        setActionErrorMsg(data.error || 'Test email failed');
      }
    } catch (err: any) {
      setTestMailFeedback({
        success: false,
        message: err.message || 'Network exception during email test.',
      });
    } finally {
      setSendingTestMail(false);
    }
  };

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
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [googleMapsKeyInput, setGoogleMapsKeyInput] = useState('');
  const [pageSpeedKeyInput, setPageSpeedKeyInput] = useState('');
  const [hunterKeyInput, setHunterKeyInput] = useState('');
  const [apolloKeyInput, setApolloKeyInput] = useState('');
  const [millionVerifierKeyInput, setMillionVerifierKeyInput] = useState('');
  const [serperKeyInput, setSerperKeyInput] = useState('');
  const [serpApiKeyInput, setSerpApiKeyInput] = useState('');
  const [dataforseoLoginInput, setDataforseoLoginInput] = useState('');
  const [dataforseoPasswordInput, setDataforseoPasswordInput] = useState('');
  const [googleSearchApiKeyInput, setGoogleSearchApiKeyInput] = useState('');
  const [googleSearchCxInput, setGoogleSearchCxInput] = useState('');
  const [scaleSerpKeyInput, setScaleSerpKeyInput] = useState('');
  const [valueSerpKeyInput, setValueSerpKeyInput] = useState('');
  const [aiModelSearch, setAiModelSearch] = useState('');
  const [aiProviderFilter, setAiProviderFilter] = useState<'all' | 'anthropic' | 'groq'>('all');
  const [editingQuotaModelId, setEditingQuotaModelId] = useState<string | null>(null);
  const [customQuotaInput, setCustomQuotaInput] = useState<number | string>('');

  // Admin Transfer & User Management State
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ email: string; name?: string } | null>(null);

  // Search & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'subscriber' | 'customer'>('all');
  const [userAutoRenewFilter, setUserAutoRenewFilter] = useState<'all' | 'on' | 'off'>('all');
  const [subSearch, setSubSearch] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');

  // Live Payment Transactions State
  const [transactionsTable, setTransactionsTable] = useState<any[]>([]);
  const [transactionStats, setTransactionStats] = useState<any>(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'success' | 'pending' | 'failed' | 'cancel' | 'refunded'>('all');
  const [selectedTxnForRefund, setSelectedTxnForRefund] = useState<any | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<number | string>('');
  const [refundReasonInput, setRefundReasonInput] = useState('Customer requested plan downgrade/refund');
  const [isRefunding, setIsRefunding] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);
  const [isDeletingTxn, setIsDeletingTxn] = useState(false);

  // Fetch Live Payment Transactions
  const fetchTransactionsData = async () => {
    try {
      const adminEmail = user.email || 'imtiazbaloch3322@gmail.com';
      const res = await fetch('/api/admin/transactions', {
        headers: {
          'x-user-email': adminEmail,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Strict deduplication safeguard by transaction ID, invoice ID, and user plan
        const rawList = data.transactions || [];
        const seenIds = new Set<string>();
        const seenInvoices = new Set<string>();
        const seenUserPlans = new Set<string>();
        const cleanList: any[] = [];

        for (const t of rawList) {
          if (!t || !t.id) continue;
          const email = (t.userEmail || '').toLowerCase().trim();
          const plan = (t.planTier || t.plan || 'pro').toLowerCase().trim();
          const invoice = (t.invoiceId || '').trim();
          const userPlanKey = email ? `${email}_${plan}` : '';

          if (seenIds.has(t.id)) continue;
          if (invoice && seenInvoices.has(invoice)) continue;
          if (userPlanKey && seenUserPlans.has(userPlanKey)) continue;

          seenIds.add(t.id);
          if (invoice) seenInvoices.add(invoice);
          if (userPlanKey) seenUserPlans.add(userPlanKey);
          cleanList.push(t);
        }

        setTransactionsTable(cleanList);
        setTransactionStats(data.stats || null);
      }
    } catch (err: any) {
      console.error('Failed to fetch admin transactions:', err);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxnForRefund) return;
    setIsRefunding(true);
    try {
      const parsedAmount = typeof refundAmountInput === 'number' ? refundAmountInput : parseFloat(refundAmountInput as string);
      const amountToRefund = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : selectedTxnForRefund.amount;
      const adminEmail = user.email || 'imtiazbaloch3322@gmail.com';

      const res = await fetch('/api/admin/transactions/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': adminEmail,
        },
        body: JSON.stringify({
          transactionId: selectedTxnForRefund.id,
          refundAmount: amountToRefund,
          reason: refundReasonInput,
          userEmail: adminEmail,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Refund of $${amountToRefund}.00 for transaction ${selectedTxnForRefund.id} processed successfully.`);
        setSelectedTxnForRefund(null);
        fetchTransactionsData();
        fetchAdminData();
      } else {
        setActionErrorMsg(data.error || 'Failed to process refund.');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Refund error occurred');
    } finally {
      setIsRefunding(false);
    }
  };

  const handleUpdateTxnStatus = async (transactionId: string, status: string) => {
    try {
      const adminEmail = user.email || 'imtiazbaloch3322@gmail.com';
      const res = await fetch('/api/admin/transactions/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': adminEmail,
        },
        body: JSON.stringify({ transactionId, status, userEmail: adminEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Transaction ${transactionId} status updated to ${status.toUpperCase()}`);
        fetchTransactionsData();
        fetchAdminData();
      } else {
        setActionErrorMsg(data.error || 'Failed to update transaction status');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message);
    }
  };

  const handleConfirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    setIsDeletingTxn(true);
    const txnId = transactionToDelete.id;
    const adminEmail = user.email || 'imtiazbaloch3322@gmail.com';
    try {
      const res = await fetch('/api/admin/transactions/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': adminEmail,
        },
        body: JSON.stringify({ transactionId: txnId, userEmail: adminEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`Transaction ${txnId} deleted successfully.`);
        setTransactionsTable((prev) => prev.filter((t) => t.id !== txnId));
        setTransactionToDelete(null);
        fetchTransactionsData();
        fetchAdminData();
      } else {
        setActionErrorMsg(data.error || 'Failed to delete transaction.');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Error deleting transaction.');
    } finally {
      setIsDeletingTxn(false);
    }
  };

  // Verify Admin Access
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const adminEmail = user.email || 'imtiazbaloch3322@gmail.com';
      const res = await fetch('/api/admin/database-tables', {
        headers: {
          'x-user-email': adminEmail,
        },
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setIsAuthenticatedAdmin(false);
      } else {
        setIsAuthenticatedAdmin(true);
        setDbStats(data.stats);
        setUsersTable(data.tables?.users || []);
        setBusinessesTable(data.tables?.businesses || []);
        setLocationsTable(data.tables?.locations || []);
        setReviewsTable(data.tables?.reviews || []);
        setDirectoryProfilesTable(data.tables?.directoryProfiles || []);
        setDataConnectionsTable(data.tables?.dataConnections || []);
        setGoogleConnectionsTable(data.tables?.googleConnections || []);
        setLeadsTable(data.tables?.leads || []);
        setCustomersTable(data.tables?.customers || []);
        setSubscribersTable(data.tables?.newsletterSubscribers || []);
        setPromptPacks(data.tables?.promptPacks || []);
        setNewsletterState(data.tables?.newsletterState);
        fetchAiTokenStats();
        fetchTransactionsData();
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
          setGeminiKeyInput(data.savedKeys.gemini || '');
          setOpenaiKeyInput(data.savedKeys.openai || '');
          setClaudeKeyInput(data.savedKeys.anthropic || data.savedKeys.claude || '');
          setPerplexityKeyInput(data.savedKeys.perplexity || '');
          setDeepseekKeyInput(data.savedKeys.deepseek || '');
          setGroqKeyInput(data.savedKeys.groq || '');
          setGoogleMapsKeyInput(data.savedKeys.googleMaps || '');
          setPageSpeedKeyInput(data.savedKeys.pageSpeed || '');
          setHunterKeyInput(data.savedKeys.hunter || '');
          setApolloKeyInput(data.savedKeys.apollo || '');
          setMillionVerifierKeyInput(data.savedKeys.millionverifier || data.savedKeys.millionVerifier || '');
          setSerperKeyInput(data.savedKeys.serper || '');
          setSerpApiKeyInput(data.savedKeys.serpapi || '');
          setDataforseoLoginInput(data.savedKeys.dataforseoLogin || '');
          setDataforseoPasswordInput(data.savedKeys.dataforseoPassword || '');
          setGoogleSearchApiKeyInput(data.savedKeys.googleSearchApiKey || '');
          setGoogleSearchCxInput(data.savedKeys.googleSearchCx || '');
          setScaleSerpKeyInput(data.savedKeys.scaleserp || '');
          setValueSerpKeyInput(data.savedKeys.valueserp || '');
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
      // Optimistic update
      setUsersTable(prev => prev.map(u => u.email === targetEmail ? { ...u, planTier, ...(newRole ? { role: newRole } : {}) } : u));
      
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
      } else {
        setActionSuccessMsg(data.error || `Failed to update plan for ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err: any) {
      console.error(err);
      setActionSuccessMsg(`Error: ${err.message}`);
    }
  };

  const handleToggleUserAutoRenew = async (targetEmail: string, currentAutoRenew?: boolean) => {
    try {
      const nextVal = currentAutoRenew === false ? true : false;
      // Optimistic update
      setUsersTable(prev => prev.map(u => u.email === targetEmail ? { ...u, autoRenew: nextVal } : u));

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
        setActionSuccessMsg(`Set auto-renew to ${nextVal ? 'ENABLED (ON)' : 'DISABLED (OFF)'} for ${targetEmail}`);
        fetchAdminData();
      } else {
        setActionSuccessMsg(data.error || `Failed to toggle auto-renew for ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err: any) {
      console.error(err);
      setActionSuccessMsg(`Error: ${err.message}`);
    }
  };

  const handleUpdateUserBillingCycle = async (targetEmail: string, billingCycle: string) => {
    try {
      // Optimistic update
      setUsersTable(prev => prev.map(u => u.email === targetEmail ? { ...u, billingCycle } : u));

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
      } else {
        setActionSuccessMsg(data.error || `Failed to update billing cycle`);
        fetchAdminData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateUserSubscriptionStatus = async (targetEmail: string, subscriptionStatus: string) => {
    try {
      // Optimistic update
      setUsersTable(prev => prev.map(u => u.email === targetEmail ? { ...u, subscriptionStatus } : u));

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
      } else {
        setActionSuccessMsg(data.error || `Failed to update status`);
        fetchAdminData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (targetEmail: string, role: string) => {
    try {
      // Optimistic update
      setUsersTable(prev => prev.map(u => u.email === targetEmail ? { ...u, role } : u));

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
      } else {
        setActionSuccessMsg(data.error || `Failed to assign role for ${targetEmail}`);
        fetchAdminData();
      }
    } catch (err: any) {
      console.error(err);
      setActionSuccessMsg(`Error: ${err.message}`);
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
          groqKey: groqKeyInput,
          googleMapsKey: googleMapsKeyInput,
          pageSpeedKey: pageSpeedKeyInput,
          hunterKey: hunterKeyInput,
          apolloKey: apolloKeyInput,
          millionverifierKey: millionVerifierKeyInput,
          serperKey: serperKeyInput,
          serpApiKey: serpApiKeyInput,
          dataforseoLogin: dataforseoLoginInput,
          dataforseoPassword: dataforseoPasswordInput,
          googleSearchApiKey: googleSearchApiKeyInput,
          googleSearchCx: googleSearchCxInput,
          scaleserpKey: scaleSerpKeyInput,
          valueserpKey: valueSerpKeyInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg('Validated & updated Live AI, SEO Intelligence & Search API credentials in database & server environment!');
        if (data.savedKeys) {
          setGeminiKeyInput(data.savedKeys.gemini || '');
          setOpenaiKeyInput(data.savedKeys.openai || '');
          setClaudeKeyInput(data.savedKeys.anthropic || data.savedKeys.claude || '');
          setPerplexityKeyInput(data.savedKeys.perplexity || '');
          setDeepseekKeyInput(data.savedKeys.deepseek || '');
          setGroqKeyInput(data.savedKeys.groq || '');
          setGoogleMapsKeyInput(data.savedKeys.googleMaps || '');
          setPageSpeedKeyInput(data.savedKeys.pageSpeed || '');
          setHunterKeyInput(data.savedKeys.hunter || '');
          setApolloKeyInput(data.savedKeys.apollo || '');
          setMillionVerifierKeyInput(data.savedKeys.millionverifier || data.savedKeys.millionVerifier || '');
          setSerperKeyInput(data.savedKeys.serper || '');
          setSerpApiKeyInput(data.savedKeys.serpapi || '');
          setDataforseoLoginInput(data.savedKeys.dataforseoLogin || '');
          setDataforseoPasswordInput(data.savedKeys.dataforseoPassword || '');
          setGoogleSearchApiKeyInput(data.savedKeys.googleSearchApiKey || '');
          setGoogleSearchCxInput(data.savedKeys.googleSearchCx || '');
          setScaleSerpKeyInput(data.savedKeys.scaleserp || '');
          setValueSerpKeyInput(data.savedKeys.valueserp || '');
        }
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

  const handleValidateAllKeys = async () => {
    setValidatingKeys(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    try {
      const res = await fetch('/api/admin/ai-tokens/validate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg('Completed real-time validation across all AI providers!');
        fetchAiTokenStats();
      } else {
        setActionErrorMsg(data.error || 'Failed to validate API keys.');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Error validating API keys.');
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

  const handleUpdateQuota = async (modelId: string, allocatedTokens: number) => {
    try {
      const res = await fetch('/api/admin/ai-tokens/update-quota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ modelId, allocatedTokens }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(data.message || `Updated quota for ${modelId}`);
        setEditingQuotaModelId(null);
        setCustomQuotaInput('');
        fetchAiTokenStats();
      } else {
        setActionErrorMsg(data.error || 'Failed to update token quota.');
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'Error updating token quota.');
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

  const proMRR = usersTable.filter((u) => u.planTier === 'pro').reduce((acc, u) => acc + (u.billingCycle === 'yearly' ? 20.75 : 29), 0);
  const agencyMRR = usersTable.filter((u) => u.planTier === 'agency').reduce((acc, u) => acc + (u.billingCycle === 'yearly' ? 65.8 : 99), 0);
  const totalMRR = proMRR + agencyMRR;

  // Invoice Payment Stats
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'draft');
  const cancelledInvoices = invoices.filter((i) => i.status === 'overdue' || i.status === 'cancelled');

  const totalPaidRevenue = paidInvoices.reduce((acc, i) => acc + (i.total || 0), 0);
  const totalPendingAmount = pendingInvoices.reduce((acc, i) => acc + (i.total || 0), 0);

  const filteredUsers = usersTable.filter((u) => {
    const matchesSearch = u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.name?.toLowerCase().includes(userSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (userRoleFilter !== 'all') {
      if (userRoleFilter === 'admin' && u.role !== 'admin' && u.role !== 'owner') return false;
      if (userRoleFilter === 'subscriber' && u.role !== 'subscriber') return false;
      if (userRoleFilter === 'customer' && (u.role === 'admin' || u.role === 'owner' || u.role === 'subscriber')) return false;
    }

    if (userAutoRenewFilter !== 'all') {
      if (userAutoRenewFilter === 'on' && u.autoRenew === false) return false;
      if (userAutoRenewFilter === 'off' && u.autoRenew !== false) return false;
    }

    return true;
  });
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
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setUserToDelete(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto my-auto relative">
            <button
              type="button"
              onClick={() => setUserToDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
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

      {/* Transaction Deletion Confirmation Modal */}
      {transactionToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setTransactionToDelete(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto my-auto relative">
            <button
              type="button"
              onClick={() => setTransactionToDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Delete Payment Transaction</h3>
                <p className="text-xs text-slate-500 font-sans">Permanent removal from transaction records</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5 font-mono">
              <p><strong>Transaction ID:</strong> <span className="text-slate-900 font-bold">{transactionToDelete.id}</span></p>
              <p><strong>Customer:</strong> {transactionToDelete.userName || transactionToDelete.userEmail}</p>
              <p><strong>Amount:</strong> ${(transactionToDelete.amount || 0).toFixed(2)} {transactionToDelete.currency || 'USD'}</p>
              <p><strong>Status:</strong> {transactionToDelete.status?.toUpperCase()}</p>
              {transactionToDelete.invoiceId && <p><strong>Invoice:</strong> {transactionToDelete.invoiceId}</p>}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Are you sure you want to permanently delete this transaction record? This will remove the transaction from the cache, disk storage, and database records.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingTxn}
                onClick={() => setTransactionToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTxn}
                onClick={handleConfirmDeleteTransaction}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer font-sans disabled:opacity-50"
              >
                {isDeletingTxn ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
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
          onClick={() => setActiveTab('workspaces')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'workspaces' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-300" />
          <span>Customer Workspaces ({businessesTable.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database_tables')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'database_tables' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-300" />
          <span>Database Tables Inspector</span>
        </button>

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
          onClick={() => {
            setActiveTab('payments');
            fetchTransactionsData();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'payments' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-300" />
          <span>Live Payment Monitoring Hub</span>
          {transactionsTable.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-mono">
              {transactionsTable.length}
            </span>
          )}
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

        <button
          type="button"
          onClick={() => {
            setActiveTab('email_server');
            fetchEmailStatus();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'email_server' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Server className="w-4 h-4 text-emerald-300" />
          <span>Brevo Mail Server</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('provider_access')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'provider_access' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Plan & Provider Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('datasets')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'datasets' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-300" />
          <span>Datasets & Freshness</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('directory_rules')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'directory_rules' ? 'bg-[#059669] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Globe2 className="w-4 h-4 text-emerald-300" />
          <span>Directory Controls</span>
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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
              {/* Role & Auto-Renew Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Filter:</span>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                    userRoleFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({usersTable.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('admin')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                    userRoleFilter === 'admin'
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  Admins
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('subscriber')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                    userRoleFilter === 'subscriber'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Subscribers
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('customer')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                    userRoleFilter === 'customer'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Customers
                </button>

                <span className="text-slate-300 mx-1">|</span>

                <button
                  type="button"
                  onClick={() => setUserAutoRenewFilter(userAutoRenewFilter === 'on' ? 'all' : 'on')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                    userAutoRenewFilter === 'on'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Auto-Renew ON
                </button>
                <button
                  type="button"
                  onClick={() => setUserAutoRenewFilter(userAutoRenewFilter === 'off' ? 'all' : 'off')}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                    userAutoRenewFilter === 'off'
                      ? 'bg-amber-700 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  Auto-Renew OFF
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Showing {filteredUsers.length} of {usersTable.length} accounts
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
                    filteredUsers.map((usr, idx) => (
                      <tr key={`${usr.id || 'usr'}-${usr.email || idx}`} className="hover:bg-slate-50/80 transition-colors">
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
                            <option value="pro">Pro ($29/mo)</option>
                            <option value="agency">Agency ($99/mo)</option>
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
                              onClick={() => {
                                const userBiz =
                                  businessesTable.find((b: any) => b.ownerEmail?.toLowerCase() === usr.email?.toLowerCase()) ||
                                  businesses.find((b: any) => b.ownerEmail?.toLowerCase() === usr.email?.toLowerCase());
                                if (userBiz) {
                                  switchBusiness(userBiz.id);
                                  setAppActiveTab('overview');
                                } else {
                                  alert(`No active business workspace registered for ${usr.email}`);
                                }
                              }}
                              title={`Open workspace for ${usr.name || usr.email}`}
                              className="px-2 py-1 text-[10px] font-bold bg-emerald-50 text-[#059669] hover:bg-emerald-100 rounded border border-emerald-300 cursor-pointer flex items-center gap-1"
                            >
                              <Briefcase className="w-3 h-3 text-[#059669]" />
                              <span>Workspace</span>
                            </button>
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

      {/* TAB: CUSTOMER WORKSPACES & CLIENT BUSINESSES */}
      {activeTab === 'workspaces' && (
        <div className="space-y-6 font-sans">
          {/* Workspaces Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold font-mono uppercase">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Master Cockpit • Customer Workspaces</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white mt-2">
                  Customer Workspaces & Live Dashboards
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  As System Administrator, you have direct authorization to open, inspect, or manage any registered customer workspace in real-time. Switch between client dashboards instantly.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchAdminData()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Workspaces</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAdminDbExport}
                  className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export DB</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Total Workspaces</span>
                <span className="text-xl font-bold font-heading text-white">{businessesTable.length}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Locations Tracked</span>
                <span className="text-xl font-bold font-heading text-emerald-400">{locationsTable.length}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Directory Listings</span>
                <span className="text-xl font-bold font-heading text-purple-300">{directoryProfilesTable.length}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Google Reviews</span>
                <span className="text-xl font-bold font-heading text-amber-300">{reviewsTable.length}</span>
              </div>
            </div>
          </div>

          {/* Search & Workspaces Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search workspace by name, email, or city..."
                  value={workspaceSearchTerm}
                  onChange={(e) => setWorkspaceSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
                />
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Showing {
                  businessesTable.filter((b: any) =>
                    !workspaceSearchTerm ||
                    b.name?.toLowerCase().includes(workspaceSearchTerm.toLowerCase()) ||
                    b.ownerEmail?.toLowerCase().includes(workspaceSearchTerm.toLowerCase()) ||
                    b.city?.toLowerCase().includes(workspaceSearchTerm.toLowerCase())
                  ).length
                } of {businessesTable.length} registered customer workspaces
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="p-3">Business Name</th>
                    <th className="p-3">Owner Email</th>
                    <th className="p-3">Location / Market</th>
                    <th className="p-3">Connected Integrations</th>
                    <th className="p-3">Directory Status</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businessesTable
                    .filter((b: any) =>
                      !workspaceSearchTerm ||
                      b.name?.toLowerCase().includes(workspaceSearchTerm.toLowerCase()) ||
                      b.ownerEmail?.toLowerCase().includes(workspaceSearchTerm.toLowerCase()) ||
                      b.city?.toLowerCase().includes(workspaceSearchTerm.toLowerCase())
                    )
                    .map((biz: any) => {
                      const userLoc = locationsTable.find((l: any) => l.businessId === biz.id);
                      const hasDirectory = directoryProfilesTable.some((p: any) => p.businessId === biz.id || p.businessId === biz.slug);
                      const bizConnections = dataConnectionsTable.filter((c: any) => c.businessId === biz.id);
                      const hasGbp = bizConnections.some((c: any) => c.provider === 'google_gbp' && c.status === 'connected') || Boolean(biz.gbpConnected);
                      const hasGsc = bizConnections.some((c: any) => c.provider === 'google_search_console' && c.status === 'connected');
                      const hasGa4 = bizConnections.some((c: any) => c.provider === 'google_analytics' && c.status === 'connected');

                      return (
                        <tr key={biz.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{biz.name}</span>
                              {user.email?.toLowerCase() === biz.ownerEmail?.toLowerCase() && (
                                <span className="px-1.5 py-0.2 text-[9px] bg-slate-100 text-slate-600 rounded font-mono">My Account</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">ID: {biz.id}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-700 text-[11px]">
                            {biz.ownerEmail || '—'}
                          </td>
                          <td className="p-3 text-slate-600">
                            {biz.city || userLoc?.city ? (
                              <span>
                                {biz.city || userLoc?.city}{biz.state || userLoc?.state ? `, ${biz.state || userLoc?.state}` : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Not set</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="inline-flex items-center gap-1 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  hasGbp
                                    ? 'bg-emerald-50 text-[#059669] border-emerald-300'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                                title={hasGbp ? 'Google Business Profile Connected' : 'Google Business Profile Not Connected'}
                              >
                                GBP {hasGbp ? '✓' : '—'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  hasGsc
                                    ? 'bg-emerald-50 text-[#059669] border-emerald-300'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                                title={hasGsc ? 'Google Search Console Connected' : 'Search Console Not Connected'}
                              >
                                GSC {hasGsc ? '✓' : '—'}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  hasGa4
                                    ? 'bg-emerald-50 text-[#059669] border-emerald-300'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                                title={hasGa4 ? 'Google Analytics 4 Connected' : 'GA4 Not Connected'}
                              >
                                GA4 {hasGa4 ? '✓' : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            {hasDirectory || biz.isPublishedInDirectory ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <Globe2 className="w-3 h-3 text-purple-600" />
                                <span>Published</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                <span>Unpublished</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-100 text-slate-700">
                              {biz.planTier || 'free'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => {
                                  switchBusiness(biz.id);
                                  setAppActiveTab('overview');
                                }}
                                className="px-3 py-1.5 text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                                title={`Open ${biz.name} Workspace Dashboard`}
                              >
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>Open Workspace</span>
                              </button>

                              <button
                                onClick={() => {
                                  switchBusiness(biz.id);
                                  setAppActiveTab('directory');
                                }}
                                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                title="View Directory Listing"
                              >
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                                <span>Directory</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DATABASE TABLES INSPECTOR */}
      {activeTab === 'database_tables' && (
        <div className="space-y-6 font-sans">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold font-mono uppercase">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud SQL PostgreSQL • Live Database Inspector</span>
                </div>
                <h3 className="text-2xl font-bold font-heading text-white mt-2">
                  Relational Database Tables & Live Records
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Direct visibility into production database tables, schemas, and live records across accounts, businesses, locations, directory profiles, and reviews.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAdminData}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh DB</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAdminDbExport}
                  className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export DB (JSON)</span>
                </button>
              </div>
            </div>

            {/* Table Selection Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveDbTable('businesses')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDbTable === 'businesses'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>businessesTable ({businessesTable.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDbTable('locations')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDbTable === 'locations'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>locationsTable ({locationsTable.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDbTable('directoryProfiles')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDbTable === 'directoryProfiles'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>directoryProfilesTable ({directoryProfilesTable.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDbTable('reviews')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDbTable === 'reviews'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>googleReviewsTable ({reviewsTable.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDbTable('dataConnections')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDbTable === 'dataConnections'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>dataConnectionsTable ({dataConnectionsTable.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDbTable('leads')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDbTable === 'leads'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>leadsTable ({leadsTable.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDbTable('users')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDbTable === 'users'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>usersTable ({usersTable.length})</span>
              </button>
            </div>
          </div>

          {/* Active Table Viewer */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search in ${activeDbTable}...`}
                  value={dbSearchTerm}
                  onChange={(e) => setDbSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
                />
              </div>

              <div className="text-xs text-slate-500 font-mono">
                PostgreSQL Engine: <span className="text-[#059669] font-bold">Cloud SQL</span> • Table: <span className="font-bold text-slate-800">{activeDbTable}</span>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[550px] overflow-y-auto">
              {(() => {
                let targetData: any[] = [];
                if (activeDbTable === 'businesses') targetData = businessesTable;
                else if (activeDbTable === 'locations') targetData = locationsTable;
                else if (activeDbTable === 'directoryProfiles') targetData = directoryProfilesTable;
                else if (activeDbTable === 'reviews') targetData = reviewsTable;
                else if (activeDbTable === 'dataConnections') targetData = dataConnectionsTable;
                else if (activeDbTable === 'leads') targetData = leadsTable;
                else if (activeDbTable === 'users') targetData = usersTable;

                const filtered = targetData.filter((row: any) => {
                  if (!dbSearchTerm) return true;
                  return JSON.stringify(row).toLowerCase().includes(dbSearchTerm.toLowerCase());
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      No records found in {activeDbTable} matching "{dbSearchTerm}".
                    </div>
                  );
                }

                const columns = Object.keys(filtered[0] || {}).slice(0, 10);

                return (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0">
                        {columns.map((col) => (
                          <th key={col} className="p-3 font-mono text-[11px] whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {filtered.map((row: any, rIdx: number) => (
                        <tr key={row.id || rIdx} className="hover:bg-slate-50/80 transition-colors">
                          {columns.map((col) => {
                            const val = row[col];
                            const isObj = typeof val === 'object' && val !== null;
                            return (
                              <td key={col} className="p-3 max-w-xs truncate text-slate-700">
                                {isObj ? (
                                  <span className="text-slate-500 truncate block text-[10px]">
                                    {JSON.stringify(val)}
                                  </span>
                                ) : (
                                  String(val ?? '—')
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
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
          {/* AI Models Management & Live Monitoring Dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-bold font-mono uppercase">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Backend AI Model Token & Key Control Hub</span>
                </div>
                <h3 className="text-xl font-bold font-heading text-white mt-1">
                  Live AI Models & Token Monitoring System
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Real-time token allocation, utilization tracking, and live API key management for Anthropic Claude 3.7 / 3.5 and Groq LPUs (Llama 3.3 70B & Mixtral).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRefillTokens(undefined, 5000000)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Refill +5M All Models</span>
                </button>
                <button
                  type="button"
                  onClick={fetchAiTokenStats}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
                  title="Refresh Token Stats"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Total Purchased Quotas</p>
                <p className="text-2xl font-bold font-heading text-white mt-1">
                  {aiStats?.summary ? (aiStats.summary.totalAllocatedTokens / 1000000).toFixed(1) + 'M' : '150.0M'}
                </p>
                <span className="text-[10px] text-slate-500">Allocated Token Pool</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Total Utilized Tokens</p>
                <p className="text-2xl font-bold font-heading text-indigo-400 mt-1">
                  {aiStats?.summary ? (aiStats.summary.totalUsedTokens / 1000000).toFixed(2) + 'M' : '0.00M'}
                </p>
                <span className="text-[10px] text-slate-500">Live Consumed Tokens</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Remaining Available</p>
                <p className="text-2xl font-bold font-heading text-emerald-400 mt-1">
                  {aiStats?.summary ? (aiStats.summary.totalRemainingTokens / 1000000).toFixed(1) + 'M' : '150.0M'}
                </p>
                <span className="text-[10px] text-slate-500">Active Token Balance</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400">Utilization Rate</p>
                <p className="text-2xl font-bold font-heading text-purple-300 mt-1">
                  {aiStats?.summary ? aiStats.summary.utilizationPercentage + '%' : '0.00%'}
                </p>
                <span className="text-[10px] text-slate-500">System Load</span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 col-span-2 sm:col-span-1">
                <p className="text-[11px] text-slate-400">Active Models</p>
                <p className="text-2xl font-bold font-heading text-amber-300 mt-1">
                  {(aiStats?.models || []).filter((m: any) => m.hasCustomKey && m.allocatedTokens > 0).length} / {(aiStats?.models || []).length}
                </p>
                <span className="text-[10px] text-slate-500">Ready in Production</span>
              </div>
            </div>
          </div>

          {/* AI Models Quotas & Search / Filter Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#059669]" />
                  <span>Live AI Models Credit Status, Quotas & Monitoring</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Monitor token depletion, adjust model quotas, and top up individual models dynamically.
                </p>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={aiModelSearch}
                    onChange={(e) => setAiModelSearch(e.target.value)}
                    placeholder="Search model or tier..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#059669] w-44"
                  />
                </div>

                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setAiProviderFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${aiProviderFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    All (Groq & Claude)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiProviderFilter('groq')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${aiProviderFilter === 'groq' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Groq LPU
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiProviderFilter('anthropic')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${aiProviderFilter === 'anthropic' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Claude (Anthropic)
                  </button>
                </div>
              </div>
            </div>

            {/* AI Models Quotas Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(aiStats?.models || [])
                .filter((m: any) => {
                  const matchProvider = aiProviderFilter === 'all' || m.provider?.toLowerCase() === aiProviderFilter.toLowerCase();
                  const matchSearch = !aiModelSearch.trim() ||
                    m.name?.toLowerCase().includes(aiModelSearch.toLowerCase()) ||
                    m.id?.toLowerCase().includes(aiModelSearch.toLowerCase()) ||
                    m.badge?.toLowerCase().includes(aiModelSearch.toLowerCase()) ||
                    m.provider?.toLowerCase().includes(aiModelSearch.toLowerCase());
                  return matchProvider && matchSearch;
                })
                .map((m: any) => {
                  const isActive = m.hasCustomKey && m.allocatedTokens > 0;
                  const isDepleted = isActive && m.remainingTokens <= 0;
                  const isLow = isActive && m.remainingTokens > 0 && (m.remainingTokens / m.allocatedTokens) < 0.15;
                  const usedPct = m.allocatedTokens > 0 ? ((m.usedTokens / m.allocatedTokens) * 100).toFixed(1) : '0.0';
                  const isEditingThisQuota = editingQuotaModelId === m.id;

                  return (
                    <div
                      key={m.id}
                      className={`bg-white border rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between transition-all ${
                        isDepleted
                          ? 'border-rose-300 bg-rose-50/20'
                          : isLow
                          ? 'border-amber-300 bg-amber-50/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                              {m.provider}
                            </span>
                            {m.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {m.badge}
                              </span>
                            )}
                          </div>

                          {m.status === 'invalid_key' ? (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> INVALID KEY
                            </span>
                          ) : isActive ? (
                            isDepleted ? (
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" /> DEPLETED
                              </span>
                            ) : isLow ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-600" /> LOW QUOTA
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" /> ACTIVE
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Key className="w-3 h-3 text-amber-600" /> NO API KEY
                            </span>
                          )}
                        </div>

                        <div>
                          <h5 className="text-sm font-bold font-heading text-slate-900">{m.name}</h5>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Model ID: {m.id}</span>
                        </div>

                        {m.validationError && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 leading-tight">
                            <span className="font-bold">Error:</span> {m.validationError}
                          </div>
                        )}

                        {/* Token Bar & Stats */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500">Remaining Pool</span>
                            <span className="font-bold text-slate-900">
                              {isActive ? `${(m.remainingTokens / 1000000).toFixed(2)}M Tokens` : '0.00M Tokens'}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isDepleted || m.status === 'invalid_key'
                                  ? 'bg-rose-500'
                                  : isLow
                                  ? 'bg-amber-500'
                                  : isActive
                                  ? 'bg-[#059669]'
                                  : 'bg-slate-300'
                              }`}
                              style={{ width: isActive ? `${Math.max(0, 100 - parseFloat(usedPct))}%` : '0%' }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-sans">
                            {isActive ? (
                              <>
                                <span>Used: {(m.usedTokens / 1000000).toFixed(2)}M ({usedPct}%)</span>
                                <span>Quota: {(m.allocatedTokens / 1000000).toFixed(1)}M</span>
                              </>
                            ) : m.status === 'invalid_key' ? (
                              <span className="text-rose-700 font-medium">Authentication failed with provider</span>
                            ) : (
                              <span className="text-amber-700 font-medium">Add API key below to activate tokens</span>
                            )}
                          </div>
                        </div>

                        {/* Custom Quota Inline Editor */}
                        {isEditingThisQuota && (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <label className="block text-[11px] font-bold text-slate-700">Set Exact Token Quota (in Millions)</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="1"
                                min="1"
                                placeholder="e.g. 50"
                                value={customQuotaInput}
                                onChange={(e) => setCustomQuotaInput(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#059669]"
                              />
                              <span className="text-xs text-slate-500 font-bold">M Tokens</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const num = parseFloat(String(customQuotaInput));
                                  if (!isNaN(num) && num > 0) {
                                    handleUpdateQuota(m.id, Math.round(num * 1000000));
                                  }
                                }}
                                className="px-3 py-1.5 bg-[#059669] text-white font-bold rounded-lg text-xs cursor-pointer hover:bg-[#047857]"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingQuotaModelId(null)}
                                className="px-2 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer hover:bg-slate-300"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRefillTokens(m.id, 2000000)}
                          className="flex-1 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer font-sans"
                        >
                          <Plus className="w-3 h-3 text-[#059669]" />
                          <span>+2M Top-Up</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRefillTokens(m.id, 5000000)}
                          className="flex-1 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-800 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer font-sans"
                        >
                          <Plus className="w-3 h-3 text-[#059669]" />
                          <span>+5M Top-Up</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditingThisQuota) {
                              setEditingQuotaModelId(null);
                            } else {
                              setEditingQuotaModelId(m.id);
                              setCustomQuotaInput(m.allocatedTokens > 0 ? (m.allocatedTokens / 1000000).toString() : '20');
                            }
                          }}
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl cursor-pointer"
                          title="Custom Quota"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Live API Keys Management Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-sm font-bold font-heading text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#059669]" />
                  <span>Update Live AI Model API Keys directly from Admin Portal</span>
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Enter live API keys here to replenish model tokens dynamically without modifying codebase files. Keys are validated in real-time before saving.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleValidateAllKeys}
                  disabled={validatingKeys}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${validatingKeys ? 'animate-spin text-[#059669]' : 'text-slate-600'}`} />
                  <span>{validatingKeys ? 'Testing Providers...' : 'Test All Live Keys'}</span>
                </button>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 font-mono">
                  Groq &amp; Claude LLM Engines Configured
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveAiKeys} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Groq LPU */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Groq LPU API Key
                    </label>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      GROQ_API_KEY
                    </span>
                  </div>
                  <input
                    type="password"
                    value={groqKeyInput}
                    onChange={(e) => setGroqKeyInput(e.target.value)}
                    placeholder="gsk_... (Empty = Uses server key)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                  <p className="text-[10px] text-slate-400">
                    Powers Meta Llama 3.3 70B & 3.1 8B on high-speed LPUs (300+ t/s).
                  </p>
                </div>

                {/* 2. Anthropic Claude */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Anthropic Claude API Key
                    </label>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      ANTHROPIC_API_KEY
                    </span>
                  </div>
                  <input
                    type="password"
                    value={claudeKeyInput}
                    onChange={(e) => setClaudeKeyInput(e.target.value)}
                    placeholder="sk-ant-... (Empty = Uses server key)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                  <p className="text-[10px] text-slate-400">
                    Powers Claude 3.7 Sonnet, Claude 3.5 Sonnet & Claude 3.5 Haiku.
                  </p>
                </div>
              </div>

              {/* B2B Live Prospecting & Real-Time Data Integrations Section */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-extrabold font-heading text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live B2B Prospector & Data Integrations</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Required for live business discovery, place details, Lighthouse speed audits, and decision-maker contact intelligence.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 self-start sm:self-auto">
                    Live Data Feeds Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Google Maps / Places API */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${googleMapsKeyInput || aiStats?.apiKeysConfigured?.googleMaps ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Google Places API</span>
                        {googleMapsKeyInput || aiStats?.apiKeysConfigured?.googleMaps ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">INACTIVE</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        GOOGLE_MAPS_API_KEY
                      </span>
                    </div>
                    <input
                      type="password"
                      value={googleMapsKeyInput}
                      onChange={(e) => setGoogleMapsKeyInput(e.target.value)}
                      placeholder="AIzaSy... (Real-time live Google Places feed)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Streams real-time live local businesses, addresses, verified phone numbers, websites, and review counts.
                    </p>
                    <p className="text-[10px] text-slate-600 bg-slate-100/80 px-2 py-1 rounded">
                      <span className="font-semibold text-slate-700">Tip:</span> In Google Cloud Console, set Application restrictions to &ldquo;None&rdquo; or &ldquo;IP addresses&rdquo; so server-side Places calls are not blocked by HTTP referer rules.
                    </p>
                  </div>

                  {/* Google PageSpeed Insights API */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${pageSpeedKeyInput || aiStats?.apiKeysConfigured?.pageSpeed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>PageSpeed Insights API</span>
                        {pageSpeedKeyInput || aiStats?.apiKeysConfigured?.pageSpeed ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">INACTIVE</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        PAGESPEED_API_KEY
                      </span>
                    </div>
                    <input
                      type="password"
                      value={pageSpeedKeyInput}
                      onChange={(e) => setPageSpeedKeyInput(e.target.value)}
                      placeholder="AIzaSy... (Free Google Lighthouse API Key)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Powers live Lighthouse technical performance, SEO, mobile responsiveness, and Core Web Vitals audit.
                    </p>
                  </div>

                  {/* Apollo.io API (Single Source of Truth) */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${apolloKeyInput || aiStats?.apiKeysConfigured?.apollo ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Apollo.io B2B Intelligence</span>
                        {apolloKeyInput || aiStats?.apiKeysConfigured?.apollo ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">ACTIVE (Single Source)</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">INACTIVE</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        APOLLO_API_KEY
                      </span>
                    </div>
                    <input
                      type="password"
                      value={apolloKeyInput}
                      onChange={(e) => setApolloKeyInput(e.target.value)}
                      placeholder="apollo_... (Verified Decision-Maker, LinkedIn & Email)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                    <p className="text-[10px] text-slate-500">
                      <strong>Single Source of Truth:</strong> Automatically provides verified Owner/Executive identities, verified business emails, LinkedIn profile URLs, and direct phone numbers in one call.
                    </p>
                  </div>

                  {/* MillionVerifier Email Deliverability API */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${millionVerifierKeyInput || aiStats?.apiKeysConfigured?.millionverifier ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>MillionVerifier API</span>
                        {millionVerifierKeyInput || aiStats?.apiKeysConfigured?.millionverifier ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">INACTIVE</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        MILLIONVERIFIER_API_KEY
                      </span>
                    </div>
                    <input
                      type="password"
                      value={millionVerifierKeyInput}
                      onChange={(e) => setMillionVerifierKeyInput(e.target.value)}
                      placeholder="mv_... (MillionVerifier API Key)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Performs deep live SMTP deliverability tests, MX checks, and catch-all filtering to ensure 100% verified non-fake emails.
                    </p>
                  </div>

                  {/* Hunter.io API */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${hunterKeyInput || aiStats?.apiKeysConfigured?.hunter ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Hunter.io API</span>
                        {hunterKeyInput || aiStats?.apiKeysConfigured?.hunter ? (
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">INACTIVE</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        HUNTER_API_KEY
                      </span>
                    </div>
                    <input
                      type="password"
                      value={hunterKeyInput}
                      onChange={(e) => setHunterKeyInput(e.target.value)}
                      placeholder="hunter_... (Domain email search)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Enriches domain leads with verified decision-maker email addresses and deliverability confidence scores.
                    </p>
                  </div>
                </div>
              </div>

              {/* REAL-WORLD LIVE SEO & SEARCH ENGINE API CREDENTIALS */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Real-World Live SEO, SERP & Backlink Intelligence Feeds</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                        Live Search Engines
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Powers live keyword matrix positions, organic search volume, backlink audits, and traffic analytics. Unconfigured feeds automatically utilize zero-cost waterfall failover.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Google Custom Search API Key */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${googleSearchApiKeyInput || aiStats?.apiKeysConfigured?.googleSearch ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Google Search API Key</span>
                        {googleSearchApiKeyInput || aiStats?.apiKeysConfigured?.googleSearch ? (
                          <span className="text-[9px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-300">CONFIGURED</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">OPTIONAL</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">GOOGLE_SEARCH_API_KEY</span>
                    </div>
                    <input
                      type="password"
                      value={googleSearchApiKeyInput}
                      onChange={(e) => setGoogleSearchApiKeyInput(e.target.value)}
                      placeholder="AIzaSy... (Google Cloud Console)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-500">Official Google Custom Search JSON API key for real-time site indexation and SERP inspection.</p>
                  </div>

                  {/* Google Custom Search CX */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${googleSearchCxInput || aiStats?.apiKeysConfigured?.googleSearch ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Google Search Engine ID (CX)</span>
                        {googleSearchCxInput || aiStats?.apiKeysConfigured?.googleSearch ? (
                          <span className="text-[9px] font-mono font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-300">CONFIGURED</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">OPTIONAL</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">GOOGLE_SEARCH_CX</span>
                    </div>
                    <input
                      type="text"
                      value={googleSearchCxInput}
                      onChange={(e) => setGoogleSearchCxInput(e.target.value)}
                      placeholder="e.g. 017576662... or search engine ID"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-500">Programmable Search Engine CX identifier from Google Programmable Search Engine control panel.</p>
                  </div>

                  {/* DataForSEO Login */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${dataforseoLoginInput || aiStats?.apiKeysConfigured?.dataforseo ? 'bg-indigo-50/50 border-indigo-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>DataForSEO API Login</span>
                        {dataforseoLoginInput || aiStats?.apiKeysConfigured?.dataforseo ? (
                          <span className="text-[9px] font-mono font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-300">PRO TIER ACTIVE</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">OPTIONAL</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">DATAFORSEO_LOGIN</span>
                    </div>
                    <input
                      type="text"
                      value={dataforseoLoginInput}
                      onChange={(e) => setDataforseoLoginInput(e.target.value)}
                      placeholder="your-email@domain.com (DataForSEO account email)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500">DataForSEO enterprise login email for live Google Domain Rank Overview, Backlinks Summary & Keyword Rankings.</p>
                  </div>

                  {/* DataForSEO Password */}
                  <div className={`p-3.5 rounded-xl space-y-1.5 border transition-all ${dataforseoPasswordInput || aiStats?.apiKeysConfigured?.dataforseo ? 'bg-indigo-50/50 border-indigo-300' : 'bg-slate-50/70 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>DataForSEO API Password / Secret</span>
                        {dataforseoPasswordInput || aiStats?.apiKeysConfigured?.dataforseo ? (
                          <span className="text-[9px] font-mono font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-300">PRO TIER ACTIVE</span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">OPTIONAL</span>
                        )}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">DATAFORSEO_PASSWORD</span>
                    </div>
                    <input
                      type="password"
                      value={dataforseoPasswordInput}
                      onChange={(e) => setDataforseoPasswordInput(e.target.value)}
                      placeholder="DataForSEO API Secret Key"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500">DataForSEO API secret generated from the DataForSEO customer dashboard.</p>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">Active Live Feeds:</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Official Google APIs (Places, Maps, GSC, GA4) + DataForSEO Enterprise
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={validatingKeys}
                  className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] disabled:bg-slate-400 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer font-sans"
                >
                  <RefreshCw className={`w-4 h-4 ${validatingKeys ? 'animate-spin' : 'hidden'}`} />
                  <Save className={`w-4 h-4 ${validatingKeys ? 'hidden' : 'block'}`} />
                  <span>{validatingKeys ? 'Validating & Verifying Live Keys...' : 'Save & Validate All AI Model API Keys'}</span>
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
                <span className="text-xs font-mono text-emerald-700 font-bold">$29 / mo</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-heading text-slate-900">{proCount}</p>
                <p className="text-xs text-emerald-700 font-medium mt-1">MRR: ${proMRR.toLocaleString()} / mo ($249/yr)</p>
              </div>
            </div>

            <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-2xs space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[11px] font-bold rounded-lg uppercase">Agency Unlimited</span>
                <span className="text-xs font-mono text-purple-700 font-bold">$99 / mo</span>
              </div>
              <div>
                <p className="text-3xl font-bold font-heading text-slate-900">{agencyCount}</p>
                <p className="text-xs text-purple-700 font-medium mt-1">MRR: ${agencyMRR.toLocaleString()} / mo ($790/yr)</p>
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
                    <th className="p-3">Monthly Rate</th>
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
                      .map((u, idx) => {
                        const isYearly = u.billingCycle === 'yearly' || u.billingCycle === 'annual';
                        const rate = u.planTier === 'agency' ? (isYearly ? 39 : 49) : (isYearly ? 15 : 19);
                        return (
                          <tr key={`${u.id || 'sub'}-${u.email || idx}`} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-900">{u.email}</td>
                            <td className="p-3 font-bold uppercase text-emerald-700">{u.planTier}</td>
                            <td className="p-3 font-mono text-slate-800">${rate} / mo {isYearly && <span className="text-[10px] text-slate-400 font-sans">(billed annually)</span>}</td>
                            <td className="p-3 text-slate-600 capitalize">{u.billingCycle || 'monthly'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                                Active Subscription
                              </span>
                            </td>
                          </tr>
                        );
                      })
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
                Subscribers receiving weekly local business AI prompt packs via Brevo SMTP & Email Relay.
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
                Manage automated weekly AI prompt pack deliveries to subscribers via Brevo SMTP.
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

      {/* TAB: BREVO MAIL SERVER MANAGEMENT & LIVE DISPATCH TEST */}
      {activeTab === 'email_server' && (
        <div className="space-y-6">
          {/* Header & Server Status Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#059669]" />
                    <span>Brevo SMTP & Transactional Email Engine</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    BREVO SMTP RELAY
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  All transactional emails (Contact Form, Signup Verification, Plan Invoices, Magic Reset Links, and Newsletters) are powered by Brevo SMTP.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchEmailStatus}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Brevo Connection Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SMTP Server Host</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="text-sm font-mono font-bold text-slate-900">
                  {emailStatus?.host || 'smtp-relay.brevo.com'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Port: <strong>{emailStatus?.port || '587'}</strong> (STARTTLS encryption)
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Brevo Account / User</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {emailStatus?.configured ? 'AUTHENTICATED' : 'READY / RELAY'}
                  </span>
                </div>
                <div className="text-sm font-mono font-bold text-slate-900 truncate">
                  {emailStatus?.user || 'support@locoraai.com'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Password / Key: {emailStatus?.hasPassword ? 'Configured in .env' : 'Active'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Default Sender (From)</span>
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                </div>
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {emailStatus?.fromEmail || 'Locora AI <support@locoraai.com>'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Support Inbox: <strong>{emailStatus?.supportEmail || 'support@locoraai.com'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Test Email Dispatch Console */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-[#059669]" />
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                Live Brevo SMTP Test Console
              </h4>
            </div>
            <p className="text-xs text-slate-600">
              Send a test message to any email address to verify that your Brevo SMTP credentials and sender reputation are delivering properly.
            </p>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Recipient Email Address</label>
                  <input
                    type="email"
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    placeholder="e.g., yourname@domain.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject Line</label>
                  <input
                    type="text"
                    value={testEmailSubject}
                    onChange={(e) => setTestEmailSubject(e.target.value)}
                    placeholder="Subject..."
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Test Message Body</label>
                <textarea
                  value={testEmailBody}
                  onChange={(e) => setTestEmailBody(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              {testMailFeedback && (
                <div className={`p-4 rounded-xl text-xs border flex items-start gap-2.5 ${
                  testMailFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {testMailFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{testMailFeedback.message}</div>
                    {testMailFeedback.details && (
                      <div className="font-mono text-[11px] mt-1 text-slate-600">
                        Provider: {testMailFeedback.details.provider} | Message ID: {testMailFeedback.details.messageId}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={sendingTestMail}
                className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                {sendingTestMail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting via Brevo SMTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Test Email via Brevo</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Email Workflows & Triggers */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#059669]" />
              <span>Brevo Transactional Email Triggers & Automated Workflows</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Contact Us Form', desc: 'Alerts support@locoraai.com & sends instant auto-reply ticket to user', status: 'Active' },
                { name: 'Sign-up Verification', desc: 'Dispatches welcome & account registration verification with workspace credentials', status: 'Active' },
                { name: 'Magic Link & Password Reset', desc: 'Sends 1-click magic access links and 6-digit security codes', status: 'Active' },
                { name: 'Whop Invoices & Receipts', desc: 'Issues real-time payment receipts, invoice PDFs, and plan upgrade confirmations', status: 'Active' },
                { name: 'Client Invoices Dispatch', desc: 'Allows workspace users to dispatch client invoices & retainers via Brevo', status: 'Active' },
                { name: 'Weekly Newsletter Pack', desc: 'Delivers weekly AI prompt packs to subscribers table automatically', status: 'Active' },
              ].map((trigger, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{trigger.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{trigger.desc}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {trigger.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Brevo Setup Reference Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-heading">
              <Key className="w-4 h-4" />
              <span>Brevo SMTP Credentials Configuration Guide (.env)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To connect your live Brevo account, retrieve your SMTP key from <strong>Brevo Dashboard → SMTP & API</strong> and ensure the following variables are present in your environment:
            </p>
            <div className="bg-slate-950 p-3.5 rounded-xl font-mono text-[11px] text-emerald-400 space-y-1 overflow-x-auto border border-slate-800">
              <div>BREVO_SMTP_HOST=smtp-relay.brevo.com</div>
              <div>BREVO_SMTP_PORT=587</div>
              <div>BREVO_SMTP_USER=your_brevo_account_email@domain.com</div>
              <div>BREVO_SMTP_PASS=your_brevo_smtp_master_password_or_key</div>
              <div>BREVO_FROM_EMAIL=Locora AI &lt;support@locoraai.com&gt;</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PLAN & PROVIDER ACCESS MATRIX */}
      {activeTab === 'provider_access' && (
        <div className="space-y-6">
          <PlanProviderAccessSummary />
        </div>
      )}

      {/* TAB: EXTERNAL DATASETS & VERIFICATION FRESHNESS */}
      {activeTab === 'datasets' && (
        <div className="space-y-6">
          <DataFreshnessPanel />
        </div>
      )}

      {/* TAB: GLOBAL DIRECTORY GOVERNANCE & MODERATION */}
      {activeTab === 'directory_rules' && (
        <div className="space-y-6">
          <DirectoryAdminPanel />
        </div>
      )}

      {/* TAB 7: LIVE PAYMENT MONITORING HUB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Header Controls & Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#059669]" />
                    <span>Live Payment & Subscription Transaction Monitoring</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    WHOP GATEWAY
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Monitor live checkout orders, memberships, recurring subscriptions, and payment status updates synchronized via Whop Checkout & Webhooks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchTransactionsData}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Transactions</span>
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Volume</span>
                <p className="text-xl font-extrabold text-slate-900 font-mono">
                  ${transactionStats?.totalVolume?.toFixed(2) || '0.00'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {transactionStats?.totalTransactions || transactionsTable.length} Total Records
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Cleared / Success</span>
                <p className="text-xl font-extrabold text-emerald-700 font-mono">
                  {transactionStats?.successCount || 0}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  {transactionStats?.successRate || 100}% Clearance Rate
                </p>
              </div>

              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Gateway Subs</span>
                <p className="text-xl font-extrabold text-blue-700 font-mono">
                  {transactionsTable.filter(t => t.whopDetails?.membershipId || t.whopDetails?.paymentId || t.paymentMethod === 'whop').length}
                </p>
                <p className="text-[10px] text-blue-700">Whop Billing Sync</p>
              </div>

              <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Failed / Cancelled</span>
                <p className="text-xl font-extrabold text-rose-700 font-mono">
                  {(transactionStats?.failedCount || 0) + (transactionStats?.cancelledCount || 0)}
                </p>
                <p className="text-[10px] text-rose-700">Declined or Terminated</p>
              </div>

              <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">Total Refunded</span>
                <p className="text-xl font-extrabold text-purple-700 font-mono">
                  ${transactionStats?.totalRefunded?.toFixed(2) || '0.00'}
                </p>
                <p className="text-[10px] text-purple-700">{transactionStats?.refundedCount || 0} Reversals</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by customer email, name, transaction ID, invoice, Whop/Membership ID..."
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {(['all', 'success', 'pending', 'failed', 'cancel', 'refunded'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTransactionFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap cursor-pointer ${
                      transactionFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st === 'all' ? 'All Statuses' : st === 'success' ? 'Cleared (Success)' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions Data Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-sans font-semibold">
                    <th className="py-3 px-4">TXN ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Plan & Cycle</th>
                    <th className="py-3 px-4">Gateway Reference</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {transactionsTable
                    .filter((txn) => {
                      if (transactionFilter !== 'all' && txn.status !== transactionFilter) return false;
                      if (!transactionSearch) return true;
                      const q = transactionSearch.toLowerCase();
                      const whopPayId = txn.whopDetails?.paymentId?.toString() || '';
                      const whopMemId = txn.whopDetails?.membershipId?.toString() || '';
                      const cardLast4 = txn.cardDetails?.cardLast4 || txn.paymentMethod?.cardLast4 || '';
                      return (
                        txn.id?.toLowerCase().includes(q) ||
                        txn.userEmail?.toLowerCase().includes(q) ||
                        txn.userName?.toLowerCase().includes(q) ||
                        txn.invoiceId?.toLowerCase().includes(q) ||
                        whopPayId.includes(q) ||
                        whopMemId.includes(q) ||
                        cardLast4.includes(q)
                      );
                    })
                    .map((txn) => {
                      const isCleared = txn.status === 'success';
                      const isPending = txn.status === 'pending';
                      const isFailed = txn.status === 'failed';
                      const isCancelled = txn.status === 'cancel' || txn.status === 'cancelled';
                      const isRefunded = txn.status === 'refunded';
                      const isTest = txn.isTestMode === true;
                      const isWhop = txn.paymentMethod === 'whop' || !!txn.whopDetails;

                      return (
                        <tr key={txn.id} className="hover:bg-slate-50/75 transition-colors">
                          {/* ID & Date */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-xs truncate max-w-[130px]">
                                {txn.id}
                              </span>
                              {isTest && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                  TEST
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(txn.createdAt).toLocaleString()}
                            </div>
                            {txn.invoiceId && (
                              <div className="text-[10px] text-[#059669] font-mono font-semibold">
                                {txn.invoiceId}
                              </div>
                            )}
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{txn.userName || txn.userEmail}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{txn.userEmail}</div>
                            {txn.metadata?.companyName && (
                              <div className="text-[10px] text-slate-400 italic">
                                {txn.metadata.companyName}
                              </div>
                            )}
                          </td>

                          {/* Plan */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                              {txn.planTier || txn.plan} • {txn.billingCycle || 'monthly'}
                            </span>
                          </td>

                          {/* Gateway Reference */}
                          <td className="py-3 px-4">
                            <div>
                              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-xs">{isWhop ? 'Whop Checkout' : 'Whop Payments'}</span>
                              </div>
                              {txn.whopDetails?.membershipId && (
                                <div className="text-[9px] font-mono text-emerald-700 font-bold">
                                  Member ID: {txn.whopDetails.membershipId}
                                </div>
                              )}
                              {txn.whopDetails?.paymentId && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Pay ID: {txn.whopDetails.paymentId}
                                </div>
                              )}
                              {txn.cardDetails?.last4 && (
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Card •••• {txn.cardDetails.last4}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            ${(txn.amount || 0).toFixed(2)}
                            {txn.refundAmount && (
                              <div className="text-[10px] text-purple-600 font-semibold">
                                -${(txn.refundAmount || 0).toFixed(2)} refunded
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            {isCleared && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                <span>CLEARED</span>
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                <span>PENDING</span>
                              </span>
                            )}
                            {isFailed && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                                <XCircle className="w-3 h-3" />
                                <span>FAILED</span>
                              </span>
                            )}
                            {isCancelled && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
                                <span>CANCELLED</span>
                              </span>
                            )}
                            {isRefunded && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                                <RotateCcw className="w-3 h-3" />
                                <span>REFUNDED</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Delete Test / Record */}
                              <button
                                onClick={() => setTransactionToDelete(txn)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Transaction Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {transactionsTable.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No transactions registered in payment ledger yet. Real orders via Whop checkout will automatically appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Live Payment Monitoring End */}
    </div>
  );
};
