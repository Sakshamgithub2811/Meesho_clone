import prisma from '../config/prisma.js';

export const getCategories = async (req, res) => {
  try {
    // 1. Fetch all categories and counts
    const categories = await prisma.category.findMany({
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

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
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
