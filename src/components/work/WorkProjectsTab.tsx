import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus, WorkTask } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  FolderKanban,
  Plus,
  Trash2,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  ChevronRight,
  ListTodo,
  AlertCircle,
  Building,
} from 'lucide-react';

interface WorkProjectsTabProps {
  businessId: string;
}

export const WorkProjectsTab: React.FC<WorkProjectsTabProps> = ({ businessId }) => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    workTasks,
    addWorkTask,
    updateWorkTask,
    customers,
    activeBusiness,
    businesses,
    user,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProjectIdForTask, setSelectedProjectIdForTask] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [owner, setOwner] = useState(user.name || '');
  const [budget, setBudget] = useState<number>(0);
  const [clientBusinessId, setClientBusinessId] = useState('');

  // Quick Task in Project Form State
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  // Filter projects strictly by business_id
  const scopedProjects = projects.filter((p) => p.businessId === businessId);
  const scopedTasks = workTasks.filter((t) => t.businessId === businessId);

  const filteredProjects = scopedProjects.filter((proj) => {
    if (statusFilter !== 'all' && proj.status !== statusFilter) return false;
    return true;
  });

  // Calculate progress strictly from actual tasks: completed tasks / total tasks
  const getProjectTasks = (proj: Project): { id: string; title: string; completed: boolean; source: 'workTask' | 'legacy' }[] => {
    const fromWorkTasks = scopedTasks
      .filter((t) => t.projectId === proj.id)
      .map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.status === 'completed',
        source: 'workTask' as const,
      }));

    if (fromWorkTasks.length > 0) {
      return fromWorkTasks;
    }

    if (proj.tasks && proj.tasks.length > 0) {
      return proj.tasks.map((t) => ({ ...t, source: 'legacy' as const }));
    }

    return [];
  };

  const calculateProgress = (proj: Project): number => {
    const tasks = getProjectTasks(proj);
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      businessId,
      clientBusinessId: clientBusinessId || undefined,
      name: name.trim(),
      title: name.trim(),
      description: description.trim(),
      client: client.trim() || activeBusiness.name,
      customerName: client.trim() || activeBusiness.name,
      status,
      priority,
      startDate,
      dueDate: dueDate || undefined,
      targetDate: dueDate || undefined,
      owner: owner.trim() || user.name || 'Project Owner',
      budget: budget || 0,
      progress: 0,
      tasks: [],
    });

    setName('');
    setDescription('');
    setClient('');
    setStatus('active');
    setPriority('medium');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setBudget(0);
    setClientBusinessId('');
    setShowNewProjectModal(false);
  };

  const handleAddInlineTask = async (projectId: string) => {
    if (!inlineTaskTitle.trim()) return;
    await addWorkTask({
      businessId,
      projectId,
      title: inlineTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
    });
    setInlineTaskTitle('');
    setSelectedProjectIdForTask(null);
  };

  const handleToggleTask = async (taskItem: { id: string; title: string; completed: boolean; source: 'workTask' | 'legacy' }, proj: Project) => {
    if (taskItem.source === 'workTask') {
      const nextStatus = taskItem.completed ? 'todo' : 'completed';
      await updateWorkTask(taskItem.id, {
        status: nextStatus,
        completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      });
    } else {
      const updatedLegacyTasks = (proj.tasks || []).map((t) => (t.id === taskItem.id ? { ...t, completed: !t.completed } : t));
      updateProject(proj.id, { tasks: updatedLegacyTasks });
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'planning':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'on_hold':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'completed':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#059669]" />
            <span>Active Projects & Engagements ({scopedProjects.length})</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational deliverables, sprints, and campaigns for{' '}
            <span className="font-semibold text-slate-700">{activeBusiness.name}</span>
          </p>
        </div>

        <button
          onClick={() => setShowNewProjectModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter by Status */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {(['all', 'planning', 'active', 'on_hold', 'completed', 'cancelled'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors cursor-pointer ${
              statusFilter === st ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st === 'all' ? 'All Projects' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto border border-emerald-200">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h5 className="text-base font-bold text-slate-900">No active work yet.</h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create a project or let AI Manager suggest your first tasks.
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#059669] text-white font-bold text-xs hover:bg-[#047857] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProjects.map((proj) => {
            const tasks = getProjectTasks(proj);
            const progress = calculateProgress(proj);
            const clientName = proj.client || proj.customerName || activeBusiness.name;

            return (
              <div
                key={proj.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 leading-snug">{proj.name || proj.title}</h5>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Building className="w-3 h-3 text-slate-400" />
                        Client: <strong className="text-slate-700">{clientName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={proj.status}
                        onChange={(e) => updateProject(proj.id, { status: e.target.value as ProjectStatus })}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border capitalize cursor-pointer ${getStatusBadge(
                          proj.status
                        )}`}
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={() => setProjectToDelete(proj)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {proj.description && <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>}

                  {/* Calculated Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Progress: <strong className="text-slate-800">{tasks.filter((t) => t.completed).length}/{tasks.length} tasks completed</strong>
                      </span>
                      <span className="font-mono font-bold text-[#059669]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#059669] rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks in this Project */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                        Deliverables & Milestones ({tasks.length})
                      </span>
                      <button
                        onClick={() => setSelectedProjectIdForTask(selectedProjectIdForTask === proj.id ? null : proj.id)}
                        className="text-[11px] font-bold text-[#059669] hover:underline cursor-pointer"
                      >
                        + Add Task
                      </button>
                    </div>

                    {selectedProjectIdForTask === proj.id && (
                      <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                        <input
                          type="text"
                          placeholder="Task title..."
                          value={inlineTaskTitle}
                          onChange={(e) => setInlineTaskTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInlineTask(proj.id);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddInlineTask(proj.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-[#047857] cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {tasks.length > 0 && (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {tasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => handleToggleTask(t, proj)}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {t.completed ? (
                                <CheckCircle className="w-4 h-4 text-[#059669]" />
                              ) : (
                                <div className="w-4 h-4 rounded border-2 border-slate-300" />
                              )}
                              <span className={`text-[11px] ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {t.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {t.completed ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-3">
                    {proj.owner && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{proj.owner}</span>
                      </span>
                    )}
                    {proj.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due: {proj.dueDate}</span>
                      </span>
                    )}
                  </div>

                  {proj.budget ? (
                    <span className="font-mono font-bold text-slate-800">
                      Budget: ${proj.budget.toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Initialize New Project</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 90-Day Local Authority & GMB Optimization Sprint"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline key deliverables, milestones, and scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Client / Entity</label>
                  <select
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value={activeBusiness.name}>{activeBusiness.name} (Direct)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.company || 'Client'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
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

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Project Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

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
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#059669] text-white font-bold hover:bg-[#047857] shadow-xs cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Safe In-App Project Deletion Confirmation */}
      <DeleteConfirmModal
        isOpen={projectToDelete !== null}
        title="Delete Project"
        itemName={projectToDelete ? (projectToDelete.name || projectToDelete.title) : undefined}
        message="Are you sure you want to permanently delete this project? All associated milestones and project data will be removed."
        confirmLabel="Delete Project"
        onConfirm={() => {
          if (projectToDelete) {
            deleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }
        }}
        onClose={() => setProjectToDelete(null)}
      />
    </div>
  );
};
