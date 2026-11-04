import prisma from '../../config/prisma.js';

/**
 * 1. GET ALL SUPPORT TICKETS FOR ADMIN (With Filters, Search & Summary KPIs)
 * Supports query params: ?status=OPEN&priority=high&search=kunal
 */
export const getAllSupportTickets = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const where = {};

    // 1. Status Filter (ALL | OPEN | IN_PROGRESS | RESOLVED | CLOSED)
    if (status && status.toUpperCase() !== 'ALL') {
      where.status = status.toUpperCase();
    }

    // 2. Priority Filter (ALL | urgent | high | normal | low)
    if (priority && priority.toUpperCase() !== 'ALL') {
      where.priority = priority.toLowerCase();
    }

    // 3. Search Filter
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
              { storeName: { contains: q, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    // Parallel fetching tickets and KPI counters
    const [
      tickets,
      totalCount,
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount
    ] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              avatarUrl: true,
              storeName: true,
              tier: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
    ]);

    res.status(200).json({
      success: true,
      data: tickets,
      stats: {
        totalTickets: totalCount,
        openTickets: openCount,
        inProgressTickets: inProgressCount,
        resolvedTickets: resolvedCount,
        closedTickets: closedCount,
      }
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching support tickets',
      error: error.message
    });
  }
};

/**
 * 2. GET SINGLE TICKET DETAILS
 */
export const getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            avatarUrl: true,
            storeName: true,
            tier: true,
            rating: true,
            createdAt: true,
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ticket details'
    });
  }
};

/**
 * 3. UPDATE TICKET STATUS (Resolve / In Progress / Close)
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          }
        }
      }
    });

    // Optional: Send in-app notification to the user if ticket was resolved or changed
    if (existing.userId) {
      try {
        await prisma.notification.create({
          data: {
            userId: existing.userId,
            title: `Support Ticket Status: ${status}`,
            body: adminNotes || `Your ticket regarding "${existing.subject}" has been updated to ${status}.`,
            type: 'system',
            data: { ticketId: id, status }
          }
        });
      } catch (notifErr) {
        console.warn('Could not create notification for user:', notifErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Ticket successfully marked as ${status}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating ticket status',
      error: error.message
    });
  }
};
