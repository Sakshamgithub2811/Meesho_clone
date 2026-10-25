import prisma from '../../config/prisma.js';

/**
 * 1. GET FINANCE OVERVIEW, WALLETS & TRANSACTIONS
 * Query Params: ?role=DROPSHIPPER&type=credit&search=Ramesh
 */
export const getFinanceOverview = async (req, res) => {
  try {
    const { role, type, search } = req.query;

    const walletWhere = {};
    if (role && role.toUpperCase() !== 'ALL') {
      walletWhere.user = { role: role.toUpperCase() };
    }

    if (search && search.trim()) {
      const q = search.trim();
      walletWhere.user = {
        ...walletWhere.user,
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { storeName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } }
        ]
      };
    }

    const txWhere = {};
    if (type && type.toLowerCase() !== 'all') {
      txWhere.type = type.toLowerCase();
    }

    const [
      wallets,
      transactions,
      orders,
      allWallets
    ] = await Promise.all([
      prisma.wallet.findMany({
        where: walletWhere,
        orderBy: [{ balance: 'desc' }, { updatedAt: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              storeName: true,
              email: true,
              phone: true,
              role: true,
              avatarUrl: true,
              bankDetails: true
            }
          },
          _count: {
            select: { transactions: true }
          }
        }
      }),
      prisma.walletTransaction.findMany({
        where: txWhere,
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  storeName: true,
                  role: true
                }
              }
            }
          }
        }
      }),
      prisma.order.findMany({
        select: { totalAmount: true, paymentStatus: true }
      }),
      prisma.wallet.findMany({
        select: { balance: true, pending: true }
      })
    ]);

    const totalEscrow = allWallets.reduce((acc, w) => acc + (w.balance || 0), 0);
    const totalPending = allWallets.reduce((acc, w) => acc + (w.pending || 0), 0);
    const grossVolume = orders.reduce((acc, o) => acc + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
    const platformCommissions = Number((grossVolume * 0.05 + 1250).toFixed(2));

    const stats = {
      totalEscrowBalance: Number(totalEscrow.toFixed(2)),
      totalPendingWithdrawals: Number(totalPending.toFixed(2)),
      grossMarketplaceVolume: Number(grossVolume.toFixed(2)),
      platformCommissions,
      activeWalletsCount: allWallets.length,
      totalTransactionsCount: transactions.length
    };

    return res.status(200).json({
      success: true,
      stats,
      wallets,
      transactions
    });
  } catch (error) {
    console.error('Error fetching finance overview:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch finance records',
      error: error.message
    });
  }
};

/**
 * 2. ADJUST WALLET BALANCE (CREDIT / DEBIT)
 */
export const adjustWalletBalance = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { amount, type, description } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const normType = (type || 'credit').toLowerCase();
    if (!['credit', 'debit'].includes(normType)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be credit or debit'
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      include: { user: true }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (normType === 'debit' && wallet.balance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance (Current: ₹${wallet.balance})`
      });
    }

    const newBalance = normType === 'credit'
      ? wallet.balance + numAmount
      : wallet.balance - numAmount;

    // Transactional update
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId,
          amount: numAmount,
          type: normType,
          description: description || `Manual admin adjustment (${normType.toUpperCase()})`
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: `Wallet successfully ${normType === 'credit' ? 'credited' : 'debited'} with ₹${numAmount}`,
      wallet: updatedWallet,
      transaction
    });
  } catch (error) {
    console.error('Error adjusting wallet balance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to adjust wallet balance',
      error: error.message
    });
  }
};
