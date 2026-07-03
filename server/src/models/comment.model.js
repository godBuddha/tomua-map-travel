const db = require('../config/database');

const TABLE = 'approval_comments';

const Comment = {
  async findById(id) {
    return db(TABLE).where('id', id).first();
  },

  async findByEntity(entityType, entityId) {
    return db(TABLE)
      .where('entity_type', entityType)
      .where('entity_id', entityId)
      .leftJoin('users', 'approval_comments.user_id', 'users.id')
      .select(
        'approval_comments.*',
        'users.name as user_name',
        'users.avatar_url as user_avatar',
        'users.role as user_role'
      )
      .orderBy('approval_comments.created_at', 'desc');
  },

  async create(data) {
    const [comment] = await db(TABLE)
      .insert(data)
      .returning('*');
    return comment;
  },

  async delete(id) {
    return db(TABLE).where('id', id).del();
  },

  async countByEntity(entityType, entityId) {
    const result = await db(TABLE)
      .where('entity_type', entityType)
      .where('entity_id', entityId)
      .count('id as count')
      .first();
    return parseInt(result.count);
  }
};

module.exports = Comment;
