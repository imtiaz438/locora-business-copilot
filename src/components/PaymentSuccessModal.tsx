import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Receipt, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  Calendar,
  Zap,
  X
} from 'lucide-react';
import { SubscriptionInvoice, UserProfile } from '../types';

interface PaymentSuccessModalProps {
  invoice?: SubscriptionInvoice | null;
  user: UserProfile;
  onClose: () => void;
  onViewInvoice: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  invoice,
  user,
  onClose,
  onViewInvoice,
}) => {
  const membershipId = invoice?.whopMembershipId || user.whopMembershipId || '';
  const paymentId = invoice?.whopPaymentId || invoice?.whopReceiptId || invoice?.transactionId || '';
  const whopCustomerLoginUrl = 'https://whop.com/login?redirect_to=%2Fhub%2Forders';

  const planName = user.planTier === 'agency' ? 'Agency Unlimited' : 'Pro Growth';
  const creditsAmount = user.planTier === 'agency' ? 'Unlimited' : (user.monthlyAiCredits || 250);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-md animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-wide font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Payment Confirmed</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 mt-2">
              Welcome to {planName}!
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your subscription has been activated via Whop. Your account now has full access to all Pro features and AI models.
            </p>
          </div>
        </div>

        {/* Plan Benefits & Order Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-semibold">Active Plan</span>
            <span className="font-bold text-slate-900 uppercase font-heading">{planName} ({user.billingCycle || 'monthly'})</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> AI Copilot Credits
            </span>
            <span className="font-bold text-emerald-700 font-mono">{creditsAmount} Credits / Mo</span>
          </div>

          {membershipId && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Whop Membership</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">{membershipId}</span>
            </div>
          )}

          {paymentId && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold">Receipt / Pay ID</span>
              <span className="font-mono text-slate-700 text-[11px]">{paymentId}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Next Renewal Date
            </span>
            <span className="font-bold text-slate-900 font-mono text-[11px]">
              {user.nextBillingDate ? new Date(user.nextBillingDate).toLocaleDateString() : 'Active (30 Days)'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onViewInvoice}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer font-heading"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>View & Download Official Tax Invoice</span>
          </button>

          <a
            href={whopCustomerLoginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-heading"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign in to Whop Customer Hub</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer font-heading mt-2"
          >
            <span>Start Using Locora AI Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PCI-DSS Level 1 Encrypted • Merchant of Record: Whop Payments Inc.</span>
        </div>
      </div>
    </div>
  );
};
