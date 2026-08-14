import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Menu, X, LayoutDashboard, LogIn, LogOut, UserPlus } from 'lucide-react';
import { LocoraLogo } from '../LocoraLogo';

export const PublicNavbar: React.FC = () => {
  const { activeTab, setActiveTab, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'industry_pseo', label: 'Industries' },
    { id: 'pricing_public', label: 'Pricing' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-colors shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo Lockup */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('home')}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('home')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <LocoraLogo
            className="w-12 h-12 flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id || (link.id === 'pricing_public' && activeTab === 'pricing');
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {user.isAuthenticated ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch Dashboard</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setActiveTab('home');
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                title="Sign Out of Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('login')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer font-sans ${
                  activeTab === 'login'
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-[#059669]" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-3 animate-in slide-in-from-top-2 font-sans">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === link.id
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
            {user.isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-[#059669] text-white font-bold text-sm rounded-xl shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to App Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setActiveTab('home');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-xl text-center border border-slate-200 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 bg-[#059669] text-white text-xs font-bold rounded-xl text-center shadow-xs cursor-pointer"
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
