import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, PipelineStage } from '../types';
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Sparkles,
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
} from 'lucide-react';

export const CRMView: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setActiveTab,
    logActivity,
  } = useApp();

  // Tabs specified in Section 19: Leads | Customers | Lost | Follow-ups
  const [activeTab, setActiveTabFilter] = useState<'leads' | 'customers' | 'lost' | 'followups'>('leads');
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<PipelineStage | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    leadSource: 'Google',
    service: 'Teeth Whitening',
    value: 850,
    lastActivity: 'Today',
    nextAction: 'Follow up tomorrow',
    pipelineStage: 'new_lead' as PipelineStage,
  });

  const pipelineStages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'new_lead', label: 'New Lead', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'contacted', label: 'Contacted', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'qualified', label: 'Qualified', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
    { id: 'proposal', label: 'Proposal', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    { id: 'won', label: 'Won', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ];

  // Helper to map old statuses to new pipeline stages
  const getCustomerStage = (c: Customer): PipelineStage => {
    if (c.pipelineStage) return c.pipelineStage;
    if (c.status === 'client') return 'won';
    if (c.status === 'proposal_sent') return 'proposal';
    if (c.status === 'contacted') return 'contacted';
    return 'new_lead';
  };

  // Filter based on active tab and search
  const filteredCustomers = customers.filter((c) => {
    const stage = getCustomerStage(c);
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.service || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.leadSource || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'leads') {
      // All stages except won and lost/inactive
      if (c.status === 'inactive') return false;
      if (stage === 'won') return false;
      if (selectedPipelineStage !== 'all' && stage !== selectedPipelineStage) return false;
      return true;
    }

    if (activeTab === 'customers') {
      // Won clients
      return stage === 'won' || c.status === 'client';
    }

    if (activeTab === 'lost') {
      // Lost / Inactive
      return c.status === 'inactive';
    }

    if (activeTab === 'followups') {
      // Customers requiring near-term action or follow-ups
      return Boolean(c.nextAction) && c.status !== 'inactive';
    }

    return true;
  });

  const handleAdvanceStage = (customer: Customer) => {
    const currentStage = getCustomerStage(customer);
    const order: PipelineStage[] = ['new_lead', 'contacted', 'qualified', 'proposal', 'won'];
    const currentIndex = order.indexOf(currentStage);
    if (currentIndex < order.length - 1) {
      const nextStage = order[currentIndex + 1];
      const nextStatus = nextStage === 'won' ? 'client' : nextStage === 'proposal' ? 'proposal_sent' : 'lead';
      updateCustomer(customer.id, {
        pipelineStage: nextStage,
        status: nextStatus,
        lastActivity: 'Just now',
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
        leadSource: formData.leadSource,
        service: formData.service,
        value: Number(formData.value) || 0,
        lastActivity: formData.lastActivity,
        nextAction: formData.nextAction,
        pipelineStage: formData.pipelineStage,
        status: formData.pipelineStage === 'won' ? 'client' : 'lead',
      });
      setEditingCustomer(null);
    } else {
      addCustomer({
        name: formData.name,
        company: formData.company || 'Private Client',
        email: formData.email,
        phone: formData.phone,
        address: 'Austin, TX',
        status: formData.pipelineStage === 'won' ? 'client' : 'lead',
        pipelineStage: formData.pipelineStage,
        leadSource: formData.leadSource,
        service: formData.service,
        value: Number(formData.value) || 0,
        lastActivity: 'Just now',
        nextAction: formData.nextAction || 'Follow up tomorrow',
        tags: [formData.leadSource, formData.service],
      });
      logActivity('crm', 'Lead Created', `Added ${formData.name} (${formData.service})`);
    }

    setShowAddModal(false);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      leadSource: 'Google',
      service: 'Teeth Whitening',
      value: 850,
      lastActivity: 'Today',
      nextAction: 'Follow up tomorrow',
      pipelineStage: 'new_lead',
    });
  };

  const handleStartProposal = (customer: Customer) => {
    // Navigate to Work -> Proposals
    setActiveTab('work');
  };

  // Pipeline Counts
  const stageCounts = pipelineStages.reduce((acc, stage) => {
    acc[stage.id] = customers.filter((c) => getCustomerStage(c) === stage.id && c.status !== 'inactive').length;
    return acc;
  }, {} as Record<PipelineStage, number>);

  const stageValues = pipelineStages.reduce((acc, stage) => {
    acc[stage.id] = customers
      .filter((c) => getCustomerStage(c) === stage.id && c.status !== 'inactive')
      .reduce((sum, c) => sum + (c.value || 0), 0);
    return acc;
  }, {} as Record<PipelineStage, number>);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#059669]" />
            <span>Customers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simplified relationship CRM: track leads, active customers, pipelines, and upcoming follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCustomer(null);
              setFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                leadSource: 'Google',
                service: 'Teeth Whitening',
                value: 850,
                lastActivity: 'Today',
                nextAction: 'Follow up tomorrow',
                pipelineStage: 'new_lead',
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Contact</span>
          </button>
        </div>
      </div>

      {/* Primary Section Tabs: Leads | Customers | Lost | Follow-ups */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setActiveTabFilter('leads');
              setSelectedPipelineStage('all');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Leads ({customers.filter((c) => getCustomerStage(c) !== 'won' && c.status !== 'inactive').length})
          </button>
          <button
            onClick={() => {
              setActiveTabFilter('customers');
              setSelectedPipelineStage('all');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Customers ({customers.filter((c) => getCustomerStage(c) === 'won' || c.status === 'client').length})
          </button>
          <button
            onClick={() => {
              setActiveTabFilter('followups');
              setSelectedPipelineStage('all');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'followups'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Follow-ups ({customers.filter((c) => Boolean(c.nextAction) && c.status !== 'inactive').length})
          </button>
          <button
            onClick={() => {
              setActiveTabFilter('lost');
              setSelectedPipelineStage('all');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Lost ({customers.filter((c) => c.status === 'inactive').length})
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search contacts, services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
          />
        </div>
      </div>

      {/* Section 19 Pipeline: New Lead → Contacted → Qualified → Proposal → Won */}
      {activeTab === 'leads' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-heading">
              Conversion Pipeline
            </span>
            <span className="text-xs text-slate-400">
              Total Active Pipeline: <strong className="text-slate-900">${Object.values(stageValues).reduce((a, b) => a + b, 0).toLocaleString()}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {pipelineStages.map((stage, idx) => {
              const isSelected = selectedPipelineStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedPipelineStage(isSelected ? 'all' : stage.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-[#059669] bg-emerald-50/50 shadow-2xs ring-2 ring-[#059669]/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">0{idx + 1}</span>
                    <span className="text-xs font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {stageCounts[stage.id] || 0}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 font-heading mt-1">{stage.label}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    ${(stageValues[stage.id] || 0).toLocaleString()}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer List / Cards matching the spec:
          Each customer:
          Sarah Johnson
          Lead source: Google
          Service: Teeth Whitening
          Value: $850
          Last activity: Yesterday
          Next action: Follow up tomorrow
      */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing {filteredCustomers.length} {activeTab}</span>
          {selectedPipelineStage !== 'all' && (
            <button
              onClick={() => setSelectedPipelineStage('all')}
              className="text-[#059669] font-bold hover:underline cursor-pointer"
            >
              Clear stage filter
            </button>
          )}
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 font-heading">No contacts found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No contacts match the selected tab or search query. Click "+ Add Contact" to create one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => {
              const currentStage = getCustomerStage(cust);
              return (
                <div
                  key={cust.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-2xs transition-all space-y-4 flex flex-col justify-between"
                >
                  {/* Top: Name & Pipeline Badge */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 font-heading tracking-tight">
                          {cust.name}
                        </h3>
                        {cust.company && (
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{cust.company}</span>
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
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
                    </div>
                  </div>

                  {/* Core Customer Attributes (Section 19 Spec) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Lead source:</span>
                      <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {cust.leadSource || 'Google'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Service:</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                        {cust.service || 'Teeth Whitening'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Value:</span>
                      <span className="font-extrabold text-emerald-950 font-mono text-[13px]">
                        ${(cust.value || 850).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Activity & Next Action (Section 19 Spec) */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Last activity:</span>
                      <strong className="text-slate-700 font-medium">{cust.lastActivity || 'Yesterday'}</strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-800 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      <span className="text-slate-500">Next action:</span>
                      <strong className="text-slate-900 font-semibold">{cust.nextAction || 'Follow up tomorrow'}</strong>
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
                            leadSource: cust.leadSource || 'Google',
                            service: cust.service || 'Teeth Whitening',
                            value: cust.value || 850,
                            lastActivity: cust.lastActivity || 'Yesterday',
                            nextAction: cust.nextAction || 'Follow up tomorrow',
                            pipelineStage: getCustomerStage(cust),
                          });
                          setShowAddModal(true);
                        }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
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
                        onClick={() => handleStartProposal(cust)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#059669] border border-emerald-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Draft Proposal in Work Hub"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Proposal</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingCustomer ? 'Edit Contact' : 'Add New Contact'}
              </h3>
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
                  <label className="block text-slate-700 font-bold mb-1">Company / Suburb</label>
                  <input
                    type="text"
                    placeholder="e.g. Downtown Resident"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Service Requested</label>
                  <input
                    type="text"
                    placeholder="e.g. Teeth Whitening"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  >
                    <option value="Google">Google</option>
                    <option value="Google Maps">Google Maps</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Referral">Referral</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    placeholder="850"
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
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="(512) 555-0192"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pipeline Stage</label>
                  <select
                    value={formData.pipelineStage}
                    onChange={(e) => setFormData({ ...formData, pipelineStage: e.target.value as PipelineStage })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  >
                    <option value="new_lead">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="won">Won (Active Client)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Next Action</label>
                  <input
                    type="text"
                    placeholder="Follow up tomorrow"
                    value={formData.nextAction}
                    onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {editingCustomer ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this contact?')) {
                        deleteCustomer(editingCustomer.id);
                        setShowAddModal(false);
                      }
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
    </div>
  );
};
