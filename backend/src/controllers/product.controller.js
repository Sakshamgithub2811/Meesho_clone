import prisma from '../config/prisma.js';
import redisClient from '../config/redisClient.js';

/**
 * Controller to fetch all products with optional filters, search, and sorting.
 */
export const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit, all } = req.query;

    const isFetchAll = all === 'true' || limit === 'all' || limit === '0' || limit === 'max';
    const pageNum = parseInt(page) || 1;
    const take = isFetchAll ? undefined : (parseInt(limit) || 24);
    const skip = isFetchAll ? undefined : ((pageNum - 1) * take);

    // Fast-path: Check Redis cache if running
    const cacheKey = `products:${category || 'all'}:${search || ''}:${minPrice || ''}:${maxPrice || ''}:${sort || 'default'}:${isFetchAll ? 'all' : pageNum}:${isFetchAll ? 'all' : take}`;
    if (redisClient?.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.status(200).json(JSON.parse(cached));
        }
      } catch (cacheErr) {}
    }

    const conditions = [
      { isDeleted: false } // Soft delete filter: do not show discontinued/deleted products in live catalog
    ];

    // Category filter - exact slug/name matching (prevents 'men' from loosely matching 'women-ethnic')
    if (category && category !== 'All' && category !== 'all') {
      const catLower = category.toLowerCase().trim();
      let targetSlugs = [];

      if (catLower === 'men' || catLower === 'men-western' || catLower === 'menswear') {
        targetSlugs = ['men'];
      } else if (catLower === 'women' || catLower === 'women ethnic' || catLower === 'women-ethnic' || catLower === 'ethnic wear') {
        targetSlugs = ['women-ethnic'];
      } else if (catLower === 'women western' || catLower === 'women-western' || catLower === 'western wear') {
        targetSlugs = ['women-western'];
      } else if (catLower === 'kids') {
        targetSlugs = ['kids'];
      } else if (catLower === 'home & kitchen' || catLower === 'home-kitchen' || catLower === 'home') {
        targetSlugs = ['home-kitchen'];
      } else if (catLower === 'beauty & health' || catLower === 'beauty-health' || catLower === 'beauty') {
        targetSlugs = ['beauty-health'];
      } else if (catLower === 'jewellery & accessories' || catLower === 'jewellery' || catLower === 'jewelery' || catLower === 'jewelry') {
        targetSlugs = ['jewellery'];
      } else if (catLower === 'footwear') {
        targetSlugs = ['footwear'];
      } else if (catLower === 'electronics & gadgets' || catLower === 'electronics' || catLower === 'gadgets') {
        targetSlugs = ['electronics'];
      } else {
        targetSlugs = [catLower.replace(/\s+/g, '-')];
      }

      conditions.push({
        OR: [
          { categorySlug: { in: targetSlugs } },
          { category: { slug: { in: targetSlugs } } },
          { category: { name: { equals: category, mode: 'insensitive' } } }
        ]
      });
    }


    // Search query
    if (search && search.trim() !== '') {
      const q = search.trim();
      conditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { supplierName: { contains: q, mode: 'insensitive' } },
          { categorySlug: { contains: q, mode: 'insensitive' } },
          { category: { name: { contains: q, mode: 'insensitive' } } },
        ]
      });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      conditions.push({ price: priceFilter });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc' || sort === 'price_low_high') orderBy = { price: 'asc' };
    if (sort === 'price_desc' || sort === 'price_high_low') orderBy = { price: 'desc' };
    if (sort === 'rating' || sort === 'highest_rating') orderBy = { rating: 'desc' };
    if (sort === 'popular') orderBy = { reviewsCount: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { name: true, slug: true }
          }
        },
        orderBy,
        ...(take !== undefined ? { skip, take } : {})
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = isFetchAll ? 1 : Math.ceil(total / (take || 1));
    const hasMore = isFetchAll ? false : (skip + products.length < total);

    const responsePayload = {
      success: true,
      count: products.length,
      total,
      page: isFetchAll ? 1 : pageNum,
      limit: isFetchAll ? total : take,
      totalPages,
      hasMore,
      data: products
    };

    if (redisClient?.isOpen) {
      redisClient.setEx(cacheKey, 60, JSON.stringify(responsePayload)).catch(() => {});
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * Controller to fetch single product by ID.
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
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
      data: product
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product details',
      error: error.message
    });
  }
};

/**
 * Controller to create a new product in the database.
 */
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      discountPercentage,
      categorySlug,
      categoryName,
      images,
      sizes,
      colors,
      stock = 50,
      isFreeDelivery = true,
      supplierName = 'Verified Supplier',
      rating = 0,
      reviewsCount = 0
    } = req.body;

    if (!title || price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Product title and price are required'
      });
    }

    // Determine category slug
    let targetSlug = categorySlug;
    if (!targetSlug && categoryName) {
      targetSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (!targetSlug) {
      targetSlug = 'women-ethnic';
    }

    // Ensure category exists
    let cat = await prisma.category.findUnique({
      where: { slug: targetSlug }
    });

    if (!cat) {
      cat = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: categoryName || targetSlug, mode: 'insensitive' } },
            { name: { contains: categoryName || targetSlug, mode: 'insensitive' } }
          ]
        }
      });
      if (cat) {
        targetSlug = cat.slug;
      } else {
        try {
          cat = await prisma.category.create({
            data: {
              name: categoryName || targetSlug,
              slug: targetSlug
            }
          });
        } catch (catErr) {
          const fallback = await prisma.category.findFirst();
          if (fallback) {
            targetSlug = fallback.slug;
          }
        }
      }
    }

    const parsedPrice = parseFloat(price);
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : Math.round(parsedPrice * 1.3);
    const parsedDiscount = discountPercentage
      ? parseInt(discountPercentage, 10)
      : Math.max(0, Math.round(((parsedOriginalPrice - parsedPrice) / parsedOriginalPrice) * 100));

    const productImages = Array.isArray(images) && images.filter(Boolean).length > 0
      ? images.filter(Boolean)
      : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'];

    const productSizes = Array.isArray(sizes) ? sizes : [];
    const productColors = Array.isArray(colors) ? colors : [];

    const newProduct = await prisma.product.create({
      data: {
        title,
        description: description || `${title} - Premium quality verified product with free delivery.`,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        discountPercentage: parsedDiscount,
        rating: Number(rating) || 0,
        reviewsCount: parseInt(reviewsCount, 10) || 0,
        categorySlug: targetSlug,
        images: productImages,
        sizes: productSizes,
        colors: productColors,
        stock: parseInt(stock, 10) || 50,
        isFreeDelivery: Boolean(isFreeDelivery),
        supplierName: supplierName || 'Verified Supplier'
      },
      include: {
        category: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Product published successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish product',
      error: error.message
    });
  }
};

/**
 * Controller to update an existing product by ID.
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      originalPrice,
      discountPercentage,
      stock,
      sizes,
      colors,
      images,
      supplierName
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (originalPrice !== undefined) data.originalPrice = parseFloat(originalPrice);
    if (discountPercentage !== undefined) data.discountPercentage = parseInt(discountPercentage, 10);
    if (stock !== undefined) data.stock = parseInt(stock, 10);

    // Arrays parsing from JSON or multipart form-data
    if (sizes !== undefined) {
      if (typeof sizes === 'string') {
        try { data.sizes = JSON.parse(sizes); } catch { data.sizes = sizes.split(',').map((s) => s.trim()).filter(Boolean); }
      } else if (Array.isArray(sizes)) {
        data.sizes = sizes;
      }
    }

    if (colors !== undefined) {
      if (typeof colors === 'string') {
        try { data.colors = JSON.parse(colors); } catch { data.colors = colors.split(',').map((c) => c.trim()).filter(Boolean); }
      } else if (Array.isArray(colors)) {
        data.colors = colors;
      }
    }

    // Handle uploaded files + images array
    let resolvedImages = [];
    if (images !== undefined) {
      if (typeof images === 'string') {
        try { resolvedImages = JSON.parse(images); } catch { resolvedImages = images.split(',').map((s) => s.trim()).filter(Boolean); }
      } else if (Array.isArray(images)) {
        resolvedImages = images;
      }
    }

    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const newUrls = req.files.map((f) => `${baseUrl}/uploads/${f.filename}`);
      resolvedImages = [...resolvedImages, ...newUrls];
    }

    if (resolvedImages.length > 0 || (images !== undefined && Array.isArray(images))) {
      data.images = resolvedImages;
    }

    if (supplierName !== undefined) data.supplierName = supplierName;

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true }
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};


/**
 * Controller to delete a product by ID.
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

    // Soft delete: remove from active carts and wishlists so new customers cannot buy,
    // but PRESERVE all historical orderItems and reviews so past customer orders remain intact!
    const softDeleted = await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.wishlistItem.deleteMany({ where: { productId: id } });
      return await tx.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Product discontinued & soft-deleted successfully. Historical customer orders preserved.',
      deletedProduct: softDeleted
    });
  } catch (error) {
    console.error('Error soft-deleting product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product: ' + error.message,
      error: error.message
    });
  }
};

/**
 * Controller to restore a soft-deleted product back to active catalog.
 */
export const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const restoredProduct = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Product restored to active catalog successfully',
      product: restoredProduct
    });
  } catch (error) {
    console.error('Error restoring product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to restore product: ' + error.message,
      error: error.message
    });
  }
};

