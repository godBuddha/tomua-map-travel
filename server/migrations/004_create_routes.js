exports.up = function(knex) {
  return knex.raw(`
    CREATE TYPE transport_mode AS ENUM ('walk', 'bike', 'car', 'bus');
    CREATE TYPE duration_type AS ENUM ('half_day', 'full_day', 'two_day', 'custom');
    CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

    CREATE TABLE routes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug VARCHAR(255) UNIQUE NOT NULL,
      name JSONB NOT NULL,
      description JSONB,
      transport transport_mode NOT NULL DEFAULT 'walk',
      duration duration_type NOT NULL DEFAULT 'full_day',
      difficulty difficulty_level NOT NULL DEFAULT 'medium',
      distance_km DECIMAL(10, 2),
      estimated_time_min INTEGER,
      route_geometry GEOMETRY(LineString, 4326),
      elevation_gain_m INTEGER,
      status content_status NOT NULL DEFAULT 'draft',
      created_by UUID REFERENCES users(id),
      approved_by UUID REFERENCES users(id),
      approved_at TIMESTAMPTZ,
      rejection_reason TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_routes_transport ON routes(transport);
    CREATE INDEX idx_routes_duration ON routes(duration);
    CREATE INDEX idx_routes_difficulty ON routes(difficulty);
    CREATE INDEX idx_routes_status ON routes(status);
    CREATE INDEX idx_routes_geometry ON routes USING GIST(route_geometry);

    CREATE TRIGGER update_routes_updated_at
      BEFORE UPDATE ON routes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
    DROP TABLE IF EXISTS routes;
    DROP TYPE IF EXISTS difficulty_level;
    DROP TYPE IF EXISTS duration_type;
    DROP TYPE IF EXISTS transport_mode;
  `);
};
