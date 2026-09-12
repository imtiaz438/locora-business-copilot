import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, PipelineStage, CustomerStatus, CustomerSource } from '../types';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { CSVImportModal } from './CSVImportModal';
import { DeleteConfirmModal } from './common/DeleteConfirmModal';
import { DataProvenanceBadge } from './common/DataProvenanceBadge';
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  MoreVertical,
  Trash2,
  Edit2,
  Building,
  Upload,
  Download,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  UserCheck,
  Layers,
  Lock,
} from 'lucide-react';

export const CRMView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setActiveTab,
    logActivity,
    activeBusiness,
    user,
    setCheckoutModalPlan,
  } = useApp();

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Multi-tenant business customer scoping: Never mix customers between businesses!
  const businessCustomers = useMemo(() => {
    return customers.filter(
      (c) => c.businessId === activeBusiness.id
    );
  }, [customers, activeBusiness.id]);

  // Tabs: All | Leads | Customers | Follow-ups | Lost
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'leads' | 'customers' | 'followups' | 'lost'>('all');
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<PipelineStage | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const defaultService = activeBusiness.services?.[0] || 'General Service';
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: activeBusiness.city || activeBusiness.address || '',
    source: 'manual' as CustomerSource,
    status: 'lead' as CustomerStatus,
    service: defaultService,
    value: 0,
    lastActivity: 'Manually added',
    nextAction: 'Initial contact',
    pipelineStage: 'new_lead' as PipelineStage,
  });

  const pipelineStages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'new_lead', label: 'New Lead', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'contacted', label: 'Contacted', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'qualified', label: 'Qualified', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    { id: 'proposal', label: 'Proposal', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { id: 'won', label: 'Won', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  const getCustomerStage = (c: Customer): PipelineStage => {
    if (c.pipelineStage) return c.pipelineStage;
    if (c.status === 'client' || c.status === 'customer') return 'won';
    if (c.status === 'proposal_sent') return 'proposal';
    if (c.status === 'contacted') return 'contacted';
    return 'new_lead';
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'website_form':
        return { label: 'Website Form', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'imported':
        return { label: 'Imported CSV', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'connected_crm':
        return { label: 'Connected CRM', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'manual':
      default:
        return { label: 'Manual Entry', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Filter based on active business, active tab, pipeline, source, and search
  const filteredCustomers = businessCustomers.filter((c) => {
    const stage = getCustomerStage(c);
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.source || c.leadSource || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by Source
    if (selectedSource !== 'all') {
      const src = c.source || c.leadSource || 'manual';
      if (selectedSource === 'manual' && src !== 'manual') return false;
      if (selectedSource === 'website_form' && src !== 'website_form') return false;
      if (selectedSource === 'imported' && src !== 'imported' && src !== 'Imported CSV') return false;
      if (selectedSource === 'connected_crm' && src !== 'connected_crm') return false;
    }

    // Filter by Pipeline Stage
    if (selectedPipelineStage !== 'all' && stage !== selectedPipelineStage) return false;

    // Filter by Status Tab
    if (activeTabFilter === 'leads') {
      return (
        c.status === 'lead' ||
        c.status === 'prospect' ||
        (stage !== 'won' && c.status !== 'inactive' && c.status !== 'lost')
      );
    }

    if (activeTabFilter === 'customers') {
      return c.status === 'customer' || c.status === 'client' || stage === 'won';
    }

    if (activeTabFilter === 'followups') {
      return Boolean(c.nextAction) && c.status !== 'inactive' && c.status !== 'lost';
    }

    if (activeTabFilter === 'lost') {
      return c.status === 'inactive' || c.status === 'lost';
    }

    return true;
  });

  const handleAdvanceStage = (customer: Customer) => {
    const currentStage = getCustomerStage(customer);
    const order: PipelineStage[] = ['new_lead', 'contacted', 'qualified', 'proposal', 'won'];
    const currentIndex = order.indexOf(currentStage);
    if (currentIndex < order.length - 1) {
      const nextStage = order[currentIndex + 1];
      const nextStatus: CustomerStatus = nextStage === 'won' ? 'customer' : nextStage === 'proposal' ? 'prospect' : 'lead';
      updateCustomer(customer.id, {
        pipelineStage: nextStage,
        status: nextStatus,
        lastActivity: `Advanced to ${nextStage.replace('_', ' ')}`,
        lastContactAt: new Date().toISOString(),
        nextAction: nextStage === 'won' ? 'Onboarding kickoff' : 'Follow up next week',
      });
      logActivity('crm', 'Pipeline Advanced', `${customer.name} moved to ${nextStage.replace('_', ' ')}`);
    }
  };

  const handleCreateOrUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        source: formData.source,
        leadSource: formData.source,
        status: formData.status,
        service: formData.service,
        value: Number(formData.value) || 0,
        lastActivity: formData.lastActivity,
        nextAction: formData.nextAction,
        pipelineStage: formData.pipelineStage,
        businessId: activeBusiness.id,
      });
      setEditingCustomer(null);
    } else {
      addCustomer({
        name: formData.name,
        company: formData.company || 'Private Client',
        email: formData.email,
        phone: formData.phone,
        address: formData.address || activeBusiness.city || 'Local',
        businessId: activeBusiness.id,
        source: formData.source,
        leadSource: formData.source,
        status: formData.status,
        pipelineStage: formData.pipelineStage,
        service: formData.service,
        value: Number(formData.value) || 0,
        lastActivity: 'Manually added',
        lastContactAt: new Date().toISOString(),
        nextAction: formData.nextAction || 'Initial contact',
        tags: [formData.source, formData.service],
      });
      logActivity('crm', 'Customer Created', `Added ${formData.name} (${formData.service}) [Source: ${formData.source}]`);
    }

    setShowAddModal(false);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: activeBusiness.city || '',
      source: 'manual',
      status: 'lead',
      service: defaultService,
      value: 0,
      lastActivity: 'Manually added',
      nextAction: 'Initial contact',
      pipelineStage: 'new_lead',
    });
  };

  const handleExportCSV = () => {
    if (businessCustomers.length === 0) return;
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Address', 'Source', 'Status', 'Pipeline Stage', 'Service', 'Value', 'Last Contact At', 'Created At'];
    const rows = businessCustomers.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.source || c.leadSource || 'manual'}"`,
      `"${c.status || 'lead'}"`,
      `"${c.pipelineStage || 'new_lead'}"`,
      `"${(c.service || '').replace(/"/g, '""')}"`,
      c.value || 0,
      `"${c.lastContactAt || c.last_contact_at || ''}"`,
      `"${c.createdAt || c.created_at || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeBusiness.name.toLowerCase().replace(/\s+/g, '_')}_crm_contacts.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyWebsiteLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/#contact`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Metrics
  const totalValue = businessCustomers.reduce((sum, c) => sum + (c.value || 0), 0);
  const leadsCount = businessCustomers.filter((c) => c.status === 'lead' || c.status === 'prospect').length;
  const activeCustomersCount = businessCustomers.filter((c) => c.status === 'customer' || c.status === 'client' || c.pipelineStage === 'won').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#059669]" />
              <span>Customers</span>
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200">
              {activeBusiness.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Isolated relationship CRM: real contacts, pipelines, activities, and website form leads for {activeBusiness.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            title="Import customer records from CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          {businessCustomers.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              title="Export contacts as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              if (user.planTier === 'free' && businessCustomers.length >= 10) {
                setCheckoutModalPlan('pro');
                return;
              }
              setEditingCustomer(null);
              setFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                address: activeBusiness.city || '',
                source: 'manual',
                status: 'lead',
                service: defaultService,
                value: 0,
                lastActivity: 'Manually added',
                nextAction: 'Initial contact',
                pipelineStage: 'new_lead',
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {user.planTier === 'free' && businessCustomers.length >= 10 ? (
              <Lock className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>
              {user.planTier === 'free' && businessCustomers.length >= 10
                ? 'Unlock Unlimited Leads (Pro)'
                : '+ Add Contact'}
            </span>
          </button>
        </div>
      </div>

      {/* Free Tier Quota Indicator Banner */}
      {user.planTier === 'free' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Free CRM Quota:</strong> {businessCustomers.length} of 10 free contacts tracked. {businessCustomers.length >= 10 ? 'Limit reached. Delete inactive contacts or upgrade to Pro for unlimited leads & pipeline tracking.' : 'Free tier includes up to 10 active contacts.'}
            </span>
          </div>
          {businessCustomers.length >= 10 && (
            <button
              onClick={() => setCheckoutModalPlan('pro')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
            >
              Upgrade to Pro ($29/mo)
            </button>
          )}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{businessCustomers.length}</div>
          <span className="text-[10px] text-slate-500">In {activeBusiness.name}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Leads</span>
          <div className="text-xl font-extrabold text-amber-600 mt-0.5">{leadsCount}</div>
          <span className="text-[10px] text-slate-500">Inbound & prospects</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Won Customers</span>
          <div className="text-xl font-extrabold text-[#059669] mt-0.5">{activeCustomersCount}</div>
          <span className="text-[10px] text-slate-500">Converted clients</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Value</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
            ${totalValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Total deal value</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({businessCustomers.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('leads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTabFilter === 'leads'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Leads ({leadsCount})
          </button>
          <button
            onClick={() => setActiveTabFilter('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTabFilter === 'customers'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customers ({activeCustomersCount})
          </button>
          <button
            onClick={() => setActiveTabFilter('followups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTabFilter === 'followups'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Follow-ups ({businessCustomers.filter((c) => Boolean(c.nextAction) && c.status !== 'inactive').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTabFilter === 'lost'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost ({businessCustomers.filter((c) => c.status === 'inactive' || c.status === 'lost').length})
          </button>
        </div>

        {/* Search & Source Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
            >
              <option value="all">All Sources</option>
              <option value="manual">Manual Entry</option>
              <option value="website_form">Website Form</option>
              <option value="imported">Imported CSV</option>
              <option value="connected_crm">Connected CRM</option>
            </select>
          </div>

          {/* Pipeline Stage Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Stage:</span>
            <select
              value={selectedPipelineStage}
              onChange={(e) => setSelectedPipelineStage(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
            >
              <option value="all">All Stages</option>
              {pipelineStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {businessCustomers.length === 0 ? (
          /* Honest Empty State */
          <div className="p-8 sm:p-12 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto border border-emerald-200">
              <Users className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold font-heading text-slate-900">
                No customers or leads yet.
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your website form or add your first customer.
              </p>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2 text-left">
              {/* Option 1: Add Manually */}
              <div
                onClick={() => {
                  setEditingCustomer(null);
                  setFormData({
                    name: '',
                    company: '',
                    email: '',
                    phone: '',
                    address: activeBusiness.city || '',
                    source: 'manual',
                    status: 'lead',
                    service: defaultService,
                    value: 0,
                    lastActivity: 'Manually added',
                    nextAction: 'Initial contact',
                    pipelineStage: 'new_lead',
                  });
                  setShowAddModal(true);
                }}
                className="p-4 rounded-2xl border border-slate-200 hover:border-[#059669] bg-slate-50 hover:bg-emerald-50/30 transition-all cursor-pointer group space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:border-[#059669] flex items-center justify-center text-[#059669]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#059669]">Add First Contact</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Enter a customer or lead manually with real contact info.</p>
                </div>
              </div>

              {/* Option 2: Import CSV */}
              <div
                onClick={() => setShowCSVModal(true)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 transition-all cursor-pointer group space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:border-blue-500 flex items-center justify-center text-blue-600">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Import CSV</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upload a client spreadsheet to import contacts in bulk.</p>
                </div>
              </div>

              {/* Option 3: Website Form Leads */}
              <div
                onClick={handleCopyWebsiteLink}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 bg-slate-50 hover:bg-purple-50/30 transition-all cursor-pointer group space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:border-purple-500 flex items-center justify-center text-purple-600">
                  {copiedLink ? <Check className="w-4 h-4 text-[#059669]" /> : <Share2 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600">
                    {copiedLink ? 'Link Copied!' : 'Capture Website Leads'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Submissions on your website contact form automatically save here as leads.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-2">
            <Filter className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No contacts match the current filter or search criteria</p>
            <p className="text-slate-400">Try selecting "All Contacts" or clearing your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => {
              const currentStage = getCustomerStage(cust);
              const sourceBadge = getSourceBadge(cust.source || cust.leadSource);

              return (
                <div
                  key={cust.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Top Card Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        onClick={() => setSelectedCustomerForDrawer(cust)}
                        className="cursor-pointer hover:text-[#059669] transition-colors"
                      >
                        <h4 className="font-bold text-slate-900 text-sm font-heading">{cust.name}</h4>
                        {cust.company && (
                          <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{cust.company}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            currentStage === 'won'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : currentStage === 'proposal'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : currentStage === 'qualified'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : currentStage === 'contacted'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {currentStage.replace('_', ' ')}
                        </span>

                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${sourceBadge.bg}`}>
                          {sourceBadge.label}
                        </span>

                        <DataProvenanceBadge
                          type="USER_PROVIDED"
                          customText="✓ User/Website Lead"
                          size="xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Core Customer Attributes */}
                  <div
                    onClick={() => setSelectedCustomerForDrawer(cust)}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs cursor-pointer hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Service:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {cust.service || defaultService}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Value:</span>
                      <span className="font-extrabold text-slate-900 font-mono text-[12px]">
                        {cust.value ? `$${cust.value.toLocaleString()}` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Status:</span>
                      <span className="capitalize font-bold text-slate-700 text-[11px]">
                        {cust.status || 'lead'}
                      </span>
                    </div>
                  </div>

                  {/* Activity & Next Action */}
                  <div
                    onClick={() => setSelectedCustomerForDrawer(cust)}
                    className="space-y-1.5 text-xs pt-1 border-t border-slate-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Last contact:</span>
                      <strong className="text-slate-700 font-medium">
                        {cust.lastContactAt
                          ? new Date(cust.lastContactAt).toLocaleDateString()
                          : cust.lastActivity || 'None logged'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-800 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span className="text-slate-500">Next action:</span>
                      <strong className="text-slate-900 font-semibold">{cust.nextAction || 'None scheduled'}</strong>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {cust.phone && (
                        <a
                          href={`tel:${cust.phone}`}
                          title={`Call ${cust.phone}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {cust.email && (
                        <a
                          href={`mailto:${cust.email}`}
                          title={`Email ${cust.email}`}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setEditingCustomer(cust);
                          setFormData({
                            name: cust.name,
                            company: cust.company || '',
                            email: cust.email || '',
                            phone: cust.phone || '',
                            address: cust.address || '',
                            source: (cust.source || cust.leadSource || 'manual') as CustomerSource,
                            status: cust.status || 'lead',
                            service: cust.service || defaultService,
                            value: cust.value || 0,
                            lastActivity: cust.lastActivity || 'Updated contact',
                            nextAction: cust.nextAction || '',
                            pipelineStage: getCustomerStage(cust),
                          });
                          setShowAddModal(true);
                        }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomerToDelete(cust);
                        }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {currentStage !== 'won' && (
                        <button
                          onClick={() => handleAdvanceStage(cust)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#059669] text-slate-700 hover:text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Advance to next pipeline stage"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedCustomerForDrawer(cust)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Detail Drawer (Activity Timeline, Notes, Tasks) */}
      <CustomerDetailDrawer
        customer={selectedCustomerForDrawer}
        onClose={() => setSelectedCustomerForDrawer(null)}
        onEdit={(cust) => {
          setSelectedCustomerForDrawer(null);
          setEditingCustomer(cust);
          setFormData({
            name: cust.name,
            company: cust.company || '',
            email: cust.email || '',
            phone: cust.phone || '',
            address: cust.address || '',
            source: (cust.source || cust.leadSource || 'manual') as CustomerSource,
            status: cust.status || 'lead',
            service: cust.service || defaultService,
            value: cust.value || 0,
            lastActivity: cust.lastActivity || '',
            nextAction: cust.nextAction || '',
            pipelineStage: getCustomerStage(cust),
          });
          setShowAddModal(true);
        }}
        onStartProposal={() => {
          setSelectedCustomerForDrawer(null);
          setActiveTab('work');
        }}
        onStartInvoice={() => {
          setSelectedCustomerForDrawer(null);
          setActiveTab('invoices');
        }}
      />

      {/* CSV Import Modal */}
      {showCSVModal && (
        <CSVImportModal
          onClose={() => setShowCSVModal(false)}
          onImportComplete={(count) => {
            logActivity('crm', 'CSV Imported', `Imported ${count} contacts into ${activeBusiness.name} CRM`);
          }}
        />
      )}

      {/* Add / Edit Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  {editingCustomer ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Belongs to: <strong>{activeBusiness.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Residential Client"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Service Requested</label>
                  <input
                    type="text"
                    placeholder={defaultService}
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Customer Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as CustomerSource })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="website_form">Website Contact Form</option>
                    <option value="imported">Imported CSV</option>
                    <option value="connected_crm">Connected CRM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="(555) 019-2831"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">CRM Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer (Won)</option>
                    <option value="inactive">Inactive</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pipeline Stage</label>
                  <select
                    value={formData.pipelineStage}
                    onChange={(e) => setFormData({ ...formData, pipelineStage: e.target.value as PipelineStage })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  >
                    <option value="new_lead">1. New Lead</option>
                    <option value="contacted">2. Contacted</option>
                    <option value="qualified">3. Qualified</option>
                    <option value="proposal">4. Proposal Sent</option>
                    <option value="won">5. Won</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Next Action</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule discovery call tomorrow"
                  value={formData.nextAction}
                  onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {editingCustomer ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerToDelete(editingCustomer);
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {editingCustomer ? 'Save Changes' : 'Create Contact'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Safe In-App Customer Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={customerToDelete !== null}
        title="Delete Contact"
        itemName={customerToDelete?.name}
        message="Are you sure you want to permanently delete this contact? Any attached interaction history and pipeline status will be removed."
        confirmLabel="Delete Contact"
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id);
            if (editingCustomer?.id === customerToDelete.id) {
              setShowAddModal(false);
              setEditingCustomer(null);
            }
            if (selectedCustomerForDrawer?.id === customerToDelete.id) {
              setSelectedCustomerForDrawer(null);
            }
            logActivity('crm', 'Deleted Contact', `Removed contact: ${customerToDelete.name}`);
            setCustomerToDelete(null);
          }
        }}
        onClose={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
