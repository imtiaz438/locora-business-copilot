import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Eye,
  ExternalLink,
  FolderKanban,
  User,
  Building,
  Calendar,
  Search,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface WorkDocumentsTabProps {
  businessId: string;
}

export const WorkDocumentsTab: React.FC<WorkDocumentsTabProps> = ({ businessId }) => {
  const {
    documents,
    addDocument,
    deleteDocument,
    projects,
    customers,
    activeBusiness,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Deliverable');
  const [content, setContent] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [projectId, setProjectId] = useState('');

  // Scoped documents strictly by business_id
  const scopedDocs = documents.filter((d) => d.businessId === businessId);
  const scopedProjects = projects.filter((p) => p.businessId === businessId);

  const filteredDocs = scopedDocs.filter((doc) => {
    if (typeFilter !== 'all' && doc.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchContent = doc.content?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addDocument({
      businessId,
      title: title.trim(),
      type,
      content: content.trim(),
      customerId: customerId || undefined,
      projectId: projectId || undefined,
    });

    setTitle('');
    setContent('');
    setType('Deliverable');
    setCustomerId('');
    setProjectId('');
    setShowNewDocModal(false);
  };

  const handleDownloadPDF = (doc: DocumentItem) => {
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(doc.title, 20, 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Business: ${activeBusiness.name} | Category: ${doc.type} | Date: ${doc.createdAt.split('T')[0]}`, 20, 28);
    pdf.line(20, 32, 190, 32);

    pdf.setFontSize(11);
    pdf.setTextColor(30, 30, 30);
    const splitLines = pdf.splitTextToSize(doc.content, 170);
    pdf.text(splitLines, 20, 42);

    pdf.save(`${doc.title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#059669]" />
            <span>Workspace Documents & Deliverables ({scopedDocs.length})</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliverable records, audit findings, strategy briefs, and client reports for{' '}
            <span className="font-semibold text-slate-700">{activeBusiness.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('content')}
            className="text-xs font-bold text-[#059669] hover:underline px-3 py-2 cursor-pointer"
          >
            Open Content Studio →
          </button>
          <button
            onClick={() => setShowNewDocModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Deliverable', 'Audit', 'Strategy', 'Report', 'Agreement'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors cursor-pointer ${
                typeFilter.toLowerCase() === t.toLowerCase()
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 font-medium text-xs"
          />
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-slate-800">No documents logged</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Store client audit deliverables, strategy playbooks, and reports securely scoped to this business.
            </p>
          </div>
          <button
            onClick={() => setShowNewDocModal(true)}
            className="px-4 py-2 rounded-xl bg-[#059669] text-white font-bold text-xs hover:bg-[#047857] transition-all cursor-pointer"
          >
            + Create First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => {
            const project = scopedProjects.find((p) => p.id === doc.projectId);
            const customer = customers.find((c) => c.id === doc.customerId);

            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 uppercase">
                      {doc.type}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadPDF(doc)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
                        title="Download as PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDocToDelete(doc)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h5>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{doc.content}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    {customer && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{customer.name}</span>
                      </span>
                    )}
                    {project && (
                      <span className="flex items-center gap-1">
                        <FolderKanban className="w-3 h-3 text-slate-400" />
                        <span>{project.name || project.title}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="font-bold text-[#059669] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full</span>
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{previewDoc.type}</span>
                <h3 className="text-lg font-bold text-slate-900 font-heading">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 text-slate-800 text-xs whitespace-pre-wrap leading-relaxed border border-slate-100 font-mono">
              {previewDoc.content}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDownloadPDF(previewDoc)}
                className="px-4 py-2 rounded-xl bg-[#059669] text-white font-bold text-xs hover:bg-[#047857] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Document Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-heading">New Workspace Document</h3>
              <button
                onClick={() => setShowNewDocModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Local Search Performance Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Document Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Deliverable">Deliverable</option>
                  <option value="Audit">Audit Findings</option>
                  <option value="Strategy">Strategy Brief</option>
                  <option value="Report">Client Report</option>
                  <option value="Agreement">Agreement / SOW</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {customers.length > 0 && (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Client (Optional)</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="">None / Direct</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {scopedProjects.length > 0 && (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Project (Optional)</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="">None</option>
                      {scopedProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Content / Document Body</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Draft deliverables, notes, or findings..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDocModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] text-white font-bold hover:bg-[#047857] shadow-xs cursor-pointer"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Safe In-App Document Deletion Modal */}
      <DeleteConfirmModal
        isOpen={docToDelete !== null}
        title="Delete Document"
        itemName={docToDelete?.title}
        message="Are you sure you want to delete this document? Any links to client work or project attachments will be removed."
        confirmLabel="Delete Document"
        onConfirm={() => {
          if (docToDelete) {
            deleteDocument(docToDelete.id);
            if (previewDoc?.id === docToDelete.id) {
              setPreviewDoc(null);
            }
            setDocToDelete(null);
          }
        }}
        onClose={() => setDocToDelete(null)}
      />
    </div>
  );
};
