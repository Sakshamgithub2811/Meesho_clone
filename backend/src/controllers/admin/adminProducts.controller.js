import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL PRODUCTS FOR ADMIN (With Category Filter, Stock Filter, Search & KPI Stats)
 * Supports query params: ?category=women-ethnic&stockStatus=low_stock&search=saree
 */
export const getAllProducts = async (req, res) => {
  try {
    const { category, stockStatus, search } = req.query;

    const where = {};

    // 1. Category Filter (by slug)
    if (category && category.toUpperCase() !== 'ALL') {
      where.categorySlug = category.toLowerCase();
    }

    // 2. Stock Status Filter
    if (stockStatus) {
      const s = stockStatus.toLowerCase();
      if (s === 'out_of_stock') {
        where.stock = { lte: 0 };
      } else if (s === 'low_stock') {
        where.stock = { gt: 0, lte: 10 };
      } else if (s === 'in_stock') {
        where.stock = { gt: 10 };
      }
    }

    // 3. Search Filter (by Product Title, Supplier Name, or Category Name)
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { supplierName: { contains: q, mode: 'insensitive' } },
        { categorySlug: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Parallel fetching of products, categories list, and KPI statistics
    const [
      products,
      categories,
      totalCount,
      outOfStockCount,
      lowStockCount,
      inStockCount
    ] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              orderItems: true,
              reviews: true
            }
          }
        }
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true }
      }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { stock: { gt: 10 } } })
    ]);

    const stats = {
      totalProducts: totalCount,
      inStock: inStockCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalCategories: categories.length
    };

    return res.status(200).json({
      success: true,
      count: products.length,
      stats,
      categories,
      products
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * 2. GET SINGLE PRODUCT DETAILS
 */
export const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            orderItems: true,
            wishlistItems: true,
            reviews: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product details',
      error: error.message
    });
  }
};

/**
 * 3. UPDATE PRODUCT STOCK
 */
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, price } = req.body;

    const data = {};
    if (stock !== undefined) {
      const stockNum = parseInt(stock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a positive integer'
        });
      }
      data.stock = stockNum;
    }

    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number'
        });
      }
      data.price = priceNum;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product stock',
      error: error.message
    });
  }
};

/**
 * 4. DELETE / DELIST PRODUCT
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Remove from cart & wishlist before deleting to avoid foreign key errors
    await Promise.all([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.wishlistItem.deleteMany({ where: { productId: id } })
    ]);

    await prisma.product.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: `Product "${existing.title}" deleted from catalog`
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};
