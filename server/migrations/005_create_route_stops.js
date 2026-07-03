exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE route_stops (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
      destination_id UUID NOT NULL REFERENCES destinations(id),
      stop_order INTEGER NOT NULL,
      description JSONB,
      duration_minutes INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX idx_route_stops_order ON route_stops(route_id, stop_order);
    CREATE INDEX idx_route_stops_dest ON route_stops(destination_id);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS route_stops;
  `);
};
