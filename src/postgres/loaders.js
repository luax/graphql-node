const DataLoader = require("dataloader");
const { getBooks } = require('./queries');

module.exports = _req => ({
  book: new DataLoader(getBooks),
});
