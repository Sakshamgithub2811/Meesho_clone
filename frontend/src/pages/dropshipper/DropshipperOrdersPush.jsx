import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  archiveDropshipperOrderApi,
  sendOrderTrackingAlertApi
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
  ShieldCheck,
  Search,
  Eye,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  Check,
  RefreshCw,
  Copy,
  Edit3,
  Trash2,
  Ban,
  Archive,
  ArchiveRestore,
  MessageCircle,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// Convert number into Indian currency words for official tax invoice
const numberToWordsInr = (amount) => {
  let num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  };

  let str = '';
  if (num >= 10000000) {
    str += inWords(Math.floor(num / 10000000)) + 'Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    str += inWords(Math.floor(num / 100000)) + 'Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    str += inWords(Math.floor(num / 1000)) + 'Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    str += inWords(Math.floor(num / 100)) + 'Hundred ';
    num %= 100;
  }
  if (num > 0) {
    str += (str !== '' ? 'and ' : '') + inWords(num);
  }
  return `Rupees ${str.trim()} Only`;
};

export default function DropshipperOrdersPush() {
  const navigate = useNavigate();
  const location = useLocation();
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
    } catch {
      // ignore
    }
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
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

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
    unitPrice: 0,
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
    } catch {
      // ignore
    }
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
  const [isDragging, setIsDragging] = useState(false);

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
    const timer = setTimeout(() => {
      fetchLiveCatalog();
      fetchOrdersFromDb();
    }, 0);
    return () => clearTimeout(timer);
  }, [effectiveUid]);

  // Auto-fill Product Details when navigated from Wholesale Catalog Push
  useEffect(() => {
    let prefilled = location.state?.prefilledProduct;
    if (!prefilled) {
      try {
        const stored = sessionStorage.getItem('meesho_prefilled_order_product');
        if (stored) {
          prefilled = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not read stored prefilled product:', e);
      }
    }

    if (prefilled) {
      const wholesale = Number(prefilled.wholesaleCost ?? prefilled.price ?? 450);
      const customerPrice = Number(prefilled.customerPrice ?? prefilled.mrp ?? (wholesale + 300));
      const img = prefilled.image || (Array.isArray(prefilled.images) ? prefilled.images[0] : '');
      const sku = prefilled.sku || `SKU-${String(prefilled.id || 'ITEM').slice(0, 8).toUpperCase()}`;

      const timer = setTimeout(() => {
        setSelectedProduct({
          id: prefilled.id,
          title: prefilled.title || prefilled.name,
          price: wholesale,
          images: img ? [img] : []
        });

        setSingleOrder((prev) => {
          const currentQty = Math.max(1, Number(prev.qty) || 1);
          return {
            ...prev,
            productId: prefilled.id || '',
            selectedSku: sku,
            productName: prefilled.title || prefilled.name || '',
            productImage: img,
            wholesaleCost: wholesale,
            unitPrice: customerPrice,
            customerPrice: Math.round(customerPrice * currentQty)
          };
        });

        setActiveTab('single');

        toast.success(`Product auto-filled: ${prefilled.title || prefilled.name}`, {
          description: `Wholesale: ₹${wholesale} • Selling Price: ₹${customerPrice}`
        });

        try {
          sessionStorage.removeItem('meesho_prefilled_order_product');
        } catch (e) {
          console.warn('Could not clear sessionStorage:', e);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Select a Catalog Item from Database
  const handleSelectCatalogItem = (prod) => {
    setSelectedProduct(prod);
    const wholesale = Number(prod.price) || 450;
    const suggestedUnitPrice = Math.round(wholesale * 1.35) + singleOrder.shippingFee;
    setSingleOrder((prev) => {
      const currentQty = Math.max(1, Number(prev.qty) || 1);
      return {
        ...prev,
        productId: prod.id,
        selectedSku: `SKU-${prod.id.slice(0, 8).toUpperCase()}`,
        productName: prod.title,
        productImage: prod.images?.[0] || '',
        wholesaleCost: wholesale,
        unitPrice: suggestedUnitPrice,
        customerPrice: Math.round(suggestedUnitPrice * currentQty)
      };
    });
    setIsProductPickerOpen(false);
    toast.info(`Selected: ${prod.title}`, {
      description: `Wholesale cost: ₹${wholesale}/pc • Unit Selling Price: ₹${suggestedUnitPrice}/pc`
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

  // Single Order Live Margins & Dynamic Quantity Handlers
  const qty = Math.max(1, Number(singleOrder.qty) || 1);
  const unitWholesale = Number(singleOrder.wholesaleCost) || 0;
  const totalWholesale = unitWholesale * qty;
  const unitSellingPrice = Number(singleOrder.unitPrice) > 0
    ? Number(singleOrder.unitPrice)
    : (singleOrder.customerPrice && qty > 0 ? Math.round(Number(singleOrder.customerPrice) / qty) : 0);
  const totalCustomerCost = Number(singleOrder.customerPrice) || (unitSellingPrice * qty);
  const netMargin = Math.max(0, totalCustomerCost - totalWholesale - singleOrder.shippingFee);
  const marginPercent = totalCustomerCost > 0 ? ((netMargin / totalCustomerCost) * 100).toFixed(1) : 0;

  // Handle Quantity Change (recalculates total wholesale and total customer price based on unit price)
  const handleUpdateQty = (newQty) => {
    const validQty = Math.max(1, Math.min(100, Number(newQty) || 1));
    setSingleOrder((prev) => {
      const unit = Number(prev.unitPrice) > 0
        ? Number(prev.unitPrice)
        : (prev.customerPrice && Number(prev.qty) > 0 ? Math.round(Number(prev.customerPrice) / Number(prev.qty)) : 0);
      return {
        ...prev,
        qty: validQty,
        unitPrice: unit,
        customerPrice: unit > 0 ? Math.round(unit * validQty) : prev.customerPrice
      };
    });
  };

  // Handle Unit Selling Price Change
  const handleUpdateUnitPrice = (newUnitPrice) => {
    const unit = Number(newUnitPrice) || 0;
    setSingleOrder((prev) => {
      const currentQty = Math.max(1, Number(prev.qty) || 1);
      return {
        ...prev,
        unitPrice: unit,
        customerPrice: unit > 0 ? Math.round(unit * currentQty) : ''
      };
    });
  };

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
    if (!totalCustomerCost || totalCustomerCost < totalWholesale + singleOrder.shippingFee) {
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
        baseWholesaleCost: singleOrder.wholesaleCost,
        customerPrice: totalCustomerCost,
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

  // Isolated A4 Customer Tax Invoice Printing
  const handlePrintTaxInvoice = (elementId) => {
    const invoiceEl = document.getElementById(elementId);
    if (!invoiceEl) {
      toast.error("Invoice element not found for printing.");
      return;
    }

    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(tag => tag.outerHTML)
      .join('\n');

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
          <title>Customer_Tax_Invoice_${invoiceModalOrder?.id || 'Order'}</title>
          <meta charset="utf-8" />
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            html, body {
              background: #ffffff !important;
              color: #111827 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            }
            .print-invoice-wrapper {
              max-width: 800px !important;
              margin: 0 auto !important;
              background: #ffffff !important;
            }
          </style>
        </head>
        <body>
          <div class="print-invoice-wrapper">
            ${invoiceEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

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

  // RFC-4180 Compliant CSV string to 2D array parser (supports commas in quotes)
  const parseCsvText = (csvString) => {
    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let insideQuote = false;

    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      const nextChar = csvString[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentVal.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }

    if (currentVal || currentRow.length > 0) {
      currentRow.push(currentVal.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  // Industrial Standard CSV/Excel Processor with Flexible Column Mapping & Auto Product Matching
  const processUploadedCsvText = (csvText, fileName) => {
    setBulkFileName(fileName || 'orders_batch.csv');
    setIsProcessingBulk(true);

    try {
      const rawRows = parseCsvText(csvText);
      if (rawRows.length <= 1) {
        toast.error("CSV file is empty or missing data rows!");
        setIsProcessingBulk(false);
        return;
      }

      // Read header row and determine column index mappings
      const headers = rawRows[0].map(h => (h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      const findCol = (regex, fallbackIdx) => {
        const found = headers.findIndex(h => regex.test(h));
        return found !== -1 ? found : fallbackIdx;
      };

      const nameIdx = findCol(/name|customer|billing/i, 0);
      const phoneIdx = findCol(/phone|mobile|contact|tel/i, 1);
      const addrIdx = findCol(/address|street|addr/i, 2);
      const cityIdx = findCol(/city/i, 3);
      const stateIdx = findCol(/state|province/i, 4);
      const pinIdx = findCol(/pin|zip|postal/i, 5);
      const skuIdx = findCol(/sku|itemid|code/i, 6);
      const prodIdx = findCol(/product|title|itemname/i, 7);
      const qtyIdx = findCol(/qty|quantity|count/i, 8);
      const wholesaleIdx = findCol(/wholesale|cost|suppliercost/i, 9);
      const priceIdx = findCol(/price|selling|total|customerprice/i, 10);
      const modeIdx = findCol(/mode|payment|cod/i, 11);

      const parsedRows = [];

      for (let i = 1; i < rawRows.length; i++) {
        const parts = rawRows[i];
        if (!parts || parts.length < 3 || parts.every(p => !p)) continue;

        const custName = parts[nameIdx] || `Customer ${i}`;
        const rawPhone = parts[phoneIdx] || '';
        const cleanPhone = rawPhone.replace(/\D/g, '');
        const addr = parts[addrIdx] || '';
        const city = parts[cityIdx] || 'City';
        const state = parts[stateIdx] || 'India';
        const rawPin = parts[pinIdx] || '';
        const cleanPin = rawPin.replace(/\D/g, '');
        const sku = parts[skuIdx] || `SKU-BULK-${i}`;
        let prodName = parts[prodIdx] || parts[skuIdx] || 'Catalog Product';
        const qty = Math.max(1, Number(parts[qtyIdx]) || 1);

        // Try to match with catalog products
        const matchedProd = catalogProducts.find(cp => 
          (sku && cp.sku && cp.sku.toLowerCase() === sku.toLowerCase()) ||
          (cp.title && (cp.title.toLowerCase().includes(prodName.toLowerCase()) || prodName.toLowerCase().includes(cp.title.toLowerCase())))
        );

        if (matchedProd) {
          prodName = matchedProd.title;
        }

        const baseWholesale = Number(parts[wholesaleIdx]) || (matchedProd ? Number(matchedProd.price) : 500);
        const selling = Number(parts[priceIdx]) || (baseWholesale + 300);

        const totalWholesale = baseWholesale * qty;
        const shipping = 60;
        const margin = Math.max(0, selling - totalWholesale - shipping);

        // Validation Rules
        let errorMsg = null;
        if (!custName.trim()) errorMsg = 'Missing Name';
        else if (cleanPhone.length < 10) errorMsg = 'Invalid Phone';
        else if (!addr.trim()) errorMsg = 'Missing Address';
        else if (cleanPin.length !== 6) errorMsg = 'Invalid PIN (6 digits)';
        else if (selling <= totalWholesale) errorMsg = 'Selling ≤ Cost';

        parsedRows.push({
          id: i,
          name: custName,
          phone: cleanPhone || rawPhone,
          address: addr,
          city,
          state,
          pin: cleanPin || rawPin,
          product: prodName,
          sku,
          qty,
          baseWholesale,
          wholesale: totalWholesale,
          selling,
          margin,
          mode: (parts[modeIdx] || 'COD').toUpperCase(),
          valid: !errorMsg,
          errorMsg
        });
      }

      setBulkRows(parsedRows);
      setIsProcessingBulk(false);
      toast.success(`Successfully parsed ${parsedRows.length} orders from CSV!`, {
        description: `${parsedRows.filter(r => r.valid).length} valid and ready for 1-click dispatch.`
      });
    } catch (parseErr) {
      console.error("CSV Parse Error:", parseErr);
      toast.error("Failed to parse CSV file. Please verify file format.");
      setIsProcessingBulk(false);
    }
  };

  // File Upload parser for Bulk CSV
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      processUploadedCsvText(text, file.name);
    };
    reader.readAsText(file);
  };

  // Delete a Row from Staging Table
  const handleDeleteBulkRow = (index) => {
    setBulkRows(prev => prev.filter((_, idx) => idx !== index));
    toast.info("Row removed from batch staging.");
  };

  // WhatsApp & SMS Courier Tracking Notification Generator
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const handleSendTrackingWhatsApp = async (order) => {
    setIsSendingAlert(true);
    try {
      const res = await sendOrderTrackingAlertApi(order.id, {
        channel: 'WHATSAPP',
        storeBrandName: brandSettings.storeBrandName
      });

      if (res?.success) {
        toast.success(`WhatsApp Tracking Alert ready for ${res.customerName}!`, {
          description: `Dispatched via ${res.courier} (AWB: ${res.awb})`
        });

        // Update local order tracking info
        setOrders(prev => prev.map(o => o.id === order.id ? {
          ...o,
          lastTrackingAlertSentAt: res.sentAt
        } : o));

        if (viewModalOrder && viewModalOrder.id === order.id) {
          setViewModalOrder(prev => ({
            ...prev,
            lastTrackingAlertSentAt: res.sentAt
          }));
        }

        window.open(res.whatsappWebUrl, '_blank');
      }
    } catch (err) {
      console.error("Tracking alert error:", err);
      // Fallback direct WhatsApp URL
      const phone = order.customerPhone || (order.shippingAddress && order.shippingAddress.phone) || '';
      const cleanPhone = phone.replace(/\D/g, '');
      const intlPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const awb = order.awb || `DEL-${order.id.slice(0, 8).toUpperCase()}`;
      const msg = `Hello! Your order #${order.id.slice(0, 8)} from ${brandSettings.storeBrandName} is confirmed & dispatched via Delhivery (AWB: ${awb}). Track live: https://track.mshoppy.in/awb/${awb}`;
      window.open(`https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`, '_blank');
    } finally {
      setIsSendingAlert(false);
    }
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
    } catch {
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
    } catch {
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

              {/* RTO Safety Cushion Policy Note */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs text-purple-900">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛡️</span>
                  <span><strong>Zero Friction Order Push:</strong> No upfront deposit needed to dispatch. Earnings auto-accumulate into your ₹5,000 RTO reserve.</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dropshipper-settlement-tracking')}
                  className="text-purple-700 hover:text-purple-900 font-bold underline text-[11px] shrink-0 ml-2 cursor-pointer"
                >
                  View Reserve
                </button>
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
                        onClick={() => handleUpdateQty(Number(singleOrder.qty || 1) - 1)}
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
                        onChange={(e) => handleUpdateQty(e.target.value)}
                        className="h-9 w-full min-w-0 border-y border-x-0 border-slate-200 text-center text-xs sm:text-sm font-black text-slate-900 focus:outline-none bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(Number(singleOrder.qty || 1) + 1)}
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

                {/* Selling Price Input (Auto-multiplies with Quantity) */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700">
                      Customer Selling Price {Number(singleOrder.qty) > 1 ? '(Per Piece)' : ''} (₹) *
                    </Label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {selectedProduct ? `Base: ₹${singleOrder.wholesaleCost}/pc` : 'Select product first'}
                    </span>
                  </div>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <Input
                      required
                      type="number"
                      disabled={!selectedProduct}
                      placeholder={selectedProduct ? `Min ₹${(singleOrder.wholesaleCost || 0) + 1}/pc` : 'Select a product above first'}
                      min={selectedProduct ? (singleOrder.wholesaleCost || 0) + 1 : 0}
                      value={singleOrder.unitPrice || (singleOrder.qty > 0 && singleOrder.customerPrice ? Math.round(singleOrder.customerPrice / singleOrder.qty) : '')}
                      onChange={(e) => handleUpdateUnitPrice(e.target.value)}
                      className="pl-8 rounded-xl border-slate-200 focus:border-[#b7004d] font-black text-sm sm:text-base text-slate-900 disabled:opacity-50"
                    />
                  </div>
                  {Number(singleOrder.qty) > 1 && (
                    <div className="mt-1.5 p-2 rounded-xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between text-xs">
                      <span className="text-purple-800 font-medium">
                        Total Invoiced to Customer ({singleOrder.qty} pcs):
                      </span>
                      <span className="font-black text-purple-900 text-sm">
                        ₹{totalCustomerCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
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
                        {totalCustomerCost > 0 ? `Collect ₹${totalCustomerCost.toLocaleString('en-IN')}` : 'Cash on courier delivery'}
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
                {selectedProduct && totalCustomerCost > 0 ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Customer Invoiced Total ({singleOrder.qty}x):</span>
                      <span className="font-semibold text-slate-900">₹{totalCustomerCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Supplier Wholesale Cost ({singleOrder.qty}x):</span>
                      <span className="font-semibold text-rose-600">-₹{totalWholesale.toLocaleString('en-IN')}</span>
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

            {/* Upload Drop Zone with Native Drag & Drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => processUploadedCsvText(ev.target?.result, file.name);
                  reader.readAsText(file);
                }
              }}
              className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center transition ${
                isDragging
                  ? 'border-[#b7004d] bg-pink-100/60 scale-[1.01]'
                  : 'border-pink-200 hover:border-[#b7004d] bg-pink-50/20'
              }`}
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-[#b7004d] mb-2.5">
                {isProcessingBulk ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {bulkFileName ? bulkFileName : "Drag & Drop Orders CSV File Here"}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Directly upload exported CSV/Excel from Shopify, Amazon, WooCommerce, or your CRM.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
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
                    <span>Parsed Orders: <strong className="text-slate-900">{bulkRows.length}</strong></span>
                    <span>Valid Ready: <strong className="text-emerald-700">{bulkRows.filter(r => r.valid).length}</strong></span>
                    <span>Batch Net Margin: <strong className="text-[#b7004d]">₹{bulkRows.reduce((acc, r) => acc + r.margin, 0).toLocaleString('en-IN')}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkRows([])}
                      className="border-slate-200 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Clear Batch
                    </Button>
                    <Button
                      onClick={handleDispatchBulkOrders}
                      disabled={isDispatchingBulk || bulkRows.filter(r => r.valid).length === 0}
                      className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isDispatchingBulk ? 'Dispatching Batch...' : `Dispatch Valid Orders (${bulkRows.filter(r => r.valid).length})`}</span>
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Phone & City</th>
                        <th className="py-2.5 px-3">Product Name & SKU</th>
                        <th className="py-2.5 px-3 text-right">Wholesale</th>
                        <th className="py-2.5 px-3 text-right">Selling Price</th>
                        <th className="py-2.5 px-3 text-right">Net Margin</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Validation</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkRows.map((r, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono text-[11px]">{r.phone}</div>
                            <span className="text-[10px] text-slate-400">{r.city} ({r.pin})</span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs truncate font-medium text-slate-800">
                            <div>{r.product}</div>
                            <span className="text-[10px] text-slate-400 font-mono">Qty: {r.qty} • {r.sku}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium">
                            <div>₹{r.wholesale}</div>
                          </td>
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
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                {r.errorMsg || 'Invalid'}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteBulkRow(index)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete row from batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

              {/* Automated WhatsApp Tracking Alert Configuration */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">Auto WhatsApp Courier Tracking</span>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  When supplier parcels are manifested and AWBs are issued, automated tracking links are generated using your brand name <strong>{brandSettings.storeBrandName}</strong>.
                </p>
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
                    <div className="text-[9px] sm:text-[10px] font-bold mt-1">
                      TEL: {singleOrder.customerPhone ? `${String(singleOrder.customerPhone).replace(/[\s-]/g, '').slice(0, 5)} XXXXX` : '+91 98234 XXXXX'} (Masked)
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-bold text-emerald-800">
                      HELPLINE: +91 80 4712 3456
                    </div>
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
                            {/* WhatsApp Tracking Notification Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendTrackingWhatsApp(order)}
                              disabled={isSendingAlert}
                              className="text-emerald-700 hover:bg-emerald-50 text-xs font-semibold h-7 px-2 rounded-lg cursor-pointer"
                              title="Send WhatsApp Courier Tracking Alert to Customer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </Button>

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

                            {/* Customer Tax Invoice Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInvoiceModalOrder(order)}
                              className="text-indigo-600 hover:bg-indigo-50 text-xs font-semibold h-7 px-2 rounded-lg cursor-pointer"
                              title="Print White-Label Customer Tax Invoice"
                            >
                              <FileText className="w-3.5 h-3.5" />
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

                      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                        <Button
                          onClick={() => handleOpenEditModal(order)}
                          variant="outline"
                          className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Address</span>
                        </Button>
                      )}
                    </div>

                    {/* Secondary Action Row: Thermal Label & Tax Invoice */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setLabelModalOrder(order)}
                        variant="outline"
                        className="text-xs font-bold text-[#b7004d] border-pink-200 hover:bg-pink-50 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Thermal Label</span>
                      </Button>

                      <Button
                        onClick={() => setInvoiceModalOrder(order)}
                        variant="outline"
                        className="text-xs font-bold text-indigo-700 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 rounded-xl py-1.5 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Tax Invoice</span>
                      </Button>
                    </div>

                    {/* WhatsApp Tracking Notification Button */}
                    <Button
                      onClick={() => handleSendTrackingWhatsApp(order)}
                      disabled={isSendingAlert}
                      variant="outline"
                      className="w-full text-xs font-bold text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl py-1.5 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send WhatsApp Courier Tracking</span>
                    </Button>

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[82vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
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

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

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

            {/* Customer Tracking & WhatsApp Communication Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Customer Courier Tracking Alert (WhatsApp)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Branded as: {brandSettings.storeBrandName}
                </span>
              </div>
              
              <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-emerald-100 font-mono">
                "Hello {viewModalOrder.customerName}! 📦 Great news: Your order for {viewModalOrder.productName} from {brandSettings.storeBrandName} is confirmed & dispatched via {viewModalOrder.courier} (AWB: {viewModalOrder.awb}). Track live: https://track.mshoppy.in/awb/{viewModalOrder.awb}"
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Customer Phone: <strong className="text-slate-800 font-mono">{viewModalOrder.customerPhone}</strong>
                </span>
                <Button
                  size="sm"
                  onClick={() => handleSendTrackingWhatsApp(viewModalOrder)}
                  disabled={isSendingAlert}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Alert</span>
                </Button>
              </div>
            </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
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

              {(viewModalOrder.status === 'CANCELLED' || viewModalOrder.status === 'DELIVERED') && (
                <Button
                  variant="ghost"
                  onClick={() => handleDeleteOrder(viewModalOrder)}
                  className="text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Delete</span>
                </Button>
              )}

              <Button
                onClick={() => {
                  setInvoiceModalOrder(viewModalOrder);
                  setViewModalOrder(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tax Invoice</span>
              </Button>

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[82vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
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

            <form onSubmit={handleSaveOrderEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
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
              </div>

              {/* Pinned Footer */}
              <div className="shrink-0 px-5 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[82vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
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
            </div>

            {/* Pinned Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[82vh] sm:max-h-[88vh] flex flex-col overflow-hidden">
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
              {isCatalogLoading ? (
                <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#b7004d]" />
                  <span>Loading Wholesale Catalog...</span>
                </div>
              ) : filteredCatalogProducts.length === 0 ? (
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[82vh] sm:max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between">
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

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
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
                  <div className="text-[9px] font-bold mt-1">
                    TEL: {labelModalOrder.customerPhone ? `${String(labelModalOrder.customerPhone).replace(/[\s-]/g, '').slice(0, 5)} XXXXX` : '+91 98765 XXXXX'} (Masked)
                  </div>
                  <div className="text-[8px] font-bold text-emerald-800">
                    HELPLINE: +91 80 4712 3456
                  </div>
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
            </div>

            {/* Pinned Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
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

      {/* MODAL 6: WHITE-LABEL CUSTOMER B2C TAX INVOICE & PACKING SLIP */}
      {invoiceModalOrder && (() => {
        const totalAmount = Number(invoiceModalOrder.customerPrice) || 0;
        const qty = Number(invoiceModalOrder.qty) || 1;
        const shipping = Number(invoiceModalOrder.shippingFee) || 0;
        const itemSubtotal = Math.max(0, totalAmount - shipping);
        const unitPrice = qty > 0 ? Math.round(itemSubtotal / qty) : itemSubtotal;
        
        // Indian GST 18% inclusive computation
        const taxableAmount = Math.round(itemSubtotal / 1.18);
        const totalTax = Math.max(0, itemSubtotal - taxableAmount);
        const isInterState = invoiceModalOrder.state && !invoiceModalOrder.state.toLowerCase().includes('gujarat');
        const cgst = isInterState ? 0 : Math.round(totalTax / 2);
        const sgst = isInterState ? 0 : (totalTax - cgst);
        const igst = isInterState ? totalTax : 0;
        
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceModalOrder.id || '').replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()}`;
        const storeName = invoiceModalOrder.whiteLabelStoreName || brandSettings.storeBrandName || 'Kunal Retail Store';
        const returnAddress = brandSettings.returnAddress || 'Textile Logistics Park, Surat, Gujarat - 395002';
        const supportPhone = brandSettings.supportPhone || '+91 90982 96425';
        const isCod = (invoiceModalOrder.paymentMode || 'COD').toUpperCase() === 'COD';

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[82vh] sm:max-h-[88vh] overflow-hidden">
              {/* Modal Top Header (Action Controls) */}
              <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
                      <span>Customer Tax Invoice & Packing Slip</span>
                      <span className="text-[10px] font-mono font-bold bg-indigo-400/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                        White-Label D2C
                      </span>
                    </h3>
                    <p className="text-[11px] text-indigo-200/80">
                      Invoice #{invoiceNumber} • Ready to print and insert inside courier parcel
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePrintTaxInvoice('customer-tax-invoice-printable')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice (A4 / PDF)</span>
                  </Button>
                  <button
                    onClick={() => setInvoiceModalOrder(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold cursor-pointer transition"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Printable Document Area */}
              <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/60 flex-1">
                <div 
                  id="customer-tax-invoice-printable"
                  className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm text-slate-800 text-xs space-y-5"
                >
                  {/* Document Header */}
                  <div className="flex flex-col sm:row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-900">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{storeName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Verified D2C Store
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-sm leading-relaxed">
                        Fulfillment Hub & Return Center: {returnAddress}
                      </p>
                      <div className="text-[11px] text-slate-700 font-semibold mt-0.5">
                        WhatsApp Customer Care: <span className="font-mono text-slate-900">{supportPhone}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm font-black text-slate-900 uppercase tracking-wider">TAX INVOICE</div>
                      <div className="text-[10px] text-slate-500 font-medium">(Original for Recipient)</div>
                      <div className="font-mono text-xs font-bold text-slate-900 mt-1">Invoice: {invoiceNumber}</div>
                      <div className="text-[11px] text-slate-500">Date: {invoiceModalOrder.date}</div>
                      <div className="font-mono text-[10px] text-slate-500 mt-0.5">Order Ref: {invoiceModalOrder.id}</div>
                    </div>
                  </div>

                  {/* Dispatch & Billing Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bill To / Ship To Recipient</div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">{invoiceModalOrder.customerName}</div>
                      <div className="text-xs text-slate-600 mt-0.5 font-mono">
                        TEL: {invoiceModalOrder.customerPhone ? `${String(invoiceModalOrder.customerPhone).replace(/[\s-]/g, '').slice(0, 5)} XXXXX (Protected)` : '+91 98765 XXXXX (Protected)'}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                        🛡️ Virtual Helpline: +91 80 4712 3456
                      </div>
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {invoiceModalOrder.address || invoiceModalOrder.city}
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {invoiceModalOrder.city}, {invoiceModalOrder.state} - {invoiceModalOrder.pincode}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Place of Supply: {invoiceModalOrder.state || 'India'}</div>
                    </div>

                    <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics & Courier Delivery</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{invoiceModalOrder.courier}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Airway Bill (AWB): <strong className="font-mono text-slate-900">{invoiceModalOrder.awb}</strong>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Shipping Mode: <strong>Express Standard Logistics</strong>
                      </div>
                      <div className="mt-2 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-semibold inline-block">
                        ✓ Package Inspected & Sanitized for Transit
                      </div>
                    </div>
                  </div>

                  {/* Commercial Product Line Items Table */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-black text-[11px] uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-8">#</th>
                          <th className="py-2.5 px-3">Item Description & SKU</th>
                          <th className="py-2.5 px-3 text-center">HSN</th>
                          <th className="py-2.5 px-3 text-center w-12">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Rate</th>
                          <th className="py-2.5 px-3 text-right">Taxable</th>
                          <th className="py-2.5 px-3 text-right">GST</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-3 px-3 font-bold text-slate-400">1</td>
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{invoiceModalOrder.productName}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {invoiceModalOrder.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-600">6109.10</td>
                          <td className="py-3 px-3 text-center font-black text-slate-900">{qty}</td>
                          <td className="py-3 px-3 text-right font-medium text-slate-700">₹{unitPrice}</td>
                          <td className="py-3 px-3 text-right font-medium text-slate-700">₹{taxableAmount}</td>
                          <td className="py-3 px-3 text-right text-slate-600 font-mono">
                            {isInterState ? `IGST ₹${igst}` : `CGST+SGST ₹${totalTax}`}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">₹{itemSubtotal}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Banner & Summary Calculation Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    {/* Payment Status Banner */}
                    <div>
                      {isCod ? (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                            <AlertCircle className="w-4 h-4 text-amber-700" />
                            <span>CASH ON DELIVERY (COD)</span>
                          </div>
                          <div className="text-xl font-black text-amber-900">
                            COLLECT: ₹{totalAmount.toLocaleString('en-IN')} ONLY
                          </div>
                          <p className="text-[10px] text-amber-800 leading-tight">
                            Notice to Delivery Executive: Please collect exact cash of ₹{totalAmount.toLocaleString('en-IN')} from the customer prior to parcel handover.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>PREPAID ORDER (PAID IN FULL)</span>
                          </div>
                          <div className="text-xl font-black text-emerald-900">
                            DO NOT COLLECT CASH
                          </div>
                          <p className="text-[10px] text-emerald-800 leading-tight">
                            Notice to Delivery Executive: Payment was captured online via Store UPI / Gateway. Handover parcel directly to recipient.
                          </p>
                        </div>
                      )}

                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[10px] text-slate-500">
                        <div className="font-bold text-slate-700">7-Day Customer Exchange Guarantee</div>
                        <p className="leading-relaxed">
                          For size exchange, replacement, or quality questions, reach our WhatsApp support line at {supportPhone}.
                        </p>
                      </div>
                    </div>

                    {/* Tax & Financials Summary Table */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Items Taxable Value:</span>
                        <span className="font-semibold text-slate-800">₹{taxableAmount}</span>
                      </div>
                      {!isInterState ? (
                        <>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Central GST (CGST 9%):</span>
                            <span className="font-semibold text-slate-800">₹{cgst}</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>State GST (SGST 9%):</span>
                            <span className="font-semibold text-slate-800">₹{sgst}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Integrated GST (IGST 18%):</span>
                          <span className="font-semibold text-slate-800">₹{igst}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Packaging & Handling:</span>
                        <span className="font-semibold text-slate-800">
                          {shipping > 0 ? `₹${shipping}` : 'FREE'}
                        </span>
                      </div>
                      <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-baseline">
                        <span className="text-xs font-black uppercase text-slate-900">Invoice Total:</span>
                        <span className="text-xl sm:text-2xl font-black text-slate-900">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                        {numberToWordsInr(totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Signatory & Legal Declaration */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                      This is a computer-generated commercial retail tax invoice issued under the brand authority of {storeName}. Goods are packed and verified for direct consumer delivery.
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-bold text-xs text-slate-900 font-serif italic">For {storeName}</div>
                      <div className="mt-1 inline-block border-b border-slate-400 pb-0.5 text-[10px] text-indigo-700 font-bold uppercase tracking-wider">
                        ✓ Digitally Signed & Manifested
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Authorized Signatory</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pinned Modal Footer Controls */}
              <div className="shrink-0 p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Click 'Print Invoice' to open clean A4 browser print dialog or save as PDF.
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => setInvoiceModalOrder(null)}
                    className="text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handlePrintTaxInvoice('customer-tax-invoice-printable')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice (A4 / PDF)</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
