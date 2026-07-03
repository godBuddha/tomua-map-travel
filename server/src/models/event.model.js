const db = require('../config/database');
const { createPoint } = require('../utils/geo');
const { generateUniqueSlug } = require('../utils/slugify');

const TABLE = 'events';

const Event = {
  async findById(id) {
    return db(TABLE).where('id', id).first();
  },

  async findBySlug(slug) {
    return db(TABLE).where('slug', slug).first();
  },

  async findAll(filters = {}) {
    const query = db(TABLE);

    if (filters.type) {
      query.where('type', filters.type);
    }
    if (filters.status) {
      query.where('status', filters.status);
    }
    
    // BUG-FIX: Secure visibility for collaborators
    if (filters.collaborator_id) {
      // Collaborators see ALL 'published' plus ANY of their own creations
      query.where(function() {
        this.where('events.status', 'published')
            .orWhere('events.created_by', filters.collaborator_id);
      });
    }
    
    if (filters.destination_id) {
      query.where('destination_id', filters.destination_id);
    }
    if (filters.from) {
      query.where('end_date', '>=', filters.from);
    }
    if (filters.to) {
      query.where('start_date', '<=', filters.to);
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
      .orderBy(filters.sort || 'start_date', filters.order || 'asc')
      .offset(offset)
      .limit(limit);

    // BUG-05 FIX: Build separate countQuery with the same filters
    // Previously this counted ALL rows ignoring filters — wrong totalPages / hasNext
    const countQuery = db(TABLE);
    if (filters.type) countQuery.where('type', filters.type);
    if (filters.status) countQuery.where('status', filters.status);
    if (filters.collaborator_id) {
      countQuery.where(function() {
        this.where('events.status', 'published')
            .orWhere('events.created_by', filters.collaborator_id);
      });
    }
    if (filters.destination_id) countQuery.where('destination_id', filters.destination_id);
    if (filters.from) countQuery.where('end_date', '>=', filters.from);
    if (filters.to) countQuery.where('start_date', '<=', filters.to);
    if (filters.search) {
      countQuery.where(function() {
        this.whereRaw("name->>'vi' ILIKE ?", [`%${filters.search}%`])
          .orWhereRaw("name->>'en' ILIKE ?", [`%${filters.search}%`]);
      });
    }
    const countResult = await countQuery.count('id as count').first();
    const total = parseInt(countResult.count);

    return require('../utils/pagination').paginateResponse(items, total, page, limit);
  },

  async findUpcoming(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    return db(TABLE)
      .where('status', 'published')
      .where('end_date', '>=', today)
      .orderBy('start_date', 'asc')
      .limit(limit);
  },

  async create(data) {
    const slug = await generateUniqueSlug(data.name.vi || data.name.en, TABLE, db);

    const insertData = { ...data, slug };
    
    // Only create PostGIS point if lat/lng are provided
    if (data.lat && data.lng) {
      insertData.location = db.raw(createPoint(data.lng, data.lat));
      delete insertData.lat;
      delete insertData.lng;
    } else {
      // Remove location if it's just a string (place name)
      delete insertData.location;
    }

    const [event] = await db(TABLE)
      .insert(insertData)
      .returning('*');

    return event;
  },

  async update(id, data) {
    const updateData = { ...data };

    if (data.lat && data.lng) {
      updateData.location = db.raw(createPoint(data.lng, data.lat));
      delete updateData.lat;
      delete updateData.lng;
    }

    if (data.name && (data.name.vi || data.name.en)) {
      const existing = await this.findById(id);
      if (existing && existing.name.vi !== data.name.vi) {
        updateData.slug = await generateUniqueSlug(data.name.vi || data.name.en, TABLE, db, id);
      }
    }

    const [event] = await db(TABLE)
      .where('id', id)
      .update(updateData)
      .returning('*');

    return event;
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

    const [event] = await db(TABLE)
      .where('id', id)
      .update(updateData)
      .returning('*');

    return event;
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

module.exports = Event;
