exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE destinations ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
    ALTER TABLE routes ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
    ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE destinations DROP COLUMN IF EXISTS image_url;
    ALTER TABLE routes DROP COLUMN IF EXISTS image_url;
    ALTER TABLE events DROP COLUMN IF EXISTS image_url;
  `);
};
