/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE users 
    ADD COLUMN mfa_enabled BOOLEAN DEFAULT false,
    ADD COLUMN mfa_secret VARCHAR(255),
    ADD COLUMN mfa_backup_codes JSONB,
    ADD COLUMN failed_login_attempts INTEGER DEFAULT 0,
    ADD COLUMN locked_until TIMESTAMPTZ,
    ADD COLUMN password_changed_at TIMESTAMPTZ;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS mfa_enabled,
    DROP COLUMN IF EXISTS mfa_secret,
    DROP COLUMN IF EXISTS mfa_backup_codes,
    DROP COLUMN IF EXISTS failed_login_attempts,
    DROP COLUMN IF EXISTS locked_until,
    DROP COLUMN IF EXISTS password_changed_at;
  `);
};
