const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const requireAdmin = requireRole('admin');
const requireCollaborator = requireRole('collaborator');
const requireAdminOrCollaborator = requireRole('admin', 'collaborator');

const requireOwnerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req);
      if (ownerId === req.user.id) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own resources'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      });
    }
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireCollaborator,
  requireAdminOrCollaborator,
  requireOwnerOrAdmin
};
