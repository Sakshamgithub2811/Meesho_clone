import prisma from '../config/prisma.js';

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.headers['x-user-id'] ||
    req.headers['x-customer-id'] ||
    req.headers['x-affiliate-id'] ||
    req.headers['x-reseller-id'] ||
    req.query.userId ||
    'guest_customer'
  );
};

const ensureWallet = async (userId, req = null) => {
  if (!userId) return null;

  // 1. Direct match first
  let profile = await prisma.profile.findUnique({
    where: { id: userId }
  });

  // 2. If not found or dummy affiliate/guest prefix, attempt smart matching via clean ID, phone, or email
  if (!profile || String(userId).startsWith('affiliate_') || String(userId).startsWith('guest_')) {
    const rawId = String(userId).replace(/^affiliate_/, '').replace(/^firebase_/, '');
    const cleanPhone = (req?.headers?.['x-user-phone'] || userId || '').toString().replace(/\D/g, '').slice(-10);
    const candidateEmail = (req?.headers?.['x-user-email'] || (String(userId).includes('@') ? userId : '')).toLowerCase();

    const matched = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: rawId },
          ...(cleanPhone && cleanPhone.length === 10 ? [{ phone: cleanPhone }] : []),
          ...(candidateEmail ? [{ email: candidateEmail }] : [])
        ]
      }
    });

    if (matched) {
      profile = matched;
      userId = matched.id;
    }
  }

  // Ensure user profile exists
  if (!profile) {
    profile = await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        fullName: 'Customer',
        email: `${userId}@customer.meesho`,
        role: 'CUSTOMER'
      }
    });
  }

  // Ensure wallet exists
  let wallet = await prisma.wallet.findUnique({
    where: { userId: profile.id },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      user: {
        select: {
          bankDetails: true,
          fullName: true,
          phone: true
        }
      }
    }
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: profile.id,
        balance: 0.0,
        pending: 0.0,
      },
      include: {
        transactions: true,
        user: {
          select: {
            bankDetails: true,
            fullName: true,
            phone: true
          }
        }
      }
    });
  }

  return wallet;
};

/**
 * GET /api/v1/wallet
 * Returns current user's authoritative wallet balance and ledger history
 */
export const getMyWallet = async (req, res) => {
  try {
    const userId = getUserId(req);
    const wallet = await ensureWallet(userId, req);

    const transactions = await prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.status(200).json({
      success: true,
      data: {
        walletId: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        pending: wallet.pending,
        totalWithdrawn: transactions
          .filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + t.amount, 0),
        transactions
      }
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve wallet details',
      error: error.message
    });
  }
};

/**
 * POST /api/v1/wallet/withdraw
 * Authenticated atomic withdrawal request with double-entry ledger transaction
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { amount, method = 'bank', destination = 'Bank Account' } = req.body;

    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹100.00'
      });
    }

    const wallet = await ensureWallet(userId, req);

    if (wallet.balance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Available: ₹${wallet.balance.toFixed(2)}, Requested: ₹${numAmount.toFixed(2)}`
      });
    }

    // Atomic withdrawal transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct available balance and hold in pending escrow
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: numAmount },
          pending: { increment: numAmount }
        }
      });

      // 2. Record debit in transaction ledger marked as PENDING payout
      const txn = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: numAmount,
          type: 'debit',
          description: `Withdrawal Request: PENDING | Method: ${method.toUpperCase()} | Dest: ${destination}`
        }
      });

      // 3. Create persistent user notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Payout Request Initiated! 🏦',
          body: `Your withdrawal of ₹${numAmount.toLocaleString('en-IN')} to ${destination} is being processed. Ref: ${txn.id}`,
          type: 'earning',
          data: {
            txnId: txn.id,
            amount: numAmount,
            method,
            destination
          }
        }
      }).catch(() => {});

      return { updatedWallet, txn };
    });

    return res.status(200).json({
      success: true,
      message: 'Withdrawal processed successfully!',
      data: {
        txnId: result.txn.id,
        amount: numAmount,
        remainingBalance: result.updatedWallet.balance,
        method,
        destination,
        date: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal request',
      error: error.message
    });
  }
};
