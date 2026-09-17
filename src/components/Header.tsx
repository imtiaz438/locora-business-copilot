import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Menu,
  User,
  LogOut,
  Settings,
  CreditCard,
  ChevronDown,
  ShieldCheck,
  Bell,
  Bot,
  PanelRight,
  ShoppingBag,
  Building2,
  Briefcase,
} from 'lucide-react';
import { AiCreditMeter } from './AiCreditMeter';
import { TopBusinessSelector } from './TopBusinessSelector';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenMobileMenu,
}) => {
  const {
    businessProfile,
    setActiveTab,
    activeTab,
    user,
    updateUser,
    setCheckoutModalPlan,
    logout,
    rightAiPanelOpen,
    toggleRightAiPanel,
    priorityActions,
    notifications,
    agencyMode,
    setAgencyMode,
    setGrowthStoreModalOpen,
  } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleToggleAgency = (isAgency: boolean) => {
    setAgencyMode(isAgency);
    if (isAgency) {
      setActiveTab('clients');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="h-18 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs font-sans">
      {/* Left: Mobile Menu Toggle & Top Business Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Top Business / Client Location Selector */}
        <TopBusinessSelector />

        {/* SECTION 38: TOP-LEVEL SWITCH [ My Business ] [ Agency ] */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => handleToggleAgency(false)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
              !agencyMode && activeTab !== 'clients'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[#059669]" />
            <span>My Business</span>
          </button>
          <button
            onClick={() => handleToggleAgency(true)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-heading flex items-center gap-1.5 ${
              agencyMode || activeTab === 'clients'
                ? 'bg-white text-indigo-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Agency</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-800 uppercase font-mono">
              12
            </span>
          </button>
        </div>
      </div>

      {/* Right Actions & User Controls - Fitted cleanly to prevent off-screen overflow */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Toggle Right AI Panel */}
        <button
          onClick={toggleRightAiPanel}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 ${
            rightAiPanelOpen
              ? 'bg-[#059669] text-white shadow-emerald-500/20'
              : 'bg-emerald-50 text-[#059669] hover:bg-emerald-100 border border-emerald-200/80'
          }`}
          title="Toggle AI Manager Assistant"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">AI Manager</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
        </button>

        {/* SECTION 28: Notifications with High-Signal Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors cursor-pointer"
            title="System Notifications & Action Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* AI Credit Meter */}
        <AiCreditMeter />

        {/* Upgrade / Plan CTA Button (Proceeds to Stripe Checkout) */}
        {user.planTier === 'free' ? (
          <button
            id="header_upgrade_to_pro_btn"
            onClick={() => setCheckoutModalPlan('pro')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer font-sans"
            title="Unlock Autonomous AI Fixes, 3-Pack Copilot & 500 Credits"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade Pro ($29)</span>
          </button>
        ) : user.planTier === 'pro' ? (
          <button
            id="header_upgrade_to_agency_btn"
            onClick={() => setCheckoutModalPlan('agency')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer font-sans"
            title="Unlock Multi-Client Portfolios & White-Label Reporting"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade Agency ($99)</span>
          </button>
        ) : null}

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
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 font-sans animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 font-heading">{user.name || 'Account Owner'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-200">
                  <span>{user.planTier} Plan Active</span>
                </div>
              </div>

              {/* Plan Tier Status in Dropdown */}
              <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-heading">
                    Current Plan
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 capitalize font-heading">
                    {user.planTier === 'agency' ? 'Agency Elite' : user.planTier === 'pro' ? 'Pro Growth' : 'Free Starter'}
                  </span>
                </div>
                {user.planTier !== 'agency' && (
                  <button
                    onClick={() => {
                      setCheckoutModalPlan(user.planTier === 'free' ? 'pro' : 'agency');
                      setUserDropdownOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Upgrade</span>
                  </button>
                )}
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
