import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { logout } from '../../redux/userSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DROPSHIPPER_MENU } from './dropshipperMenu';
import { 
  createDropshipperTicketApi, 
  getDropshipperTicketsApi,
  replyDropshipperTicketApi,
  updateDropshipperTicketStatusApi,
  getDropshipperOrdersApi,
  getDropshipperProfileApi,
  isDropshipperAuthenticated
} from '../../services/dropshipperService';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ChevronRight, 
  Send, 
  Building2, 
  Truck, 
  ShieldAlert, 
  FileText, 
  X,
  RefreshCw,
  ArrowLeft,
  Check,
  AlertTriangle,
  BadgeAlert,
  ShieldCheck,
  Paperclip,
  Package,
  Camera,
  UploadCloud,
  ExternalLink,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { value: 'COURIER_DELAY', label: 'Courier In-Transit Stuck > 48h (NDR Escalation)', requiresProof: false },
  { value: 'DAMAGED_ITEM', label: 'Customer Received Damaged / Broken Parcel', requiresProof: true },
  { value: 'MARGIN_DISPUTE', label: 'Escrow Margin Deduction Discrepancy', requiresProof: false },
  { value: 'SUPPLIER_MISPACK', label: 'Wrong Item / Color / Size Shipped by Supplier', requiresProof: true },
  { value: 'RTO_PENALTY', label: 'Dispute RTO Freight Liability Charge', requiresProof: false },
  { value: 'ACCOUNT_KYC', label: 'Account, Bank Payout or KYC Dispute', requiresProof: false }
];

export default function DropshipperSupportDesk() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Effective UID
  const effectiveUid = useMemo(() => {
    if (currentUser?.uid) return currentUser.uid;
    if (currentUser?.id) return currentUser.id;
    try {
      const sess = localStorage.getItem('meesho_dropshipper_session');
      if (sess) {
        const parsed = JSON.parse(sess);
        return parsed.uid || parsed.id;
      }
    } catch (e) {}
    return '2gO99PgXvDM6WwjnUK17PVljT8x1';
  }, [currentUser]);

  // Tickets state (100% database driven, no hardcoded dummy data)
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Orders from database for "Related Order" dropdown
  const [availableOrders, setAvailableOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Filters & Selected Ticket
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // New Ticket Form State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('COURIER_DELAY');
  const [newOrderId, setNewOrderId] = useState('');
  const [newAwb, setNewAwb] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [proofImages, setProofImages] = useState([]); // array of base64 data URLs
  const [unboxingLink, setUnboxingLink] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Lightbox Modal for Full Image Inspection
  const [previewModalImage, setPreviewModalImage] = useState(null);

  // Chat scroll anchor
  const chatBottomRef = useRef(null);

  // 1. Fetch tickets from PostgreSQL on mount / refresh
  const loadTickets = async (showToast = false) => {
    if (!effectiveUid) return;
    try {
      if (showToast) setIsRefreshing(true);
      else setIsLoadingTickets(true);

      const res = await getDropshipperTicketsApi(effectiveUid);
      if (res?.success) {
        setTickets(res.tickets || []);
        if (showToast) toast.success(`Synced ${res.totalCount || 0} tickets from PostgreSQL!`);
      }
    } catch (err) {
      console.error("Failed to load support tickets:", err);
      toast.error("Failed to load tickets from database");
    } finally {
      setIsLoadingTickets(false);
      setIsRefreshing(false);
    }
  };

  // 2. Fetch dropshipper orders from PostgreSQL for the Related Order selector
  const loadOrders = async () => {
    if (!effectiveUid) return;
    try {
      setIsLoadingOrders(true);
      const res = await getDropshipperOrdersApi(effectiveUid);
      if (res?.success && res.orders) {
        setAvailableOrders(res.orders);
      }
    } catch (err) {
      console.warn("Could not fetch orders for ticket linking:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadTickets();
    loadOrders();
  }, [effectiveUid]);

  // Scroll to bottom of chat when new message arrives or ticket opened
  useEffect(() => {
    if (selectedTicket) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages?.length, selectedTicket?.id]);

  // Handle Tab Change
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

  // Handle Logout
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
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (t.id || '').toLowerCase().includes(q);
        const matchOrder = (t.orderId || '').toLowerCase().includes(q);
        const matchAwb = (t.awb || '').toLowerCase().includes(q);
        const matchSub = (t.subject || '').toLowerCase().includes(q);
        const matchCat = (t.categoryLabel || '').toLowerCase().includes(q);
        return matchId || matchOrder || matchAwb || matchSub || matchCat;
      }
      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  // KPI Metrics
  const totalCount = tickets.length;
  const inReviewCount = tickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  // Handle Related Order Dropdown Change
  const handleSelectRelatedOrder = (orderId) => {
    setNewOrderId(orderId);
    if (!orderId) {
      setNewAwb('');
      return;
    }
    const matched = availableOrders.find(o => o.id === orderId);
    if (matched) {
      setNewAwb(matched.awb || '');
      if (!newSubject) {
        setNewSubject(`Issue with Order #${matched.id} (${matched.productName || 'Package'})`);
      }
    }
  };

  // Handle Proof Image File Selection (converts to base64 data url for preview & instant DB storage)
  const handleProofImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file (PNG, JPG, JPEG).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setProofImages(prev => [...prev, loadEvent.target.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveProofImage = (indexToRemove) => {
    setProofImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle Create New Ticket (Direct to PostgreSQL)
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) {
      toast.error("Please provide both a Subject summary and detailed Explanation.");
      return;
    }

    // Proof Validation for Damaged or Supplier Mispack claims
    const isDefectClaim = newCategory === 'DAMAGED_ITEM' || newCategory === 'SUPPLIER_MISPACK';
    if (isDefectClaim && proofImages.length === 0 && !unboxingLink.trim()) {
      toast.error("Proof is required for Damaged/Wrong Item claims!", {
        description: "Please upload at least 1 photo of the item or provide an unboxing video link to prove the supplier defect."
      });
      return;
    }

    const categoryObj = CATEGORY_OPTIONS.find(c => c.value === newCategory);
    const categoryLabel = categoryObj ? categoryObj.label : newCategory;
    const dropshipperName = currentUser?.fullName || currentUser?.storeName || 'Dropshipper Partner';

    try {
      setIsSubmittingTicket(true);
      const res = await createDropshipperTicketApi({
        firebaseUid: effectiveUid,
        subject: newSubject.trim(),
        description: newDescription.trim(),
        category: newCategory,
        categoryLabel,
        priority: newPriority,
        orderId: newOrderId.trim() || undefined,
        awb: newAwb.trim() || undefined,
        dropshipperName,
        attachments: proofImages,
        unboxingLink: unboxingLink.trim() || undefined
      });

      if (res?.success && res.ticket) {
        setTickets(prev => [res.ticket, ...prev]);
        toast.success(`Support Ticket #${res.ticket.id} raised successfully!`, {
          description: proofImages.length > 0 
            ? `Saved with ${proofImages.length} proof photos attached. Supplier claim initiated!`
            : "Saved directly in PostgreSQL database. SLA response within 2 hours."
        });

        // Reset Form & Close Modal
        setNewSubject('');
        setNewDescription('');
        setNewOrderId('');
        setNewAwb('');
        setProofImages([]);
        setUnboxingLink('');
        setNewCategory('COURIER_DELAY');
        setIsNewTicketOpen(false);
      }
    } catch (apiErr) {
      console.error("Failed to raise ticket:", apiErr);
      toast.error(apiErr.response?.data?.message || "Failed to raise support ticket");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Handle Post Reply (Real-time Database Persisted)
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket || isSendingReply) return;

    const dropshipperName = currentUser?.fullName || currentUser?.storeName || 'You';
    const textToSend = replyText.trim();

    try {
      setIsSendingReply(true);
      const res = await replyDropshipperTicketApi(selectedTicket.id, {
        text: textToSend,
        sender: 'dropshipper',
        name: dropshipperName
      });

      if (res?.success) {
        const updatedMessages = res.messages || [
          ...selectedTicket.messages,
          res.newMsg || { sender: 'dropshipper', name: dropshipperName, time: 'Just now', text: textToSend }
        ];

        const updatedTicket = {
          ...selectedTicket,
          status: res.ticketStatus || selectedTicket.status,
          lastUpdate: 'Just now',
          messages: updatedMessages
        };

        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setReplyText('');
        toast.success("Reply submitted to support officer.");
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Handle Mark Ticket Resolved
  const handleMarkResolved = async (ticket) => {
    try {
      const res = await updateDropshipperTicketStatusApi(ticket.id, 'RESOLVED');
      if (res?.success) {
        const updatedTicket = { ...ticket, status: 'RESOLVED' };
        setTickets(prev => prev.map(t => t.id === ticket.id ? updatedTicket : t));
        if (selectedTicket && selectedTicket.id === ticket.id) {
          setSelectedTicket(updatedTicket);
        }
        toast.success(`Ticket #${ticket.id} marked as Resolved!`);
      }
    } catch (err) {
      console.error("Failed to update ticket status:", err);
      toast.error("Failed to update status");
    }
  };

  const dropshipperName = currentUser?.fullName || currentUser?.storeName || "Verified Dropshipper";
  const isCurrentCategoryDefect = newCategory === 'DAMAGED_ITEM' || newCategory === 'SUPPLIER_MISPACK';

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
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full font-sans pb-32 sm:pb-24">
        
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-7 bg-gradient-to-r from-pink-50 via-rose-50/60 to-pink-100/40 border border-pink-200/80 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase bg-[#b7004d]/10 border border-[#b7004d]/20 text-[#b7004d]">
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Priority Partner Resolution Desk</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Dispute & Customer Escalation Desk
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Facing delivery delays from couriers, wrong items shipped by suppliers, or discrepancy in your margin wallet? Raise a claim directly with our partner success team.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => loadTickets(true)}
                disabled={isRefreshing}
                className="rounded-xl border-pink-200 text-slate-700 hover:bg-white text-xs font-semibold py-2.5 px-3 cursor-pointer shrink-0"
                title="Sync from Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#b7004d]' : ''}`} />
              </Button>
              <Button
                type="button"
                onClick={() => setIsNewTicketOpen(true)}
                className="flex-1 md:flex-initial rounded-xl sm:rounded-2xl bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold py-2.5 sm:py-3 px-4 sm:px-6 cursor-pointer shadow-md shadow-[#b7004d]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Raise Support Ticket</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900">{totalCount}</span>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">PostgreSQL synchronized</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 uppercase tracking-wider">Active / In Review</span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-amber-600">{inReviewCount}</span>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">Courier / supplier response</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved Claims</span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-emerald-600">{resolvedCount}</span>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">Margins credited & closed</span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#b7004d] uppercase tracking-wider">Avg Resolution</span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-black text-[#b7004d]">&lt; 2.4h</span>
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-[#b7004d]" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block truncate">Fast-track partner SLA</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticket ID, Order ID, AWB, or subject..."
              className="pl-9 h-9 sm:h-10 rounded-xl border-slate-200 text-xs focus:border-[#b7004d]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Tickets' },
              { id: 'OPEN', label: 'Open' },
              { id: 'IN_PROGRESS', label: 'In Review' },
              { id: 'RESOLVED', label: 'Resolved' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-[#b7004d] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List Area */}
        {isLoadingTickets ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-[#b7004d]" />
            <span className="text-xs font-bold text-slate-700">Connecting to PostgreSQL Support Tickets...</span>
            <p className="text-[11px] text-slate-400">Loading verified claims and dispute chat history.</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200 space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#b7004d] flex items-center justify-center mx-auto text-2xl border border-pink-100 shadow-inner">
              <LifeBuoy className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {searchQuery ? "No matching tickets found" : "No Support Disputes Active"}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery 
                ? "No dispute records match your search filter. Try clearing your search keyword."
                : "You currently have zero active disputes. All your courier orders and margin settlements are running smoothly."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsNewTicketOpen(true)}
                className="mt-2 bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold rounded-xl py-2 px-4 cursor-pointer"
              >
                + Raise Support Ticket
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 group"
              >
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-[#b7004d] font-mono">{ticket.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ticket.status === 'IN_PROGRESS' || ticket.status === 'IN_REVIEW'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {ticket.categoryLabel}
                    </span>
                    {ticket.priority === 'URGENT' && (
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                        URGENT SLA
                      </span>
                    )}
                    {ticket.attachments?.length > 0 && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{ticket.attachments.length} Photo{ticket.attachments.length > 1 ? 's' : ''}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#b7004d] transition-colors line-clamp-2">
                    {ticket.subject}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                    {ticket.orderId && ticket.orderId !== 'General' && (
                      <span className="flex items-center gap-1 font-mono text-slate-700 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                        <Package className="w-3 h-3 text-[#b7004d]" />
                        <span>{ticket.orderId}</span>
                      </span>
                    )}
                    {ticket.awb && ticket.awb !== 'N/A' && (
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>AWB: {ticket.awb}</span>
                      </span>
                    )}
                    <span>Opened: {ticket.createdAt}</span>
                    <span className="text-slate-400">Activity: {ticket.lastUpdate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-[#b7004d] flex items-center gap-1">
                    <span>Conversation ({ticket.messages?.length || 1})</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 1: CREATE NEW TICKET DIALOG (WITH PROOF ATTACHMENT) */}
        {/* ======================================================== */}
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center shrink-0">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Raise Partner Support Ticket</h3>
                    <p className="text-[11px] text-slate-500">Direct courier NDR liaison & supplier margin claim desk</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-3.5">
                
                {/* Category Dropdown */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Dispute / Issue Category <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#b7004d] focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Proof & Evidence Section (Highlighted when Damaged/Wrong Item is selected) */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrentCategoryDefect 
                    ? 'bg-amber-50/70 border-amber-300 shadow-2xs' 
                    : 'bg-slate-50/80 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5 text-[#b7004d]" />
                      <span>Claim Proof & Evidence</span>
                      {isCurrentCategoryDefect ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold uppercase">
                          Required for Supplier Waiver
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold uppercase">
                          Optional
                        </span>
                      )}
                    </Label>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {proofImages.length} attached
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    {isCurrentCategoryDefect
                      ? "Upload photos of damaged packaging or wrong color/size received. This evidence is submitted directly to the wholesale supplier so your escrow margin is credited immediately."
                      : "Attach courier tracking screenshots or customer WhatsApp remarks if helpful."}
                  </p>

                  {/* Image Upload Row & Thumbnails */}
                  <div className="mt-2.5 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-[#b7004d] rounded-xl text-xs font-semibold text-slate-700 hover:text-[#b7004d] transition shadow-2xs">
                        <UploadCloud className="w-3.5 h-3.5 text-[#b7004d]" />
                        <span>+ Upload Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleProofImageUpload}
                          className="hidden"
                        />
                      </label>

                      {/* Thumbnails preview */}
                      {proofImages.map((img, idx) => (
                        <div key={idx} className="relative group w-11 h-11 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0 shadow-2xs">
                          <img src={img} alt="Proof" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveProofImage(idx)}
                            className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold hover:bg-rose-700 cursor-pointer shadow"
                            title="Remove Photo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Video / Drive Link Input */}
                    <div className="pt-1">
                      <Input
                        type="url"
                        placeholder="Or paste Unboxing Video Link (Google Drive / YouTube / Cloud storage)..."
                        value={unboxingLink}
                        onChange={(e) => setUnboxingLink(e.target.value)}
                        className="h-9 rounded-xl border-slate-200 text-xs focus:border-[#b7004d] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Related Order Selector from Database */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Related Order (From DB)
                    </Label>
                    <select
                      value={newOrderId}
                      onChange={(e) => handleSelectRelatedOrder(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#b7004d] focus:outline-none"
                    >
                      <option value="">None / General Inquiry</option>
                      {availableOrders.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.id} - {o.customerName} (₹{o.customerPrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Courier AWB Number
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. DEL-2410856739"
                      value={newAwb}
                      onChange={(e) => setNewAwb(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 text-xs focus:border-[#b7004d] font-mono"
                    />
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
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
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Subject Summary <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Brief 1-line description of the problem..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 text-xs focus:border-[#b7004d]"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Detailed Explanation <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    rows={4}
                    placeholder="Include customer remarks, delivery boy update, or discrepancy calculation..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#b7004d] focus:outline-none resize-none"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="rounded-xl text-xs font-semibold px-4 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="rounded-xl bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-5 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingTicket ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to PostgreSQL...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </Button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: TICKET CONVERSATION DRAWER / FULL-SCREEN MOBILE */}
        {/* ======================================================== */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white sm:rounded-3xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] p-4 sm:p-6 shadow-2xl flex flex-col justify-between animate-in zoom-in-95 duration-200">
              
              {/* Header with Mobile Back Button */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0 gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="sm:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="Back to Tickets"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-black text-[#b7004d] font-mono">{selectedTicket.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{selectedTicket.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-slate-500">
                    {selectedTicket.orderId && selectedTicket.orderId !== 'General' && (
                      <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                        Order: {selectedTicket.orderId}
                      </span>
                    )}
                    {selectedTicket.awb && selectedTicket.awb !== 'N/A' && (
                      <span className="font-mono text-slate-600">
                        AWB: {selectedTicket.awb}
                      </span>
                    )}
                    <span>• {selectedTicket.categoryLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkResolved(selectedTicket)}
                      className="text-[11px] font-semibold rounded-xl text-emerald-700 border-emerald-200 hover:bg-emerald-50 cursor-pointer h-8 px-2.5"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Mark</span> Resolved
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Attached Proof Evidence Banner in Conversation */}
              {(selectedTicket.attachments?.length > 0 || selectedTicket.unboxingLink) && (
                <div className="p-3 my-2 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Supplier Claim Evidence Submitted:</span>
                    </span>
                    {selectedTicket.unboxingLink && (
                      <a
                        href={selectedTicket.unboxingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#b7004d] hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>View Unboxing Video</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {selectedTicket.attachments?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {selectedTicket.attachments.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewModalImage(imgUrl)}
                          className="relative cursor-pointer group w-14 h-14 rounded-xl overflow-hidden border border-amber-200 bg-white shadow-2xs hover:scale-105 transition"
                          title="Click to view full image"
                        >
                          <img src={imgUrl} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 max-h-[50vh] sm:max-h-[360px]">
                {(selectedTicket.messages || []).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs space-y-1 ${
                      msg.sender === 'dropshipper'
                        ? 'bg-pink-50/80 border border-pink-100 ml-4 sm:ml-8 text-slate-800'
                        : 'bg-slate-50 border border-slate-200 mr-4 sm:mr-8 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className={msg.sender === 'dropshipper' ? 'text-[#b7004d]' : 'text-slate-700'}>
                        {msg.name}
                      </span>
                      <span className="text-slate-400 font-normal text-[10px]">{msg.time}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-700">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Reply Input Bar */}
              <div className="pt-3 border-t border-slate-100 shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply();
                    }}
                    placeholder="Type your reply or additional tracking notes..."
                    className="h-10 sm:h-11 rounded-xl sm:rounded-2xl border-slate-200 text-xs focus:border-[#b7004d]"
                    disabled={isSendingReply}
                  />
                  <Button
                    type="button"
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyText.trim()}
                    className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSendingReply ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 3: LIGHTBOX FOR FULL PROOF PHOTO INSPECTION */}
        {previewModalImage && (
          <div 
            onClick={() => setPreviewModalImage(null)}
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          >
            <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
              <button
                onClick={() => setPreviewModalImage(null)}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer z-10"
              >
                ✕
              </button>
              <img src={previewModalImage} alt="Full Proof" className="max-h-[80vh] w-auto rounded-xl object-contain" />
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
