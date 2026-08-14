import React from 'react';
import { useApp } from '../context/AppContext';
import { LocoraLogo } from './LocoraLogo';

interface BrandedFooterProps {
  className?: string;
}

export const BrandedFooter: React.FC<BrandedFooterProps> = ({ className = '' }) => {
  const { user } = useApp();

  // White-label feature flag: hide Locora footer on Pro Growth and Agency Elite paid subscriber plans
  if (user.planTier === 'pro' || user.planTier === 'agency') {
    return null;
  }

  return (
    <div className={`pt-6 pb-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans ${className}`}>
      <div className="flex items-center gap-1.5 font-medium">
        <LocoraLogo className="w-4 h-4" fillColor="#059669" accentColor="#ffffff" />
        <span>Powered by <strong className="text-slate-700 font-bold font-heading">Locora AI</strong> Business Copilot</span>
      </div>
      <div className="text-[10px] text-slate-400">
        Autonomous Business Operating System
      </div>
    </div>
  );
};
