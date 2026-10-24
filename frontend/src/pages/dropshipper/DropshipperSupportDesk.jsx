import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { logout } from '../../redux/userSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DROPSHIPPER_MENU } from './dropshipperMenu';
import { 
  LifeBuoy, 
  MessageSquareText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  Send, 
  Paperclip, 
  Building2, 
  Truck, 
  ShieldAlert, 
  DollarSign, 
  FileText, 
  X,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const INITIAL_TICKETS = [
  {
    id: 'TCK-DS-9821',
    orderId: 'ORD-90214',
    awb: 'DLV-8829104',
    courier: 'Delhivery Surface',
    category: 'COURIER_DELAY',
    categoryLabel: 'Courier In-Transit Stuck > 48h',
    priority: 'HIGH',
    status: 'IN_REVIEW', // 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED'
    subject: 'Delhivery Jaipur hub has not updated scan for 3 days',
    createdAt: 'Today, 11:20 AM',
    lastUpdate: '15 mins ago',
    messages: [
      { sender: 'dropshipper', name: 'You', time: '11:20 AM', text: 'Customer has reached out on WhatsApp. The parcel #DLV-8829104 is stuck at Jaipur Hub with no movement since 22 Oct. Please escalate with Delhivery Nodal team.' },
      { sender: 'agent', name: 'MShoppy Support Officer', time: '11:45 AM', text: 'We have flagged NDR/escalation ticket #DLV-ES-2901 directly to Delhivery priority desk. Delivery attempt is scheduled by tomorrow 2:00 PM.' }
    ]
  },
  {
    id: 'TCK-DS-9804',
    orderId: 'ORD-89410',
    awb: 'SFX-7738291',
    courier: 'Shadowfax Express',
    category: 'DAMAGED_ITEM',
    categoryLabel: 'Customer Received Damaged Parcel',
    priority: 'URGENT',
    status: 'RESOLVED',
    subject: 'Customer reported torn dress package, unboxing video submitted',
    createdAt: '22 Oct 2024, 03:15 PM',
    lastUpdate: 'Yesterday, 06:00 PM',
    messages: [
      { sender: 'dropshipper', name: 'You', time: '03:15 PM', text: 'Customer received damaged parcel. Unboxing video link provided. Please ensure supplier absorbs ROT fee and full margin is released.' },
      { sender: 'agent', name: 'Compliance Desk', time: '06:00 PM', text: 'Claim approved! 100% ROT liability assigned to Surat Textile Supplier. Full margin ₹340 credited to your wallet.' }
    ]
  },
  {
    id: 'TCK-DS-9782',
    orderId: 'ORD-88194',
    awb: 'BLU-6629104',
    courier: 'BlueDart Air',
    category: 'MARGIN_DISPUTE',
    categoryLabel: 'Escrow Margin Deduction Discrepancy',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    subject: 'TDS deduction discrepancy on delivered order',
    createdAt: '20 Oct 2024, 09:30 AM',
    lastUpdate: '21 Oct 2024',
    messages: [
      { sender: 'dropshipper', name: 'You', time: '09:30 AM', text: 'The net margin shown in order summary was ₹450, but wallet passbook credited ₹410. Please clarify the ₹40 difference.' },
      { sender: 'agent', name: 'Finance Accounts', time: '02:00 PM', text: 'Resolved: The ₹40 was Courier COD cash collection fee charged by BlueDart. Invoice adjusted and credited to passbook.' }
    ]
  }
];

export default function DropshipperSupportDesk() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Tickets state with localStorage persistence
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_dropshipper_tickets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_TICKETS;
  });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  // New Ticket Form State
  const [newCategory, setNewCategory] = useState('COURIER_DELAY');
  const [newOrderId, setNewOrderId] = useState('');
  const [newAwb, setNewAwb] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Persist tickets
  useEffect(() => {
    try {
      localStorage.setItem('meesho_dropshipper_tickets', JSON.stringify(tickets));
    } catch (e) {}
  }, [tickets]);

  // Handle Tab Change in Sidebar
  const handleTabChange = (tabId) => {
    const findPath = (items) => {
      for (const item of items) {
        if (item.id === tabId && item.path) return item.path;
        if (item.children) {
          const sub = item.children.find(c => c.id === tabId);
          if (sub && sub.path) return sub.path;
        }
      }
      return null;
    };
    const target = findPath(DROPSHIPPER_MENU);
    if (target) navigate(target);
  };

  // Safe Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      localStorage.removeItem('meesho_dropshipper_session');
      toast.success("Successfully logged out!");
      navigate('/dropshipper-login');
    } catch (e) {
      toast.error("Logout failed.");
    }
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchOrder = t.orderId?.toLowerCase().includes(q);
      const matchAwb = t.awb?.toLowerCase().includes(q);
      const matchSub = t.subject.toLowerCase().includes(q);
      return matchId || matchOrder || matchAwb || matchSub;
    }
    return true;
  });

  // KPI Metrics
  const totalCount = tickets.length;
  const inReviewCount = tickets.filter(t => t.status === 'IN_REVIEW' || t.status === 'OPEN').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

  // Handle Create New Ticket
  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      toast.error("Please provide both a Subject and detailed Description.");
      return;
    }

    const categoryMap = {
      'COURIER_DELAY': 'Courier In-Transit Stuck > 48h',
      'DAMAGED_ITEM': 'Customer Received Damaged Parcel',
      'MARGIN_DISPUTE': 'Escrow Margin Deduction Discrepancy',
      'SUPPLIER_MISPACK': 'Wrong SKU / Size Shipped by Supplier',
      'RTO_PENALTY': 'Unfair RTO Freight Charge'
    };

    const newTicket = {
      id: `TCK-DS-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: newOrderId.trim() || 'ORD-GENERAL',
      awb: newAwb.trim() || 'N/A',
      courier: 'Express Logistics Desk',
      category: newCategory,
      categoryLabel: categoryMap[newCategory] || 'Operational Claim',
      priority: newPriority,
      status: 'OPEN',
      subject: newSubject.trim(),
      createdAt: 'Just now',
      lastUpdate: 'Just now',
      messages: [
        {
          sender: 'dropshipper',
          name: currentUser?.fullName || 'Dropshipper Partner',
          time: 'Just now',
          text: newDescription.trim()
        }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setIsNewTicketOpen(false);
    // Reset Form
    setNewSubject('');
    setNewDescription('');
    setNewOrderId('');
    setNewAwb('');
    toast.success(`Support Ticket #${newTicket.id} raised successfully!`, {
      description: "Our dedicated Dropshipper Dispute Desk will review within 2 hours."
    });
  };

  // Handle Post Reply
  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          lastUpdate: 'Just now',
          messages: [
            ...t.messages,
            {
              sender: 'dropshipper',
              name: currentUser?.fullName || 'You',
              time: 'Just now',
              text: replyText.trim()
            }
          ]
        };
      }
      return t;
    });

    setTickets(updated);
    setSelectedTicket(updated.find(t => t.id === selectedTicket.id));
    setReplyText('');
    toast.success("Reply submitted to support officer.");
  };

  const dropshipperName = currentUser?.fullName || "Verified Dropshipper";

  return (
    <DashboardLayout
      menuItems={DROPSHIPPER_MENU}
      activeTab="support-desk"
      onTabChange={handleTabChange}
      roleName="DROPSHIPPER"
      userName={dropshipperName}
      onLogout={handleLogout}
      pageTitle="Disputes & Support Helpdesk"
      pageSubtitle="Direct resolution desk for courier delays, transit damage, and margin claims"
    >
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full font-['Inter',sans-serif]">
        
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#ffe4ec] via-[#fff0f4] to-[#ffdae3] border border-[#ffb3c6] shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#b7004d]/10 border border-[#b7004d]/20 text-[#b7004d]">
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Priority Partner Resolution Desk</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#4a2135] tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                Dispute & Customer Escalation Desk
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Facing delivery delays from couriers, wrong items shipped by suppliers, or discrepancy in your margin wallet? Raise a claim directly with our partner success team.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setIsNewTicketOpen(true)}
              className="rounded-2xl bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold py-3 px-6 cursor-pointer shadow-lg shadow-[#b7004d]/20 flex items-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Raise Support Ticket</span>
            </Button>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tickets</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">{totalCount}</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[11px] text-gray-500">All registered partner claims</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Active / In Review</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-600 font-['Plus_Jakarta_Sans',sans-serif]">{inReviewCount}</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-[11px] text-gray-500">Awaiting courier or supplier response</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved Claims</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">{resolvedCount}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[11px] text-gray-500">Margins credited & cases closed</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-[#b7004d] uppercase tracking-wider">Avg SLA Resolution</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#b7004d] font-['Plus_Jakarta_Sans',sans-serif]">&lt; 2.4 Hrs</span>
              <ShieldAlert className="w-5 h-5 text-[#b7004d]" />
            </div>
            <span className="text-[11px] text-gray-500">Fast-track response SLA</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticket ID (TCK-...), Order ID, AWB, or subject..."
              className="pl-10 h-10 rounded-xl border-gray-200 text-xs sm:text-sm focus:border-[#b7004d]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#b7004d] text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status === 'ALL' ? 'All Tickets' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-[#b7004d] flex items-center justify-center mx-auto">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">No support tickets found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery ? "No tickets matching your search query." : "You have no active disputes or tickets. All your courier orders and margin settlements are running smoothly."}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-[#b7004d] font-mono">{ticket.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'RESOLVED' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ticket.status === 'IN_REVIEW'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md">
                      {ticket.categoryLabel}
                    </span>
                    {ticket.priority === 'URGENT' && (
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        URGENT SLA
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#b7004d] transition-colors">
                    {ticket.subject}
                  </h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ticket.orderId} • AWB: {ticket.awb}</span>
                    </span>
                    <span>Created: {ticket.createdAt}</span>
                    <span className="text-gray-400">Last activity: {ticket.lastUpdate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span className="text-xs font-bold text-gray-400 group-hover:text-[#b7004d] flex items-center gap-1">
                    <span>View Conversation ({ticket.messages.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ======================================================== */}
        {/* MODAL 1: CREATE NEW TICKET DIALOG */}
        {/* ======================================================== */}
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Raise Partner Support Ticket</h3>
                    <p className="text-xs text-gray-500">Our team directly liaises with couriers & wholesale suppliers</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                
                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Dispute / Issue Category <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium focus:border-[#b7004d] focus:outline-none"
                  >
                    <option value="COURIER_DELAY">Courier In-Transit Stuck &gt; 48h (NDR Escalation)</option>
                    <option value="DAMAGED_ITEM">Customer Received Damaged / Broken Parcel</option>
                    <option value="MARGIN_DISPUTE">Escrow Margin Deduction Discrepancy</option>
                    <option value="SUPPLIER_MISPACK">Wrong Item / Color / Size Shipped by Supplier</option>
                    <option value="RTO_PENALTY">Dispute RTO Freight Liability Charge</option>
                  </select>
                </div>

                {/* Related Order & AWB */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Related Order ID (Optional)
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. ORD-90214"
                      value={newOrderId}
                      onChange={(e) => setNewOrderId(e.target.value)}
                      className="h-10 rounded-xl border-gray-200 text-xs focus:border-[#b7004d]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Courier AWB Number (Optional)
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. DLV-8829104"
                      value={newAwb}
                      onChange={(e) => setNewAwb(e.target.value)}
                      className="h-10 rounded-xl border-gray-200 text-xs focus:border-[#b7004d]"
                    />
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    SLA Priority
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['NORMAL', 'HIGH', 'URGENT'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          newPriority === p
                            ? 'bg-[#b7004d] text-white border-[#b7004d]'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Subject Summary <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Brief 1-line description of the problem..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="h-10 rounded-xl border-gray-200 text-xs focus:border-[#b7004d]"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Detailed Explanation <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    rows={4}
                    placeholder="Please include customer phone, unboxing notes, or courier hub details..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:border-[#b7004d] focus:outline-none resize-none"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="rounded-2xl text-xs font-bold px-5 py-2 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-2xl bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-6 py-2 shadow-md shadow-[#b7004d]/20 cursor-pointer"
                  >
                    Submit Ticket
                  </Button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: TICKET CONVERSATION DRAWER / MODAL */}
        {/* ======================================================== */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#b7004d] font-mono">{selectedTicket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedTicket.status === 'RESOLVED' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedTicket.subject}</h3>
                  <p className="text-[11px] text-gray-500">
                    {selectedTicket.orderId} • AWB: {selectedTicket.awb} • {selectedTicket.categoryLabel}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[380px]">
                {selectedTicket.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl text-xs space-y-1 ${
                      msg.sender === 'dropshipper'
                        ? 'bg-pink-50/70 border border-pink-100 ml-6 text-gray-800'
                        : 'bg-slate-50 border border-slate-200 mr-6 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className={msg.sender === 'dropshipper' ? 'text-[#b7004d]' : 'text-slate-700'}>
                        {msg.name}
                      </span>
                      <span className="text-gray-400 font-normal">{msg.time}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input Bar */}
              <div className="pt-3 border-t border-gray-100 shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply();
                    }}
                    placeholder="Type your reply or additional tracking details..."
                    className="h-11 rounded-2xl border-gray-200 text-xs sm:text-sm focus:border-[#b7004d]"
                  />
                  <Button
                    type="button"
                    onClick={handleSendReply}
                    className="h-11 px-5 rounded-2xl bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
