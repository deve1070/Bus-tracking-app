import { Request, Response } from 'express';
import { SystemSettings } from '../models/SystemSettings';
import { AuthRequest } from '../middleware/auth';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SystemSettings.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        systemName: 'TransitAdmin',
        contactEmail: 'admin@transitadmin.com',
        notificationsEnabled: true,
        maintenanceMode: false,
        autoAssignDrivers: true,
        defaultLanguage: 'en',
        timeZone: 'UTC'
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      systemName,
      contactEmail,
      notificationsEnabled,
      maintenanceMode,
      autoAssignDrivers,
      defaultLanguage,
      timeZone
    } = req.body;

    const settings = new SystemSettings({
      systemName,
      contactEmail,
      notificationsEnabled,
      maintenanceMode,
      autoAssignDrivers,
      defaultLanguage,
      timeZone,
      updatedBy: req.user?._id
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}; 