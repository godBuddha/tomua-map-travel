const db = require('../config/database');
const { createLineString } = require('../utils/geo');
const { generateUniqueSlug } = require('../utils/slugify');

const TABLE = 'routes';

const Route = {
  async findById(id) {
    const route = await db(TABLE).where('id', id).first();
    if (route) {
      route.stops = await db('route_stops')
        .where('route_id', id)
        .leftJoin('destinations', 'route_stops.destination_id', 'destinations.id')
        .select(
          'route_stops.*',
          'destinations.name as destination_name',
          'destinations.type as destination_type',
          'destinations.location as destination_location'
        )
        .orderBy('route_stops.stop_order');
    }
    return route;
  },

  async findBySlug(slug) {
    const route = await db(TABLE).where('slug', slug).first();
    if (route) {
      route.stops = await db('route_stops')
        .where('route_id', route.id)
        .leftJoin('destinations', 'route_stops.destination_id', 'destinations.id')
        .select(
          'route_stops.*',
          'destinations.name as destination_name',
          'destinations.type as destination_type',
          'destinations.location as destination_location'
        )
        .orderBy('route_stops.stop_order');
    }
    return route;
  },

  async findAll(filters = {}) {
    const query = db(TABLE);

    if (filters.transport) {
      query.where('transport', filters.transport);
    }
    if (filters.difficulty) {
      query.where('difficulty', filters.difficulty);
    }
    if (filters.duration) {
      query.where('duration', filters.duration);
    }
    if (filters.status) {
      query.where('status', filters.status);
    }
    
    // BUG-FIX: Secure visibility for collaborators
    if (filters.collaborator_id) {
      // Collaborators see ALL 'published' plus ANY of their own creations
      query.where(function() {
        this.where('routes.status', 'published')
            .orWhere('routes.created_by', filters.collaborator_id);
      });
    }

    if (filters.search) {
      query.where(function() {
        this.whereRaw("name->>'vi' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("name->>'en' ILIKE ?", [`%${filters.search}%`]);
      });
    }

    const { offset, limit, page } = require('../utils/pagination').paginate(
      null, filters.page, filters.limit
    );

    const items = await query
      .orderBy(filters.sort || 'created_at', filters.order || 'desc')
      .offset(offset)
      .limit(limit);

    // BUG-04 FIX: Build separate countQuery with the same filters
    // Previously this counted ALL rows ignoring filters — wrong totalPages / hasNext
    const countQuery = db(TABLE);
    if (filters.transport) countQuery.where('transport', filters.transport);
    if (filters.difficulty) countQuery.where('difficulty', filters.difficulty);
    if (filters.duration) countQuery.where('duration', filters.duration);
    if (filters.status) countQuery.where('status', filters.status);
    if (filters.collaborator_id) {
      countQuery.where(function() {
        this.where('routes.status', 'published')
            .orWhere('routes.created_by', filters.collaborator_id);
      });
    }
    if (filters.search) {
      countQuery.where(function() {
        this.whereRaw("name->>'vi' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("name->>'en' ILIKE ?", [`%${filters.search}%`]);
      });
    }
    const countResult = await countQuery.count('id as count').first();
    const total = parseInt(countResult.count);

    // Load stops for each route
    for (let item of items) {
      item.stops = await db('route_stops')
        .where('route_id', item.id)
        .leftJoin('destinations', 'route_stops.destination_id', 'destinations.id')
        .select(
          'route_stops.*',
          'destinations.name as destination_name',
          'destinations.type as destination_type'
        )
        .orderBy('route_stops.stop_order');
    }

    return require('../utils/pagination').paginateResponse(items, total, page, limit);
  },

  async create(data) {
    const slug = await generateUniqueSlug(data.name.vi || data.name.en, TABLE, db);

    const [route] = await db(TABLE)
      .insert({ ...data, slug })
      .returning('*');

    return route;
  },

  async update(id, data) {
    const updateData = { ...data };

    if (data.name && (data.name.vi || data.name.en)) {
      const existing = await this.findById(id);
      if (existing && existing.name.vi !== data.name.vi) {
        updateData.slug = await generateUniqueSlug(data.name.vi || data.name.en, TABLE, db, id);
      }
    }

    if (data.route_geometry) {
      updateData.location = db.raw(createLineString(data.route_geometry));
      delete updateData.route_geometry;
    }

    const [route] = await db(TABLE)
      .where('id', id)
      .update(updateData)
      .returning('*');

    return route;
  },

  async delete(id) {
    return db(TABLE).where('id', id).del();
  },

  async updateStatus(id, status, userId = null, rejectionReason = null) {
    const updateData = { status };

    if (status === 'published') {
      updateData.approved_by = userId;
      updateData.approved_at = new Date();
      updateData.rejection_reason = null;
    } else if (status === 'draft') {
      updateData.rejection_reason = rejectionReason;
    }

    const [route] = await db(TABLE)
      .where('id', id)
      .update(updateData)
      .returning('*');

    return route;
  },

  async addStop(routeId, stopData) {
    const maxOrder = await db('route_stops')
      .where('route_id', routeId)
      .max('stop_order as max')
      .first();

    const stopOrder = (maxOrder.max || 0) + 1;

    const [stop] = await db('route_stops')
      .insert({
        route_id: routeId,
        destination_id: stopData.destination_id,
        stop_order: stopData.stop_order || stopOrder,
        description: stopData.description,
        duration_minutes: stopData.duration_minutes
      })
      .returning('*');

    return stop;
  },

  async updateStop(stopId, data) {
    const [stop] = await db('route_stops')
      .where('id', stopId)
      .update(data)
      .returning('*');

    return stop;
  },

  async deleteStop(stopId) {
    return db('route_stops').where('id', stopId).del();
  },

  async reorderStops(routeId, stopOrders) {
    for (const { id, stop_order } of stopOrders) {
      await db('route_stops')
        .where('id', id)
        .where('route_id', routeId)
        .update({ stop_order });
    }
  },

  async updateRouteGeometry(routeId, coordinates) {
    const lineString = createLineString(coordinates);
    await db(TABLE)
      .where('id', routeId)
      .update({
        route_geometry: db.raw(lineString)
      });
  },

  async count(filters = {}) {
    const query = db(TABLE);
    if (filters.status) {
      query.where('status', filters.status);
    }
    const result = await query.count('id as count').first();
    return parseInt(result.count);
  }
};

module.exports = Route;
