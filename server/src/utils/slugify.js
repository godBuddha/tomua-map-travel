const slugify = require('slugify');

const generateSlug = text => {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi',
    trim: true
  });
};

const generateUniqueSlug = async (text, table, db, id = null) => {
  const slug = generateSlug(text);
  let uniqueSlug = slug;
  let counter = 1;
  let found = false;

  while (!found) {
    const query = db(table).where('slug', uniqueSlug);
    if (id) {
      query.andWhereNot('id', id);
    }
    const existing = await query.first();

    if (!existing) {
      found = true;
    } else {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  return uniqueSlug;
};

module.exports = {
  generateSlug,
  generateUniqueSlug
};
