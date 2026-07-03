const Destination = require('../models/destination.model');
const Comment = require('../models/comment.model');
const { success, created, noContent, badRequest, notFound, forbidden } = require('../utils/response');

const DestinationController = {
  async index(req, res, next) {
    try {
      const filters = {
        type: req.query.type,
        region: req.query.region,
        status: req.query.status || 'published',
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
        offset: req.query.offset,
        sort: req.query.sort,
        order: req.query.order
      };
      // For regular users, enforce 'published' if no status is specified
      if (!req.user || req.user.role === 'user') {
        filters.status = req.query.status || 'published';
      } else {
        // Admin and Collaborator can see other statuses if they want
        // But if they don't specify, we show them everything (undefined removes the where clause)
        filters.status = req.query.status || undefined;
      }
      
      // If collaborator, we should ideally only show their drafts + all published, 
      // but since findAll doesn't support complex OR queries for this yet, 
      // letting them see all (undefined status) is the current fallback.
      if (req.user && req.user.role === 'collaborator') {
         filters.collaborator_id = req.user.id;
      }

      const result = await Destination.findAll(filters);
      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      
      let destination;
      if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        destination = await Destination.findById(idOrSlug);
      } else {
        destination = await Destination.findBySlug(idOrSlug);
      }

      if (!destination) {
        return notFound(res, 'Destination not found');
      }

      return success(res, destination);
    } catch (error) {
      next(error);
    }
  },

  async nearby(req, res, next) {
    try {
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        return badRequest(res, 'Latitude and longitude are required');
      }

      const destinations = await Destination.findNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseInt(radius) || 5000
      );

      return success(res, destinations);
    } catch (error) {
      next(error);
    }
  },

  async store(req, res, next) {
    try {
      const data = {
        ...req.body,
        created_by: req.user.id,
        status: req.user.role === 'admin' ? 'published' : 'draft'
      };

      const destination = await Destination.create(data);
      return created(res, destination);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const destination = await Destination.findById(id);

      if (!destination) {
        return notFound(res, 'Destination not found');
      }

      // Collaborators can only update their own drafts
      if (req.user.role === 'collaborator' && destination.created_by !== req.user.id) {
        return forbidden(res, 'You can only update your own destinations');
      }

      const allowedFields = ['name', 'type', 'region', 'description', 'quote', 'color', 'gradient', 'stats', 'info', 'address', 'lat', 'lng', 'visitor_notes'];
      const data = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          data[field] = req.body[field];
        }
      }

      const updated = await Destination.update(id, data);
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const destination = await Destination.findById(id);

      if (!destination) {
        return notFound(res, 'Destination not found');
      }

      await Destination.delete(id);
      return noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async submitForReview(req, res, next) {
    try {
      const { id } = req.params;
      const destination = await Destination.findById(id);

      if (!destination) {
        return notFound(res, 'Destination not found');
      }

      if (destination.created_by !== req.user.id && req.user.role !== 'admin') {
        return forbidden(res, 'You can only submit your own destinations');
      }

      if (destination.status !== 'draft') {
        return badRequest(res, 'Only draft destinations can be submitted for review');
      }

      const updated = await Destination.updateStatus(id, 'pending');
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const destination = await Destination.findById(id);

      if (!destination) {
        return notFound(res, 'Destination not found');
      }

      if (destination.status !== 'pending') {
        return badRequest(res, 'Only pending destinations can be approved');
      }

      const updated = await Destination.updateStatus(id, 'published', req.user.id);

      // Add approval comment
      await Comment.create({
        entity_type: 'destination',
        entity_id: id,
        user_id: req.user.id,
        comment: req.body.comment || 'Approved',
        action: 'approve'
      });

      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async reject(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return badRequest(res, 'Rejection reason is required');
      }

      const destination = await Destination.findById(id);

      if (!destination) {
        return notFound(res, 'Destination not found');
      }

      if (destination.status !== 'pending') {
        return badRequest(res, 'Only pending destinations can be rejected');
      }

      const updated = await Destination.updateStatus(id, 'draft', null, reason);

      // Add rejection comment
      await Comment.create({
        entity_type: 'destination',
        entity_id: id,
        user_id: req.user.id,
        comment: reason,
        action: 'reject'
      });

      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async getComments(req, res, next) {
    try {
      const { id } = req.params;
      const comments = await Comment.findByEntity('destination', id);
      return success(res, comments);
    } catch (error) {
      next(error);
    }
  },

  async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const { comment, action } = req.body;

      if (!comment) {
        return badRequest(res, 'Comment is required');
      }

      const newComment = await Comment.create({
        entity_type: 'destination',
        entity_id: id,
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

module.exports = DestinationController;
