import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { triggerGoogleAnalyticsOAuth } from '../lib/oauthService';
import { DeleteConfirmModal } from './common/DeleteConfirmModal';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Lock,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
  Key,
  X,
  Info,
  Globe,
  Search,
} from 'lucide-react';

export const IntegrationsSettingsTab: React.FC = () => {
  const { user, activeBusiness, businessTruth, logActivity, setActiveTab, setCheckoutModalPlan } = useApp();

  const businessName = businessTruth?.name ?? activeBusiness?.name ?? 'Business Workspace';
  const businessWebsite = (businessTruth as any)?.website || (activeBusiness as any)?.identity?.website || (activeBusiness as any)?.website || '';

  const [ga4Status, setGa4Status] = useState<{
    connected: boolean;
    propertyId: string | null;
    propertyName: string | null;
    accountName: string | null;
    lastSyncedAt: string | null;
    metrics: any;
  }>({
    connected: false,
    propertyId: null,
    propertyName: null,
    accountName: null,
    lastSyncedAt: null,
    metrics: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Distinct modal states:
  // 1. Dedicated Website Scanner Modal
  const [showAutoDetectModal, setShowAutoDetectModal] = useState(false);
  const [scanWebsiteUrl, setScanWebsiteUrl] = useState(businessWebsite || '');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedTagInfo, setDetectedTagInfo] = useState<{
    id: string;
    type: string;
    scannedUrl: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // 2. Direct Manual ID Modal
  const [showManualLinkModal, setShowManualLinkModal] = useState(false);
  const [manualPropertyId, setManualPropertyId] = useState('');
  const [manualStreamName, setManualStreamName] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  // 3. Google Help Modal
  const [showGoogleHelpModal, setShowGoogleHelpModal] = useState(false);

  const [oauthBlockedDetails, setOauthBlockedDetails] = useState<{
    isAccessDenied?: boolean;
    isUnverifiedApp?: boolean;
  } | null>(null);

  const isFreePlan = user.planTier === 'free';

  const fetchGa4Status = async () => {
    try {
      const res = await fetch(`/api/analytics/ga4/status?email=${encodeURIComponent(user.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        setGa4Status(data);
      }
    } catch (err) {
      console.warn('Could not check GA4 status:', err);
    }
  };

  useEffect(() => {
    fetchGa4Status();
    if (businessWebsite && !scanWebsiteUrl) {
      setScanWebsiteUrl(businessWebsite);
    }
  }, [user.email, businessWebsite]);

  const handleCloseAnyModal = () => {
    setShowAutoDetectModal(false);
    setShowManualLinkModal(false);
    setShowGoogleHelpModal(false);
    setShowDisconnectModal(false);
    setIsLoading(false);
    setIsDetecting(false);
    setIsManualSubmitting(false);
    setScanError(null);
  };

  // Dedicated Website Scanner Action
  const handleScanWebsite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isFreePlan) {
      setCheckoutModalPlan('pro');
      return;
    }

    const targetUrl = (scanWebsiteUrl || businessWebsite || '').trim();
    if (!targetUrl) {
      setScanError('Please enter a website URL to scan (e.g. locoraai.com).');
      return;
    }

    setIsDetecting(true);
    setScanError(null);
    setDetectedTagInfo(null);
    try {
      const res = await fetch('/api/analytics/ga4/detect-from-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.detectedId) {
        setDetectedTagInfo({
          id: data.detectedId,
          type: data.tagType || 'GA4 Measurement ID',
          scannedUrl: data.scannedUrl || targetUrl,
        });
      } else {
        setScanError(data.error || `No Google Analytics tracking code was found on ${targetUrl}.`);
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan website.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Save the detected tag to workspace
  const handleConfirmDetectedTag = async () => {
    if (!detectedTagInfo) return;
    setIsManualSubmitting(true);
    setScanError(null);
    try {
      const connRes = await fetch('/api/analytics/ga4/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          propertyId: detectedTagInfo.id,
          propertyName: `${businessName} (${detectedTagInfo.type})`,
        }),
      });
      const connData = await connRes.json();
      if (connRes.ok && connData.success) {
        setSuccessMsg(`Successfully connected ${detectedTagInfo.type} (${detectedTagInfo.id}) from ${detectedTagInfo.scannedUrl}!`);
        logActivity('integration', 'Google Analytics Auto-Connected', `Tag ${detectedTagInfo.id} auto-detected and linked`);
        handleCloseAnyModal();
        fetchGa4Status();
      } else {
        setScanError(connData.error || 'Failed to save connection.');
      }
    } catch (err: any) {
      setScanError(err.message || 'Error saving connection.');
    } finally {
      setIsManualSubmitting(false);
    }
  };

  // Standard Google OAuth popup
  const handleConnectGa4 = async () => {
    if (isFreePlan) {
      setCheckoutModalPlan('pro');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setOauthBlockedDetails(null);

    const watchdog = setTimeout(() => {
      setIsLoading(false);
    }, 35000);

    await triggerGoogleAnalyticsOAuth({
      userEmail: user.email || '',
      onStart: () => setIsLoading(true),
      onSuccess: (data) => {
        clearTimeout(watchdog);
        setIsLoading(false);
        setSuccessMsg('Google Analytics 4 linked successfully to your Locora workspace.');
        logActivity('integration', 'Google Analytics 4 Linked', `Property ${data.propertyId || ''} connected`);
        fetchGa4Status();
      },
      onError: (err, details) => {
        clearTimeout(watchdog);
        setIsLoading(false);
        setErrorMsg(err || 'Failed to connect Google Analytics 4.');
        if (details?.isAccessDenied || details?.isUnverifiedApp) {
          setOauthBlockedDetails(details);
        }
      },
    });
  };

  // Direct manual ID entry
  const handleManualConnectGa4 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPropertyId.trim()) {
      setErrorMsg('Please enter your GA4 Property ID or Measurement ID (e.g., 384910294 or G-XXXXXXXXXX).');
      return;
    }

    setIsManualSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/analytics/ga4/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          propertyId: manualPropertyId.trim(),
          propertyName: manualStreamName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Google Analytics 4 property (${data.propertyId}) linked successfully!`);
        logActivity('integration', 'Google Analytics 4 Linked', `Property ${data.propertyId} connected directly`);
        handleCloseAnyModal();
        setManualPropertyId('');
        setManualStreamName('');
        setOauthBlockedDetails(null);
        fetchGa4Status();
      } else {
        setErrorMsg(data.error || 'Failed to connect Google Analytics 4 property.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to Google Analytics service.');
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const handleSyncGa4 = async () => {
    if (isFreePlan) {
      setCheckoutModalPlan('pro');
      return;
    }

    setSyncing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/analytics/ga4/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Google Analytics data successfully synchronized.');
        logActivity('integration', 'GA4 Sync Completed', 'Traffic metrics updated');
        fetchGa4Status();
      } else {
        setErrorMsg(data.error || 'Failed to sync Google Analytics.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error during GA4 sync.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectGa4 = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/ga4/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        setSuccessMsg('Google Analytics 4 disconnected.');
        logActivity('integration', 'GA4 Disconnected', 'Google Analytics property unlinked');
        fetchGa4Status();
      } else {
        setErrorMsg('Failed to disconnect GA4.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to disconnect GA4.');
    } finally {
      handleCloseAnyModal();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#059669]" />
              <span>Google Analytics (GA4)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Connect your Google Analytics 4 (GA4) property to monitor verified visitor sessions, bounce rates, and organic traffic performance in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGoogleHelpModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Learn how Google OAuth Verification and Test Users work"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Google Verification Guide</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold font-heading shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Google API</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>

            {/* Diagnostic Troubleshooting Banner when Google Access is Blocked */}
            {oauthBlockedDetails && (
              <div className="mt-2 pt-2 border-t border-rose-200/70 text-slate-700 bg-white/70 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                  <Info className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Why Did Google Block This? (Error 403: access_denied)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Google restricts access to sensitive scopes (<code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">analytics.readonly</code>) while an app is in <strong>Testing</strong> mode in Google Cloud Console. Only Google accounts explicitly added to the <strong>&ldquo;Test users&rdquo;</strong> list can grant consent.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setScanWebsiteUrl(businessWebsite || 'https://locoraai.com');
                      setDetectedTagInfo(null);
                      setScanError(null);
                      setShowAutoDetectModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Auto-Detect Tag from Website</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualPropertyId('');
                      setShowManualLinkModal(true);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Key className="w-3 h-3 text-slate-600" />
                    <span>Enter Property ID Manually</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleHelpModal(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-slate-600" />
                    <span>Whitelist Email in Google Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}
      </div>

      {/* Free Plan Gating Alert */}
      {isFreePlan && (
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50/40 to-white border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                  Pro & Agency Feature
                </span>
                <span className="text-xs font-bold text-slate-800">Google Analytics 4 Direct Sync</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-lg">
                Direct live synchronization with Google Analytics 4 is included on <strong>Pro Growth ($29/mo)</strong> and <strong>Agency Elite ($99/mo)</strong>. Upgrade your plan to stream live Google Analytics data into Locora.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCheckoutModalPlan('pro')}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Unlock Pro ($29/mo)</span>
          </button>
        </div>
      )}

      {/* Google Analytics 4 Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 font-bold shadow-2xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900 font-heading">
                  Google Analytics 4 (GA4) Data Stream
                </h4>
                {ga4Status.connected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <span>Not Connected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active Business: <strong>{businessName}</strong> • Measurement ID & Web Stream
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ga4Status.connected ? (
              <>
                <button
                  onClick={handleSyncGa4}
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Pull latest traffic figures from Google Analytics"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#059669]' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
                <button
                  onClick={() => setShowManualLinkModal(true)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  title="Change linked GA4 property"
                >
                  Edit Property
                </button>
                <button
                  onClick={() => setShowDisconnectModal(true)}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (isFreePlan) {
                      setCheckoutModalPlan('pro');
                      return;
                    }
                    setScanWebsiteUrl(businessWebsite || 'https://locoraai.com');
                    setDetectedTagInfo(null);
                    setScanError(null);
                    setShowAutoDetectModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer font-sans"
                  title="Scan your website to automatically detect GA4 tag"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Auto-Detect from Website</span>
                </button>

                <button
                  onClick={handleConnectGa4}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans disabled:opacity-50"
                  title="Sign in with your Google Account to authorize GA4"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isFreePlan ? (
                    <Lock className="w-4 h-4 text-amber-300" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  <span>
                    {isLoading
                      ? 'Connecting...'
                      : isFreePlan
                      ? 'Upgrade to Connect GA4'
                      : 'Google Sign-In'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (isFreePlan) {
                      setCheckoutModalPlan('pro');
                      return;
                    }
                    setShowManualLinkModal(true);
                  }}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Connect directly using your GA4 Property ID or Measurement ID"
                >
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  <span>Enter ID Manually</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Property & Data Overview */}
        {ga4Status.connected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">GA4 Property / Stream</span>
                <p className="text-xs font-bold text-slate-800 font-mono mt-0.5 truncate">
                  {ga4Status.propertyId || 'properties/384910294'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Stream Name</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                  {ga4Status.propertyName || `${businessName} - Web Stream`}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Last Synced</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                  {ga4Status.lastSyncedAt
                    ? new Date(ga4Status.lastSyncedAt).toLocaleString()
                    : 'Just now'}
                </p>
              </div>
            </div>

            {/* Synced Metric Highlights */}
            {ga4Status.metrics && (
              <div className="pt-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-heading">
                  Synced GA4 Traffic Snapshot (Last 30 Days)
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 text-[11px] block">Total Sessions</span>
                    <span className="text-lg font-extrabold text-emerald-900 font-mono">
                      {(ga4Status.metrics.sessions ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Pageviews</span>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      {(ga4Status.metrics.pageviews ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Bounce Rate</span>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      {ga4Status.metrics.bounceRate ? `${ga4Status.metrics.bounceRate}%` : '—'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Avg Engagement</span>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">
                      {ga4Status.metrics.avgDurationSec ? `${ga4Status.metrics.avgDurationSec}s` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
              <BarChart3 className="w-6 h-6 text-[#059669]" />
            </div>
            <div>
              <h5 className="text-base font-bold text-slate-900 font-heading">
                Connect Google Analytics (GA4) in 1 Click
              </h5>
              <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 leading-relaxed">
                Connect your GA4 stream to sync live visitor sessions, bounce rates, and organic traffic attribution directly into your Locora workspace. Choose the easiest option for you:
              </p>
            </div>

            {/* 3 Distinct User Paths */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left pt-1">
              {/* Option 1: Auto-Detect from Website (Dedicated Scanner) */}
              <div className="p-5 bg-white rounded-2xl border-2 border-emerald-300 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-emerald-400 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                      Easiest (No Login)
                    </span>
                  </div>
                  <h6 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#059669]" />
                    <span>Auto-Detect from Website</span>
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Locora scans your live website HTML, automatically finds your active <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px] text-emerald-800 font-bold">G-XXXXXXXXXX</code> tag, and connects it with 1 click.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isFreePlan) {
                      setCheckoutModalPlan('pro');
                      return;
                    }
                    setScanWebsiteUrl(businessWebsite || 'https://locoraai.com');
                    setDetectedTagInfo(null);
                    setScanError(null);
                    setShowAutoDetectModal(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Scan Website for GA4 Tag</span>
                </button>
              </div>

              {/* Option 2: Google Sign-In (Standard OAuth) */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-slate-300 transition-colors">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Google Sign-In
                  </span>
                  <h6 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-slate-700" />
                    <span>Link Google Account</span>
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sign in with your Google account in a secure popup to authorize your analytics data stream directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnectGa4}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>

              {/* Option 3: Paste Measurement ID / Property ID */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-slate-300 transition-colors">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Direct ID
                  </span>
                  <h6 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-slate-600" />
                    <span>Paste Measurement ID</span>
                  </h6>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Already have your GA4 Measurement ID (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">G-12345678</code>) or Property ID? Paste it directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (isFreePlan) {
                      setCheckoutModalPlan('pro');
                      return;
                    }
                    setShowManualLinkModal(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  <span>Enter ID Manually</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Dedicated Auto-Detect GA4 from Website */}
      {showAutoDetectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#059669]" />
                <h4 className="text-base font-bold font-heading text-slate-900">
                  Auto-Detect Google Analytics from Website
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCloseAnyModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your website URL or domain below. Locora will scan your live website HTML, locate your active Google Analytics tracking tag (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-emerald-800 font-bold">G-XXXXXXXXXX</code>), and activate your connection in seconds &mdash; zero manual IDs or Google logins required.
            </p>

            <form onSubmit={handleScanWebsite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Website URL to Scan</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. locoraai.com or https://yourdomain.com</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={scanWebsiteUrl}
                      onChange={(e) => {
                        setScanWebsiteUrl(e.target.value);
                        setDetectedTagInfo(null);
                        setScanError(null);
                      }}
                      placeholder="e.g. locoraai.com or https://yourdomain.com"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isDetecting}
                    className="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isDetecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>{isDetecting ? 'Scanning...' : 'Scan Website'}</span>
                  </button>
                </div>
              </div>

              {/* Scanning in progress animated feedback */}
              {isDetecting && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-[#059669] animate-spin shrink-0" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block">Scanning live HTML...</span>
                    <span>Analyzing tracking scripts, gtag.js config, and Google Analytics containers on {scanWebsiteUrl}.</span>
                  </div>
                </div>
              )}

              {/* Tag Found Celebration Card */}
              {detectedTagInfo && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-emerald-950">
                        Active Google Analytics Tag Found!
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        We detected an active {detectedTagInfo.type} installed on <strong>{detectedTagInfo.scannedUrl}</strong>:
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-extrabold text-emerald-900 shadow-2xs">
                        <span>{detectedTagInfo.id}</span>
                        <span className="text-[10px] text-slate-500 font-sans font-normal">({detectedTagInfo.type})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-emerald-200/60">
                    <button
                      type="button"
                      onClick={handleCloseAnyModal}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDetectedTag}
                      disabled={isManualSubmitting}
                      className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isManualSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{isManualSubmitting ? 'Connecting...' : `Connect ${detectedTagInfo.id} Now`}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tag Not Found Diagnostic Warning */}
              {scanError && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">No Tag Detected on {scanWebsiteUrl}</span>
                      <span className="text-[11px] text-amber-800">{scanError}</span>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-amber-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseAnyModal();
                        setShowManualLinkModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold border border-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      <span>Enter ID Manually Instead</span>
                    </button>
                  </div>
                </div>
              )}

              {!detectedTagInfo && (
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseAnyModal();
                      setShowManualLinkModal(true);
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Prefer to enter ID manually? Click here</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseAnyModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Direct GA4 Property ID / Stream Link */}
      {showManualLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#059669]" />
                <h4 className="text-base font-bold font-heading text-slate-900">
                  Enter GA4 ID Manually
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCloseAnyModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste your Google Analytics 4 Measurement ID or Property ID. This establishes a direct data connection without requiring Google OAuth sign-in.
            </p>

            <form onSubmit={handleManualConnectGa4} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>GA4 Measurement ID or Property ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. G-12345ABC or 384910294</span>
                </label>
                <input
                  type="text"
                  value={manualPropertyId}
                  onChange={(e) => setManualPropertyId(e.target.value)}
                  placeholder="e.g. G-XXXXXXXXXX or 384910294"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
                <p className="text-[11px] text-slate-400">
                  In Google Analytics, find this under <strong>Admin &rarr; Data Streams &rarr; Measurement ID</strong>.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Stream or Property Name (Optional)
                </label>
                <input
                  type="text"
                  value={manualStreamName}
                  onChange={(e) => setManualStreamName(e.target.value)}
                  placeholder={`e.g. ${businessName} - Web Stream`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseAnyModal();
                    setShowAutoDetectModal(true);
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3 h-3 text-[#059669]" />
                  <span>Scan website instead</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseAnyModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isManualSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isManualSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{isManualSubmitting ? 'Linking...' : 'Save & Link GA4'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Google OAuth Verification & Test Users Guide */}
      {showGoogleHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#059669]" />
                <h4 className="text-base font-bold font-heading text-slate-900">
                  How to Resolve Google OAuth &ldquo;Access Blocked (Error 403)&rdquo;
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCloseAnyModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Why Google Shows &ldquo;Access Blocked: App Has Not Completed Verification&rdquo;</span>
                </div>
                <p className="text-[11px]">
                  Google classifies Google Analytics and Search Console APIs as <strong>Sensitive Scopes</strong>. While an OAuth application is in <strong>&ldquo;Testing&rdquo;</strong> status, Google permits access <strong>exclusively to developer-approved test users</strong>.
                </p>
              </div>

              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider pt-1">
                Option A: Add Your Email to &ldquo;Test Users&rdquo; (Takes 60 Seconds)
              </h5>

              <ol className="list-decimal list-inside space-y-2 pl-1 text-[11px]">
                <li>
                  Open <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-[#059669] font-bold underline">Google Cloud Console &rarr; OAuth Consent Screen</a>.
                </li>
                <li>Select the project containing your Google OAuth Client ID.</li>
                <li>
                  Scroll down to the <strong>&ldquo;Test users&rdquo;</strong> section and click <strong>&ldquo;+ ADD USERS&rdquo;</strong>.
                </li>
                <li>
                  Enter your Google account email (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">{user.email || 'your-google-email@gmail.com'}</code>) and click <strong>Save</strong>.
                </li>
                <li>Return to Locora and click <strong>&ldquo;Sign in with Google&rdquo;</strong> &mdash; Google will immediately let you proceed.</li>
              </ol>

              <div className="pt-2 border-t border-slate-100">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">
                  Option B: Auto-Detect from Website (Instant, Zero Setup)
                </h5>
                <p className="text-[11px] text-slate-600">
                  Click <strong>&ldquo;Auto-Detect from Website&rdquo;</strong> to scan your homepage HTML and extract your GA4 tracking tag in 2 seconds without configuring anything in Google Cloud Console.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleCloseAnyModal();
                  setScanWebsiteUrl(businessWebsite || 'https://locoraai.com');
                  setDetectedTagInfo(null);
                  setScanError(null);
                  setShowAutoDetectModal(true);
                }}
                className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Open Website Auto-Scanner</span>
              </button>
              <button
                type="button"
                onClick={handleCloseAnyModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect GA4 Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDisconnectModal}
        title="Disconnect Google Analytics 4"
        itemName={ga4Status.propertyName || ga4Status.propertyId || 'GA4 Property'}
        message="Are you sure you want to disconnect Google Analytics 4 from this business? Real-time organic session streaming will be paused."
        confirmLabel="Disconnect GA4"
        onConfirm={handleDisconnectGa4}
        onClose={handleCloseAnyModal}
      />
    </div>
  );
};
