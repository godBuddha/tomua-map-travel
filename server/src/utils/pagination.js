const paginate = (query, page = 1, limit = 20, offset = null) => {
  // BUG-13 FIX: Always parseInt page and limit before arithmetic
  // to prevent accidental string concatenation (e.g. ('2'-1) * '10' works but is fragile)
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 20;

  // Support both page-based and offset-based pagination
  if (offset !== null) {
    const parsedOffset = parseInt(offset);
    return {
      offset: parsedOffset,
      limit: parsedLimit,
      page: Math.floor(parsedOffset / parsedLimit) + 1
    };
  }
  
  const calculatedOffset = (parsedPage - 1) * parsedLimit;
  return {
    offset: calculatedOffset,
    limit: parsedLimit,
    page: parsedPage
  };
};

const paginateResponse = (items, total, page, limit, offset = null) => {
  const totalPages = Math.ceil(total / limit);
  const currentOffset = offset !== null ? parseInt(offset) : (page - 1) * limit;
  
  return {
    items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages,
      offset: currentOffset,
      hasNext: currentOffset + items.length < total,
      hasPrev: currentOffset > 0
    }
  };
};

module.exports = {
  paginate,
  paginateResponse
};
