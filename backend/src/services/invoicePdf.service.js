import PDFDocument from 'pdfkit';

/**
 * Generates an official Tax Invoice & Shipping Label PDF stream
 * @param {Object} order - Full order object with items, product, and shipping info
 * @param {Object} supplier - Supplier profile with GSTIN, business name, address
 * @param {string} mode - 'invoice' | 'label'
 * @returns {PDFDocument} - Streaming PDFDocument instance
 */
export function generateOrderPdf(order, supplier = {}, mode = 'invoice') {
  const isInvoice = mode === 'invoice';
  
  // A4 size for Invoice, 4x6 inch (288 x 432 pt) for Thermal Shipping Label
  const doc = new PDFDocument({
    size: isInvoice ? 'A4' : [288, 432],
    margin: isInvoice ? 36 : 14,
    info: {
      Title: `${isInvoice ? 'Tax Invoice' : 'Shipping Label'} - ${order.id}`,
      Author: 'MShoppy Social Commerce',
      Subject: 'Order Fulfillment Document',
    },
  });

  const primarySupplierName = supplier?.businessName || supplier?.tradeName || supplier?.name || 'Balaji Fashion Hub';
  const supplierGstin = supplier?.gstin || supplier?.gstNumber || '07AABCB1234F1Z8';
  const supplierAddress = supplier?.warehouseAddress || supplier?.pickupAddress || supplier?.address || 'Plot 42, Textile Market, Surat, Gujarat - 395002';
  const supplierPhone = supplier?.warehousePhone || supplier?.phone || '+91 9876543210';

  let shipping = {};
  if (typeof order.shippingAddress === 'string') {
    try {
      shipping = JSON.parse(order.shippingAddress || '{}');
    } catch {
      shipping = {};
    }
  } else if (order.shippingAddress) {
    shipping = order.shippingAddress;
  }

  const customerName = shipping.fullName || shipping.name || order.user?.name || 'Valued Customer';
  const customerPhone = shipping.phone || order.user?.phone || 'Not provided';
  const customerAddress = [
    shipping.addressLine1 || shipping.street || shipping.address,
    shipping.addressLine2,
    shipping.city,
    shipping.state,
    shipping.pincode || shipping.pin,
  ].filter(Boolean).join(', ') || 'Address on file';

  const courierName = shipping.courier || shipping.courierPartner || 'Delhivery Express';
  const awbNumber = shipping.awb || shipping.trackingNumber || `DEL${order.id.slice(0, 10).toUpperCase()}`;
  const isCod = (order.paymentMethod || 'COD').toUpperCase() === 'COD';
  const scopedItemsTotal = Array.isArray(order.items) && order.items.length > 0
    ? order.items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0)
    : Number(order.totalAmount || 0);
  const totalAmount = scopedItemsTotal;

  // Calculations for 5% GST
  const taxableAmount = Math.round((totalAmount / 1.05) * 100) / 100;
  const gstAmount = Math.round((totalAmount - taxableAmount) * 100) / 100;
  const halfGst = Math.round((gstAmount / 2) * 100) / 100;

  if (!isInvoice) {
    // ==========================================
    // MODE: 4x6 THERMAL SHIPPING LABEL
    // ==========================================
    doc.lineWidth(1.5).rect(10, 10, 268, 412).stroke('#000000');

    // Header Badge
    doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text('MSHOPPY LOGISTICS', 18, 18);
    doc.fontSize(8).font('Helvetica').text('Express Surface Delivery', 18, 34);

    // COD / Prepaid Badge
    const badgeText = isCod ? `COD: Rs. ${totalAmount.toLocaleString('en-IN')}` : 'PREPAID';
    doc.rect(170, 16, 100, 22).fillAndStroke('#000000', '#000000');
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(badgeText, 172, 22, { width: 96, align: 'center' });

    // Divider
    doc.moveTo(10, 48).lineTo(278, 48).lineWidth(1).stroke('#000000');

    // Routing & Courier Info
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text(`COURIER: ${courierName.toUpperCase()}`, 18, 56);
    doc.fontSize(10).font('Helvetica-Bold').text(`AWB: ${awbNumber}`, 18, 68);

    // Barcode Representation
    doc.rect(18, 84, 252, 38).fill('#000000');
    doc.fillColor('#FFFFFF').fontSize(8).font('Courier-Bold').text(`*${awbNumber}*`, 18, 98, { width: 252, align: 'center' });

    // Divider
    doc.moveTo(10, 130).lineTo(278, 130).lineWidth(1).stroke('#000000');

    // Ship To Section
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('SHIP TO (DELIVERY ADDRESS):', 18, 138);
    doc.fontSize(10).font('Helvetica-Bold').text(customerName, 18, 150);
    doc.fontSize(8).font('Helvetica').text(`Ph: ${customerPhone}`, 18, 164);
    doc.fontSize(8).font('Helvetica').text(customerAddress, 18, 176, { width: 250 });

    // Divider
    doc.moveTo(10, 230).lineTo(278, 230).lineWidth(0.5).stroke('#777777');

    // Return to Origin / Seller Section
    doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold').text('RETURN TO (SELLER RTO HUB):', 18, 238);
    doc.fontSize(9).font('Helvetica-Bold').text(primarySupplierName, 18, 250);
    doc.fontSize(8).font('Helvetica').text(`GSTIN: ${supplierGstin}`, 18, 262);
    doc.fontSize(7.5).font('Helvetica').text(supplierAddress, 18, 274, { width: 250 });
    doc.fontSize(7.5).font('Helvetica').text(`Phone: ${supplierPhone}`, 18, 298);

    // Divider
    doc.moveTo(10, 314).lineTo(278, 314).lineWidth(1).stroke('#000000');

    // Item summary
    doc.fontSize(8).font('Helvetica-Bold').text(`ORDER #${order.id.slice(0, 12).toUpperCase()}`, 18, 322);
    const firstItem = order.items?.[0];
    const itemTitle = firstItem?.product?.title || 'E-Commerce Retail Item';
    doc.fontSize(7.5).font('Helvetica').text(`${itemTitle.slice(0, 40)} (Qty: ${firstItem?.quantity || 1})`, 18, 334);
    doc.fontSize(7).font('Helvetica-Oblique').text('Package inspected for safe transit. Non-hazardous commercial merchandise.', 18, 350, { width: 250 });

    // Footer
    doc.rect(10, 396, 268, 26).fill('#F3F4F6');
    doc.fillColor('#333333').fontSize(7).font('Helvetica').text('Track at mshoppy.com/track • 24x7 Support: support@mshoppy.com', 14, 405, { width: 260, align: 'center' });

  } else {
    // ==========================================
    // MODE: FULL A4 TAX INVOICE
    // ==========================================
    // Top Brand Bar
    doc.rect(36, 36, 523, 40).fill('#B7004D');
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('MSHOPPY SOCIAL COMMERCE', 48, 44);
    doc.fontSize(9).font('Helvetica').text('OFFICIAL GST TAX INVOICE / CASH BILL', 48, 62);
    doc.fontSize(9).font('Helvetica-Bold').text('ORIGINAL FOR RECIPIENT', 400, 52, { width: 145, align: 'right' });

    // Invoice Meta Information Box
    doc.fillColor('#1E293B').fontSize(9).font('Helvetica-Bold').text('INVOICE DETAILS', 36, 92);
    doc.font('Helvetica').fontSize(8.5);
    doc.text(`Invoice No: MSH-INV-${order.id.slice(0, 8).toUpperCase()}`, 36, 106);
    doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 36, 118);
    doc.text(`Order ID: #${order.id.toUpperCase()}`, 36, 130);
    doc.text(`Payment Mode: ${order.paymentMethod || 'COD'}`, 36, 142);

    doc.fontSize(9).font('Helvetica-Bold').text('LOGISTICS & SHIPMENT', 320, 92);
    doc.font('Helvetica').fontSize(8.5);
    doc.text(`Courier Partner: ${courierName}`, 320, 106);
    doc.text(`AWB Tracking No: ${awbNumber}`, 320, 118);
    doc.text(`Place of Supply: ${shipping.state || 'India'}`, 320, 130);
    doc.text(`Reverse Charge (RCM): No`, 320, 142);

    // Horizontal Line
    doc.moveTo(36, 160).lineTo(559, 160).lineWidth(1).stroke('#CBD5E1');

    // Supplier vs Customer Columns
    // Supplier (Sold By)
    doc.fillColor('#0F172A').fontSize(9.5).font('Helvetica-Bold').text('SOLD BY / SUPPLIER:', 36, 172);
    doc.font('Helvetica-Bold').fontSize(9).text(primarySupplierName, 36, 186);
    doc.font('Helvetica').fontSize(8);
    doc.text(`GSTIN: ${supplierGstin}`, 36, 198);
    doc.text(`Address: ${supplierAddress}`, 36, 210, { width: 240 });
    doc.text(`Support Contact: ${supplierPhone}`, 36, 234);

    // Customer (Bill To & Ship To)
    doc.fillColor('#0F172A').fontSize(9.5).font('Helvetica-Bold').text('BILL TO & SHIP TO:', 320, 172);
    doc.font('Helvetica-Bold').fontSize(9).text(customerName, 320, 186);
    doc.font('Helvetica').fontSize(8);
    doc.text(`Contact: ${customerPhone}`, 320, 198);
    doc.text(`Address: ${customerAddress}`, 320, 210, { width: 240 });

    // Table Header
    doc.rect(36, 260, 523, 22).fill('#F1F5F9');
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica-Bold');
    doc.text('#', 44, 267);
    doc.text('ITEM DESCRIPTION', 64, 267);
    doc.text('HSN', 270, 267);
    doc.text('QTY', 320, 267);
    doc.text('RATE (INR)', 360, 267);
    doc.text('GST %', 430, 267);
    doc.text('TOTAL (INR)', 485, 267, { width: 66, align: 'right' });

    // Table Rows
    let y = 290;
    const items = order.items && order.items.length > 0 ? order.items : [];
    
    if (items.length === 0) {
      doc.font('Helvetica').fontSize(8).text('1', 44, y);
      doc.text('Standard Commercial E-commerce Wholesale Package', 64, y, { width: 195 });
      doc.text('6204', 270, y);
      doc.text('1', 320, y);
      doc.text(totalAmount.toFixed(2), 360, y);
      doc.text('5%', 430, y);
      doc.text(totalAmount.toFixed(2), 485, y, { width: 66, align: 'right' });
      y += 28;
    } else {
      items.forEach((item, index) => {
        const itemPrice = Number(item.price || 0);
        const itemQty = Number(item.quantity || 1);
        const itemLineTotal = itemPrice * itemQty;
        const itemTitle = item.product?.title || 'E-Commerce Apparel / Merchandise';

        doc.fillColor('#334155').font('Helvetica').fontSize(8);
        doc.text(`${index + 1}`, 44, y);
        doc.text(itemTitle.slice(0, 50), 64, y, { width: 195 });
        doc.text('6204', 270, y);
        doc.text(`${itemQty}`, 320, y);
        doc.text(itemPrice.toFixed(2), 360, y);
        doc.text('5%', 430, y);
        doc.text(itemLineTotal.toFixed(2), 485, y, { width: 66, align: 'right' });

        y += 24;
      });
    }

    // Divider Line
    doc.moveTo(36, y + 4).lineTo(559, y + 4).lineWidth(0.5).stroke('#CBD5E1');
    y += 14;

    // Tax Summary Box
    doc.rect(310, y, 249, 105).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica');
    
    doc.text('Taxable Value:', 324, y + 10);
    doc.text(`Rs. ${taxableAmount.toFixed(2)}`, 460, y + 10, { width: 90, align: 'right' });

    doc.text('CGST (2.5%):', 324, y + 26);
    doc.text(`Rs. ${halfGst.toFixed(2)}`, 460, y + 26, { width: 90, align: 'right' });

    doc.text('SGST (2.5%):', 324, y + 42);
    doc.text(`Rs. ${halfGst.toFixed(2)}`, 460, y + 42, { width: 90, align: 'right' });

    doc.text('Shipping / Delivery Fee:', 324, y + 58);
    doc.text('FREE (Rs. 0.00)', 460, y + 58, { width: 90, align: 'right' });

    doc.moveTo(320, y + 74).lineTo(550, y + 74).lineWidth(1).stroke('#CBD5E1');

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Grand Total:', 324, y + 84);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 440, y + 84, { width: 110, align: 'right' });

    // Terms & Signatory
    doc.fillColor('#64748B').fontSize(7.5).font('Helvetica');
    doc.text('Terms & Conditions:', 36, y + 10);
    doc.text('1. Goods once sold are covered under Meesho 7-day hassle-free replacement policy.', 36, y + 22, { width: 250 });
    doc.text('2. All disputes subject to Surat jurisdiction.', 36, y + 34, { width: 250 });
    doc.text('3. This invoice is digitally generated under Section 31 of CGST Act 2017.', 36, y + 46, { width: 250 });

    doc.rect(36, y + 70, 250, 45).fill('#F1F5F9');
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica-Bold').text('AUTHORIZED SIGNATORY', 44, y + 78);
    doc.fontSize(7).font('Helvetica').text(`Digitally signed on behalf of ${primarySupplierName}`, 44, y + 92);
    doc.text('Computer Generated Document • No Physical Signature Required', 44, y + 102);
  }

  doc.end();
  return doc;
}

