import React from 'react';
import { useApp } from '../context/AppContext';
import { LocoraNotification } from '../types';
import {
  AlertCircle,
  Sparkles,
  Bot,
  CheckCircle,
  X,
  ExternalLink,
  ChevronRight,
  Bell,
  Check,
} from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setActiveTab,
    logActivity,
  } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleAction = (item: LocoraNotification) => {
    markNotificationAsRead(item.id);
    setActiveTab(item.actionTargetTab);
    logActivity('notification_action', item.title, `Executed ${item.actionLabel} for ${item.actionTargetTab}`);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl py-3 z-50 font-sans animate-fadeIn">
      {/* Header */}
      <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 font-heading">High-Signal Alerts</h4>
            <p className="text-[10px] text-slate-400">Section 28 Notification Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[10px] font-bold text-[#059669] hover:text-[#047857] cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Items - strictly 3 types:
          🔴 Action Needed
          🟢 Opportunity
          🤖 Locora Completed
      */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {notifications.map((n) => {
          const isAction = n.type === 'action_needed';
          const isOpp = n.type === 'opportunity';
          const isDone = n.type === 'completed';

          return (
            <div
              key={n.id}
              className={`p-3.5 transition-colors ${
                n.isRead ? 'bg-white opacity-75' : 'bg-slate-50/50'
              } hover:bg-slate-100/70`}
            >
              <div className="flex items-start gap-3">
                {/* Visual Icon Badge strictly mirroring Section 28 */}
                <div className="shrink-0 mt-0.5">
                  {isAction && (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                      🔴
                    </span>
                  )}
                  {isOpp && (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-bold">
                      🟢
                    </span>
                  )}
                  {isDone && (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 text-xs font-bold">
                      🤖
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider font-heading px-1.5 py-0.2 rounded ${
                        isAction
                          ? 'text-rose-700 bg-rose-50'
                          : isOpp
                          ? 'text-emerald-800 bg-emerald-50'
                          : 'text-purple-700 bg-purple-50'
                      }`}
                    >
                      {isAction ? 'Action Needed' : isOpp ? 'Opportunity' : 'Locora Completed'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{n.createdAt}</span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 font-heading leading-tight">
                    {n.title}
                  </h5>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    {n.message}
                  </p>

                  {n.evidence && (
                    <p className="text-[10px] text-slate-500 font-mono bg-white p-1.5 rounded-lg border border-slate-200/70">
                      Proof: {n.evidence}
                    </p>
                  )}

                  <div className="pt-1.5 flex items-center justify-between">
                    <button
                      onClick={() => handleAction(n)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        isAction
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : isOpp
                          ? 'bg-[#059669] hover:bg-[#047857] text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <span>{n.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>

                    {!n.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(n.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer font-medium"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>Strictly high-signal notifications only</span>
        <span className="font-mono text-[#059669] font-bold">Locora Autonomous</span>
      </div>
    </div>
  );
};
