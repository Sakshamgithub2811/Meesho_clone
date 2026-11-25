import prisma from '../../config/prisma.js';
import { logAdminAction } from '../../utils/auditLogger.js';

/**
 * 1. GET ALL PRODUCTS FOR ADMIN (With Category Filter, Stock Filter, Search & KPI Stats)
 * Supports query params: ?category=women-ethnic&stockStatus=low_stock&search=saree
 */
export const getAllProducts = async (req, res) => {
  try {
    const { category, stockStatus, search, approvalStatus } = req.query;

    const where = { isDeleted: false };

    // 0. Approval Status Filter (PENDING, APPROVED, REJECTED)
    if (approvalStatus && approvalStatus.toUpperCase() !== 'ALL') {
      where.approvalStatus = approvalStatus.toUpperCase();
    }

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
      inStockCount,
      pendingApprovalCount
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
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { isDeleted: false, stock: { lte: 0 } } }),
      prisma.product.count({ where: { isDeleted: false, stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { isDeleted: false, stock: { gt: 10 } } }),
      prisma.product.count({ where: { isDeleted: false, approvalStatus: 'PENDING' } })
    ]);

    const stats = {
      totalProducts: totalCount,
      inStock: inStockCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalCategories: categories.length,
      pendingApprovals: pendingApprovalCount
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

/**
 * 5. APPROVE A PRODUCT TO GO LIVE
 * Route: POST /api/v1/admin-products/:id/approve
 */
export const approveProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        isActive: true,
        approvedAt: new Date(),
        rejectionReason: null
      },
      include: { category: true }
    });

    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'APPROVE_PRODUCT',
      targetType: 'PRODUCT',
      targetId: id,
      details: `Approved product "${existing.title}" (${existing.id}) for live catalog.`
    });

    return res.status(200).json({
      success: true,
      message: `Product "${existing.title}" approved and published to live catalog!`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error approving product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve product',
      error: error.message
    });
  }
};

/**
 * 6. REJECT A PRODUCT
 * Route: POST /api/v1/admin-products/:id/reject
 */
export const rejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        isActive: false,
        rejectionReason: reason || 'Product did not meet catalog quality or pricing guidelines.'
      },
      include: { category: true }
    });

    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: 'REJECT_PRODUCT',
      targetType: 'PRODUCT',
      targetId: id,
      details: `Rejected product "${existing.title}" (${existing.id}). Reason: ${reason || 'Guidelines violation'}`
    });

    return res.status(200).json({
      success: true,
      message: `Product "${existing.title}" rejected.`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject product',
      error: error.message
    });
  }
};

/**
 * 7. BULK ACTION ON MULTIPLE PRODUCTS (ACTIVATE / DEACTIVATE / DELETE / APPROVE / REJECT)
 * Route: PATCH /api/v1/admin-products/bulk-status
 */
export const bulkUpdateProductStatus = async (req, res) => {
  try {
    const { productIds, action, reason } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one product ID in productIds array.'
      });
    }

    if (!['ACTIVATE', 'DEACTIVATE', 'DELETE', 'APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be ACTIVATE, DEACTIVATE, DELETE, APPROVE, or REJECT.'
      });
    }

    let resultMessage = '';

    if (action === 'APPROVE' || action === 'ACTIVATE') {
      const updateResult = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          approvalStatus: 'APPROVED',
          isActive: true,
          isDeleted: false,
          approvedAt: new Date(),
          rejectionReason: null
        }
      });
      resultMessage = `Successfully approved & activated ${updateResult.count} products!`;

    } else if (action === 'REJECT') {
      const updateResult = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          approvalStatus: 'REJECTED',
          isActive: false,
          rejectionReason: reason || 'Bulk rejected by admin.'
        }
      });
      resultMessage = `Successfully rejected ${updateResult.count} products!`;

    } else if (action === 'DEACTIVATE') {
      const updateResult = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isActive: false }
      });
      resultMessage = `Successfully delisted/deactivated ${updateResult.count} products!`;

    } else if (action === 'DELETE') {
      // 1. Remove references from active cart & wishlists to prevent DB foreign key errors
      await Promise.all([
        prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } }),
        prisma.wishlistItem.deleteMany({ where: { productId: { in: productIds } } })
      ]);

      // 2. Soft delete selected products
      const deleteResult = await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isDeleted: true, isActive: false, deletedAt: new Date() }
      });
      resultMessage = `Successfully deleted ${deleteResult.count} products from catalog!`;
    }

    // Record Audit Log (Task 9 integration)
    await logAdminAction({
      adminEmail: req.user?.email || 'admin@meesho.com',
      adminName: req.user?.fullName || 'Super Admin',
      action: `BULK_PRODUCT_${action}`,
      targetType: 'PRODUCT',
      targetId: `${productIds.length}_PRODUCTS`,
      details: resultMessage
    });

    return res.status(200).json({
      success: true,
      message: resultMessage,
      count: productIds.length
    });
  } catch (error) {
    console.error('Error performing bulk product action:', error);
    return res.status(500).json({
      success: false,
      message: `Bulk update failed: ${error.message}`
    });
  }
};

