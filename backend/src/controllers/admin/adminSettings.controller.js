import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE_PATH = path.resolve(__dirname, '../../config/platformSettingsConfig.json');

/**
 * Helper to read settings directly from disk.
 * Throws explicit error if file cannot be read or parsed (No silent fallback).
 */
export function getDirectSettings() {
  if (!fs.existsSync(SETTINGS_FILE_PATH)) {
    throw new Error(`Platform settings file missing at: ${SETTINGS_FILE_PATH}`);
  }
  const rawData = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
  return JSON.parse(rawData);
}

/**
 * 1. GET ALL PLATFORM SETTINGS (ADMIN)
 * Route: GET /api/v1/admin-settings
 */
export const getPlatformSettings = async (req, res) => {
  try {
    const settings = getDirectSettings();
    return res.status(200).json({
      success: true,
      message: 'Platform settings retrieved successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error reading platform settings:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to load platform settings: ${error.message}`
    });
  }
};

/**
 * 2. UPDATE PLATFORM SETTINGS (ADMIN)
 * Route: PUT /api/v1/admin-settings
 */
export const updatePlatformSettings = async (req, res) => {
  try {
    const {
      commissionRate,
      minPayoutThreshold,
      freeShippingThreshold,
      shippingFee,
      codEnabled,
      maintenanceMode,
      supportEmail,
      supportPhone
    } = req.body;

    // Strict Validations
    if (commissionRate !== undefined) {
      const comm = Number(commissionRate);
      if (isNaN(comm) || comm < 0 || comm > 100) {
        return res.status(400).json({
          success: false,
          message: 'Commission rate must be a valid number between 0% and 100%.'
        });
      }
    }

    if (minPayoutThreshold !== undefined) {
      const payout = Number(minPayoutThreshold);
      if (isNaN(payout) || payout < 0) {
        return res.status(400).json({
          success: false,
          message: 'Minimum payout threshold must be a positive number.'
        });
      }
    }

    if (freeShippingThreshold !== undefined) {
      const freeShip = Number(freeShippingThreshold);
      if (isNaN(freeShip) || freeShip < 0) {
        return res.status(400).json({
          success: false,
          message: 'Free shipping threshold must be a positive number.'
        });
      }
    }

    if (shippingFee !== undefined) {
      const fee = Number(shippingFee);
      if (isNaN(fee) || fee < 0) {
        return res.status(400).json({
          success: false,
          message: 'Shipping fee must be a positive number.'
        });
      }
    }

    if (supportEmail !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(supportEmail.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid support email address.'
        });
      }
    }

    // Read current settings
    const current = getDirectSettings();

    // Construct updated settings object
    const updatedSettings = {
      ...current,
      commissionRate: commissionRate !== undefined ? Number(commissionRate) : current.commissionRate,
      minPayoutThreshold: minPayoutThreshold !== undefined ? Number(minPayoutThreshold) : current.minPayoutThreshold,
      freeShippingThreshold: freeShippingThreshold !== undefined ? Number(freeShippingThreshold) : current.freeShippingThreshold,
      shippingFee: shippingFee !== undefined ? Number(shippingFee) : current.shippingFee,
      codEnabled: codEnabled !== undefined ? Boolean(codEnabled) : current.codEnabled,
      maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : current.maintenanceMode,
      supportEmail: supportEmail !== undefined ? supportEmail.trim() : current.supportEmail,
      supportPhone: supportPhone !== undefined ? supportPhone.trim() : current.supportPhone,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.fullName || req.user?.email || 'Admin'
    };

    // Atomic write to disk
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updatedSettings, null, 2), 'utf-8');

    return res.status(200).json({
      success: true,
      message: 'Platform settings saved and applied successfully!',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error saving platform settings:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to save platform settings: ${error.message}`
    });
  }
};

/**
 * 3. GET PUBLIC SETTINGS FOR STOREFRONT & CHECKOUT (PUBLIC)
 * Route: GET /api/v1/settings/public
 */
export const getPublicSettings = async (req, res) => {
  try {
    const settings = getDirectSettings();
    return res.status(200).json({
      success: true,
      data: {
        codEnabled: settings.codEnabled,
        freeShippingThreshold: settings.freeShippingThreshold,
        shippingFee: settings.shippingFee,
        maintenanceMode: settings.maintenanceMode,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone
      }
    });
  } catch (error) {
    console.error('Error retrieving public platform settings:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve public settings: ${error.message}`
    });
  }
};
