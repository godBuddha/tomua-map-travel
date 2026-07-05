const Route = require('../models/route.model');
const Comment = require('../models/comment.model');
const CacheService = require('../services/cache.service');
const OsrmService = require('../services/osrm.service');
const db = require('../config/database');
const { success, created, noContent, badRequest, notFound, forbidden } = require('../utils/response');

const ROUTE_CACHE_TTL = 3600; // 1 hour

const RouteController = {
  async index(req, res, next) {
    try {
      const filters = {
        transport: req.query.transport,
        difficulty: req.query.difficulty,
        duration: req.query.duration,
        status: req.query.status || 'published',
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
      const cacheKey = `routes:${JSON.stringify(filters)}`;
      if (!req.user) {
        const cached = await CacheService.get(cacheKey);
        if (cached) return success(res, cached);
      }

      const result = await Route.findAll(filters);

      if (!req.user) {
        await CacheService.set(cacheKey, result, ROUTE_CACHE_TTL);
      }

      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const { idOrSlug } = req.params;

      const cacheKey = `route:${idOrSlug}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) return success(res, cached);

      let route;
      if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        route = await Route.findById(idOrSlug);
      } else {
        route = await Route.findBySlug(idOrSlug);
      }

      if (!route) {
        return notFound(res, 'Route not found');
      }

      await CacheService.set(cacheKey, route, ROUTE_CACHE_TTL);
      return success(res, route);
    } catch (error) {
      next(error);
    }
  },

  async store(req, res, next) {
    try {
      // Remove stops from route data (they go in route_stops table)
      const { stops, ...routeData } = req.body;
      
      const data = {
        ...routeData,
        created_by: req.user.id,
        status: req.user.role === 'admin' ? 'published' : 'draft'
      };

      const route = await Route.create(data);

      // If stops are provided, batch insert them
      if (stops && Array.isArray(stops) && stops.length > 0) {
        const stopsData = stops.map((stop, i) => ({
          route_id: route.id,
          destination_id: stop.destination_id,
          stop_order: i + 1,
          description: stop.description || {}
        }));
        await db('route_stops').insert(stopsData);
      }

      await CacheService.delPattern('routes:*');

      const fullRoute = await Route.findById(route.id);
      return created(res, fullRoute);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (req.user.role === 'collaborator' && route.created_by !== req.user.id) {
        return forbidden(res, 'You can only update your own routes');
      }

      // Handle stops update
      const { stops, ...routeDataRaw } = req.body;
      
      // Whitelist allowed fields to prevent mass assignment
      const allowedFields = ['name', 'description', 'transport', 'duration', 'difficulty', 
        'distance_km', 'estimated_time_min', 'elevation_gain_m', 'image_url', 'metadata'];
      const routeData = {};
      for (const field of allowedFields) {
        if (routeDataRaw[field] !== undefined) {
          routeData[field] = routeDataRaw[field];
        }
      }

      // Collaborator edits require admin review
      if (req.user.role === 'collaborator') {
        routeData.status = 'pending_edit';
        const originalData = {};
        for (const field of allowedFields) {
          if (route[field] !== undefined) {
            originalData[field] = route[field];
          }
        }
        routeData.metadata = {
          ...(route.metadata || {}),
          original_before_edit: originalData,
          previous_status: route.status
        };
      }
      
      const updated = await Route.update(id, routeData);

      // If stops are provided, update them
      if (stops && Array.isArray(stops)) {
        // Delete existing stops
        await db('route_stops').where('route_id', id).del();
        
        // Insert new stops
        if (stops.length > 0) {
          const stopsData = stops.map((stop, i) => ({
            route_id: id,
            destination_id: stop.destination_id,
            stop_order: i + 1,
            description: stop.description || {}
          }));
          await db('route_stops').insert(stopsData);
        }
      }

      await CacheService.del(`route:${id}`);
      if (route.slug) await CacheService.del(`route:${route.slug}`);
      await CacheService.delPattern('routes:*');

      const fullRoute = await Route.findById(id);
      return success(res, fullRoute);
    } catch (error) {
      next(error);
    }
  },

  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      // Collaborators cannot delete directly — must use requestDelete
      if (req.user.role === 'collaborator') {
        return forbidden(res, 'Collaborators must request deletion instead of deleting directly');
      }

      await Route.delete(id);

      await CacheService.del(`route:${id}`);
      if (route.slug) await CacheService.del(`route:${route.slug}`);
      await CacheService.delPattern('routes:*');

      return noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async requestDelete(req, res, next) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (req.user.role === 'collaborator' && route.created_by !== req.user.id) {
        return forbidden(res, 'You can only request deletion of your own routes');
      }

      if (route.status === 'pending_delete') {
        return badRequest(res, 'Deletion already requested');
      }

      const metadata = {
        ...(route.metadata || {}),
        previous_status: route.status
      };

      await Route.update(id, { status: 'pending_delete', metadata });

      await Comment.create({
        entity_type: 'route',
        entity_id: id,
        user_id: req.user.id,
        comment: 'Deletion requested',
        action: 'request_changes'
      });

      await CacheService.del(`route:${id}`);
      if (route.slug) await CacheService.del(`route:${route.slug}`);
      await CacheService.delPattern('routes:*');

      const updated = await Route.findById(id);
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async addStop(req, res, next) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (req.user.role === 'collaborator' && route.created_by !== req.user.id) {
        return forbidden(res, 'You can only modify your own routes');
      }

      const stop = await Route.addStop(id, req.body);

      // Recalculate route geometry if we have enough stops
      const updatedRoute = await Route.findById(id);
      if (updatedRoute.stops.length >= 2) {
        try {
          const coordinates = updatedRoute.stops.map(s => {
            const loc = s.destination_location;
            // Extract coordinates from PostGIS point
            const match = loc.match(/POINT\(([^)]+)\)/);
            if (match) {
              const [lng, lat] = match[1].split(' ').map(Number);
              return [lng, lat];
            }
            return null;
          }).filter(Boolean);

          if (coordinates.length >= 2) {
            const profile = route.transport === 'walk' ? 'foot' : 'car';
            const routeData = await OsrmService.getRoute(coordinates, profile);

            if (routeData) {
              await Route.updateRouteGeometry(id, routeData.geometry.coordinates);
              await Route.update(id, {
                distance_km: routeData.distance / 1000,
                estimated_time_min: Math.round(routeData.duration / 60)
              });
            }
          }
        } catch (osrmError) {
          console.error('OSRM error:', osrmError);
          // Continue without updating geometry
        }
      }

      return created(res, stop);
    } catch (error) {
      next(error);
    }
  },

  async updateStop(req, res, next) {
    try {
      const { id, stopId } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (req.user.role === 'collaborator' && route.created_by !== req.user.id) {
        return forbidden(res, 'You can only modify your own routes');
      }

      const stop = await Route.updateStop(stopId, req.body);
      return success(res, stop);
    } catch (error) {
      next(error);
    }
  },

  async deleteStop(req, res, next) {
    try {
      const { id, stopId } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (req.user.role === 'collaborator' && route.created_by !== req.user.id) {
        return forbidden(res, 'You can only modify your own routes');
      }

      await Route.deleteStop(stopId);
      return noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async submitForReview(req, res, next) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (route.created_by !== req.user.id && req.user.role !== 'admin') {
        return forbidden(res, 'You can only submit your own routes');
      }

      if (route.status !== 'draft') {
        return badRequest(res, 'Only draft routes can be submitted for review');
      }

      const updated = await Route.updateStatus(id, 'pending');
      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const { id } = req.params;
      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (!['pending', 'pending_edit', 'pending_delete'].includes(route.status)) {
        return badRequest(res, 'Only pending routes can be approved');
      }

      // If approving deletion, actually delete
      if (route.status === 'pending_delete') {
        await db('route_stops').where('route_id', id).del();
        await Route.delete(id);

        await Comment.create({
          entity_type: 'route',
          entity_id: id,
          user_id: req.user.id,
          comment: req.body.comment || 'Deletion approved',
          action: 'approve'
        });

        await CacheService.del(`route:${id}`);
        if (route.slug) await CacheService.del(`route:${route.slug}`);
        await CacheService.delPattern('routes:*');

        return success(res, { message: 'Route deleted' });
      }

      // Approve new or edited route -> published
      const updated = await Route.updateStatus(id, 'published', req.user.id);

      await Comment.create({
        entity_type: 'route',
        entity_id: id,
        user_id: req.user.id,
        comment: req.body.comment || 'Approved',
        action: 'approve'
      });

      await CacheService.del(`route:${id}`);
      if (route.slug) await CacheService.del(`route:${route.slug}`);
      await CacheService.delPattern('routes:*');

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

      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (!['pending', 'pending_edit', 'pending_delete'].includes(route.status)) {
        return badRequest(res, 'Only pending routes can be rejected');
      }

      // If rejecting an edit, rollback to original data
      if (route.status === 'pending_edit') {
        const metadata = route.metadata || {};
        const originalData = metadata.original_before_edit || {};
        const previousStatus = metadata.previous_status || 'draft';

        const rollbackData = { ...originalData };
        rollbackData.status = previousStatus;
        rollbackData.rejection_reason = reason;
        rollbackData.metadata = null;

        await Route.update(id, rollbackData);

        await Comment.create({
          entity_type: 'route',
          entity_id: id,
          user_id: req.user.id,
          comment: reason,
          action: 'reject'
        });

        await CacheService.del(`route:${id}`);
        if (route.slug) await CacheService.del(`route:${route.slug}`);
        await CacheService.delPattern('routes:*');

        const updated = await Route.findById(id);
        return success(res, updated);
      }

      // If rejecting deletion, restore previous status
      if (route.status === 'pending_delete') {
        const metadata = route.metadata || {};
        const previousStatus = metadata.previous_status || 'draft';

        await Route.update(id, { status: previousStatus, rejection_reason: reason, metadata: null });

        await Comment.create({
          entity_type: 'route',
          entity_id: id,
          user_id: req.user.id,
          comment: reason,
          action: 'reject'
        });

        await CacheService.del(`route:${id}`);
        if (route.slug) await CacheService.del(`route:${route.slug}`);
        await CacheService.delPattern('routes:*');

        const updated = await Route.findById(id);
        return success(res, updated);
      }

      // Standard rejection (pending -> draft)
      const updated = await Route.updateStatus(id, 'draft', null, reason);

      await Comment.create({
        entity_type: 'route',
        entity_id: id,
        user_id: req.user.id,
        comment: reason,
        action: 'reject'
      });

      await CacheService.del(`route:${id}`);
      if (route.slug) await CacheService.del(`route:${route.slug}`);
      await CacheService.delPattern('routes:*');

      return success(res, updated);
    } catch (error) {
      next(error);
    }
  },

  async getComments(req, res, next) {
    try {
      const { id } = req.params;
      const comments = await Comment.findByEntity('route', id);
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
        entity_type: 'route',
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

module.exports = RouteController;
