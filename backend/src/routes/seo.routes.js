import { Router } from 'express';
import {
  generateSitemapXml,
  generateRobotsTxt,
  getSeoSitemapStats,
  getPublicCmsPageBySlug
} from '../controllers/seo.controller.js';

const router = Router();

// Public Root Crawling Endpoints
router.get('/sitemap.xml', generateSitemapXml);
router.get('/robots.txt', generateRobotsTxt);

// Admin SEO & Sitemap Stats Endpoint
router.get('/api/seo/stats', getSeoSitemapStats);

// Public CMS Page Viewer Endpoint (for Googlebot & storefront viewer)
router.get('/api/cms/:slug', getPublicCmsPageBySlug);

export default router;
