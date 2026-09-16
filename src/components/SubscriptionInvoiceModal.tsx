import React, { useRef } from 'react';
import { 
  Receipt, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Printer, 
  X, 
  ShieldCheck, 
  CreditCard,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SubscriptionInvoice, UserProfile } from '../types';
import { LocoraLogo } from './LocoraLogo';

interface SubscriptionInvoiceModalProps {
  invoice: SubscriptionInvoice;
  user: UserProfile;
  onClose: () => void;
}

export const SubscriptionInvoiceModal: React.FC<SubscriptionInvoiceModalProps> = ({
  invoice,
  user,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const membershipId = invoice.whopMembershipId || user.whopMembershipId || '';
  const paymentId = invoice.whopPaymentId || invoice.whopReceiptId || invoice.transactionId || '';
  const whopCustomerLoginUrl = 'https://whop.com/login?redirect_to=%2Fhub%2Forders';

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(invoice.date || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(invoice.date || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans animate-fadeIn print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={printRef}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] my-auto flex flex-col print:border-none print:shadow-none print:max-w-none print:w-full print:max-h-none"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:bg-transparent print:text-slate-900 print:border-b print:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold font-heading text-white print:text-slate-900">
                Official Subscription Tax Invoice
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {invoice.id} • {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body Content */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 bg-white">
          {/* Brand & Status Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <LocoraLogo className="w-7 h-7 text-[#059669]" />
                <span className="font-extrabold text-base tracking-tight font-heading text-slate-900">
                  Locora AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Autonomous Local Business Marketing & Client Growth OS
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Merchant of Record: Whop Payments Inc.
              </p>
            </div>

            <div className="sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PAYMENT CLEARED & PAID</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                Processed at {formattedTime}
              </p>
            </div>
          </div>

          {/* Customer & Merchant Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                Billed Customer
              </p>
              <p className="font-bold text-slate-900 text-sm font-heading">
                {invoice.userName || user.name || 'Account Owner'}
              </p>
              <p className="font-mono text-slate-600 text-xs">
                {invoice.userEmail || user.email}
              </p>
              {user.companyName && (
                <p className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{user.companyName}</span>
                </p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                Payment Processor & Order
              </p>
              <p className="font-bold text-slate-900 text-xs">
                Whop Merchant of Record
              </p>
              {membershipId && (
                <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">Member ID:</span>
                  <span className="font-mono text-slate-900 font-bold">{membershipId}</span>
                </div>
              )}
              {paymentId && (
                <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">Receipt / Pay ID:</span>
                  <span className="font-mono text-slate-800">{paymentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Invoice Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-sans tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Period</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 font-heading">
                      {invoice.planName || 'Locora AI Pro Subscription'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Full access to AI Lead Generation, Multi-AI Models, CRM Engine, SEO Audits, and White-label Proposals & Invoices.
                    </p>
                  </td>
                  <td className="py-3.5 px-3 text-center capitalize font-mono text-[11px]">
                    {invoice.billingCycle || 'Monthly'}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">1</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ${(invoice.subtotal || invoice.amount).toFixed(2)} USD
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Summary */}
            <div className="bg-slate-50/60 p-4 border-t border-slate-200 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">${(invoice.subtotal || invoice.amount).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Estimated Tax / VAT (0%)</span>
                <span className="font-mono font-semibold">$0.00 USD</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200 font-heading">
                <span>Total Paid</span>
                <span className="font-mono text-emerald-700 font-extrabold">
                  ${invoice.amount.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>

          {/* Security & Whop Protection Notice */}
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This invoice serves as your official payment receipt. Billed securely through Whop Merchant of Record. 
              All card data is encrypted with PCI-DSS Level 1 security standards.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <a
            href={whopCustomerLoginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer font-heading"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sign in to Whop Customer Hub</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
