import prisma from '../config/prisma.js';

// Curated list of all public static pages in Meesho Clone
const STATIC_PAGES = [
  // 1. Core Shopping Pages
  { path: '/user-home', priority: '1.0', changefreq: 'daily', label: 'Customer Storefront Home' },
  { path: '/explorer', priority: '0.9', changefreq: 'daily', label: 'Product Explorer Catalog' },
  { path: '/sarees', priority: '0.8', changefreq: 'daily', label: 'Ethnic Sarees Collection' },
  { path: '/western', priority: '0.8', changefreq: 'daily', label: 'Western Fashion Hub' },
  { path: '/flash', priority: '0.8', changefreq: 'daily', label: 'Flash Deals & Discounts' },
  { path: '/spotlight', priority: '0.7', changefreq: 'weekly', label: 'Trending Spotlight' },
  { path: '/reviews', priority: '0.7', changefreq: 'weekly', label: 'Customer Reviews Showcase' },
  { path: '/luxe', priority: '0.7', changefreq: 'weekly', label: 'Luxe Premium Collection' },

  // 2. Business & Partner Onboarding
  { path: '/resell-earn', priority: '0.8', changefreq: 'weekly', label: 'Reseller Earnings Landing' },
  { path: '/reseller-home', priority: '0.7', changefreq: 'weekly', label: 'Reseller Hub' },
  { path: '/affiliate-program', priority: '0.7', changefreq: 'weekly', label: 'Affiliate Partner Program' },
  { path: '/supplier-register', priority: '0.8', changefreq: 'weekly', label: 'Supplier Onboarding Register' },
  { path: '/supplier-login', priority: '0.6', changefreq: 'monthly', label: 'Supplier Portal Login' },
  { path: '/dropshipper-login', priority: '0.6', changefreq: 'monthly', label: 'Dropshipper Portal Login' },
  { path: '/support-center', priority: '0.6', changefreq: 'monthly', label: 'Customer Support Center' },
  { path: '/raise-ticket', priority: '0.5', changefreq: 'monthly', label: 'Public Helpdesk Ticket Portal' },

  // 3. Curated Themes
  { path: '/digital-curator', priority: '0.6', changefreq: 'monthly', label: 'Digital Curator Theme' },
  { path: '/petal-collective', priority: '0.6', changefreq: 'monthly', label: 'Petal Collective Theme' },
  { path: '/gilded-pulse', priority: '0.6', changefreq: 'monthly', label: 'Gilded Pulse Theme' },
  { path: '/social-commerce-luxe', priority: '0.6', changefreq: 'monthly', label: 'Social Commerce Theme' },
  { path: '/signal-core', priority: '0.6', changefreq: 'monthly', label: 'Signal Core Theme' }
];

/**
 * Dynamically generates sitemap.xml on the fly with live DB products and categories
 */
export const generateSitemapXml = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const today = new Date().toISOString().split('T')[0];

    // Fetch live products, categories, and published CMS pages concurrently (Method 2)
    const [products, categories, cmsPages] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, updatedAt: true },
        take: 5000,
        orderBy: { updatedAt: 'desc' }
      }).catch(err => {
        console.warn('⚠️ [SEO] Product fetch warning:', err.message);
        return [];
      }),
      prisma.category.findMany({
        select: { slug: true, createdAt: true },
        take: 500
      }).catch(err => {
        console.warn('⚠️ [SEO] Category fetch warning:', err.message);
        return [];
      }),
      prisma.cmsPage.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true }
      }).catch(err => {
        console.warn('⚠️ [SEO] CmsPage fetch warning:', err.message);
        return [];
      })
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Static Pages
    for (const page of STATIC_PAGES) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // 2. Dynamic Categories
    for (const cat of categories) {
      const catDate = cat.createdAt ? new Date(cat.createdAt).toISOString().split('T')[0] : today;
      const catSlug = cat.slug || '';
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/explorer?category=${encodeURIComponent(catSlug)}</loc>\n`;
      xml += `    <lastmod>${catDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // 3. Dynamic Products
    for (const prod of products) {
      const prodDate = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : today;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product?id=${prod.id}</loc>\n`;
      xml += `    <lastmod>${prodDate}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    // 4. Dynamic Published CMS Pages (Method 2 - Automatic Admin Page Indexing)
    for (const page of cmsPages) {
      const pageDate = page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : today;
      const pageSlug = page.slug || '';
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/p/${encodeURIComponent(pageSlug)}</loc>\n`;
      xml += `    <lastmod>${pageDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    return res.status(200).send(xml);
  } catch (error) {
    console.error('❌ [SEO] Error generating sitemap.xml:', error);
    return res.status(500).send('Error generating sitemap');
  }
};

/**
 * Generates standard robots.txt directives
 */
export const generateRobotsTxt = (req, res) => {
  const backendBase = `${req.protocol}://${req.get('host')}`;
  const robots = `# Meesho SuperApp - Robots Exclusion Protocol
# Standard Web Crawlers direct entry
User-agent: *
Allow: /
Allow: /user-home
Allow: /explorer
Allow: /product
Allow: /sarees
Allow: /western
Allow: /flash
Allow: /spotlight
Allow: /reviews
Allow: /luxe
Allow: /support-center
Allow: /resell-earn
Allow: /supplier-register

# Disallow Private Admin & Secured Dashboards
Disallow: /admin-panel
Disallow: /admin-panel1
Disallow: /admin-analytics
Disallow: /supplier-orders1
Disallow: /supplier-inventory1
Disallow: /driver-dashboard
Disallow: /cart
Disallow: /address
Disallow: /payment
Disallow: /user-dashboard1
Disallow: /api/

# Official Sitemap XML Location
Sitemap: ${backendBase}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  return res.status(200).send(robots);
};

/**
 * Returns summary stats for the Admin SEO & Sitemap Manager
 */
export const getSeoSitemapStats = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendBase = `${req.protocol}://${req.get('host')}`;

    const [productCount, categoryCount, cmsPagesCount] = await Promise.all([
      prisma.product.count().catch(() => 0),
      prisma.category.count().catch(() => 0),
      prisma.cmsPage.count({ where: { status: 'PUBLISHED' } }).catch(() => 0)
    ]);

    const staticCount = STATIC_PAGES.length;
    const totalUrls = staticCount + productCount + categoryCount + cmsPagesCount;

    return res.json({
      success: true,
      data: {
        totalUrls,
        staticPagesCount: staticCount,
        productsCount: productCount,
        categoriesCount: categoryCount,
        cmsPagesCount: cmsPagesCount,
        sitemapUrl: `${backendBase}/sitemap.xml`,
        robotsUrl: `${backendBase}/robots.txt`,
        frontendBase: baseUrl,
        staticPages: STATIC_PAGES,
        lastGenerated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ [SEO] Error fetching stats:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Public Endpoint: Fetch single published CMS page by slug (for Googlebot & storefront viewer)
 */
export const getPublicCmsPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Slug is required' });
    }

    const page = await prisma.cmsPage.findFirst({
      where: {
        slug: slug.trim(),
        status: 'PUBLISHED'
      }
    });

    if (!page) {
      return res.status(404).json({ success: false, error: 'Page not found or is still a draft' });
    }

    return res.json({ success: true, page });
  } catch (error) {
    console.error('❌ [SEO] Error fetching public CMS page:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
