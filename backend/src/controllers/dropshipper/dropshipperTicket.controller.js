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
      category = 'Settlement & Escrow',
      priority = 'normal',
      orderId
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
          fullName: 'Dropshipper Partner',
          role: 'DROPSHIPPER'
        }
      });
    }

    const fullDescription = orderId 
      ? `[Related Order: ${orderId}]\n\n${description}`
      : description;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: profile.id,
        subject,
        description: fullDescription,
        category,
        priority: priority.toLowerCase(),
        status: 'OPEN'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Support ticket raised successfully!',
      ticket: {
        id: `TCK-${ticket.id.slice(0, 8).toUpperCase()}`,
        dbId: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        date: new Date(ticket.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        unread: false,
        messages: [
          {
            sender: 'You',
            text: fullDescription,
            time: 'Just now',
            isAgent: false
          }
        ]
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

    const formatted = tickets.map(t => ({
      id: `TCK-${t.id.slice(0, 8).toUpperCase()}`,
      dbId: t.id,
      subject: t.subject,
      category: t.category,
      priority: t.priority.toUpperCase(),
      status: t.status,
      date: new Date(t.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      description: t.description,
      unread: false,
      messages: [
        {
          sender: 'You',
          text: t.description,
          time: new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          isAgent: false
        }
      ]
    }));

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
