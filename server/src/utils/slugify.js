const slugify = require('slugify');

const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true
  });
};

const generateUniqueSlug = async (text, table, db, id = null) => {
  let slug = generateSlug(text);
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const query = db(table).where('slug', uniqueSlug);
    if (id) {
      query.andWhereNot('id', id);
    }
    const existing = await query.first();

    if (!existing) {
      return uniqueSlug;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
};

module.exports = {
  generateSlug,
  generateUniqueSlug
};
