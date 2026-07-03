const db = require('../config/database');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth');

const TABLE = 'users';

const User = {
  async findById(id) {
    return db(TABLE).where('id', id).first();
  },

  async findByEmail(email) {
    return db(TABLE).where('email', email).first();
  },

  async findByUsername(username) {
    return db(TABLE).where('username', username).first();
  },

  async findAll(filters = {}) {
    const query = db(TABLE);
    const limit = parseInt(filters.limit) || 50;
    const offset = parseInt(filters.offset) || 0;
    
    if (filters.role) {
      query.where('role', filters.role);
    }
    if (filters.status) {
      query.where('status', filters.status);
    }
    if (filters.search) {
      query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
          .orWhere('email', 'ilike', `%${filters.search}%`)
          .orWhere('username', 'ilike', `%${filters.search}%`);
      });
    }

    return query.orderBy('created_at', 'desc').limit(limit).offset(offset);
  },

  async create(userData) {
    const { password, ...data } = userData;
    const password_hash = await bcrypt.hash(password, authConfig.saltRounds);
    
    const [user] = await db(TABLE)
      .insert({ ...data, password_hash })
      .returning('*');
    
    return user;
  },

  async update(id, userData) {
    const { password, ...data } = userData;
    const updateData = { ...data };

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, authConfig.saltRounds);
    }

    const [user] = await db(TABLE)
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    return user;
  },

  async delete(id) {
    return db(TABLE).where('id', id).del();
  },

  async updateLastLogin(id) {
    return db(TABLE).where('id', id).update({ last_login: new Date() });
  },

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  async count() {
    const result = await db(TABLE).count('id as count').first();
    return parseInt(result.count);
  },

  async setOnline(id, isOnline) {
    return db(TABLE).where('id', id).update({
      is_online: isOnline,
      last_active_at: new Date()
    });
  },

  async findOnline() {
    return db(TABLE)
      .where('is_online', true)
      .where('status', 'active')
      .orderBy('last_active_at', 'desc');
  },

  async cleanupStaleOnline(timeoutMinutes = 30) {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    return db(TABLE)
      .where('is_online', true)
      .where('last_active_at', '<', cutoff)
      .update({ is_online: false });
  }
};

module.exports = User;
