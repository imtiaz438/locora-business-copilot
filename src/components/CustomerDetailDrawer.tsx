import React, { useState, useEffect } from 'react';
import { Customer, CustomerActivity, CustomerNote, CustomerTask, CustomerStatus, PipelineStage, CustomerActivityType } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Plus,
  MessageSquare,
  FileText,
  CheckSquare,
  Square,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Send,
  UserCheck,
  Activity,
  History,
} from 'lucide-react';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onStartProposal?: (customer: Customer) => void;
  onStartInvoice?: (customer: Customer) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  onClose,
  onEdit,
  onStartProposal,
  onStartInvoice,
}) => {
  const { updateCustomer, activeBusiness, user } = useApp();
  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'tasks'>('timeline');

  // Real activity, note, task state
  const [activities, setActivities] = useState<CustomerActivity[]>([]);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [tasks, setTasks] = useState<CustomerTask[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals / forms for new actions
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<CustomerActivityType>('call_logged');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');

  // Note form
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Task form
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Load customer data when customer changes
  useEffect(() => {
    if (!customer) return;

    const fetchDetails = async () => {
      setLoading(true);
      const bizId = customer.businessId || activeBusiness.id;
      try {
        const [actRes, notesRes, tasksRes] = await Promise.all([
          fetch(`/api/workspace/customers/${customer.id}/activities?businessId=${encodeURIComponent(bizId)}`),
          fetch(`/api/workspace/customers/${customer.id}/notes?businessId=${encodeURIComponent(bizId)}`),
          fetch(`/api/workspace/customers/${customer.id}/tasks?businessId=${encodeURIComponent(bizId)}`),
        ]);

        if (actRes.ok) {
          const actData = await actRes.json();
          setActivities(actData.activities || []);
        }
        if (notesRes.ok) {
          const noteData = await notesRes.json();
          setNotes(noteData.notes || []);
        }
        if (tasksRes.ok) {
          const taskData = await tasksRes.json();
          setTasks(taskData.tasks || []);
        }
      } catch (err) {
        console.error('Failed to load customer details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [customer?.id, customer?.businessId, activeBusiness.id]);

  if (!customer) return null;

  const currentStatus: CustomerStatus = customer.status || 'lead';
  const currentStage: PipelineStage = customer.pipelineStage || 'new_lead';
  const bizId = customer.businessId || activeBusiness.id;

  const handleStatusChange = async (newStatus: CustomerStatus) => {
    updateCustomer(customer.id, { status: newStatus });
    // Log status change activity
    try {
      const res = await fetch(`/api/workspace/customers/${customer.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bizId,
          type: 'status_changed',
          title: `Status Changed to ${newStatus.toUpperCase()}`,
          description: `Customer status updated from ${currentStatus} to ${newStatus} by ${user.name || 'user'}.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActivities((prev) => [data.activity, ...prev]);
      }
    } catch {}
  };

  const handleStageChange = async (newStage: PipelineStage) => {
    const newStatus: CustomerStatus = newStage === 'won' ? 'customer' : newStage === 'proposal' ? 'proposal_sent' : 'lead';
    updateCustomer(customer.id, { pipelineStage: newStage, status: newStatus });
    try {
      const res = await fetch(`/api/workspace/customers/${customer.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bizId,
          type: 'status_changed',
          title: `Pipeline Stage: ${newStage.replace('_', ' ').toUpperCase()}`,
          description: `Moved to pipeline stage "${newStage.replace('_', ' ')}".`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActivities((prev) => [data.activity, ...prev]);
      }
    } catch {}
  };

  const handleLogActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle) return;

    try {
      const res = await fetch(`/api/workspace/customers/${customer.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bizId,
          type: activityType,
          title: activityTitle,
          description: activityDesc,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActivities((prev) => [data.activity, ...prev]);
        setShowLogActivityModal(false);
        setActivityTitle('');
        setActivityDesc('');
        updateCustomer(customer.id, {
          lastActivity: activityTitle,
          lastContactAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/workspace/customers/${customer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bizId,
          content: noteContent.trim(),
          author: user.name || 'Owner',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
        setNoteContent('');
        // Also log activity
        fetch(`/api/workspace/customers/${customer.id}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: bizId,
            type: 'note_added',
            title: 'Note Added',
            description: noteContent.slice(0, 100),
          }),
        }).then(async (r) => {
          if (r.ok) {
            const actData = await r.json();
            setActivities((prev) => [actData.activity, ...prev]);
          }
        });
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    try {
      const res = await fetch(`/api/workspace/customers/${customer.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bizId,
          title: taskTitle,
          dueDate: taskDueDate || undefined,
          priority: taskPriority,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        setShowAddTaskModal(false);
        setTaskTitle('');
        setTaskDueDate('');
        // Log activity
        fetch(`/api/workspace/customers/${customer.id}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: bizId,
            type: 'task_created',
            title: `Task Created: ${taskTitle}`,
            description: taskDueDate ? `Due: ${taskDueDate}` : 'No due date',
          }),
        }).then(async (r) => {
          if (r.ok) {
            const actData = await r.json();
            setActivities((prev) => [actData.activity, ...prev]);
          }
        });
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleToggleTask = async (task: CustomerTask) => {
    try {
      const updatedCompleted = !task.completed;
      const res = await fetch(`/api/workspace/customers/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedCompleted }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: updatedCompleted } : t))
        );
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const getSourceLabel = (src?: string) => {
    switch (src) {
      case 'website_form':
        return 'Website Form';
      case 'manual':
        return 'Manually Added';
      case 'imported':
        return 'Imported CSV';
      case 'connected_crm':
        return 'Connected CRM';
      default:
        return src || 'Manual';
    }
  };

  const getActivityIcon = (type: CustomerActivityType) => {
    switch (type) {
      case 'call_logged':
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'meeting_logged':
        return <Calendar className="w-3.5 h-3.5 text-purple-600" />;
      case 'email_received':
        return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case 'note_added':
        return <MessageSquare className="w-3.5 h-3.5 text-slate-600" />;
      case 'status_changed':
        return <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />;
      case 'proposal_created':
      case 'proposal_sent':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'invoice_created':
      case 'invoice_paid':
        return <DollarSign className="w-3.5 h-3.5 text-teal-600" />;
      case 'task_created':
        return <CheckSquare className="w-3.5 h-3.5 text-rose-600" />;
      case 'lead_created':
      default:
        return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
          <div className="space-y-1.5 flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold font-heading text-slate-900">{customer.name}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-100 text-slate-700 border-slate-200">
                Source: {getSourceLabel(customer.source || customer.leadSource)}
              </span>
            </div>

            {customer.company && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.company}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(customer)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Edit Contact
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Pipeline Bar */}
        <div className="p-4 bg-white border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CRM Status</label>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as CustomerStatus)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#059669]/20 focus:outline-none"
            >
              <option value="lead">Lead (Inquiry)</option>
              <option value="prospect">Prospect (Qualified)</option>
              <option value="customer">Customer (Won Client)</option>
              <option value="inactive">Inactive</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pipeline Stage</label>
            <select
              value={currentStage}
              onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#059669]/20 focus:outline-none"
            >
              <option value="new_lead">1. New Lead</option>
              <option value="contacted">2. Contacted</option>
              <option value="qualified">3. Qualified</option>
              <option value="proposal">4. Proposal Sent</option>
              <option value="won">5. Won (Active Client)</option>
            </select>
          </div>
        </div>

        {/* Quick Contact & Details */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-1.5 text-slate-800 hover:text-[#059669] font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-[#059669]" />
                <span>{customer.phone}</span>
              </a>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-1.5 text-slate-800 hover:text-[#059669] font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-[#059669]" />
                <span>{customer.email}</span>
              </a>
            )}
            {customer.value > 0 && (
              <div className="flex items-center gap-1 text-emerald-800 font-extrabold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <DollarSign className="w-3 h-3" />
                <span>${customer.value.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onStartProposal && (
              <button
                onClick={() => onStartProposal(customer)}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-purple-600" />
                <span>+ Proposal</span>
              </button>
            )}
            {onStartInvoice && (
              <button
                onClick={() => onStartInvoice(customer)}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>+ Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Toolbar: Log Call / Meeting / Add Task */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActivityType('call_logged');
                setActivityTitle(`Call with ${customer.name}`);
                setShowLogActivityModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Log Call</span>
            </button>

            <button
              onClick={() => {
                setActivityType('meeting_logged');
                setActivityTitle(`Meeting with ${customer.name}`);
                setShowLogActivityModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Log Meeting</span>
            </button>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>+ Add Task</span>
            </button>
          </div>
        </div>

        {/* Drawer Tabs: Timeline | Notes | Tasks */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex items-center gap-6">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Timeline ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'border-[#059669] text-[#059669]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({tasks.filter((t) => !t.completed).length} open)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {loading && activities.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading timeline...</div>
              ) : activities.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No activity logged yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Log calls, meetings, status changes, or note entries to build this customer's real relationship timeline.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-[#059669] flex items-center justify-center transition-colors">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">{act.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(act.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {act.description && (
                          <p className="text-xs text-slate-600 whitespace-pre-wrap">{act.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">Add Internal Note</label>
                <textarea
                  rows={3}
                  placeholder="Record customer preferences, conversation notes, or follow-up context..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#059669]/20 focus:outline-none focus:border-[#059669]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !noteContent.trim()}
                    className="px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              {notes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No notes written for this contact yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {notes.map((n) => (
                    <div key={n.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-800">{n.author || 'Team Member'}</span>
                        <span className="font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Action Items & Tasks</span>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No tasks assigned for this customer.</div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        task.completed ? 'bg-slate-50/60 border-slate-200 opacity-60' : 'bg-white border-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className="mt-0.5 text-slate-400 hover:text-[#059669] transition-colors cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-4 h-4 text-[#059669]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 space-y-0.5">
                        <div className={`text-xs font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Due: {task.dueDate}</span>
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Customer ID: </span>
            <span className="font-mono text-slate-700">{customer.id}</span>
          </div>
          <div>
            <span>Last Contact: </span>
            <span className="font-medium text-slate-800">
              {customer.lastContactAt
                ? new Date(customer.lastContactAt).toLocaleDateString()
                : customer.lastActivity || 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showLogActivityModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Log Customer Activity</h3>
              <button onClick={() => setShowLogActivityModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleLogActivitySubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as CustomerActivityType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="call_logged">Phone Call</option>
                  <option value="meeting_logged">Meeting / Consultation</option>
                  <option value="email_received">Email Exchanged</option>
                  <option value="note_added">General Touchpoint</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discovery call regarding kitchen remodel"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Details & Outcome</label>
                <textarea
                  rows={3}
                  placeholder="Summarize key points, customer needs, and agreed next steps..."
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogActivityModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#059669] text-white rounded-lg font-bold hover:bg-[#047857]"
                >
                  Save to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Add Customer Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send updated pricing estimate"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#059669] text-white rounded-lg font-bold hover:bg-[#047857]"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
