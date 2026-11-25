import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import { getStoredCustomer, subscribeCustomerAuth } from '../../services/customerAuthService';
import NavDrawer from "../../components/NavDrawer";
import AppBottomNav from "../../components/AppBottomNav";
import {
  getProducts,
  getCategories,
  getWishlist,
  toggleWishlist,
  getBanners,
} from "../../services/ecommerceService";
import { useCart } from "../../hooks/useCart";
import { getUnreadCount, subscribeNotifications } from "../../services/notificationService";
import GuestWelcomeModal from "../../components/customer/GuestWelcomeModal";
import ProductFilterSidebar from "../../components/customer/ProductFilterSidebar";
import CountdownTimer from "../../components/customer/CountdownTimer";
import CustomerFooter from "../../components/customer/CustomerFooter";

const FEATURED_BRAND_LOGOS = [
  { name: 'mamaearth', display: 'mamaearth', color: 'text-emerald-600', icon: '🌿' },
  { name: 'WILD STONE', display: 'WILD STONE', color: 'text-slate-900 dark:text-white' },
  { name: 'plūm', display: 'plūm', color: 'text-purple-700 dark:text-purple-400' },
  { name: 'NIVEA', display: 'NIVEA', color: 'bg-[#002b7f] text-white', isCircleBadge: true },
  { name: 'Himalaya', display: 'Himalaya', sub: 'SINCE 1930', color: 'text-teal-700' },
  { name: 'Mi', display: 'mi', color: 'bg-[#ff6900] text-white', isSquareBadge: true },
  { name: 'Bata', display: 'Bata', color: 'text-red-600 italic font-serif text-lg font-black' },
  { name: 'WOW', display: 'WOW', sub: 'SKIN SCIENCE', color: 'text-slate-900 dark:text-white' },
];

const CURATED_OFFER_TILES = [
  {
    id: 'trending',
    title: 'Trending Now',
    icon: 'trending_up',
    filterTag: 'Trending',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'budget',
    title: 'Budget Buys',
    icon: 'savings',
    filterTag: 'Under ₹349',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'top_rated',
    title: 'Top Rated Picks',
    icon: 'hotel_class',
    filterTag: '4★ & Above',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'daily_essentials',
    title: 'Daily Essentials',
    icon: 'shopping_bag',
    filterTag: 'Essentials',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export default function HomeUserCustomer() {
  const navigate = useNavigate();
  const bannerRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const [banners, setBanners] = useState(() => {
    try {
      const cached = localStorage.getItem('mshoppy_cached_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcat, setSelectedSubcat] = useState("All");
  const [curatedFilter, setCuratedFilter] = useState(null);
  const [sidebarFilters, setSidebarFilters] = useState({
    categories: [],
    gender: null,
    priceRange: null,
    minRating: null,
    colors: [],
    fabrics: [],
    sizes: [],
    minDiscount: null,
    mallOnly: false,
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);

  // ── Newsletter Subscription State ──
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(() => {
    try {
      return Boolean(localStorage.getItem('mshoppy_newsletter_code'));
    } catch (_) { return false; }
  });
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const handleSubscribeNewsletter = (e) => {
    e?.preventDefault();
    const cleanEmail = (newsletterEmail || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setNewsletterLoading(true);
    try {
      const existing = JSON.parse(localStorage.getItem('mshoppy_newsletter_subscribers') || '[]');
      if (!existing.includes(cleanEmail)) {
        existing.push(cleanEmail);
        localStorage.setItem('mshoppy_newsletter_subscribers', JSON.stringify(existing));
      }
      localStorage.setItem('mshoppy_newsletter_code', 'WELCOME10');
      setNewsletterSubscribed(true);
    } catch (_) {
      setNewsletterSubscribed(true);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Lock body scroll when App Download Modal is open
  useEffect(() => {
    if (showAppDownloadModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showAppDownloadModal]);

  const handleFilterChange = (key, value) => {
    setSidebarFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAllFilters = () => {
    setSidebarFilters({
      categories: [],
      gender: null,
      priceRange: null,
      minRating: null,
      colors: [],
      fabrics: [],
      sizes: [],
      minDiscount: null,
      mallOnly: false,
    });
    setSelectedCategory("All");
    setSelectedSubcat("All");
    setCuratedFilter(null);
  };

  const brandCategoriesRef = useRef(null);
  const [canScrollBrandLeft, setCanScrollBrandLeft] = useState(false);
  const [canScrollBrandRight, setCanScrollBrandRight] = useState(true);

  const checkBrandScroll = useCallback(() => {
    if (brandCategoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = brandCategoriesRef.current;
      setCanScrollBrandLeft(scrollLeft > 20);
      setCanScrollBrandRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  }, []);

  const scrollBrandCategories = (direction) => {
    if (brandCategoriesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = brandCategoriesRef.current;
      if (direction === 'right') {
        if (scrollLeft >= scrollWidth - clientWidth - 25) {
          // If at the end, smoothly loop back to start
          brandCategoriesRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          brandCategoriesRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      } else {
        brandCategoriesRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      }
    }
  };

  const handleCuratedFilterClick = (filterTag) => {
    if (curatedFilter === filterTag) {
      setCuratedFilter(null);
    } else {
      setCuratedFilter(filterTag);
      const el = document.getElementById('products-grid-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [products, setProducts] = useState(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem('mshoppy_cached_home_prods') || localStorage.getItem('mshoppy_cached_catalog_prods') || '[]');
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch (_) {}
    return [];
  });
  const [dbCategories, setDbCategories] = useState(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem('mshoppy_cached_cats') || '[]');
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch (_) {}
    return [];
  });
  const [favorites, setFavorites] = useState([]);
  const { cartCount } = useCart();
  const [loading, setLoading] = useState(() => products.length === 0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(() => getUnreadCount());

  // Real Registered Customer User State
  const reduxUser = useSelector((state) => state.user?.currentUser);
  const [currentUser, setCurrentUser] = useState(() => {
    return getStoredCustomer()?.user || reduxUser || null;
  });

  useEffect(() => {
    const unsub = subscribeCustomerAuth((session) => {
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
    });
    return unsub;
  }, []);

  const registeredUser = useMemo(() => {
    if (currentUser?.fullName || currentUser?.name) return currentUser;
    if (reduxUser?.fullName || reduxUser?.name) return reduxUser;
    const stored = getStoredCustomer()?.user;
    if (stored?.fullName || stored?.name) return stored;
    try {
      const raw = localStorage.getItem('mshoppy_customer_user') || localStorage.getItem('mshoppy_reseller_user') || localStorage.getItem('mshoppy_affiliate_user') || localStorage.getItem('mshoppy_kyc_app');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return currentUser || reduxUser || stored || null;
  }, [currentUser, reduxUser]);

  const registeredName = useMemo(() => {
    if (!registeredUser) return null;
    return (
      registeredUser.fullName ||
      registeredUser.name ||
      registeredUser.displayName ||
      (registeredUser.email ? registeredUser.email.split('@')[0] : null) ||
      (registeredUser.phone ? `+91 ${registeredUser.phone.slice(-4)}` : null)
    );
  }, [registeredUser]);

  // Guest Welcome / Login Prompt Modal State
  const [showGuestModal, setShowGuestModal] = useState(false);

  // Helper to check whether visitor has an active authenticated customer session
  const checkIsCustomerLoggedIn = useCallback(() => {
    try {
      const token = localStorage.getItem('mshoppy_customer_token');
      const userStr = localStorage.getItem('mshoppy_customer_user');
      if (token && userStr) {
        const u = JSON.parse(userStr);
        if (u && (u.id || u.uid || u.email || u.phone)) {
          return true;
        }
      }
    } catch (_) {}
    return false;
  }, []);

  // Delayed Guest / Login Prompt (Triggers after 4-5 seconds of exploring the homepage)
  useEffect(() => {
    // 1. If actively logged in as a verified customer, never show modal
    if (checkIsCustomerLoggedIn()) {
      return;
    }

    // 2. Check if already dismissed in this browsing session
    const isDismissed = sessionStorage.getItem('mshoppy_guest_prompt_dismissed') === 'true';
    if (isDismissed) {
      return;
    }

    // 3. Fire after 4.2 seconds of exploring the homepage
    // Mount timer runs smoothly without being cancelled by fluctuating state re-renders
    const timer = setTimeout(() => {
      if (!checkIsCustomerLoggedIn()) {
        setShowGuestModal(true);
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, [checkIsCustomerLoggedIn]);

  const handleContinueAsGuest = useCallback(() => {
    sessionStorage.setItem('mshoppy_guest_prompt_dismissed', 'true');
    localStorage.setItem('mshoppy_guest_mode', 'true');
    setShowGuestModal(false);
  }, []);

  const handleModalLogin = useCallback(() => {
    sessionStorage.setItem('mshoppy_guest_prompt_dismissed', 'true');
    setShowGuestModal(false);
    navigate('/user/login?redirect=' + encodeURIComponent(window.location.pathname || '/'));
  }, [navigate]);
  
  // Real Meesho Infinite Scroll State & Stable Refs
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const loadingRef = useRef(true);
  const sentinelRef = useRef(null);

  pageRef.current = page;
  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;
  loadingRef.current = loading;

  useEffect(() => {
    const unsub = subscribeNotifications(() => {
      setUnreadNotifs(getUnreadCount());
    });
    return unsub;
  }, []);

  // Referral attribution state
  const [activeReferralCode, setActiveReferralCode] = useState(() => {
    try {
      const dismissed = localStorage.getItem('mshoppy_referral_banner_dismissed');
      if (dismissed === 'true') return null;
      const code = localStorage.getItem('mshoppy_referral_code');
      if (code && (code.startsWith('KYC-') || !code.startsWith('MSHOPPY'))) {
        if (code.startsWith('KYC-')) localStorage.removeItem('mshoppy_referral_code');
        return null;
      }
      return code || null;
    } catch {
      return null;
    }
  });

  // 1. Load Categories, Banners & Wishlist on initial mount
  useEffect(() => {
    let isMounted = true;
    async function loadStaticData() {
      try {
        const [catsData, wishData, bannersData] = await Promise.all([
          getCategories(),
          getWishlist(),
          getBanners(),
        ]);

        if (isMounted) {
          if (bannersData && bannersData.length > 0) {
            setBanners(bannersData);
            try { localStorage.setItem('mshoppy_cached_banners', JSON.stringify(bannersData)); } catch (_) {}
          }
          if (catsData && catsData.length > 0) {
            setDbCategories(catsData);
            try { sessionStorage.setItem('mshoppy_cached_cats', JSON.stringify(catsData)); } catch (_) {}
          }
          if (wishData) setFavorites(wishData.map(w => w.productId));
        }
      } catch (err) {
        console.error("Error loading static ecommerce data:", err);
      }
    }
    loadStaticData();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch Products on Initial Mount & whenever Category, Search, or Sidebar Filters change
  useEffect(() => {
    let isMounted = true;
    async function fetchInitialProducts() {
      setLoading(true);
      setLoadingMore(false);
      setPage(1);
      setHasMore(true);
      pageRef.current = 1;
      hasMoreRef.current = true;

      try {
        const targetCategory = selectedCategory === "All" ? "" : selectedCategory;
        const filterCats = sidebarFilters.categories?.length > 0 ? sidebarFilters.categories.join(',') : '';
        const res = await getProducts({
          category: targetCategory,
          search: searchQuery,
          categories: filterCats,
          gender: sidebarFilters.gender || '',
          minPrice: sidebarFilters.priceRange?.min,
          maxPrice: sidebarFilters.priceRange?.max,
          minRating: sidebarFilters.minRating || '',
          minDiscount: sidebarFilters.minDiscount || '',
          sort: sortBy,
          page: 1,
          limit: 28,
          withMeta: true
        });

        if (isMounted) {
          const loadedProds = res.products || [];
          setProducts(loadedProds);
          setTotalProducts(res.total || 0);
          setHasMore(res.hasMore);
          hasMoreRef.current = res.hasMore;
          if (loadedProds.length > 0 && !filterCats && !sidebarFilters.gender) {
            try {
              sessionStorage.setItem('mshoppy_cached_home_prods', JSON.stringify(loadedProds));
              if (!localStorage.getItem('mshoppy_cached_catalog_prods')) {
                localStorage.setItem('mshoppy_cached_catalog_prods', JSON.stringify(loadedProds.slice(0, 24)));
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        console.error("Error loading initial products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    setSelectedSubcat("All");
    fetchInitialProducts();
    return () => { isMounted = false; };
  }, [
    selectedCategory,
    searchQuery,
    sortBy,
    sidebarFilters.categories,
    sidebarFilters.gender,
    sidebarFilters.priceRange,
    sidebarFilters.minRating,
    sidebarFilters.minDiscount,
    sidebarFilters.mallOnly
  ]);

  // 3. Load Next Batch (Infinite Scroll)
  const loadMoreProducts = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current || loadingRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    const nextPage = pageRef.current + 1;
    const targetCategory = selectedCategory === "All" ? "" : selectedCategory;
    const filterCats = sidebarFilters.categories?.length > 0 ? sidebarFilters.categories.join(',') : '';

    try {
      const res = await getProducts({
        category: targetCategory,
        search: searchQuery,
        categories: filterCats,
        gender: sidebarFilters.gender || '',
        minPrice: sidebarFilters.priceRange?.min,
        maxPrice: sidebarFilters.priceRange?.max,
        minRating: sidebarFilters.minRating || '',
        minDiscount: sidebarFilters.minDiscount || '',
        sort: sortBy,
        page: nextPage,
        limit: 28,
        withMeta: true
      });

      if (res.products && res.products.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = res.products.filter(p => !existingIds.has(p.id));
          return [...prev, ...newItems];
        });
        setPage(nextPage);
        pageRef.current = nextPage;
        setHasMore(res.hasMore);
        hasMoreRef.current = res.hasMore;
        setTotalProducts(res.total || 0);
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [
    selectedCategory,
    searchQuery,
    sortBy,
    sidebarFilters.categories,
    sidebarFilters.gender,
    sidebarFilters.priceRange,
    sidebarFilters.minRating,
    sidebarFilters.minDiscount,
    sidebarFilters.mallOnly
  ]);

  // 4. Dual Sentinel (IntersectionObserver + Smooth Window Scroll Listener)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    let observer = null;

    if (sentinel) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current && !loadingRef.current) {
            // Auto-load up to page 2, then let customer click "Load More" so Footer is easily accessible
            if (pageRef.current < 2) {
              loadMoreProducts();
            }
          }
        },
        { rootMargin: '300px' }
      );
      observer.observe(sentinel);
    }

    const handleWindowScroll = () => {
      if (loadingMoreRef.current || !hasMoreRef.current || loadingRef.current) return;
      if (pageRef.current >= 2) return; // Allow customer to easily reach the Footer without endless loop
      const scrollY = window.scrollY || window.pageYOffset;
      const visibleHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;

      if (totalHeight - (scrollY + visibleHeight) < 600) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [loadMoreProducts]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll hero banner carousel dynamically across all active banners
  useEffect(() => {
    if (isBannerPaused || !banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isBannerPaused, banners]);

  const handleToggleFavorite = async (id, e, productObj = null) => {
    e.stopPropagation();
    try {
      setFavorites(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
      await toggleWishlist(id, productObj);
    } catch (err) {
      console.warn("Toggle favorite:", err);
    }
  };

  const handleSearchSubmit = (overrideQuery) => {
    const term = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    setShowSuggestions(false);
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate('/search');
    }
  };

  const defaultCategoryIcons = {
    'All': 'dashboard',
    'Women Ethnic': 'checkroom',
    'Women Western': 'styler',
    'Men': 'man',
    'Kids': 'child_care',
    'Home & Kitchen': 'flatware',
    'Beauty & Health': 'face',
    'Jewellery & Accessories': 'diamond',
    'Footwear': 'steps',
    'Electronics & Gadgets': 'earbuds'
  };

  // Dynamic subcategories from live Database Category query
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') return null;
    return dbCategories.find(c => c.name === selectedCategory || c.slug === selectedCategory);
  }, [dbCategories, selectedCategory]);

  const activeSubcats = useMemo(() => {
    if (!activeCategoryObj) return [];
    return activeCategoryObj.subcategories || ['All'];
  }, [activeCategoryObj]);

  const displayedProducts = useMemo(() => {
    if (!products) return [];
    let list = [...products];

    // 1. Curated offer filter
    if (curatedFilter === 'Under ₹349') {
      list = list.filter((p) => Number(p.price) <= 349);
    } else if (curatedFilter === '4★ & Above') {
      list = list.filter((p) => Number(p.rating || 0) >= 4.0);
    } else if (curatedFilter === 'Trending') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (curatedFilter === 'Essentials') {
      list = list.filter((p) => {
        const cat = (p.category || p.categoryName || '').toLowerCase();
        return cat.includes('home') || cat.includes('kitchen') || cat.includes('beauty') || cat.includes('personal');
      });
    }

    // 2. Subcategory filter
    if (selectedSubcat !== 'All') {
      const term = selectedSubcat.toLowerCase().trim();
      list = list.filter((p) => {
        const pSub = (p.subCategory || '').toLowerCase().trim();
        if (pSub === term) return true;
        if (pSub) return false;
        const full = `${p.title || ''} ${p.description || ''}`.toLowerCase();
        return full.includes(term);
      });
    }

    // 3. Sidebar Categories filter with intelligent category rules & negative exclusions
    if (sidebarFilters.categories?.length > 0) {
      const CATEGORY_DEFINITIONS = {
        'women tops and tunics': {
          targetSlugs: ['women-western'],
          terms: ['top', 'tops', 'tunic', 'tunics', 'crop top', 'peplum'],
          negativeTerms: ['laptop', 'desktop', 'tabletop']
        },
        'women tshirts': {
          targetSlugs: ['women-western'],
          terms: ['tshirt', 't-shirt', 'tee']
        },
        'sarees': {
          targetSlugs: ['women-ethnic'],
          terms: ['saree', 'sari']
        },
        'kurtis': {
          targetSlugs: ['women-ethnic'],
          terms: ['kurti', 'kurta', 'anarkali']
        },
        'blouses': {
          targetSlugs: ['women-ethnic'],
          terms: ['blouse']
        },
        'dresses': {
          targetSlugs: ['women-western'],
          terms: ['dress', 'midi', 'maxi', 'frock', 'gown']
        },
        'perfumes': {
          targetSlugs: ['beauty-health'],
          terms: ['perfume', 'edp', 'fragrance', 'body mist', 'deodorant', 'attar', 'cologne']
        },
        'lipsticks': {
          targetSlugs: ['beauty-health'],
          terms: ['lipstick', 'lip gloss', 'lip balm', 'lip crayon', 'matte lip']
        },
        'hair oil': {
          targetSlugs: ['beauty-health'],
          terms: ['hair oil', 'ayurvedic oil', 'oil']
        },
        'handbags': {
          targetSlugs: ['jewellery', 'accessories'],
          terms: ['handbag', 'tote bag', 'sling bag', 'clutch', 'backpack', 'purse', 'bag', 'tote', 'sling']
        },
        'footwear': {
          targetSlugs: ['footwear'],
          terms: ['shoe', 'chappal', 'sandal', 'loafer', 'sneaker', 'clog', 'flat', 'heel', 'footwear', 'boots', 'slippers']
        },
        'audio & earbuds': {
          targetSlugs: ['electronics'],
          terms: ['earbud', 'headphone', 'tws', 'speaker', 'bluetooth', 'earphone', 'neckband']
        },
        'earrings & studs': {
          targetSlugs: ['jewellery'],
          terms: ['earring', 'stud', 'jhumka', 'jhumki', 'bali']
        },
        'analog watches': {
          targetSlugs: ['jewellery', 'electronics'],
          terms: ['watch', 'analog']
        },
        'bedsheets': {
          targetSlugs: ['home-kitchen'],
          terms: ['bedsheet', 'bed sheet', 'bed cover', 'sheet']
        },
        'fridge covers': {
          targetSlugs: ['home-kitchen'],
          terms: ['fridge cover', 'refrigerator cover']
        },
        'appliance covers': {
          targetSlugs: ['home-kitchen'],
          terms: ['appliance cover', 'washing machine cover', 'cover']
        },
        'caps & hats': {
          targetSlugs: ['men', 'women-western', 'kids'],
          terms: ['cap', 'hat', 'beanie'],
          negativeTerms: ['handicap', 'landscape']
        }
      };

      list = list.filter((p) => {
        const catSlug = (p.categorySlug || p.category?.slug || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        const subCat = (p.subCategory || '').toLowerCase();
        const fullText = `${title} ${subCat}`;

        return sidebarFilters.categories.some((filterCat) => {
          const raw = filterCat.toLowerCase().trim();
          const rule = CATEGORY_DEFINITIONS[raw];

          if (!rule) {
            const fallback = raw.endsWith('s') ? raw.slice(0, -1) : raw;
            return fullText.includes(fallback);
          }

          // If targetSlugs defined, must match categorySlug
          if (rule.targetSlugs && !rule.targetSlugs.includes(catSlug)) {
            return false;
          }

          // If negative terms present (e.g. 'laptop'), reject
          if (rule.negativeTerms?.some((neg) => title.includes(neg))) {
            return false;
          }

          // Must match at least one positive term using word boundary or clean phrase
          return rule.terms.some((term) => {
            const regex = new RegExp(`\\b${term}\\b`, 'i');
            return regex.test(title) || regex.test(subCat) || fullText.includes(term);
          });
        });
      });
    }

    // 4. Gender filter
    if (sidebarFilters.gender) {
      const g = sidebarFilters.gender.toLowerCase().trim();
      list = list.filter((p) => {
        const catName = typeof p.category === 'object' ? (p.category?.name || '') : (p.category || '');
        const slug = (p.categorySlug || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const text = `${title} ${catName} ${slug} ${p.gender || ''} ${desc}`.toLowerCase();

        if (g === 'men') {
          if (slug.startsWith('women')) return false;
          const clean = text.replace(/\bwomen('s)?\b|\bladies\b|\bfemale\b/gi, '');
          return slug === 'men' || slug === 'men-western' || slug === 'men-ethnic' || /\b(men|mens|men's|male|gentlemen)\b/i.test(clean);
        }

        if (g === 'women') {
          return slug.startsWith('women') || slug === 'jewellery' || /\b(women|womens|women's|female|ladies)\b/i.test(text);
        }

        if (g === 'boys' || g === 'boy') {
          return /\b(boys?|boy's)\b/i.test(title) || (slug === 'kids' && !/\b(girls?)\b/i.test(title));
        }

        if (g === 'girls' || g === 'girl') {
          return /\b(girls?|girl's)\b/i.test(title) || (slug === 'kids' && !/\b(boys?)\b/i.test(title));
        }

        return text.includes(g);
      });
    }

    // 5. Price Range filter
    if (sidebarFilters.priceRange) {
      const { min, max } = sidebarFilters.priceRange;
      list = list.filter((p) => {
        const pr = Number(p.price);
        if (min !== undefined && pr < min) return false;
        if (max !== undefined && pr > max) return false;
        return true;
      });
    }

    // 6. Rating filter
    if (sidebarFilters.minRating) {
      list = list.filter((p) => Number(p.rating || 0) >= sidebarFilters.minRating);
    }

    // 7. Colors filter
    if (sidebarFilters.colors?.length > 0) {
      list = list.filter((p) => {
        const text = `${p.title || ''} ${p.color || ''} ${p.description || ''}`.toLowerCase();
        return sidebarFilters.colors.some((c) => text.includes(c.toLowerCase()));
      });
    }

    // 8. Size filter
    if (sidebarFilters.sizes?.length > 0) {
      list = list.filter((p) => {
        const sizes = Array.isArray(p.sizes) ? p.sizes : [p.size].filter(Boolean);
        if (sizes.length === 0) return true;
        return sidebarFilters.sizes.some((s) => sizes.includes(s));
      });
    }

    // 9. Discount filter
    if (sidebarFilters.minDiscount) {
      list = list.filter((p) => Number(p.discountPercentage || 0) >= sidebarFilters.minDiscount);
    }

    // 10. Mall Only filter
    if (sidebarFilters.mallOnly) {
      list = list.filter((p) => p.isMall || p.discountPercentage >= 30 || p.rating >= 4.0);
    }

    // 11. Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === 'popularity') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, selectedSubcat, curatedFilter, sidebarFilters, sortBy]);

  const categoryChips = [
    { name: "All", slug: "All", icon: "dashboard" },
    ...dbCategories.map(c => ({
      name: c.name,
      slug: c.slug,
      icon: defaultCategoryIcons[c.name] || 'sell'
    }))
  ];

  return (
    <div className="bg-[#f8f9fb] font-sans text-[#191c1e] min-h-screen">
      {/* Drawer */}
      <NavDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        role="customer"
        isCustomer={true}
      />

      {/* TopAppBar Header */}
      <header className="sticky top-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-40 shadow-xs">
        <div className="w-full px-3.5 sm:px-6 md:px-10 lg:px-16 py-3 sm:py-4 flex items-center justify-between gap-2">
          {/* Logo & Drawer trigger */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 cursor-pointer shrink-0 transition-transform"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <img 
                src="/mshoppy-logo.png" 
                alt="MShoppy" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105" 
              />
              <span className="text-lg sm:text-2xl font-black text-[#FF3F6C] font-headline tracking-tight whitespace-nowrap">
                MShoppy
              </span>
            </div>
          </div>

          {/* Desktop Search Bar with Auto-Suggest */}
          <div ref={searchContainerRef} className="flex-1 max-w-lg mx-4 lg:mx-6 hidden md:block relative">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="relative flex items-center"
            >
              <button 
                type="submit"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF3F6C] transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full"
                title="Search"
                aria-label="Submit search"
              >
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>

              <input 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                className="w-full bg-[#f2f4f6] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full py-2.5 pl-11 pr-10 focus:ring-2 focus:ring-[#FF3F6C] focus:bg-white dark:focus:bg-slate-900 transition-all text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium shadow-inner" 
                placeholder="Search for Sarees, Kurtis, Electronics & more..." 
                type="text" 
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all text-xs cursor-pointer"
                  title="Clear"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </form>

            {/* Smart Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                    Popular Searches
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Saree", "Kurti", "Denim Jacket", "Sneakers", "Headphones", "Bedsheet"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag);
                          handleSearchSubmit(tag);
                        }}
                        className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-[#FF3F6C]/10 hover:text-[#FF3F6C] text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px] text-slate-400">trending_up</span>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {searchQuery.trim() && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
                      Matching Real Products
                    </span>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {products.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            navigate(`/product?id=${item.id}`);
                          }}
                          className="flex items-center gap-3 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                        >
                          <img
                            src={item.images?.[0] || item.image || ''}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#FF3F6C]">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200">₹{item.price}</span>
                              {item.discountPercentage > 0 && (
                                <span className="text-[#FF3F6C] font-semibold">{item.discountPercentage}% OFF</span>
                              )}
                              <span className="text-emerald-600 font-medium">Free Delivery 🚚</span>
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 group-hover:text-[#FF3F6C] text-sm">
                            chevron_right
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Partner & Merchant Program CTAs (Meesho Style) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/supplier')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#b7004d] hover:bg-pink-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
              title="Sell Online at 0% Commission on MShoppy"
            >
              <span className="material-symbols-outlined text-[17px] text-[#b7004d]">storefront</span>
              <span>Become a Supplier</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/dropshipper')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
              title="Resell products with zero investment and earn margins"
            >
              <span className="material-symbols-outlined text-[17px] text-indigo-600">hub</span>
              <span>Join as Dropshipper</span>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-2.5 shrink-0">
            <button 
              onClick={() => navigate('/notifications')} 
              className="relative text-[#191C1E] dark:text-slate-200 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-2xl">notifications</span>
              {unreadNotifs > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-[#FF3F6C] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/wishlist')} 
              className="relative text-[#191C1E] dark:text-slate-200 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="My Wishlist"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-2xl">favorite</span>
              {favorites.length > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-[#FF3F6C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/cart')} 
              className="relative text-[#191C1E] dark:text-slate-200 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full active:scale-95 duration-200 cursor-pointer" 
              title="Shopping Cart"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-2xl">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-[#b90041] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            {registeredName ? (
              <button
                type="button"
                onClick={() => navigate('/user-dashboard1?tab=profile')}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-3 py-1 bg-rose-50/90 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-slate-700/80 border border-rose-200/90 dark:border-rose-900/60 rounded-full transition-all active:scale-95 cursor-pointer shadow-xs group shrink-0"
                title={`Logged in as ${registeredName} (Click to open profile)`}
              >
                <div className="w-7 h-7 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#FF3F6C] to-rose-500 text-white flex items-center justify-center font-extrabold text-xs uppercase shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  {registeredName.trim().charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[120px] md:max-w-[160px] truncate">
                  {registeredName}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/user/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#FF3F6C] bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer active:scale-95 shrink-0"
                title="Sign In / Register"
              >
                <span className="material-symbols-outlined text-base">person</span>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Active Friend Referral 40% OFF Banner */}
      {activeReferralCode && (
        <div className="bg-gradient-to-r from-rose-600 via-[#9f0038] to-purple-700 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs">
          <div className="flex items-center gap-2 mx-auto">
            <span className="text-base">🎉</span>
            <span>
              Friend Invite Active: <strong>Flat 40% OFF (Up to ₹100)</strong> applied on your 1st order (Code: <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">{activeReferralCode}</span>)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveReferralCode(null);
              try { localStorage.setItem('mshoppy_referral_banner_dismissed', 'true'); } catch (_) {}
            }}
            className="text-white/80 hover:text-white text-xs font-bold px-2 py-0.5 cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 md:pb-12">
        {/* Mobile Search */}
        <div className="md:hidden pt-2 pb-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="relative flex items-center"
          >
            <button 
              type="submit"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF3F6C] transition-colors cursor-pointer flex items-center justify-center p-0.5 rounded-full"
              title="Search"
              aria-label="Submit search"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>

            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f2f4f6] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-[#FF3F6C] outline-none text-slate-900 dark:text-white"
              placeholder="Search sarees, kurtas, jackets..." 
              type="text" 
            />
          </form>
        </div>

        {/* Hero Carousel - Dynamic Backend Banners */}
        <div 
          className="relative mt-2 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm group select-none"
          onMouseEnter={() => setIsBannerPaused(true)}
          onMouseLeave={() => setIsBannerPaused(false)}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out h-48 sm:h-64 md:h-80"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {banners.map((banner, idx) => {
              const bgGradients = [
                'from-rose-600 via-pink-600 to-red-600',
                'from-indigo-700 via-blue-600 to-cyan-600',
                'from-purple-700 via-pink-600 to-rose-600',
                'from-emerald-700 via-teal-600 to-cyan-700'
              ];
              const bannerGrad = banner.gradient || bgGradients[idx % bgGradients.length];
              const badgeLabel = banner.badgeText || banner.badge;
              const btnLabel = banner.buttonText || 'Shop Now';

              return (
                <div 
                  key={banner.id || idx}
                  onClick={() => {
                    if (banner.targetCategory) {
                      setSelectedCategory(banner.targetCategory);
                    } else if (banner.targetUrl) {
                      navigate(banner.targetUrl);
                    }
                  }}
                  className={`w-full shrink-0 relative h-full bg-gradient-to-r ${bannerGrad} flex items-center px-6 sm:px-12 md:px-16 text-white cursor-pointer`}
                >
                  <div className="max-w-md z-10">
                    {badgeLabel && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                          {badgeLabel}
                        </span>
                        {banner.badgeStatus && (
                          <span className="bg-yellow-400 text-slate-900 text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                            {banner.badgeStatus}
                          </span>
                        )}
                      </div>
                    )}
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-headline leading-tight mb-2">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-xs sm:text-sm text-white/90 mb-4 line-clamp-2">
                        {banner.subtitle}
                      </p>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (banner.targetCategory) {
                          setSelectedCategory(banner.targetCategory);
                        } else if (banner.targetUrl) {
                          navigate(banner.targetUrl);
                        }
                      }}
                      className={`bg-white ${banner.accentColor || 'text-rose-600'} font-extrabold px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm hover:bg-rose-50 transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5`}
                    >
                      <span>{btnLabel}</span>
                      <span>➔</span>
                    </button>
                  </div>
                  {banner.imageUrl && (
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title} 
                      className="absolute right-0 top-0 h-full w-1/2 object-cover object-center mask-gradient-left opacity-90 hidden sm:block"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Previous Arrow Button */}
          {banners.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev - 1 + banners.length) % banners.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md z-20"
              aria-label="Previous slide"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
          )}

          {/* Next Arrow Button */}
          {banners.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev + 1) % banners.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md z-20"
              aria-label="Next slide"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          )}
        </div>

        {/* Dots Indicator for dynamic Banners */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-6 bg-[#FF3F6C]' : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Feature Badges */}
        <section className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center text-[#FF3F6C] shrink-0">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Free Delivery</h4>
              <p className="text-[10px] text-slate-400">On all orders</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Cash on Delivery</h4>
              <p className="text-[10px] text-slate-400">Pay when delivered</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 shrink-0">
              <span className="material-symbols-outlined text-xl">autorenew</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">7 Days Return</h4>
              <p className="text-[10px] text-slate-400">Hassle free policy</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 shrink-0">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lowest Prices</h4>
              <p className="text-[10px] text-slate-400">Direct factory rates</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 1: ORIGINAL BRANDS, FEATURED BRANDS & PROMOTIONAL BANNERS (Matching Screenshot 1)
        ========================================================================= */}
        <section className="mt-8 space-y-6">
          {/* 1. Header: Original Brands + VIEW ALL */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-black text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                Original Brands
              </h3>
              <span className="w-5 h-5 rounded-full bg-[#5c3bf5] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
                ✓
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/explorer')}
              className="text-[#9f0038] hover:text-[#78002a] text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>VIEW ALL</span>
              <span className="text-sm">›</span>
            </button>
          </div>

          {/* 2. Original Brands Category Carousel with Left & Right Arrows */}
          <div className="relative group">
            {/* Left Arrow Button on carousel */}
            {canScrollBrandLeft && (
              <button
                type="button"
                onClick={() => scrollBrandCategories('left')}
                className="absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
                aria-label="Previous categories"
              >
                <span className="material-symbols-outlined text-base font-bold">chevron_left</span>
              </button>
            )}

            <div
              ref={brandCategoriesRef}
              onScroll={checkBrandScroll}
              className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
            >
              {(dbCategories || []).filter(c => c.imageUrl || c.image).map((cat) => (
                <div
                  key={cat.id || cat.slug}
                  onClick={() => {
                    setSelectedCategory(cat.name || cat.slug);
                    setSelectedSubcat('All');
                    const el = document.getElementById('products-grid-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-shrink-0 w-28 sm:w-36 md:w-40 rounded-2xl sm:rounded-3xl bg-[#f0f3ff] dark:bg-slate-800/80 border border-indigo-100/70 dark:border-indigo-900/40 p-2 sm:p-2.5 flex flex-col items-center justify-between cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all duration-300 group/card"
                >
                  <div className="w-full aspect-[4/5] rounded-xl overflow-hidden flex items-center justify-center mb-2 bg-white dark:bg-slate-700/50">
                    <img
                      src={cat.imageUrl || cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="w-full bg-[#5838fc] group-hover/card:bg-[#461fe0] text-white text-center py-1.5 sm:py-2 px-2 rounded-xl sm:rounded-2xl shadow-xs transition-colors">
                    <span className="text-[11px] sm:text-xs font-bold tracking-tight block truncate">
                      {cat.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow Button on carousel */}
            <button
              type="button"
              onClick={() => scrollBrandCategories('right')}
              className="absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer z-10 hover:scale-105 active:scale-95"
              aria-label="Next categories"
            >
              <span className="material-symbols-outlined text-base font-bold">chevron_right</span>
            </button>
          </div>

          {/* 3. Featured Brand Logos Strip */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-1 px-2">
              {FEATURED_BRAND_LOGOS.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchQuery(b.name);
                    handleSearchSubmit(b.name);
                  }}
                  className="flex-shrink-0 cursor-pointer flex items-center justify-center transition-all hover:scale-105 select-none"
                  title={`Shop ${b.name}`}
                >
                  {b.isCircleBadge ? (
                    <span className="w-9 h-9 rounded-full bg-[#002b7f] text-white font-black text-[9px] flex items-center justify-center tracking-tighter shadow-xs">
                      {b.display}
                    </span>
                  ) : b.isSquareBadge ? (
                    <span className="w-8 h-8 rounded-lg bg-[#ff6900] text-white font-black text-sm flex items-center justify-center shadow-xs">
                      {b.display}
                    </span>
                  ) : b.sub ? (
                    <div className="text-center leading-tight">
                      <span className={`font-extrabold text-sm sm:text-base ${b.color}`}>
                        {b.display}
                      </span>
                      <span className="block text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                        {b.sub}
                      </span>
                    </div>
                  ) : (
                    <span className={`font-black text-sm sm:text-base tracking-tight ${b.color}`}>
                      {b.display} {b.icon || ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Promotional Banners: Left 35% OFF First Order + Right 4 Curated Category Tiles */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {/* Left Card: 35% OFF on First Order */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-slate-900 relative overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-950/80">
                  Up to
                </span>
                <h4 className="text-4xl sm:text-5xl font-black text-[#85002f] tracking-tight drop-shadow-xs">
                  35% OFF
                </h4>
                <p className="text-sm sm:text-base font-extrabold text-amber-950">
                  on first order
                </p>
                <p className="text-[11px] font-semibold text-amber-900/80">
                  *Only on App
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAppDownloadModal(true)}
                  className="bg-white hover:bg-slate-50 text-slate-900 px-5 py-2.5 rounded-full font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Download Now
                </button>
                <span className="text-[9px] text-amber-950/60 font-semibold">T&amp;C Apply*</span>
              </div>
            </div>

            {/* Right Banner: Purple Gradient with 4 Curated Tiles */}
            <div className="lg:col-span-8 bg-gradient-to-r from-[#5a0044] via-[#750059] to-[#800062] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white relative overflow-hidden flex flex-col justify-center shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {CURATED_OFFER_TILES.map((tile) => (
                  <div
                    key={tile.id}
                    onClick={() => handleCuratedFilterClick(tile.filterTag)}
                    className={`bg-white/10 hover:bg-white/20 backdrop-blur-xs border-2 ${
                      curatedFilter === tile.filterTag ? 'border-amber-300 ring-2 ring-amber-300/50' : 'border-amber-200/50'
                    } rounded-2xl p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] group/tile`}
                  >
                    <div className={`w-full aspect-[4/5] rounded-xl overflow-hidden mb-2 relative bg-gradient-to-br ${tile.gradient || 'from-purple-600 to-indigo-800'} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-3xl sm:text-4xl text-white/90 group-hover/tile:scale-110 transition-transform duration-300">
                        {tile.icon || 'stars'}
                      </span>
                    </div>
                    <div className="w-full bg-white text-slate-900 text-center py-1.5 px-1.5 rounded-xl shadow-xs">
                      <span className="text-[10px] sm:text-xs font-black tracking-tight block truncate">
                        {tile.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Database Categories Bar */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-lg text-[#191c1e] dark:text-slate-100">
              Categories
            </h3>
            <button 
              onClick={() => navigate('/explorer')} 
              className="text-[#b90041] text-xs font-bold uppercase tracking-wider cursor-pointer hover:underline"
            >
              See All
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {categoryChips.map((cat, idx) => (
              <div
                key={idx} 
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  selectedCategory === cat.name 
                    ? 'bg-[#FF3F6C] text-white shadow-lg shadow-[#FF3F6C]/25 scale-105' 
                    : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-[#FF3F6C]/40 text-slate-700 dark:text-slate-300'
                }`}>
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <span className={`text-xs font-medium max-w-[76px] truncate text-center ${selectedCategory === cat.name ? 'font-bold text-[#FF3F6C]' : 'text-slate-700 dark:text-slate-300'}`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
                  {/* Subcategory Filter Chips */}
          {activeSubcats.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3 pb-1">
              {activeSubcats.map((sub, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setSelectedSubcat(sub)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    selectedSubcat === sub
                      ? 'bg-[#FF3F6C] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#FF3F6C]/40'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

        </section>

        {/* =========================================================================
            SECTION 2: PRODUCT LISTING ENHANCEMENTS WITH SIDEBAR FILTERS & COUNTDOWN (Matching Screenshot 2)
        ========================================================================= */}
        <section id="products-grid-section" className="mt-10">
          {/* Header Row: Title on Left, Mobile Filter Trigger & Sort Dropdown on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-headline font-black text-2xl text-[#191c1e] dark:text-slate-100 tracking-tight">
                Products For You
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lowest prices, verified suppliers &amp; top quality products ({displayedProducts.length} items)
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">filter_list</span>
                <span>Filters</span>
              </button>

              {/* Sort By Dropdown (Matching Screenshot 2) */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#9f0038] shadow-2xs cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Rating: High to Low</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Curated Active Filter Pill */}
          {curatedFilter && (
            <div className="flex items-center gap-2 mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-xl text-xs">
              <span className="text-amber-800 dark:text-amber-300 font-bold">
                Active Offer Filter: <strong>{curatedFilter}</strong>
              </span>
              <button
                type="button"
                onClick={() => setCuratedFilter(null)}
                className="text-amber-900 dark:text-amber-200 font-black hover:underline cursor-pointer ml-auto flex items-center gap-1"
              >
                <span>Clear Filter</span>
                <span>✕</span>
              </button>
            </div>
          )}

          {/* 2-Column Responsive Layout: Left Sidebar + Right Products Grid */}
          <div className="flex items-start gap-6">
            {/* Left Filter Sidebar (Matching Screenshot 2) */}
            <ProductFilterSidebar
              filters={sidebarFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAllFilters}
              totalCount={displayedProducts.length}
              isOpen={isMobileFilterOpen}
              onClose={() => setIsMobileFilterOpen(false)}
            />

            {/* Right Main Product Grid Area */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 animate-pulse">
                      <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-800 rounded-xl mb-3"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">inventory_2</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No products found matching selected filters
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try clearing some filters or exploring other categories.
                  </p>
                  <button 
                    onClick={handleClearAllFilters} 
                    className="mt-4 px-4 py-2 text-xs font-bold text-[#b90041] bg-[#b90041]/10 rounded-xl hover:bg-[#b90041]/20 transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {displayedProducts.map((p, idx) => {
                    const isFav = favorites.includes(p.id);
                    const mainImg = (Array.isArray(p.images) && p.images[0]) || p.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500' width='400' height='500'%3E%3Crect width='400' height='500' fill='%23f8fafc'/%3E%3Cpath d='M160 180v-30c0-22.1 17.9-40 40-40s40 17.9 40 40v30h30l20 180H110l20-180h30zm20 0h40v-30c0-11-9-20-20-20s-20 9-20 20v30z' fill='%23cbd5e1'/%3E%3C/svg%3E";
                    const hasOffer = Boolean(Number(p.discountPercentage) >= 40);
                    const isMall = Boolean(p.isMall || (Number(p.discountPercentage) >= 35));

                    return (
                      <div 
                        key={p.id} 
                        className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div 
                          onClick={() => navigate(`/product?id=${p.id}`)} 
                          className="cursor-pointer" 
                          title={`View ${p.title}`}
                        >
                          <div className="aspect-[3/4] rounded-xl overflow-hidden relative mb-2.5 bg-slate-100 dark:bg-slate-800">
                            <img 
                              src={mainImg} 
                              alt={p.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500' width='400' height='500'%3E%3Crect width='400' height='500' fill='%23f8fafc'/%3E%3Cpath d='M160 180v-30c0-22.1 17.9-40 40-40s40 17.9 40 40v30h30l20 180H110l20-180h30zm20 0h40v-30c0-11-9-20-20-20s-20 9-20 20v30z' fill='%23cbd5e1'/%3E%3C/svg%3E";
                              }}
                            />
                            
                            <button 
                              onClick={(e) => handleToggleFavorite(p.id, e, p)}
                              className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer hover:bg-white"
                              title="Wishlist"
                            >
                              <span 
                                className={`material-symbols-outlined text-sm ${isFav ? 'text-[#FF3F6C]' : 'text-slate-400'}`}
                                style={isFav ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                favorite
                              </span>
                            </button>
                          </div>

                          {/* Dynamic Deal Countdown Timer (Matching Screenshot 2 red highlighted timer) */}
                          {hasOffer && (
                            <div className="mb-2">
                              <CountdownTimer
                                productId={p.id}
                                initialHours={4 - (idx % 3)}
                                initialMinutes={31 + (idx * 5) % 25}
                                initialSeconds={22 + (idx * 7) % 35}
                              />
                            </div>
                          )}

                          <div className="px-0.5 min-w-0 space-y-1">
                            <h4 
                              className="text-[11.5px] sm:text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug min-h-[2rem] break-words"
                              title={p.title}
                            >
                              {p.title}
                            </h4>

                            {/* Price, Original Price, Discount & Mall Badge */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                                ₹{p.price}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{p.originalPrice}
                                </span>
                              )}
                              {p.discountPercentage > 0 && (
                                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                                  {p.discountPercentage}% off
                                </span>
                              )}
                              {isMall && (
                                <span className="text-[9px] font-black bg-sky-100 text-sky-800 px-1 py-0.2 rounded-xs ml-auto">
                                  Mall
                                </span>
                              )}
                            </div>

                            {/* Star Rating & Review Count */}
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {p.rating !== undefined && Number(p.rating) > 0 ? (
                                <>
                                  <span className="inline-flex items-center gap-0.5 bg-[#038d63] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    <span>{Number(p.rating).toFixed(1)}</span>
                                    <span className="text-[9px]">★</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium truncate">
                                    {p.reviewsCount !== undefined && Number(p.reviewsCount) > 0 ? `${Number(p.reviewsCount).toLocaleString()} Reviews` : 'Ratings only'}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">No ratings yet</span>
                              )}
                            </div>

                            {/* Delivery Info */}
                            <p className="text-[10px] font-semibold text-slate-500 pt-0.5 flex items-center gap-1">
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Free Delivery</span>
                            </p>
                          </div>
                        </div>

                        {/* Customer Bottom Action */}
                        <div 
                          onClick={() => navigate(`/product?id=${p.id}`)}
                          className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-rose-100/60 transition-colors group/btn mt-2.5"
                        >
                          <span className="text-[10px] font-bold text-[#b90041] uppercase tracking-wider">
                            View Details
                          </span>
                          <span className="material-symbols-outlined text-xs text-[#b90041] group-hover/btn:translate-x-0.5 transition-transform">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Controlled Infinite Scroll: 2 pages (56 products) auto-stream, then explicit Load More button so Footer is easily accessible */}
              {hasMore && page >= 2 ? (
                <div className="w-full py-8 flex flex-col items-center justify-center">
                  <button
                    type="button"
                    onClick={() => loadMoreProducts()}
                    disabled={loadingMore}
                    className="px-8 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#b7004d] dark:text-rose-400 border-2 border-[#b7004d] dark:border-rose-500 rounded-full font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#b7004d] border-t-transparent rounded-full animate-spin"></span>
                        <span>Loading Trending Products...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">expand_more</span>
                        <span>Load More Products</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">
                    Showing {products.length} of {totalProducts || '1,000+'} products
                  </p>
                </div>
              ) : (
                <div ref={sentinelRef} className="w-full py-8 flex flex-col items-center justify-center min-h-[90px]">
                  {loadingMore && (
                    <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-[#b90041] animate-pulse">
                      <span className="material-symbols-outlined text-lg animate-spin text-[#FF3F6C]">progress_activity</span>
                      <span>Loading more trending products for you...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Customer Footer with Newsletter Management */}
      <CustomerFooter onNavigate={navigate} />

      {/* Customer Bottom Navigation */}
      <AppBottomNav activeNav="home" role="customer" homePath="/" />

      {/* Guest Welcome & Login Prompt Modal (Shown after 4-5 seconds for guest exploration) */}
      <GuestWelcomeModal
        isOpen={showGuestModal}
        onClose={handleContinueAsGuest}
        onContinueAsGuest={handleContinueAsGuest}
        onLogin={handleModalLogin}
      />

      {/* App Download Modal for 35% OFF First Order with QR Code (Exact Replica of Meesho Web) */}
      {showAppDownloadModal && (
        <div
          onClick={() => setShowAppDownloadModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 overflow-hidden"
          >
            {/* Modal Header Matching Meesho */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-[#5c0632] dark:text-rose-400">
                Shop Now on App to get Upto 35% off on 1st Order
              </h3>
              <button
                type="button"
                onClick={() => setShowAppDownloadModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-lg font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Content: 2-Column Banner & QR Code Matching Frame 303 */}
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left Column: 35% OFF Promotional Banner */}
              <div className="w-full md:w-[62%] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 bg-[#5c0632]">
                <img
                  src="/meesho_app_modal_banner.jpg"
                  alt="Shop Now on App to get Upto 35% off on 1st Order"
                  className="w-full h-auto object-cover rounded-2xl block"
                />
              </div>

              {/* Right Column: Scan Now to download App + Crisp QR Code */}
              <div className="w-full md:w-[38%] flex flex-col items-center justify-center text-center px-2">
                <h4 className="text-sm sm:text-base font-extrabold text-[#5c0632] dark:text-rose-400 mb-3">
                  Scan Now to download App!
                </h4>
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm inline-block">
                  <QRCodeSVG
                    value="https://play.google.com/store/apps"
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q"
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Download Modal for 35% OFF First Order with QR Code (Exact Replica of Meesho Web) */}
      {showAppDownloadModal && (
        <div
          onClick={() => setShowAppDownloadModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 overflow-hidden"
          >
            {/* Modal Header Matching Meesho */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-[#5c0632] dark:text-rose-400">
                Shop Now on App to get Upto 35% off on 1st Order
              </h3>
              <button
                type="button"
                onClick={() => setShowAppDownloadModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-lg font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Content: 2-Column Banner & QR Code Matching Frame 303 */}
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left Column: 35% OFF Promotional Banner */}
              <div className="w-full md:w-[62%] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 bg-[#5c0632]">
                <img
                  src="/meesho_app_modal_banner.jpg"
                  alt="Shop Now on App to get Upto 35% off on 1st Order"
                  className="w-full h-auto object-cover rounded-2xl block"
                />
              </div>

              {/* Right Column: Scan Now to download App + Crisp QR Code */}
              <div className="w-full md:w-[38%] flex flex-col items-center justify-center text-center px-2">
                <h4 className="text-sm sm:text-base font-extrabold text-[#5c0632] dark:text-rose-400 mb-3">
                  Scan Now to download App!
                </h4>
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm inline-block">
                  <QRCodeSVG
                    value="https://play.google.com/store/apps"
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q"
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
