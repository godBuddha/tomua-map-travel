const Comment = require('../models/comment.model');
const { success, created, badRequest } = require('../utils/response');

const CommentsController = {
  async index(req, res, next) {
    try {
      const { entityType, entityId } = req.params;

      if (!['destination', 'route', 'event'].includes(entityType)) {
        return badRequest(res, 'Invalid entity type');
      }

      const comments = await Comment.findByEntity(entityType, entityId);
      return success(res, comments);
    } catch (error) {
      next(error);
    }
  },

  async store(req, res, next) {
    try {
      const { entity_type, entity_id, comment, action } = req.body;

      if (!entity_type || !entity_id || !comment) {
        return badRequest(res, 'Entity type, entity ID, and comment are required');
      }

      if (!['destination', 'route', 'event'].includes(entity_type)) {
        return badRequest(res, 'Invalid entity type');
      }

      if (!['comment', 'request_changes', 'approve', 'reject'].includes(action || 'comment')) {
        return badRequest(res, 'Invalid action');
      }

      const newComment = await Comment.create({
        entity_type,
        entity_id,
        user_id: req.user.id,
        comment,
        action: action || 'comment'
      });

      return created(res, newComment);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = CommentsController;
