import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import LogoutConfirmDialog from '../../components/ui/LogoutConfirmDialog';
import supplierApiService, { clearAuthSession, getCurrentSupplier } from '../../services/supplierApiService';
import { supabase } from '../../utils/supabase';
import { auth } from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { SUPPLIER_MENU } from './supplierNavConfig';
import {
  PlusCircle,
  Package,
  Layers,
  Image as ImageIcon,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Eye,
  Box,
  Upload,
  Trash2,
  Star,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Palette,
  Ruler,
  Check,
  X,
  UploadCloud,
  FileSpreadsheet,
  Video,
  Play,
  Film,
  FileVideo,
  Clipboard
} from 'lucide-react';
import { uploadMediaToSupabase } from '../../services/uploadService';
import MultiVariantMatrix from '../../components/supplier/catalog/MultiVariantMatrix';
import BulkCatalogUploadModal from '../../components/supplier/catalog/BulkCatalogUploadModal';

// Preset Color Swatches for Multi-Color Selector
const PRESET_COLORS = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Pista Green', hex: '#93C572' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Baby Pink', hex: '#FBCFE8', border: true },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Beige', hex: '#D2B48C' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Multicolor', hex: 'linear-gradient(135deg, #f43f5e, #3b82f6, #10b981, #facc15)' }
];

// Category Adaptive Sizes
const CATEGORY_SIZES_MAP = {
  apparel: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Free Size'],
  footwear: ['UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
  beauty: ['50 ml', '100 ml', '150 ml', '200 ml', '250 ml', '500 ml', '50 gm', '100 gm', 'Pack of 1', 'Pack of 2', 'Pack of 3'],
  electronics: ['Standard', '64 GB', '128 GB', '256 GB', '512 GB', 'Pack of 1', 'Pack of 2'],
  home: ['Single', 'Double', 'Queen', 'King', 'Standard', 'Pack of 1', 'Pack of 2', 'Pack of 4'],
  accessories: ['Adjustable', 'Free Size', 'Small', 'Medium', 'Large'],
  general: ['Standard', 'Free Size', 'Compact', 'Default'],
};

const getSizesForCategory = (categorySlug = '') => {
  const slug = (categorySlug || '').toLowerCase();
  if (slug.includes('beauty') || slug.includes('care') || slug.includes('face') || slug.includes('skin') || slug.includes('wash') || slug.includes('lotion') || slug.includes('cream') || slug.includes('oil') || slug.includes('shampoo') || slug.includes('serum') || slug.includes('cosmetic') || slug.includes('perfume')) {
    return CATEGORY_SIZES_MAP.beauty;
  }
  if (slug.includes('footwear') || slug.includes('shoe') || slug.includes('sandal') || slug.includes('slipper') || slug.includes('heel')) {
    return CATEGORY_SIZES_MAP.footwear;
  }
  if (slug.includes('electronic') || slug.includes('gadget') || slug.includes('mobile')) {
    return CATEGORY_SIZES_MAP.electronics;
  }
  if (slug.includes('home') || slug.includes('kitchen') || slug.includes('bed') || slug.includes('curtain') || slug.includes('furnish') || slug.includes('living')) {
    return CATEGORY_SIZES_MAP.home;
  }
  if (slug.includes('jewel') || slug.includes('access') || slug.includes('watch') || slug.includes('bag') || slug.includes('belt')) {
    return CATEGORY_SIZES_MAP.accessories;
  }
  if (slug.includes('ethnic') || slug.includes('western') || slug.includes('apparel') || slug.includes('kurti') || slug.includes('saree') || slug.includes('shirt') || slug.includes('men') || slug.includes('women') || slug.includes('kid')) {
    return CATEGORY_SIZES_MAP.apparel;
  }
  return CATEGORY_SIZES_MAP.general;
};

// Category Adaptive Thickness & Density Configuration
const CATEGORY_THICKNESS_MAP = {
  apparel: {
    unit: 'GSM',
    label: 'Fabric Thickness / Weight (GSM)',
    presets: ['140 GSM (Lightweight)', '180 GSM (Regular / Bio-Wash)', '220 GSM (Heavy / Premium)', '260 GSM (Fleece / Winter)', '300 GSM (Super Heavy)'],
  },
  home: {
    unit: 'GSM / mm',
    label: 'Material Thickness / Cushioning',
    presets: ['180 GSM (Standard)', '300 GSM (Heavy Cotton)', '400 GSM (Plush Towel)', '4 mm (Anti-Skid Mat)', '6 mm (Floor / Yoga Mat)', '8 mm (Cushioned Rug)'],
  },
  footwear: {
    unit: 'mm',
    label: 'Sole & Insole Cushion Thickness',
    presets: ['8 mm (Slim Sole)', '12 mm (Daily Wear)', '15 mm (Comfort Cushion)', '20 mm (Extra Soft Ortho)'],
  },
  kitchen: {
    unit: 'mm / Gauge',
    label: 'Gauge / Metal Wall Thickness',
    presets: ['1.2 mm (Standard)', '1.5 mm (Heavy Duty)', '2.0 mm (Tri-ply Base)', '2.5 mm (Commercial Grade)', '3.0 mm (Heavy Cast)'],
  },
  accessories: {
    unit: 'mm',
    label: 'Thickness / Wire Gauge',
    presets: ['1.0 mm (Delicate / Sleek)', '1.5 mm (Standard)', '2.0 mm (Medium)', '3.0 mm (Bold / Heavy)'],
  },
  none: {
    unit: '',
    label: 'Material Thickness / Density',
    presets: [],
  },
  general: {
    unit: 'mm / GSM',
    label: 'Thickness / Density Specification',
    presets: ['0.8 mm', '1.2 mm', '1.5 mm', '2.0 mm', '180 GSM', '250 GSM'],
  }
};

const getThicknessConfig = (categorySlug = '') => {
  const slug = (categorySlug || '').toLowerCase();
  if (slug.includes('beauty') || slug.includes('care') || slug.includes('face') || slug.includes('skin') || slug.includes('wash') || slug.includes('lotion') || slug.includes('cosmetic') || slug.includes('electronic') || slug.includes('grocery')) {
    return CATEGORY_THICKNESS_MAP.none;
  }
  if (slug.includes('footwear') || slug.includes('shoe') || slug.includes('sandal')) {
    return CATEGORY_THICKNESS_MAP.footwear;
  }
  if (slug.includes('kitchen') || slug.includes('cookware') || slug.includes('utensil')) {
    return CATEGORY_THICKNESS_MAP.kitchen;
  }
  if (slug.includes('home') || slug.includes('bed') || slug.includes('curtain') || slug.includes('mat') || slug.includes('rug')) {
    return CATEGORY_THICKNESS_MAP.home;
  }
  if (slug.includes('jewel') || slug.includes('access') || slug.includes('watch') || slug.includes('bangle')) {
    return CATEGORY_THICKNESS_MAP.accessories;
  }
  if (slug.includes('ethnic') || slug.includes('western') || slug.includes('apparel') || slug.includes('kurti') || slug.includes('saree') || slug.includes('shirt') || slug.includes('men') || slug.includes('women') || slug.includes('kid')) {
    return CATEGORY_THICKNESS_MAP.apparel;
  }
  return CATEGORY_THICKNESS_MAP.general;
};

// Helper: Smart Default Variants Detection by Product Category
const detectCategoryDefaults = (categorySlug = '') => {
  const slug = (categorySlug || '').toLowerCase();
  const isBeauty = slug.includes('beauty') || slug.includes('care') || slug.includes('face') || slug.includes('skin') || slug.includes('wash') || slug.includes('lotion') || slug.includes('cream') || slug.includes('oil') || slug.includes('shampoo') || slug.includes('serum') || slug.includes('perfume') || slug.includes('cosmetic');
  const isApparel = slug.includes('ethnic') || slug.includes('western') || slug.includes('apparel') || slug.includes('kurti') || slug.includes('saree') || slug.includes('shirt') || slug.includes('men') || slug.includes('women') || slug.includes('kid') || slug.includes('cloth') || slug.includes('dress') || slug.includes('jeans') || slug.includes('pant');
  const isFootwear = slug.includes('footwear') || slug.includes('shoe') || slug.includes('sandal') || slug.includes('slipper') || slug.includes('heel');
  const isElectronics = slug.includes('electronic') || slug.includes('gadget') || slug.includes('mobile');

  if (isBeauty) {
    // For Facewash, Creams, Shampoos: No forced size/color/thickness. Single product quantity applies!
    return {
      enableSizes: false,
      enableColors: false,
      enableThickness: false,
      defaultSizes: [],
      defaultColors: [],
      defaultThickness: '',
    };
  }
  if (isApparel) {
    return {
      enableSizes: true,
      enableColors: true,
      enableThickness: true,
      defaultSizes: ['S', 'M', 'L', 'XL'],
      defaultColors: ['Black', 'Navy Blue', 'Maroon'],
      defaultThickness: '180 GSM (Regular / Bio-Wash)',
    };
  }
  if (isFootwear) {
    return {
      enableSizes: true,
      enableColors: true,
      enableThickness: false,
      defaultSizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9'],
      defaultColors: ['Black', 'Brown'],
      defaultThickness: '',
    };
  }
  if (isElectronics) {
    return {
      enableSizes: false,
      enableColors: true,
      enableThickness: false,
      defaultSizes: [],
      defaultColors: ['Black', 'Silver'],
      defaultThickness: '',
    };
  }
  return {
    enableSizes: false,
    enableColors: false,
    enableThickness: false,
    defaultSizes: [],
    defaultColors: [],
    defaultThickness: '',
  };
};

// Helper: Category-adaptive Key Specifications & Highlights Presets
const getCategorySpecPresets = (categorySlug = '') => {
  const s = (categorySlug || '').toLowerCase();
  const isBeauty = s.includes('beauty') || s.includes('care') || s.includes('face') || s.includes('skin') || s.includes('wash') || s.includes('lotion') || s.includes('cream') || s.includes('oil') || s.includes('shampoo') || s.includes('serum') || s.includes('perfume') || s.includes('cosmetic');
  const isApparel = s.includes('ethnic') || s.includes('western') || s.includes('apparel') || s.includes('kurti') || s.includes('saree') || s.includes('shirt') || s.includes('men') || s.includes('women') || s.includes('kid') || s.includes('cloth') || s.includes('dress') || s.includes('jeans') || s.includes('pant');
  const isFootwear = s.includes('footwear') || s.includes('shoe') || s.includes('sandal') || s.includes('slipper') || s.includes('heel');
  const isElectronics = s.includes('electronic') || s.includes('gadget') || s.includes('mobile');
  const isHome = s.includes('home') || s.includes('kitchen');
  const isJewellery = s.includes('jewel') || s.includes('access');

  if (isApparel) {
    return [
      { label: 'Fabric', value: '' },
      { label: 'Pattern', value: '' },
      { label: 'Fit / Shape', value: '' },
      { label: 'Occasion', value: '' },
    ];
  }
  if (isBeauty) {
    return [
      { label: 'Type / Finish', value: '' },
      { label: 'Skin Type', value: '' },
      { label: 'SPF / Protection', value: '' },
      { label: 'Formulation', value: '' },
    ];
  }
  if (isElectronics) {
    return [
      { label: 'Connectivity', value: '' },
      { label: 'Warranty', value: '' },
      { label: 'Compatibility', value: '' },
      { label: 'Battery / Power', value: '' },
    ];
  }
  if (isHome) {
    return [
      { label: 'Material', value: '' },
      { label: 'Pattern', value: '' },
      { label: 'Care Instructions', value: '' },
      { label: 'Country of Origin', value: 'India' },
    ];
  }
  if (isFootwear) {
    return [
      { label: 'Material', value: '' },
      { label: 'Fastening', value: '' },
      { label: 'Sole Material', value: '' },
      { label: 'Ideal For', value: 'Unisex' },
    ];
  }
  if (isJewellery) {
    return [
      { label: 'Base Metal', value: '' },
      { label: 'Plating', value: '' },
      { label: 'Occasion', value: '' },
      { label: 'Ideal For', value: 'Women' },
    ];
  }
  return [
    { label: 'Material / Type', value: '' },
    { label: 'Country of Origin', value: 'India' },
    { label: 'Ideal For', value: 'Unisex' },
  ];
};

// Client-side image compressor: Resizes device images to max 1280px & 0.75 JPEG quality (~90-150KB)
const compressImageFile = (file) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(readerEvent.target.result);
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export default function SellerAddProduct1({ onNavigate, embedded = false, onNavigateTab }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleNav = useCallback((path) => {
    if (onNavigate) onNavigate(path);
    else navigate(path);
  }, [onNavigate, navigate]);

  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [isKycLoading, setIsKycLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categorySlug: '',
    customCategory: '',
    price: '',
    mrp: '',
    stock: '',
    sku: '',
  });

  // Variation Enable/Disable Switches
  const [enableSizes, setEnableSizes] = useState(false);
  const [enableColors, setEnableColors] = useState(false);
  const [enableThickness, setEnableThickness] = useState(false);

  // Category-adaptive Sizes State
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Available in Different Colors State
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColorInput, setCustomColorInput] = useState('');

  // Thickness State
  const [selectedThickness, setSelectedThickness] = useState('');
  const [customThicknessInput, setCustomThicknessInput] = useState('');

  // Multiple Images State: array of URLs or base64 strings
  const [images, setImages] = useState(['']);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Dynamic Product Specifications & Highlights State
  const [specifications, setSpecifications] = useState(() => getCategorySpecPresets(''));
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  const handleSpecChange = (index, field, value) => {
    setSpecifications((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddCustomSpec = () => {
    if (!newSpecKey.trim()) {
      toast.error('Please enter a specification name (e.g. Skin Type, Material, etc.)');
      return;
    }
    setSpecifications((prev) => [
      ...prev,
      { label: newSpecKey.trim(), value: newSpecVal.trim() }
    ]);
    setNewSpecKey('');
    setNewSpecVal('');
    toast.success(`Added "${newSpecKey.trim()}" specification!`);
  };

  const handleRemoveSpec = (index) => {
    setSpecifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  // ==========================================
  // --- PRODUCT VIDEO STATE (3 MODES) ---
  // ==========================================
  // Mode: 'youtube' | 'instagram' | 'device'
  const [videoSourceType, setVideoSourceType] = useState('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [mediaPreviewMode, setMediaPreviewMode] = useState('image'); // 'image' | 'video'
  const videoFileInputRef = useRef(null);

  // Extract YouTube Video ID from any format
  const getYoutubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match && match[1] ? match[1] : null;
  };

  // Extract Instagram shortcode from Reel/Post/TV URL
  const getInstagramCode = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.trim().match(/(?:instagram\.com\/(?:reel|p|tv)\/)([\w-]+)/i);
    return match && match[1] ? match[1] : null;
  };

  const handleYoutubeChange = (val) => {
    setVideoUrl(val);
    const id = getYoutubeVideoId(val);
    if (id) {
      setVideoSourceType('youtube');
      setVideoPreviewUrl(`https://www.youtube-nocookie.com/embed/${id}`);
      setVideoFile(null);
    } else {
      setVideoPreviewUrl('');
    }
  };

  const handleInstagramChange = (val) => {
    setVideoUrl(val);
    const code = getInstagramCode(val);
    if (code) {
      setVideoSourceType('instagram');
      setVideoPreviewUrl(`https://www.instagram.com/reel/${code}/embed/`);
      setVideoFile(null);
    } else {
      setVideoPreviewUrl('');
    }
  };

  const handleDeviceVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error(`"${file.name}" is not a valid video file. Please upload an MP4, WEBM, or MOV video.`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.warning('Video file is larger than 50MB. Please select an optimized video under 50MB.');
    }

    const localUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoSourceType('device');
    setVideoPreviewUrl(localUrl);
    setVideoUrl(localUrl);
    setMediaPreviewMode('video');

    const toastId = toast.loading(`Uploading "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    setIsVideoUploading(true);
    try {
      const publicUrl = await uploadMediaToSupabase(file, 'products');
      if (publicUrl) {
        setVideoUrl(publicUrl);
        setVideoPreviewUrl(publicUrl);
        toast.success('Device video uploaded successfully to cloud CDN!', { id: toastId });
      }
    } catch (uploadErr) {
      console.warn('Device video upload note (using local preview):', uploadErr.message);
      toast.success('Device video loaded & ready for preview!', { id: toastId });
    } finally {
      setIsVideoUploading(false);
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setVideoFile(null);
    setVideoPreviewUrl('');
    setMediaPreviewMode('image');
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }
    toast.success('Product video removed');
  };

  // Direct Paste from Clipboard Handler (for YouTube & Instagram)
  const handlePasteFromClipboard = async (source) => {
    try {
      if (!navigator.clipboard?.readText) {
        toast.info('Please paste the URL directly into the input box (Ctrl+V).');
        return;
      }
      const text = await navigator.clipboard.readText();
      const cleanText = (text || '').trim();
      if (!cleanText) {
        toast.warning('Clipboard is empty! Copy a video link from YouTube or Instagram first.');
        return;
      }

      if (source === 'youtube') {
        const id = getYoutubeVideoId(cleanText);
        if (id) {
          handleYoutubeChange(cleanText);
          setMediaPreviewMode('video');
          toast.success('YouTube link pasted directly from clipboard!');
        } else {
          setVideoUrl(cleanText);
          toast.warning('Pasted text from clipboard, but it does not appear to be a valid YouTube URL.');
        }
      } else if (source === 'instagram') {
        const code = getInstagramCode(cleanText);
        if (code) {
          handleInstagramChange(cleanText);
          setMediaPreviewMode('video');
          toast.success('Instagram Reel link pasted directly from clipboard!');
        } else {
          setVideoUrl(cleanText);
          toast.warning('Pasted text from clipboard, but it does not appear to be an Instagram URL.');
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
      toast.info('Clipboard access was blocked by browser. Please paste the link directly into the box.');
    }
  };

  // Multi-Variant Matrix & Bulk Upload States
  const [variants, setVariants] = useState([]);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  // Fetch real categories, profile, and KYC compliance status
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, prof, kyc] = await Promise.allSettled([
          supplierApiService.fetchCategories(),
          supplierApiService.fetchSupplierProfile(),
          supplierApiService.fetchSupplierKyc(),
        ]);

        if (cats.status === 'fulfilled' && cats.value) {
          const list = Array.isArray(cats.value) ? cats.value : [];
          setCategories(list);
          if (list.length > 0) {
            const firstSlug = list[0].slug || list[0].name;
            setFormData((prev) => ({ ...prev, categorySlug: firstSlug }));
            const defaults = detectCategoryDefaults(firstSlug);
            setEnableSizes(defaults.enableSizes);
            setEnableColors(defaults.enableColors);
            setEnableThickness(defaults.enableThickness);
            setSelectedSizes(defaults.defaultSizes);
            setSelectedColors(defaults.defaultColors);
            setSelectedThickness(defaults.defaultThickness);
            setSpecifications(getCategorySpecPresets(firstSlug));
          }
        }

        if (prof.status === 'fulfilled' && prof.value) {
          setProfile(prof.value);
        } else {
          setProfile(getCurrentSupplier());
        }

        if (kyc.status === 'fulfilled' && kyc.value) {
          setKycData(kyc.value);
        }
      } catch (err) {
        console.warn('Initialization notice:', err);
      } finally {
        setIsKycLoading(false);
      }
    };
    init();
  }, []);

  // Handlers for Category Change, Sizes, Colors & Thickness
  const handleCategoryChange = (e) => {
    const slug = e.target.value;
    setFormData((prev) => ({ ...prev, categorySlug: slug }));
    if (slug !== 'CUSTOM') {
      const defaults = detectCategoryDefaults(slug);
      setEnableSizes(defaults.enableSizes);
      setEnableColors(defaults.enableColors);
      setEnableThickness(defaults.enableThickness);
      setSelectedSizes(defaults.defaultSizes);
      setSelectedColors(defaults.defaultColors);
      setSelectedThickness(defaults.defaultThickness);
      setSpecifications(getCategorySpecPresets(slug));
    }
  };

  // Switch Toggle Handlers
  const handleToggleEnableSizes = () => {
    const next = !enableSizes;
    setEnableSizes(next);
    if (!next) {
      setSelectedSizes([]);
    } else {
      const sizesList = getSizesForCategory(formData.categorySlug);
      setSelectedSizes(sizesList.slice(0, 3));
    }
  };

  const handleToggleEnableColors = () => {
    const next = !enableColors;
    setEnableColors(next);
    if (!next) {
      setSelectedColors([]);
    } else {
      setSelectedColors(['Black', 'Navy Blue', 'Maroon']);
    }
  };

  const handleToggleEnableThickness = () => {
    const next = !enableThickness;
    setEnableThickness(next);
    if (!next) {
      setSelectedThickness('');
    } else {
      const cfg = getThicknessConfig(formData.categorySlug);
      setSelectedThickness(cfg.presets[0] || '180 GSM (Regular / Bio-Wash)');
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
      setCustomSizeInput('');
    }
  };

  const selectAllCategorySizes = () => {
    const available = getSizesForCategory(formData.categorySlug);
    setSelectedSizes(available);
  };

  const clearAllSizes = () => {
    setSelectedSizes([]);
  };

  const toggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const addCustomColor = () => {
    const trimmed = customColorInput.trim();
    if (trimmed && !selectedColors.includes(trimmed)) {
      setSelectedColors((prev) => [...prev, trimmed]);
      setCustomColorInput('');
    }
  };

  const removeColor = (colorName) => {
    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
  };

  const selectThicknessPreset = (th) => {
    setSelectedThickness(th);
    setCustomThicknessInput('');
  };

  const handleCustomThicknessChange = (e) => {
    const val = e.target.value;
    setCustomThicknessInput(val);
    setSelectedThickness(val);
  };

  const handleTabChange = (tabId) => {
    if (onNavigateTab) return onNavigateTab(tabId);
    const item = SUPPLIER_MENU.find((m) => m.id === tabId);
    if (item?.path) handleNav(item.path);
  };

  const performLogout = async () => {
    try {
      if (supplierApiService?.logoutSupplier) await supplierApiService.logoutSupplier().catch(() => {});
      if (auth) await signOut(auth).catch(() => {});
    } catch (err) {
      console.warn(err);
    } finally {
      clearAuthSession();
      toast.success('Logged out successfully');
      handleNav('/supplier-login');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Multiple Images Handlers
  const handleImageUrlChange = (index, value) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addImageUrlSlot = () => {
    if (images.length >= 8) {
      toast.warning('Maximum 8 images allowed per product listing');
      return;
    }
    setImages((prev) => [...prev, '']);
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [''];
    });
    if (activePreviewIndex >= index && activePreviewIndex > 0) {
      setActivePreviewIndex((prev) => prev - 1);
    }
  };

  const setAsCoverImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const [target] = updated.splice(index, 1);
      updated.unshift(target);
      return updated;
    });
    setActivePreviewIndex(0);
    toast.success('Selected image set as Primary Cover');
  };

  // File Upload Handler (device gallery / camera) with automatic compression
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.filter(Boolean).length + files.length > 8) {
      toast.warning('You can upload up to 8 images in total');
    }

    const toastId = toast.loading('Processing & optimizing image(s)...');
    const selectedFiles = files.slice(0, 8 - images.filter(Boolean).length);

    try {
      const compressedList = [];
      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/')) {
          toast.error(`"${file.name}" is not an image file`);
          continue;
        }
        const dataUrl = await compressImageFile(file);
        if (dataUrl) {
          compressedList.push(dataUrl);
        }
      }

      if (compressedList.length > 0) {
        setImages((prev) => {
          let updated = [...prev];
          for (const item of compressedList) {
            const emptyIdx = updated.findIndex((url) => !url.trim());
            if (emptyIdx !== -1) {
              updated[emptyIdx] = item;
            } else {
              updated.push(item);
            }
          }
          return updated;
        });
        toast.success(`Optimized and added ${compressedList.length} photo(s)!`, { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.warn('File upload compression notice:', err);
      toast.error('Failed to process one or more images', { id: toastId });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick Preset Loader
  const applyPreset = (presetImages) => {
    setImages([...presetImages]);
    setActivePreviewIndex(0);
    toast.success('Sample images applied to listing');
  };

  // Valid, non-empty images
  const validImages = images.map((u) => u.trim()).filter(Boolean);
  const currentPreviewImage = validImages[activePreviewIndex] || validImages[0] || '';

  const isKycVerified = Boolean(
    kycData?.isVerified ||
    kycData?.status === 'APPROVED' ||
    kycData?.kyc?.status === 'APPROVED' ||
    profile?.tierLabel?.toLowerCase().includes('verified')
  );
  const kycStatus = kycData?.status || kycData?.kyc?.status || (isKycVerified ? 'APPROVED' : 'NOT_SUBMITTED');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isKycVerified) {
      toast.error('KYC Verification Required: You must complete business verification before publishing listings.');
      handleNav('/supplier-kyc1');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a product title');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid selling price');
      return;
    }
    const variantStockSum = variants.length > 0
      ? variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
      : parseInt(formData.stock, 10);

    const stockNum = !isNaN(variantStockSum) && variantStockSum >= 0 ? variantStockSum : 50;

    setIsSubmitting(true);
    try {
      const selectedCategory = formData.categorySlug === 'CUSTOM'
        ? (formData.customCategory.trim() || 'General')
        : (formData.categorySlug || 'general');

      const finalImages = validImages.length > 0 ? validImages : [];

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: priceNum,
        mrp: formData.mrp ? parseFloat(formData.mrp) : Math.round(priceNum * 1.3),
        stock: stockNum,
        sku: formData.sku.trim() || `MSH-${Date.now().toString().slice(-6)}`,
        categorySlug: selectedCategory.toLowerCase().replace(/\s+/g, '-'),
        categoryName: selectedCategory,
        sizes: enableSizes && selectedSizes.length > 0 ? selectedSizes : (enableSizes ? ['Free Size'] : []),
        colors: enableColors ? selectedColors : [],
        thickness: enableThickness && selectedThickness ? selectedThickness.trim() : null,
        thicknesses: enableThickness && selectedThickness ? [selectedThickness.trim()] : [],
        variants: (enableSizes || enableColors) && variants.length > 0 ? variants : [],
        images: finalImages,
        imageUrl: finalImages[0] || '',
        videoUrl: videoUrl ? videoUrl.trim() : null,
        videoType: videoUrl ? videoSourceType : null,
        specifications: specifications.filter(s => s.label && s.value && s.value.trim()),
      };

      // 1. Submit product to backend API (handles file writing and deduplication)
      const createdProduct = await supplierApiService.createSupplierProduct(payload);

      const isHeldUnderReview = formData.categorySlug === 'CUSTOM' || createdProduct?.isUnderReview || createdProduct?.category?.status === 'PENDING';

      // 2. Direct Supabase sync with the final images & video (ONLY sync to live catalog if category is approved)
      if (!isHeldUnderReview) {
        try {
          if (supabase) {
            const syncedImages = createdProduct?.images || payload.images;
            await supabase.from('products').insert([
              {
                title: payload.title,
                description: payload.description,
                price: payload.price,
                stock: payload.stock,
                images: syncedImages,
                category_slug: payload.categorySlug,
                sizes: payload.sizes,
                colors: payload.colors,
                thickness: payload.thickness,
                supplier_name: supplierDisplayName,
                video_url: payload.videoUrl,
                video_type: payload.videoType,
              }
            ]).select().catch(() => {});
          }
        } catch (sbErr) {
          console.warn('Supabase client insert note:', sbErr);
        }
      }

      if (isHeldUnderReview) {
        toast.info(
          `⏳ Custom category "${formData.customCategory.trim() || selectedCategory}" is under review. This product is saved as "Under Review" and will automatically be added to live catalog once approved by Admin.`
        );
      } else {
        toast.success(`🎉 Product "${formData.title}" published successfully to live catalog${videoUrl ? ' with product video' : ''}!`);
      }

      setTimeout(() => {
        handleNav('/supplier-inventory1');
      }, 700);
    } catch (err) {
      console.error('Failed to create product:', err);
      toast.error(err.message || 'Failed to publish product. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const supplierDisplayName = profile?.storeName || profile?.fullName || profile?.name || 'Verified Supplier';

  const mainContent = (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header Title */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-[#b7004d] text-xs font-bold tracking-wide uppercase mb-1">
              <PlusCircle className="w-3.5 h-3.5" />
              Listing Creation
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Add New Wholesale Product
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish a new merchandise listing into your live warehouse catalog with pricing, stock units, and multiple high-resolution images.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-[#b7004d] hover:bg-pink-100 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
              title="Bulk upload multiple products via Excel / CSV template"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#b7004d]" />
              <span>Bulk CSV Import</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/supplier-inventory1')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Inventory</span>
            </button>
          </div>
        </div>

        {/* Compliance KYC Gating Banner */}
        {!isKycLoading && !isKycVerified && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                    Compliance Lock
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Status: {kycStatus === 'PENDING' ? 'Under Review ⏳' : kycStatus === 'REJECTED' ? 'Rejected ❌' : 'Not Submitted ⚠️'}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Business KYC Verification Required to Publish Products
                </h3>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  {kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW'
                    ? 'Your KYC application is currently under review by our compliance team. Live catalog publishing will be unlocked upon approval.'
                    : kycStatus === 'REJECTED'
                    ? 'Your previous KYC verification was rejected. Please re-submit valid business documents in KYC Hub to unlock product publishing.'
                    : 'To comply with Indian E-Commerce Marketplace Regulations (GST Sec 9(5) & 194-O), suppliers must verify GSTIN, PAN and Bank Details before listing products.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNav('/supplier-kyc1')}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition shrink-0 shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Complete KYC Now ➔</span>
            </button>
          </div>
        )}

        {/* 2-Column Form Layout with Real-Time Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column (8 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            {/* 1. Title */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Pure Cotton Floral Print Anarkali Kurti Set with Dupatta"
                value={formData.title}
                onChange={handleChange}
                className="w-full h-11 px-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none transition"
                required
              />
            </div>

            {/* 2. Category & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Product Category
                </label>
                <select
                  name="categorySlug"
                  value={formData.categorySlug}
                  onChange={handleCategoryChange}
                  className="w-full h-11 px-3 text-xs font-semibold rounded-2xl border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.slug || c.name}>
                      {c.name} {c.status === 'PENDING' ? '⏳ (Pending Admin Approval)' : ''}
                    </option>
                  ))}
                  <option value="ethnic-wear">Ethnic Wear</option>
                  <option value="western-wear">Western Wear</option>
                  <option value="accessories">Jewellery & Accessories</option>
                  <option value="footwear">Footwear & Bags</option>
                  <option value="home-kitchen">Home & Kitchen</option>
                  <option value="CUSTOM">+ Add Custom Category (Requires Admin Review)</option>
                </select>

                {formData.categorySlug === 'CUSTOM' && (
                  <div className="mt-2 space-y-1.5">
                    <input
                      type="text"
                      name="customCategory"
                      placeholder="Type custom category name (e.g. Handmade Terracotta)..."
                      value={formData.customCategory}
                      onChange={handleChange}
                      className="w-full h-10 px-3 text-xs rounded-xl border border-pink-200 focus:border-[#d82a62] outline-none"
                      required
                    />
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                      <span className="shrink-0 text-sm">⏳</span>
                      <span>
                        <strong>Admin Approval Required:</strong> Custom categories do not appear in the public catalog immediately. Once submitted, this category goes to the Admin Panel for approval.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  SKU Code (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  name="sku"
                  placeholder="e.g. ETH-KRT-042 (Optional)"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full h-11 px-4 text-xs font-mono rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                />
              </div>
            </div>

            {/* 3. Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    name="price"
                    placeholder="799"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full h-11 pl-9 pr-3 text-xs font-bold rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  MRP / Strike Price (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    name="mrp"
                    placeholder="1299"
                    value={formData.mrp}
                    onChange={handleChange}
                    className="w-full h-11 pl-9 pr-3 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Available Stock Units (Quantity) <span className="text-rose-500">*</span>
                  </label>
                  {variants.length > 0 && (
                    <span className="text-[10px] font-bold text-[#b7004d] bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                      Synced from {variants.length} Variants
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  placeholder={variants.length > 0 ? "Calculated from variants" : "e.g. 100"}
                  value={formData.stock}
                  onChange={handleChange}
                  readOnly={variants.length > 0}
                  className={`w-full h-11 px-4 text-xs font-bold rounded-2xl border outline-none ${
                    variants.length > 0
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'border-slate-200 bg-white focus:border-[#d82a62] text-slate-900'
                  }`}
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {variants.length > 0
                    ? 'Total inventory is the sum of all variant stocks configured below.'
                    : 'Total quantity available in your warehouse for this product (e.g. 100 units of Facewash).'}
                </p>
              </div>
            </div>

            {/* 4. PRODUCT SIZES & VOLUME VARIATIONS */}
            <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#d82a62]" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Sizes & Volume Variations ({enableSizes ? `${selectedSizes.length} Selected` : 'Disabled'})
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enable if product has multiple size, volume (ml/gm), or pack options.
                  </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-3">
                  {enableSizes && (
                    <div className="flex items-center gap-2 mr-2">
                      <button
                        type="button"
                        onClick={selectAllCategorySizes}
                        className="text-[11px] font-bold text-[#b7004d] hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={clearAllSizes}
                        className="text-[11px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableSizes}
                    onClick={handleToggleEnableSizes}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enableSizes ? 'bg-[#d82a62]' : 'bg-slate-300'
                    }`}
                    title={enableSizes ? 'Click to disable size variations' : 'Click to enable size variations'}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableSizes ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-black text-slate-700 min-w-[50px]">
                    {enableSizes ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>

              {enableSizes ? (
                <>
                  {/* Size / Volume Pills */}
                  <div className="flex flex-wrap gap-2">
                    {getSizesForCategory(formData.categorySlug).map((size) => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                            isSelected
                              ? 'bg-[#d82a62] text-white shadow-xs shadow-pink-600/25 ring-2 ring-pink-300'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-pink-200 hover:bg-pink-50/30'
                          }`}
                        >
                          <span>{size}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Size Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add custom size or volume (e.g. 75 ml, 500 gm, 4XL, Pack of 3)..."
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSize();
                        }
                      }}
                      className="flex-1 h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#d82a62] outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomSize}
                      className="px-3.5 h-9 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      + Add Option
                    </button>
                  </div>

                  {selectedSizes.length === 0 && (
                    <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Sizes enabled but none selected. Click sizes above or add a custom size/volume.</span>
                    </p>
                  )}
                </>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <span>Single standard unit (no size or volume variations). Order quantity will be deducted from Available Stock Units.</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleEnableSizes}
                    className="text-[11px] font-bold text-[#b7004d] hover:underline cursor-pointer shrink-0"
                  >
                    + Enable Sizes / Volume
                  </button>
                </div>
              )}
            </div>

            {/* 5. PRODUCT COLORS (Available in Different Colors) */}
            <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#d82a62]" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Color Variations ({enableColors ? `${selectedColors.length} Selected` : 'Disabled'})
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enable if this product is available in multiple shades or color options.
                  </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableColors}
                    onClick={handleToggleEnableColors}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enableColors ? 'bg-[#d82a62]' : 'bg-slate-300'
                    }`}
                    title={enableColors ? 'Click to disable color variations' : 'Click to enable color variations'}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableColors ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-black text-slate-700 min-w-[50px]">
                    {enableColors ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>

              {enableColors ? (
                <>
                  {/* Color Swatch Circles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {PRESET_COLORS.map((col) => {
                      const isSelected = selectedColors.includes(col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => toggleColor(col.name)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
                            isSelected
                              ? 'border-[#d82a62] bg-pink-50/60 shadow-xs ring-1 ring-pink-200'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full shrink-0 shadow-xs flex items-center justify-center ${
                              col.border ? 'border border-slate-300' : ''
                            }`}
                            style={{ background: col.hex }}
                          >
                            {isSelected && (
                              <Check className={`w-2.5 h-2.5 ${col.name === 'White' || col.name === 'Yellow' || col.name === 'Baby Pink' ? 'text-slate-900' : 'text-white'}`} />
                            )}
                          </span>
                          <span className="text-[11px] font-bold text-slate-800 truncate">
                            {col.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add custom color shade (e.g. Wine Red, Bottle Green, Peach, Mustard)..."
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomColor();
                        }
                      }}
                      className="flex-1 h-9 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#d82a62] outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="px-3.5 h-9 rounded-xl bg-slate-800 hover:bg-black text-white text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      + Add Color
                    </button>
                  </div>

                  {/* Selected Colors Chip Tray */}
                  {selectedColors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Active Variants:</span>
                      {selectedColors.map((col) => {
                        const preset = PRESET_COLORS.find((p) => p.name.toLowerCase() === col.toLowerCase());
                        return (
                          <span
                            key={col}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                              style={{ background: preset?.hex || '#6366f1' }}
                            />
                            <span>{col}</span>
                            <button
                              type="button"
                              onClick={() => removeColor(col)}
                              className="hover:text-rose-600 cursor-pointer ml-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <span>Disabled for this product (Single standard shade). No color variations.</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleEnableColors}
                    className="text-[11px] font-bold text-[#b7004d] hover:underline cursor-pointer shrink-0"
                  >
                    + Enable Colors
                  </button>
                </div>
              )}
            </div>

            {/* 6. PRODUCT THICKNESS & FABRIC GSM */}
            <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#d82a62]" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      {getThicknessConfig(formData.categorySlug).label || 'Material Thickness / Density'} ({enableThickness ? 'Active' : 'Disabled'})
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Enable for textiles, apparel (GSM), or cookware/mats (mm) to showcase durability & weight.
                  </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableThickness}
                    onClick={handleToggleEnableThickness}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      enableThickness ? 'bg-[#d82a62]' : 'bg-slate-300'
                    }`}
                    title={enableThickness ? 'Click to disable thickness' : 'Click to enable thickness'}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        enableThickness ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-black text-slate-700 min-w-[50px]">
                    {enableThickness ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>

              {enableThickness ? (
                <>
                  {/* Preset Chips */}
                  {getThicknessConfig(formData.categorySlug).presets.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getThicknessConfig(formData.categorySlug).presets.map((th) => {
                        const isSelected = selectedThickness === th;
                        return (
                          <button
                            key={th}
                            type="button"
                            onClick={() => selectThicknessPreset(th)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'bg-[#d82a62] text-white shadow-xs ring-2 ring-pink-300'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-pink-200 hover:bg-pink-50/30'
                            }`}
                          >
                            {th}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom Thickness Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Selected / Custom Thickness
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 180 GSM, 1.5 mm, 2.0 mm, 300 GSM..."
                        value={selectedThickness}
                        onChange={handleCustomThicknessChange}
                        className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:border-[#d82a62] outline-none"
                      />
                    </div>
                    <div className="flex items-end pb-1 text-[11px] text-slate-500">
                      <span>Unit: {getThicknessConfig(formData.categorySlug).unit || 'GSM / mm'} (Aligned with {formData.categorySlug || 'product'})</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <span>Disabled for this product. Material thickness/GSM specification is not applicable.</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleEnableThickness}
                    className="text-[11px] font-bold text-[#b7004d] hover:underline cursor-pointer shrink-0"
                  >
                    + Enable Thickness
                  </button>
                </div>
              )}
            </div>

            {/* 3b. MULTI-VARIANT INVENTORY MATRIX (Color × Size × SKU per Variant) */}
            <MultiVariantMatrix
              selectedColors={enableColors ? selectedColors : []}
              selectedSizes={enableSizes ? selectedSizes : []}
              baseSku={formData.sku || 'MSH'}
              basePrice={formData.price || 0}
              variants={variants}
              onChangeVariants={(newVariants) => {
                setVariants(newVariants);
                const sum = newVariants.reduce((acc, v) => acc + (parseInt(v.stock, 10) || 0), 0);
                setFormData((prev) => ({ ...prev, stock: String(sum) }));
              }}
            />

            {/* 4. MULTIPLE PRODUCT IMAGES & MEDIA SECTION */}
            <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#d82a62]" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Product Images Gallery ({validImages.length}/8)
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add multiple high-resolution photos (Front, Back, Close-up, Lifestyle).
                  </p>
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">verified_user</span>
                    <p className="leading-relaxed">
                      <strong>Image Ownership & Licensing:</strong> Upload only original photography, royalty-free stock with commercial license, or commercial AI-generated images matching the product. External hotlinks are prohibited; all photos are self-hosted securely on our platform.
                    </p>
                  </div>
                </div>

                {/* Upload & Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-[#d82a62] hover:text-[#d82a62] text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={addImageUrlSlot}
                    disabled={images.length >= 8}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#d82a62] text-white hover:bg-[#b7004d] text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add URL</span>
                  </button>
                </div>
              </div>

              {/* Image Input Rows */}
              <div className="space-y-2.5">
                {images.map((url, idx) => {
                  const isCover = idx === 0;
                  const isValid = Boolean(url && url.trim());

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl bg-white border transition ${
                        isCover ? 'border-pink-300 shadow-xs ring-1 ring-pink-100' : 'border-slate-200'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center relative">
                        {isValid ? (
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                        {isCover && (
                          <span className="absolute bottom-0 inset-x-0 bg-[#d82a62] text-white text-[8px] font-black text-center py-0.5 leading-none uppercase">
                            Cover
                          </span>
                        )}
                      </div>

                      {/* URL Input */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {isCover ? 'Primary Cover Photo' : `Gallery Image #${idx + 1}`}
                          </span>
                          {!isCover && isValid && (
                            <button
                              type="button"
                              onClick={() => setAsCoverImage(idx)}
                              className="text-[10px] font-bold text-[#b7004d] hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
                              <span>Set as Cover</span>
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder={isCover ? 'Enter primary image URL or upload above...' : `Enter gallery photo #${idx + 1} URL...`}
                          value={url}
                          onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                          className="w-full h-8 px-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
                        />
                      </div>

                      {/* Delete Button */}
                      {images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="w-8 h-8 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition shrink-0 cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add more button */}
              {images.length < 8 && (
                <button
                  type="button"
                  onClick={addImageUrlSlot}
                  className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-pink-300 hover:bg-pink-50/40 text-slate-600 hover:text-[#b7004d] text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Another Product Image ({images.length}/8)</span>
                </button>
              )}
            </div>

            {/* 4B. PRODUCT VIDEO & DEMO REEL (3 WAYS: YOUTUBE, INSTAGRAM, DEVICE) */}
            <div className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#d82a62]" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Product Video & Demo Reel (Optional)
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Showcase your merchandise with an unboxing demo, product showcase, or styling video to boost customer orders.
                  </p>
                </div>

                {/* Status indicator */}
                {videoUrl ? (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Video Attached ({videoSourceType === 'youtube' ? 'YouTube' : videoSourceType === 'instagram' ? 'Instagram' : 'Device File'})</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    3 Ways to Add
                  </span>
                )}
              </div>

              {/* 3 Source Tabs: YouTube | Instagram | Device */}
              <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setVideoSourceType('youtube')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    videoSourceType === 'youtube'
                      ? 'bg-rose-50 border border-rose-200 text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>1. YouTube Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSourceType('instagram')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    videoSourceType === 'instagram'
                      ? 'bg-pink-50 border border-pink-200 text-[#b7004d] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-4 h-4 text-pink-600 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>2. Instagram Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSourceType('device')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    videoSourceType === 'device'
                      ? 'bg-slate-100 border border-slate-300 text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>3. Import from Device</span>
                </button>
              </div>

              {/* Way 1: YouTube Input & Preview */}
              {videoSourceType === 'youtube' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        YouTube Video or Shorts URL
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteFromClipboard('youtube')}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer transition hover:underline"
                        title="Directly paste copied YouTube link from clipboard"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>Paste from Clipboard</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or https://youtube.com/shorts/..."
                        value={videoSourceType === 'youtube' ? videoUrl : ''}
                        onChange={(e) => handleYoutubeChange(e.target.value)}
                        className="w-full h-10 pl-3 pr-20 text-xs rounded-xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none bg-white transition"
                      />
                      {videoUrl && videoSourceType === 'youtube' && (
                        <button
                          type="button"
                          onClick={() => { setVideoUrl(''); setVideoPreviewUrl(''); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Direct YouTube Links & Tools */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handlePasteFromClipboard('youtube')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Clipboard className="w-3.5 h-3.5 text-rose-400" />
                        <span>1-Click Paste Clipboard</span>
                      </button>

                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(formData.title || 'product unboxing showcase')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition cursor-pointer"
                        title="Directly search on YouTube in a new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Search on YouTube ↗</span>
                      </a>

                      <a
                        href="https://www.youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        title="Open YouTube to copy video link"
                      >
                        <span>Open YouTube ↗</span>
                      </a>
                    </div>

                    {/* Sample Presets */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Or Pick Sample Demo Video:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '👗 Ethnic Wear Demo', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                          { label: '🛍️ Unboxing Showcase', url: 'https://www.youtube.com/watch?v=9bZkp7q19f0' },
                          { label: '✨ 4K Fashion Short', url: 'https://www.youtube.com/shorts/kXYiU_JCYtU' },
                        ].map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleYoutubeChange(preset.url)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-[11px] font-medium text-slate-700 hover:text-red-700 transition cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* YouTube Player Preview */}
                  {getYoutubeVideoId(videoUrl) && (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-black aspect-video relative shadow-sm">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(videoUrl)}`}
                        title="Product Demo Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Way 2: Instagram Reel Input & Preview */}
              {videoSourceType === 'instagram' && (
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Instagram Reel or Post URL
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteFromClipboard('instagram')}
                        className="text-[11px] font-bold text-[#b7004d] hover:text-[#9e003f] flex items-center gap-1 cursor-pointer transition hover:underline"
                        title="Directly paste copied Instagram Reel link from clipboard"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>Paste from Clipboard</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="e.g. https://www.instagram.com/reel/C.../ or https://www.instagram.com/p/.../"
                        value={videoSourceType === 'instagram' ? videoUrl : ''}
                        onChange={(e) => handleInstagramChange(e.target.value)}
                        className="w-full h-10 pl-3 pr-20 text-xs rounded-xl border border-slate-200 focus:border-[#d82a62] focus:ring-2 focus:ring-pink-100 outline-none bg-white transition"
                      />
                      {videoUrl && videoSourceType === 'instagram' && (
                        <button
                          type="button"
                          onClick={() => { setVideoUrl(''); setVideoPreviewUrl(''); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Direct Instagram Links & Tools */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handlePasteFromClipboard('instagram')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>1-Click Paste Clipboard</span>
                      </button>

                      <a
                        href="https://www.instagram.com/reels/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-[#b7004d] text-xs font-bold transition cursor-pointer"
                        title="Open Instagram Reels in a new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Browse Reels on Instagram ↗</span>
                      </a>

                      <a
                        href="https://www.instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        title="Open Instagram"
                      >
                        <span>Open Instagram ↗</span>
                      </a>
                    </div>

                    {/* Sample Presets */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Or Pick Sample Styling Reel:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '✨ Kurti Styling Reel', url: 'https://www.instagram.com/reel/C7xyz123/' },
                          { label: '💃 Saree Draping Demo', url: 'https://www.instagram.com/reel/C8abc456/' },
                          { label: '🌟 Boutique Collection', url: 'https://www.instagram.com/reel/C9def789/' },
                        ].map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleInstagramChange(preset.url)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-200 text-[11px] font-medium text-slate-700 hover:text-[#b7004d] transition cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instagram Reel Preview Card */}
                  {getInstagramCode(videoUrl) && (
                    <div className="p-4 rounded-2xl bg-white border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Film className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>Instagram Reel Linked</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-[#b7004d] font-bold">
                              Code: {getInstagramCode(videoUrl)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-sm">
                            {videoUrl}
                          </p>
                        </div>
                      </div>
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview on Instagram</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Way 3: Import from Device */}
              {videoSourceType === 'device' && (
                <div className="space-y-3 pt-1">
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleDeviceVideoUpload}
                    accept="video/mp4,video/webm,video/quicktime,video/mkv,.mp4,.webm,.mov,.mkv"
                    className="hidden"
                  />

                  {videoPreviewUrl && videoSourceType === 'device' ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-black relative shadow-inner">
                        <video
                          src={videoPreviewUrl}
                          controls
                          playsInline
                          className="w-full max-h-72 object-contain"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <FileVideo className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-800 line-clamp-1">
                              {videoFile?.name || 'Uploaded Device Video'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Cloud Video Ready'} • MP4/Video Format
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => videoFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#d82a62] hover:bg-pink-50/40 rounded-2xl p-6 text-center cursor-pointer transition group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#d82a62] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Click to upload video from device
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Supports MP4, WEBM, or MOV video files (Recommended: 720p or 1080p up to 50MB)
                      </p>
                      <button
                        type="button"
                        className="mt-3 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <FileVideo className="w-3.5 h-3.5" />
                        <span>Choose Video File</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Product Highlights & Key Specifications */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#b7004d] flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Product Highlights & Key Specifications
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Category-specific attributes shown on customer product page (e.g. Fabric for clothing, Skin Type for skincare)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {specifications.filter((s) => s.label && s.value?.trim()).length} Set
                </span>
              </div>

              {/* Dynamic Preset Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                    <div className="w-2/5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block truncate" title={spec.label}>
                        {spec.label}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        placeholder={`Enter ${spec.label}...`}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 focus:border-[#d82a62] outline-none transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-400 hover:text-rose-600 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
                      title="Remove specification"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Specification Row */}
              <div className="pt-2 border-t border-dashed border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">
                  + Add Custom Specification / Key-Value:
                </span>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="Attribute Name (e.g. SPF, Battery, Volume, Fit)"
                    className="flex-1 min-w-[140px] px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
                  />
                  <input
                    type="text"
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    placeholder="Value (e.g. SPF 50 PA+++, 40 Hrs, 100ml)"
                    className="flex-1 min-w-[140px] px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#d82a62] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpec}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Description */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Product Description & Specifications
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Include fabric details, dimensions, pack contents, washing instructions, etc."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 text-xs font-medium rounded-2xl border border-slate-200 focus:border-[#d82a62] outline-none transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              {!isKycLoading && !isKycVerified ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.error('Complete business KYC verification first to unlock product publishing.');
                    handleNav('/supplier-kyc1');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                >
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Listing Locked: Complete Business KYC to Publish ➔</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d82a62] to-[#eb3678] hover:opacity-95 text-white font-black text-sm shadow-lg shadow-pink-600/25 transition-all active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>{isSubmitting ? 'Publishing Listing...' : `Publish Product to Catalog (${validImages.length} Image${validImages.length === 1 ? '' : 's'})`}</span>
                </button>
              )}
            </div>
          </form>

          {/* Real-Time Live Preview Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#b7004d]" />
                  <span>Real-Time Catalog Preview</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {Boolean(videoUrl) && (
                    <button
                      type="button"
                      onClick={() => setMediaPreviewMode(mediaPreviewMode === 'video' ? 'image' : 'video')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer ${
                        mediaPreviewMode === 'video'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{mediaPreviewMode === 'video' ? 'Video Mode' : 'View Video'}</span>
                    </button>
                  )}
                  {validImages.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#b7004d]">
                      {validImages.length} Photo{validImages.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Rendering with Multiple Photos & Video Preview */}
              <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs bg-white">
                {/* Main Media Display (Image or Video) */}
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                  {mediaPreviewMode === 'video' && videoUrl ? (
                    getYoutubeVideoId(videoUrl) ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(videoUrl)}?autoplay=1&mute=1`}
                        title="Preview Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : getInstagramCode(videoUrl) ? (
                      <div className="w-full h-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex flex-col items-center justify-center p-4 text-center">
                        <Film className="w-10 h-10 mb-2 animate-pulse" />
                        <span className="text-xs font-black">Instagram Reel Linked</span>
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-[10px] bg-white text-slate-900 font-bold px-3 py-1 rounded-full shadow-xs hover:bg-slate-100"
                        >
                          Open in Instagram ↗
                        </a>
                      </div>
                    ) : (
                      <video
                        src={videoPreviewUrl || videoUrl}
                        controls
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    )
                  ) : currentPreviewImage ? (
                    <img
                      src={currentPreviewImage}
                      alt="Catalog Preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-400 flex flex-col items-center">
                      <Box className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-[11px]">Product Photo Preview</span>
                    </div>
                  )}

                  {/* Stock Tag */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-emerald-700 shadow-xs">
                    {Number(formData.stock || 0) > 0 ? 'In Stock' : 'Draft'}
                  </span>

                  {/* Mode Badge (Photos / Video) */}
                  {mediaPreviewMode === 'video' && videoUrl ? (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Video Playing</span>
                    </span>
                  ) : validImages.length > 1 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white shadow-xs">
                      {activePreviewIndex + 1} / {validImages.length}
                    </span>
                  )}
                </div>

                {/* Multiple Images + Video Thumbnail Strip */}
                {(validImages.length > 1 || Boolean(videoUrl)) && (
                  <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                    {validImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setActivePreviewIndex(i);
                          setMediaPreviewMode('image');
                        }}
                        className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                          mediaPreviewMode === 'image' && activePreviewIndex === i
                            ? 'border-[#d82a62] scale-105 shadow-xs'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}

                    {Boolean(videoUrl) && (
                      <button
                        type="button"
                        onClick={() => setMediaPreviewMode('video')}
                        className={`w-10 h-10 rounded-lg border-2 shrink-0 transition cursor-pointer flex flex-col items-center justify-center ${
                          mediaPreviewMode === 'video'
                            ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                            : 'border-slate-300 bg-slate-900 text-white opacity-80 hover:opacity-100'
                        }`}
                        title="Click to preview Product Video"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-white" />
                        <span className="text-[7px] font-black uppercase tracking-tight">Reel</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-[#b7004d] uppercase tracking-wide bg-pink-50 px-2 py-0.5 rounded-full">
                      {formData.categorySlug || 'Category'}
                    </span>
                    {enableThickness && selectedThickness && (
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-slate-200">
                        <Ruler className="w-2.5 h-2.5 text-slate-500" />
                        <span>{selectedThickness}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {formData.title || 'Product Title Appears Here'}
                  </h4>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-base font-black text-slate-900">
                      ₹{formData.price ? Number(formData.price).toLocaleString('en-IN') : '0.00'}
                    </span>
                    {formData.mrp && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{Number(formData.mrp).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Real-Time Selected Colors Preview */}
                  {enableColors && selectedColors.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Available Colors:</span>
                        <span className="text-[10px] font-semibold text-slate-400">{selectedColors.length} Shade{selectedColors.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedColors.map((col) => {
                          const preset = PRESET_COLORS.find((p) => p.name.toLowerCase() === col.toLowerCase());
                          return (
                            <span
                              key={col}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full"
                              title={col}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                style={{ background: preset?.hex || '#6366f1' }}
                              />
                              <span>{col}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Real-Time Selected Sizes Preview */}
                  {enableSizes && selectedSizes.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sizes / Volume:</span>
                        <span className="text-[10px] font-semibold text-slate-400">{selectedSizes.length} Option{selectedSizes.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectedSizes.map((sz) => (
                          <span
                            key={sz}
                            className="text-[10px] font-bold text-[#b7004d] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md"
                          >
                            {sz}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single Item Stock Preview if variations disabled */}
                  {!enableSizes && !enableColors && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500">Standard Quantity:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {formData.stock || 0} Units Available
                      </span>
                    </div>
                  )}

                  {/* Live Product Highlights Preview */}
                  {specifications.filter((s) => s.label && s.value?.trim()).length > 0 && (
                    <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <span>Product Highlights</span>
                        <span className="text-[9px] uppercase font-bold text-[#b7004d] bg-pink-50 px-2 py-0.5 rounded-full">
                          Live Customer View
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                        {specifications.filter((s) => s.label && s.value?.trim()).map((sp, idx) => (
                          <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="text-slate-400 block text-[9.5px]">{sp.label}</span>
                            <span className="font-bold text-slate-800 truncate block">{sp.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 border-t border-slate-100">
                    {formData.description || 'Product specifications and details will appear here.'}
                  </p>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 text-[11px] text-[#880e4f] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-[#d82a62]" />
                  <span>Instant Multi-Image Catalog:</span>
                </div>
                <p className="text-pink-900/80 leading-relaxed">
                  All photos sync directly to the customer product page carousel and warehouse dropship inventory in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Catalog Mass Import Modal */}
        <BulkCatalogUploadModal
          isOpen={bulkUploadOpen}
          onClose={() => setBulkUploadOpen(false)}
          onSuccess={() => {
            handleNav('/supplier-inventory1');
          }}
        />
      </div>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <DashboardLayout
      menuItems={SUPPLIER_MENU}
      activeTab="add-product"
      onTabChange={handleTabChange}
      roleName="SUPPLIER"
      userName={supplierDisplayName}
      onLogout={() => setShowLogoutConfirm(true)}
    >
      {mainContent}

      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        setIsOpen={setShowLogoutConfirm}
        roleLabel="Supplier"
        onConfirm={performLogout}
      />
    </DashboardLayout>
  );
}
