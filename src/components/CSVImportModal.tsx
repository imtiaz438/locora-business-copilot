import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface CSVImportModalProps {
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ onClose, onImportComplete }) => {
  const { addCustomer, activeBusiness } = useApp();
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParse = () => {
    setError(null);
    if (!csvText.trim()) {
      setError('Please paste or upload CSV data.');
      return;
    }

    const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setError('CSV must contain a header row and at least one data row.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const phoneIdx = headers.findIndex((h) => h.includes('phone'));
    const companyIdx = headers.findIndex((h) => h.includes('company') || h.includes('business'));
    const serviceIdx = headers.findIndex((h) => h.includes('service'));
    const valueIdx = headers.findIndex((h) => h.includes('value') || h.includes('amount') || h.includes('budget'));
    const addressIdx = headers.findIndex((h) => h.includes('address') || h.includes('city'));

    if (nameIdx === -1 && emailIdx === -1) {
      setError('CSV must have either a "Name" or "Email" column.');
      return;
    }

    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const name = nameIdx !== -1 ? cols[nameIdx] : '';
      const email = emailIdx !== -1 ? cols[emailIdx] : '';
      if (!name && !email) continue;

      parsed.push({
        name: name || email.split('@')[0],
        email: email || '',
        phone: phoneIdx !== -1 ? cols[phoneIdx] : '',
        company: companyIdx !== -1 ? cols[companyIdx] : '',
        service: serviceIdx !== -1 ? cols[serviceIdx] : (activeBusiness.services?.[0] || 'General Service'),
        value: valueIdx !== -1 ? parseFloat(cols[valueIdx].replace(/[^0-9.]/g, '')) || 0 : 0,
        address: addressIdx !== -1 ? cols[addressIdx] : (activeBusiness.city || ''),
      });
    }

    if (parsed.length === 0) {
      setError('No valid customer records could be extracted from the provided CSV.');
      return;
    }

    setPreviewRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    let importedCount = 0;

    for (const row of previewRows) {
      addCustomer({
        name: row.name,
        company: row.company || 'Client',
        email: row.email,
        phone: row.phone,
        address: row.address,
        businessId: activeBusiness.id,
        source: 'imported',
        leadSource: 'Imported CSV',
        status: 'lead',
        pipelineStage: 'new_lead',
        service: row.service,
        value: row.value,
        lastActivity: 'Imported from CSV',
        nextAction: 'Review and qualify',
        tags: ['imported', 'csv'],
        notes: `Imported via CSV into ${activeBusiness.name} CRM on ${new Date().toLocaleDateString()}`,
      });
      importedCount++;
    }

    setIsProcessing(false);
    onImportComplete(importedCount);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-[#059669]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Import Customers from CSV</h3>
              <p className="text-[11px] text-slate-500">
                All records will be attributed to <strong>{activeBusiness.name}</strong> with source <code>imported</code>.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {previewRows.length === 0 ? (
            <>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#059669] transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="font-bold text-[#059669] hover:underline cursor-pointer">
                  <span>Upload a CSV file</span>
                  <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <p className="text-slate-400 text-[11px] mt-1">or paste raw CSV text below</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Paste CSV Data</label>
                <textarea
                  rows={6}
                  placeholder={`Name, Email, Phone, Company, Service, Value\nJohn Doe, john@example.com, (555) 019-2831, Acme Corp, Consulting, 1200\nJane Smith, jane@example.com, (555) 018-9921, Smith LLC, Design, 850`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669]/20 focus:outline-none focus:border-[#059669]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600 text-[11px] space-y-1">
                <span className="font-bold text-slate-800">Supported columns:</span>
                <p>Name, Email, Phone, Company, Service, Value, Address / City.</p>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Preview ({previewRows.length} contacts found)
                </span>
                <button
                  onClick={() => setPreviewRows([])}
                  className="text-slate-500 hover:text-slate-800 underline text-[11px]"
                >
                  Clear & re-enter
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-2 font-bold text-slate-900">{r.name}</td>
                        <td className="p-2 text-slate-600">{r.email || '—'}</td>
                        <td className="p-2 text-slate-600">{r.phone || '—'}</td>
                        <td className="p-2 text-slate-600">{r.company || '—'}</td>
                        <td className="p-2 text-slate-600">{r.service || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-white transition-colors text-xs"
          >
            Cancel
          </button>

          {previewRows.length === 0 ? (
            <button
              onClick={handleParse}
              disabled={!csvText.trim()}
              className="px-5 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-xs cursor-pointer"
            >
              Parse CSV Data
            </button>
          ) : (
            <button
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="px-5 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {previewRows.length} Customers</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
