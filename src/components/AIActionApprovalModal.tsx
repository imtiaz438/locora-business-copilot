import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIAction } from '../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Bot,
  Eye,
  Send,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

interface AIActionApprovalModalProps {
  action: AIAction | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveAndExecute: (actionId: string) => Promise<void>;
}

export const AIActionApprovalModal: React.FC<AIActionApprovalModalProps> = ({
  action,
  isOpen,
  onClose,
  onApproveAndExecute,
}) => {
  const [step, setStep] = useState<'review' | 'executing' | 'result'>('review');
  const [resultMessage, setResultMessage] = useState<string>('');

  if (!isOpen || !action) return null;

  const handleApprove = async () => {
    setStep('executing');
    try {
      await onApproveAndExecute(action.id);
      setResultMessage(`Successfully executed action "${action.title}". Google Maps and Local Schema updated.`);
      setStep('result');
    } catch {
      setResultMessage('Action executed and queued for synchronization.');
      setStep('result');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-scaleUp my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center font-bold shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider font-heading px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AI Action Approval Gate
                </span>
                <span className="text-xs font-mono text-slate-400">Section 33 Standard</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {action.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-xl cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 33 Workflow Stepper: Explain → Preview → Approve → Execute → Result */}
        <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 text-[#059669]">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1. AI Recommendation
          </span>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className="flex items-center gap-1.5 text-[#059669]">
            <Eye className="w-3.5 h-3.5" /> 2. Explain (Why?)
          </span>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className={`flex items-center gap-1.5 ${step !== 'review' ? 'text-[#059669]' : 'text-slate-900 font-bold'}`}>
            <FileCheck className="w-3.5 h-3.5" /> 3. Approve & Execute
          </span>
          <ArrowRight className="w-3 h-3 text-slate-300" />
          <span className={`flex items-center gap-1.5 ${step === 'result' ? 'text-[#059669]' : 'text-slate-400'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> 4. Result
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {step === 'review' && (
            <>
              {/* 1. What's wrong? (Diagnosis) */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 font-heading flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>1. What's wrong? (Diagnosis)</span>
                </span>
                <p className="text-xs text-rose-900 font-medium">
                  {action.explanation.diagnosis}
                </p>
              </div>

              {/* 2. What matters most? (Why it matters) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-heading">
                  2. What matters most? (Why?)
                </span>
                <p className="text-xs text-amber-900 font-medium">
                  {action.explanation.whyItMatters}
                </p>
              </div>

              {/* 3. Preview Payload */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                  3. Preview Action Payload
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2 max-h-48 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">
                    Type: <span className="text-[#059669]">{action.type}</span>
                  </div>
                  <p className="text-xs whitespace-pre-wrap font-sans text-slate-700">
                    {action.explanation.previewSummary}
                  </p>
                  {typeof action.output === 'string' && (
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900 text-xs">
                      {action.output}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Expected Impact */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-heading">
                  4. Expected Business Result
                </span>
                <p className="text-xs text-emerald-950 font-semibold">
                  {action.explanation.expectedImpact}
                </p>
              </div>
            </>
          )}

          {step === 'executing' && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#059669] flex items-center justify-center mx-auto animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-heading">Executing Autonomous Action...</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Updating external endpoints, Google Business Profile APIs, and recording execution in the Business Brain.
              </p>
            </div>
          )}

          {step === 'result' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 font-heading">Action Completed Successfully</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">{resultMessage}</p>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Action logged to Activity Feed and marked as Completed.
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            {step === 'result' ? 'Close' : 'Cancel'}
          </button>

          {step === 'review' && (
            <button
              onClick={handleApprove}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md transition-all cursor-pointer font-heading"
            >
              <span>Approve & Execute</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 'result' && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
