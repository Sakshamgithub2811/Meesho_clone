import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL CATEGORIES & STATS FOR ADMIN
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalCategories = categories.length;
    const totalProducts = categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0);
    const emptyCategories = categories.filter(cat => (cat._count?.products || 0) === 0).length;

    res.status(200).json({
      success: true,
      categories,
      data: categories,
      stats: {
        totalCategories,
        totalProducts,
        emptyCategories,
        activeCategories: totalCategories - emptyCategories
      }
    });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories', error: error.message });
  }
};

/**
 * 2. CREATE NEW CATEGORY
 */
export const createCategory = async (req, res) => {
  try {
    const { name, imageUrl, slug } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Auto-generate slug from name if not provided (e.g. "Kids Wear" -> "kids-wear")
    const generatedSlug = (slug?.trim() || name.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Check duplicate
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name.trim(), mode: 'insensitive' } },
          { slug: generatedSlug }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=400'
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

/**
 * 3. UPDATE CATEGORY
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, imageUrl } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if new name or slug conflicts with another category
    if (name || slug) {
      const duplicate = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                name ? { name: { equals: name.trim(), mode: 'insensitive' } } : {},
                slug ? { slug: slug.trim() } : {}
              ]
            }
          ]
        }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another category already exists with this name or slug'
        });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(slug && { slug: slug.trim() }),
        ...(imageUrl && { imageUrl: imageUrl.trim() })
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

/**
 * 4. DELETE CATEGORY (With Safety Guard for linked products)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Safety guard: Prevent deleting category that has active products
    if (category._count.products > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${category._count.products} products are linked to "${category.name}". Reassign or delete those products first.`
      });
    }

    await prisma.category.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};
