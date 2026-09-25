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

  // Direct manual GA4 link modal & Google Cloud help modal states
  const [showManualLinkModal, setShowManualLinkModal] = useState(false);
  const [showGoogleHelpModal, setShowGoogleHelpModal] = useState(false);
  const [manualPropertyId, setManualPropertyId] = useState('');
  const [manualStreamName, setManualStreamName] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [scanWebsiteUrl, setScanWebsiteUrl] = useState(businessWebsite);
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

  // Magic 1-click auto-detect GA4 tag from website
  const handleAutoDetectFromWebsite = async (overrideUrl?: string) => {
    if (isFreePlan) {
      setCheckoutModalPlan('pro');
      return;
    }

    const targetUrl = (overrideUrl || scanWebsiteUrl || businessWebsite || '').trim();
    if (!targetUrl) {
      setShowManualLinkModal(true);
      return;
    }

    setIsDetecting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
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
        // Automatically save connection
        const connRes = await fetch('/api/analytics/ga4/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            propertyId: data.detectedId,
            propertyName: `${businessName} (${data.tagType})`,
          }),
        });
        const connData = await connRes.json();
        if (connRes.ok && connData.success) {
          setSuccessMsg(`Detected & connected ${data.tagType} (${data.detectedId}) from ${targetUrl}!`);
          logActivity('integration', 'Google Analytics Auto-Connected', `Tag ${data.detectedId} detected from ${targetUrl}`);
          setShowManualLinkModal(false);
          setOauthBlockedDetails(null);
          fetchGa4Status();
        } else {
          setErrorMsg(connData.error || 'Found tracking tag, but failed to save connection.');
        }
      } else {
        setErrorMsg(data.error || 'No Google Analytics tracking tag was detected on that website. You can paste your Measurement ID directly.');
        setShowManualLinkModal(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to scan website.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCloseAnyModal = () => {
    setShowManualLinkModal(false);
    setShowGoogleHelpModal(false);
    setShowDisconnectModal(false);
    setIsLoading(false);
    setIsDetecting(false);
    setIsManualSubmitting(false);
  };

  const handleConnectGa4 = async () => {
    if (isFreePlan) {
      setCheckoutModalPlan('pro');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setOauthBlockedDetails(null);

    // Watchdog safety timeout: automatically re-enable button after 35s if popup is abandoned
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
        setShowManualLinkModal(false);
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
      setIsLoading(false);
      setShowDisconnectModal(false);
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
                      setManualPropertyId('');
                      setShowManualLinkModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Key className="w-3 h-3" />
                    <span>Connect Directly via GA4 Property ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleHelpModal(true)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-slate-600" />
                    <span>How to Add Your Email to Test Users</span>
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
                  onClick={handleConnectGa4}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans disabled:opacity-50"
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
                      ? 'Connecting to Google...'
                      : isFreePlan
                      ? 'Upgrade to Connect GA4'
                      : 'Connect via Google OAuth'}
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
                  className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Connect directly using your GA4 Property ID or Measurement ID"
                >
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  <span>Connect via Property ID</span>
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

            {/* 3 User-Friendly Connection Paths */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left pt-1">
              {/* Option 1: Auto-Detect from Website (Zero Technical Knowledge Required) */}
              <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded">
                      Easiest (No Login)
                    </span>
                  </div>
                  <h6 className="text-xs font-bold text-slate-900">Auto-Detect from Website</h6>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    We will automatically scan your site HTML for your active <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">G-XXXXXXXXXX</code> tag.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoDetectFromWebsite()}
                  disabled={isDetecting}
                  className="w-full py-2 px-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Globe className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
                  <span>{isDetecting ? 'Scanning Website...' : 'Scan & Auto-Connect'}</span>
                </button>
              </div>

              {/* Option 2: Google Sign-In (Standard OAuth) */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Google Sign-In
                  </span>
                  <h6 className="text-xs font-bold text-slate-900">Link Google Account</h6>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sign in with your Google account in a secure popup to authorize your analytics data stream.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnectGa4}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>

              {/* Option 3: Paste Measurement ID */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Direct ID
                  </span>
                  <h6 className="text-xs font-bold text-slate-900">Paste Measurement ID</h6>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Already have your GA4 Measurement ID (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">G-12345678</code>)? Paste it here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualLinkModal(true)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  <span>Enter ID Manually</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Direct GA4 Property ID / Stream Link */}
      {showManualLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#059669]" />
                <h4 className="text-base font-bold font-heading text-slate-900">
                  Connect Google Analytics 4 Directly
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
              Connect your Google Analytics 4 stream directly using your GA4 Property ID or Measurement ID. This bypasses the Google OAuth consent screen verification block.
            </p>

            <form onSubmit={handleManualConnectGa4} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>GA4 Property ID or Measurement ID</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g., 384910294 or G-12345ABC</span>
                </label>
                <input
                  type="text"
                  value={manualPropertyId}
                  onChange={(e) => setManualPropertyId(e.target.value)}
                  placeholder="e.g. 384910294 or G-XXXXXXXXXX"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#059669]"
                />
                <p className="text-[11px] text-slate-400">
                  In Google Analytics, find this under <strong>Admin &rarr; Property Settings &rarr; Property Details</strong>.
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

              <div className="pt-2 flex items-center justify-end gap-2.5">
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
                  <span>{isManualSubmitting ? 'Linking Property...' : 'Save & Link GA4'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Google OAuth Verification & Test Users Guide */}
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
                <li>Return to Locora and click <strong>&ldquo;Connect via Google OAuth&rdquo;</strong> &mdash; Google will immediately let you proceed.</li>
              </ol>

              <div className="pt-2 border-t border-slate-100">
                <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">
                  Option B: Connect via GA4 Property ID (Instant, No Verification Required)
                </h5>
                <p className="text-[11px] text-slate-600">
                  You can also click <strong>&ldquo;Connect via Property ID&rdquo;</strong> and enter your GA4 Property ID (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">384910294</code>) or Measurement ID (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">G-XXXXXXXXXX</code>) to link your traffic telemetry directly.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleCloseAnyModal();
                  setShowManualLinkModal(true);
                }}
                className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Use Direct Property ID Link
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
