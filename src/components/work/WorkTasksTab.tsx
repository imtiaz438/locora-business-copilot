import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkTask } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  User,
  FolderKanban,
  AlertCircle,
  Filter,
  CheckCircle,
  Clock,
  Search,
} from 'lucide-react';

interface WorkTasksTabProps {
  businessId: string;
}

export const WorkTasksTab: React.FC<WorkTasksTabProps> = ({ businessId }) => {
  const {
    workTasks,
    addWorkTask,
    updateWorkTask,
    deleteWorkTask,
    projects,
    activeBusiness,
    businesses,
    user,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'blocked' | 'completed'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<WorkTask | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'blocked' | 'completed'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState(user.name || '');
  const [projectId, setProjectId] = useState('');
  const [clientBusinessId, setClientBusinessId] = useState('');

  // Filter tasks strictly by business_id
  const scopedTasks = workTasks.filter((t) => t.businessId === businessId);
  const scopedProjects = projects.filter((p) => p.businessId === businessId);

  const filteredTasks = scopedTasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (projectFilter !== 'all' && task.projectId !== projectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchAssignee = task.assignedTo?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchAssignee) return false;
    }
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addWorkTask({
      businessId,
      clientBusinessId: clientBusinessId || undefined,
      projectId: projectId || undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDueDate('');
    setProjectId('');
    setClientBusinessId('');
    setShowNewTaskModal(false);
  };

  const handleCycleStatus = async (task: WorkTask) => {
    const sequence: ('todo' | 'in_progress' | 'blocked' | 'completed')[] = ['todo', 'in_progress', 'blocked', 'completed'];
    const currentIdx = sequence.indexOf(task.status);
    const nextStatus = sequence[(currentIdx + 1) % sequence.length];
    await updateWorkTask(task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'blocked':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#059669]" />
            <span>Workspace Tasks & Deliverables ({scopedTasks.length})</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational tasks assigned to <span className="font-semibold text-slate-700">{activeBusiness.name}</span>
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'todo', 'in_progress', 'blocked', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {scopedProjects.length > 0 && (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="all">All Projects</option>
              {scopedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.title}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-slate-800">No tasks found</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Work must represent actual deliverables performed for this business. No fake tasks are populated.
            </p>
          </div>
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="px-4 py-2 rounded-xl bg-[#059669] text-white font-bold text-xs hover:bg-[#047857] transition-all cursor-pointer"
          >
            + Create First Task
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
          {filteredTasks.map((task) => {
            const project = scopedProjects.find((p) => p.id === task.projectId);
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors bg-white"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleCycleStatus(task)}
                    className="mt-0.5 text-slate-400 hover:text-[#059669] transition-colors cursor-pointer"
                    title={`Current status: ${task.status}. Click to cycle.`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-5 h-5 text-[#059669] fill-emerald-100" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-[#059669] transition-colors" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </span>

                      <button
                        onClick={() => handleCycleStatus(task)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize cursor-pointer ${getStatusBadge(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </button>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 flex-wrap">
                      {project && (
                        <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <FolderKanban className="w-3 h-3 text-slate-400" />
                          <span>{project.name || project.title}</span>
                        </span>
                      )}

                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Due: {task.dueDate}</span>
                        </span>
                      )}

                      {task.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Assignee: {task.assignedTo}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewTaskModal(false);
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Add Operational Task</h3>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors font-bold text-xs cursor-pointer flex items-center gap-1"
                aria-label="Close modal"
              >
                <span>✕</span>
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optimize Google Business Profile service descriptions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide scope of work or acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned To</label>
                  <input
                    type="text"
                    placeholder="Assignee name or role"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {scopedProjects.length > 0 && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assign to Project (Optional)</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">No Project (Standalone Task)</option>
                    {scopedProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {user.planTier === 'agency' && businesses.length > 1 && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Agency Client Account (Optional)</label>
                  <select
                    value={clientBusinessId}
                    onChange={(e) => setClientBusinessId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">Default Business ({activeBusiness.name})</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city || 'Client'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] text-white font-bold hover:bg-[#047857] shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Safe In-App Task Deletion Modal */}
      <DeleteConfirmModal
        isOpen={taskToDelete !== null}
        title="Delete Task"
        itemName={taskToDelete?.title}
        message="Are you sure you want to delete this task? It will be removed from all associated project timelines."
        confirmLabel="Delete Task"
        onConfirm={() => {
          if (taskToDelete) {
            deleteWorkTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
};
