const express = require('express');
const router = express.Router();
const db = require('../config/database');
const User = require('../models/user.model');
const { authenticateToken } = require('../middleware/auth');

const authRoutes = require('./auth.routes');
const destinationRoutes = require('./destinations.routes');
const routeRoutes = require('./routes.routes');
const eventRoutes = require('./events.routes');
const userRoutes = require('./users.routes');
const i18nRoutes = require('./i18n.routes');
const uploadRoutes = require('./upload.routes');
const commentRoutes = require('./comments.routes');
const settingsRoutes = require('./settings.routes');
const mfaRoutes = require('./mfa.routes');
const translateRoutes = require('./translate.routes');

router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/routes', routeRoutes);
router.use('/events', eventRoutes);
router.use('/i18n', i18nRoutes);
router.use('/upload', uploadRoutes);
router.use('/comments', commentRoutes);
router.use('/settings', settingsRoutes);
router.use('/mfa', mfaRoutes);
router.use('/translate', translateRoutes);

// Stats endpoint
router.get('/stats', async (req, res) => {
  try {
    const [destCount] = await db('destinations').count('id as count');
    const [routeCount] = await db('routes').count('id as count');
    const [eventCount] = await db('events').count('id as count');
    const [userCount] = await db('users').count('id as count');
    const [pendingCount] = await db('destinations').whereIn('status', ['pending', 'pending_edit', 'pending_delete']).count('id as count');
    const [pendingRoutes] = await db('routes').whereIn('status', ['pending', 'pending_edit', 'pending_delete']).count('id as count');
    const [pendingEvents] = await db('events').whereIn('status', ['pending', 'pending_edit', 'pending_delete']).count('id as count');
    const [onlineCount] = await db('users').where('is_online', true).count('id as count');
    
    res.json({
      success: true,
      data: {
        destinations: parseInt(destCount.count),
        routes: parseInt(routeCount.count),
        events: parseInt(eventCount.count),
        users: parseInt(userCount.count),
        onlineUsers: parseInt(onlineCount.count),
        pending: parseInt(pendingCount.count),
        pendingRoutes: parseInt(pendingRoutes.count),
        pendingEvents: parseInt(pendingEvents.count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Online users endpoint (before users routes to avoid conflict)
router.get('/users/online', async (req, res) => {
  try {
    // Cleanup stale online users (inactive for 30 minutes)
    await User.cleanupStaleOnline(30);
    
    const onlineUsers = await User.findOnline();
    res.json({
      success: true,
      data: onlineUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar_url: u.avatar_url,
        last_active_at: u.last_active_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Heartbeat endpoint - keep user online
router.post('/heartbeat', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await User.setOnline(userId, true);
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true }); // Don't fail on heartbeat errors
  }
});

// Translation queue status endpoint
router.get('/translation-status', authenticateToken, async (req, res) => {
  try {
    const { getQueueStatus } = require('../services/translation-queue.service');
    const status = await getQueueStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.json({ success: true, data: { waiting: 0, active: 0, completed: 0, failed: 0, error: error.message } });
  }
});

// Mount users routes AFTER online endpoint
router.use('/users', userRoutes);

module.exports = router;
