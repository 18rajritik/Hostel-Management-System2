const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const sendPaginated = async (res, modelQuery, countQuery, page, limit) => {
  const [items, total] = await Promise.all([modelQuery, countQuery]);
  res.json({
    success: true,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
    data: items
  });
};

module.exports = { getPagination, sendPaginated };
