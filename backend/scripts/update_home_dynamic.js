import fs from 'fs';

const filePath = 'd:/Meesho/Meesho_clone/frontend/src/pages/customer & Reseller/HomeUserCustomer.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add getBanners to imports
content = content.replace(
  `import {
  getProducts,
  getCategories,
  getWishlist,
  toggleWishlist,
} from "../../services/ecommerceService";`,
  `import {
  getProducts,
  getCategories,
  getWishlist,
  toggleWishlist,
  getBanners,
} from "../../services/ecommerceService";`
);

// 2. Add DEFAULT_BANNERS and banners state
const defaultBannersCode = `const DEFAULT_BANNERS = [
  {
    id: 'banner_flash',
    badge: '⚡ Lightning Flash Sale',
    badgeStatus: 'Live Now',
    title: 'Mega Flash Deals! Up to 75% Off',
    subtitle: 'Limited-time lightning drops with verified factory pricing & Free Delivery on all orders.',
    buttonText: 'View Flash Deals',
    targetUrl: '/flash',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    accentColor: 'text-rose-600',
  },
  {
    id: 'banner_festive',
    badge: 'Special Festive Deals 🛍️',
    badgeStatus: 'Special Offer',
    title: 'Grand Festive Sale! Up to 70% Off',
    subtitle: '100% verified factory direct prices with Free Delivery & Easy 7-day returns.',
    buttonText: 'Explore Catalog',
    targetUrl: '/explorer',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
    gradient: 'from-pink-600 via-rose-600 to-red-600',
    accentColor: 'text-pink-600',
  },
  {
    id: 'banner_men',
    badge: 'Lowest Price Guarantee',
    badgeStatus: 'Best Value',
    title: 'Trending Menswear & Gadgets',
    subtitle: 'Casual shirts, sneakers, audio gear & everyday essentials directly at wholesale rates.',
    buttonText: 'Shop Men',
    targetCategory: 'Men',
    targetUrl: '/user-home?category=Men',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
    gradient: 'from-indigo-700 via-blue-600 to-cyan-600',
    accentColor: 'text-indigo-700',
  }
];

export default function HomeUserCustomer() {
  const navigate = useNavigate();
  const bannerRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const [banners, setBanners] = useState(DEFAULT_BANNERS);`;

content = content.replace(
  `export default function HomeUserCustomer() {
  const navigate = useNavigate();
  const bannerRef = React.useRef(null);
  const searchContainerRef = React.useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);`,
  defaultBannersCode
);

// 3. Update loadData to fetch banners
content = content.replace(
  `        const [catsData, prodsData, wishData] = await Promise.all([
          getCategories(),
          getProducts(),
          getWishlist(),
        ]);

        if (isMounted) {
          if (catsData && catsData.length > 0) {
            setDbCategories(catsData);
          }`,
  `        const [catsData, prodsData, wishData, bannersData] = await Promise.all([
          getCategories(),
          getProducts(),
          getWishlist(),
          getBanners(),
        ]);

        if (isMounted) {
          if (bannersData && bannersData.length > 0) {
            setBanners(bannersData);
          }
          if (catsData && catsData.length > 0) {
            setDbCategories(catsData);
          }`
);

// 4. Update timer to use banners.length
content = content.replace(
  `  // Auto-scroll hero banner carousel across all 3 banners
  useEffect(() => {
    if (isBannerPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, [isBannerPaused]);`,
  `  // Auto-scroll hero banner carousel dynamically across all active banners
  useEffect(() => {
    if (isBannerPaused || !banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isBannerPaused, banners]);`
);

// 5. Replace SUBCATEGORY_MAP with dynamic derivation
const subcatOld = `  // Map category list with "All" option
  const SUBCATEGORY_MAP = {
    'Women Ethnic': ['All', 'Saree', 'Kurti', 'Silk Saree', 'Anarkali'],
    'Women Western': ['All', 'Dress', 'Top', 'Jeans', 'Skirt'],
    'Men': ['All', 'Shirt', 'T-Shirt', 'Track Pants'],
    'Kids': ['All', 'Toys', 'Infant Romper', 'Boys Set'],
    'Home & Kitchen': ['All', 'Bedsheet', 'Wall Decor', 'Curtain', 'Cookware', 'Storage Container'],
    'Beauty & Health': ['All', 'Face Wash', 'Lipstick', 'Serum', 'Sunscreen', 'Perfume', 'Body Lotion', 'Kajal'],
    'Jewellery & Accessories': ['All', 'Necklace', 'Earrings', 'Choker', 'Rings'],
    'Footwear': ['All', 'Sneakers', 'Flats', 'Sliders', 'Jutti', 'Loafers'],
    'Electronics & Gadgets': ['All', 'Phone Covers', 'Earbuds', 'Smartwatch', 'Charger', 'Cable', 'Neckband']
  };

  const activeSubcats = SUBCATEGORY_MAP[selectedCategory] || [];`;

const subcatNew = `  // Dynamic subcategories from live Database Category query
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All') return null;
    return dbCategories.find(c => c.name === selectedCategory || c.slug === selectedCategory);
  }, [dbCategories, selectedCategory]);

  const activeSubcats = useMemo(() => {
    if (!activeCategoryObj) return [];
    return activeCategoryObj.subcategories || ['All'];
  }, [activeCategoryObj]);`;

content = content.replace(subcatOld, subcatNew);

// 6. Replace Hero Carousel JSX & Dots Indicator
const carouselOld = `        {/* Hero Carousel - CSS Transform Slider (Impossible to show half-half slides) */}
        <div 
          className="relative mt-2 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm group select-none"
          onMouseEnter={() => setIsBannerPaused(true)}
          onMouseLeave={() => setIsBannerPaused(false)}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out h-48 sm:h-64 md:h-80"
            style={{ transform: \`translateX(-\${activeSlide * 100}%)\` }}
          >
            {/* Slide 1: Lightning Flash Sale */}
            <div 
              onClick={() => navigate('/flash')}
              className="w-full shrink-0 relative h-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 flex items-center px-6 sm:px-12 md:px-16 text-white cursor-pointer"
            >
              <div className="max-w-md z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    ⚡ Lightning Flash Sale
                  </span>
                  <span className="bg-yellow-400 text-slate-900 text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                    Live Now
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-headline leading-tight mb-2">
                  Mega Flash Deals! Up to 75% Off
                </h2>
                <p className="text-xs sm:text-sm text-rose-100 mb-4 line-clamp-2">
                  Limited-time lightning drops with verified factory pricing &amp; Free Delivery on all orders.
                </p>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/flash');
                  }}
                  className="bg-white text-rose-600 font-extrabold px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm hover:bg-rose-50 transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <span>View Flash Deals</span>
                  <span>➔</span>
                </button>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80" 
                alt="Lightning Flash Sale" 
                className="absolute right-0 top-0 h-full w-1/2 object-cover object-center mask-gradient-left opacity-90 hidden sm:block"
              />
            </div>

            {/* Slide 2: Special Festive Deals (Full Woman Ethnic Fashion with Face) */}
            <div 
              onClick={() => navigate('/explorer')}
              className="w-full shrink-0 relative h-full bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 flex items-center px-6 sm:px-12 md:px-16 text-white cursor-pointer"
            >
              <div className="max-w-md z-10">
                <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 inline-block">
                  Special Festive Deals 🛍️
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-headline leading-tight mb-2">
                  Grand Festive Sale! Up to 70% Off
                </h2>
                <p className="text-xs sm:text-sm text-pink-100 mb-4 line-clamp-2">
                  100% verified factory direct prices with Free Delivery &amp; Easy 7-day returns.
                </p>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/explorer');
                  }}
                  className="bg-white text-pink-600 font-bold px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm hover:bg-pink-50 transition-colors shadow-md cursor-pointer active:scale-95"
                >
                  Explore Catalog
                </button>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80" 
                alt="Festive Fashion" 
                className="absolute right-0 top-0 h-full w-1/2 object-cover object-top mask-gradient-left opacity-95 hidden sm:block"
              />
            </div>

            {/* Slide 3: Trending Menswear & Gadgets (Full Men Fashion with Face) */}
            <div 
              onClick={() => setSelectedCategory("Men")}
              className="w-full shrink-0 relative h-full bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-600 flex items-center px-6 sm:px-12 md:px-16 text-white cursor-pointer"
            >
              <div className="max-w-md z-10">
                <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 inline-block">
                  Lowest Price Guarantee
                </span>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-headline leading-tight mb-2">
                  Trending Menswear &amp; Gadgets
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 mb-4 line-clamp-2">
                  Casual shirts, sneakers, audio gear &amp; everyday essentials directly at wholesale rates.
                </p>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory("Men");
                  }}
                  className="bg-white text-indigo-700 font-bold px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm hover:bg-indigo-50 transition-colors shadow-md cursor-pointer active:scale-95"
                >
                  Shop Men
                </button>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80" 
                alt="Men Collection" 
                className="absolute right-0 top-0 h-full w-1/2 object-cover object-top mask-gradient-left opacity-95 hidden sm:block"
              />
            </div>
          </div>

          {/* Previous Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide((prev) => (prev - 1 + 3) % 3);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md z-20"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveSlide((prev) => (prev + 1) % 3);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md z-20"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>

        {/* Dots Indicator for all 3 Banners */}
        <div className="flex justify-center gap-1.5 mt-3">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={\`h-2 rounded-full transition-all cursor-pointer \${
                activeSlide === idx ? 'w-6 bg-[#FF3F6C]' : 'w-2 bg-slate-300 dark:bg-slate-700'
              }\`}
              aria-label={\`Go to slide \${idx + 1}\`}
            />
          ))}
        </div>`;

const carouselNew = `        {/* Hero Carousel - Dynamic Backend Banners */}
        <div 
          className="relative mt-2 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm group select-none"
          onMouseEnter={() => setIsBannerPaused(true)}
          onMouseLeave={() => setIsBannerPaused(false)}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out h-48 sm:h-64 md:h-80"
            style={{ transform: \`translateX(-\${activeSlide * 100}%)\` }}
          >
            {banners.map((banner, idx) => (
              <div 
                key={banner.id || idx}
                onClick={() => {
                  if (banner.targetCategory) {
                    setSelectedCategory(banner.targetCategory);
                  } else if (banner.targetUrl) {
                    navigate(banner.targetUrl);
                  }
                }}
                className={\`w-full shrink-0 relative h-full bg-gradient-to-r \${banner.gradient || 'from-rose-600 via-pink-600 to-red-600'} flex items-center px-6 sm:px-12 md:px-16 text-white cursor-pointer\`}
              >
                <div className="max-w-md z-10">
                  {banner.badge && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                        {banner.badge.includes('⚡') && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />}
                        {banner.badge}
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
                  <p className="text-xs sm:text-sm text-white/90 mb-4 line-clamp-2">
                    {banner.subtitle}
                  </p>
                  {banner.buttonText && (
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
                      className={\`bg-white \${banner.accentColor || 'text-rose-600'} font-extrabold px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm hover:bg-rose-50 transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5\`}
                    >
                      <span>{banner.buttonText}</span>
                      <span>➔</span>
                    </button>
                  )}
                </div>
                {banner.imageUrl && (
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title} 
                    className="absolute right-0 top-0 h-full w-1/2 object-cover object-center mask-gradient-left opacity-90 hidden sm:block"
                  />
                )}
              </div>
            ))}
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
                className={\`h-2 rounded-full transition-all cursor-pointer \${
                  activeSlide === idx ? 'w-6 bg-[#FF3F6C]' : 'w-2 bg-slate-300 dark:bg-slate-700'
                }\`}
                aria-label={\`Go to slide \${idx + 1}\`}
              />
            ))}
          </div>
        )}`;

// Normalize newlines before replace
content = content.replace(/\r\n/g, '\n');
const normalizedCarouselOld = carouselOld.replace(/\r\n/g, '\n');
const normalizedCarouselNew = carouselNew.replace(/\r\n/g, '\n');

if (content.includes(normalizedCarouselOld)) {
  content = content.replace(normalizedCarouselOld, normalizedCarouselNew);
  console.log('Successfully replaced carousel JSX');
} else {
  console.warn('Warning: normalizedCarouselOld not found directly');
}

fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('HomeUserCustomer.jsx updated successfully');

