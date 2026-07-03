exports.up = function(knex) {
  return knex.schema.alterTable('destinations', function(table) {
    table.jsonb('visitor_notes').defaultTo('[]');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('destinations', function(table) {
    table.dropColumn('visitor_notes');
  });
};
