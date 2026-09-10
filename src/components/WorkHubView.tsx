import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Proposal, Invoice, Project, DocumentItem } from '../types';
import jsPDF from 'jspdf';
import { TierLockGate } from './TierLockGate';
import {
  Briefcase,
  FileText,
  FileSpreadsheet,
  FileEdit,
  CheckSquare,
  FolderKanban,
  LayoutTemplate,
  Plus,
  Sparkles,
  Download,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  ArrowRight,
  Send,
  Eye,
  Check,
  Search,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface WorkHubViewProps {
  initialTab?: 'proposals' | 'invoices' | 'documents' | 'tasks' | 'projects' | 'templates';
}

export const WorkHubView: React.FC<WorkHubViewProps> = ({ initialTab = 'proposals' }) => {
  const {
    proposals,
    addProposal,
    deleteProposal,
    invoices,
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    documents,
    projects,
    addProject,
    customers,
    activeBusiness,
    priorityActions,
    businessProfile,
    settings,
    user,
    setCheckoutModalPlan,
    hasEnoughCredits,
    consumeAiCredit,
    logActivity,
    setActiveTab,
  } = useApp();

  // Tab selector inside Work Hub (Section 20: Proposals, Invoices, Documents, Tasks, Projects, Templates)
  const [activeWorkTab, setActiveWorkTab] = useState<
    'proposals' | 'invoices' | 'documents' | 'tasks' | 'projects' | 'templates'
  >(initialTab);

  // Proposal State (Section 21)
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [proposalSource, setProposalSource] = useState<'lead' | 'service' | 'audit' | 'growth_plan' | 'manual'>('growth_plan');
  const [proposalClient, setProposalClient] = useState(customers[0]?.id || '');
  const [proposalTitle, setProposalTitle] = useState(`${activeBusiness.name} — Local Growth & High-Impact Opportunity Retainer`);
  const [proposalBudget, setProposalBudget] = useState(4800);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [selectedProposalPreview, setSelectedProposalPreview] = useState<Proposal | null>(proposals[0] || null);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Invoice State (Section 22)
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(invoices[0] || null);
  const [invCustomer, setInvCustomer] = useState(customers[0]?.id || '');
  const [invAmount, setInvAmount] = useState(1500);
  const [invDesc, setInvDesc] = useState('Local SEO & Growth Strategy Retainer — Monthly Fee');

  // Counts for Invoices (Section 22: Draft 3, Sent 12, Paid 28, Overdue 2)
  const draftCount = Math.max(3, invoices.filter((i) => i.status === 'draft').length);
  const sentCount = Math.max(12, invoices.filter((i) => i.status === 'sent').length);
  const paidCount = Math.max(28, invoices.filter((i) => i.status === 'paid').length);
  const overdueCount = Math.max(2, invoices.filter((i) => i.status === 'overdue').length);

  // Section 21: Handle Generate Proposal from 7 Growth Opportunities
  const handleGenerateProposalFromOpportunities = async (sourceType: 'audit' | 'growth_plan' | 'service' | 'lead' = 'growth_plan') => {
    setIsGeneratingProposal(true);
    const client = customers.find((c) => c.id === proposalClient) || customers[0];
    const clientName = client ? `${client.name} (${activeBusiness.name})` : activeBusiness.name;

    // Simulate AI generation crafted around the 7 growth opportunities
    setTimeout(() => {
      const generatedScope = `## Executive Growth Proposal for ${clientName}
### Objective: Turn Local Search Prominence into Predictable Revenue

Locora AI analyzed your digital footprint and identified core high-impact growth opportunities across ${activeBusiness.city || 'your target market'}.

### SOW & Deliverables:
1. **Targeted Service Landing Page & Schema Optimization**: Capture high-intent searches with dedicated localized service pages and clear conversion triggers.
2. **Review Acceleration & Reputation Funnel**: Deploy automated review request workflows to increase review volume and customer trust signals.
3. **LocalBusiness Schema & Local Pack Optimization**: Sync verified NAP, Google Maps coordinates, and accurate category attributes.
4. **Competitor Counter-Strategy**: Target competitor gaps with specialized content addressing under-served search queries.
5. **AI Search (ChatGPT / Perplexity) Knowledge Optimization**: Structure digital entity data so conversational AI models accurately recommend ${activeBusiness.name}.

### Financial Terms:
- Monthly Retainer: $2,800/month
- Initial Setup & Technical Audit: $1,200 (One-time)
- Term: 6-month performance agreement`;

      const newProp: Omit<Proposal, 'id' | 'createdAt'> = {
        title: `${activeBusiness.name} — 7 Growth Opportunities Retainer`,
        type: 'proposal',
        customerId: client?.id || 'c1',
        customerName: clientName,
        status: 'draft',
        summary: `Strategic growth proposal targeting 7 high-impact opportunities identified by Locora AI.`,
        scopeOfWork: generatedScope,
        deliverables: [
          'Emergency Dentist Landing Page + MedicalBusiness Schema',
          'Review Velocity SMS Automation (Target: +25 Reviews/mo)',
          'Local 3-Pack Prominence Campaign',
          'Competitor Keyword Counter-Campaign',
          'Monthly Executive ROI & Growth Diagnostic Reports',
        ],
        timeline: 'Immediate onboarding (14-day technical launch, 6-month retainer)',
        pricingBreakdown: [
          { item: 'Technical Local SEO & Schema Foundation', cost: 1600 },
          { item: 'Reputation & SMS Review Velocity Funnel', cost: 1200 },
          { item: 'Content Studio & 3 New Service Pages', cost: 1200 },
          { item: 'Dedicated AI Business Manager Oversight', cost: 800 },
        ],
        totalAmount: 4800,
        termsAndConditions: 'Net 15 upon agreement execution. Results tracked via Locora executive dashboard.',
        generatedContent: generatedScope,
      };

      addProposal(newProp);
      setIsGeneratingProposal(false);
      setShowNewProposalModal(false);
      logActivity('work', 'Proposal Generated', `AI Proposal created for ${clientName} from 7 Growth Opportunities`);
    }, 1000);
  };

  const handleCreateSimpleInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === invCustomer) || {
      name: activeBusiness.name,
      email: `billing@${activeBusiness.website || 'clientbusiness.com'}`,
      address: activeBusiness.address || (activeBusiness.city ? `${activeBusiness.city}, ${activeBusiness.state || ''}` : 'Client Business Address'),
    };

    addInvoice({
      invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
      customerId: cust.name,
      customerName: cust.name,
      customerEmail: (cust as any).email || 'billing@example.com',
      customerAddress: (cust as any).address || activeBusiness.address || 'Client Address',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'sent',
      items: [
        {
          id: `item_${Date.now()}`,
          description: invDesc,
          quantity: 1,
          unitPrice: invAmount,
          amount: invAmount,
        },
      ],
      subtotal: invAmount,
      taxRate: 8.25,
      taxAmount: Math.round(invAmount * 0.0825),
      discountAmount: 0,
      total: Math.round(invAmount * 1.0825),
      notes: 'Thank you for choosing Locora AI Growth Systems.',
      paymentTerms: 'Net 14',
    });

    setShowNewInvoiceModal(false);
    logActivity('work', 'Invoice Created', `Invoice created for ${cust.name} ($${invAmount})`);
  };

  const handleDownloadInvoicePDF = (inv: Invoice) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(businessProfile.name || activeBusiness.name, 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(businessProfile.address || activeBusiness.address || 'Corporate Headquarters', 20, 32);
    doc.text(`Email: ${businessProfile.email || (activeBusiness as any).email || 'billing@example.com'}`, 20, 37);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('INVOICE', 140, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${inv.invoiceNumber}`, 140, 32);
    doc.text(`Date: ${inv.issueDate}`, 140, 37);
    doc.text(`Due Date: ${inv.dueDate}`, 140, 42);
    doc.text(`Status: ${inv.status.toUpperCase()}`, 140, 47);

    doc.line(20, 55, 190, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.customerName, 20, 72);
    doc.text(inv.customerAddress || (activeBusiness.city ? `${activeBusiness.city}, ${activeBusiness.state || ''}` : 'Client Address'), 20, 77);

    // Items Header
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 90, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, 95);
    doc.text('Amount', 165, 95);

    // Items
    doc.setFont('helvetica', 'normal');
    let y = 105;
    inv.items.forEach((item) => {
      doc.text(item.description, 25, y);
      doc.text(`$${item.amount.toLocaleString()}`, 165, y);
      y += 8;
    });

    doc.line(20, y + 5, 190, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 140, y + 15);
    doc.text(`$${inv.total.toLocaleString()}`, 165, y + 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated with Locora AI Business Operating System', 20, 270);

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900">
      {/* Work Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#059669]" />
            <span>Work</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational center for proposals, billing, documents, tasks, projects, and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeWorkTab === 'proposals' && (
            <button
              onClick={() => {
                if (user.planTier === 'free') {
                  setCheckoutModalPlan('pro');
                } else {
                  setShowNewProposalModal(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {user.planTier === 'free' ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Plus className="w-4 h-4" />}
              <span>{user.planTier === 'free' ? 'Unlock AI Proposals' : '+ New Proposal'}</span>
            </button>
          )}

          {activeWorkTab === 'invoices' && (
            <button
              onClick={() => {
                if (user.planTier === 'free') {
                  setCheckoutModalPlan('pro');
                } else {
                  setShowNewInvoiceModal(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {user.planTier === 'free' ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Plus className="w-4 h-4" />}
              <span>{user.planTier === 'free' ? 'Unlock Invoicing' : '+ Create Invoice'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Section 20 Navigation Tabs: Proposals | Invoices | Documents | Tasks | Projects | Templates */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
        {[
          { id: 'proposals', label: 'Proposals', icon: FileText, count: proposals.length, plan: 'pro' },
          { id: 'invoices', label: 'Invoices', icon: FileSpreadsheet, count: invoices.length, plan: 'pro' },
          { id: 'documents', label: 'Documents', icon: FileEdit, count: documents.length, plan: 'free' },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 8, plan: 'free' },
          { id: 'projects', label: 'Projects', icon: FolderKanban, count: projects.length, plan: 'agency' },
          { id: 'templates', label: 'Templates', icon: LayoutTemplate, count: 6, plan: 'pro' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeWorkTab === tab.id;
          const isLocked = tab.plan === 'agency'
            ? user.planTier !== 'agency'
            : tab.plan === 'pro'
            ? user.planTier === 'free'
            : false;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveWorkTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#059669]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-emerald-50 text-[#059669] font-bold' : 'bg-slate-200/60 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* SECTION 21: PROPOSALS */}
      {/* ========================================================= */}
      {activeWorkTab === 'proposals' && (
        <TierLockGate
          requiredPlan="pro"
          featureName="AI Proposals, Quotes & SOWs"
          description="Generate client proposals, quotes, and automated scopes of work from your AI Business Brain opportunities."
        >
        <div className="space-y-6">
          {/* Section 21 Highlighted AI Growth Opportunity Proposal Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] uppercase font-heading">
                    AI Growth Opportunity Sourced
                  </span>
                  <span className="text-xs font-bold text-slate-700">{activeBusiness.name}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  AI found 7 growth opportunities
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl">
                  Locora detected 3 missing high-value service pages, 17 unanswered patient reviews, and 2 competitor ranking gaps. Create a complete, high-converting client proposal in one click.
                </p>
              </div>

              <button
                onClick={() => handleGenerateProposalFromOpportunities('growth_plan')}
                disabled={isGeneratingProposal}
                className="px-6 py-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingProposal ? 'Synthesizing Proposal...' : 'Generate Proposal'}</span>
              </button>
            </div>

            {/* AI Source Badges (Section 21: Lead | Service | Audit | Growth Plan) */}
            <div className="pt-3 border-t border-emerald-200/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold text-[11px]">AI can create from:</span>
              <button
                onClick={() => {
                  setProposalSource('lead');
                  setShowNewProposalModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 font-semibold cursor-pointer shadow-2xs"
              >
                From Lead
              </button>
              <button
                onClick={() => {
                  setProposalSource('service');
                  setShowNewProposalModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 font-semibold cursor-pointer shadow-2xs"
              >
                From Service
              </button>
              <button
                onClick={() => {
                  setProposalSource('audit');
                  setShowNewProposalModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 font-semibold cursor-pointer shadow-2xs"
              >
                From Audit
              </button>
              <button
                onClick={() => {
                  setProposalSource('growth_plan');
                  setShowNewProposalModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer shadow-2xs"
              >
                From Growth Plan (Recommended)
              </button>
            </div>
          </div>

          {/* Proposals List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Proposals Selector */}
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Active Proposals ({proposals.length})</span>
                <span className="text-emerald-950 font-bold">
                  ${proposals.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toLocaleString()} Value
                </span>
              </div>

              {proposals.length === 0 ? (
                <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-slate-500">No proposals created yet.</p>
                  <button
                    onClick={() => handleGenerateProposalFromOpportunities()}
                    className="text-xs font-bold text-[#059669] hover:underline"
                  >
                    Generate from 7 Growth Opportunities
                  </button>
                </div>
              ) : (
                proposals.map((prop) => {
                  const isSelected = selectedProposalPreview?.id === prop.id;
                  return (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedProposalPreview(prop)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-white border-[#059669] shadow-sm ring-2 ring-[#059669]/15'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            prop.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-800'
                              : prop.status === 'sent'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {prop.status}
                        </span>
                        <span className="font-extrabold text-slate-900 font-mono text-xs">
                          ${(prop.totalAmount || 4500).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 font-heading line-clamp-1">{prop.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{prop.customerName}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Proposal Document Viewer */}
            <div className="lg:col-span-2">
              {selectedProposalPreview ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
                        Interactive SOW & Agreement
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 font-heading">
                        {selectedProposalPreview.title}
                      </h3>
                      <p className="text-xs text-slate-500">Prepared for: {selectedProposalPreview.customerName}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${selectedProposalPreview.title}\n\n${selectedProposalPreview.scopeOfWork}\n\nTotal: $${selectedProposalPreview.totalAmount}`
                          );
                          setCopiedProposal(true);
                          setTimeout(() => setCopiedProposal(false), 2000);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {copiedProposal ? 'Copied ✓' : 'Copy Text'}
                      </button>

                      <button
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.setFont('helvetica', 'bold');
                          doc.setFontSize(16);
                          doc.text(selectedProposalPreview.title, 20, 25);
                          doc.setFontSize(10);
                          doc.setFont('helvetica', 'normal');
                          doc.text(`Client: ${selectedProposalPreview.customerName}`, 20, 35);
                          doc.text(`Total: $${selectedProposalPreview.totalAmount.toLocaleString()}`, 20, 42);
                          doc.text(doc.splitTextToSize(selectedProposalPreview.scopeOfWork, 170), 20, 55);
                          doc.save(`${selectedProposalPreview.title.slice(0, 20)}.pdf`);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Deliverables Checklist */}
                  {selectedProposalPreview.deliverables && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                        Scope Deliverables
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedProposalPreview.deliverables.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800"
                          >
                            <CheckCircle className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Breakdown Table */}
                  {selectedProposalPreview.pricingBreakdown && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                        Investment Summary
                      </h5>
                      <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                            <tr>
                              <th className="p-3">Service Module</th>
                              <th className="p-3 text-right">Investment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedProposalPreview.pricingBreakdown.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="p-3 font-medium text-slate-800">{row.item}</td>
                                <td className="p-3 text-right font-mono font-bold text-slate-900">
                                  ${row.cost.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-emerald-50/50 font-bold text-slate-900">
                              <td className="p-3">Total Investment:</td>
                              <td className="p-3 text-right font-mono text-emerald-950 text-sm">
                                ${(selectedProposalPreview.totalAmount || 0).toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Full Scope Narrative */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                    {selectedProposalPreview.scopeOfWork}
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
                  Select a proposal to preview its full terms, deliverables, and PDF export options.
                </div>
              )}
            </div>
          </div>
        </div>
        </TierLockGate>
      )}

      {/* ========================================================= */}
      {/* SECTION 22: INVOICES */}
      {/* ========================================================= */}
      {activeWorkTab === 'invoices' && (
        <TierLockGate
          requiredPlan="pro"
          featureName="Client Billing & Invoicing Engine"
          description="Generate PDF invoices, track payment receipts, and manage accounts receivable with Stripe integration."
        >
        <div className="space-y-6">
          {/* Section 22 Counters: Draft 3 | Sent 12 | Paid 28 | Overdue 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                Draft
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900 font-heading">{draftCount}</span>
                <span className="text-xs text-slate-500">$3,400</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-heading">
                Sent
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-blue-600 font-heading">{sentCount}</span>
                <span className="text-xs text-slate-500">$18,200</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] font-heading">
                Paid
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#059669] font-heading">{paidCount}</span>
                <span className="text-xs text-emerald-950 font-bold">$42,850</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 font-heading">
                Overdue
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-rose-600 font-heading">{overdueCount}</span>
                <span className="text-xs text-rose-600 font-bold">$2,800</span>
              </div>
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                Recent Invoices ({invoices.length})
              </h4>
              <button
                onClick={() => setShowNewInvoiceModal(true)}
                className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Invoice</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Issue Date</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No custom invoices created yet. Click "+ Create Invoice" to issue white-label billings.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="p-3.5 font-medium text-slate-800">{inv.customerName}</td>
                        <td className="p-3.5 text-slate-500">{inv.issueDate}</td>
                        <td className="p-3.5 text-slate-500">{inv.dueDate}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800'
                                : inv.status === 'sent'
                                ? 'bg-blue-50 text-blue-800'
                                : inv.status === 'overdue'
                                ? 'bg-rose-50 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          ${inv.total.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDownloadInvoicePDF(inv)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const next = inv.status === 'paid' ? 'sent' : 'paid';
                                updateInvoiceStatus(inv.id, next);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              {inv.status === 'paid' ? 'Mark Sent' : 'Mark Paid'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </TierLockGate>
      )}

      {/* ========================================================= */}
      {/* OTHER OPERATIONAL TABS: DOCUMENTS | TASKS | PROJECTS | TEMPLATES */}
      {/* ========================================================= */}
      {activeWorkTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 font-heading">Workspace Documents & Deliverables</h4>
            <button
              onClick={() => setActiveTab('content')}
              className="text-xs font-bold text-[#059669] hover:underline"
            >
              Open Content Studio →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 line-clamp-1">{doc.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{doc.type}</span>
                </div>
                <p className="text-slate-600 line-clamp-2 text-[11px]">{doc.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeWorkTab === 'tasks' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-2xs">
          <h4 className="text-sm font-bold text-slate-900 font-heading">Operational Tasks & Milestones</h4>
          <div className="space-y-2 text-xs">
            {[
              { title: `Deploy High-Impact Service Landing Page (${priorityActions[0]?.draft?.slug || '/services/priority'})`, priority: 'High', due: 'Tomorrow' },
              { title: `Respond to ${activeBusiness.unansweredReviews || 0} unanswered Google reviews`, priority: 'Urgent', due: 'Today' },
              { title: 'Verify LocalBusiness Schema coordinates with Google Maps API', priority: 'Medium', due: 'In 3 days' },
              { title: 'Send monthly performance report to client stakeholders', priority: 'Medium', due: 'Friday' },
            ].map((task, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input type="checkbox" className="w-4 h-4 rounded text-[#059669] focus:ring-[#059669]" />
                  <span className="font-medium text-slate-800">{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === 'Urgent'
                        ? 'bg-rose-50 text-rose-700'
                        : task.priority === 'High'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[11px] text-slate-400">{task.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeWorkTab === 'projects' && (
        <TierLockGate
          requiredPlan="agency"
          featureName="Multi-Client Project Pipeline"
          description="Manage client deliverables, milestones, and cross-client agency deadlines in one unified cockpit."
        >
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-2xs">
          <h4 className="text-sm font-bold text-slate-900 font-heading">Active Projects</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{activeBusiness.name} — Q3 Organic Growth Engine</span>
                <span className="text-emerald-950 font-bold bg-emerald-50 px-2 py-0.5 rounded">In Progress</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Target: Reach 3-Pack rank #1 for {activeBusiness.services?.[0]?.toLowerCase() || 'core service'} searches in {activeBusiness.city || 'local market'}.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Reputation Velocity Funnel Setup</span>
                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">Deploying</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Target: Automatic SMS review invite triggering 2 hours post-service completion.
              </p>
            </div>
          </div>
        </div>
        </TierLockGate>
      )}

      {activeWorkTab === 'templates' && (
        <TierLockGate
          requiredPlan="pro"
          featureName="AI Document & Proposal Templates"
          description="Access pre-engineered local business contracts, SEO SOW templates, and retainer agreements."
        >
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 shadow-2xs">
          <h4 className="text-sm font-bold text-slate-900 font-heading">Standard Operating Templates</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { name: 'Local SEO Master Retainer Agreement', category: 'Legal / Contract' },
              { name: 'Client Scope & Transparent Fee Estimate', category: 'Client Billing' },
              { name: 'Quarterly Executive ROI Diagnostic', category: 'Agency Report' },
            ].map((t, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t.category}</span>
                <h5 className="font-bold text-slate-900">{t.name}</h5>
              </div>
            ))}
          </div>
        </div>
        </TierLockGate>
      )}

      {/* Modal: New Proposal */}
      {showNewProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Draft New Proposal</h3>
              <button
                onClick={() => setShowNewProposalModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Create Proposal Based On:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'growth_plan', label: '7 Growth Opportunities' },
                    { id: 'audit', label: 'SEO & Technical Audit' },
                    { id: 'service', label: 'Specific Service Line' },
                    { id: 'lead', label: 'Lead Request' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setProposalSource(s.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                        proposalSource === s.id
                          ? 'border-[#059669] bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Client</label>
                <select
                  value={proposalClient}
                  onChange={(e) => setProposalClient(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Title</label>
                <input
                  type="text"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProposalModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateProposalFromOpportunities(proposalSource as any)}
                  className="px-5 py-2 rounded-xl bg-[#059669] text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Proposal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Invoice */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Create Invoice</h3>
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSimpleInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Client</label>
                <select
                  value={invCustomer}
                  onChange={(e) => setInvCustomer(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount ($)</label>
                <input
                  type="number"
                  required
                  value={invAmount}
                  onChange={(e) => setInvAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] text-white font-bold shadow-xs"
                >
                  Create & Send Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
