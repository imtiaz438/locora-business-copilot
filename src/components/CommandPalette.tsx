import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
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
  Plus,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    setActiveTab,
    createConversation,
    customers,
    invoices,
    documents,
  } = useApp();

  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navCommands = [
    { id: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard },
    { id: 'chat', label: 'Go to AI Business Chat', category: 'Navigation', icon: MessageSquareText },
    { id: 'crm', label: 'Go to Clients & CRM', category: 'Navigation', icon: Users },
    { id: 'invoices', label: 'Go to Invoices', category: 'Navigation', icon: FileSpreadsheet },
    { id: 'proposals', label: 'Go to Proposals & Quotes', category: 'Navigation', icon: FileText },
    { id: 'documents', label: 'Go to Document Generator', category: 'Navigation', icon: FileEdit },
    { id: 'local_seo', label: 'Go to Local SEO Assistant', category: 'Navigation', icon: MapPin },
    { id: 'website_review', label: 'Go to Website Review', category: 'Navigation', icon: Globe },
    { id: 'marketing_planner', label: 'Go to Marketing Planner', category: 'Navigation', icon: TrendingUp },
    { id: 'settings', label: 'Go to Business Settings', category: 'Navigation', icon: Settings },
    { id: 'subscription', label: 'Go to Billing & Subscription', category: 'Navigation', icon: CreditCard },
  ];

  const actionCommands = [
    {
      id: 'act_chat',
      label: 'Ask AI Copilot a question...',
      action: () => {
        createConversation(query ? `Query: ${query}` : 'Command Palette AI Session');
        setActiveTab('chat');
      },
      icon: Sparkles,
      badge: 'AI Copilot',
    },
    {
      id: 'act_client',
      label: 'Add New Client / Lead',
      action: () => setActiveTab('crm'),
      icon: Plus,
    },
    {
      id: 'act_invoice',
      label: 'Create New Invoice',
      action: () => setActiveTab('invoices'),
      icon: Plus,
    },
    {
      id: 'act_proposal',
      label: 'Draft AI Proposal',
      action: () => setActiveTab('proposals'),
      icon: Plus,
    },
    {
      id: 'act_doc',
      label: 'Generate AI Business Document',
      action: () => setActiveTab('documents'),
      icon: Plus,
    },
    {
      id: 'act_audit',
      label: 'Run Website & Local SEO Audit',
      action: () => setActiveTab('website_review'),
      icon: Globe,
    },
  ];

  const filteredNav = navCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionCommands.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCustomers = customers
    .filter((c) => (c.name + ' ' + (c.company || '')).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredInvoices = invoices
    .filter((i) => (i.invoiceNumber + ' ' + i.customerName).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const filteredDocs = documents
    .filter((d) => d.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3);

  const handleSelectNav = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const handleSelectAction = (actionFn: () => void) => {
    actionFn();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden font-sans">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, clients, invoices, or type a prompt for AI..."
            className="w-full bg-transparent border-0 text-sm font-medium text-slate-900 focus:outline-none placeholder-slate-400 font-sans"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                Quick Actions
              </div>
              <div className="space-y-1">
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => handleSelectAction(act.action)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#059669] transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#059669]" />
                        <span>{act.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {act.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {act.badge}
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                Modules & Views
              </div>
              <div className="space-y-1">
                {filteredNav.map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <button
                      key={nav.id}
                      onClick={() => handleSelectNav(nav.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{nav.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Jump</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Records */}
          {query.length > 0 && (filteredCustomers.length > 0 || filteredInvoices.length > 0 || filteredDocs.length > 0) && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-heading">
                Matching Database Records
              </div>
              <div className="space-y-1">
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectNav('crm')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      <span>{c.name} {c.company ? `(${c.company})` : ''}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">Client</span>
                  </button>
                ))}

                {filteredInvoices.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => handleSelectNav('invoices')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                      <span>{i.invoiceNumber} — {i.customerName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">${i.total}</span>
                  </button>
                ))}

                {filteredDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectNav('documents')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileEdit className="w-3.5 h-3.5 text-amber-600" />
                      <span>{d.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold uppercase">{d.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans">
          <span>Use <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600">Esc</kbd> to close</span>
          <span>Locora AI Command Center</span>
        </div>
      </div>
    </div>
  );
};
