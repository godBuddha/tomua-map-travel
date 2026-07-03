exports.up = function(knex) {
  return knex.raw(`
    CREATE TYPE entity_type AS ENUM ('destination', 'route', 'event');
    CREATE TYPE comment_action AS ENUM ('comment', 'request_changes', 'approve', 'reject');

    CREATE TABLE approval_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      entity_type entity_type NOT NULL,
      entity_id UUID NOT NULL,
      user_id UUID NOT NULL REFERENCES users(id),
      comment TEXT,
      action comment_action NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_comments_entity ON approval_comments(entity_type, entity_id);
    CREATE INDEX idx_comments_user ON approval_comments(user_id);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS approval_comments;
    DROP TYPE IF EXISTS comment_action;
    DROP TYPE IF EXISTS entity_type;
  `);
};
