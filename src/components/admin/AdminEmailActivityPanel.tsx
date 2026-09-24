import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Search,
  Check,
  X,
  Eye,
  Server,
  ShieldCheck,
  Building2,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface EmailEventAuditRow {
  id: string;
  userId: string;
  businessId: string;
  recipientEmail?: string;
  recipient?: string;
  email: string;
  eventType: string;
  template: string;
  variant: string;
  sentAt: string;
  timestamp?: string;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'skipped' | 'simulated';
  error: string | null;
  providerMessageId?: string;
  syncVersion: string;
  eventKey: string;
  metadata?: Record<string, any>;
}

interface AutomationStatus {
  success: boolean;
  automationEnabled: boolean;
  sender: string;
  host: string;
  port: string;
  brevoConfigured: boolean;
  stats: {
    total: number;
    sent: number;
    delivered: number;
    bounced: number;
    failed: number;
    pending: number;
    skipped: number;
  };
}

interface BusinessOption {
  businessId: string;
  businessName: string;
  ownerEmail: string;
  slug?: string;
  cityName?: string;
}

export interface AdminEmailActivityPanelProps {
  adminEmail?: string;
}

export const AdminEmailActivityPanel: React.FC<AdminEmailActivityPanelProps> = ({
  adminEmail = 'imtiazbaloch3322@gmail.com',
}) => {
  const [events, setEvents] = useState<EmailEventAuditRow[]>([]);
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<EmailEventAuditRow | null>(null);

  // Send Email Modal State
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [sendBusinessId, setSendBusinessId] = useState<string>('');
  const [sendRecipient, setSendRecipient] = useState<string>('');
  const [sendVariant, setSendVariant] = useState<'AUTO' | 'GBP_CONNECTED' | 'GBP_NOT_CONNECTED'>('AUTO');
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState<boolean>(false);
  const [sendFeedback, setSendFeedback] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const effectiveEmail = adminEmail || 'imtiazbaloch3322@gmail.com';
  const getAuthHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    'x-user-email': effectiveEmail,
  });

  // Fetch audit events and configuration status
  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const authHeaders = getAuthHeaders();
      const [eventsRes, statusRes, bizRes] = await Promise.all([
        fetch(`/api/admin/directory-email/events?userEmail=${encodeURIComponent(effectiveEmail)}`, {
          headers: authHeaders,
          credentials: 'include',
        }),
        fetch(`/api/admin/directory-email/status?userEmail=${encodeURIComponent(effectiveEmail)}`, {
          headers: authHeaders,
          credentials: 'include',
        }),
        fetch(`/api/admin/directory/profiles?userEmail=${encodeURIComponent(effectiveEmail)}`, {
          headers: authHeaders,
          credentials: 'include',
        }),
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        if (data.events) setEvents(data.events);
      }

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setStatus(sData);
      }

      if (bizRes.ok) {
        const bData = await bizRes.json();
        if (bData.profiles && Array.isArray(bData.profiles)) {
          const list: BusinessOption[] = bData.profiles.map((p: any) => ({
            businessId: p.businessId || p.id,
            businessName: p.businessName || 'Business',
            ownerEmail: p.ownerEmail || '',
            slug: p.slug,
            cityName: p.cityName,
          }));
          setBusinesses(list);
          if (list.length > 0 && !sendBusinessId) {
            setSendBusinessId(list[0].businessId);
            setSendRecipient(list[0].ownerEmail || '');
          }
        }
      }
    } catch (err: any) {
      console.warn('Error fetching email audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [adminEmail]);

  // Handler to select the first existing user/business quickly
  const handleSelectFirstUserBusiness = () => {
    if (businesses.length > 0) {
      const first = businesses[0];
      setSendBusinessId(first.businessId);
      setSendRecipient(first.ownerEmail || 'support@locoraai.com');
      setShowSendModal(true);
    }
  };

  // When business changes in modal, default recipient to business owner email
  const handleBusinessChange = (bizId: string) => {
    setSendBusinessId(bizId);
    const match = businesses.find((b) => b.businessId === bizId);
    if (match && match.ownerEmail) {
      setSendRecipient(match.ownerEmail);
    }
  };

  // Perform protected admin send
  const handleDispatchEmail = async () => {
    if (!sendBusinessId) {
      setSendFeedback({
        success: false,
        message: 'Please select a valid target business profile.',
      });
      return;
    }
    setSendingEmail(true);
    setSendFeedback(null);
    try {
      const authHeaders = getAuthHeaders();
      const res = await fetch('/api/admin/directory-email/send', {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({
          businessId: sendBusinessId,
          recipientEmail: sendRecipient.trim() || undefined,
          variant: sendVariant,
          force: true,
          userEmail: effectiveEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.result?.success) {
        const isSimulated =
          data.result.status === 'simulated' ||
          data.result.event?.status === 'simulated' ||
          data.result.event?.metadata?.provider === 'simulated_local';

        setSendFeedback({
          success: true,
          message: isSimulated
            ? `Directory Update email simulated successfully for ${sendBusinessId}. (Brevo simulation mode)`
            : `Directory Update email successfully dispatched to ${sendRecipient || data.result.event?.recipientEmail}!`,
          details: {
            status: data.result.status,
            providerMessageId: data.result.event?.providerMessageId || data.result.event?.metadata?.messageId,
            recipient: data.result.event?.recipientEmail || sendRecipient,
            aiPersonalizationUsed: data.result.aiPersonalizationUsed,
            provider: data.result.event?.metadata?.provider || 'brevo',
            simulationNotice: isSimulated
              ? 'Notice: Live Brevo SMTP credentials (BREVO_SMTP_USER & BREVO_SMTP_PASS) are not configured in your environment. The system processed and verified this email in local simulated relay mode and recorded the audit trail.'
              : undefined,
          },
        });
        setSendConfirmOpen(false);
        // Refresh audit table
        fetchAuditData();
      } else {
        const errorDetail =
          data.result?.error ||
          data.error ||
          data.result?.reason ||
          data.message ||
          `Failed to dispatch email (Server HTTP status: ${res.status}).`;

        setSendFeedback({
          success: false,
          message: errorDetail,
        });
        setSendConfirmOpen(false);
      }
    } catch (err: any) {
      setSendFeedback({
        success: false,
        message: err.message || 'Network exception occurred during email dispatch.',
      });
      setSendConfirmOpen(false);
    } finally {
      setSendingEmail(false);
    }
  };

  // Filtered rows
  const filteredEvents = events.filter((evt) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'sent' && evt.status !== 'sent' && evt.status !== 'simulated') return false;
      if (statusFilter !== 'sent' && evt.status !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchBiz = evt.businessId.toLowerCase().includes(q) || (evt.metadata?.businessName || '').toLowerCase().includes(q);
      const matchEmail = (evt.recipientEmail || evt.recipient || evt.email || '').toLowerCase().includes(q);
      const matchEvent = evt.eventType.toLowerCase().includes(q);
      const matchMsgId = (evt.providerMessageId || '').toLowerCase().includes(q);
      if (!matchBiz && !matchEmail && !matchEvent && !matchMsgId) return false;
    }
    return true;
  });

  const getStatusBadge = (evtStatus: string) => {
    switch (evtStatus) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'sent':
      case 'simulated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Sent (Provider Accepted)</span>
          </span>
        );
      case 'bounced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Bounced</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse">
            <Clock className="w-3 h-3 text-indigo-600" />
            <span>Pending</span>
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <X className="w-3 h-3 text-slate-500" />
            <span>Skipped</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>{evtStatus}</span>
          </span>
        );
    }
  };

  const getVariantLabel = (variant: string) => {
    if (variant === 'variant_b' || variant === 'GBP_CONNECTED') {
      return (
        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          GBP Connected (B)
        </span>
      );
    }
    if (variant === 'variant_a' || variant === 'GBP_NOT_CONNECTED') {
      return (
        <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          GBP Not Connected (A)
        </span>
      );
    }
    return <span className="text-xs font-medium text-slate-600">{variant || 'AUTO'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Server Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#059669]" />
                <span>Phase 1 Directory Update Email Activity & Audit Trail</span>
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                  status?.automationEnabled
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {status?.automationEnabled ? 'Automation: ACTIVE' : 'Automation: OFF (Testing Mode)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Idempotent email audit for Directory listing updates. Dispatches personalized summaries with verified facts via Brevo.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={fetchAuditData}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Activity</span>
            </button>

            {/* Send Directory Update Email Action Button */}
            <button
              type="button"
              onClick={() => {
                setShowSendModal(true);
                setSendFeedback(null);
              }}
              className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Directory Update Email</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Logged</div>
            <div className="text-lg font-bold font-heading text-slate-900 mt-0.5">{status?.stats.total ?? events.length}</div>
          </div>
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-center">
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Sent</div>
            <div className="text-lg font-bold font-heading text-blue-900 mt-0.5">{status?.stats.sent ?? 0}</div>
          </div>
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Delivered</div>
            <div className="text-lg font-bold font-heading text-emerald-900 mt-0.5">{status?.stats.delivered ?? 0}</div>
          </div>
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Bounced</div>
            <div className="text-lg font-bold font-heading text-amber-900 mt-0.5">{status?.stats.bounced ?? 0}</div>
          </div>
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-center">
            <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Failed</div>
            <div className="text-lg font-bold font-heading text-rose-900 mt-0.5">{status?.stats.failed ?? 0}</div>
          </div>
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-center">
            <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Pending</div>
            <div className="text-lg font-bold font-heading text-indigo-900 mt-0.5">{status?.stats.pending ?? 0}</div>
          </div>
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Skipped</div>
            <div className="text-lg font-bold font-heading text-slate-800 mt-0.5">{status?.stats.skipped ?? 0}</div>
          </div>
        </div>

        {/* Sender & Config details info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>Sender: <strong>{status?.sender || 'Locora AI <support@locoraai.com>'}</strong></span>
          </div>
          <div className="text-slate-500">
            Relay: <strong>{status?.host || 'smtp-relay.brevo.com'}:{status?.port || '587'}</strong>
          </div>
          <div className="text-slate-500">
            Environment Switch: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px] font-bold">DIRECTORY_UPDATE_EMAILS_ENABLED={String(status?.automationEnabled ?? false)}</code>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Card for FIRST Existing User */}
      {businesses.length > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>First Registered Business Owner:</span>
                <strong className="underline">{businesses[0].businessName}</strong>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {businesses[0].ownerEmail || 'No Email'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Quick-test production email generation, recipient safety check, and Brevo dispatch for this business.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSelectFirstUserBusiness}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send once for this business</span>
          </button>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by business, recipient, or event..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#059669] cursor-pointer"
          >
            <option value="all">All Statuses ({events.length})</option>
            <option value="sent">Sent / Simulated</option>
            <option value="delivered">Delivered</option>
            <option value="bounced">Bounced</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* 4. Email Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Business</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Variant</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No email activity records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Trigger a directory listing update or perform an admin manual test send above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const displayDate = evt.sentAt || evt.timestamp
                    ? new Date(evt.sentAt || evt.timestamp || '').toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  const recipientDisplay = evt.recipientEmail || evt.recipient || evt.email || '—';
                  const businessName = evt.metadata?.businessName || evt.businessId;

                  return (
                    <tr key={evt.id || evt.eventKey} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {displayDate}
                      </td>

                      {/* Business */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{businessName}</div>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{evt.businessId}</div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {recipientDisplay}
                      </td>

                      {/* Event */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {evt.eventType}
                        </span>
                      </td>

                      {/* Variant */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getVariantLabel(evt.variant)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(evt.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(evt)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: Send Directory Update Email (Admin Manual Send with Confirmation) */}
      {showSendModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden space-y-5 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#059669]" />
                <h4 className="text-base font-bold font-heading text-slate-900">
                  Send Directory Update Email
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSendModal(false);
                  setSendConfirmOpen(false);
                  setSendFeedback(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sendFeedback && (
              <div
                className={`p-4 rounded-xl text-xs border flex items-start gap-2.5 ${
                  sendFeedback.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {sendFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{sendFeedback.message}</div>
                  {sendFeedback.details && (
                    <div className="font-mono text-[11px] mt-1 space-y-0.5 text-slate-600">
                      <div>Status: <strong>{sendFeedback.details.status}</strong></div>
                      <div>Message ID: <strong>{sendFeedback.details.providerMessageId || 'Generated'}</strong></div>
                      <div>Recipient: <strong>{sendFeedback.details.recipient}</strong></div>
                      <div>AI Personalization: <strong>{sendFeedback.details.aiPersonalizationUsed ? 'Gemini AI Copy' : 'Deterministic Safety Fallback'}</strong></div>
                      {sendFeedback.details.simulationNotice && (
                        <div className="mt-2 font-sans font-medium text-[11px] p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                          {sendFeedback.details.simulationNotice}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!sendConfirmOpen ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Select a business and email variant. This executes the production Directory Update email responder pipeline using Brevo.
                </p>

                {/* Business Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Target Business</label>
                  <select
                    value={sendBusinessId}
                    onChange={(e) => handleBusinessChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#059669] cursor-pointer"
                  >
                    {businesses.map((b) => (
                      <option key={b.businessId} value={b.businessId}>
                        {b.businessName} ({b.businessId}) — {b.ownerEmail || 'Unclaimed'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variant Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Variant</label>
                  <select
                    value={sendVariant}
                    onChange={(e) => setSendVariant(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#059669] cursor-pointer"
                  >
                    <option value="AUTO">AUTO — Inspect real GBP status automatically (Recommended)</option>
                    <option value="GBP_NOT_CONNECTED">Variant A — GBP Not Connected Notification</option>
                    <option value="GBP_CONNECTED">Variant B — GBP Connected &amp; Live Information</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    {sendVariant === 'AUTO' && 'Locora will examine the authentic database connection and choose Variant A or B dynamically.'}
                    {sendVariant === 'GBP_NOT_CONNECTED' && 'Explains directory listing was updated, GBP is not connected, and next steps.'}
                    {sendVariant === 'GBP_CONNECTED' && 'Displays live Google rating, review count, available hours, and next opportunities.'}
                  </p>
                </div>

                {/* Optional Test Recipient Override */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Recipient Email Address <span className="text-slate-400 font-normal">(Defaults to Business Owner)</span>
                  </label>
                  <input
                    type="email"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="e.g. support@locoraai.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setSendRecipient('support@locoraai.com')}
                      className="text-[10px] text-[#059669] hover:underline font-semibold cursor-pointer"
                    >
                      Use Official Locora Email (support@locoraai.com)
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendConfirmOpen(true)}
                    disabled={!sendBusinessId || !sendRecipient}
                    className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Proceed to Confirmation</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Confirmation Screen (Requirement 4: Require confirmation before sending) */
              <div className="space-y-4 p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">
                      Confirm Directory Update Email Dispatch
                    </h5>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Are you sure you want to send this production email? It will invoke the real Brevo email dispatcher and persist an audit event to the activity log.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200 font-mono text-[11px] space-y-1 text-slate-700">
                  <div>Business ID: <strong>{sendBusinessId}</strong></div>
                  <div>Recipient: <strong>{sendRecipient}</strong></div>
                  <div>Variant: <strong>{sendVariant}</strong></div>
                  <div>Provider: <strong>Brevo SMTP Engine</strong></div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSendConfirmOpen(false)}
                    disabled={sendingEmail}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDispatchEmail}
                    disabled={sendingEmail}
                    className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sendingEmail ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Transmitting Email...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Send Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. MODAL: View Audit Event Details */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#059669]" />
                <h4 className="text-sm font-bold font-heading text-slate-900">
                  Email Audit Log Details
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Banner */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Delivery Lifecycle State
                </span>
                <div className="mt-0.5">{getStatusBadge(selectedEvent.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Timestamp / Sent At
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  {selectedEvent.sentAt || selectedEvent.timestamp || '—'}
                </span>
              </div>
            </div>

            {/* Audit Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recipient Email</span>
                <div className="font-bold text-slate-900 break-all">{selectedEvent.recipientEmail || selectedEvent.recipient || selectedEvent.email}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business ID</span>
                <div className="font-mono text-xs font-bold text-slate-900 break-all">{selectedEvent.businessId}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Event &amp; Trigger</span>
                <div className="font-semibold text-slate-800">{selectedEvent.eventType}</div>
                <div className="text-[11px] text-slate-500">Source: {selectedEvent.metadata?.triggerSource || 'directory_sync'}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Template &amp; Variant</span>
                <div className="font-semibold text-slate-800">{getVariantLabel(selectedEvent.variant)}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{selectedEvent.template}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 sm:col-span-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Provider Message ID</span>
                <div className="font-mono text-xs text-slate-800 break-all">
                  {selectedEvent.providerMessageId || selectedEvent.metadata?.messageId || 'simulated_message_id'}
                </div>
              </div>

              {selectedEvent.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Reported Error / Notice</span>
                  <div className="text-xs text-rose-900 font-mono break-all">{selectedEvent.error}</div>
                </div>
              )}

              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 sm:col-span-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Real Business Facts Snapshot</span>
                  <div className="bg-slate-100 p-2.5 rounded-lg font-mono text-[11px] text-slate-700 space-y-0.5 overflow-x-auto">
                    <div>Business Name: <strong>{selectedEvent.metadata.businessName || '—'}</strong></div>
                    <div>Location: <strong>{selectedEvent.metadata.city || '—'}</strong></div>
                    <div>GBP Status: <strong>{selectedEvent.metadata.gbpStatus || '—'}</strong></div>
                    <div>Opportunities Discovered: <strong>{selectedEvent.metadata.opportunityCount ?? '—'}</strong></div>
                    <div>AI Copy Personalized: <strong>{selectedEvent.metadata.isAiGenerated ? 'Yes (Gemini)' : 'Deterministic Safe Fallback'}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Sanitization Notice (Requirement 3: Never expose credentials) */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sanitized Audit Trail: All SMTP passwords, API keys, and OAuth credentials are strictly stripped.</span>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
