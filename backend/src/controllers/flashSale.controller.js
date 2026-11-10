import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE_PATH = path.join(__dirname, '../config/flashSaleConfig.json');

// Default fallback configuration
const getDefaultConfig = () => {
  // End of current day (midnight 23:59:59) by default, or 4 hours from now
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return {
    id: 'flash_sale_active',
    title: 'Midnight Flash Sale',
    subtitle: 'Up to 75% Off Everything',
    bannerBadge: 'Live Lightning Drops',
    dealBadge: '⚡ Limited Stock • Extra 15% Off',
    endTime: endOfDay.toISOString(),
    status: 'ACTIVE',
    minDiscount: 40,
    updatedAt: new Date().toISOString()
  };
};

// In-memory cache to prevent blocking event loop on concurrent requests
let cachedFlashSaleConfig = null;
let lastCacheReadTime = 0;
const CACHE_TTL_MS = 30000; // 30 seconds TTL

// Helper to read config asynchronously / from memory cache
const readConfig = () => {
  const now = Date.now();
  if (cachedFlashSaleConfig && (now - lastCacheReadTime) < CACHE_TTL_MS) {
    if (new Date(cachedFlashSaleConfig.endTime).getTime() <= now) {
      cachedFlashSaleConfig = getDefaultConfig();
    }
    return cachedFlashSaleConfig;
  }

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (new Date(parsed.endTime).getTime() <= now) {
        cachedFlashSaleConfig = getDefaultConfig();
        fs.promises.writeFile(CONFIG_FILE_PATH, JSON.stringify(cachedFlashSaleConfig, null, 2)).catch(() => {});
      } else {
        cachedFlashSaleConfig = parsed;
      }
      lastCacheReadTime = now;
      return cachedFlashSaleConfig;
    }
  } catch (err) {
    console.error('Error reading flash sale config:', err);
  }

  cachedFlashSaleConfig = getDefaultConfig();
  lastCacheReadTime = now;
  fs.promises.writeFile(CONFIG_FILE_PATH, JSON.stringify(cachedFlashSaleConfig, null, 2)).catch(() => {});
  return cachedFlashSaleConfig;
};

// Helper to write config
const writeConfig = (config) => {
  cachedFlashSaleConfig = config;
  lastCacheReadTime = Date.now();
  fs.promises.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2)).catch((err) => {
    console.error('Error writing flash sale config:', err);
  });
};

/**
 * GET /api/v1/flash-sale/active
 * Returns current active flash sale metadata & timer
 */
export const getActiveFlashSale = async (req, res) => {
  try {
    const config = readConfig();
    return res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error in getActiveFlashSale:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve active flash sale configuration',
      error: error.message
    });
  }
};

/**
 * POST /api/v1/flash-sale/config
 * Admin / Manager endpoint to update flash sale timer and settings
 */
export const updateFlashSale = async (req, res) => {
  try {
    const { title, subtitle, bannerBadge, resellerBonusNote, endTime, minDiscount, status } = req.body;
    const current = readConfig();

    const updated = {
      ...current,
      ...(title && { title }),
      ...(subtitle && { subtitle }),
      ...(bannerBadge && { bannerBadge }),
      ...(resellerBonusNote && { resellerBonusNote }),
      ...(endTime && { endTime: new Date(endTime).toISOString() }),
      ...(minDiscount !== undefined && { minDiscount: Number(minDiscount) }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };

    writeConfig(updated);

    return res.status(200).json({
      success: true,
      message: 'Flash sale configuration updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error in updateFlashSale:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update flash sale configuration',
      error: error.message
    });
  }
};
