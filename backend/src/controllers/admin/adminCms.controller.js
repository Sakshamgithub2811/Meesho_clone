import prisma from '../../config/prisma.js';
import { logAdminAction } from '../../utils/auditLogger.js';

/**
 * Standard seed templates for default e-commerce legal & informational policies
 */
const DEFAULT_CMS_TEMPLATES = [
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    status: 'PUBLISHED',
    metaTitle: 'Privacy Policy | Meesho Clone India',
    metaDescription: 'Read our Privacy Policy to understand how we collect, protect, and use your personal data in compliance with DPDPA regulations.',
    content: `<h1>Privacy Policy</h1>
<p>Last updated: October 2026</p>
<p>Welcome to Meesho Clone. We value the trust you place in us and recognize the importance of secure transactions and information privacy. This Privacy Policy describes how Meesho Clone ("we", "our", or "us") collects, uses, shares, and processes your personal data through our website and mobile application.</p>

<h2>1. Collection of Information</h2>
<p>We collect personal information that you provide to us when you register an account, place an order, apply for reseller or supplier status, or contact our customer support. This includes:</p>
<ul>
  <li><strong>Identity & Contact Details:</strong> Full name, email address, mobile number, delivery addresses.</li>
  <li><strong>Transaction Details:</strong> Purchase history, payment mode, order amounts, and shipping records.</li>
  <li><strong>KYC Documents:</strong> For registered resellers and suppliers (PAN, GSTIN, Aadhaar/business identity proof).</li>
  <li><strong>Technical Data:</strong> IP address, browser type, device information, and interaction logs.</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use your data to:</p>
<ul>
  <li>Process orders, facilitate payments, and coordinate doorstep delivery.</li>
  <li>Provide customer support and resolve order disputes.</li>
  <li>Prevent fraudulent transactions and secure platform operations.</li>
  <li>Comply with applicable Indian legal and regulatory mandates.</li>
</ul>

<h2>3. Data Protection and Security</h2>
<p>We employ multi-layer security protocols, SSL encryption, and strict access control to safeguard your sensitive information from unauthorized access, loss, or misuse.</p>

<h2>4. Your Rights</h2>
<p>You have the right to access, rectify, or request deletion of your personal data by contacting our Grievance Officer or through your account profile settings.</p>`
  },
  {
    title: 'Terms and Conditions',
    slug: 'terms-and-conditions',
    status: 'PUBLISHED',
    metaTitle: 'Terms & Conditions of Service | Meesho Clone',
    metaDescription: 'Review terms governing use of the Meesho Clone social commerce platform, orders, reseller margins, and user obligations.',
    content: `<h1>Terms and Conditions</h1>
<p>Last updated: October 2026</p>
<p>Please read these Terms and Conditions carefully before using the Meesho Clone platform. By accessing or using our services, you agree to be bound by these Terms.</p>

<h2>1. User Account & Eligibility</h2>
<p>You must be at least 18 years old or possess legal parental/guardian consent to use our platform. You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.</p>

<h2>2. Marketplace Nature</h2>
<p>Meesho Clone acts as an intermediary social commerce marketplace connecting independent buyers, sellers, suppliers, and resellers. Suppliers are solely responsible for product specifications, manufacturing quality, and warranty fulfillment.</p>

<h2>3. Reseller & Dropshipping Guidelines</h2>
<p>Resellers may add custom profit margins to catalog products. Resellers must not misrepresent product claims or brand affiliations. Excessive cancellations or fraudulent behavior may result in permanent suspension.</p>

<h2>4. Pricing & Payment</h2>
<p>All prices displayed are inclusive of applicable taxes unless specified otherwise. We reserve the right to correct pricing errors and cancel orders arising from typographical or technical anomalies.</p>

<h2>5. Intellectual Property</h2>
<p>All brand logos, UI designs, code, graphics, and trademarks on this platform are owned by or licensed to Meesho Clone.</p>`
  },
  {
    title: 'Return & Refund Policy',
    slug: 'return-and-refund-policy',
    status: 'PUBLISHED',
    metaTitle: 'Return, Replacement & Refund Policy | Meesho Clone',
    metaDescription: 'Hassle-free 7-day return policy. Learn about reverse pickups, return eligibility, and refund timelines.',
    content: `<h1>Return, Replacement & Refund Policy</h1>
<p>Last updated: October 2026</p>
<p>We want you to be completely satisfied with every order. If you receive a damaged, defective, or incorrect item, our return process is designed to be simple and seamless.</p>

<h2>1. Return Window</h2>
<p>You can request a return or replacement within <strong>7 days</strong> of delivery through your order history page.</p>

<h2>2. Eligibility Criteria</h2>
<p>To qualify for a return:</p>
<ul>
  <li>The item must be unused, unwashed, and in its original packaging with tags intact.</li>
  <li>Innerwear, beauty items, and customized goods are non-returnable due to hygiene and health standards.</li>
  <li>Clear photos or unboxing videos may be requested for damaged or defective items.</li>
</ul>

<h2>3. Reverse Pickup</h2>
<p>Our courier partner will attempt reverse pickup from your registered address within 2-4 business days of approval. Please hand over the item securely packaged.</p>

<h2>4. Refund Timelines</h2>
<ul>
  <li><strong>Prepaid Orders (UPI/Cards):</strong> Refund will reflect within 3-5 business days after quality verification.</li>
  <li><strong>Cash on Delivery (COD):</strong> Refund will be credited directly to your registered Bank Account / UPI ID or Meesho Clone Wallet within 2-4 business days.</li>
</ul>`
  },
  {
    title: 'Shipping & Delivery Policy',
    slug: 'shipping-policy',
    status: 'PUBLISHED',
    metaTitle: 'Shipping & Delivery Policy | Meesho Clone',
    metaDescription: 'Details on shipping coverage across India, delivery timelines, tracking, and free shipping benefits.',
    content: `<h1>Shipping & Delivery Policy</h1>
<p>Last updated: October 2026</p>
<p>We are dedicated to delivering your orders across 20,000+ pin codes across India safely and promptly.</p>

<h2>1. Delivery Timelines</h2>
<p>Orders are dispatched by suppliers within 24 to 48 hours of confirmation. Typical transit durations:</p>
<ul>
  <li><strong>Metro Cities:</strong> 2 to 4 business days.</li>
  <li><strong>Tier 2 & 3 Cities:</strong> 4 to 7 business days.</li>
  <li><strong>Remote Locations:</strong> Up to 8 to 10 business days.</li>
</ul>

<h2>2. Shipping Charges</h2>
<p>We offer <strong>Free Delivery</strong> on the majority of our catalog items as marked with the Free Delivery badge. Any applicable delivery charges are clearly displayed before order placement.</p>

<h2>3. Live Tracking</h2>
<p>Once your parcel is dispatched, you will receive a tracking link via SMS/Email to monitor real-time shipment progress.</p>`
  },
  {
    title: 'About Us',
    slug: 'about-us',
    status: 'PUBLISHED',
    metaTitle: 'About Us | Meesho Clone - Empowering Bharat',
    metaDescription: 'Discover how Meesho Clone empowers small businesses, women entrepreneurs, and millions of shoppers with accessible social commerce.',
    content: `<h1>About Meesho Clone</h1>
<p>Meesho Clone is India's next-generation social commerce ecosystem. We are on a mission to democratize internet commerce for everyone across India.</p>

<h2>Our Vision</h2>
<p>To empower 100 million micro, small, and medium enterprises (MSMEs) and individual entrepreneurs to start and grow their online business with zero capital investment.</p>

<h2>What Sets Us Apart</h2>
<ul>
  <li><strong>Lowest Prices:</strong> Sourced directly from manufacturers and verified wholesale suppliers across India.</li>
  <li><strong>Social Reselling:</strong> Enables homemakers, students, and aspiring entrepreneurs to earn an income by sharing curated catalogs on WhatsApp, Instagram, and Facebook.</li>
  <li><strong>0% Commission for Small Sellers:</strong> Fair and transparent marketplace policies designed to nurture local manufacturers.</li>
</ul>`
  },
  {
    title: 'Contact Us & Grievance Redressal',
    slug: 'contact-us',
    status: 'PUBLISHED',
    metaTitle: 'Contact Us & Grievance Redressal | Meesho Clone',
    metaDescription: 'Reach our dedicated 24/7 customer support team or connect with our official Grievance Officer.',
    content: `<h1>Contact Us & Grievance Redressal</h1>
<p>Have questions, concerns, or feedback? We are here to help!</p>

<h2>Customer Support</h2>
<ul>
  <li><strong>Help Center:</strong> Accessible 24/7 via the 'Help' section in your account</li>
  <li><strong>Email:</strong> support@meeshoclone.local</li>
  <li><strong>Toll-Free Helpline:</strong> 1800-123-4567 (Mon - Sat, 9:00 AM to 7:00 PM IST)</li>
</ul>

<h2>Grievance Redressal Mechanism</h2>
<p>In accordance with the Information Technology Act 2000 and consumer protection guidelines, our Grievance Officer details are:</p>
<p>
  <strong>Officer Name:</strong> Grievance Officer<br />
  <strong>Designation:</strong> Head of Consumer Protection<br />
  <strong>Email:</strong> grievance-officer@meeshoclone.local<br />
  <strong>Address:</strong> Meesho Clone Headquarters, Tech Park Phase 2, Bangalore, Karnataka - 560103, India.
</p>`
  }
];

/**
 * Seed default pages if table is empty
 */
export async function ensureSeedTemplates() {
  try {
    const count = await prisma.cmsPage.count();
    if (count === 0) {
      console.log('Seeding initial default CMS pages...');
      for (const t of DEFAULT_CMS_TEMPLATES) {
        await prisma.cmsPage.create({
          data: t
        });
      }
      console.log('Default CMS pages seeded successfully.');
    }
  } catch (err) {
    console.error('Failed to seed default CMS pages:', err);
  }
}

/**
 * Helper to slugify a title
 */
function slugifyText(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 1. GET /api/admin-cms
 * Returns all CMS pages with summary metrics
 */
export const getAllAdminCmsPages = async (req, res) => {
  try {
    await ensureSeedTemplates();

    const { search, status } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const pages = await prisma.cmsPage.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    const allPages = await prisma.cmsPage.findMany({
      select: { status: true }
    });

    const total = allPages.length;
    const published = allPages.filter(p => p.status === 'PUBLISHED').length;
    const drafts = total - published;

    return res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
      stats: {
        total,
        published,
        drafts
      }
    });
  } catch (error) {
    console.error('Error fetching CMS pages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve CMS pages',
      error: error.message
    });
  }
};

/**
 * 2. GET /api/admin-cms/:id
 * Returns single page by ID
 */
export const getAdminCmsPageById = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.cmsPage.findUnique({
      where: { id }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'CMS page not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching CMS page by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch CMS page',
      error: error.message
    });
  }
};

/**
 * 3. POST /api/admin-cms
 * Create a new CMS page
 */
export const createAdminCmsPage = async (req, res) => {
  try {
    const { title, slug, content, status, metaTitle, metaDescription } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Page title is required'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Page content is required'
      });
    }

    const finalSlug = slug && slug.trim() ? slugifyText(slug) : slugifyText(title);

    // Verify slug uniqueness
    const existing = await prisma.cmsPage.findUnique({
      where: { slug: finalSlug }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A page with slug '${finalSlug}' already exists. Please choose a different URL slug.`
      });
    }

    const newPage = await prisma.cmsPage.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        content,
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
        metaTitle: metaTitle?.trim() || title.trim(),
        metaDescription: metaDescription?.trim() || null
      }
    });

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'CMS_PAGE_CREATED',
      targetType: 'SYSTEM',
      targetId: newPage.id,
      details: `Created CMS legal/policy page "${newPage.title}" (Slug: /${newPage.slug})`
    });

    return res.status(201).json({
      success: true,
      message: 'CMS page created successfully',
      data: newPage
    });
  } catch (error) {
    console.error('Error creating CMS page:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create CMS page',
      error: error.message
    });
  }
};

/**
 * 4. PUT /api/admin-cms/:id
 * Update an existing CMS page
 */
export const updateAdminCmsPage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, status, metaTitle, metaDescription } = req.body;

    const existingPage = await prisma.cmsPage.findUnique({
      where: { id }
    });

    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: 'CMS page not found'
      });
    }

    let finalSlug = existingPage.slug;
    if (slug && slug.trim()) {
      finalSlug = slugifyText(slug);
      if (finalSlug !== existingPage.slug) {
        const slugExists = await prisma.cmsPage.findUnique({
          where: { slug: finalSlug }
        });
        if (slugExists && slugExists.id !== id) {
          return res.status(400).json({
            success: false,
            message: `A page with slug '${finalSlug}' already exists.`
          });
        }
      }
    }

    const updated = await prisma.cmsPage.update({
      where: { id },
      data: {
        title: title ? title.trim() : existingPage.title,
        slug: finalSlug,
        content: content !== undefined ? content : existingPage.content,
        status: status === 'DRAFT' ? 'DRAFT' : status === 'PUBLISHED' ? 'PUBLISHED' : existingPage.status,
        metaTitle: metaTitle !== undefined ? metaTitle.trim() : existingPage.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription.trim() : existingPage.metaDescription
      }
    });

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'CMS_PAGE_UPDATED',
      targetType: 'SYSTEM',
      targetId: id,
      details: `Updated CMS policy page "${updated.title}"`
    });

    return res.status(200).json({
      success: true,
      message: 'CMS page updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating CMS page:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update CMS page',
      error: error.message
    });
  }
};

/**
 * 5. PATCH /api/admin-cms/:id/status
 * Quick toggle status (PUBLISHED <-> DRAFT)
 */
export const toggleAdminCmsPageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.cmsPage.findUnique({
      where: { id }
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'CMS page not found'
      });
    }

    const newStatus = page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const updated = await prisma.cmsPage.update({
      where: { id },
      data: { status: newStatus }
    });

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: newStatus === 'PUBLISHED' ? 'CMS_PAGE_PUBLISHED' : 'CMS_PAGE_UNPUBLISHED',
      targetType: 'SYSTEM',
      targetId: id,
      details: `${newStatus === 'PUBLISHED' ? 'Published' : 'Unpublished (Draft)'} CMS page "${page.title}"`
    });

    return res.status(200).json({
      success: true,
      message: `Page marked as ${newStatus}`,
      data: updated
    });
  } catch (error) {
    console.error('Error toggling CMS page status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle status',
      error: error.message
    });
  }
};

/**
 * 6. DELETE /api/admin-cms/:id
 * Delete a CMS page
 */
export const deleteAdminCmsPage = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.cmsPage.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'CMS page not found'
      });
    }

    await prisma.cmsPage.delete({
      where: { id }
    });

    // Audit log
    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'CMS_PAGE_DELETED',
      targetType: 'SYSTEM',
      targetId: id,
      details: `Permanently deleted CMS page "${existing.title}"`
    });

    return res.status(200).json({
      success: true,
      message: `CMS page '${existing.title}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting CMS page:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete CMS page',
      error: error.message
    });
  }
};
