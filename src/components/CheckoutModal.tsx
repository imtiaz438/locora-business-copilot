import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Loader2, Zap } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { checkoutModalPlan, checkoutModalCycle, setCheckoutModalPlan, initiateStripeCheckout } = useApp();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (checkoutModalPlan && !isRedirecting) {
      setIsRedirecting(true);
      initiateStripeCheckout(checkoutModalPlan, checkoutModalCycle)
        .catch((err) => {
          console.error('Checkout redirection failed:', err);
        })
        .finally(() => {
          setIsRedirecting(false);
          setCheckoutModalPlan(null);
        });
    }
  }, [checkoutModalPlan, checkoutModalCycle]);

  if (!checkoutModalPlan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 text-slate-900 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <Zap className="w-8 h-8 animate-pulse text-[#059669]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
            Connecting to Stripe Checkout...
          </h2>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Redirecting you directly to Stripe's 256-bit SSL encrypted checkout page for secure payment processing for the{' '}
            <strong className="text-emerald-700 uppercase">
              {checkoutModalPlan} Plan ({checkoutModalCycle === 'yearly' ? 'Annual Billing - Save 20%' : 'Monthly Billing'})
            </strong>.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-[#059669] font-bold py-2 bg-emerald-50/80 rounded-xl border border-emerald-100">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirecting to Stripe...</span>
        </div>
      </div>
    </div>
  );
};

