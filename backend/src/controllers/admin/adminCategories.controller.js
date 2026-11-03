import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL CATEGORIES & STATS FOR ADMIN (Including Parent/Subcategory Hierarchy)
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        subcategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            _count: { select: { products: true } }
          }
        },
        _count: {
          select: { products: true, subcategories: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalCategories = categories.length;
    const mainCategories = categories.filter(c => !c.parentId).length;
    const subCategories = categories.filter(c => !!c.parentId).length;
    const totalProducts = categories.reduce((sum, cat) => sum + (cat._count?.products || 0), 0);
    const emptyCategories = categories.filter(
      cat => (cat._count?.products || 0) === 0 && (cat._count?.subcategories || 0) === 0
    ).length;

    res.status(200).json({
      success: true,
      categories,
      data: categories,
      stats: {
        totalCategories,
        mainCategories,
        subCategories,
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
 * 2. CREATE NEW CATEGORY OR SUBCATEGORY
 */
export const createCategory = async (req, res) => {
  try {
    const { name, imageUrl, slug, parentId } = req.body;

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

    // Verify parent category if parentId is provided
    if (parentId && parentId.trim()) {
      const parentCat = await prisma.category.findUnique({
        where: { id: parentId.trim() }
      });
      if (!parentCat) {
        return res.status(400).json({
          success: false,
          message: 'Selected parent category does not exist'
        });
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
        parentId: parentId && parentId.trim() ? parentId.trim() : null
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        subcategories: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { products: true, subcategories: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: parentId ? 'Subcategory created successfully' : 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

/**
 * 3. UPDATE CATEGORY (Allows re-assigning parent or changing to main category)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, imageUrl, parentId } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // A category cannot be its own parent
    if (parentId && parentId === id) {
      return res.status(400).json({
        success: false,
        message: 'A category cannot be its own parent category'
      });
    }

    // Verify parent category if parentId provided
    if (parentId && parentId.trim()) {
      const parentCat = await prisma.category.findUnique({
        where: { id: parentId.trim() }
      });
      if (!parentCat) {
        return res.status(400).json({
          success: false,
          message: 'Selected parent category does not exist'
        });
      }
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
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? imageUrl.trim() : null }),
        ...(parentId !== undefined && { parentId: parentId && parentId.trim() ? parentId.trim() : null })
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        subcategories: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { products: true, subcategories: true }
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
 * 4. DELETE CATEGORY (With Safety Guards for linked products & child subcategories)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, subcategories: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Safety guard 1: Check if category has child subcategories
    if (category._count.subcategories > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: "${category.name}" has ${category._count.subcategories} subcategories linked to it. Please reassign or delete the subcategories first.`
      });
    }

    // Safety guard 2: Prevent deleting category that has active products
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
