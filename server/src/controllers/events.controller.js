const Event = require('../models/event.model');
const Comment = require('../models/comment.model');
const { success, created, noContent, badRequest, notFound, forbidden } = require('../utils/response');

const EventController = {
  async index(req, res, next) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status || 'published',
        destination_id: req.query.destination_id,
        from: req.query.from,
        to: req.query.to,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
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

      const result = await Event.findAll(filters);
      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const { idOrSlug } = req.params;

      let event;
      if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        event = await Event.findById(idOrSlug);
      } else {
        event = await Event.findBySlug(idOrSlug);
      }

      if (!event) {
        return notFound(res, 'Event not found');
      }

      return success(res, event);
    } catch (error) {
      next(error);
    }
  },

  async upcoming(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const events = await Event.findUpcoming(limit);
      return success(res, events);
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

      const event = await Event.create(data);
      return created(res, event);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return notFound(res, 'Event not found');
      }

      if (req.user.role === 'collaborator' && event.created_by !== req.user.id) {
        return forbidden(res, 'You can only update your own events');
      }

      const allowedFields = ['name', 'type', 'description', 'icon', 'start_date', 'end_date', 'start_time', 'end_time', 'recurring', 'frequency', 'season', 'destination_id', 'address', 'image_url', 'lat', 'lng'];
      const data = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          data[field] = req.body[field];
        }
      }

      const updated = await Event.update(id, data);
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return notFound(res, 'Event not found');
      }

      await Event.delete(id);
      return noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async submitForReview(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return notFound(res, 'Event not found');
      }

      if (event.created_by !== req.user.id && req.user.role !== 'admin') {
        return forbidden(res, 'You can only submit your own events');
      }

      if (event.status !== 'draft') {
        return badRequest(res, 'Only draft events can be submitted for review');
      }

      const updated = await Event.updateStatus(id, 'pending');
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return notFound(res, 'Event not found');
      }

      if (event.status !== 'pending') {
        return badRequest(res, 'Only pending events can be approved');
      }

      const updated = await Event.updateStatus(id, 'published', req.user.id);

      await Comment.create({
        entity_type: 'event',
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

      const event = await Event.findById(id);

      if (!event) {
        return notFound(res, 'Event not found');
      }

      if (event.status !== 'pending') {
        return badRequest(res, 'Only pending events can be rejected');
      }

      const updated = await Event.updateStatus(id, 'draft', null, reason);

      await Comment.create({
        entity_type: 'event',
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
      const comments = await Comment.findByEntity('event', id);
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
        entity_type: 'event',
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

module.exports = EventController;
