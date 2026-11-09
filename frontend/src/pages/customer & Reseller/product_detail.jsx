import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  getProductById,
  getProducts,
  getWishlist,
  toggleWishlist,
  checkCanReview
} from '../../services/ecommerceService';
import { useCart } from '../../hooks/useCart';
import { getAffiliateApp } from '../../services/affiliateSessionStore';
import QuickEmailOtpModal from '../../components/auth/QuickEmailOtpModal';

// Category-specific variant configuration & labels
const CATEGORY_META = {
  'women-ethnic': {
    sizeLabel: 'Select Size',
    colorLabel: 'Select Color',
    sizeIcon: 'straighten',
    colorIcon: 'palette',
    hasSizeChart: true,
    sizeChartType: 'women-apparel',
    sizeChartTitle: "Women's Ethnic Size Chart (Inches)",
  },
  'women-western': {
    sizeLabel: 'Select Size',
    colorLabel: 'Select Color',
    sizeIcon: 'straighten',
    colorIcon: 'palette',
    hasSizeChart: true,
    sizeChartType: 'women-apparel',
    sizeChartTitle: "Women's Western Size Chart (Inches)",
  },
  'men': {
    sizeLabel: 'Select Size',
    colorLabel: 'Select Color',
    sizeIcon: 'straighten',
    colorIcon: 'palette',
    hasSizeChart: true,
    sizeChartType: 'men-apparel',
    sizeChartTitle: "Men's Apparel Size Chart (Inches)",
  },
  'kids': {
    sizeLabel: 'Select Age / Size',
    colorLabel: 'Select Color',
    sizeIcon: 'child_care',
    colorIcon: 'palette',
    hasSizeChart: true,
    sizeChartType: 'kids-apparel',
    sizeChartTitle: 'Kids Apparel & Age Guide',
  },
  'footwear': {
    sizeLabel: 'Select Shoe Size (UK/India)',
    colorLabel: 'Select Color',
    sizeIcon: 'footprint',
    colorIcon: 'palette',
    hasSizeChart: true,
    sizeChartType: 'footwear',
    sizeChartTitle: 'Footwear Size Chart (UK/India Sizing)',
  },
  'beauty-health': {
    sizeLabel: 'Select Pack / Net Volume',
    colorLabel: 'Select Shade',
    sizeIcon: 'inventory_2',
    colorIcon: 'brush',
    hasSizeChart: false,
  },
  'home-kitchen': {
    sizeLabel: 'Select Size / Pack',
    colorLabel: 'Select Color / Pattern',
    sizeIcon: 'home',
    colorIcon: 'palette',
    hasSizeChart: false,
  },
  'electronics': {
    sizeLabel: 'Select Storage / Variant',
    colorLabel: 'Select Color',
    sizeIcon: 'memory',
    colorIcon: 'palette',
    hasSizeChart: false,
  },
  'jewellery': {
    sizeLabel: 'Select Size / Set',
    colorLabel: 'Select Polish / Tone',
    sizeIcon: 'diamond',
    colorIcon: 'auto_awesome',
    hasSizeChart: false,
  },
};

const getCategoryMeta = (catSlug) => {
  const slug = (catSlug || '').toLowerCase().trim();
  return CATEGORY_META[slug] || {
    sizeLabel: 'Select Size',
    colorLabel: 'Select Color',
    sizeIcon: 'straighten',
    colorIcon: 'palette',
    hasSizeChart: false,
  };
};

// Rich hex mapping for accurate swatch colors
const COLOR_HEX_MAP = {
  // Classics
  red: '#D32F2F',
  'wine red': '#8B0021',
  wine: '#722F37',
  'deep maroon': '#58111A',
  maroon: '#800000',
  black: '#1C1C1C',
  'classic black': '#1C1C1C',
  'matte black': '#181818',
  white: '#F5F5F5',
  'navy blue': '#002366',
  'royal navy': '#002366',
  navy: '#002366',
  blue: '#1976D2',
  'sky blue': '#4FC3F7',
  'emerald green': '#0B6623',
  green: '#2E7D32',
  'mint green': '#81C784',
  olive: '#556B2F',
  'olive green': '#556B2F',
  yellow: '#FBC02D',
  'mustard yellow': '#DAA520',
  'mustard gold': '#DAA520',
  pink: '#E91E63',
  'baby pink': '#F8BBD0',
  beige: '#D7C4B7',
  grey: '#757575',
  gray: '#757575',
  lavender: '#B39DDB',
  // Footwear & Leather
  brown: '#5D4037',
  'dark brown': '#3E2723',
  tan: '#A1887F',
  'tan brown': '#8D6E63',
  // Metals & Jewellery
  gold: '#D4AF37',
  'gold plated': '#FFD700',
  silver: '#C0C0C0',
  'silver plated': '#DCDCDC',
  'steel silver': '#B0BEC5',
  'rose gold': '#B76E79',
  'oxidised silver': '#708090',
  brass: '#B5A642',
  // Cosmetics & Beauty shades
  nude: '#C89D7C',
  'nude shades': '#C89D7C',
  'nude shade': '#C89D7C',
  peach: '#FFAB91',
  'coral peach': '#FF8A65',
  'ruby red': '#C2185B',
  'pink berry': '#AD1457',
  'plum wine': '#4A154B',
  'mocha brown': '#6D4C41',
};

const resolveColorHex = (colorName) => {
  if (!colorName) return '#FF3F6C';
  const lower = colorName.toLowerCase().trim();
  if (COLOR_HEX_MAP[lower]) return COLOR_HEX_MAP[lower];
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return '#FF3F6C';
};

export default function ProductDetail({ onNavigate = () => {}, onBack }) {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = routeId || searchParams.get('id');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { cartCount, addItem } = useCart();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [canReviewProduct, setCanReviewProduct] = useState(false);
  const [userOrderId, setUserOrderId] = useState(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Dynamic Custom Affiliate Margin Support
  const urlMargin = Number(searchParams.get('margin') || searchParams.get('m') || 0);
  const affiliateMargin = urlMargin > 0 ? urlMargin : Number(localStorage.getItem('mshoppy_affiliate_margin') || 0);
  const effectivePrice = (product?.price || 0) + (affiliateMargin > 0 ? affiliateMargin : 0);

  // Reseller WhatsApp Sharing & Custom Margin State (ONLY active when explicitly visiting in reseller mode from Reseller Hub)
  const isResellerMode = searchParams.get('source') === 'reseller';
  const [selectedResellerMargin, setSelectedResellerMargin] = useState(100);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMode, setShareMode] = useState('with-price'); // 'with-price', 'images-only', 'desc'
  const [copiedLink, setCopiedLink] = useState(false);

  const getReferralCode = () => {
    try {
      const affApp = getAffiliateApp();
      if (affApp?.referralCode) return affApp.referralCode;
      const cust = JSON.parse(localStorage.getItem('mshoppy_customer_user') || '{}');
      if (cust?.fullName) return (cust.fullName.slice(0, 5).toUpperCase() + 'AFF');
    } catch (e) {}
    return 'SHRUTIPAFF';
  };

  const referralCode = getReferralCode();
  const numericResellerMargin = Number(selectedResellerMargin) || 0;
  const resellerSellingPrice = (product?.price || 0) + numericResellerMargin;
  const productShareUrl = `${window.location.origin}/product?id=${product?.id || productId || ''}&ref=${referralCode}&margin=${numericResellerMargin}`;

  const handleShareToWhatsApp = (mode = shareMode) => {
    if (!product) return;
    let msg = '';
    if (mode === 'images-only') {
      msg = `📸 *${product.title}*\n\n✨ Premium Quality Fabric with Exquisite Craftsmanship.\n👉 Order Online: ${productShareUrl}\n\nReply directly with your address to book!`;
    } else if (mode === 'desc') {
      msg = `✨ *${product.title}*\n\nVerified authentic marketplace quality.\nDirect supplier dispatch with Free Shipping!\n\n👉 Order Online: ${productShareUrl}\n\nOr DM directly with your size & address.`;
    } else {
      msg = `✨ *${product.title}*\n\nSpecial Price: ₹${resellerSellingPrice} only (Free Shipping!)\n\n✅ 7-Day Easy Replacement Guarantee\n✅ Cash on Delivery Available\n\n👉 Order directly online:\n${productShareUrl}\n\nOr reply with your address & size to place order!`;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    triggerToast('Shared to WhatsApp successfully!');
  };

  const handleCopyProductShareLink = () => {
    navigator.clipboard.writeText(productShareUrl);
    setCopiedLink(true);
    triggerToast('Referral link with margin copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pincode & Delivery Estimator States - Empty by default, loads from saved address if available
  const [pincode, setPincode] = useState(() => {
    try {
      const savedPin = localStorage.getItem('mshoppy_user_pincode');
      if (savedPin && /^[1-9][0-9]{5}$/.test(savedPin.trim())) return savedPin.trim();
      const savedAddr = localStorage.getItem('mshoppy_selected_address');
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        if (parsed?.pincode && /^[1-9][0-9]{5}$/.test(String(parsed.pincode).trim())) {
          return String(parsed.pincode).trim();
        }
      }
    } catch (e) {}
    return '';
  });

  const [isPincodeValid, setIsPincodeValid] = useState(true);
  const [deliveryEstimate, setDeliveryEstimate] = useState(() => {
    try {
      const savedPin = localStorage.getItem('mshoppy_user_pincode');
      const savedAddr = localStorage.getItem('mshoppy_selected_address');
      let pin = null;
      if (savedPin && /^[1-9][0-9]{5}$/.test(savedPin.trim())) {
        pin = savedPin.trim();
      } else if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        if (parsed?.pincode && /^[1-9][0-9]{5}$/.test(String(parsed.pincode).trim())) {
          pin = String(parsed.pincode).trim();
        }
      }
      if (pin) {
        const d = new Date();
        const daysToAdd = (parseInt(pin.slice(-1), 10) % 3) + 2; // 2 to 4 days
        d.setDate(d.getDate() + daysToAdd);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      }
    } catch (e) {}
    return null;
  });

  // Similar Products States
  const [similarProducts, setSimilarProducts] = useState([]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handlePincodeCheck = (e) => {
    if (e) e.preventDefault();
    const cleanPin = pincode ? pincode.trim() : '';
    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      triggerToast('Please enter a valid 6-digit Indian Pincode');
      setIsPincodeValid(false);
      setDeliveryEstimate(null);
      return;
    }
    setIsPincodeValid(true);
    const d = new Date();
    const daysToAdd = (parseInt(cleanPin.slice(-1), 10) % 3) + 2; // 2 to 4 days
    d.setDate(d.getDate() + daysToAdd);
    const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    setDeliveryEstimate(dateStr);
    try {
      localStorage.setItem('mshoppy_user_pincode', cleanPin);
    } catch (err) {}
    triggerToast(`✓ Delivery available by ${dateStr}! Free Delivery & COD active.`);
  };

  // Fetch product & similar items from database
  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setLoading(true);
      try {
        let p = null;
        if (productId) {
          p = await getProductById(productId);
        }
        if (!p) {
          const prods = await getProducts({ limit: 1 });
          if (prods && prods.length > 0) {
            p = prods[0];
          }
        }

        if (isMounted && p) {
          setProduct(p);
          setSelectedSize(Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes[0] : '');
          if (Array.isArray(p.colors) && p.colors.length > 0) {
            setSelectedColor(p.colors[0]);
          } else {
            setSelectedColor('');
          }

          // Fetch similar products in same category
          if (p.categorySlug) {
            getProducts({ category: p.categorySlug, limit: 8 })
              .then((sim) => {
                if (isMounted && sim) {
                  setSimilarProducts(sim.filter((item) => item.id !== p.id));
                }
              })
              .catch(() => {});
          }

          // Check if current user has wishlisted this product
          try {
            const rawWish = localStorage.getItem('mshoppy_wishlist');
            if (rawWish) {
              const list = JSON.parse(rawWish);
              if (Array.isArray(list) && list.some(w => (w.productId || w.id || w.product?.id) === p.id)) {
                setIsWishlisted(true);
              }
            }
          } catch (e) {}

          getWishlist().then(wish => {
            if (isMounted && Array.isArray(wish)) {
              const inWish = wish.some(w => (w.productId || w.id || w.product?.id) === p.id);
              setIsWishlisted(inWish);
            }
          }).catch(() => {});

          // Check if current user has received this product (orderStatus === DELIVERED)
          checkCanReview(p.id)
            .then((elig) => {
              if (isMounted && elig) {
                setCanReviewProduct(Boolean(elig.canReview));
                setUserOrderId(elig.deliveredOrder?.id || null);
                setHasUserReviewed(Boolean(elig.hasReviewed));
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProduct();
    return () => { isMounted = false; };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const sizeToPass = selectedSize || (Array.isArray(product.sizes) && product.sizes[0]) || 'Free Size';
      await addItem(product.id, 1, sizeToPass, product);

      const catMeta = getCategoryMeta(product.categorySlug);
      const details = [];
      if (selectedSize) details.push(`${catMeta.sizeLabel || 'Size'}: ${selectedSize}`);
      if (selectedColor) details.push(`${catMeta.colorLabel || 'Color'}: ${selectedColor}`);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';

      triggerToast(`Added to Cart!${detailsStr} 🛒`);
    } catch (err) {
      console.warn('Add to Cart fallback notice:', err);
      triggerToast('Added to Cart! 🛒');
    } finally {
      setAddingToCart(false);
    }
  };

  const isUserAuthenticated = () => {
    try {
      const raw = localStorage.getItem('mshoppy_customer_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.email && !u.email.endsWith('@customer.meesho') && !u.isOfflineFallback) return true;
      }
      const token = localStorage.getItem('mshoppy_customer_token');
      if (token && raw) return true;
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!isUserAuthenticated()) {
      setShowLoginModal(true);
      return;
    }
    proceedWithBuyNow();
  };

  const proceedWithBuyNow = async () => {
    const sizeToPass = selectedSize || (Array.isArray(product.sizes) && product.sizes[0]) || 'Free Size';
    const buynowItem = {
      id: 'buynow_' + product.id,
      productId: product.id,
      quantity: 1,
      size: sizeToPass,
      product: product
    };
    try {
      localStorage.setItem('mshoppy_buynow_item', JSON.stringify(buynowItem));
    } catch (e) {}
    try {
      await addItem(product.id, 1, sizeToPass, product);
    } catch (err) {
      console.warn('Buy Now addItem fallback:', err);
    }
    if (onNavigate) {
      onNavigate('address');
    } else {
      navigate('/address');
    }
  };

  const handleShareProduct = () => {
    if (!product) return;
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on MShoppy at ₹${product.price}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('Product link copied to clipboard! 📋');
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    try {
      await toggleWishlist(product.id, product);
      triggerToast(nextState ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
    } catch (e) {
      triggerToast(nextState ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f8f9fb] min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF3F6C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#f8f9fb] min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">error</span>
        <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">The requested product is currently unavailable.</p>
        <button
          onClick={() => (onBack ? onBack() : navigate('/user-home'))}
          className="px-5 py-2.5 bg-[#FF3F6C] text-white rounded-full font-bold text-xs shadow-md cursor-pointer"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800'];

  const catMeta = getCategoryMeta(product.categorySlug);

  const sizes = (Array.isArray(product.sizes) && product.sizes.length > 0)
    ? product.sizes
    : [];

  // Only resolve colors if the product actually provides them (never force dummy clothing colors)
  const colorOptions = (Array.isArray(product.colors) && product.colors.length > 0)
    ? product.colors.map((c) => ({
        name: c,
        hex: resolveColorHex(c),
      }))
    : [];

  // Size chart is only relevant for wearable apparel/footwear with true sizing
  const showSizeChartBtn = Boolean(
    catMeta.hasSizeChart &&
    sizes.length > 0 &&
    !sizes.every((s) => s.toLowerCase().includes('pack') || s.toLowerCase().includes('ml'))
  );

  return (
    <div className="bg-[#f8f9fb] text-[#191c1e] min-h-screen font-sans antialiased selection:bg-pink-100 selection:text-pink-600">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#008644] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3.5 w-full bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : navigate('/user-home'))}
            className="p-1.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all text-[#191C1E] cursor-pointer"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div 
            onClick={() => navigate('/user-home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <img 
              src="/mshoppy-logo.png" 
              alt="MShoppy" 
              className="w-7 h-7 object-contain rounded-lg" 
            />
            <span className="font-extrabold text-lg md:text-xl tracking-tight text-[#FF3F6C]">
              MShoppy
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-full hover:bg-gray-100 text-[#191C1E] active:scale-95 transition-all cursor-pointer"
            title="Search Products"
          >
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all cursor-pointer ${
              isWishlisted ? 'text-[#FF3F6C]' : 'text-[#191C1E]'
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="p-2 rounded-full hover:bg-gray-100 text-[#191C1E] active:scale-95 transition-all cursor-pointer relative"
            title="Shopping Cart"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#b90041] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pb-36 max-w-4xl mx-auto px-4 pt-4 md:pt-6">
        {/* Full Uncropped Image Presentation */}
        <section className="relative bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Main Photo Container - Full view with object-contain to avoid any cropping */}
          <div className="relative w-full aspect-[4/5] max-h-[560px] bg-white flex items-center justify-center p-2 sm:p-4 select-none">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.title}
              className="w-full h-full max-h-[540px] object-contain rounded-2xl transition-all duration-300 cursor-zoom-in"
              onClick={() => setShowImageZoom(true)}
              title="Click to Zoom Full Photo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800';
              }}
            />

            {/* Floating Top Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setShowImageZoom(true)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer hover:bg-white text-slate-700"
                title="Zoom Full Photo"
              >
                <span className="material-symbols-outlined text-xl">zoom_in</span>
              </button>
              <button
                onClick={handleShareProduct}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer hover:bg-white text-[#FF3F6C]"
                title="Share Product"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
            </div>

            {/* Dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      selectedImageIndex === idx ? 'w-5 bg-[#FF3F6C]' : 'w-2 bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Preview Bar */}
          {images.length > 1 && (
            <div className="flex gap-2.5 p-3 bg-slate-50 border-t border-slate-100 overflow-x-auto no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 bg-white p-0.5 ${
                    selectedImageIndex === idx
                      ? 'border-[#FF3F6C] shadow-md scale-102 ring-1 ring-[#FF3F6C]'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.title} view ${idx + 1}`} 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Product Hero Info */}
        <section className="pt-5 pb-4">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[#006a34] font-bold text-xs tracking-wider uppercase bg-green-50 px-3 py-1 rounded-full border border-green-200">
              {product.category?.name || 'Verified Collection'}
            </span>
            {product.rating > 0 && product.reviewsCount > 0 && (
              <button
                type="button"
                onClick={() => onNavigate(`/reviews?productId=${product.id}`)}
                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl cursor-pointer transition-colors"
                title="View Ratings & Reviews"
              >
                <span
                  className="material-symbols-outlined text-emerald-600 text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-xs font-black text-emerald-800">{product.rating}</span>
                <span className="text-[10px] text-slate-500 font-medium">({product.reviewsCount} Ratings) ➔</span>
              </button>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-black tracking-tight mb-1.5 text-slate-900 leading-snug">
            {product.title}
          </h1>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Sold by:</span>
            <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <span>{(product.supplierName && !product.supplierName.toLowerCase().includes('meesho')) ? product.supplierName : 'Official Store'}</span>
              <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
              <span className="text-[10px] bg-white text-slate-700 font-bold px-1.5 py-0.2 rounded-full border border-slate-200">★ 4.8</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs mb-4 space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                ₹{effectivePrice}
              </span>
              {product.originalPrice && (product.originalPrice + (affiliateMargin > 0 ? affiliateMargin : 0)) > effectivePrice && (
                <span className="text-base sm:text-lg text-slate-400 line-through">
                  ₹{product.originalPrice + (affiliateMargin > 0 ? affiliateMargin : 0)}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-[#FF3F6C] font-black text-sm sm:text-base">
                  {product.discountPercentage}% OFF
                </span>
              )}

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Free Delivery 🚚
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600 flex-wrap">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Cash on Delivery (COD) Available
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Easy 7 Days Return / Exchange
              </span>
            </div>
          </div>

          {/* Reseller Profit Margin & WhatsApp Share Card (Visible ONLY in Reseller Mode, never to normal customers) */}
          {isResellerMode && (
          <div className="bg-gradient-to-r from-emerald-50 via-green-50/70 to-emerald-50/50 border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-5">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>Resell on WhatsApp &amp; Earn Profit</span>
                    <span className="text-[10px] font-bold bg-[#25D366] text-white px-2 py-0.2 rounded-full">Reseller Hub</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Add your profit margin • We ship directly to your buyer • Margin credited on delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Margin Presets & Direct Share CTA */}
            <div className="bg-white rounded-xl p-3 border border-emerald-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
              <div className="w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600 block mb-1">Set Your Margin:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[50, 100, 150, 200, 300].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedResellerMargin(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        selectedResellerMargin === m
                          ? 'bg-[#25D366] text-white shadow-sm scale-105'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      +₹{m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Selling Price</span>
                  <span className="text-sm font-black text-slate-900">₹{resellerSellingPrice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleShareToWhatsApp('with-price')}
                  className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white px-3.5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                  title="Share to WhatsApp Now"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Share WhatsApp</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 px-1 text-xs">
              <button
                type="button"
                onClick={handleCopyProductShareLink}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">{copiedLink ? 'check' : 'content_copy'}</span>
                <span>{copiedLink ? 'Link Copied!' : 'Copy Tracked Referral Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(`/share-earn-config?id=${product?.id || productId}`)}
                className="text-slate-600 hover:text-[#b90041] font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Reseller Studio</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
          )}

          {/* Delivery & Pincode Checker Card (Meesho Core Feature) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs mb-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF3F6C] text-lg">local_shipping</span>
                <h3 className="font-bold text-sm text-slate-900">Delivery &amp; Serviceability</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Free Delivery
              </span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <span className="material-symbols-outlined text-base">pin_drop</span>
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPincode(val);
                    if (!isPincodeValid) setIsPincodeValid(true);
                    if (val.length < 6 && deliveryEstimate) {
                      setDeliveryEstimate(null);
                    }
                  }}
                  placeholder="Enter 6-digit Pincode"
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono font-bold rounded-xl border bg-slate-50 outline-none transition-all ${
                    isPincodeValid ? 'border-slate-200 focus:border-[#FF3F6C] focus:bg-white' : 'border-rose-400 bg-rose-50'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF3F6C] hover:bg-[#e0355f] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                {deliveryEstimate ? 'Change' : 'Check'}
              </button>
            </form>

            {deliveryEstimate ? (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">schedule</span>
                  <span>Estimated Delivery by <strong className="text-emerald-700">{deliveryEstimate}</strong></span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-emerald-600 text-xs">check_circle</span>
                    COD Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-emerald-600 text-xs">verified</span>
                    Dispatched in 1 Day
                  </span>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="material-symbols-outlined text-slate-400 text-xs">info</span>
                <span>Enter 6-digit pincode to check exact delivery date &amp; COD availability</span>
              </div>
            )}
          </div>

          {/* Color / Shade Selection Section - Only rendered if product has color variants */}
          {colorOptions.length > 0 && (
            <div className="mb-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF3F6C] text-lg">
                    {catMeta.colorIcon || 'palette'}
                  </span>
                  <h3 className="font-black text-sm text-slate-900">
                    {catMeta.colorLabel || 'Select Color'}
                  </h3>
                </div>
                {selectedColor && (
                  <span className="text-xs font-bold text-[#b90041] bg-pink-50 px-2.5 py-0.5 rounded-full">
                    {selectedColor}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {colorOptions.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        triggerToast(`${catMeta.colorLabel || 'Selected Color'}: ${c.name}`);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#b90041] text-white shadow-md shadow-pink-500/25 scale-102'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <span className="text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size / Pack / Volume Selection Section - Only rendered if product has sizes */}
          {sizes.length > 0 && (
            <div className="mb-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF3F6C] text-lg">
                    {catMeta.sizeIcon || 'straighten'}
                  </span>
                  <h3 className="font-black text-sm text-slate-900">
                    {catMeta.sizeLabel || 'Select Size'}
                  </h3>
                </div>
                {showSizeChartBtn && (
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="text-[#FF3F6C] text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Size Chart</span>
                    <span className="material-symbols-outlined text-sm">help</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        triggerToast(`${catMeta.sizeLabel || 'Selected Size'}: ${size}`);
                      }}
                      className={`min-w-[54px] px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#4d41df] text-white shadow-md shadow-indigo-500/25 scale-102'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{size}</span>
                      {isSelected && <span className="text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Description */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-xs mb-5 space-y-3">
            <h3 className="font-black text-sm text-slate-900">Product Details &amp; Specifications</h3>
            <p className="text-xs md:text-sm leading-relaxed text-slate-600 whitespace-pre-line">
              {product.description || 'Premium quality verified product directly from manufacturer. Perfect finish, breathable fabric, and durable stitching.'}
            </p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 bg-white rounded-3xl p-4 md:p-5 shadow-xs border border-slate-100 mb-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#006a34]">
                <span className="material-symbols-outlined text-xl">replay</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">
                7 Days Easy Return
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#006a34]">
                <span className="material-symbols-outlined text-xl">local_shipping</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">
                Free Delivery
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#006a34]">
                <span className="material-symbols-outlined text-xl">verified_user</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">
                Quality Assured
              </span>
            </div>
          </div>

          {/* Customer Ratings & Reviews Card */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-xs mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <span>Product Ratings &amp; Reviews</span>
                  {product.reviewsCount > 0 && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      ★ {product.rating}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {product.reviewsCount > 0
                    ? `${product.reviewsCount} Ratings • Verified Buyers`
                    : 'No ratings yet • Verified buyers can rate after delivery'}
                </p>
              </div>

              {product.reviewsCount > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate(`/reviews?productId=${product.id}`)}
                  className="text-[#b90041] hover:text-[#900030] text-xs font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>

            {/* Quick action to write review - ONLY VISIBLE IF PRODUCT IS DELIVERED AND NOT YET REVIEWED */}
            {canReviewProduct && !hasUserReviewed && (
              <div className="p-3.5 bg-[#fdf2f5] rounded-2xl flex items-center justify-between gap-3 border border-pink-100 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#b90041] text-xl">rate_review</span>
                  <div className="text-xs">
                    <p className="font-extrabold text-[#b90041]">
                      You bought this item!
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Order delivered! Rate quality, fit and delivery
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/write-review?productId=${product.id}${userOrderId ? `&orderId=${userOrderId}` : ''}`
                    )
                  }
                  className="bg-[#b90041] hover:bg-[#900030] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  Rate Product
                </button>
              </div>
            )}
          </div>

          {/* Similar Products Recommendation Carousel (Meesho Core Feature) */}
          {similarProducts.length > 0 && (
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-xs mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#FF3F6C] text-lg">auto_awesome</span>
                    <span>Similar Products</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Customers also viewed these items</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/search?category=${product.categorySlug}`)}
                  className="text-xs font-bold text-[#b90041] hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {similarProducts.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => {
                      navigate(`/product?id=${sim.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-36 sm:w-44 shrink-0 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 cursor-pointer hover:shadow-md hover:border-pink-300 transition-all group"
                  >
                    <div className="w-full aspect-[4/5] bg-white rounded-xl overflow-hidden mb-2 p-1">
                      <img
                        src={sim.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'}
                        alt={sim.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                        }}
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{sim.title}</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-black text-slate-900">₹{sim.price}</span>
                      {sim.originalPrice && sim.originalPrice > sim.price && (
                        <span className="text-[10px] text-slate-400 line-through">₹{sim.originalPrice}</span>
                      )}
                    </div>
                    <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 mt-1">
                      Free Delivery
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Actions Bar - Customer + Reseller WhatsApp Share */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-3 sm:px-4 py-3 border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          {/* WhatsApp Share & Earn Button (ONLY visible in Reseller Mode, never to normal customers) */}
          {isResellerMode && (
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl py-3.5 px-3.5 sm:px-5 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer shrink-0"
            title="Share on WhatsApp with Margin"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="hidden sm:inline">Share &amp; Earn ₹{selectedResellerMargin}</span>
            <span className="sm:hidden">Share &amp; Earn</span>
          </button>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-slate-300 hover:border-[#b90041] text-slate-800 hover:text-[#b90041] rounded-2xl py-3.5 font-black text-xs sm:text-sm active:scale-95 transition-all cursor-pointer bg-white"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            <span className="truncate">{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] hover:from-[#e0355f] hover:to-[#c71e4d] text-white flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl py-3.5 font-black text-xs sm:text-sm shadow-xl shadow-pink-500/25 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>

      {/* Quick Email OTP Login Modal for Guest Buy Now */}
      <QuickEmailOtpModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          proceedWithBuyNow();
        }}
        actionTitle="Login to Buy This Product"
        actionSubtitle="Enter your email to receive an instant 6-digit login OTP"
      />

      {/* Full-Screen Image Zoom Lightbox Modal */}
      {showImageZoom && (
        <div 
          onClick={() => setShowImageZoom(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-5 right-5 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <img
            src={images[selectedImageIndex] || images[0]}
            alt={product.title}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000';
            }}
          />
        </div>
      )}



      {/* Size Chart Modal - Dynamically adapted to Apparel / Footwear */}
      {showSizeChart && (
        <div 
          onClick={() => setShowSizeChart(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {catMeta.sizeChartTitle || 'Standard Sizing Guide'}
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  All measurements are in standard Indian / International units
                </p>
              </div>
              <button
                onClick={() => setShowSizeChart(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {catMeta.sizeChartType === 'footwear' ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2.5">UK / India</th>
                    <th className="p-2.5">US Size</th>
                    <th className="p-2.5">EU Size</th>
                    <th className="p-2.5">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr><td className="p-2.5 font-bold text-[#b90041]">5 UK</td><td className="p-2.5">6</td><td className="p-2.5">38</td><td className="p-2.5">24.2 cm</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">6 UK</td><td className="p-2.5">7</td><td className="p-2.5">39 / 40</td><td className="p-2.5">25.0 cm</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">7 UK</td><td className="p-2.5">8</td><td className="p-2.5">41</td><td className="p-2.5">25.8 cm</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">8 UK</td><td className="p-2.5">9</td><td className="p-2.5">42</td><td className="p-2.5">26.6 cm</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">9 UK</td><td className="p-2.5">10</td><td className="p-2.5">43</td><td className="p-2.5">27.5 cm</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">10 UK</td><td className="p-2.5">11</td><td className="p-2.5">44</td><td className="p-2.5">28.3 cm</td></tr>
                </tbody>
              </table>
            ) : catMeta.sizeChartType === 'men-apparel' ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Chest (Inches)</th>
                    <th className="p-2.5">Shoulder (Inches)</th>
                    <th className="p-2.5">Length (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr><td className="p-2.5 font-bold text-[#b90041]">S (38)</td><td className="p-2.5">38"</td><td className="p-2.5">16.5"</td><td className="p-2.5">28"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">M (40)</td><td className="p-2.5">40"</td><td className="p-2.5">17.5"</td><td className="p-2.5">29"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">L (42)</td><td className="p-2.5">42"</td><td className="p-2.5">18.5"</td><td className="p-2.5">30"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">XL (44)</td><td className="p-2.5">44"</td><td className="p-2.5">19.5"</td><td className="p-2.5">30.5"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">XXL (46)</td><td className="p-2.5">46"</td><td className="p-2.5">20.5"</td><td className="p-2.5">31"</td></tr>
                </tbody>
              </table>
            ) : catMeta.sizeChartType === 'kids-apparel' ? (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2.5">Age Group</th>
                    <th className="p-2.5">Height</th>
                    <th className="p-2.5">Chest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr><td className="p-2.5 font-bold text-[#b90041]">0-6 Months</td><td className="p-2.5">60 - 68 cm</td><td className="p-2.5">18"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">6-12 Months</td><td className="p-2.5">68 - 80 cm</td><td className="p-2.5">20"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">1-2 Years</td><td className="p-2.5">80 - 92 cm</td><td className="p-2.5">21"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">2-3 Years</td><td className="p-2.5">92 - 98 cm</td><td className="p-2.5">22"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">3-4 Years</td><td className="p-2.5">98 - 104 cm</td><td className="p-2.5">23"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">5-6 Years</td><td className="p-2.5">110 - 116 cm</td><td className="p-2.5">24"</td></tr>
                </tbody>
              </table>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Bust (Inches)</th>
                    <th className="p-2.5">Waist (Inches)</th>
                    <th className="p-2.5">Length (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr><td className="p-2.5 font-bold text-[#b90041]">Free Size</td><td className="p-2.5">38 - 42</td><td className="p-2.5">32 - 38</td><td className="p-2.5">5.5 Meters (Saree)</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">XS</td><td className="p-2.5">32 - 34</td><td className="p-2.5">26 - 28</td><td className="p-2.5">39"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">S</td><td className="p-2.5">34 - 36</td><td className="p-2.5">28 - 30</td><td className="p-2.5">40"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">M</td><td className="p-2.5">36 - 38</td><td className="p-2.5">30 - 32</td><td className="p-2.5">41"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">L</td><td className="p-2.5">38 - 40</td><td className="p-2.5">32 - 34</td><td className="p-2.5">42"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">XL</td><td className="p-2.5">40 - 42</td><td className="p-2.5">34 - 36</td><td className="p-2.5">43"</td></tr>
                  <tr><td className="p-2.5 font-bold text-[#b90041]">XXL</td><td className="p-2.5">42 - 44</td><td className="p-2.5">36 - 38</td><td className="p-2.5">44"</td></tr>
                </tbody>
              </table>
            )}

            <button
              onClick={() => setShowSizeChart(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reseller WhatsApp Share & Profit Margin Configuration Modal */}
      {showShareModal && (
        <div 
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Share on WhatsApp</h3>
                  <p className="text-[11px] text-slate-400">Set margin and share to your customers</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Product Summary */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
              <img 
                src={images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'} 
                alt={product?.title}
                className="w-14 h-14 rounded-xl object-contain bg-white shrink-0 border border-slate-100" 
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{product?.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Supplier Price: <span className="font-bold text-slate-800">₹{product?.price}</span></p>
                <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md font-bold mt-1">Free Delivery Included</span>
              </div>
            </div>

            {/* Profit Margin Control */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">Your Profit Margin</label>
                <span className="text-xs font-black text-emerald-600">+₹{selectedResellerMargin} Profit</span>
              </div>
              <div className="flex gap-2">
                {[50, 100, 150, 200, 300].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedResellerMargin(m)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedResellerMargin === m 
                        ? 'bg-[#25D366] text-white shadow-md' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +₹{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Price Preview */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-emerald-500/20">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-90 block">Customer Selling Price</span>
                <span className="text-2xl font-black">₹{resellerSellingPrice}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] opacity-80 block">Your Direct Earning</span>
                <span className="text-base font-extrabold bg-white/20 px-2.5 py-0.5 rounded-lg inline-block mt-0.5">₹{selectedResellerMargin}</span>
              </div>
            </div>

            {/* Share Mode Selection */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">What to share:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'with-price', label: 'With Price' },
                  { id: 'desc', label: 'Description' },
                  { id: 'images-only', label: 'Only Images' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setShareMode(mode.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      shareMode === mode.id
                        ? 'bg-[#b90041] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleShareToWhatsApp(shareMode);
                  setShowShareModal(false);
                }}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Share to WhatsApp Now</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyProductShareLink}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">{copiedLink ? 'check' : 'content_copy'}</span>
                  <span>{copiedLink ? 'Copied!' : 'Copy Referral Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    navigate(`/share-earn-config?id=${product?.id || productId}`);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[#b90041] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  <span>Studio Options</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}