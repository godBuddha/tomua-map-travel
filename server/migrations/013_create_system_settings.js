exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE system_settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      description TEXT,
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TRIGGER update_system_settings_updated_at
      BEFORE UPDATE ON system_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
    DROP TABLE IF EXISTS system_settings;
  `);
};
