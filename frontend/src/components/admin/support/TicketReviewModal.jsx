import React, { useState } from 'react';
import { 
  X, 
  User, 
  CheckCircle2, 
  Clock, 
  Send,
  Mail,
  Phone,
  Store
} from 'lucide-react';
import { Button } from '../../ui/button';

export default function TicketReviewModal({
  ticket,
  onClose,
  onUpdateStatus,
  actionLoading,
  formatDate
}) {
  const [adminNotes, setAdminNotes] = useState('');

  if (!ticket) return null;

  const user = ticket.user || {};

  const handleAction = (status) => {
    onUpdateStatus(ticket.id, status, adminNotes);
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || 'normal').toLowerCase();
    switch (p) {
      case 'urgent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">🔥 Urgent</span>;
      case 'high':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">⚠️ High</span>;
      case 'normal':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Normal</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">Open</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Resolved</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* ── 1. MODAL HEADER ────────────────────────────────────────── */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">
                Support Ticket Resolution
              </h3>
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ticket ID: <span className="font-mono text-gray-800 font-semibold">{ticket.id}</span>
              {ticket.createdAt && (
                <span> • Created on {formatDate ? formatDate(ticket.createdAt) : new Date(ticket.createdAt).toLocaleDateString()}</span>
              )}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. SENDER / USER DETAILS CARD ──────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600" /> Ticket Raised By
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-purple-100 text-purple-700 border border-purple-200">
              {user.role || 'User'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-semibold text-gray-900">{user.fullName || 'Unknown User'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email Address</p>
              <p className="font-medium text-gray-800 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {user.email || '—'}
              </p>
            </div>
            {user.phone && (
              <div>
                <p className="text-xs text-gray-500">Contact Number</p>
                <p className="font-medium text-gray-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {user.phone}
                </p>
              </div>
            )}
            {user.storeName && (
              <div>
                <p className="text-xs text-gray-500">Business Store</p>
                <p className="font-medium text-gray-800 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  {user.storeName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. TICKET SUBJECT & INQUIRY DESCRIPTION ────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Inquiry / Dispute Details
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
              Category: <strong className="text-gray-900">{ticket.category || 'General'}</strong>
            </span>
          </div>

          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-gray-900">
              {ticket.subject}
            </h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white/70 p-3 rounded-lg border border-purple-100/60 font-sans">
              {ticket.description || 'No detailed description provided.'}
            </div>
          </div>
        </div>

        {/* ── 4. RESOLUTION NOTE / ADMIN MESSAGE ─────────────────────── */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-purple-600" /> Resolution Note / Notification to User
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Write official resolution notes or actions taken (will be sent as in-app notification to the user)..."
            rows={3}
            className="w-full text-sm rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
        </div>

        {/* ── 5. ACTION BUTTONS ──────────────────────────────────────── */}
        <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={actionLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {ticket.status !== 'IN_PROGRESS' && (
              <Button
                type="button"
                onClick={() => handleAction('IN_PROGRESS')}
                disabled={actionLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 text-xs font-semibold px-4 py-2"
              >
                <Clock className="w-3.5 h-3.5" />
                Investigate (In Progress)
              </Button>
            )}

            {ticket.status !== 'RESOLVED' && (
              <Button
                type="button"
                onClick={() => handleAction('RESOLVED')}
                disabled={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs font-semibold px-4 py-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve Ticket
              </Button>
            )}

            {ticket.status !== 'CLOSED' && (
              <Button
                type="button"
                onClick={() => handleAction('CLOSED')}
                disabled={actionLoading}
                className="bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-1.5 text-xs font-semibold px-4 py-2"
              >
                Close Ticket
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
