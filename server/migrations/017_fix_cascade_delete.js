exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE route_stops DROP CONSTRAINT IF EXISTS route_stops_destination_id_fkey;
    ALTER TABLE route_stops ADD CONSTRAINT route_stops_destination_id_fkey 
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE;

    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_destination_id_fkey;
    ALTER TABLE events ADD CONSTRAINT events_destination_id_fkey 
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL;
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE route_stops DROP CONSTRAINT IF EXISTS route_stops_destination_id_fkey;
    ALTER TABLE route_stops ADD CONSTRAINT route_stops_destination_id_fkey 
      FOREIGN KEY (destination_id) REFERENCES destinations(id);

    ALTER TABLE events DROP CONSTRAINT IF EXISTS events_destination_id_fkey;
    ALTER TABLE events ADD CONSTRAINT events_destination_id_fkey 
      FOREIGN KEY (destination_id) REFERENCES destinations(id);
  `);
};
