import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { logout } from '../../redux/userSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DROPSHIPPER_MENU } from './dropshipperMenu';
import { 
  pushDropshipperOrderApi, 
  pushBulkDropshipperOrdersApi, 
  getDropshipperOrdersApi,
  updateDropshipperOrderApi,
  cancelDropshipperOrderApi,
  deleteDropshipperOrderApi,
  archiveDropshipperOrderApi
} from '../../services/dropshipperService';
import { getProducts } from '../../services/ecommerceService';
import { 
  Send,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Printer,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  FileText,
  Building2,
  Phone,
  MapPin,
  Barcode,
  Layers,
  Sparkles,
  QrCode,
  Check,
  ChevronRight,
  RefreshCw,
  Copy,
  Plus,
  X,
  SlidersHorizontal,
  Edit3,
  Trash2,
  Ban,
  Archive,
  ArchiveRestore,
  MessageCircle,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function DropshipperOrdersPush() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Derive Dropshipper UID
  let userUid = currentUser?.uid || currentUser?.id || '';
  if (!userUid) {
    try {
      const sessionStr = localStorage.getItem('meesho_dropshipper_session');
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        userUid = parsed.dropshipperId || parsed.uid || '';
      }
    } catch (e) {}
  }
  const effectiveUid = userUid;

  // Active Main View Tab: 'single' | 'bulk' | 'label'
  const [activeTab, setActiveTab] = useState('single');

  // Real Database Catalog Products
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Real Database Orders List (Clean-slate default: [])
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(Boolean(effectiveUid));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPushingSingle, setIsPushingSingle] = useState(false);

  // Search & Filter for Orders Ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ledgerTab, setLedgerTab] = useState('ACTIVE'); // 'ACTIVE' | 'ALL' | 'CANCELLED' | 'ARCHIVED'

  // Modals State: View, Edit, Cancel & Label
  const [viewModalOrder, setViewModalOrder] = useState(null);
  const [editModalOrder, setEditModalOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation via WhatsApp');
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  const [labelModalOrder, setLabelModalOrder] = useState(null);

  // 1. Single Order Form State (Clean Slate: no pre-selected product)
  const [singleOrder, setSingleOrder] = useState({
    customerName: '',
    customerPhone: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    productId: '',
    selectedSku: '',
    productName: '',
    productImage: '',
    qty: 1,
    wholesaleCost: 0,
    shippingFee: 60,
    courier: 'Delhivery Express Air',
    customerPrice: '',
    paymentMode: 'COD', // 'COD' | 'PREPAID'
  });

  // 2. White-Label Branding Settings State
  const [brandSettings, setBrandSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_dropshipper_brand_label');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      storeBrandName: currentUser?.storeName || 'Kunal Retail',
      supportPhone: currentUser?.phone || '+91 90982 96425',
      returnAddress: 'Plot 42, Textile Logistics Park, Surat, Gujarat - 395002',
      customNote: 'Thank you for shopping with us! For easy returns or size exchanges WhatsApp support.',
      showQrCode: true
    };
  });

  // 3. Bulk CSV Upload State
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkFileName, setBulkFileName] = useState('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [isDispatchingBulk, setIsDispatchingBulk] = useState(false);

  // Fetch Real Catalog Products from Database (Loaded in background for picker, but NOT pre-selected)
  const fetchLiveCatalog = async () => {
    setIsCatalogLoading(true);
    try {
      const prods = await getProducts({ limit: 60 });
      if (Array.isArray(prods) && prods.length > 0) {
        setCatalogProducts(prods);
      }
    } catch (err) {
      console.error('Failed to load products from database:', err);
    } finally {
      setIsCatalogLoading(false);
    }
  };

  // Fetch Pushed Orders from Database
  const fetchOrdersFromDb = async (silent = false) => {
    if (!effectiveUid) {
      setOrders([]);
      setIsLoadingOrders(false);
      return;
    }
    if (!silent) setIsLoadingOrders(true);
    else setIsRefreshing(true);

    try {
      const res = await getDropshipperOrdersApi(effectiveUid);
      if (res?.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders from database:', err);
      toast.error('Failed to sync orders with database');
    } finally {
      setIsLoadingOrders(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveCatalog();
    fetchOrdersFromDb();
  }, [effectiveUid]);

  // Select a Catalog Item from Database
  const handleSelectCatalogItem = (prod) => {
    setSelectedProduct(prod);
    const wholesale = Number(prod.price) || 450;
    const suggestedPrice = Math.round(wholesale * 1.35) + singleOrder.shippingFee;
    setSingleOrder((prev) => ({
      ...prev,
      productId: prod.id,
      selectedSku: `SKU-${prod.id.slice(0, 8).toUpperCase()}`,
      productName: prod.title,
      productImage: prod.images?.[0] || '',
      wholesaleCost: wholesale,
      customerPrice: suggestedPrice
    }));
    setIsProductPickerOpen(false);
    toast.info(`Selected: ${prod.title}`, {
      description: `Wholesale cost: ₹${wholesale} • Suggested Customer Price: ₹${suggestedPrice}`
    });
  };

  // Filter Catalog Products for the picker
  const filteredCatalogProducts = useMemo(() => {
    if (!catalogSearch.trim()) return catalogProducts;
    const q = catalogSearch.toLowerCase().trim();
    return catalogProducts.filter(p => 
      p.title?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  }, [catalogProducts, catalogSearch]);

  // Single Order Live Margins
  const totalWholesale = singleOrder.wholesaleCost * singleOrder.qty;
  const totalCustomerCost = Number(singleOrder.customerPrice) || 0;
  const netMargin = Math.max(0, totalCustomerCost - totalWholesale - singleOrder.shippingFee);
  const marginPercent = totalCustomerCost > 0 ? ((netMargin / totalCustomerCost) * 100).toFixed(1) : 0;

  // Submit Single Order to Database
  const handlePushSingleOrder = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !singleOrder.productId) {
      toast.error("Please click 'Browse Catalog' and select a wholesale product first!");
      setIsProductPickerOpen(true);
      return;
    }
    if (!singleOrder.customerName.trim() || !singleOrder.customerPhone.trim() || !singleOrder.address.trim() || !singleOrder.pincode.trim()) {
      toast.error("Please fill all required customer delivery fields!");
      return;
    }
    if (singleOrder.pincode.length !== 6 || isNaN(Number(singleOrder.pincode))) {
      toast.error("Please enter a valid 6-digit Indian PIN code!");
      return;
    }
    if (!singleOrder.customerPrice || Number(singleOrder.customerPrice) < totalWholesale + singleOrder.shippingFee) {
      toast.error("Customer selling price cannot be lower than Wholesale Cost + Shipping!");
      return;
    }

    if (!effectiveUid) {
      toast.error("Dropshipper account session not detected.");
      return;
    }

    setIsPushingSingle(true);
    try {
      const res = await pushDropshipperOrderApi({
        firebaseUid: effectiveUid,
        customerName: singleOrder.customerName,
        customerPhone: singleOrder.customerPhone,
        altPhone: singleOrder.altPhone,
        address: singleOrder.address,
        city: singleOrder.city || 'Mumbai',
        state: singleOrder.state || 'Maharashtra',
        pincode: singleOrder.pincode,
        landmark: singleOrder.landmark,
        productId: singleOrder.productId || selectedProduct?.id,
        productSku: singleOrder.selectedSku,
        productName: singleOrder.productName,
        quantity: Number(singleOrder.qty),
        wholesaleCost: singleOrder.wholesaleCost,
        customerPrice: Number(singleOrder.customerPrice),
        shippingFee: singleOrder.shippingFee,
        courier: singleOrder.courier || 'Delhivery Express Air',
        paymentMode: singleOrder.paymentMode,
        whiteLabelStoreName: brandSettings.storeBrandName
      });

      if (res?.success && res.order) {
        setOrders(prev => [res.order, ...prev]);
        toast.success(`Order #${res.order.id} pushed to Supplier & Database!`, {
          description: `Guaranteed Margin of ₹${res.order.margin} secured in Escrow.`
        });

        // Reset form delivery inputs and clear selected product to maintain clean slate
        setSelectedProduct(null);
        setSingleOrder({
          customerName: '',
          customerPhone: '',
          altPhone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          productId: '',
          selectedSku: '',
          productName: '',
          productImage: '',
          qty: 1,
          wholesaleCost: 0,
          shippingFee: 60,
          courier: 'Delhivery Express Air',
          customerPrice: '',
          paymentMode: 'COD'
        });
      }
    } catch (apiErr) {
      console.error("Order push failed:", apiErr);
      toast.error(apiErr.response?.data?.message || "Failed to push order to database");
    } finally {
      setIsPushingSingle(false);
    }
  };

  // Open Edit Order Modal
  const handleOpenEditModal = (order) => {
    setEditModalOrder(order);
    setEditFormData({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      altPhone: order.altPhone || '',
      address: order.address || '',
      city: order.city || '',
      state: order.state || '',
      pincode: order.pincode || '',
      landmark: order.landmark || '',
      customerPrice: order.customerPrice || '',
      paymentMode: order.paymentMode || 'COD'
    });
  };

  // Save Edited Order Details to Database
  const handleSaveOrderEdit = async (e) => {
    e.preventDefault();
    if (!editModalOrder) return;

    if (!editFormData.customerName.trim() || !editFormData.customerPhone.trim() || !editFormData.address.trim() || !editFormData.pincode.trim()) {
      toast.error("Please fill all required delivery fields!");
      return;
    }

    setIsUpdatingOrder(true);
    try {
      const res = await updateDropshipperOrderApi(editModalOrder.id, editFormData);
      if (res?.success && res.order) {
        setOrders(prev => prev.map(o => o.id === editModalOrder.id ? res.order : o));
        if (viewModalOrder && viewModalOrder.id === editModalOrder.id) {
          setViewModalOrder(res.order);
        }
        toast.success(`Order #${editModalOrder.id} updated in database!`, {
          description: "New customer delivery address and price have been saved."
        });
        setEditModalOrder(null);
      }
    } catch (err) {
      console.error("Failed to update order:", err);
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Open Cancel Order Modal
  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order);
    setCancelReason('Customer requested cancellation via WhatsApp');
  };

  // Confirm Cancellation in Database
  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;

    setIsCancellingOrder(true);
    try {
      const res = await cancelDropshipperOrderApi(cancelModalOrder.id, cancelReason);
      if (res?.success) {
        setOrders(prev => prev.map(o => 
          o.id === cancelModalOrder.id 
            ? { ...o, status: 'CANCELLED', cancellationReason: cancelReason } 
            : o
        ));
        if (viewModalOrder && viewModalOrder.id === cancelModalOrder.id) {
          setViewModalOrder(prev => ({ ...prev, status: 'CANCELLED', cancellationReason: cancelReason }));
        }
        toast.success(`Order #${cancelModalOrder.id} cancelled successfully!`, {
          description: "Supplier dispatch halted and Escrow margin released."
        });
        setCancelModalOrder(null);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancellingOrder(false);
    }
  };

  // Archive or Unarchive Order (Industry Standard Soft Archiving)
  const handleToggleArchiveOrder = async (order, shouldArchive = true) => {
    try {
      const res = await archiveDropshipperOrderApi(order.id, shouldArchive);
      if (res?.success) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, isArchived: shouldArchive } : o));
        if (viewModalOrder && viewModalOrder.id === order.id) {
          setViewModalOrder(prev => ({ ...prev, isArchived: shouldArchive }));
        }
        toast.success(res.message || (shouldArchive ? `Order #${order.id} archived.` : `Order #${order.id} restored.`));
      }
    } catch (err) {
      console.error("Failed to archive/unarchive order:", err);
      toast.error(err.response?.data?.message || "Failed to update order archive status");
    }
  };

  // Permanently Delete Order from Database (Admin / Sandbox fallback)
  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to permanently delete order #${order.id} from database? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await deleteDropshipperOrderApi(order.id);
      if (res?.success) {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        if (viewModalOrder && viewModalOrder.id === order.id) {
          setViewModalOrder(null);
        }
        toast.success(`Order #${order.id} permanently deleted from database.`);
      }
    } catch (err) {
      console.error("Failed to delete order:", err);
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  // Isolated 4x6 Thermal Label Printing (Clean white page, no background or modal shadows)
  const handlePrintThermalLabel = (elementId) => {
    const labelEl = document.getElementById(elementId);
    if (!labelEl) {
      toast.error("Label element not found for printing.");
      return;
    }

    // Capture all stylesheets and fonts from main document
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(tag => tag.outerHTML)
      .join('\n');

    // Create a temporary hidden iframe for print isolation
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal_Shipping_Label_4x6</title>
          <meta charset="utf-8" />
          ${styleTags}
          <style>
            @page {
              size: 4in 6in;
              margin: 4mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: 100% !important;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
            }
            .print-page-center {
              display: flex !important;
              justify-content: center !important;
              align-items: flex-start !important;
              padding: 10px !important;
              background: #ffffff !important;
            }
            .print-label-shell {
              width: 3.75in !important;
              max-width: 100% !important;
              background: #ffffff !important;
              border: 2px dashed #000000 !important;
              padding: 14px !important;
              border-radius: 6px !important;
              margin: 0 auto !important;
            }
          </style>
        </head>
        <body>
          <div class="print-page-center">
            <div class="print-label-shell font-mono">
              ${labelEl.innerHTML}
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger isolated print
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error("Iframe printing failed, falling back to window.print:", err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 350);
  };

  // Download Sample CSV Template
  const handleDownloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Customer_Name,Phone,Address,City,State,Pincode,Product_SKU,Product_Name,Quantity,Wholesale_Cost,Customer_Price,Payment_Mode\n" +
      "Pooja Deshmukh,9823019283,Flat 302 Sunshine Heights MG Road,Pune,Maharashtra,411001,SKU-BAN-01,Banarasi Silk Saree,1,649,1299,COD\n" +
      "Karan Singhania,9811029381,House 14 Sector 18,Noida,Uttar Pradesh,201301,SKU-DNM-09,Men Slim Stretch Jeans,2,960,1998,PREPAID\n" +
      "Meena Kumari,9442019284,B-12 Near Temple Road,Madurai,Tamil Nadu,625001,SKU-ANK-04,Anarkali Kurti Set,1,520,1099,COD\n" +
      "Amit Joshi,9920192834,Bungalow 7 Civil Lines,Jaipur,Rajasthan,302006,SKU-JWL-12,Kundan Choker Set,1,220,599,COD\n" +
      "Rhea Dsouza,9720198273,Sea Breeze Apt Bandra West,Mumbai,Maharashtra,400050,SKU-SNEAK-05,Running Sneakers,1,599,1299,PREPAID";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MShoppy_Dropship_Bulk_Orders_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Standard Bulk Order CSV Template downloaded!");
  };

  // File Upload parser for Bulk CSV
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFileName(file.name);
    setIsProcessingBulk(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV file is empty or missing data rows!");
        setIsProcessingBulk(false);
        return;
      }

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 6) {
          const wholesale = Number(parts[9]) || 500;
          const selling = Number(parts[10]) || 999;
          const qty = Number(parts[8]) || 1;
          const margin = Math.max(0, selling - (wholesale * qty) - 60);
          const pin = parts[5] || '400001';
          const valid = pin.length === 6 && selling > wholesale;

          rows.push({
            id: i,
            name: parts[0] || `Customer ${i}`,
            phone: parts[1] || '9800000000',
            address: parts[2] || 'Customer Address',
            city: parts[3] || 'City',
            state: parts[4] || 'India',
            pin,
            product: parts[7] || parts[6] || 'Catalog Product',
            sku: parts[6] || `SKU-BULK-${i}`,
            qty,
            wholesale: wholesale * qty,
            selling,
            margin,
            mode: (parts[11] || 'COD').toUpperCase(),
            valid
          });
        }
      }
      setBulkRows(rows);
      setIsProcessingBulk(false);
      toast.success(`Parsed ${rows.length} rows from CSV! Review and dispatch below.`);
    };
    reader.readAsText(file);
  };

  // Dispatch All Bulk Orders to Database
  const handleDispatchBulkOrders = async () => {
    const validRows = bulkRows.filter(r => r.valid);
    if (validRows.length === 0) {
      toast.error("No valid orders found to dispatch!");
      return;
    }

    if (!effectiveUid) {
      toast.error("Dropshipper account session not detected.");
      return;
    }

    setIsDispatchingBulk(true);
    try {
      const res = await pushBulkDropshipperOrdersApi({
        firebaseUid: effectiveUid,
        orders: validRows,
        whiteLabelStoreName: brandSettings.storeBrandName
      });

      if (res?.success && res.orders) {
        setOrders(prev => [...res.orders, ...prev]);
        toast.success(`Batch of ${res.totalOrders} orders saved to Database & Dispatched!`, {
          description: `₹${res.totalBatchMargin?.toLocaleString('en-IN')} added to Escrow margin balance.`
        });
        setBulkRows([]);
        setBulkFileName('');
        setActiveTab('single');
      }
    } catch (err) {
      console.error("Bulk dispatch error:", err);
      toast.error(err.response?.data?.message || "Failed to process bulk orders");
    } finally {
      setIsDispatchingBulk(false);
    }
  };

  // Save Brand Label Settings
  const handleSaveBrandSettings = () => {
    try {
      localStorage.setItem('meesho_dropshipper_brand_label', JSON.stringify(brandSettings));
      toast.success("Brand Label & Packaging settings saved!", {
        description: "All upcoming shipping labels and invoices will use this branding."
      });
    } catch (e) {
      toast.error("Failed to save settings.");
    }
  };

  // Sidebar navigation handler
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      localStorage.removeItem('meesho_dropshipper_session');
      toast.success("Successfully logged out from Dropshipper Portal!");
      navigate('/dropshipper-login');
    } catch (e) {
      localStorage.removeItem('meesho_dropshipper_session');
      navigate('/dropshipper-login');
    }
  };

  // Copy helper
  const copyToClipboard = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    }
  };

  // Filtered Orders for Table / Cards
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.awb || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Status dropdown filter
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;

      // Ledger Tab filter
      if (ledgerTab === 'ACTIVE') {
        return !o.isArchived && o.status !== 'CANCELLED';
      }
      if (ledgerTab === 'CANCELLED') {
        return o.status === 'CANCELLED' && !o.isArchived;
      }
      if (ledgerTab === 'ARCHIVED') {
        return !!o.isArchived;
      }
      // 'ALL' shows all non-archived orders
      return !o.isArchived;
    });
  }, [orders, searchQuery, statusFilter, ledgerTab]);

  // Tab Counts for Fast Navigation
  const ledgerCounts = useMemo(() => {
    const total = orders.filter(o => !o.isArchived).length;
    const active = orders.filter(o => !o.isArchived && o.status !== 'CANCELLED').length;
    const cancelled = orders.filter(o => !o.isArchived && o.status === 'CANCELLED').length;
    const archived = orders.filter(o => !!o.isArchived).length;
    return { total, active, cancelled, archived };
  }, [orders]);

  // High Level Metrics
  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter(o => !o.isArchived && o.status !== 'CANCELLED');
  const totalMarginSecured = activeOrders.reduce((sum, o) => sum + (o.margin || 0), 0);
  const totalInTransit = orders.filter(o => !o.isArchived && (o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED')).length;
  const totalDelivered = orders.filter(o => !o.isArchived && o.status === 'DELIVERED').length;

  return (
    <DashboardLayout
      menuItems={DROPSHIPPER_MENU}
      activeTab="orders-push"
      onTabChange={handleTabChange}
      roleName="DROPSHIPPER"
      userName={currentUser?.name || currentUser?.displayName || brandSettings.storeBrandName}
      pageTitle="Push Customer Orders Hub"
      pageSubtitle="Direct supplier dispatch with automated margin escrow and white-label shipping"
      onLogout={handleLogout}
    >
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-32 sm:pb-24 font-sans text-slate-800">

        {/* 1. HERO BANNER & KPI METRICS (FULLY RESPONSIVE) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#b7004d] via-[#92003d] to-[#4a0020] p-4 sm:p-7 text-white shadow-lg">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-0.5 text-[11px] font-semibold text-pink-100 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                Zero-Inventory Fulfillment Gateway
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
                Push Customer Orders Hub
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-pink-100 max-w-2xl leading-relaxed">
                Dispatch orders directly to verified suppliers. Your store brand name is printed on courier thermal labels and packing slips, while your profit margin is instantly secured in Escrow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadCsvTemplate}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-pink-200" />
                <span className="truncate">Sample CSV Template</span>
              </Button>
              <Button
                onClick={() => setActiveTab('label')}
                className="bg-white hover:bg-pink-50 text-[#b7004d] rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#b7004d]" />
                <span className="truncate">Label & Branding</span>
              </Button>
            </div>
          </div>

          {/* 4 Quick Stat Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-5 pt-5 border-t border-white/20 text-white">
            <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] sm:text-xs text-pink-200 font-medium block">Total Pushed</span>
              <strong className="text-lg sm:text-2xl font-black">{totalOrdersCount}</strong>
              <span className="text-[10px] text-pink-300 block truncate">Database Synced</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] sm:text-xs text-pink-200 font-medium block">In-Transit / Dispatched</span>
              <strong className="text-lg sm:text-2xl font-black text-amber-300">{totalInTransit}</strong>
              <span className="text-[10px] text-amber-200 block truncate">Delhivery / 3PL</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] sm:text-xs text-pink-200 font-medium block">Delivered</span>
              <strong className="text-lg sm:text-2xl font-black text-emerald-300">{totalDelivered}</strong>
              <span className="text-[10px] text-emerald-200 block truncate">Margin Eligible</span>
            </div>
            <div className="bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <span className="text-[10px] sm:text-xs text-pink-200 font-medium block">Escrow Margin</span>
              <strong className="text-lg sm:text-2xl font-black text-emerald-400">₹{totalMarginSecured.toLocaleString('en-IN')}</strong>
              <span className="text-[10px] text-emerald-300 block truncate">Active Locked</span>
            </div>
          </div>
        </div>

        {/* 2. TAB CONTROLS (RESPONSIVE NO-WRAP SCROLL ON MOBILE) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'single'
                  ? 'bg-[#b7004d] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Single Order Push</span>
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'bulk'
                  ? 'bg-[#b7004d] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulk CSV Import</span>
              {bulkRows.length > 0 && (
                <span className="bg-pink-100 text-[#b7004d] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                  {bulkRows.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('label')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'label'
                  ? 'bg-[#b7004d] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Label & Branding</span>
            </button>
          </div>

          <button
            onClick={() => fetchOrdersFromDb(true)}
            disabled={isLoadingOrders || isRefreshing}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
            title="Sync Orders from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#b7004d]' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh Orders'}</span>
          </button>
        </div>

        {/* 3. TAB 1: SINGLE CUSTOMER ORDER PUSH ENGINE */}
        {activeTab === 'single' && (
          <form onSubmit={handlePushSingleOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Left 7 Columns: Delivery Address & Customer Information */}
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-[#b7004d] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    Customer Delivery Address
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">Destination shipping address where courier will deliver package</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Customer Full Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={singleOrder.customerName}
                    onChange={(e) => setSingleOrder({ ...singleOrder, customerName: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Phone Number (Calling / OTP) *</Label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. 9823411029"
                    value={singleOrder.customerPhone}
                    onChange={(e) => setSingleOrder({ ...singleOrder, customerPhone: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Flat / House No., Apartment, Street Address *</Label>
                <textarea
                  required
                  rows={2}
                  placeholder="Flat 402, Royal Palms, Near Shani Mandir, MG Road"
                  value={singleOrder.address}
                  onChange={(e) => setSingleOrder({ ...singleOrder, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-[#b7004d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">City / District *</Label>
                  <Input
                    required
                    placeholder="Jaipur"
                    value={singleOrder.city}
                    onChange={(e) => setSingleOrder({ ...singleOrder, city: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">State *</Label>
                  <Input
                    required
                    placeholder="Rajasthan"
                    value={singleOrder.state}
                    onChange={(e) => setSingleOrder({ ...singleOrder, state: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">6-Digit PIN Code *</Label>
                  <Input
                    required
                    maxLength={6}
                    placeholder="302001"
                    value={singleOrder.pincode}
                    onChange={(e) => setSingleOrder({ ...singleOrder, pincode: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Landmark (Optional for Delivery Boy)</Label>
                <Input
                  placeholder="Opposite Central Mall"
                  value={singleOrder.landmark}
                  onChange={(e) => setSingleOrder({ ...singleOrder, landmark: e.target.value })}
                  className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                />
              </div>

              {/* White Label Guarantee notice */}
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#b7004d] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-slate-900">100% White-Label Packing Slip Guarantee:</span>
                  <p className="text-slate-600 mt-0.5">
                    Supplier and Meesho branding are strictly hidden. The package will arrive with 
                    <strong className="text-[#b7004d]"> "{brandSettings.storeBrandName}" </strong> 
                    printed as the primary brand on the thermal courier label.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Product Selection, Pricing & Live Margin */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Product Sourcing Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">Product & Sourcing</h3>
                      <p className="text-[11px] text-slate-500">Live PostgreSQL Catalog Item</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="text-xs font-bold text-[#b7004d] border-pink-200 hover:bg-pink-50 rounded-xl px-2.5 py-1.5 h-auto cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 mr-1" />
                    Browse Catalog
                  </Button>
                </div>

                {/* Selected Product Card (Clean Slate) */}
                {selectedProduct ? (
                  <div className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={singleOrder.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80'}
                        alt={singleOrder.productName}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 line-clamp-2">{singleOrder.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{singleOrder.selectedSku}</div>
                        <div className="text-xs font-semibold text-purple-700 mt-1">
                          Wholesale Base: <strong className="text-slate-900">₹{singleOrder.wholesaleCost}</strong>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsProductPickerOpen(true)}
                      className="text-[#b7004d] hover:bg-pink-100 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsProductPickerOpen(true)}
                    className="p-5 text-center border-2 border-dashed border-pink-200 hover:border-[#b7004d] rounded-2xl bg-pink-50/20 hover:bg-pink-50/40 transition flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-pink-100/70 text-[#b7004d] flex items-center justify-center text-xl group-hover:scale-105 transition">
                      📦
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">No Product Selected</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                        Click here to browse and choose an item from 1,500+ verified items in the live database catalog.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold rounded-xl px-3.5 py-1.5 shadow-xs cursor-pointer mt-0.5"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" />
                      Browse Catalog
                    </Button>
                  </div>
                )}

                {/* Quantity & Courier Shipping Mode (Fully Editable & Configurable) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Quantity</Label>
                    <div className="flex items-center mt-1">
                      <button
                        type="button"
                        onClick={() => setSingleOrder(prev => ({ ...prev, qty: Math.max(1, Number(prev.qty || 1) - 1) }))}
                        className="w-9 h-9 rounded-l-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 cursor-pointer select-none transition"
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={singleOrder.qty}
                        onChange={(e) => setSingleOrder(prev => ({ ...prev, qty: Math.max(1, Number(e.target.value) || 1) }))}
                        className="h-9 w-full min-w-0 border-y border-x-0 border-slate-200 text-center text-xs sm:text-sm font-black text-slate-900 focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setSingleOrder(prev => ({ ...prev, qty: Math.min(100, Number(prev.qty || 1) + 1) }))}
                        className="w-9 h-9 rounded-r-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 cursor-pointer select-none transition"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Shipping Mode & Courier Partner</Label>
                    <select
                      value={`${singleOrder.courier || 'Delhivery Express Air'}|${singleOrder.shippingFee}`}
                      onChange={(e) => {
                        const [name, fee] = e.target.value.split('|');
                        setSingleOrder(prev => ({
                          ...prev,
                          courier: name,
                          shippingFee: Number(fee)
                        }));
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 focus:border-[#b7004d] focus:outline-none h-9 cursor-pointer"
                    >
                      <option value="Delhivery Express Air|60">Delhivery Air Express — ₹60</option>
                      <option value="Shadowfax Surface Economy|40">Shadowfax Surface — ₹40</option>
                      <option value="BlueDart Priority Air|85">BlueDart Priority Air — ₹85</option>
                      <option value="Free Shipping Promotion|0">Free Shipping Promotion — ₹0</option>
                    </select>
                  </div>
                </div>

                {/* Selling Price Input */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700">Customer Selling Price (₹) *</Label>
                    <span className="text-[11px] text-slate-500">
                      {selectedProduct ? `Base Cost: ₹${totalWholesale}` : 'Select product first'}
                    </span>
                  </div>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <Input
                      required
                      type="number"
                      disabled={!selectedProduct}
                      placeholder={selectedProduct ? `Min ₹${totalWholesale + singleOrder.shippingFee}` : 'Select a product above first'}
                      min={selectedProduct ? totalWholesale + singleOrder.shippingFee : 0}
                      value={singleOrder.customerPrice}
                      onChange={(e) => setSingleOrder({ ...singleOrder, customerPrice: Number(e.target.value) })}
                      className="pl-8 rounded-xl border-slate-200 focus:border-[#b7004d] font-black text-sm sm:text-base text-slate-900 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Customer Payment Collection Mode</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <button
                      type="button"
                      disabled={!selectedProduct}
                      onClick={() => setSingleOrder({ ...singleOrder, paymentMode: 'COD' })}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 ${
                        singleOrder.paymentMode === 'COD'
                          ? 'border-[#b7004d] bg-pink-50/60 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                        {singleOrder.paymentMode === 'COD' && <Check className="w-3.5 h-3.5 text-[#b7004d]" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {singleOrder.customerPrice ? `Collect ₹${singleOrder.customerPrice}` : 'Cash on courier delivery'}
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={!selectedProduct}
                      onClick={() => setSingleOrder({ ...singleOrder, paymentMode: 'PREPAID' })}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 ${
                        singleOrder.paymentMode === 'PREPAID'
                          ? 'border-[#b7004d] bg-pink-50/60 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Prepaid Order</span>
                        {singleOrder.paymentMode === 'PREPAID' && <Check className="w-3.5 h-3.5 text-[#b7004d]" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Store / UPI Paid</p>
                    </button>
                  </div>
                </div>

                {/* Live Margin Calculation Card */}
                {selectedProduct && singleOrder.customerPrice > 0 ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Customer Invoiced Total:</span>
                      <span className="font-semibold text-slate-900">₹{totalCustomerCost}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Supplier Wholesale Cost ({singleOrder.qty}x):</span>
                      <span className="font-semibold text-rose-600">-₹{totalWholesale}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Packaging & Courier Fee:</span>
                      <span className="font-semibold text-rose-600">-₹{singleOrder.shippingFee}</span>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-900">Guaranteed Margin in Escrow:</span>
                        <div className="text-[10px] text-emerald-700">Margin rate: {marginPercent}%</div>
                      </div>
                      <div className="text-lg sm:text-xl font-black text-emerald-800">
                        +₹{netMargin.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    <span className="block font-semibold text-slate-700">Live Profit Margin Simulator</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Select a product from the database catalog above to view your real-time net margin.
                    </span>
                  </div>
                )}

                {/* Submit Push Button */}
                <Button
                  type="submit"
                  disabled={isPushingSingle}
                  className="w-full bg-[#b7004d] hover:bg-[#92003d] text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isPushingSingle ? 'Dispatching to Supplier...' : 'Push Order to Supplier for Dispatch'}</span>
                </Button>
              </div>
            </div>

          </form>
        )}

        {/* 4. TAB 2: BULK CSV UPLOAD ENGINE */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Bulk Customer Orders Import & Dispatch
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a CSV or Excel file containing orders exported from Shopify, WooCommerce, or your WhatsApp/Instagram CRM.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadCsvTemplate}
                className="border-slate-200 hover:bg-pink-50 hover:text-[#b7004d] text-xs font-semibold rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#b7004d]" />
                <span>Download Sample CSV</span>
              </Button>
            </div>

            {/* Upload Drop Zone */}
            <div className="border-2 border-dashed border-pink-200 hover:border-[#b7004d] rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center transition bg-pink-50/20">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-[#b7004d] mb-2.5">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {bulkFileName ? bulkFileName : "Drag and drop your Orders CSV file here"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Files formatted with Customer Name, Phone, Address, City, State, Pincode, Product SKU, Wholesale Cost, and Customer Selling Price are supported.
              </p>
              <div className="mt-4">
                <label className="inline-flex items-center gap-2 bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow-sm transition">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Browse CSV File</span>
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Parsed Staging Table / Dispatch Controls */}
            {bulkRows.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
                    <span>Parsed: <strong className="text-slate-900">{bulkRows.length}</strong></span>
                    <span>Valid: <strong className="text-emerald-700">{bulkRows.filter(r => r.valid).length}</strong></span>
                    <span>Batch Margin: <strong className="text-[#b7004d]">₹{bulkRows.reduce((acc, r) => acc + r.margin, 0).toLocaleString('en-IN')}</strong></span>
                  </div>

                  <Button
                    onClick={handleDispatchBulkOrders}
                    disabled={isDispatchingBulk}
                    className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isDispatchingBulk ? 'Dispatching...' : `Dispatch Valid Orders (${bulkRows.filter(r => r.valid).length})`}</span>
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Phone & City</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3 text-right">Wholesale</th>
                        <th className="py-2.5 px-3 text-right">Selling</th>
                        <th className="py-2.5 px-3 text-right">Margin</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkRows.map((r, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                          <td className="py-2.5 px-3">
                            <div>{r.phone}</div>
                            <span className="text-[10px] text-slate-400">{r.city} ({r.pin})</span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate font-medium text-slate-800">{r.product}</td>
                          <td className="py-2.5 px-3 text-right font-medium">₹{r.wholesale}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{r.selling}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700">+₹{r.margin}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.mode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {r.mode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {r.valid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                Invalid PIN
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. TAB 3: WHITE-LABEL SHIPPING LABEL & PACKAGING CUSTOMIZER */}
        {activeTab === 'label' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Left 5 Columns: Brand Configuration */}
            <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-[#b7004d] shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Brand Label Customizer
                  </h3>
                  <p className="text-[11px] text-slate-500">How your store appears to buyers on packaging</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Store Brand Name *</Label>
                <Input
                  value={brandSettings.storeBrandName}
                  onChange={(e) => setBrandSettings({ ...brandSettings, storeBrandName: e.target.value })}
                  className="mt-1 rounded-xl text-xs sm:text-sm font-semibold border-slate-200"
                />
                <p className="text-[10px] text-slate-400 mt-1">Printed prominently as 'Shipped By' on the courier thermal label.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Customer Support Phone / WhatsApp *</Label>
                <Input
                  value={brandSettings.supportPhone}
                  onChange={(e) => setBrandSettings({ ...brandSettings, supportPhone: e.target.value })}
                  className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Return Address (RTO Warehouse) *</Label>
                <textarea
                  rows={2}
                  value={brandSettings.returnAddress}
                  onChange={(e) => setBrandSettings({ ...brandSettings, returnAddress: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-[#b7004d] focus:outline-none"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Custom Thank You / Return Policy Note</Label>
                <textarea
                  rows={2}
                  value={brandSettings.customNote}
                  onChange={(e) => setBrandSettings({ ...brandSettings, customNote: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-[#b7004d] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Print Support QR Code on Packing Slip</span>
                <input
                  type="checkbox"
                  checked={brandSettings.showQrCode}
                  onChange={(e) => setBrandSettings({ ...brandSettings, showQrCode: e.target.checked })}
                  className="h-4 w-4 rounded text-[#b7004d] accent-[#b7004d]"
                />
              </div>

              <Button
                onClick={handleSaveBrandSettings}
                className="w-full bg-[#b7004d] hover:bg-[#92003d] text-white font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Save Brand Label Defaults
              </Button>
            </div>

            {/* Right 7 Columns: Real-time 4x6 Thermal Label & Slip Simulator */}
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Live 4x6 Thermal Shipping Label Simulation
                  </h3>
                  <p className="text-[11px] text-slate-500">Direct courier print preview (Delhivery / BlueDart compatible)</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePrintThermalLabel('thermal-label-simulation')}
                  className="border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-100"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print (PDF)</span>
                </Button>
              </div>

              {/* Thermal Label Box */}
              <div 
                id="thermal-label-simulation"
                className="mx-auto max-w-sm sm:max-w-md border-2 border-dashed border-slate-400 p-4 bg-white text-black font-mono shadow-sm rounded-lg text-xs space-y-3.5"
              >
                
                {/* Header Courier Bar */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div>
                    <span className="text-sm sm:text-base font-black tracking-wider">DELHIVERY AIR</span>
                    <div className="text-[9px] sm:text-[10px] font-sans font-semibold text-slate-600">Standard Surface & Airway</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-black text-white px-2 py-0.5 text-xs font-black">
                      COD ₹{singleOrder.customerPrice || '999'}
                    </span>
                    <div className="text-[9px] mt-0.5 font-bold">ROUTING: DEL / JAI-01</div>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="text-center py-2 bg-slate-50 rounded">
                  <div className="inline-flex h-10 w-56 sm:w-64 justify-between items-stretch px-4">
                    {[1,3,1,2,4,1,2,3,1,4,2,1,3,2,1,2,4,1,3,2,1,3,4,1,2].map((w, i) => (
                      <div key={i} className="bg-black" style={{ width: `${w * 2}px` }} />
                    ))}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold tracking-widest mt-1">AWB: DEL-8923019283</div>
                </div>

                {/* Ship To & Return Address Grid */}
                <div className="grid grid-cols-2 gap-2 border-t-2 border-b-2 border-black py-2">
                  <div className="pr-1.5 border-r border-slate-300">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">SHIP TO:</span>
                    <div className="font-bold text-[11px] sm:text-xs mt-0.5">{singleOrder.customerName || 'Radhika Sharma'}</div>
                    <div className="text-[9px] sm:text-[10px] leading-tight text-slate-700 mt-0.5 break-words">
                      {singleOrder.address || 'Flat 402, Royal Palms, Near Shani Mandir, MG Road'}, {singleOrder.city || 'Jaipur'}, {singleOrder.pincode || '302001'}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold mt-1">TEL: {singleOrder.customerPhone || '+91 98234 11029'}</div>
                  </div>

                  <div className="pl-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">SHIPPED BY:</span>
                    <div className="font-black text-[11px] sm:text-xs text-[#b7004d] mt-0.5 uppercase">
                      {brandSettings.storeBrandName}
                    </div>
                    <div className="text-[9px] sm:text-[10px] leading-tight text-slate-700 mt-0.5 break-words">
                      {brandSettings.returnAddress}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold mt-1">SUPPORT: {brandSettings.supportPhone}</div>
                  </div>
                </div>

                {/* Tear-off Packing Slip */}
                <div className="pt-1 text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 border-b border-dashed border-slate-300 pb-1">
                    <span>CUSTOMER PACKING SLIP</span>
                    <span>ORDER #DSP-PREVIEW</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-[10px] sm:text-[11px]">
                    <span className="truncate max-w-[200px]">{singleOrder.qty}x {singleOrder.productName || 'Sourced Item'}</span>
                    <span>₹{singleOrder.customerPrice || '999'}.00</span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>Standard Express Shipping:</span>
                    <span>FREE</span>
                  </div>

                  <div className="flex justify-between font-black text-xs border-t border-black pt-1">
                    <span>TOTAL AMOUNT COLLECTABLE:</span>
                    <span>₹{singleOrder.customerPrice || '999'}.00</span>
                  </div>

                  <p className="text-[9px] text-slate-500 italic pt-0.5">
                    "{brandSettings.customNote}"
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 6. BOTTOM SECTION: DISPATCHED ORDERS LEDGER (WITH VIEW, EDIT, CANCEL & DELETE) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#b7004d] shrink-0" />
                <span>Pushed Orders & Courier Status Ledger</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Real-time fulfillment tracking, live order modifications, thermal labels & cancellations.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Box */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <Input
                  placeholder="Search customer, ID, city, AWB..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs rounded-xl border-slate-200 h-8 sm:h-9 w-full sm:w-56"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Fast Navigation Tabs (Active, All, Cancelled, Archived) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setLedgerTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                ledgerTab === 'ACTIVE' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Active Orders</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
                {ledgerCounts.active}
              </span>
            </button>
            <button
              onClick={() => setLedgerTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                ledgerTab === 'ALL' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Orders</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-extrabold">
                {ledgerCounts.total}
              </span>
            </button>
            <button
              onClick={() => setLedgerTab('CANCELLED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                ledgerTab === 'CANCELLED' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Cancelled</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
                {ledgerCounts.cancelled}
              </span>
            </button>
            <button
              onClick={() => setLedgerTab('ARCHIVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                ledgerTab === 'ARCHIVED' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3 h-3 text-slate-500" />
              <span>Archived</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-extrabold">
                {ledgerCounts.archived}
              </span>
            </button>
          </div>

          {/* Body Content */}
          {isLoadingOrders ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-7 h-7 animate-spin text-[#b7004d]" />
              <span className="text-xs font-bold text-slate-700">Connecting to PostgreSQL Order Records...</span>
              <p className="text-[11px] text-slate-400">Loading verified customer dispatches and courier AWBs.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Clean Slate Empty State - Centered Responsive Container */
            <div className="py-10 sm:py-14 px-4 text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto bg-pink-50 text-[#b7004d] rounded-2xl flex items-center justify-center text-3xl mb-3 border border-pink-100 shadow-inner">
                📦
              </div>
              <h4 className="text-base font-bold text-slate-900">No Dispatched Orders Found</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No orders matched your current search filters. Try clearing the search or status filter.'
                  : 'You have not pushed any customer orders yet. Use the single order form above or upload a bulk CSV to dispatch directly from suppliers.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setActiveTab('single');
                  }}
                  className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Push Single Order
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadCsvTemplate}
                  className="border-slate-200 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Download CSV Template
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (>= 768px) */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Item & Qty</th>
                      <th className="py-3 px-4 text-right">Wholesale</th>
                      <th className="py-3 px-4 text-right">Customer Price</th>
                      <th className="py-3 px-4 text-right">Escrow Margin</th>
                      <th className="py-3 px-4">Courier / AWB</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900 font-mono">{order.id}</div>
                          <span className="text-[10px] text-slate-400">{order.date}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{order.customerName}</div>
                          <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                          <span className="text-[10px] text-slate-400">{order.city}, {order.pincode}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={order.productImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                            />
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800 truncate">{order.productName}</div>
                              <span className="text-[10px] text-slate-400">Qty: {order.qty} • {order.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          ₹{order.wholesaleCost}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₹{order.customerPrice}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-black px-2 py-0.5 rounded-md border ${
                            order.status === 'CANCELLED'
                              ? 'text-slate-400 bg-slate-50 border-slate-200 line-through'
                              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}>
                            +₹{order.margin}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{order.courier}</div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-[10px] text-slate-500">{order.awb}</span>
                            <button
                              onClick={() => copyToClipboard(order.awb, 'AWB')}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Copy AWB"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'IN_TRANSIT'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-pink-100 text-[#b7004d]'
                          }`}>
                            {order.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                            {order.status === 'IN_TRANSIT' && <Truck className="w-3 h-3" />}
                            {order.status === 'DISPATCHED' && <Clock className="w-3 h-3" />}
                            {order.status === 'CANCELLED' && <Ban className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewModalOrder(order)}
                              className="text-slate-700 hover:bg-slate-100 text-xs font-semibold h-7 px-2 rounded-lg cursor-pointer"
                              title="View Order Details & Journey"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>

                            {/* Edit Button (Enabled only if active) */}
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditModal(order)}
                                className="text-blue-600 hover:bg-blue-50 text-xs font-semibold h-7 px-2 rounded-lg cursor-pointer"
                                title="Edit Customer Delivery Address"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {/* Label Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLabelModalOrder(order)}
                              className="text-[#b7004d] hover:bg-pink-50 text-xs font-semibold h-7 px-2 rounded-lg cursor-pointer"
                              title="Print Thermal Shipping Label"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>

                            {/* Cancel Button */}
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenCancelModal(order)}
                                className="text-amber-600 hover:bg-amber-50 text-xs font-semibold h-7 px-2 rounded-lg cursor-pointer"
                                title="Cancel Order"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {/* Archive / Unarchive Button for Cancelled or Delivered orders */}
                            {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleArchiveOrder(order, !order.isArchived)}
                                className="text-slate-500 hover:bg-slate-100 text-xs font-semibold h-7 px-2 rounded-lg cursor-pointer"
                                title={order.isArchived ? "Restore to Active List" : "Archive Order (Hide from active list)"}
                              >
                                {order.isArchived ? (
                                  <ArchiveRestore className="w-3.5 h-3.5 text-blue-600" />
                                ) : (
                                  <Archive className="w-3.5 h-3.5 text-slate-500" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW (< 768px) - 100% TOUCH OPTIMIZED */}
              <div className="md:hidden space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
                    {/* Top: Order ID + Date + Status */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                      <div>
                        <div className="font-black text-xs text-slate-900 font-mono">{order.id}</div>
                        <div className="text-[10px] text-slate-400">{order.date}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-pink-100 text-[#b7004d]'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Middle: Product Thumbnail + Title */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={order.productImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-800 truncate">{order.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {order.sku} • Qty: {order.qty}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          Mode: <span className="font-bold">{order.paymentMode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Courier Details */}
                    <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{order.customerName}</span>
                        <span className="text-[11px] text-slate-500">{order.customerPhone}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {order.address || order.city}, {order.pincode}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-600">
                        <span>{order.courier}</span>
                        <span className="font-mono">{order.awb}</span>
                      </div>
                    </div>

                    {/* Financials Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-200/70">
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Wholesale</span>
                        <strong className="text-slate-700 font-bold">₹{order.wholesaleCost}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Customer</span>
                        <strong className="text-slate-900 font-bold">₹{order.customerPrice}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block">Margin</span>
                        <strong className={`font-bold ${order.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-emerald-700'}`}>
                          +₹{order.margin}
                        </strong>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        onClick={() => setViewModalOrder(order)}
                        variant="outline"
                        className="text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-100 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#b7004d]" />
                        <span>View Details</span>
                      </Button>

                      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
                        <Button
                          onClick={() => handleOpenEditModal(order)}
                          variant="outline"
                          className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Address</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setLabelModalOrder(order)}
                          variant="outline"
                          className="text-xs font-bold text-[#b7004d] border-pink-200 hover:bg-pink-50 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Thermal Label</span>
                        </Button>
                      )}
                    </div>

                    {/* Secondary Row for Cancelled / Delivered: Archive or Restore */}
                    {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
                      <Button
                        onClick={() => handleToggleArchiveOrder(order, !order.isArchived)}
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl py-1 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                      >
                        {order.isArchived ? (
                          <>
                            <ArchiveRestore className="w-3.5 h-3.5 text-blue-600" />
                            <span>Restore to Active Orders</span>
                          </>
                        ) : (
                          <>
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archive Order (Hide from list)</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* MODAL 1: VIEW FULL ORDER DETAILS & 5-STAGE JOURNEY */}
      {viewModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base font-mono">
                    {viewModalOrder.id}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    viewModalOrder.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : viewModalOrder.status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-pink-100 text-[#b7004d]'
                  }`}>
                    {viewModalOrder.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Pushed on {viewModalOrder.date}</p>
              </div>

              <button
                onClick={() => setViewModalOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Customer Contact & Delivery Info */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Recipient</span>
                  <strong className="text-sm text-slate-900 font-bold">{viewModalOrder.customerName}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/91${viewModalOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${viewModalOrder.customerPhone}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-200 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed pt-1 border-t border-slate-200/70">
                <div className="font-mono text-[11px] text-slate-600">TEL: {viewModalOrder.customerPhone} {viewModalOrder.altPhone ? `(Alt: ${viewModalOrder.altPhone})` : ''}</div>
                <div className="mt-0.5">{viewModalOrder.address || viewModalOrder.city}</div>
                <div className="font-semibold text-slate-800">{viewModalOrder.city}, {viewModalOrder.state} - {viewModalOrder.pincode}</div>
                {viewModalOrder.landmark && (
                  <div className="text-[11px] text-slate-500 mt-0.5">Landmark: {viewModalOrder.landmark}</div>
                )}
              </div>
            </div>

            {/* Product Sourced Breakdown */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200">
              <img
                src={viewModalOrder.productImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80'}
                alt=""
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
              />
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-bold text-slate-900 line-clamp-2">{viewModalOrder.productName}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {viewModalOrder.sku} • Qty: {viewModalOrder.qty}</div>
                <div className="text-[11px] font-semibold text-purple-700 mt-1">
                  Payment Collection: <span className="font-bold text-slate-900">{viewModalOrder.paymentMode}</span>
                </div>
              </div>
            </div>

            {/* Logistics & Delhivery Tracking Timeline */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#b7004d]" />
                  <span>{viewModalOrder.courier}</span>
                </span>
                <span className="font-mono text-slate-600 font-semibold">{viewModalOrder.awb}</span>
              </div>

              {/* 5-Stage Live Journey Indicator */}
              <div className="grid grid-cols-5 gap-1 text-center pt-2">
                {[
                  { label: 'Manifested', done: true },
                  { label: 'Dispatched', done: viewModalOrder.status !== 'ORDERED' },
                  { label: 'In-Transit', done: viewModalOrder.status === 'IN_TRANSIT' || viewModalOrder.status === 'DELIVERED' },
                  { label: 'Out for Delivery', done: viewModalOrder.status === 'DELIVERED' },
                  { label: viewModalOrder.status === 'CANCELLED' ? 'Cancelled' : 'Delivered', done: viewModalOrder.status === 'DELIVERED' || viewModalOrder.status === 'CANCELLED' }
                ].map((step, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className={`h-1.5 rounded-full ${step.done ? (viewModalOrder.status === 'CANCELLED' && idx === 4 ? 'bg-rose-500' : 'bg-[#b7004d]') : 'bg-slate-200'}`} />
                    <span className="text-[9px] font-bold text-slate-500 block leading-tight">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Customer Invoiced Total:</span>
                <strong className="text-slate-900">₹{viewModalOrder.customerPrice}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Wholesale Base ({viewModalOrder.qty}x):</span>
                <strong className="text-rose-600">-₹{viewModalOrder.wholesaleCost}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Courier & Packaging:</span>
                <strong className="text-rose-600">-₹{viewModalOrder.shippingFee}</strong>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-emerald-200 font-black text-sm text-emerald-900">
                <span>Net Margin in Escrow:</span>
                <span className="text-base text-emerald-700">+₹{viewModalOrder.margin}</span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {viewModalOrder.status !== 'CANCELLED' && viewModalOrder.status !== 'DELIVERED' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleOpenEditModal(viewModalOrder);
                      setViewModalOrder(null);
                    }}
                    className="text-xs font-semibold rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    <span>Edit Delivery Address</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      handleOpenCancelModal(viewModalOrder);
                      setViewModalOrder(null);
                    }}
                    className="text-xs font-semibold rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5 mr-1" />
                    <span>Cancel Order</span>
                  </Button>
                </>
              )}

              {(viewModalOrder.status === 'CANCELLED' || viewModalOrder.status === 'DELIVERED') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleToggleArchiveOrder(viewModalOrder, !viewModalOrder.isArchived);
                  }}
                  className="text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {viewModalOrder.isArchived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      <span>Restore to Active</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 mr-1" />
                      <span>Archive Order</span>
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => {
                  setLabelModalOrder(viewModalOrder);
                  setViewModalOrder(null);
                }}
                className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                <span>Thermal Label</span>
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ORDER DETAILS */}
      {editModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Edit Order Details: {editModalOrder.id}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Modify delivery destination before courier dispatch</p>
              </div>
              <button
                onClick={() => setEditModalOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrderEdit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Customer Name *</Label>
                  <Input
                    required
                    value={editFormData.customerName}
                    onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Customer Phone *</Label>
                  <Input
                    required
                    value={editFormData.customerPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Flat / House No. & Street Address *</Label>
                <textarea
                  required
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-[#b7004d] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">City *</Label>
                  <Input
                    required
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">State *</Label>
                  <Input
                    required
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">6-Digit PIN *</Label>
                  <Input
                    required
                    maxLength={6}
                    value={editFormData.pincode}
                    onChange={(e) => setEditFormData({ ...editFormData, pincode: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Landmark</Label>
                  <Input
                    value={editFormData.landmark}
                    onChange={(e) => setEditFormData({ ...editFormData, landmark: e.target.value })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Customer Selling Price (₹)</Label>
                  <Input
                    type="number"
                    value={editFormData.customerPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, customerPrice: Number(e.target.value) })}
                    className="mt-1 rounded-xl text-xs sm:text-sm border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOrder(null)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60"
                >
                  {isUpdatingOrder ? 'Saving Changes...' : 'Save Order Changes'}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL ORDER CONFIRMATION */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Cancel Order #{cancelModalOrder.id}?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cancelling will halt supplier packaging and release the <strong>+₹{cancelModalOrder.margin}</strong> margin lock from your Escrow balance.
                </p>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Cancellation Reason *</Label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
              >
                <option value="Customer requested cancellation via WhatsApp">Customer requested cancellation via WhatsApp</option>
                <option value="Customer refused delivery or uncontactable">Customer refused delivery or uncontactable</option>
                <option value="Wrong delivery address provided">Wrong delivery address provided</option>
                <option value="Duplicate order created by mistake">Duplicate order created by mistake</option>
                <option value="Testing / Trial order cancellation">Testing / Trial order cancellation</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setCancelModalOrder(null)}
                className="text-xs font-semibold rounded-xl"
              >
                Keep Order
              </Button>
              <Button
                onClick={handleConfirmCancelOrder}
                disabled={isCancellingOrder}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60"
              >
                {isCancellingOrder ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: PRODUCT CATALOG PICKER MODAL */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#b7004d]" />
                  <span>Select Wholesale Catalog Item</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Choose from real verified products in PostgreSQL catalog</p>
              </div>
              <button
                onClick={() => setIsProductPickerOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <Input
                placeholder="Search products by title or category..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="pl-8 text-xs rounded-xl border-slate-200"
              />
            </div>

            {/* Products List (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {filteredCatalogProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching products found in database catalog.
                </div>
              ) : (
                filteredCatalogProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectCatalogItem(p)}
                    className="pt-2 pb-2 flex items-center gap-3 hover:bg-pink-50/50 p-2 rounded-xl cursor-pointer transition"
                  >
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-500 font-medium">Category: {p.category?.name || 'General'}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="font-bold text-purple-700">Wholesale: ₹{p.price}</span>
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Suggested Retail: ₹{Math.round(p.price * 1.35) + singleOrder.shippingFee}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-3 py-1 rounded-lg shrink-0 cursor-pointer"
                    >
                      Select
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ORDER WHITE-LABEL THERMAL SHIPPING LABEL PREVIEW */}
      {labelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-[#b7004d]" />
                  <span>Shipping Label: {labelModalOrder.id}</span>
                </h3>
                <span className="text-[10px] text-slate-500">AWB: {labelModalOrder.awb}</span>
              </div>
              <button
                onClick={() => setLabelModalOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Thermal Label Preview Card */}
            <div 
              id="thermal-label-modal"
              className="border-2 border-dashed border-slate-400 p-4 bg-white text-black font-mono shadow-sm rounded-lg text-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div>
                  <span className="text-sm font-black tracking-wider">{labelModalOrder.courier || 'DELHIVERY AIR'}</span>
                  <div className="text-[9px] font-sans font-semibold text-slate-600">Standard Surface & Airway</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-black text-white px-2 py-0.5 text-xs font-black">
                    {labelModalOrder.paymentMode} ₹{labelModalOrder.customerPrice}
                  </span>
                  <div className="text-[9px] mt-0.5 font-bold">ROUTING: DEL / EXP</div>
                </div>
              </div>

              {/* Barcode */}
              <div className="text-center py-2 bg-slate-50 rounded">
                <div className="inline-flex h-10 w-52 sm:w-60 justify-between items-stretch px-4">
                  {[1,3,1,2,4,1,2,3,1,4,2,1,3,2,1,2,4,1,3,2,1,3,4,1,2].map((w, i) => (
                    <div key={i} className="bg-black" style={{ width: `${w * 2}px` }} />
                  ))}
                </div>
                <div className="text-[10px] font-bold tracking-widest mt-1">AWB: {labelModalOrder.awb}</div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-2 border-t-2 border-b-2 border-black py-2">
                <div className="pr-1.5 border-r border-slate-300">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">SHIP TO:</span>
                  <div className="font-bold text-[11px] mt-0.5">{labelModalOrder.customerName}</div>
                  <div className="text-[9px] leading-tight text-slate-700 mt-0.5 break-words">
                    {labelModalOrder.address || labelModalOrder.city}, {labelModalOrder.city}, {labelModalOrder.pincode}
                  </div>
                  <div className="text-[9px] font-bold mt-1">TEL: {labelModalOrder.customerPhone}</div>
                </div>

                <div className="pl-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">SHIPPED BY:</span>
                  <div className="font-black text-[11px] text-[#b7004d] mt-0.5 uppercase">
                    {brandSettings.storeBrandName}
                  </div>
                  <div className="text-[9px] leading-tight text-slate-700 mt-0.5 break-words">
                    {brandSettings.returnAddress}
                  </div>
                  <div className="text-[9px] font-bold mt-1">SUPPORT: {brandSettings.supportPhone}</div>
                </div>
              </div>

              {/* Packing Slip */}
              <div className="pt-1 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-500 border-b border-dashed border-slate-300 pb-1">
                  <span>CUSTOMER PACKING SLIP</span>
                  <span>ORDER #{labelModalOrder.id}</span>
                </div>
                
                <div className="flex justify-between font-bold text-[10px]">
                  <span className="truncate max-w-[180px]">{labelModalOrder.qty}x {labelModalOrder.productName}</span>
                  <span>₹{labelModalOrder.customerPrice}.00</span>
                </div>

                <div className="flex justify-between font-black text-xs border-t border-black pt-1">
                  <span>TOTAL AMOUNT:</span>
                  <span>₹{labelModalOrder.customerPrice}.00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setLabelModalOrder(null)}
                className="text-xs font-semibold rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={() => handlePrintThermalLabel('thermal-label-modal')}
                className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Slip</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print Isolation Stylesheet */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
          }
          header, nav, aside, footer, button, select, input, textarea, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
