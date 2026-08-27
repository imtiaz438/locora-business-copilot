import React from 'react';
import { useApp } from '../context/AppContext';
import { LocoraLogo } from './LocoraLogo';
import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  FileSpreadsheet,
  FileText,
  FileEdit,
  Globe,
  MapPin,
  TrendingUp,
  Settings,
  CreditCard,
  Sparkles,
  Lock,
  X,
  Zap,
  ShieldCheck,
  Database,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  requiredPlan?: 'pro' | 'agency';
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { activeTab, setActiveTab, businessProfile, user } = useApp();

  const opsNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Business Chat', icon: MessageSquareText, badge: 'Copilot' },
    { id: 'crm', label: 'Clients (CRM)', icon: Users },
    { id: 'lead_prospector', label: 'Lead Vault & Prospector', icon: Database, badge: 'B2B Leads' },
    { id: 'invoices', label: 'Invoices', icon: FileSpreadsheet },
    { id: 'proposals', label: 'Proposals & Quotes', icon: FileText },
    { id: 'documents', label: 'Document Generator', icon: FileEdit },
    { id: 'website_review', label: 'Website Audit', icon: Globe, badge: 'Lighthouse' },
    { id: 'local_seo', label: 'Local SEO Assistant', icon: MapPin },
    { id: 'marketing_planner', label: 'Marketing Planner', icon: TrendingUp, requiredPlan: 'pro' },
    { id: 'masterclass_kit', label: 'Agency Growth Vault', icon: GraduationCap, badge: '$5k Retainers' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onMobileClose) onMobileClose();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none font-sans text-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleNavClick('dashboard')}
          onKeyDown={(e) => e.key === 'Enter' && handleNavClick('dashboard')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <LocoraLogo
            className="w-10 h-10 flex-shrink-0 group-hover:scale-105 transition-transform"
          />
        </div>

        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Business Workspace Badge */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-slate-800 truncate font-heading">
            {businessProfile.name || 'My Workspace'}
          </p>
          <p className="text-[11px] text-slate-500 truncate capitalize">
            {user.planTier} Tier Plan
          </p>
        </div>
        <button
          onClick={() => handleNavClick('subscription')}
          className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors uppercase cursor-pointer"
        >
          {user.planTier}
        </button>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
            Operating Modules
          </div>
          {opsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'crm' && activeTab === 'projects');
            const isLocked =
              (item.requiredPlan === 'pro' && user.planTier === 'free') ||
              (item.requiredPlan === 'agency' && (user.planTier === 'free' || user.planTier === 'pro'));

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {isLocked && (
                    <span className="p-0.5 rounded text-amber-600 bg-amber-50 border border-amber-200" title="Pro Plan Feature">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                  {item.badge && !isLocked && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual Divider & Settings / Billing */}
        <div className="pt-3 border-t border-slate-200 space-y-1">
          <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-heading">
            System & Billing
          </div>

          <button
            onClick={() => handleNavClick('subscription')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'subscription' || activeTab === 'pricing'
                ? 'bg-[#059669] text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className={`w-4 h-4 ${activeTab === 'subscription' ? 'text-white' : 'text-slate-500'}`} />
              <span>Billing & Plan</span>
            </div>
            {user.planTier === 'free' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                <span>Upgrade</span>
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#059669] text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-slate-500'}`} />
            <span>Settings</span>
          </button>

          {(() => {
            const isAdmin = user.isAuthenticated && (user.role === 'admin' || user.role === 'owner' || user.email === 'imtiazbaloch3322@gmail.com' || user.email === 'support@locoraai.com');
            if (!isAdmin) return null;

            return (
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-emerald-400 font-semibold shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span>Admin Portal</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-emerald-100 text-emerald-800">
                  Admin
                </span>
              </button>
            );
          })()}

          {/* Plan & Credits Summary Widget */}
          <div className="pt-2">
            <div
              onClick={() => handleNavClick('subscription')}
              className="p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold font-heading text-slate-800 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#059669]" />
                  <span>{user.planTier} Plan</span>
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  {user.planTier === 'agency' ? 'Unlimited' : `${Math.max(0, (user.monthlyAiCredits || 250) - (user.aiCreditsUsed || 0))} cr`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#059669] rounded-full transition-all duration-300"
                  style={{
                    width: `${user.planTier === 'agency' ? 100 : Math.min(100, Math.round(((user.aiCreditsUsed || 0) / (user.monthlyAiCredits || 250)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* User Footer Account Link */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => handleNavClick('settings')}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-xs">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="font-semibold text-slate-900 truncate text-[11px] font-heading">{user.name || 'Workspace Account'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 z-30 flex-shrink-0">
        {navContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative flex-1 max-w-xs w-full bg-white h-full z-10 shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
