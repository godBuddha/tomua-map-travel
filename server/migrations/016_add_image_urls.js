exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE destinations ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE destinations DROP COLUMN IF EXISTS image_urls;
    ALTER TABLE events DROP COLUMN IF EXISTS image_urls;
  `);
};
