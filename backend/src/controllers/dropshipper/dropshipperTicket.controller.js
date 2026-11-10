import prisma from '../../config/prisma.js';

/**
 * 1. Create a Support Dispute / Ticket for Dropshipper
 * POST /api/v1/dropshipper/tickets
 */
export const createDropshipperTicket = async (req, res) => {
  try {
    const {
      firebaseUid,
      subject,
      description,
      category = 'COURIER_DELAY',
      categoryLabel,
      priority = 'HIGH',
      orderId,
      awb,
      dropshipperName = 'You',
      attachments = [],
      unboxingLink = ''
    } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid is required' });
    }
    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    // Verify or ensure profile
    let profile = await prisma.profile.findUnique({
      where: { id: firebaseUid }
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: firebaseUid,
          fullName: dropshipperName || 'Dropshipper Partner',
          role: 'DROPSHIPPER'
        }
      });
    }

    const categoryMap = {
      'COURIER_DELAY': 'Courier In-Transit Stuck > 48h',
      'DAMAGED_ITEM': 'Customer Received Damaged Parcel',
      'MARGIN_DISPUTE': 'Escrow Margin Deduction Discrepancy',
      'SUPPLIER_MISPACK': 'Wrong Item Shipped by Supplier',
      'RTO_PENALTY': 'Dispute RTO Freight Liability Charge',
      'ACCOUNT_KYC': 'Account & KYC Verification'
    };

    const finalCategoryLabel = categoryLabel || categoryMap[category] || category;

    // Structured metadata & messages array
    const metaPayload = {
      initialText: description,
      orderId: orderId || null,
      awb: awb || null,
      categoryKey: category,
      categoryLabel: finalCategoryLabel,
      attachments: Array.isArray(attachments) ? attachments : (attachments ? [attachments] : []),
      unboxingLink: unboxingLink ? unboxingLink.trim() : null,
      messages: [
        {
          sender: 'dropshipper',
          name: dropshipperName || 'You',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          text: description
        }
      ]
    };

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: profile.id,
        subject,
        description: JSON.stringify(metaPayload),
        category: category,
        priority: (priority || 'high').toLowerCase(),
        status: 'OPEN'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket raised successfully in database!',
      ticket: {
        id: `TCK-${ticket.id.slice(0, 8).toUpperCase()}`,
        dbId: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        categoryLabel: finalCategoryLabel,
        orderId: orderId || 'General',
        awb: awb || 'N/A',
        priority: ticket.priority.toUpperCase(),
        status: ticket.status,
        createdAt: new Date(ticket.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        lastUpdate: 'Just now',
        attachments: metaPayload.attachments,
        unboxingLink: metaPayload.unboxingLink,
        messages: metaPayload.messages
      }
    });

  } catch (error) {
    console.error('Error in createDropshipperTicket:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to raise support ticket',
      error: error.message
    });
  }
};

/**
 * Helper to resolve db ticket id from TCK- or direct UUID
 */
const resolveTicketDbId = async (ticketId) => {
  if (!ticketId) return null;
  if (ticketId.startsWith('TCK-')) {
    const hex = ticketId.replace('TCK-', '').toLowerCase();
    const matched = await prisma.supportTicket.findFirst({
      where: { id: { startsWith: hex, mode: 'insensitive' } }
    });
    return matched ? matched.id : null;
  }
  return ticketId;
};

/**
 * 2. Get All Tickets for Dropshipper
 * GET /api/v1/dropshipper/tickets/:firebaseUid
 */
export const getDropshipperTickets = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'firebaseUid param is required' });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: firebaseUid },
      orderBy: { createdAt: 'desc' }
    });

    const categoryMap = {
      'COURIER_DELAY': 'Courier In-Transit Stuck > 48h',
      'DAMAGED_ITEM': 'Customer Received Damaged Parcel',
      'MARGIN_DISPUTE': 'Escrow Margin Deduction Discrepancy',
      'SUPPLIER_MISPACK': 'Wrong Item Shipped by Supplier',
      'RTO_PENALTY': 'Dispute RTO Freight Liability Charge',
      'ACCOUNT_KYC': 'Account & KYC Verification'
    };

    const formatted = tickets.map(t => {
      let meta = null;
      try {
        meta = JSON.parse(t.description);
      } catch (e) {
        meta = null;
      }

      const orderId = meta?.orderId || (t.description.match(/\[Related Order:\s*([^\]]+)\]/)?.[1]) || 'General';
      const awb = meta?.awb || 'N/A';
      const categoryLabel = meta?.categoryLabel || categoryMap[t.category] || t.category;

      const messages = meta?.messages || [
        {
          sender: 'dropshipper',
          name: 'You',
          time: new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          text: meta?.initialText || t.description
        }
      ];

      return {
        id: `TCK-${t.id.slice(0, 8).toUpperCase()}`,
        dbId: t.id,
        subject: t.subject,
        category: t.category,
        categoryLabel,
        orderId,
        awb,
        priority: t.priority.toUpperCase(),
        status: t.status,
        createdAt: new Date(t.createdAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        lastUpdate: new Date(t.updatedAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        attachments: meta?.attachments || [],
        unboxingLink: meta?.unboxingLink || null,
        messages
      };
    });

    return res.status(200).json({
      success: true,
      totalCount: formatted.length,
      tickets: formatted
    });

  } catch (error) {
    console.error('Error in getDropshipperTickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve tickets',
      error: error.message
    });
  }
};

/**
 * 3. Reply to an Existing Ticket (Live Conversation Thread)
 * POST /api/v1/dropshipper/tickets/:ticketId/reply
 */
export const replyDropshipperTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text, sender = 'dropshipper', name = 'You' } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, message: 'ticketId param is required' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty' });
    }

    const dbId = await resolveTicketDbId(ticketId);
    if (!dbId) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: dbId }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    let meta = null;
    try {
      meta = JSON.parse(ticket.description);
    } catch (e) {
      meta = {
        initialText: ticket.description,
        orderId: null,
        awb: null,
        categoryLabel: ticket.category,
        messages: [
          {
            sender: 'dropshipper',
            name: 'You',
            time: new Date(ticket.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            text: ticket.description
          }
        ]
      };
    }

    const newMsg = {
      sender,
      name,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: text.trim()
    };

    const updatedMessages = [...(meta.messages || []), newMsg];
    const updatedMeta = {
      ...meta,
      messages: updatedMessages
    };

    // If ticket was closed or resolved, reopen it to IN_PROGRESS upon new message
    let nextStatus = ticket.status;
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      nextStatus = 'IN_PROGRESS';
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: dbId },
      data: {
        description: JSON.stringify(updatedMeta),
        status: nextStatus,
        updatedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Reply posted successfully',
      newMsg,
      ticketStatus: updatedTicket.status,
      messages: updatedMessages
    });

  } catch (error) {
    console.error('Error in replyDropshipperTicket:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post reply',
      error: error.message
    });
  }
};

/**
 * 4. Update Ticket Status (Mark Resolved / Closed / In Progress)
 * PUT /api/v1/dropshipper/tickets/:ticketId/status
 */
export const updateDropshipperTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const dbId = await resolveTicketDbId(ticketId);
    if (!dbId) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: dbId },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      message: `Ticket marked as ${status}`,
      status: updated.status
    });

  } catch (error) {
    console.error('Error in updateDropshipperTicketStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message
    });
  }
};
