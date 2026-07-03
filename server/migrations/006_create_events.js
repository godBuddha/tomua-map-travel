exports.up = function(knex) {
  return knex.raw(`
    CREATE TYPE event_type AS ENUM ('festival', 'season', 'experience', 'cultural', 'sport', 'food', 'other');
    CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'monthly', 'yearly');

    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      slug VARCHAR(255) UNIQUE NOT NULL,
      name JSONB NOT NULL,
      description JSONB,
      type event_type NOT NULL,
      icon VARCHAR(50),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      start_time TIME,
      end_time TIME,
      recurring recurrence_type DEFAULT 'none',
      frequency VARCHAR(100),
      season VARCHAR(50),
      destination_id UUID REFERENCES destinations(id),
      location GEOMETRY(Point, 4326),
      address JSONB,
      status content_status NOT NULL DEFAULT 'draft',
      image_url VARCHAR(500),
      created_by UUID REFERENCES users(id),
      approved_by UUID REFERENCES users(id),
      approved_at TIMESTAMPTZ,
      rejection_reason TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_events_type ON events(type);
    CREATE INDEX idx_events_status ON events(status);
    CREATE INDEX idx_events_dates ON events(start_date, end_date);
    CREATE INDEX idx_events_dest ON events(destination_id);
    CREATE INDEX idx_events_location ON events USING GIST(location);

    CREATE TRIGGER update_events_updated_at
      BEFORE UPDATE ON events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_events_updated_at ON events;
    DROP TABLE IF EXISTS events;
    DROP TYPE IF EXISTS recurrence_type;
    DROP TYPE IF EXISTS event_type;
  `);
};
