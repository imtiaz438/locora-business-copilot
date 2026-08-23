import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Sparkles,
  Download,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
  Clock,
  RefreshCw,
  Mail,
  Copy,
  Check,
  HelpCircle,
  Info,
  XCircle,
  Repeat,
  Receipt,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { BillingCycle, SubscriptionInvoice } from '../types';
import { SubscriptionInvoiceModal } from './SubscriptionInvoiceModal';

export const SubscriptionView: React.FC = () => {
  const { user, subscriptionInvoices, setCheckoutModalPlan, setActiveTab, updateUser, logActivity } = useApp();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [fetchedInvoices, setFetchedInvoices] = useState<SubscriptionInvoice[]>([]);

  // Fetch real-time official invoices from database
  useEffect(() => {
    if (!user.email) return;
    fetch(`/api/user/invoices?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.invoices && data.invoices.length > 0) {
          setFetchedInvoices(data.invoices);
        }
      })
      .catch(() => {});
  }, [user.email, user.planTier, user.subscriptionStatus]);

  const displayInvoices = fetchedInvoices.length > 0 ? fetchedInvoices : subscriptionInvoices;

  const whopMembershipId = user.whopMembershipId || (displayInvoices[0]?.whopMembershipId) || '';
  const whopManageUrl = whopMembershipId
    ? `https://whop.com/billing/manage/${encodeURIComponent(whopMembershipId)}/?callback=%2Flocoraai-com%2F%3FaccountSettings%3Dorders`
    : 'https://whop.com/hub/orders';

  const isAutoRenewOn = user.autoRenew !== false && !user.cancelAtPeriodEnd;
  const creditsUsedPct = Math.min(100, Math.round((user.aiCreditsUsed / user.monthlyAiCredits) * 100));

  const handleToggleAutoRenew = async () => {
    if (toggleLoading) return;
    setToggleLoading(true);
    const turningOff = isAutoRenewOn;
    const endpoint = turningOff ? '/api/user/cancel-auto-renew' : '/api/user/resume-auto-renew';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.user) {
        updateUser({
          autoRenew: data.user.autoRenew,
          cancelAtPeriodEnd: data.user.cancelAtPeriodEnd,
        });
      } else {
        updateUser({
          autoRenew: !turningOff,
          cancelAtPeriodEnd: turningOff,
        });
      }

      logActivity(
        'subscription',
        turningOff ? 'Disabled Auto-Renewal' : 'Resumed Auto-Renewal',
        turningOff
          ? `Auto-renewal disabled for ${user.email}. Active benefits remain until ${new Date(user.nextBillingDate).toLocaleDateString()}.`
          : `Auto-renewal resumed for ${user.email}.`
      );
    } catch (e) {
      updateUser({
        autoRenew: !turningOff,
        cancelAtPeriodEnd: turningOff,
      });
    } finally {
      setToggleLoading(false);
    }
  };


  const handleSwitchBillingCycle = (newCycle: BillingCycle) => {
    if (user.billingCycle === newCycle) return;
    updateUser({ billingCycle: newCycle });
    logActivity('subscription', 'Switched Billing Cycle', `Billing cycle changed to ${newCycle}`);
  };

  const handleCopySupportEmail = () => {
    navigator.clipboard.writeText('support@locoraai.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-6xl mx-auto text-slate-900 font-sans">
      {/* Title & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#059669]" />
            <span>Subscription & Billing Portal</span>
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Manage your Locora AI plan, billing cycles, auto-renewal settings, payment credentials, and invoices.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('pricing')}
          className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer font-sans"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Compare All Plans & Upgrade</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Plan Overview Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-2xs font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] border border-[#059669]/30 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-sans">Current Active Tier</span>
                <h2 className="text-xl font-bold font-heading text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <span>{user.planTier} PLAN</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#059669]/10 text-[#059669] border border-[#059669]/30 rounded-full font-semibold font-sans">
                    {user.subscriptionStatus.toUpperCase()}
                  </span>
                </h2>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold font-heading text-slate-900">
                {user.planTier === 'free'
                  ? '$0/mo'
                  : user.planTier === 'pro'
                  ? user.billingCycle === 'yearly' ? '$15/mo ($180/yr)' : '$19/mo'
                  : user.billingCycle === 'yearly' ? '$39/mo ($468/yr)' : '$49/mo'}
              </p>
              <p className="text-[11px] text-slate-500 capitalize font-sans">{user.billingCycle} billing term</p>
            </div>
          </div>

          {/* Billing Cycle Option Selector (Monthly vs Yearly Renewal) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#059669]" />
                <span className="text-xs font-bold text-slate-900 font-heading">Subscription Renewal Cycle Option</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                Active: <strong className="text-slate-800 uppercase">{user.billingCycle}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSwitchBillingCycle('monthly')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  user.billingCycle === 'monthly'
                    ? 'bg-white border-[#059669] ring-2 ring-[#059669]/20 text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Monthly Renewal</span>
                  {user.billingCycle === 'monthly' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {user.planTier === 'free' ? 'Standard Free' : user.planTier === 'pro' ? '$19/month auto-billed' : '$49/month auto-billed'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchBillingCycle('yearly')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  user.billingCycle === 'yearly'
                    ? 'bg-white border-[#059669] ring-2 ring-[#059669]/20 text-slate-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span>Yearly Renewal</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-[#059669] text-[9px] font-extrabold rounded">
                      SAVE 20%
                    </span>
                  </span>
                  {user.billingCycle === 'yearly' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {user.planTier === 'free' ? 'Standard Free' : user.planTier === 'pro' ? '$15/mo ($180 billed annually)' : '$39/mo ($468 billed annually)'}
                </p>
              </button>
            </div>
          </div>

          {/* User Dashboard Auto-Renew Toggle Option */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-[#059669] ${isAutoRenewOn ? 'animate-spin-slow' : ''}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-heading">
                    Auto-Renew Plan Automatically Option
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Automatically renew at the end of each {user.billingCycle} period.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoRenewOn}
                  onChange={handleToggleAutoRenew}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#059669] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-200/50 text-[11px]">
              <span className="text-slate-600 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                {isAutoRenewOn ? (
                  <span>Auto-renewal is <strong>ENABLED</strong>. Charges recur every {user.billingCycle}.</span>
                ) : (
                  <span className="text-amber-800 font-medium">Auto-renewal is <strong>OFF</strong>. Plan expires at period end without auto-charge.</span>
                )}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                isAutoRenewOn ? 'bg-emerald-100 text-[#059669] border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {isAutoRenewOn ? 'Auto-Renew ON' : 'Auto-Renew OFF'}
              </span>
            </div>
          </div>

          {/* AI Usage Progress Gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Monthly AI Copilot Credits Used</span>
              <span className="font-bold text-[#059669]">
                {user.planTier === 'agency'
                  ? `${user.aiCreditsUsed} / UNLIMITED`
                  : `${user.aiCreditsUsed} / ${user.monthlyAiCredits} Credits`}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  creditsUsedPct > 80 ? 'bg-amber-500' : 'bg-[#059669]'
                }`}
                style={{ width: user.planTier === 'agency' ? '15%' : `${creditsUsedPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-sans">
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {user.email === 'free.user@starterbiz.com' || !user.email
                    ? '15 One-time Demo Credits limit. Sign up for 25 monthly renewing credits.'
                    : `Next renewal date: ${new Date(user.nextBillingDate).toLocaleDateString()}`}
                </span>
              </p>
              <span className="font-semibold text-slate-600 font-mono text-[10px]">
                {user.planTier === 'free'
                  ? user.email === 'free.user@starterbiz.com' || !user.email ? 'One-time Demo' : '25 Credits / Month'
                  : user.planTier === 'pro' ? '250 Credits / Month' : 'Unlimited'}
              </span>
            </div>
          </div>

          {/* Upgrade / Change CTA Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 font-heading">
                {user.planTier === 'agency'
                  ? 'Agency Elite Active (Highest Tier)'
                  : user.planTier === 'pro'
                  ? 'Scale to Unlimited AI Velocity & White-Label'
                  : 'Need higher generation velocity?'}
              </p>
              <p className="text-[11px] text-slate-600 font-sans">
                {user.planTier === 'agency'
                  ? 'You have Unlimited AI Generations, 5 team seats, and white-label report cards unlocked.'
                  : user.planTier === 'pro'
                  ? 'You are on Pro Growth (250 credits/mo). Upgrade to Agency Elite ($49/mo) for Unlimited AI Credits.'
                  : 'Upgrade to Pro Growth ($19/mo) for 250 Credits or Agency Elite ($49/mo) for Unlimited Credits.'}
              </p>
            </div>

            {user.planTier === 'agency' ? (
              <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-xl border border-indigo-200 flex-shrink-0 font-sans">
                Active Elite Tier
              </span>
            ) : user.planTier === 'pro' ? (
              <button
                id="upgrade_to_agency_btn_sub_view"
                onClick={() => setCheckoutModalPlan('agency', user.billingCycle)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex-shrink-0 cursor-pointer font-sans"
              >
                Upgrade to Agency Elite
              </button>
            ) : (
              <button
                id="upgrade_to_pro_btn_sub_view"
                onClick={() => setCheckoutModalPlan('pro', user.billingCycle)}
                className="px-3.5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex-shrink-0 cursor-pointer font-sans"
              >
                Upgrade to Pro Growth
              </button>
            )}
          </div>
        </div>

        {/* Payment Method Card & Support Instructions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-2xs font-sans">
            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Payment Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Primary payment method on file processed via Whop Merchant of Record & Checkout.
              </p>

              {user.paymentMethod && user.paymentMethod.cardLast4 && user.paymentMethod.cardLast4 !== '4242' && user.planTier !== 'free' ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md uppercase font-heading">
                        {user.paymentMethod.cardBrand || 'Card'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Whop Billing</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  </div>
                  <p className="text-lg font-mono font-bold text-slate-800 tracking-wider">
                    •••• •••• •••• {user.paymentMethod.cardLast4}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Expires {user.paymentMethod.expDate}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> PCI-DSS Level 1 Secure
                    </span>
                  </div>
                  <div className="pt-2">
                    <a
                      href={whopManageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer font-heading"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Manage Subscription & Orders on Whop</span>
                    </a>
                  </div>
                </div>
              ) : user.planTier !== 'free' ? (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-md uppercase font-heading">
                        Whop Merchant of Record
                      </span>
                      <span className="text-[11px] text-emerald-800 font-semibold">Active Plan</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Recurring payment is vault-encrypted & managed via <strong>Whop Payments Inc.</strong> PCI-DSS Level 1 compliant infrastructure.
                  </p>
                  {whopMembershipId && (
                    <div className="p-2.5 bg-white/80 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-semibold">Whop Member ID:</span>
                      <span className="font-mono font-bold text-slate-900">{whopMembershipId}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <a
                      href={whopManageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer font-heading"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Manage on Whop Hub</span>
                    </a>
                    {displayInvoices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(displayInvoices[0])}
                        className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-50/80 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                  <div className="w-9 h-9 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">No payment method on file</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Free starter plan active. Payment credentials will be securely linked when you upgrade.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {user.planTier === 'free' && (
              <div className="pt-1">
                <button
                  onClick={() => setCheckoutModalPlan('pro', user.billingCycle || 'monthly')}
                  className="w-full py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade Plan to Add Payment Method</span>
                </button>
              </div>
            )}
          </div>

          {/* Cancellation & Refund Support Instructions Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs font-sans">
            <div className="flex items-center gap-2 text-slate-900 font-bold font-heading text-sm">
              <Mail className="w-4 h-4 text-[#059669]" />
              <span>Plan Cancellation & Refund Support</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              To cancel or request a refund for your subscription, please drop an email to our support team at{' '}
              <strong className="text-slate-900 font-mono">support@locoraai.com</strong>. Our team will review and take action within <strong>48 hours</strong>.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-700">
                <span>support@locoraai.com</span>
                <button
                  type="button"
                  onClick={handleCopySupportEmail}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-sans font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-[#059669]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Request Plan Cancellation or Refund</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Invoices History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xs font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold font-heading text-slate-900">Billing & Invoice History</h3>
            <p className="text-xs text-slate-500">Official printable tax invoices and Whop transaction receipts.</p>
          </div>
          {whopMembershipId && (
            <a
              href={whopManageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Whop Orders Hub</span>
            </a>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-sans">
                <th className="py-2.5 px-3">Invoice ID</th>
                <th className="py-2.5 px-3">Billing Date</th>
                <th className="py-2.5 px-3">Subscription Plan</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Official Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {displayInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:underline text-slate-900 cursor-pointer font-bold"
                    >
                      {inv.id}
                    </button>
                  </td>
                  <td className="py-3 px-3">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{inv.planName}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">${inv.amount.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] text-[10px] font-bold border border-[#059669]/30">
                      PAID
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-[#059669] hover:text-[#047857] transition-colors inline-flex items-center gap-1 cursor-pointer font-bold text-[11px]"
                      title="View & Download PDF Invoice"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>View Tax Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Tax Invoice Modal */}
      {selectedInvoice && (
        <SubscriptionInvoiceModal
          invoice={selectedInvoice}
          user={user}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Subscription Cancellation / Refund</h3>
                <p className="text-xs text-slate-500">Locora Support Team Guidance</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <p className="font-semibold text-slate-900">Cancellation Instructions:</p>
                <p>
                  To cancel or request a refund for your subscription, please drop an email to our support team at{' '}
                  <a
                    href={`mailto:support@locoraai.com?subject=Subscription%20Cancellation%20or%20Refund%20Request%20-%20${encodeURIComponent(user.email)}&body=Hi%20Locora%20Support%20Team%2C%0A%0AI%20would%20like%20to%20request%20cancellation%2Frefund%20for%20my%20account%3A%20${encodeURIComponent(user.email)}.%0A%0AThank%20you!`}
                    className="font-mono text-[#059669] font-bold underline"
                  >
                    support@locoraai.com
                  </a>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Our team will review and take action within <strong>48 hours</strong>.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setActiveTab('refund');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Read our Cancellation & Refund Policy</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Account Email Detected:</span>
                </p>
                <p className="font-mono">{user.email || 'Your registered email'}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={`mailto:support@locoraai.com?subject=Subscription%20Cancellation%20or%20Refund%20Request%20-%20${encodeURIComponent(user.email)}&body=Hi%20Locora%20Support%20Team%2C%0A%0AI%20would%20like%20to%20request%20cancellation%2Frefund%20for%20my%20account%3A%20${encodeURIComponent(user.email)}.%0A%0AThank%20you!`}
                className="flex-1 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-2xs text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Open Email App</span>
              </a>

              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

