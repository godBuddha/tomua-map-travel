const Event = require('../models/event.model');
const Comment = require('../models/comment.model');
const CacheService = require('../services/cache.service');
const { success, created, noContent, badRequest, notFound, forbidden } = require('../utils/response');

const EVENT_CACHE_TTL = 3600; // 1 hour
const EVENT_UPCOMING_CACHE_TTL = 1800; // 30 minutes

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

      // Cache public requests only
      const cacheKey = `events:${JSON.stringify(filters)}`;
      if (!req.user) {
        const cached = await CacheService.get(cacheKey);
        if (cached) return success(res, cached);
      }

      const result = await Event.findAll(filters);

      if (!req.user) {
        await CacheService.set(cacheKey, result, EVENT_CACHE_TTL);
      }

      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const { idOrSlug } = req.params;

      const cacheKey = `event:${idOrSlug}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) return success(res, cached);

      let event;
      if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        event = await Event.findById(idOrSlug);
      } else {
        event = await Event.findBySlug(idOrSlug);
      }

      if (!event) {
        return notFound(res, 'Event not found');
      }

      await CacheService.set(cacheKey, event, EVENT_CACHE_TTL);
      return success(res, event);
    } catch (error) {
      next(error);
    }
  },

  async upcoming(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const cacheKey = `events:upcoming:${limit}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) return success(res, cached);

      const events = await Event.findUpcoming(limit);
      await CacheService.set(cacheKey, events, EVENT_UPCOMING_CACHE_TTL);
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

      // Auto-translate in background
      const { enqueueTranslation } = require('../services/translation-queue.service');
      const fieldsToTranslate = {};
      if (data.name && typeof data.name === 'object' && data.name.vi) {
        fieldsToTranslate.name = data.name.vi;
      }
      if (data.description && typeof data.description === 'object' && data.description.vi) {
        fieldsToTranslate.description = data.description.vi;
      }
      if (Object.keys(fieldsToTranslate).length > 0) {
        enqueueTranslation('events', event.id, fieldsToTranslate).catch(() => {});
      }

      await CacheService.delPattern('events:*');

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

      // Collaborator edits require admin review
      if (req.user.role === 'collaborator') {
        data.status = 'pending_edit';
        const originalData = {};
        for (const field of allowedFields) {
          if (event[field] !== undefined) {
            originalData[field] = event[field];
          }
        }
        data.metadata = {
          ...(event.metadata || {}),
          original_before_edit: originalData,
          previous_status: event.status
        };
      }

      const updated = await Event.update(id, data);

      // Auto-translate in background if name/description changed
      const { enqueueTranslation } = require('../services/translation-queue.service');
      const fieldsToTranslate = {};
      if (data.name && typeof data.name === 'object' && data.name.vi) {
        fieldsToTranslate.name = data.name.vi;
      }
      if (data.description && typeof data.description === 'object' && data.description.vi) {
        fieldsToTranslate.description = data.description.vi;
      }
      if (Object.keys(fieldsToTranslate).length > 0) {
        enqueueTranslation('events', id, fieldsToTranslate).catch(() => {});
      }

      await CacheService.del(`event:${id}`);
      if (event.slug) await CacheService.del(`event:${event.slug}`);
      await CacheService.delPattern('events:*');

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

      // Collaborators cannot delete directly — must use requestDelete
      if (req.user.role === 'collaborator') {
        return forbidden(res, 'Collaborators must request deletion instead of deleting directly');
      }

      await Event.delete(id);

      await CacheService.del(`event:${id}`);
      if (event.slug) await CacheService.del(`event:${event.slug}`);
      await CacheService.delPattern('events:*');

      return noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async requestDelete(req, res, next) {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);

      if (!event) {
        return notFound(res, 'Event not found');
      }

      if (req.user.role === 'collaborator' && event.created_by !== req.user.id) {
        return forbidden(res, 'You can only request deletion of your own events');
      }

      if (event.status === 'pending_delete') {
        return badRequest(res, 'Deletion already requested');
      }

      const metadata = {
        ...(event.metadata || {}),
        previous_status: event.status
      };

      await Event.update(id, { status: 'pending_delete', metadata });

      await Comment.create({
        entity_type: 'event',
        entity_id: id,
        user_id: req.user.id,
        comment: 'Deletion requested',
        action: 'request_changes'
      });

      await CacheService.del(`event:${id}`);
      if (event.slug) await CacheService.del(`event:${event.slug}`);
      await CacheService.delPattern('events:*');

      const updated = await Event.findById(id);
      return success(res, updated);
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

      if (!['pending', 'pending_edit', 'pending_delete'].includes(event.status)) {
        return badRequest(res, 'Only pending events can be approved');
      }

      // If approving deletion, actually delete
      if (event.status === 'pending_delete') {
        await Event.delete(id);

        await Comment.create({
          entity_type: 'event',
          entity_id: id,
          user_id: req.user.id,
          comment: req.body.comment || 'Deletion approved',
          action: 'approve'
        });

        await CacheService.del(`event:${id}`);
        if (event.slug) await CacheService.del(`event:${event.slug}`);
        await CacheService.delPattern('events:*');

        return success(res, { message: 'Event deleted' });
      }

      // Approve new or edited event -> published
      const updated = await Event.updateStatus(id, 'published', req.user.id);

      await Comment.create({
        entity_type: 'event',
        entity_id: id,
        user_id: req.user.id,
        comment: req.body.comment || 'Approved',
        action: 'approve'
      });

      await CacheService.del(`event:${id}`);
      if (event.slug) await CacheService.del(`event:${event.slug}`);
      await CacheService.delPattern('events:*');

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

      if (!['pending', 'pending_edit', 'pending_delete'].includes(event.status)) {
        return badRequest(res, 'Only pending events can be rejected');
      }

      // If rejecting an edit, rollback to original data
      if (event.status === 'pending_edit') {
        const metadata = event.metadata || {};
        const originalData = metadata.original_before_edit || {};
        const previousStatus = metadata.previous_status || 'draft';

        const rollbackData = { ...originalData };
        rollbackData.status = previousStatus;
        rollbackData.rejection_reason = reason;
        rollbackData.metadata = null;

        await Event.update(id, rollbackData);

        await Comment.create({
          entity_type: 'event',
          entity_id: id,
          user_id: req.user.id,
          comment: reason,
          action: 'reject'
        });

        await CacheService.del(`event:${id}`);
        if (event.slug) await CacheService.del(`event:${event.slug}`);
        await CacheService.delPattern('events:*');

        const updated = await Event.findById(id);
        return success(res, updated);
      }

      // If rejecting deletion, restore previous status
      if (event.status === 'pending_delete') {
        const metadata = event.metadata || {};
        const previousStatus = metadata.previous_status || 'draft';

        await Event.update(id, { status: previousStatus, rejection_reason: reason, metadata: null });

        await Comment.create({
          entity_type: 'event',
          entity_id: id,
          user_id: req.user.id,
          comment: reason,
          action: 'reject'
        });

        await CacheService.del(`event:${id}`);
        if (event.slug) await CacheService.del(`event:${event.slug}`);
        await CacheService.delPattern('events:*');

        const updated = await Event.findById(id);
        return success(res, updated);
      }

      // Standard rejection (pending -> draft)
      const updated = await Event.updateStatus(id, 'draft', null, reason);

      await Comment.create({
        entity_type: 'event',
        entity_id: id,
        user_id: req.user.id,
        comment: reason,
        action: 'reject'
      });

      await CacheService.del(`event:${id}`);
      if (event.slug) await CacheService.del(`event:${event.slug}`);
      await CacheService.delPattern('events:*');

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
