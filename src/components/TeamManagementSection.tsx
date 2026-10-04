import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, UserPlus, Link, Copy, Check, Shield, Trash2, Mail } from 'lucide-react';

export const TeamManagementSection: React.FC = () => {
  const { user, businessProfile, logActivity, setCheckoutModalPlan } = useApp();

  const [teamMembers, setTeamMembers] = useState([
    { id: 'tm_1', name: user.name || 'Business Owner', email: user.email, role: 'Owner', status: 'Active' },
  ]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');

  const maxSeats = user.planTier === 'agency' ? 5 : 1;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;

    if (user.planTier !== 'agency') {
      alert('Multi-User Seats (up to 5 team members) require Agency Elite ($99/mo). Upgrade to invite your team.');
      setCheckoutModalPlan('agency');
      return;
    }

    if (teamMembers.length >= maxSeats) return;

    const newMem = {
      id: `tm_${Date.now()}`,
      name: newMemberName || newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      status: 'Active',
    };

    setTeamMembers([...teamMembers, newMem]);
    logActivity('team', 'Added Team Member', `Added ${newMem.email} as ${newMem.role}`);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Overview Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#059669]" />
              <span>Team Members & Multi-User Seats</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Invite teammates using a secure link to collaborate on client accounts, invoices, and proposals.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#059669] flex items-center gap-2">
            <span>
              {teamMembers.length} / {maxSeats} Seats Used ({user.planTier.toUpperCase()} Plan)
            </span>
          </div>
        </div>

        {/* Team invites are sent by email from the form below. */}

        {/* Add Member Form (if seats available) */}
        {teamMembers.length < maxSeats ? (
          <form onSubmit={handleAddMember} className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 font-heading">Direct Member Invite</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name (e.g. Alex Rivera)"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#059669]"
              />
              <input
                type="email"
                required
                placeholder="Email (e.g. alex@company.com)"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#059669]"
              />
              <button
                type="submit"
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Teammate</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <span>You have reached your seat limit ({maxSeats} seat{maxSeats > 1 ? 's' : ''}). Upgrade to Agency Elite for up to 5 seats.</span>
          </div>
        )}
      </div>

      {/* Team Member List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">Workspace Roster ({teamMembers.length})</h4>
        <div className="divide-y divide-slate-100">
          {teamMembers.map((member) => (
            <div key={member.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-[#059669] font-bold font-heading flex items-center justify-center">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 font-heading">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {member.role}
                </span>
                {member.role !== 'Owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
