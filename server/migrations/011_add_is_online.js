exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
    CREATE INDEX idx_users_online ON users(is_online);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE users DROP COLUMN IF EXISTS is_online;
    ALTER TABLE users DROP COLUMN IF EXISTS last_active_at;
  `);
};
