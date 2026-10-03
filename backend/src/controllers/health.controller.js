/**
 * Health Check Controller
 */
export const checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MShoppy SuperApp Backend API is running smoothly 🚀',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    modules: [
      'Customer & Reseller Shopping Flow',
      'Reseller & Dropshipper Hub',
      'Supplier / Seller Management',
      'Delivery Fleet & Logistics Logistics',
      'Super Admin Console & KYC Hub',
    ],
  });
};
