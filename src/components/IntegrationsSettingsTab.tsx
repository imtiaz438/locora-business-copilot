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
} from 'lucide-react';

export const IntegrationsSettingsTab: React.FC = () => {
  const { user, activeBusiness, businessTruth, logActivity, setActiveTab, setCheckoutModalPlan } = useApp();

  const businessName = businessTruth?.name ?? activeBusiness?.name ?? 'Business Workspace';

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
  }, [user.email]);

  const handleConnectGa4 = async () => {
    if (isFreePlan) {
      setCheckoutModalPlan('pro');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    await triggerGoogleAnalyticsOAuth({
      userEmail: user.email || '',
      onStart: () => setIsLoading(true),
      onSuccess: (data) => {
        setIsLoading(false);
        setSuccessMsg('Google Analytics 4 linked successfully to your Locora workspace.');
        logActivity('integration', 'Google Analytics 4 Linked', `Property ${data.propertyId || ''} connected`);
        fetchGa4Status();
      },
      onError: (err) => {
        setIsLoading(false);
        setErrorMsg(err || 'Failed to connect Google Analytics 4.');
      },
    });
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

          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold font-heading shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Google Partner API</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Free Plan Gating Alert (According to Pricing Comparison Table: Search Console & GA4 Direct Sync: Free: —, Pro: Direct Sync, Agency: Multi-Property Sync) */}
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

          <div className="flex items-center gap-2">
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
                  onClick={() => setShowDisconnectModal(true)}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnectGa4}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans disabled:opacity-50"
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
                    : 'Connect Google Analytics 4'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Property & Data Overview */}
        {ga4Status.connected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">GA4 Property</span>
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
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <BarChart3 className="w-6 h-6 text-[#059669]" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900 font-heading">
                No Google Analytics Property Connected Yet
              </h5>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Connect your GA4 account to unlock direct session attribution, conversion tracking, and high-precision organic visitor metrics.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleConnectGa4}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                {isFreePlan ? <Lock className="w-4 h-4 text-amber-300" /> : <Zap className="w-4 h-4" />}
                <span>{isFreePlan ? 'Upgrade to Connect GA4 ($29/mo)' : 'Link Google Analytics 4 Now'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Disconnect GA4 Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDisconnectModal}
        title="Disconnect Google Analytics 4"
        itemName={ga4Status.propertyName || ga4Status.propertyId || 'GA4 Property'}
        message="Are you sure you want to disconnect Google Analytics 4 from this business? Real-time organic session streaming will be paused."
        confirmLabel="Disconnect GA4"
        onConfirm={handleDisconnectGa4}
        onClose={() => setShowDisconnectModal(false)}
      />
    </div>
  );
};
