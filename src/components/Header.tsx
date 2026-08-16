import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Search,
  Menu,
  User,
  LogOut,
  Globe,
  Settings,
  CreditCard,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { AiCreditMeter } from './AiCreditMeter';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenMobileMenu,
}) => {
  const { businessProfile, setActiveTab, user, setCheckoutModalPlan, logout } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs font-sans">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 font-heading">
            <span>{businessProfile.name || 'Locora AI Workspace'}</span>
          </h1>
          <p className="text-[11px] text-slate-500 font-sans">
            {businessProfile.tagline || 'Business Operating System'}
          </p>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-500 font-medium transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            <span className="hidden sm:inline">Search commands, clients, invoices...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Actions & User Controls */}
      <div className="flex items-center gap-2.5">
        {/* Switch to Public Site */}
        <button
          onClick={() => setActiveTab('home')}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-[#059669] transition-colors cursor-pointer font-sans"
          title="View Public Marketing Site"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Public Site</span>
        </button>

        {/* AI Credit Meter (Always Visible) */}
        <AiCreditMeter />

        {/* Upgrade Callout if Free Tier */}
        {user.planTier === 'free' && (
          <button
            onClick={() => setCheckoutModalPlan('pro')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer font-sans"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade</span>
          </button>
        )}

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 font-sans animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 font-heading">{user.name || 'Account Owner'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-200">
                  <span>{user.planTier} Member</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('subscription');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Billing & Subscription</span>
                </button>

                {(user.role === 'admin' || user.role === 'owner' || user.email === 'imtiazbaloch3322@gmail.com' || user.email === 'support@locoraai.com') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('admin');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#059669] hover:bg-emerald-50 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold">Admin Portal</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                      Admin
                    </span>
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                    setActiveTab('home');
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
