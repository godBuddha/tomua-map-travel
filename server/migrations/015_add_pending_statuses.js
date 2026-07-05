exports.up = function(knex) {
  return knex.raw(`
    ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'pending_edit';
    ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'pending_delete';
  `);
};

exports.down = function(knex) {
  // PostgreSQL does not support removing values from an ENUM type
  // The values will remain but won't be used if rolled back
  return knex.raw(`
    -- Note: Cannot remove ENUM values in PostgreSQL without recreating the type
    -- This is a safe forward-only migration
  `);
};
