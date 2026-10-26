import prisma from '../../config/prisma.js';

/**
 * 1. Push a Single Dropshipper Customer Order to Suppliers
 * POST /api/v1/dropshipper/orders/push
 */
export const pushDropshipperOrder = async (req, res) => {
  try {
    const {
      firebaseUid,
      customerName,
      customerPhone,
      altPhone,
      address,
      city,
      state,
      pincode,
      landmark,
      productId,
      productSku,
      productName,
      quantity = 1,
      wholesaleCost = 500,
      customerPrice = 999,
      shippingFee = 60,
      paymentMode = 'COD',
      whiteLabelStoreName = 'Aura Boutique'
    } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid is required' });
    }
    if (!customerName || !customerPhone || !address || !pincode) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, address, and pincode are required' });
    }

    // 1. Verify Profile exists
    let profile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (!profile) {
      // Auto-create or fallback if not found
      profile = await prisma.profile.create({
        data: {
          id: firebaseUid,
          fullName: 'Dropshipper Partner',
          role: 'DROPSHIPPER',
          storeName: whiteLabelStoreName
        }
      });
    }

    // 2. Resolve Product ID
    let resolvedProduct = null;
    if (productId) {
      resolvedProduct = await prisma.product.findUnique({ where: { id: productId } });
    }
    if (!resolvedProduct) {
      // Find first existing product in database to link OrderItem
      resolvedProduct = await prisma.product.findFirst();
    }

    const calculatedMargin = Math.max(0, Number(customerPrice) - (Number(wholesaleCost) * Number(quantity)) - Number(shippingFee));
    const randomAwb = `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const shippingAddressPayload = {
      fullName: customerName,
      phone: customerPhone,
      altPhone: altPhone || null,
      addressLine: address,
      city: city || 'City',
      state: state || 'State',
      pincode: pincode,
      landmark: landmark || null,
      whiteLabelStoreName: whiteLabelStoreName || profile.storeName || 'Fashion Hub',
      productName: productName || resolvedProduct?.title || 'Wholesale Sourced Item',
      productSku: productSku || 'SKU-DS-01',
      quantity: Number(quantity),
      wholesaleCost: Number(wholesaleCost) * Number(quantity),
      customerPrice: Number(customerPrice),
      shippingFee: Number(shippingFee),
      dropshipperMargin: calculatedMargin,
      courier: 'Delhivery Express',
      awb: randomAwb,
      paymentMode: paymentMode.toUpperCase()
    };

    // 3. Create Order & OrderItem in Database Transaction
    const newOrder = await prisma.order.create({
      data: {
        userId: profile.id,
        totalAmount: Number(customerPrice),
        shippingAddress: shippingAddressPayload,
        paymentMethod: paymentMode.toUpperCase() === 'COD' ? 'COD' : 'UPI',
        paymentStatus: paymentMode.toUpperCase() === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'ORDERED',
        ...(resolvedProduct && {
          items: {
            create: {
              productId: resolvedProduct.id,
              quantity: Number(quantity),
              price: Number(customerPrice)
            }
          }
        })
      },
      include: {
        items: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Dropshipper order pushed to supplier successfully!',
      order: {
        id: newOrder.id,
        orderNumber: `DSP-${newOrder.id.slice(0, 8).toUpperCase()}`,
        date: newOrder.createdAt,
        customerName,
        customerPhone,
        city,
        state,
        pincode,
        productName: shippingAddressPayload.productName,
        sku: shippingAddressPayload.productSku,
        qty: Number(quantity),
        wholesaleCost: shippingAddressPayload.wholesaleCost,
        customerPrice: Number(customerPrice),
        shippingFee: Number(shippingFee),
        margin: calculatedMargin,
        paymentMode: paymentMode.toUpperCase(),
        status: newOrder.orderStatus,
        courier: shippingAddressPayload.courier,
        awb: shippingAddressPayload.awb
      }
    });

  } catch (error) {
    console.error('Error in pushDropshipperOrder:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to push order to supplier',
      error: error.message
    });
  }
};

/**
 * 2. Push Bulk Orders Batch
 * POST /api/v1/dropshipper/orders/bulk-push
 */
export const pushBulkDropshipperOrders = async (req, res) => {
  try {
    const { firebaseUid, orders = [], whiteLabelStoreName } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid is required' });
    }
    if (!orders || orders.length === 0) {
      return res.status(400).json({ success: false, message: 'No orders provided in batch' });
    }

    const fallbackProduct = await prisma.product.findFirst();
    const createdOrders = [];
    let totalBatchMargin = 0;

    for (const item of orders) {
      const wholesale = Number(item.wholesaleCost || item.wholesale || 500);
      const selling = Number(item.customerPrice || item.selling || 999);
      const qty = Number(item.quantity || item.qty || 1);
      const shipping = Number(item.shippingFee || 60);
      const margin = Math.max(0, selling - (wholesale * qty) - shipping);
      totalBatchMargin += margin;

      const randomAwb = `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      const shippingAddress = {
        fullName: item.customerName || item.name || 'Valued Customer',
        phone: item.customerPhone || item.phone || '9800000000',
        addressLine: item.address || 'Address provided via CSV',
        city: item.city || 'City',
        state: item.state || 'India',
        pincode: item.pincode || item.pin || '400001',
        whiteLabelStoreName: whiteLabelStoreName || 'Dropship Store',
        productName: item.productName || item.product || 'Catalog Product',
        productSku: item.productSku || item.sku || 'SKU-BULK',
        quantity: qty,
        wholesaleCost: wholesale * qty,
        customerPrice: selling,
        shippingFee: shipping,
        dropshipperMargin: margin,
        courier: 'Delhivery Surface',
        awb: randomAwb,
        paymentMode: (item.paymentMode || item.mode || 'COD').toUpperCase()
      };

      const order = await prisma.order.create({
        data: {
          userId: firebaseUid,
          totalAmount: selling,
          shippingAddress,
          paymentMethod: shippingAddress.paymentMode === 'COD' ? 'COD' : 'UPI',
          paymentStatus: shippingAddress.paymentMode === 'COD' ? 'PENDING' : 'PAID',
          orderStatus: 'ORDERED',
          ...(fallbackProduct && {
            items: {
              create: {
                productId: fallbackProduct.id,
                quantity: qty,
                price: selling
              }
            }
          })
        }
      });

      createdOrders.push({
        id: order.id,
        orderNumber: `DSP-${order.id.slice(0, 8).toUpperCase()}`,
        customerName: shippingAddress.fullName,
        productName: shippingAddress.productName,
        customerPrice: selling,
        margin,
        paymentMode: shippingAddress.paymentMode,
        status: order.orderStatus,
        courier: shippingAddress.courier,
        awb: shippingAddress.awb
      });
    }

    return res.status(201).json({
      success: true,
      message: `Batch of ${createdOrders.length} orders successfully pushed to suppliers!`,
      totalOrders: createdOrders.length,
      totalBatchMargin,
      orders: createdOrders
    });

  } catch (error) {
    console.error('Error in pushBulkDropshipperOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process bulk orders batch',
      error: error.message
    });
  }
};

/**
 * 3. Fetch All Pushed Orders for Dropshipper
 * GET /api/v1/dropshipper/orders/:firebaseUid
 */
export const getDropshipperOrders = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid param is required' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: firebaseUid },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const formattedOrders = orders.map(o => {
      const addr = (typeof o.shippingAddress === 'object' && o.shippingAddress !== null)
        ? o.shippingAddress
        : {};

      return {
        id: `DSP-${o.id.slice(0, 8).toUpperCase()}`,
        dbId: o.id,
        date: new Date(o.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        customerName: addr.fullName || 'Customer',
        customerPhone: addr.phone || '-',
        city: addr.city || 'City',
        state: addr.state || 'State',
        pincode: addr.pincode || '-',
        productName: addr.productName || o.items?.[0]?.product?.title || 'Sourced Item',
        sku: addr.productSku || 'SKU-DS',
        qty: addr.quantity || o.items?.[0]?.quantity || 1,
        wholesaleCost: addr.wholesaleCost || (o.totalAmount * 0.6),
        customerPrice: o.totalAmount,
        shippingFee: addr.shippingFee || 60,
        margin: addr.dropshipperMargin || Math.max(0, o.totalAmount * 0.3),
        paymentMode: addr.paymentMode || o.paymentMethod || 'COD',
        status: o.orderStatus === 'ORDERED' ? 'DISPATCHED' : o.orderStatus,
        courier: addr.courier || 'Delhivery Express',
        awb: addr.awb || `DEL-${o.id.slice(0, 10)}`
      };
    });

    return res.status(200).json({
      success: true,
      totalCount: formattedOrders.length,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error in getDropshipperOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};
