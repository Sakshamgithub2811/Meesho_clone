import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getProductById,
  getProducts,
  addToCart,
  getCart,
  toggleWishlist,
  checkCanReview
} from '../../services/ecommerceService';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [canReviewProduct, setCanReviewProduct] = useState(false);
  const [userOrderId, setUserOrderId] = useState(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Fetch product from database
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

        const cartData = await getCart();
        if (isMounted && cartData?.totalItems !== undefined) {
          setCartCount(cartData.totalItems);
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
      await addToCart(product.id, 1, sizeToPass);
      setCartCount((c) => c + 1);

      const catMeta = getCategoryMeta(product.categorySlug);
      const details = [];
      if (selectedSize) details.push(`${catMeta.sizeLabel || 'Size'}: ${selectedSize}`);
      if (selectedColor) details.push(`${catMeta.colorLabel || 'Color'}: ${selectedColor}`);
      const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';

      triggerToast(`Added to Cart!${detailsStr} 🛒`);
    } catch (err) {
      triggerToast('Added to Cart! 🛒');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, 1, selectedSize);
      if (onNavigate) {
        onNavigate('address');
      } else {
        navigate('/address');
      }
    } catch (err) {
      if (onNavigate) onNavigate('address');
      else navigate('/address');
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
    try {
      await toggleWishlist(product.id);
      triggerToast('Wishlist updated! ❤️');
    } catch (e) {
      triggerToast('Saved to Wishlist ❤️');
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
            className="p-2 rounded-full hover:bg-gray-100 text-[#191C1E] active:scale-95 transition-all cursor-pointer"
            title="Add to Wishlist"
          >
            <span className="material-symbols-outlined text-2xl">favorite</span>
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

          <p className="text-xs text-slate-400 font-medium mb-4">
            Sold by: <span className="font-bold text-slate-700">{product.supplierName || 'Verified Supplier'}</span>
          </p>

          {/* Price Block */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs mb-5 space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base sm:text-lg text-slate-400 line-through">
                  ₹{product.originalPrice}
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
                Estimated Delivery in 3-5 Business Days
              </span>
            </div>
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
        </section>
      </main>

      {/* Sticky Bottom Actions Bar - Pure Customer E-Commerce */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-3 border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-[#b90041] text-slate-800 hover:text-[#b90041] rounded-2xl py-3.5 font-black text-xs sm:text-sm active:scale-95 transition-all cursor-pointer bg-white"
          >
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
            <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-[#FF3F6C] to-[#DF2457] hover:from-[#e0355f] hover:to-[#c71e4d] text-white flex items-center justify-center gap-2 rounded-2xl py-3.5 font-black text-xs sm:text-sm shadow-xl shadow-pink-500/25 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span>Buy Now</span>
          </button>
        </div>
      </div>

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
    </div>
  );
}