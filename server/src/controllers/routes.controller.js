const Route = require('../models/route.model');
const Comment = require('../models/comment.model');
const OsrmService = require('../services/osrm.service');
const db = require('../config/database');
const { success, created, noContent, badRequest, notFound, forbidden } = require('../utils/response');

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

      const result = await Route.findAll(filters);
      return success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const { idOrSlug } = req.params;

      let route;
      if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        route = await Route.findById(idOrSlug);
      } else {
        route = await Route.findBySlug(idOrSlug);
      }

      if (!route) {
        return notFound(res, 'Route not found');
      }

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

      await Route.delete(id);
      return noContent(res);
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

      if (route.status !== 'pending') {
        return badRequest(res, 'Only pending routes can be approved');
      }

      const updated = await Route.updateStatus(id, 'published', req.user.id);

      await Comment.create({
        entity_type: 'route',
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

      const route = await Route.findById(id);

      if (!route) {
        return notFound(res, 'Route not found');
      }

      if (route.status !== 'pending') {
        return badRequest(res, 'Only pending routes can be rejected');
      }

      const updated = await Route.updateStatus(id, 'draft', null, reason);

      await Comment.create({
        entity_type: 'route',
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
