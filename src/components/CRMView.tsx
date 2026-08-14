import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerStatus, Project, Note } from '../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  FolderKanban,
  FileText,
  Building,
  Mail,
  Phone,
  Tag,
  DollarSign,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle,
  MoreVertical,
  Briefcase,
  Sparkles,
} from 'lucide-react';

interface CRMViewProps {
  initialTab?: 'customers' | 'pipeline' | 'projects' | 'notes';
}

export const CRMView: React.FC<CRMViewProps> = ({ initialTab = 'customers' }) => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    projects,
    addProject,
    deleteProject,
    notes,
    addNote,
    deleteNote,
    createConversation,
    setActiveTab,
    user,
    setCheckoutModalPlan,
  } = useApp();

  const [activeTab, setCrmTab] = useState<'customers' | 'pipeline' | 'projects' | 'notes'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setCrmTab(initialTab);
    }
  }, [initialTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // New Customer Form State
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custStatus, setCustStatus] = useState<CustomerStatus>('lead');
  const [custValue, setCustValue] = useState(2500);

  // New Project Form State
  const [projTitle, setProjTitle] = useState('');
  const [projCustomer, setProjCustomer] = useState(customers[0]?.id || '');
  const [projBudget, setProjBudget] = useState(3000);
  const [projTargetDate, setProjTargetDate] = useState('2026-09-01');

  // New Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName) return;
    if (user.planTier === 'free' && customers.length >= 10) {
      alert('Free Starter plan includes up to 10 contacts. Upgrade to Pro Growth ($19/mo) for Unlimited Contacts.');
      setCheckoutModalPlan('pro');
      return;
    }
    addCustomer({
      name: custName,
      company: custCompany,
      email: custEmail,
      phone: custPhone,
      address: 'Austin, TX',
      status: custStatus,
      value: custValue,
      tags: ['New Lead'],
    });
    setCustName('');
    setCustCompany('');
    setCustEmail('');
    setCustPhone('');
    setShowAddCustomerModal(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle) return;
    const selectedCustObj = customers.find((c) => c.id === projCustomer);
    addProject({
      title: projTitle,
      customerId: projCustomer,
      customerName: selectedCustObj ? selectedCustObj.name : 'Unassigned Client',
      status: 'planning',
      budget: projBudget,
      startDate: new Date().toISOString().split('T')[0],
      targetDate: projTargetDate,
      description: 'Project launched via Locora Business Copilot CRM.',
      tasks: [{ id: 't1', title: 'Initial Kick-off & Discovery', completed: false }],
    });
    setProjTitle('');
    setShowAddProjectModal(false);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    addNote({
      title: noteTitle,
      content: noteContent,
      category: 'general',
    });
    setNoteTitle('');
    setNoteContent('');
    setShowAddNoteModal(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pipelineStages: { stage: CustomerStatus; label: string; color: string }[] = [
    { stage: 'lead', label: 'New Leads', color: 'border-amber-200 bg-amber-50 text-amber-800' },
    { stage: 'contacted', label: 'Contacted', color: 'border-blue-200 bg-blue-50 text-blue-800' },
    { stage: 'proposal_sent', label: 'Proposal Sent', color: 'border-purple-200 bg-purple-50 text-purple-800' },
    { stage: 'client', label: 'Active Clients', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#059669]" />
            <span>Customer Relationship Management (CRM)</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Track leads, client pipelines, ongoing projects, and operational notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'customers' && (
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}

          {activeTab === 'projects' && (
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}

          {activeTab === 'notes' && (
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setCrmTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'customers' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-sans'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Clients ({customers.length})</span>
        </button>

        <button
          onClick={() => setCrmTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pipeline' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-sans'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Sales Pipeline</span>
        </button>

        <button
          onClick={() => setCrmTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'projects' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-sans'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setCrmTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'notes' ? 'bg-[#059669] text-white shadow-2xs font-heading' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-sans'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notes ({notes.length})</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMERS LIST */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669] transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 font-heading text-base">{cust.name}</h3>
                      <p className="text-xs text-[#059669] font-medium flex items-center gap-1 mt-0.5 font-sans">
                        <Building className="w-3 h-3" />
                        <span>{cust.company}</span>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-sans ${
                        cust.status === 'client'
                          ? 'bg-emerald-50 text-[#059669] border border-emerald-200'
                          : cust.status === 'proposal_sent'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {cust.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 font-sans">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.phone}</span>
                    </p>
                  </div>

                  {cust.notes && <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 font-sans">{cust.notes}</p>}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#059669] font-sans">${cust.value.toLocaleString()} Deal Value</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        createConversation(`Draft pitch for ${cust.name} (${cust.company})`);
                        setActiveTab('chat');
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-[#059669] transition-colors cursor-pointer"
                      title="AI Chat regarding this client"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCustomer(cust.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PIPELINE BOARD */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineStages.map((ps) => {
            const stageCustomers = customers.filter((c) => c.status === ps.stage);
            return (
              <div key={ps.stage} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between font-heading ${ps.color}`}>
                  <span>{ps.label}</span>
                  <span className="px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">{stageCustomers.length}</span>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {stageCustomers.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-12 font-sans">No leads in this stage</div>
                  ) : (
                    stageCustomers.map((c) => (
                      <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 font-heading">{c.name}</div>
                        <p className="text-xs text-slate-500 font-sans">{c.company}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs font-sans">
                          <span className="font-bold text-[#059669]">${c.value}</span>
                          <select
                            value={c.status}
                            onChange={(e) => updateCustomer(c.id, { status: e.target.value as CustomerStatus })}
                            className="bg-white text-[11px] text-slate-700 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                          >
                            <option value="lead">Lead</option>
                            <option value="contacted">Contacted</option>
                            <option value="proposal_sent">Proposal Sent</option>
                            <option value="client">Client</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 font-heading text-base">{proj.title}</h3>
                  <p className="text-xs text-[#059669] font-medium font-sans">Client: {proj.customerName}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-[#059669] border border-emerald-200 font-semibold capitalize font-sans">
                  {proj.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">{proj.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-sans">
                <span>Budget: <strong className="text-[#059669]">${proj.budget.toLocaleString()}</strong></span>
                <span>Target Date: {proj.targetDate}</span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => deleteProject(proj.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-sans"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: NOTES */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notes.map((n) => (
            <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-2xs">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 font-heading text-sm">{n.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 uppercase font-bold font-sans">
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">{n.content}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                <button onClick={() => deleteNote(n.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg font-bold font-heading text-slate-900">Add New Client or Lead</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                  placeholder="e.g. Austin Dental Care"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="sarah@dental.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+1 (512) 555-0199"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pipeline Stage</label>
                  <select
                    value={custStatus}
                    onChange={(e) => setCustStatus(e.target.value as CustomerStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  >
                    <option value="lead">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="client">Active Client</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Estimated Deal Value ($)</label>
                  <input
                    type="number"
                    value={custValue}
                    onChange={(e) => setCustValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showAddProjectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg font-bold font-heading text-slate-900">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Local SEO Domination Sprint"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client</label>
                <select
                  value={projCustomer}
                  onChange={(e) => setProjCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={projBudget}
                    onChange={(e) => setProjBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Date</label>
                  <input
                    type="date"
                    value={projTargetDate}
                    onChange={(e) => setProjTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold cursor-pointer"
                >
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NOTE */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg font-bold font-heading text-slate-900">Create Operational Note</h3>
            <form onSubmit={handleCreateNote} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Key take-aways from client discovery call"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Content *</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type note content..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
