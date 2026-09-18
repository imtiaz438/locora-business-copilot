import React, { useState } from 'react';
import { ReportSnapshot } from '../../types/reports';
import { Clock, Trash2, ArrowRight, Eye, Calendar, Database, ShieldCheck, X } from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface ReportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: ReportSnapshot[];
  activeSnapshotId: string | null;
  onSelectSnapshot: (snapshot: ReportSnapshot) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
}

export const ReportHistoryModal: React.FC<ReportHistoryModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  activeSnapshotId,
  onSelectSnapshot,
  onDeleteSnapshot,
}) => {
  const [snapshotToDelete, setSnapshotToDelete] = useState<ReportSnapshot | null>(null);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Historical Report Snapshots</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved permanent diagnostic snapshots. Historical records are preserved and never rewritten.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No reports yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &quot;Generate Fresh Snapshot&quot; to freeze a real operational report snapshot.
              </p>
            </div>
          ) : (
            snapshots.map((snap) => {
              const isActive = snap.id === activeSnapshotId;
              const connectedCount = snap.dataSourcesUsed?.filter((s) => s.isConnected).length || 0;

              return (
                <div
                  key={snap.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {snap.reportTitle}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {snap.period}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-600 text-white">
                          Current View
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(snap.reportGeneratedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })} at {new Date(snap.reportGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        {connectedCount} data sources
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        onSelectSnapshot(snap);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isActive ? 'Viewing' : 'Load Snapshot'}
                    </button>

                    <button
                      onClick={() => setSnapshotToDelete(snap)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Immutable snapshots preserved per multi-tenant isolation</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Safe In-App Snapshot Deletion Modal */}
      <DeleteConfirmModal
        isOpen={snapshotToDelete !== null}
        title="Delete Report Snapshot"
        itemName={snapshotToDelete ? `${snapshotToDelete.reportType.toUpperCase()} Snapshot (${(snapshotToDelete.reportGeneratedAt || snapshotToDelete.dataSnapshotAt || '').slice(0, 10)})` : undefined}
        message="Are you sure you want to delete this historical report snapshot? This action cannot be undone."
        confirmLabel="Delete Snapshot"
        onConfirm={() => {
          if (snapshotToDelete) {
            onDeleteSnapshot(snapshotToDelete.id);
            setSnapshotToDelete(null);
          }
        }}
        onClose={() => setSnapshotToDelete(null)}
      />
    </div>
  );
};
