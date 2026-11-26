import prisma from '../config/prisma.js';

export const getCategories = async (req, res) => {
  try {
    // 1. Fetch all approved categories and counts
    const categories = await prisma.category.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // 2. Fetch distinct subcategories dynamically from the products table
    const subcategoryGroups = await prisma.product.groupBy({
      by: ['categorySlug', 'subCategory'],
      where: {
        subCategory: { not: null }
      },
      _count: {
        id: true
      }
    });

    // Map subcategories grouped by categorySlug
    const subcategoryMap = {};
    for (const group of subcategoryGroups) {
      if (!group.subCategory || !group.subCategory.trim()) continue;
      const slug = group.categorySlug;
      if (!subcategoryMap[slug]) {
        subcategoryMap[slug] = [];
      }
      subcategoryMap[slug].push(group.subCategory.trim());
    }

    // Sort subcategories alphabetically within each category
    for (const slug in subcategoryMap) {
      subcategoryMap[slug].sort((a, b) => a.localeCompare(b));
    }

    // Attach dynamic subcategories to each category
    const enrichedCategories = categories.map((cat) => {
      const subs = subcategoryMap[cat.slug] || [];
      return {
        ...cat,
        subcategories: ['All', ...subs]
      };
    });

    // High performance Vercel Edge caching header for sub-300ms category delivery
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json({
      success: true,
      count: enrichedCategories.length,
      data: enrichedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category || category.status !== 'APPROVED') {
      return res.status(404).json({
        success: false,
        message: 'Category not found or pending admin approval'
      });
    }

    // Get subcategories dynamically for this specific category
    const subcategoryGroups = await prisma.product.groupBy({
      by: ['subCategory'],
      where: {
        categorySlug: slug,
        subCategory: { not: null }
      }
    });

    const subs = subcategoryGroups
      .map((g) => g.subCategory?.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return res.status(200).json({
      success: true,
      data: {
        ...category,
        subcategories: ['All', ...subs]
      }
    });
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch category details',
      error: error.message
    });
  }
};

/**
 * 3. GET DYNAMIC CATEGORY ATTRIBUTES SCHEMA
 * Returns custom database attribute schema if defined by admin,
 * or standard category-adaptive taxonomy attributes (for Laptop, Saree, Footwear, etc.)
 * GET /api/v1/categories/:slug/attributes
 */
export const getCategoryAttributes = async (req, res) => {
  try {
    const { slug } = req.params;
    const { getStandardCategoryAttributes } = await import('../utils/categoryTaxonomy.js');

    // 1. Check if category exists and has a custom attributeSchema in database
    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, attributeSchema: true }
    });

    if (category?.attributeSchema && Array.isArray(category.attributeSchema) && category.attributeSchema.length > 0) {
      return res.status(200).json({
        success: true,
        category: category.name,
        slug: category.slug,
        isCustom: true,
        attributes: category.attributeSchema
      });
    }

    // 2. Fall back to standard enterprise category taxonomy
    const standardAttrs = getStandardCategoryAttributes(slug);

    return res.status(200).json({
      success: true,
      category: category?.name || slug,
      slug,
      isCustom: false,
      attributes: standardAttrs
    });
  } catch (error) {
    console.error('Error fetching category attributes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch category attributes',
      error: error.message
    });
  }
};
