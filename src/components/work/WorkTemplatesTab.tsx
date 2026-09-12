import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkTemplate } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  LayoutTemplate,
  Plus,
  Trash2,
  Copy,
  Check,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

interface WorkTemplatesTabProps {
  businessId: string;
}

type TemplateTypeFilter = 'all' | 'proposal_template' | 'invoice_template' | 'contract_template' | 'project_template' | 'task_list_template';

const STANDARD_TEMPLATES: {
  name: string;
  type: WorkTemplate['type'] | string;
  description: string;
  content: string;
}[] = [
  {
    name: 'Local SEO Master Retainer Agreement',
    type: 'contract_template',
    description: 'Standard monthly recurring scope agreement for local search dominance and Google Maps ranking.',
    content: `# MASTER SERVICES AGREEMENT: LOCAL SEO & MAPS DOMINANCE\n\n1. SCOPE OF SERVICES\nProvider shall execute ongoing local search engine optimization, Google Business Profile management, citation audit/cleansing, and monthly performance reviews for Client.\n\n2. TERM & TERMINATION\nThis agreement operates on a month-to-month basis with 30 days written notice required for cancellation.\n\n3. DELIVERABLES\n- Monthly Geo-Grid Rank Diagnostics\n- Review Response Generation\n- Priority Keyword Local Pages\n- Monthly Transparency Executive Briefing\n\n4. PAYMENT TERMS\nBilled net-15 on the 1st of each calendar month.`,
  },
  {
    name: 'High-Impact Local Growth Proposal',
    type: 'proposal_template',
    description: 'Pitch document highlighting local visibility gaps, revenue ROI, and 90-day growth sprint.',
    content: `# GROWTH ACCELERATION PROPOSAL\n\nEXECUTIVE SUMMARY\nOur diagnostic identified key opportunities to capture missed high-intent local calls and appointments in your immediate service area.\n\nPROPOSED DELIVERABLES:\n- Google Business Profile overhaul & photo enrichment\n- Schema markup integration for location pages\n- Reputation surge campaign targeting recent satisfied customers\n\nINVESTMENT\nMonthly Retainer: $2,500/mo\nSetup & Initial Sprint: $1,200`,
  },
  {
    name: 'Standard Net-30 Service Invoice',
    type: 'invoice_template',
    description: 'Professional itemized billing template with payment instructions and line item summaries.',
    content: `INVOICE TEMPLATE\n\nBilled To: [Client Company Name]\nInvoice Date: [Date]\nDue Date: [Date + 30 Days]\n\nITEMS:\n1. Monthly Local Search Retainer - $1,500.00\n2. Local Citation Distribution (50 directories) - $350.00\n\nPayment via ACH / Bank Wire. Details enclosed upon request.`,
  },
  {
    name: '90-Day Local Authority Sprint Plan',
    type: 'project_template',
    description: 'Phased 3-month project framework for onboarding and scaling local search rankings.',
    content: `PHASE 1 (Days 1-30): Foundation & Audit\n- Verify GBP consistency across top 40 aggregators\n- Audit existing review sentiment & response backlog\n- Benchmark competitor rankings\n\nPHASE 2 (Days 31-60): Content & Citations\n- Launch 3 dedicated service landing pages\n- Initiate customer feedback automation\n\nPHASE 3 (Days 61-90): Authority & Scale\n- Local press release / community sponsorship mentions\n- Monthly KPI review and ROI assessment`,
  },
  {
    name: 'Google Business Profile Audit & Launch Checklist',
    type: 'task_list_template',
    description: 'Comprehensive 18-point task list template for launching or auditing client GBP profiles.',
    content: `TASK LIST TEMPLATE:\n[ ] Verify exact matching Business Name (no keyword stuffing)\n[ ] Audit Primary and Secondary Categories\n[ ] Configure exact service areas and geo-radius\n[ ] Set holiday and regular operating hours\n[ ] Enable Google messaging / direct booking link\n[ ] Upload high-resolution exterior, interior, and team photos\n[ ] Add comprehensive service menus with transparent pricing ranges\n[ ] Audit Q&A section and publish FAQ entries`,
  },
];

export const WorkTemplatesTab: React.FC<WorkTemplatesTabProps> = ({ businessId }) => {
  const { workTemplates, addWorkTemplate, deleteWorkTemplate, activeBusiness } = useApp();

  const [typeFilter, setTypeFilter] = useState<TemplateTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<WorkTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<WorkTemplate | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('proposal_template');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  // Scoped templates
  const scopedTemplates = workTemplates.filter((t) => !t.businessId || t.businessId === businessId);

  const filteredTemplates = scopedTemplates.filter((tmpl) => {
    if (typeFilter !== 'all') {
      const tmplType = (tmpl.type || '').toLowerCase();
      const filter = typeFilter.toLowerCase();
      const matches = tmplType === filter || tmplType.startsWith(filter.replace('_template', '')) || filter.startsWith(tmplType.replace('_template', ''));
      if (!matches) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tmpl.name.toLowerCase().includes(q);
      const matchDesc = tmpl.description?.toLowerCase().includes(q) || false;
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleSeedStandardTemplates = async () => {
    for (const st of STANDARD_TEMPLATES) {
      await addWorkTemplate({
        businessId,
        name: st.name,
        type: st.type as any,
        description: st.description,
        content: st.content,
      });
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addWorkTemplate({
      businessId,
      name: name.trim(),
      type: type as any,
      description: description.trim() || undefined,
      content: content.trim() || undefined,
    });

    setName('');
    setDescription('');
    setContent('');
    setType('proposal_template');
    setShowNewModal(false);
  };

  const handleCopyContent = (tmpl: WorkTemplate) => {
    if (!tmpl.content) return;
    navigator.clipboard.writeText(tmpl.content);
    setCopiedId(tmpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTypeBadge = (t: string) => {
    switch (t) {
      case 'proposal_template':
      case 'proposal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'invoice_template':
      case 'invoice':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'contract_template':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'project_template':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'task_list_template':
      case 'task_list':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatTypeName = (t: string) => {
    switch (t) {
      case 'proposal_template':
      case 'proposal':
        return 'Proposal Template';
      case 'invoice_template':
      case 'invoice':
        return 'Invoice Template';
      case 'contract_template':
        return 'Contract Template';
      case 'project_template':
        return 'Project Template';
      case 'task_list_template':
      case 'task_list':
        return 'Task List Template';
      default:
        return t.replace('_', ' ');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-[#059669]" />
            <span>Standard Operating Templates ({scopedTemplates.length})</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-approved proposal structures, contracts, invoices, and sprint blueprints for{' '}
            <span className="font-semibold text-slate-700">{activeBusiness.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {scopedTemplates.length === 0 && (
            <button
              onClick={handleSeedStandardTemplates}
              className="px-3.5 py-2 rounded-xl border border-[#059669] text-[#059669] bg-emerald-50 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 5 Standard Templates</span>
            </button>
          )}

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Templates' },
            { id: 'proposal_template', label: 'Proposals' },
            { id: 'invoice_template', label: 'Invoices' },
            { id: 'contract_template', label: 'Contracts' },
            { id: 'project_template', label: 'Projects' },
            { id: 'task_list_template', label: 'Task Lists' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                typeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 font-medium text-xs"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-slate-800">No templates found</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Templates standardize proposals, invoices, legal agreements, and project sprints.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={handleSeedStandardTemplates}
              className="px-4 py-2 rounded-xl bg-[#059669] text-white font-bold text-xs hover:bg-[#047857] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Standard Templates</span>
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              + Create Blank Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getTypeBadge(
                      tmpl.type
                    )}`}
                  >
                    {formatTypeName(tmpl.type)}
                  </span>

                  <button
                    onClick={() => setTemplateToDelete(tmpl)}
                    className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                    title="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h5 className="text-sm font-bold text-slate-900 leading-snug">{tmpl.name}</h5>

                {tmpl.description && <p className="text-xs text-slate-500 line-clamp-2">{tmpl.description}</p>}

                {tmpl.content && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[10px] text-slate-600 line-clamp-3">
                    {tmpl.content}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewingTemplate(tmpl)}
                  className="font-bold text-slate-700 hover:text-[#059669] flex items-center gap-1 cursor-pointer"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleCopyContent(tmpl)}
                  disabled={!tmpl.content}
                  className="flex items-center gap-1 font-bold text-xs text-[#059669] hover:underline cursor-pointer disabled:opacity-50"
                >
                  {copiedId === tmpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Body</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {formatTypeName(viewingTemplate.type)}
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-heading">{viewingTemplate.name}</h3>
              </div>
              <button
                onClick={() => setViewingTemplate(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {viewingTemplate.description && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                {viewingTemplate.description}
              </p>
            )}

            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {viewingTemplate.content || '(Empty template content)'}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleCopyContent(viewingTemplate)}
                className="px-4 py-2 rounded-xl bg-[#059669] text-white font-bold text-xs hover:bg-[#047857] flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Content</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Template Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Create Standard Template</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Local Search Retainer SOW"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Template Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="proposal_template">Proposal Template</option>
                  <option value="invoice_template">Invoice Template</option>
                  <option value="contract_template">Contract / Legal Template</option>
                  <option value="project_template">Project Sprint Blueprint</option>
                  <option value="task_list_template">Task List / Checklist Template</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="Brief summary of when to use this template..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Template Content / Boilerplate</label>
                <textarea
                  rows={6}
                  placeholder="Enter boilerplate text, deliverables, markdown or terms..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] text-white font-bold hover:bg-[#047857] shadow-xs cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Safe In-App Template Deletion Modal */}
      <DeleteConfirmModal
        isOpen={templateToDelete !== null}
        title="Delete Template"
        itemName={templateToDelete?.name}
        message="Are you sure you want to delete this template? It will no longer be available when generating new work items."
        confirmLabel="Delete Template"
        onConfirm={() => {
          if (templateToDelete) {
            deleteWorkTemplate(templateToDelete.id);
            if (viewingTemplate?.id === templateToDelete.id) {
              setViewingTemplate(null);
            }
            setTemplateToDelete(null);
          }
        }}
        onClose={() => setTemplateToDelete(null)}
      />
    </div>
  );
};
