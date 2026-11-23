import prisma from '../config/prisma.js';
import redisClient from '../config/redisClient.js';

/**
 * Controller to fetch all products with optional filters, search, and sorting.
 */
export const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit, all, categories, gender, minRating, minDiscount } = req.query;

    const isFetchAll = all === 'true' || limit === 'all' || limit === '0' || limit === 'max';
    const pageNum = parseInt(page) || 1;
    const take = isFetchAll ? undefined : (parseInt(limit) || 24);
    const skip = isFetchAll ? undefined : ((pageNum - 1) * take);

    // Fast-path: Check Redis cache if running
    const cacheKey = `products:${category || 'all'}:${search || ''}:${categories || ''}:${gender || ''}:${minRating || ''}:${minDiscount || ''}:${minPrice || ''}:${maxPrice || ''}:${sort || 'default'}:${isFetchAll ? 'all' : pageNum}:${isFetchAll ? 'all' : take}`;
    if (redisClient?.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.status(200).json(JSON.parse(cached));
        }
      } catch (cacheErr) {}
    }

    const conditions = [
      { isDeleted: false }, // Soft delete filter: do not show discontinued/deleted products in live catalog
      { isActive: true }, // Only show active products (exclude under-review products)
      { category: { status: 'APPROVED' } } // Category must be approved by admin before appearing in live catalog
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

    // Sidebar multi-category filter with intelligent category rules & negative exclusions
    if (categories && categories.trim() !== '') {
      const catList = categories.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
      const CATEGORY_DEFINITIONS = {
        'women tops and tunics': {
          targetSlugs: ['women-western'],
          terms: ['top', 'tops', 'tunic', 'tunics', 'crop top', 'peplum'],
          negativeTerms: ['laptop', 'desktop', 'tabletop']
        },
        'women tshirts': {
          targetSlugs: ['women-western'],
          terms: ['tshirt', 't-shirt', 'tee']
        },
        'sarees': {
          targetSlugs: ['women-ethnic'],
          terms: ['saree', 'sari']
        },
        'kurtis': {
          targetSlugs: ['women-ethnic'],
          terms: ['kurti', 'kurta', 'anarkali']
        },
        'blouses': {
          targetSlugs: ['women-ethnic'],
          terms: ['blouse']
        },
        'dresses': {
          targetSlugs: ['women-western'],
          terms: ['dress', 'midi', 'maxi', 'frock', 'gown']
        },
        'perfumes': {
          targetSlugs: ['beauty-health'],
          terms: ['perfume', 'edp', 'fragrance', 'body mist', 'deodorant', 'attar', 'cologne']
        },
        'lipsticks': {
          targetSlugs: ['beauty-health'],
          terms: ['lipstick', 'lip gloss', 'lip balm', 'lip crayon', 'matte lip']
        },
        'hair oil': {
          targetSlugs: ['beauty-health'],
          terms: ['hair oil', 'ayurvedic oil', 'oil']
        },
        'handbags': {
          targetSlugs: ['jewellery', 'accessories'],
          terms: ['handbag', 'tote bag', 'sling bag', 'clutch', 'backpack', 'purse', 'bag', 'tote', 'sling']
        },
        'footwear': {
          targetSlugs: ['footwear'],
          terms: ['shoe', 'chappal', 'sandal', 'loafer', 'sneaker', 'clog', 'flat', 'heel', 'footwear', 'boots', 'slippers']
        },
        'audio & earbuds': {
          targetSlugs: ['electronics'],
          terms: ['earbud', 'headphone', 'tws', 'speaker', 'bluetooth', 'earphone', 'neckband']
        },
        'earrings & studs': {
          targetSlugs: ['jewellery'],
          terms: ['earring', 'stud', 'jhumka', 'jhumki', 'bali']
        },
        'analog watches': {
          targetSlugs: ['jewellery', 'electronics'],
          terms: ['watch', 'analog']
        },
        'bedsheets': {
          targetSlugs: ['home-kitchen'],
          terms: ['bedsheet', 'bed sheet', 'bed cover', 'sheet']
        },
        'fridge covers': {
          targetSlugs: ['home-kitchen'],
          terms: ['fridge cover', 'refrigerator cover']
        },
        'appliance covers': {
          targetSlugs: ['home-kitchen'],
          terms: ['appliance cover', 'washing machine cover', 'cover']
        },
        'caps & hats': {
          targetSlugs: ['men', 'women-western', 'kids'],
          terms: ['cap', 'hat', 'beanie'],
          negativeTerms: ['handicap', 'landscape']
        }
      };

      const categoryConditions = catList.map((catKey) => {
        const rule = CATEGORY_DEFINITIONS[catKey];
        if (!rule) {
          const raw = catKey.endsWith('s') ? catKey.slice(0, -1) : catKey;
          return {
            OR: [
              { title: { contains: raw, mode: 'insensitive' } },
              { subCategory: { contains: raw, mode: 'insensitive' } }
            ]
          };
        }

        const andClauses = [];
        if (rule.targetSlugs?.length) {
          andClauses.push({
            OR: [
              { categorySlug: { in: rule.targetSlugs } },
              { category: { slug: { in: rule.targetSlugs } } }
            ]
          });
        }

        const termClauses = rule.terms.flatMap((term) => [
          { title: { contains: term, mode: 'insensitive' } },
          { subCategory: { contains: term, mode: 'insensitive' } }
        ]);
        if (termClauses.length) {
          andClauses.push({ OR: termClauses });
        }

        if (rule.negativeTerms?.length) {
          andClauses.push({
            NOT: rule.negativeTerms.map((neg) => ({
              title: { contains: neg, mode: 'insensitive' }
            }))
          });
        }

        return { AND: andClauses };
      });

      if (categoryConditions.length > 0) {
        conditions.push({ OR: categoryConditions });
      }
    }

    // Gender filter
    if (gender && gender.trim() !== '') {
      const g = gender.trim().toLowerCase();
      if (g === 'men') {
        conditions.push({
          AND: [
            { categorySlug: { notIn: ['women-ethnic', 'women-western'] } },
            {
              OR: [
                { categorySlug: 'men' },
                { title: { contains: 'men', mode: 'insensitive' } },
                { description: { contains: 'men', mode: 'insensitive' } }
              ]
            },
            { title: { not: { contains: 'women', mode: 'insensitive' } } }
          ]
        });
      } else if (g === 'women') {
        conditions.push({
          OR: [
            { categorySlug: { in: ['women-ethnic', 'women-western'] } },
            { title: { contains: 'women', mode: 'insensitive' } },
            { description: { contains: 'women', mode: 'insensitive' } }
          ]
        });
      } else if (g === 'boys' || g === 'boy') {
        conditions.push({
          OR: [
            { title: { contains: 'boy', mode: 'insensitive' } },
            { categorySlug: 'kids' }
          ]
        });
      } else if (g === 'girls' || g === 'girl') {
        conditions.push({
          OR: [
            { title: { contains: 'girl', mode: 'insensitive' } },
            { categorySlug: 'kids' }
          ]
        });
      } else {
        conditions.push({
          OR: [
            { title: { contains: g, mode: 'insensitive' } },
            { description: { contains: g, mode: 'insensitive' } },
            { categorySlug: { contains: g, mode: 'insensitive' } }
          ]
        });
      }
    }

    // Rating filter
    if (minRating) {
      const r = parseFloat(minRating);
      if (!isNaN(r)) {
        conditions.push({ rating: { gte: r } });
      }
    }

    // Discount filter
    if (minDiscount) {
      const d = parseInt(minDiscount);
      if (!isNaN(d)) {
        conditions.push({ discountPercentage: { gte: d } });
      }
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

    // High performance Vercel Edge caching header for sub-300ms global delivery
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
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

    // Dynamic supplier metrics calculated from database
    let supplierStats = {
      productCount: 1,
      rating: product.rating || 4.2,
      totalRatings: product.reviewsCount || 0,
      isVerified: true
    };

    if (product.supplierName) {
      try {
        const [supCount, supAgg] = await Promise.all([
          prisma.product.count({
            where: { supplierName: product.supplierName, isDeleted: false }
          }),
          prisma.product.aggregate({
            where: { supplierName: product.supplierName, isDeleted: false },
            _avg: { rating: true },
            _sum: { reviewsCount: true }
          })
        ]);

        supplierStats = {
          productCount: supCount || 1,
          rating: Number(supAgg._avg.rating ? supAgg._avg.rating.toFixed(1) : (product.rating || 4.2)),
          totalRatings: Number(supAgg._sum.reviewsCount !== null && supAgg._sum.reviewsCount !== undefined ? supAgg._sum.reviewsCount : (product.reviewsCount || 0)),
          isVerified: true
        };
      } catch (e) {
        console.warn('Failed to calculate dynamic supplier metrics:', e?.message || e);
      }
    }

    // High performance Vercel Edge caching header for sub-300ms global delivery
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      success: true,
      data: {
        ...product,
        supplierStats
      }
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
      videoUrl,
      videoType,
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
        videoUrl: (videoUrl || '').trim() || null,
        videoType: (videoType || '').trim() || null,
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
    if (req.body.videoUrl !== undefined) data.videoUrl = (req.body.videoUrl || '').trim() || null;
    if (req.body.videoType !== undefined) data.videoType = (req.body.videoType || '').trim() || null;

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

