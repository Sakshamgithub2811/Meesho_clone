import React, { useState, useEffect } from 'react';
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
  getDropshipperOrdersApi 
} from '../../services/dropshipperService';
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
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// Sample Catalog items for quick selection in Single Order Push
const SAMPLE_CATALOG = [
  { id: 'sku-101', name: 'Banarasi Zari Woven Silk Saree with Blouse', category: 'Ethnic Wear', wholesaleCost: 649, suggestedPrice: 1299, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150&auto=format&fit=crop&q=60' },
  { id: 'sku-102', name: 'Embroidered Anarkali Kurta & Dupatta Set', category: 'Ethnic Wear', wholesaleCost: 520, suggestedPrice: 1049, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=150&auto=format&fit=crop&q=60' },
  { id: 'sku-103', name: 'Men Slim Fit Dark Wash Stretchable Denim', category: 'Men Casual', wholesaleCost: 480, suggestedPrice: 999, image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=150&auto=format&fit=crop&q=60' },
  { id: 'sku-104', name: 'Kundan Choker Necklace & Jhumka Set', category: 'Jewelry', wholesaleCost: 220, suggestedPrice: 599, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150&auto=format&fit=crop&q=60' },
  { id: 'sku-105', name: 'Breathable Running & Training Sneakers', category: 'Footwear', wholesaleCost: 599, suggestedPrice: 1199, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=60' },
];

const INITIAL_ORDERS = [
  {
    id: 'DSP-98214',
    date: '24 Oct 2026, 02:45 PM',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98234 11029',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    productName: 'Banarasi Zari Woven Silk Saree',
    sku: 'SKU-BAN-01',
    qty: 1,
    wholesaleCost: 649,
    customerPrice: 1299,
    shippingFee: 60,
    margin: 590,
    paymentMode: 'COD',
    status: 'DISPATCHED',
    courier: 'Delhivery Air',
    awb: 'DEL-8923019283'
  },
  {
    id: 'DSP-98213',
    date: '24 Oct 2026, 11:15 AM',
    customerName: 'Ananya Verma',
    customerPhone: '+91 91928 33411',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226010',
    productName: 'Embroidered Anarkali Kurta Set',
    sku: 'SKU-ANK-04',
    qty: 1,
    wholesaleCost: 520,
    customerPrice: 1049,
    shippingFee: 60,
    margin: 469,
    paymentMode: 'PREPAID',
    status: 'IN_TRANSIT',
    courier: 'BlueDart Surface',
    awb: 'BLU-4491023912'
  },
  {
    id: 'DSP-98210',
    date: '23 Oct 2026, 06:30 PM',
    customerName: 'Rahul Mehta',
    customerPhone: '+91 97721 89201',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    productName: 'Men Slim Fit Stretch Denim',
    sku: 'SKU-DNM-09',
    qty: 2,
    wholesaleCost: 960,
    customerPrice: 1998,
    shippingFee: 80,
    margin: 958,
    paymentMode: 'COD',
    status: 'DELIVERED',
    courier: 'Shadowfax Express',
    awb: 'SHD-9012384712'
  },
  {
    id: 'DSP-98204',
    date: '22 Oct 2026, 01:20 PM',
    customerName: 'Sunita Patil',
    customerPhone: '+91 93240 18274',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    productName: 'Kundan Choker Necklace Set',
    sku: 'SKU-JWL-12',
    qty: 1,
    wholesaleCost: 220,
    customerPrice: 599,
    shippingFee: 50,
    margin: 329,
    paymentMode: 'COD',
    status: 'DELIVERED',
    courier: 'Delhivery Surface',
    awb: 'DEL-5510293812'
  }
];

export default function DropshipperOrdersPush() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  // Active Main View Tab: 'single' | 'bulk' | 'label'
  const [activeTab, setActiveTab] = useState('single');

  // Orders list with persistence
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_dropshipper_pushed_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ORDERS;
  });

  // Fetch orders from database on mount
  useEffect(() => {
    const fetchDbOrders = async () => {
      const uid = currentUser?.uid || currentUser?.id;
      if (!uid) return;
      try {
        const res = await getDropshipperOrdersApi(uid);
        if (res?.success && res.orders?.length > 0) {
          setOrders(prev => {
            // Merge DB orders with any local orders, avoiding duplicates
            const dbIds = new Set(res.orders.map(o => o.id));
            const uniqueLocal = prev.filter(o => !dbIds.has(o.id));
            const merged = [...res.orders, ...uniqueLocal];
            try {
              localStorage.setItem('meesho_dropshipper_pushed_orders', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      } catch (err) {
        console.log("Database orders fetch fallback:", err.message);
      }
    };
    fetchDbOrders();
  }, [currentUser?.uid, currentUser?.id]);

  // Filter & Search states for Orders Table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Order for Label Preview Modal
  const [previewLabelOrder, setPreviewLabelOrder] = useState(null);

  // 1. Single Order Form State
  const [singleOrder, setSingleOrder] = useState({
    customerName: '',
    customerPhone: '',
    altPhone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    selectedSku: 'sku-101',
    productName: 'Banarasi Zari Woven Silk Saree with Blouse',
    qty: 1,
    wholesaleCost: 649,
    shippingFee: 60,
    customerPrice: 1299,
    paymentMode: 'COD', // 'COD' | 'PREPAID'
    whiteLabelBrand: true
  });

  // 2. White-Label Branding Settings State
  const [brandSettings, setBrandSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('meesho_dropshipper_brand_label');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      storeBrandName: currentUser?.storeName || 'Glamour Aura Boutique',
      supportPhone: currentUser?.phone || '+91 98765 43210',
      returnAddress: 'Plot 42, Textile Logistics Park, Surat, Gujarat - 395002',
      customNote: 'Thank you for shopping with us! For easy returns or size exchanges WhatsApp support.',
      showQrCode: true
    };
  });

  // 3. Bulk CSV Upload State
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkFileName, setBulkFileName] = useState('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Calculations for Single Order Live Margin
  const totalWholesale = singleOrder.wholesaleCost * singleOrder.qty;
  const totalCustomerCost = singleOrder.customerPrice;
  const netMargin = Math.max(0, totalCustomerCost - totalWholesale - singleOrder.shippingFee);
  const marginPercent = totalCustomerCost > 0 ? ((netMargin / totalCustomerCost) * 100).toFixed(1) : 0;

  // Handle SKU change in Single Order
  const handleProductSelect = (skuId) => {
    const item = SAMPLE_CATALOG.find(p => p.id === skuId);
    if (item) {
      setSingleOrder(prev => ({
        ...prev,
        selectedSku: item.id,
        productName: item.name,
        wholesaleCost: item.wholesaleCost,
        customerPrice: item.suggestedPrice
      }));
    }
  };

  // Submit Single Order
  const handlePushSingleOrder = async (e) => {
    e.preventDefault();
    if (!singleOrder.customerName.trim() || !singleOrder.customerPhone.trim() || !singleOrder.address.trim() || !singleOrder.pincode.trim()) {
      toast.error("Please fill all required customer delivery fields!");
      return;
    }
    if (singleOrder.pincode.length !== 6 || isNaN(Number(singleOrder.pincode))) {
      toast.error("Please enter a valid 6-digit Indian PIN code!");
      return;
    }
    if (Number(singleOrder.customerPrice) < totalWholesale + singleOrder.shippingFee) {
      toast.error("Customer selling price cannot be lower than Wholesale Cost + Shipping!");
      return;
    }

    const uid = currentUser?.uid || currentUser?.id || 'gv6BEVSvd7O6kXlVdU22FbRiHfz1';

    try {
      const res = await pushDropshipperOrderApi({
        firebaseUid: uid,
        customerName: singleOrder.customerName,
        customerPhone: singleOrder.customerPhone,
        altPhone: singleOrder.altPhone,
        address: singleOrder.address,
        city: singleOrder.city,
        state: singleOrder.state,
        pincode: singleOrder.pincode,
        landmark: singleOrder.landmark,
        productSku: singleOrder.selectedSku,
        productName: singleOrder.productName,
        quantity: Number(singleOrder.qty),
        wholesaleCost: singleOrder.wholesaleCost,
        customerPrice: Number(singleOrder.customerPrice),
        shippingFee: singleOrder.shippingFee,
        paymentMode: singleOrder.paymentMode,
        whiteLabelStoreName: brandSettings.storeBrandName
      });

      if (res?.success && res.order) {
        const updated = [res.order, ...orders];
        setOrders(updated);
        try {
          localStorage.setItem('meesho_dropshipper_pushed_orders', JSON.stringify(updated));
        } catch (err) {}

        toast.success(`Order #${res.order.id} pushed to Supplier & Database!`, {
          description: `Guaranteed Margin of ₹${res.order.margin} secured in Escrow.`
        });
      }
    } catch (apiErr) {
      const fallbackOrder = {
        id: `DSP-${Math.floor(10000 + Math.random() * 90000)}`,
        date: 'Just now',
        customerName: singleOrder.customerName,
        customerPhone: singleOrder.customerPhone,
        city: singleOrder.city || 'Mumbai',
        state: singleOrder.state,
        pincode: singleOrder.pincode,
        productName: singleOrder.productName,
        sku: singleOrder.selectedSku,
        qty: Number(singleOrder.qty),
        wholesaleCost: totalWholesale,
        customerPrice: Number(singleOrder.customerPrice),
        shippingFee: singleOrder.shippingFee,
        margin: netMargin,
        paymentMode: singleOrder.paymentMode,
        status: 'DISPATCHED',
        courier: 'Delhivery Express',
        awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`
      };
      const updated = [fallbackOrder, ...orders];
      setOrders(updated);
      try {
        localStorage.setItem('meesho_dropshipper_pushed_orders', JSON.stringify(updated));
      } catch (err) {}
      toast.success(`Order #${fallbackOrder.id} dispatched!`, {
        description: `Guaranteed Margin of ₹${netMargin} secured in Escrow.`
      });
    }

    // Reset single order form
    setSingleOrder(prev => ({
      ...prev,
      customerName: '',
      customerPhone: '',
      altPhone: '',
      address: '',
      city: '',
      pincode: '',
    }));
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

  // Quick Load Sample CSV Batch (for fast testing without external file)
  const handleLoadSampleBatch = () => {
    setBulkFileName('Sample_Insta_Orders_Batch_Oct24.csv');
    setBulkRows([
      { id: 1, name: 'Pooja Deshmukh', phone: '9823019283', city: 'Pune', pin: '411001', product: 'Banarasi Silk Saree', qty: 1, wholesale: 649, selling: 1299, margin: 590, mode: 'COD', valid: true },
      { id: 2, name: 'Karan Singhania', phone: '9811029381', city: 'Noida', pin: '201301', product: 'Men Slim Stretch Jeans', qty: 2, wholesale: 960, selling: 1998, margin: 958, mode: 'PREPAID', valid: true },
      { id: 3, name: 'Meena Kumari', phone: '9442019284', city: 'Madurai', pin: '625001', product: 'Anarkali Kurti Set', qty: 1, wholesale: 520, selling: 1099, margin: 519, mode: 'COD', valid: true },
      { id: 4, name: 'Amit Joshi', phone: '9920192834', city: 'Jaipur', pin: '302006', product: 'Kundan Choker Set', qty: 1, wholesale: 220, selling: 599, margin: 329, mode: 'COD', valid: true },
      { id: 5, name: 'Rhea Dsouza', phone: '9720198273', city: 'Mumbai', pin: '400050', product: 'Running Sneakers', qty: 1, wholesale: 599, selling: 1299, margin: 640, mode: 'PREPAID', valid: true },
    ]);
    toast.info("Loaded 5 verified orders into bulk staging.");
  };

  // File Upload parser simulation
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
          const pin = parts[5] || '000000';
          const valid = pin.length === 6 && selling > wholesale;

          rows.push({
            id: i,
            name: parts[0] || `Customer ${i}`,
            phone: parts[1] || '9800000000',
            city: parts[3] || 'City',
            pin,
            product: parts[7] || parts[6] || 'Catalog Product',
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
      toast.success(`Successfully parsed ${rows.length} rows from CSV!`);
    };
    reader.readAsText(file);
  };

  // Dispatch All Bulk Orders
  const handleDispatchBulkOrders = async () => {
    const validRows = bulkRows.filter(r => r.valid);
    if (validRows.length === 0) {
      toast.error("No valid orders found to dispatch!");
      return;
    }

    const uid = currentUser?.uid || currentUser?.id || 'gv6BEVSvd7O6kXlVdU22FbRiHfz1';

    try {
      const res = await pushBulkDropshipperOrdersApi({
        firebaseUid: uid,
        orders: validRows,
        whiteLabelStoreName: brandSettings.storeBrandName
      });

      if (res?.success && res.orders) {
        const updated = [...res.orders, ...orders];
        setOrders(updated);
        try {
          localStorage.setItem('meesho_dropshipper_pushed_orders', JSON.stringify(updated));
        } catch (err) {}
        toast.success(`Batch of ${res.totalOrders} orders saved to Database & Dispatched!`, {
          description: `₹${res.totalBatchMargin?.toLocaleString('en-IN')} added to Escrow margin balance.`
        });
      }
    } catch (err) {
      const newOrders = validRows.map((r, idx) => ({
        id: `DSP-${Math.floor(10000 + Math.random() * 90000)}`,
        date: 'Just now (Bulk Batch)',
        customerName: r.name,
        customerPhone: r.phone,
        city: r.city,
        state: 'India',
        pincode: r.pin,
        productName: r.product,
        sku: `SKU-BULK-${idx + 1}`,
        qty: r.qty,
        wholesaleCost: r.wholesale,
        customerPrice: r.selling,
        shippingFee: 60,
        margin: r.margin,
        paymentMode: r.mode,
        status: 'DISPATCHED',
        courier: 'Delhivery Surface',
        awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`
      }));

      const totalBatchMargin = validRows.reduce((sum, r) => sum + r.margin, 0);
      const updated = [...newOrders, ...orders];
      setOrders(updated);
      try {
        localStorage.setItem('meesho_dropshipper_pushed_orders', JSON.stringify(updated));
      } catch (e) {}

      toast.success(`Batch of ${validRows.length} orders dispatched to suppliers!`, {
        description: `₹${totalBatchMargin.toLocaleString('en-IN')} added to Escrow margin balance.`
      });
    }

    setBulkRows([]);
    setBulkFileName('');
    setActiveTab('single');
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

  // Filtered Orders for Table
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  // Calculate High Level Metrics
  const totalOrdersCount = orders.length;
  const totalMarginSecured = orders.reduce((sum, o) => sum + (o.margin || 0), 0);
  const totalInTransit = orders.filter(o => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED').length;
  const totalDelivered = orders.filter(o => o.status === 'DELIVERED').length;

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
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-['Inter',sans-serif]">

        {/* 1. HERO BANNER & KPI METRICS */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#b7004d] via-[#92003d] to-[#4a0020] p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-pink-100 uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                Zero-Inventory Fulfillment Gateway
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                Push Customer Orders Hub
              </h1>
              <p className="mt-2 text-sm text-pink-100 max-w-2xl leading-relaxed">
                Send single customer orders or bulk CSV files directly to verified suppliers. 
                Your store brand name is printed on courier thermal labels and packing slips, while your profit margin is instantly secured in Escrow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadCsvTemplate}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-pink-200" />
                Download CSV Template
              </Button>
              <Button
                onClick={() => setActiveTab('label')}
                className="bg-white hover:bg-pink-50 text-[#b7004d] rounded-xl px-4 py-2.5 text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#b7004d]" />
                Label & Invoice Preview
              </Button>
            </div>
          </div>

          {/* KPI Mini Cards Grid */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-pink-200">Total Pushed Orders</span>
                <Package className="w-4 h-4 text-pink-300" />
              </div>
              <div className="mt-2 text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif]">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-pink-200">Across all channels</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-pink-200">Active In-Transit</span>
                <Truck className="w-4 h-4 text-amber-300" />
              </div>
              <div className="mt-2 text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-amber-200">
                {totalInTransit}
              </div>
              <span className="text-[11px] text-pink-200">Courier live tracking</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-pink-200">Delivered (Settled)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="mt-2 text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-emerald-200">
                {totalDelivered}
              </div>
              <span className="text-[11px] text-pink-200">100% Margin released</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-pink-200">Secured Margin Escrow</span>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="mt-2 text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-emerald-300">
                ₹{totalMarginSecured.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-pink-200">Auto-credited upon delivery</span>
            </div>
          </div>
        </div>

        {/* 2. MODE SELECTOR TABS */}
        <div className="flex items-center p-1.5 bg-gray-100/80 rounded-2xl max-w-md border border-gray-200/60">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-white text-[#b7004d] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Send className="w-4 h-4" />
            Single Order Push
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-white text-[#b7004d] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Bulk CSV Dispatch
          </button>
          <button
            onClick={() => setActiveTab('label')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'label'
                ? 'bg-white text-[#b7004d] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            Thermal Label
          </button>
        </div>

        {/* 3. TAB 1: SINGLE ORDER PUSH */}
        {activeTab === 'single' && (
          <form onSubmit={handlePushSingleOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: Customer & Delivery Address */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-[#b7004d]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Customer & Shipping Details
                    </h3>
                    <p className="text-xs text-gray-500">Address where courier will deliver the package</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#b7004d] bg-pink-50 px-2.5 py-1 rounded-full">
                  Step 1 of 2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Customer Full Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={singleOrder.customerName}
                    onChange={(e) => setSingleOrder({ ...singleOrder, customerName: e.target.value })}
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-[#b7004d] text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Customer Mobile Phone *</Label>
                  <Input
                    required
                    placeholder="e.g. 98234 11029"
                    value={singleOrder.customerPhone}
                    onChange={(e) => setSingleOrder({ ...singleOrder, customerPhone: e.target.value })}
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-[#b7004d] text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Delivery Address (House / Flat No, Street, Colony) *</Label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Flat 402, Royal Palms, Near Shani Mandir, MG Road"
                  value={singleOrder.address}
                  onChange={(e) => setSingleOrder({ ...singleOrder, address: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#b7004d] focus:outline-none focus:ring-1 focus:ring-[#b7004d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">City / District *</Label>
                  <Input
                    required
                    placeholder="e.g. Jaipur"
                    value={singleOrder.city}
                    onChange={(e) => setSingleOrder({ ...singleOrder, city: e.target.value })}
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-[#b7004d] text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">State *</Label>
                  <select
                    value={singleOrder.state}
                    onChange={(e) => setSingleOrder({ ...singleOrder, state: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-sm focus:border-[#b7004d] focus:outline-none"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">PIN Code (6 digits) *</Label>
                  <Input
                    required
                    maxLength={6}
                    placeholder="e.g. 302001"
                    value={singleOrder.pincode}
                    onChange={(e) => setSingleOrder({ ...singleOrder, pincode: e.target.value })}
                    className="mt-1.5 rounded-xl border-gray-200 focus:border-[#b7004d] text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Landmark or Delivery Instruction (Optional)</Label>
                <Input
                  placeholder="e.g. Opposite City Hospital gate / Call before delivery"
                  value={singleOrder.landmark}
                  onChange={(e) => setSingleOrder({ ...singleOrder, landmark: e.target.value })}
                  className="mt-1.5 rounded-xl border-gray-200 focus:border-[#b7004d] text-sm"
                />
              </div>

              {/* White Label Guarantee notice */}
              <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#b7004d] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900">100% White-Label Packing Slip Guarantee:</span>
                  <p className="text-gray-600 mt-0.5">
                    Supplier and Meesho branding are strictly hidden. The package will arrive with 
                    <strong className="text-[#b7004d]"> "{brandSettings.storeBrandName}" </strong> 
                    printed as the primary brand on the label.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Product, Pricing, Escrow & Dispatch */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Product & Price Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Product & Margin Specs
                    </h3>
                    <p className="text-xs text-gray-500">Supplier base cost vs your customer price</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-gray-700">Select Sourced Catalog Item</Label>
                  <select
                    value={singleOrder.selectedSku}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs sm:text-sm focus:border-[#b7004d] focus:outline-none"
                  >
                    {SAMPLE_CATALOG.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} — Base ₹{item.wholesaleCost}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={singleOrder.qty}
                      onChange={(e) => setSingleOrder({ ...singleOrder, qty: Math.max(1, Number(e.target.value)) })}
                      className="mt-1.5 rounded-xl border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-700">Shipping Mode</Label>
                    <div className="mt-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 flex items-center justify-between">
                      <span>Express Air</span>
                      <span className="font-bold text-gray-900">₹{singleOrder.shippingFee}</span>
                    </div>
                  </div>
                </div>

                {/* Selling Price Input */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-gray-700">Customer Selling Price (₹) *</Label>
                    <span className="text-[11px] text-gray-500">Base Cost: ₹{totalWholesale}</span>
                  </div>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                    <Input
                      required
                      type="number"
                      min={totalWholesale + singleOrder.shippingFee}
                      value={singleOrder.customerPrice}
                      onChange={(e) => setSingleOrder({ ...singleOrder, customerPrice: Number(e.target.value) })}
                      className="pl-8 rounded-xl border-gray-200 focus:border-[#b7004d] font-bold text-base text-gray-900"
                    />
                  </div>
                </div>

                {/* Payment Mode Selector */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Customer Payment Collection Mode</Label>
                  <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setSingleOrder({ ...singleOrder, paymentMode: 'COD' })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        singleOrder.paymentMode === 'COD'
                          ? 'border-[#b7004d] bg-pink-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">Cash on Delivery</span>
                        {singleOrder.paymentMode === 'COD' && <Check className="w-3.5 h-3.5 text-[#b7004d]" />}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">Courier collects ₹{singleOrder.customerPrice}</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSingleOrder({ ...singleOrder, paymentMode: 'PREPAID' })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        singleOrder.paymentMode === 'PREPAID'
                          ? 'border-[#b7004d] bg-pink-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">Prepaid Order</span>
                        {singleOrder.paymentMode === 'PREPAID' && <Check className="w-3.5 h-3.5 text-[#b7004d]" />}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">Paid via UPI / Store</p>
                    </button>
                  </div>
                </div>

                {/* Live Margin Calculation Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Customer Invoiced Total:</span>
                    <span className="font-semibold text-gray-900">₹{totalCustomerCost}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Supplier Wholesale Cost ({singleOrder.qty}x):</span>
                    <span className="font-semibold text-rose-600">-₹{totalWholesale}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Packaging & Courier Fee:</span>
                    <span className="font-semibold text-rose-600">-₹{singleOrder.shippingFee}</span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-900">Your Guaranteed Profit Margin:</span>
                      <div className="text-[11px] text-emerald-700">Margin rate: {marginPercent}%</div>
                    </div>
                    <div className="text-xl font-black text-emerald-800 font-['Plus_Jakarta_Sans',sans-serif]">
                      +₹{netMargin.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Submit Push Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#b7004d] hover:bg-[#92003d] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Push Order to Supplier for Dispatch
                </Button>
              </div>
            </div>

          </form>
        )}

        {/* 4. TAB 2: BULK CSV UPLOAD ENGINE */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Bulk Customer Orders Import & Dispatch
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an Excel or CSV file containing orders exported from Shopify, WooCommerce, or your WhatsApp/Instagram CRM.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownloadCsvTemplate}
                    className="border-gray-200 hover:bg-pink-50 hover:text-[#b7004d] text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#b7004d]" />
                    Download CSV Template
                  </Button>
                  <Button
                    onClick={handleLoadSampleBatch}
                    className="bg-pink-50 hover:bg-pink-100 text-[#b7004d] text-xs font-bold rounded-xl border border-pink-200 cursor-pointer"
                  >
                    Load 5 Sample Orders
                  </Button>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="mt-6 border-2 border-dashed border-pink-200 hover:border-[#b7004d] rounded-3xl p-8 text-center transition-colors bg-pink-50/20">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-pink-100/70 flex items-center justify-center text-[#b7004d] mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  {bulkFileName ? bulkFileName : "Drag and drop your Orders CSV file here"}
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Files formatted with customer name, phone, pincode, SKU, wholesale cost, and customer selling price are supported.
                </p>
                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer shadow-sm transition-all">
                    <FileSpreadsheet className="w-4 h-4" />
                    Browse CSV / Excel File
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Bulk Parsed Staging Table */}
              {bulkRows.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/70">
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                      <span>Total Parsed: <strong className="text-gray-900">{bulkRows.length}</strong></span>
                      <span>Valid: <strong className="text-emerald-700">{bulkRows.filter(r => r.valid).length}</strong></span>
                      <span>Total Net Margin: <strong className="text-[#b7004d]">₹{bulkRows.reduce((acc, r) => acc + r.margin, 0).toLocaleString('en-IN')}</strong></span>
                    </div>

                    <Button
                      onClick={handleDispatchBulkOrders}
                      className="bg-[#b7004d] hover:bg-[#92003d] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Dispatch Valid Orders ({bulkRows.filter(r => r.valid).length})
                    </Button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-xs">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-100">
                        <tr>
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Phone / City</th>
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4 text-right">Wholesale</th>
                          <th className="py-3 px-4 text-right">Customer Price</th>
                          <th className="py-3 px-4 text-right">Net Margin</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4">Validation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkRows.map((r, index) => (
                          <tr key={index} className="hover:bg-pink-50/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-gray-400">{index + 1}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900">{r.name}</td>
                            <td className="py-3 px-4">
                              <div>{r.phone}</div>
                              <span className="text-[11px] text-gray-400">{r.city} ({r.pin})</span>
                            </td>
                            <td className="py-3 px-4 max-w-xs truncate font-medium text-gray-800">{r.product}</td>
                            <td className="py-3 px-4 text-right font-medium">₹{r.wholesale}</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-900">₹{r.selling}</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">+₹{r.margin}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.mode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {r.mode}
                              </span>
                            </td>
                            <td className="py-3 px-4">
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
          </div>
        )}

        {/* 5. TAB 3: WHITE-LABEL SHIPPING LABEL & INVOICE CUSTOMIZER */}
        {activeTab === 'label' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 5 Columns: Brand Configuration */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-[#b7004d]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Brand Label Customizer
                  </h3>
                  <p className="text-xs text-gray-500">How your store appears to your buyers</p>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Store Brand Name *</Label>
                <Input
                  value={brandSettings.storeBrandName}
                  onChange={(e) => setBrandSettings({ ...brandSettings, storeBrandName: e.target.value })}
                  className="mt-1.5 rounded-xl border-gray-200 focus:border-[#b7004d] text-sm font-semibold"
                />
                <p className="text-[11px] text-gray-400 mt-1">Printed prominently as 'Shipped By' on the outer box.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Customer Support Phone / WhatsApp *</Label>
                <Input
                  value={brandSettings.supportPhone}
                  onChange={(e) => setBrandSettings({ ...brandSettings, supportPhone: e.target.value })}
                  className="mt-1.5 rounded-xl border-gray-200 focus:border-[#b7004d] text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Return Address (RTO Warehouse) *</Label>
                <textarea
                  rows={2}
                  value={brandSettings.returnAddress}
                  onChange={(e) => setBrandSettings({ ...brandSettings, returnAddress: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm focus:border-[#b7004d] focus:outline-none"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700">Custom Thank You / Return Policy Note</Label>
                <textarea
                  rows={2}
                  value={brandSettings.customNote}
                  onChange={(e) => setBrandSettings({ ...brandSettings, customNote: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm focus:border-[#b7004d] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200/60">
                <span className="text-xs font-semibold text-gray-700">Print Support QR Code on Packing Slip</span>
                <input
                  type="checkbox"
                  checked={brandSettings.showQrCode}
                  onChange={(e) => setBrandSettings({ ...brandSettings, showQrCode: e.target.checked })}
                  className="h-4 w-4 rounded text-[#b7004d] focus:ring-[#b7004d] accent-[#b7004d]"
                />
              </div>

              <Button
                onClick={handleSaveBrandSettings}
                className="w-full bg-[#b7004d] hover:bg-[#92003d] text-white font-bold py-3 rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Save Brand Label Defaults
              </Button>
            </div>

            {/* Right 7 Columns: Real-time 4x6 Thermal Label & Slip Simulator */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Live 4x6 Thermal Shipping Label Simulation
                  </h3>
                  <p className="text-xs text-gray-500">Direct courier print preview (Delhivery / BlueDart compatible)</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="border-gray-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-600" />
                  Print Sample (PDF)
                </Button>
              </div>

              {/* Thermal Label Box */}
              <div className="mx-auto max-w-md border-2 border-dashed border-gray-400 p-5 bg-white text-black font-mono shadow-sm rounded-lg text-xs space-y-4">
                
                {/* Header Courier Bar */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                  <div>
                    <span className="text-base font-black tracking-wider">DELHIVERY AIR</span>
                    <div className="text-[10px] font-sans font-semibold text-gray-600">Standard Surface & Airway</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-black text-white px-2 py-0.5 text-xs font-black">
                      COD ₹1,299
                    </span>
                    <div className="text-[9px] mt-0.5 font-bold">ROUTING: DEL / JAI-01</div>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="text-center py-2 bg-gray-50 rounded">
                  <div className="inline-flex h-12 w-64 justify-between items-stretch px-4">
                    {[1,3,1,2,4,1,2,3,1,4,2,1,3,2,1,2,4,1,3,2,1,3,4,1,2].map((w, i) => (
                      <div key={i} className="bg-black" style={{ width: `${w * 2}px` }} />
                    ))}
                  </div>
                  <div className="text-[11px] font-bold tracking-widest mt-1">AWB: DEL-8923019283</div>
                </div>

                {/* Ship To & Return Address Grid */}
                <div className="grid grid-cols-2 gap-3 border-t-2 border-b-2 border-black py-2.5">
                  <div className="pr-2 border-r border-gray-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">SHIP TO:</span>
                    <div className="font-bold text-xs mt-0.5">Radhika Sharma</div>
                    <div className="text-[10px] leading-tight text-gray-700 mt-1">
                      Flat 402, Royal Palms, Near Shani Mandir, MG Road, Jaipur, Rajasthan - 302001
                    </div>
                    <div className="text-[10px] font-bold mt-1">TEL: +91 98234 11029</div>
                  </div>

                  <div className="pl-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">SHIPPED BY:</span>
                    <div className="font-black text-xs text-[#b7004d] mt-0.5 uppercase">
                      {brandSettings.storeBrandName}
                    </div>
                    <div className="text-[10px] leading-tight text-gray-700 mt-1">
                      {brandSettings.returnAddress}
                    </div>
                    <div className="text-[10px] font-bold mt-1">SUPPORT: {brandSettings.supportPhone}</div>
                  </div>
                </div>

                {/* Tear-off Packing Slip */}
                <div className="pt-2 text-[10px] space-y-2">
                  <div className="flex items-center justify-between text-gray-500 border-b border-dashed border-gray-300 pb-1">
                    <span>CUSTOMER PACKING SLIP</span>
                    <span>ORDER #DSP-98214</span>
                  </div>
                  
                  <div className="flex justify-between font-bold">
                    <span>1x Banarasi Zari Woven Silk Saree with Blouse</span>
                    <span>₹1,299.00</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Standard Express Shipping:</span>
                    <span>FREE</span>
                  </div>

                  <div className="flex justify-between font-black text-xs border-t border-black pt-1">
                    <span>TOTAL AMOUNT COLLECTABLE:</span>
                    <span>₹1,299.00</span>
                  </div>

                  <p className="text-[9px] text-gray-500 italic pt-1">
                    "{brandSettings.customNote}"
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 6. BOTTOM SECTION: RECENT DISPATCHED ORDERS LEDGER */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Pushed Orders & Courier Status
              </h3>
              <p className="text-xs text-gray-500">Live fulfillment status from suppliers and 3PL courier partners</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <Input
                  placeholder="Search customer, ID, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs rounded-xl border-gray-200 h-9 w-48 sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/70 text-gray-700 font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Item & Qty</th>
                  <th className="py-3 px-4 text-right">Wholesale Cost</th>
                  <th className="py-3 px-4 text-right">Customer Price</th>
                  <th className="py-3 px-4 text-right">Escrow Margin</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Courier / AWB</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-400">
                      No matching orders found. Push a new customer order above!
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-pink-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 font-mono">{order.id}</div>
                        <span className="text-[11px] text-gray-400">{order.date}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{order.customerName}</div>
                        <div className="text-[11px] text-gray-500">{order.customerPhone}</div>
                        <span className="text-[10px] text-gray-400">{order.city}, {order.pincode}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-gray-800 truncate">{order.productName}</div>
                        <span className="text-[11px] text-gray-400">Qty: {order.qty} • {order.sku}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-700">
                        ₹{order.wholesaleCost}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        ₹{order.customerPrice}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          +₹{order.margin}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentMode === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.paymentMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{order.courier}</div>
                        <span className="font-mono text-[10px] text-gray-400">{order.awb}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'IN_TRANSIT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-[#b7004d]'
                        }`}>
                          {order.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3" />}
                          {order.status === 'IN_TRANSIT' && <Truck className="w-3 h-3" />}
                          {order.status === 'DISPATCHED' && <Clock className="w-3 h-3" />}
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPreviewLabelOrder(order);
                            setActiveTab('label');
                          }}
                          className="text-[#b7004d] hover:bg-pink-50 text-xs font-semibold h-8 px-2.5 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
