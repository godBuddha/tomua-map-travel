exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE destination_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
      url VARCHAR(500) NOT NULL,
      alt_text JSONB,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_dest_images_dest ON destination_images(destination_id);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS destination_images;
  `);
};
