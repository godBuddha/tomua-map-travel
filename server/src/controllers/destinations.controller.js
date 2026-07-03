const Destination = require('../models/destination.model');
const Comment = require('../models/comment.model');
const CacheService = require('../services/cache.service');
const { success, created, noContent, badRequest, notFound, forbidden } = require('../utils/response');

const CACHE_TTL = 300; // 5 minutes

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
        filters.status = req.query.status || undefined;
      }
      
      if (req.user && req.user.role === 'collaborator') {
         filters.collaborator_id = req.user.id;
      }

      // Check cache for public requests
      const cacheKey = `destinations:${JSON.stringify(filters)}`;
      if (!req.user) {
        const cached = await CacheService.get(cacheKey);
        if (cached) {
          return success(res, cached);
        }
      }

      const result = await Destination.findAll(filters);
      
      // Cache public results
      if (!req.user) {
        await CacheService.set(cacheKey, result, CACHE_TTL);
      }
      
      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      
      // Check cache
      const cacheKey = `destination:${idOrSlug}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return success(res, cached);
      }

      let destination;
      if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        destination = await Destination.findById(idOrSlug);
      } else {
        destination = await Destination.findBySlug(idOrSlug);
      }

      if (!destination) {
        return notFound(res, 'Destination not found');
      }

      // Cache the result
      await CacheService.set(cacheKey, destination, CACHE_TTL);

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
      
      // Invalidate cache
      await CacheService.del(`destination:${id}`);
      if (destination.slug) {
        await CacheService.del(`destination:${destination.slug}`);
      }
      await CacheService.delPattern('destinations:*');
      
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
      
      // Invalidate cache
      await CacheService.del(`destination:${id}`);
      if (destination.slug) {
        await CacheService.del(`destination:${destination.slug}`);
      }
      await CacheService.delPattern('destinations:*');
      
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
