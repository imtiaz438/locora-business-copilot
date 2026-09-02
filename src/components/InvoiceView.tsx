import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice, InvoiceItem } from '../types';
import { BrandedFooter } from './BrandedFooter';
import { LocoraLogo } from './LocoraLogo';
import jsPDF from 'jspdf';
import {
  FileSpreadsheet,
  Plus,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  Printer,
  Sparkles,
  DollarSign,
  Building,
} from 'lucide-react';

export const InvoiceView: React.FC = () => {
  const { invoices, addInvoice, updateInvoiceStatus, deleteInvoice, customers, businessProfile, settings, user, setCheckoutModalPlan } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(invoices[0] || null);

  const totalCreatedCount = Math.max(user.invoicesCreatedCount || 0, invoices.length);
  const isFreePlanLimitReached = user.planTier === 'free' && totalCreatedCount >= 2;

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [taxRate, setTaxRate] = useState(businessProfile.taxRate || 8.25);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState('Net 14');
  const [notes, setNotes] = useState('Thank you for your business!');

  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: 'Local SEO Strategy & GBP Setup', quantity: 1, unitPrice: 1500, amount: 1500 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { description: 'New Service Line Item', quantity: 1, unitPrice: 250, amount: 250 }]);
  };

  const handleUpdateItem = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreePlanLimitReached) {
      alert('Free Starter plan includes up to 2 invoices limit (used 2/2). Deleting past invoices does not reset this lifetime limit. Upgrade to Pro Growth ($19/mo) for Unlimited Invoices.');
      setCheckoutModalPlan('pro');
      return;
    }
    const cust = customers.find((c) => c.id === selectedCustomerId) || {
      name: 'Walk-in Client',
      email: 'client@example.com',
      address: 'Austin, TX',
    };

    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * (taxRate / 100));
    const total = Math.max(0, subtotal + taxAmount - discountAmount);

    const newInv: Omit<Invoice, 'id' | 'createdAt'> = {
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      customerId: selectedCustomerId,
      customerName: cust.name,
      customerEmail: cust.email,
      customerAddress: cust.address,
      issueDate,
      dueDate,
      status: 'sent',
      items: items.map((it, idx) => ({ ...it, id: `item_${idx}_${Date.now()}` })),
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      total,
      notes,
      paymentTerms,
    };

    addInvoice(newInv);
    setShowCreateModal(false);
  };

  // PDF Generator function
  const downloadPDF = (inv: Invoice) => {
    const doc = new jsPDF();

    // Header Branding
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 42, 'F');

    const logoSrc = businessProfile.logoUrl || businessProfile.logoConfig?.url || settings.siteLogoUrl || '';
    if (logoSrc && (logoSrc.startsWith('data:image/png') || logoSrc.startsWith('data:image/jpeg') || logoSrc.startsWith('http'))) {
      try {
        doc.addImage(logoSrc, 'PNG', 15, 8, 26, 26, undefined, 'FAST');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(businessProfile.name || 'Your Business Name', 46, 22);
      } catch {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(businessProfile.name || 'Your Business Name', 15, 22);
      }
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(businessProfile.name || 'Your Business Name', 15, 22);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('INVOICE', 165, 20);
    doc.text(`#${inv.invoiceNumber}`, 165, 27);

    // Business & Client details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed From:', 15, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(businessProfile.name || 'Your Business Name', 15, 58);
    doc.text(businessProfile.email || 'billing@business.com', 15, 64);
    doc.text(businessProfile.address || '123 Business Way', 15, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 120, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.customerName, 120, 58);
    doc.text(inv.customerEmail || '', 120, 64);
    doc.text(inv.customerAddress || '', 120, 70);

    // Invoice dates
    doc.setFontSize(9);
    doc.text(`Issue Date: ${inv.issueDate}`, 15, 82);
    doc.text(`Due Date: ${inv.dueDate}`, 120, 82);
    doc.text(`Payment Terms: ${inv.paymentTerms}`, 120, 88);

    // Items Table Header
    let yPos = 100;
    doc.setFillColor(241, 245, 249);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 18, yPos + 6);
    doc.text('Qty', 120, yPos + 6);
    doc.text('Unit Price', 145, yPos + 6);
    doc.text('Amount', 175, yPos + 6);

    yPos += 14;
    doc.setFont('helvetica', 'normal');
    inv.items.forEach((item) => {
      doc.text(item.description, 18, yPos);
      doc.text(String(item.quantity), 122, yPos);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 145, yPos);
      doc.text(`$${item.amount.toFixed(2)}`, 175, yPos);
      yPos += 10;
    });

    // Summary Totals
    yPos += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;

    doc.text(`Subtotal:`, 140, yPos);
    doc.text(`$${inv.subtotal.toFixed(2)}`, 175, yPos);
    yPos += 6;

    if (inv.taxAmount > 0) {
      doc.text(`Tax (${inv.taxRate}%):`, 140, yPos);
      doc.text(`$${inv.taxAmount.toFixed(2)}`, 175, yPos);
      yPos += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total Due:`, 140, yPos + 2);
    doc.text(`$${inv.total.toFixed(2)}`, 175, yPos + 2);

    // Footer
    yPos += 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(inv.notes || 'Thank you for your business!', 15, yPos);

    if (user.planTier === 'free') {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('Powered by Locora AI Business Copilot (Free Tier) • Upgrade to Pro to remove branding', 15, yPos + 8);
    }

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-[#059669]" />
            <span>Invoice Generator & Billing</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Create professional invoices, store billing histories, and download client PDFs.
          </p>
        </div>

        <button
          onClick={() => {
            if (isFreePlanLimitReached) {
              alert('Free Starter plan includes up to 2 invoices limit (used 2/2). Deleting past invoices does not reset this lifetime limit. Upgrade to Pro Growth ($19/mo) for Unlimited Invoices.');
              setCheckoutModalPlan('pro');
            } else {
              setShowCreateModal(true);
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-2xs flex items-center gap-2 transition-all cursor-pointer font-sans"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {user.planTier === 'free' && (
        <div className={`p-3.5 rounded-xl border text-xs font-sans flex items-center justify-between gap-3 ${
          isFreePlanLimitReached
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-emerald-50/60 border-emerald-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isFreePlanLimitReached ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span>
              <strong>Free Starter Plan:</strong> {totalCreatedCount} / 2 Invoices Generated
              {isFreePlanLimitReached && ' — Limit reached! Deleting past invoices does not reset this lifetime limit.'}
            </span>
          </div>
          {isFreePlanLimitReached ? (
            <button
              onClick={() => setCheckoutModalPlan('pro')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
            >
              Upgrade to Pro ($19/mo)
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium shrink-0">Unlimited Invoices with Pro</span>
          )}
        </div>
      )}

      {/* Grid: Invoice List & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Invoices */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
            Saved Invoices ({invoices.length})
          </h3>

          <div className="space-y-2">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-white border border-slate-200 rounded-xl text-xs font-sans">
                No invoices created yet. Click "Create New Invoice" above to generate your first client invoice.
              </div>
            ) : (
              invoices.map((inv) => {
                const isSelected = previewInvoice?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setPreviewInvoice(inv)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all relative group ${
                      isSelected
                        ? 'bg-emerald-50/80 border-[#059669] text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm font-heading text-slate-900">{inv.invoiceNumber}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-bold capitalize font-sans ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-[#059669]'
                              : inv.status === 'sent'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {inv.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteInvoice(inv.id);
                            if (previewInvoice?.id === inv.id) {
                              const remaining = invoices.filter((i) => i.id !== inv.id);
                              setPreviewInvoice(remaining[0] || null);
                            }
                          }}
                          title="Delete Invoice"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 font-sans">{inv.customerName}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs font-sans">
                      <span className="text-slate-400">Due {inv.dueDate}</span>
                      <span className="font-extrabold text-[#059669]">${inv.total.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: PDF Preview Card */}
        <div className="lg:col-span-2">
          {previewInvoice ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xs">
              {/* Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-heading text-slate-900">{previewInvoice.invoiceNumber}</span>
                  <select
                    value={previewInvoice.status}
                    onChange={(e) => updateInvoiceStatus(previewInvoice.id, e.target.value as any)}
                    className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadPDF(previewInvoice)}
                    className="px-3.5 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer font-sans"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      deleteInvoice(previewInvoice.id);
                      const remaining = invoices.filter((i) => i.id !== previewInvoice.id);
                      setPreviewInvoice(remaining[0] || null);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Invoice Layout View */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 font-sans">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3.5">
                    <LocoraLogo isUserDoc={true} size={48} />
                    <div>
                      <h2 className="text-xl font-bold font-heading text-slate-900">{businessProfile.name || user.companyName || 'Your Business Name'}</h2>
                      <p className="text-xs text-slate-500">{businessProfile.email || user.email}</p>
                      {businessProfile.address && <p className="text-xs text-slate-500">{businessProfile.address}</p>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black font-heading text-[#059669]">INVOICE</span>
                    <p className="text-xs font-semibold text-slate-700">#{previewInvoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Billed To</p>
                    <p className="font-bold text-slate-900 text-sm font-heading">{previewInvoice.customerName}</p>
                    <p className="text-slate-600">{previewInvoice.customerEmail}</p>
                    <p className="text-slate-600">{previewInvoice.customerAddress}</p>
                  </div>
                  <div className="text-right space-y-1 text-slate-600">
                    <p><strong className="text-slate-800">Issue Date:</strong> {previewInvoice.issueDate}</p>
                    <p><strong className="text-slate-800">Due Date:</strong> {previewInvoice.dueDate}</p>
                    <p><strong className="text-slate-800">Terms:</strong> {previewInvoice.paymentTerms}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                        <th className="py-2">Description</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Rate</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {(previewInvoice.items || []).map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 font-medium">{it.description}</td>
                          <td className="py-2.5 text-center">{it.quantity}</td>
                          <td className="py-2.5 text-right">${it.unitPrice.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-bold">${it.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal Calculation */}
                <div className="border-t border-slate-200 pt-4 flex flex-col items-end space-y-1.5 text-xs">
                  <div className="flex justify-between w-48 text-slate-600">
                    <span>Subtotal:</span>
                    <span>${previewInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-slate-600">
                    <span>Tax ({previewInvoice.taxRate}%):</span>
                    <span>${previewInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-48 text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200 font-heading">
                    <span>Total Due:</span>
                    <span className="text-[#059669]">${previewInvoice.total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic pt-4 border-t border-slate-200">
                  {previewInvoice.notes}
                </p>

                {/* Branded Footer (White label supported on Agency plan) */}
                <BrandedFooter />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-sans">
              Select or create an invoice to view details
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE INVOICE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#059669]" />
              <span>Create New Invoice</span>
            </h3>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Client *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
              </div>

              {/* Line items editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 font-heading">Invoice Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#059669] hover:text-[#047857] flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Line item description"
                      value={it.description}
                      onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-16 bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-center"
                    />
                    <input
                      type="number"
                      placeholder="Rate ($)"
                      value={it.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      className="w-24 bg-white border border-slate-200 rounded-lg p-2 text-slate-900 text-right"
                    />
                    <span className="w-20 text-right font-bold text-[#059669]">${it.amount.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Tax & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:bg-white focus:border-[#059669]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold cursor-pointer"
                >
                  Generate & Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
