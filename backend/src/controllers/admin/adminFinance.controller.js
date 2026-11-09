import prisma from '../../config/prisma.js';
import { getDirectSettings } from './adminSettings.controller.js';

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
    
    // Read dynamic platform commission rate
    const currentSettings = getDirectSettings();
    const activeCommissionRate = (currentSettings.commissionRate ?? 5.0) / 100;
    const platformCommissions = Number((grossVolume * activeCommissionRate + 1250).toFixed(2));

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

/**
 * Helper to compute payout status, UTR, and destination from transaction description
 */
const parseWithdrawalMetadata = (desc = '', type = '') => {
  const d = desc.toLowerCase();
  let status = 'PENDING';
  let utr = null;
  let destination = 'Bank Account';

  if (d.includes('rejected') || type === 'reversed') {
    status = 'REJECTED';
  } else if (d.includes('paid') || d.includes('utr:') || d.includes('completed')) {
    status = 'PAID';
  }

  // Extract UTR if present
  const utrMatch = desc.match(/UTR[:\s]+([A-Za-z0-9_-]+)/i);
  if (utrMatch) utr = utrMatch[1];

  // Extract Destination if present
  const destMatch = desc.match(/(?:to|dest:)\s+([^|]+)/i);
  if (destMatch) destination = destMatch[1].trim();

  return { status, utr, destination };
};

/**
 * 3. GET WITHDRAWALS & PAYOUTS QUEUE
 * Query params: ?status=PENDING&role=ALL&search=Ramesh
 */
export const getWithdrawalsQueue = async (req, res) => {
  try {
    const { status, role, search } = req.query;

    const whereClause = {
      OR: [
        { description: { contains: 'withdrawal', mode: 'insensitive' } },
        { description: { contains: 'payout', mode: 'insensitive' } },
        { description: { contains: 'settlement', mode: 'insensitive' } },
        { type: 'reversed' }
      ]
    };

    if (role && role.toUpperCase() !== 'ALL') {
      whereClause.wallet = {
        user: { role: role.toUpperCase() }
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        ...whereClause.OR,
        { id: { contains: q, mode: 'insensitive' } },
        {
          wallet: {
            user: {
              OR: [
                { fullName: { contains: q, mode: 'insensitive' } },
                { storeName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } }
              ]
            }
          }
        }
      ];
    }

    const rawTransactions = await prisma.walletTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        wallet: {
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
            }
          }
        }
      }
    });

    // Map each transaction into structured withdrawal item
    const allWithdrawals = rawTransactions.map((tx) => {
      const meta = parseWithdrawalMetadata(tx.description || '', tx.type);
      return {
        id: tx.id,
        walletId: tx.walletId,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt,
        status: meta.status,
        utrNumber: meta.utr,
        destination: meta.destination,
        user: tx.wallet?.user || null
      };
    });

    // Compute stats
    const pendingWithdrawals = allWithdrawals.filter((w) => w.status === 'PENDING');
    const paidWithdrawals = allWithdrawals.filter((w) => w.status === 'PAID');
    const rejectedWithdrawals = allWithdrawals.filter((w) => w.status === 'REJECTED');

    const stats = {
      totalCount: allWithdrawals.length,
      pendingCount: pendingWithdrawals.length,
      paidCount: paidWithdrawals.length,
      rejectedCount: rejectedWithdrawals.length,
      pendingAmount: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0),
      totalPaidAmount: paidWithdrawals.reduce((sum, w) => sum + w.amount, 0)
    };

    // Filter by status if requested
    let filteredList = allWithdrawals;
    if (status && status.toUpperCase() !== 'ALL') {
      filteredList = allWithdrawals.filter(
        (w) => w.status.toUpperCase() === status.toUpperCase()
      );
    }

    return res.status(200).json({
      success: true,
      stats,
      withdrawals: filteredList
    });
  } catch (error) {
    console.error('Error fetching withdrawals queue:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawals queue',
      error: error.message
    });
  }
};

/**
 * 4. APPROVE WITHDRAWAL & MARK PAID (DISBURSE WITH UTR)
 */
export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { utrNumber, adminNotes } = req.body;

    if (!utrNumber || !utrNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Bank Reference / UTR Number is required for disbursement verification'
      });
    }

    const cleanUtr = utrNumber.trim().toUpperCase();

    const tx = await prisma.walletTransaction.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            user: true
          }
        }
      }
    });

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal transaction not found'
      });
    }

    const meta = parseWithdrawalMetadata(tx.description || '', tx.type);
    if (meta.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: `This withdrawal has already been marked as PAID (UTR: ${meta.utr || 'Recorded'})`
      });
    }

    // Atomic approval
    const result = await prisma.$transaction(async (txPrisma) => {
      // 1. Relieve pending balance from wallet
      const pendingDeduction = Math.min(tx.wallet.pending || 0, tx.amount);
      const updatedWallet = await txPrisma.wallet.update({
        where: { id: tx.walletId },
        data: {
          pending: { decrement: pendingDeduction }
        }
      });

      // 2. Update transaction description with UTR & PAID stamp
      const destText = meta.destination || 'Bank Account';
      const updatedTx = await txPrisma.walletTransaction.update({
        where: { id },
        data: {
          description: `Withdrawal PAID (UTR: ${cleanUtr}) | Dest: ${destText} | Ref: ${adminNotes || 'Disbursed'}`
        }
      });

      // 3. Notify user of successful bank disbursement
      if (tx.wallet.userId) {
        await txPrisma.notification.create({
          data: {
            userId: tx.wallet.userId,
            title: 'Payout Disbursed to Bank! 🏦',
            body: `Your payout of ₹${tx.amount.toLocaleString('en-IN')} has been transferred to your bank account. UTR: ${cleanUtr}.`,
            type: 'earning',
            data: {
              txnId: tx.id,
              amount: tx.amount,
              utrNumber: cleanUtr
            }
          }
        }).catch(() => {});
      }

      return { updatedWallet, updatedTx };
    });

    return res.status(200).json({
      success: true,
      message: `Withdrawal successfully approved! UTR: ${cleanUtr}`,
      transaction: result.updatedTx
    });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve withdrawal',
      error: error.message
    });
  }
};

/**
 * 5. REJECT WITHDRAWAL & REFUND TO USER WALLET
 */
export const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory'
      });
    }

    const cleanReason = reason.trim();

    const tx = await prisma.walletTransaction.findUnique({
      where: { id },
      include: {
        wallet: {
          include: {
            user: true
          }
        }
      }
    });

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal transaction not found'
      });
    }

    const meta = parseWithdrawalMetadata(tx.description || '', tx.type);
    if (meta.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'This withdrawal has already been rejected.'
      });
    }

    // Atomic Rejection & Reversal
    const result = await prisma.$transaction(async (txPrisma) => {
      // 1. Relieve pending and refund balance to wallet
      const pendingDeduction = Math.min(tx.wallet.pending || 0, tx.amount);
      const updatedWallet = await txPrisma.wallet.update({
        where: { id: tx.walletId },
        data: {
          pending: { decrement: pendingDeduction },
          balance: { increment: tx.amount }
        }
      });

      // 2. Mark original transaction as rejected
      await txPrisma.walletTransaction.update({
        where: { id },
        data: {
          description: `Withdrawal REJECTED: ${cleanReason} | Original: ${tx.description}`
        }
      });

      // 3. Create credit reversal transaction
      const reversalTx = await txPrisma.walletTransaction.create({
        data: {
          walletId: tx.walletId,
          amount: tx.amount,
          type: 'reversed',
          description: `Refund for Rejected Withdrawal: ${cleanReason} (Ref: ${tx.id.slice(0, 8)})`
        }
      });

      // 4. Notify user of rejection and wallet refund
      if (tx.wallet.userId) {
        await txPrisma.notification.create({
          data: {
            userId: tx.wallet.userId,
            title: 'Withdrawal Request Rejected ⚠️',
            body: `Your withdrawal of ₹${tx.amount.toLocaleString('en-IN')} could not be processed. Reason: ${cleanReason}. Funds have been refunded to your wallet balance.`,
            type: 'earning',
            data: {
              txnId: tx.id,
              amount: tx.amount,
              reason: cleanReason
            }
          }
        }).catch(() => {});
      }

      return { updatedWallet, reversalTx };
    });

    return res.status(200).json({
      success: true,
      message: `Withdrawal rejected and ₹${tx.amount.toLocaleString('en-IN')} refunded to partner wallet.`,
      reversalTransaction: result.reversalTx
    });
  } catch (error) {
    console.error('Error rejecting withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject withdrawal',
      error: error.message
    });
  }
};
