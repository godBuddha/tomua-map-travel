const db = require('../config/database');
const { createPoint } = require('../utils/geo');
const { generateUniqueSlug } = require('../utils/slugify');

const TABLE = 'destinations';

const Destination = {
  async findById(id) {
    const destination = await db(TABLE)
      .select('destinations.*', db.raw('ST_Y(location::geometry) as lat'), db.raw('ST_X(location::geometry) as lng'))
      .where('destinations.id', id)
      .first();

    if (destination) {
      destination.images = await db('destination_images').where('destination_id', id).orderBy('sort_order');
    }
    return destination;
  },

  async findBySlug(slug) {
    const destination = await db(TABLE)
      .select('destinations.*', db.raw('ST_Y(location::geometry) as lat'), db.raw('ST_X(location::geometry) as lng'))
      .where('destinations.slug', slug)
      .first();

    if (destination) {
      destination.images = await db('destination_images').where('destination_id', destination.id).orderBy('sort_order');
    }
    return destination;
  },

  async findAll(filters = {}) {
    const query = db(TABLE).select(
      'destinations.*',
      db.raw('ST_Y(location::geometry) as lat'),
      db.raw('ST_X(location::geometry) as lng'),
      db.raw(`(
        SELECT COALESCE(json_agg(json_build_object(
          'id', di.id, 'image_url', di.url, 'sort_order', di.sort_order
        ) ORDER BY di.sort_order), '[]'::json)
        FROM destination_images di WHERE di.destination_id = destinations.id
      ) as images`)
    );

    if (filters.type) {
      query.where('destinations.type', filters.type);
    }
    if (filters.region) {
      query.where('destinations.region', filters.region);
    }
    if (filters.status) {
      query.where('destinations.status', filters.status);
    }

    if (filters.collaborator_id) {
      query.where(function () {
        this.where('destinations.status', 'published').orWhere('destinations.created_by', filters.collaborator_id);
      });
    }
    if (filters.search) {
      query.where(function () {
        this.whereRaw("destinations.name->>'vi' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("destinations.name->>'en' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("destinations.name->>'ko' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("destinations.name->>'zh' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("destinations.name->>'ja' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("destinations.description->>'vi' ILIKE ?", [`%${filters.search}%`]);
      });
    }

    const { offset, limit, page } = require('../utils/pagination').paginate(
      null,
      filters.page,
      filters.limit,
      filters.offset
    );

    // Count with same filters
    const countQuery = db(TABLE).count('id as count');
    if (filters.type) {
      countQuery.where('type', filters.type);
    }
    if (filters.region) {
      countQuery.where('region', filters.region);
    }
    if (filters.status) {
      countQuery.where('status', filters.status);
    }
    if (filters.search) {
      countQuery.where(function () {
        this.whereRaw("name->>'vi' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("name->>'en' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("description->>'vi' ILIKE ?", [`%${filters.search}%`]);
      });
    }

    const items = await query
      .orderBy(filters.sort || 'destinations.created_at', filters.order || 'desc')
      .offset(offset)
      .limit(limit);

    const countResult = await countQuery.first();
    const total = parseInt(countResult.count);

    return require('../utils/pagination').paginateResponse(items, total, page, limit, offset);
  },

  async findNearby(lat, lng, radiusMeters = 5000) {
    const items = await db.raw(
      `
      SELECT d.*,
        ST_Y(d.location::geometry) as lat,
        ST_X(d.location::geometry) as lng,
        ST_DistanceSphere(d.location, ST_SetSRID(ST_MakePoint(?, ?), 4326)) as distance,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', di.id, 'image_url', di.url, 'sort_order', di.sort_order
          ) ORDER BY di.sort_order)
          FROM destination_images di WHERE di.destination_id = d.id
        ), '[]'::json) as images
      FROM destinations d
      WHERE ST_DWithin(d.location, ST_SetSRID(ST_MakePoint(?, ?), 4326), ?)
        AND d.status = 'published'
      ORDER BY distance
      LIMIT 20
    `,
      [lng, lat, lng, lat, radiusMeters]
    );

    return items.rows;
  },

  async create(data) {
    const slug = await generateUniqueSlug(data.name.vi || data.name.en, TABLE, db);
    const location = createPoint(data.lng, data.lat);

    // Remove lat/lng from data since they're stored in location column
    const insertData = { ...data };
    delete insertData.lat;
    delete insertData.lng;

    // Ensure JSON fields are properly serialized for PostgreSQL
    if (insertData.image_urls && typeof insertData.image_urls === 'object') {
      insertData.image_urls = JSON.stringify(insertData.image_urls);
    }

    const [destination] = await db(TABLE)
      .insert({
        ...insertData,
        slug,
        location: db.raw(location)
      })
      .returning('*');

    return destination;
  },

  async update(id, data) {
    const updateData = { ...data };

    if (data.lat && data.lng) {
      updateData.location = db.raw(createPoint(data.lng, data.lat));
      delete updateData.lat;
      delete updateData.lng;
    }

    // Ensure JSON fields are properly serialized for PostgreSQL
    if (updateData.image_urls && typeof updateData.image_urls === 'object') {
      updateData.image_urls = JSON.stringify(updateData.image_urls);
    }

    if (data.name && (data.name.vi || data.name.en)) {
      const existing = await this.findById(id);
      if (existing) {
        // BUG-12 FIX: JSONB from PostgreSQL may come back as object or string depending on driver.
        // Parse safely before comparing to avoid slug never being updated.
        const existingName = typeof existing.name === 'string' ? JSON.parse(existing.name) : existing.name;
        const existingVi = existingName ? existingName.vi : null;
        if (existingVi !== data.name.vi) {
          updateData.slug = await generateUniqueSlug(data.name.vi || data.name.en, TABLE, db, id);
        }
      }
    }

    const [destination] = await db(TABLE).where('id', id).update(updateData).returning('*');

    return destination;
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
    } else if (status === 'pending_edit') {
      // Edit submitted for review — clear any previous rejection
      updateData.rejection_reason = null;
    } else if (status === 'pending_delete') {
      // Deletion requested — clear any previous rejection
      updateData.rejection_reason = null;
    }

    const [destination] = await db(TABLE).where('id', id).update(updateData).returning('*');

    return destination;
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

module.exports = Destination;
