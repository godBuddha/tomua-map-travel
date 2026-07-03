exports.up = function(knex) {
  return knex.raw(`
    CREATE EXTENSION IF NOT EXISTS postgis;

    CREATE TYPE destination_type AS ENUM ('waterfall', 'cave', 'historical', 'spiritual', 'other');
    CREATE TYPE content_status AS ENUM ('draft', 'pending', 'published', 'archived');

    CREATE TABLE destinations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug VARCHAR(255) UNIQUE NOT NULL,
      name JSONB NOT NULL,
      type destination_type NOT NULL,
      region VARCHAR(100) NOT NULL DEFAULT 'Tô Múa',
      description JSONB,
      quote JSONB,
      color VARCHAR(7),
      gradient VARCHAR(200),
      stats JSONB,
      info JSONB,
      location GEOMETRY(Point, 4326) NOT NULL,
      address JSONB,
      status content_status NOT NULL DEFAULT 'draft',
      created_by UUID REFERENCES users(id),
      approved_by UUID REFERENCES users(id),
      approved_at TIMESTAMPTZ,
      rejection_reason TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_destinations_type ON destinations(type);
    CREATE INDEX idx_destinations_region ON destinations(region);
    CREATE INDEX idx_destinations_status ON destinations(status);
    CREATE INDEX idx_destinations_location ON destinations USING GIST(location);
    CREATE INDEX idx_destinations_slug ON destinations(slug);
    CREATE INDEX idx_destinations_name_gin ON destinations USING GIN(name);

    CREATE TRIGGER update_destinations_updated_at
      BEFORE UPDATE ON destinations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_destinations_updated_at ON destinations;
    DROP TABLE IF EXISTS destinations;
    DROP TYPE IF EXISTS content_status;
    DROP TYPE IF EXISTS destination_type;
  `);
};
