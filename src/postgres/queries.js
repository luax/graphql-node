const { query } = require("./client");

// TODO...
const funkyReturn = (res, ids, compare) =>
  ids.map(id => res.find(r => compare(id, r)));

module.exports = {
  getBooks: async ids => {
    const res = await query(
      "SELECT * FROM books WHERE id IN ($1)",
      ids,
    );
    console.log(res);
    return funkyReturn(res, ids, (id, record) => id == record.id);
  },
};
