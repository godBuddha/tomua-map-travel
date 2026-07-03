exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE i18n_content (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      page VARCHAR(100) NOT NULL,
      key VARCHAR(200) NOT NULL,
      lang VARCHAR(5) NOT NULL,
      value TEXT NOT NULL,
      updated_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX idx_i18n_lookup ON i18n_content(page, key, lang);
    CREATE INDEX idx_i18n_page ON i18n_content(page);
    CREATE INDEX idx_i18n_lang ON i18n_content(lang);

    CREATE TRIGGER update_i18n_updated_at
      BEFORE UPDATE ON i18n_content
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TRIGGER IF EXISTS update_i18n_updated_at ON i18n_content;
    DROP TABLE IF EXISTS i18n_content;
  `);
};
