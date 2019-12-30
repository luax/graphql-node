const DataLoader = require("dataloader");
const { client } = require("../postgres");
const { gql } = require("apollo-server");

const typeDefs = gql`
  type Book {
    id: ID!
    title: String
    author: String
  }
  extend type Query {
    books: [Book]
    book(id: ID!): Book
  }
`;

const books = [
  {
    id: 1,
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
  },
  {
    id: 2,
    title: "Jurassic Park",
    author: "Michael Crichton",
  },
];

const resolvers = {
  Query: {
    books: () => books,
    book: (_obj, { id }, context, _info) =>
      context.loaders.book.getBooks.load(id),
  },
};

const loaders = _user => {
  const funkyReturn = (res, ids, compare) =>
    ids.map(id => res.find(r => compare(id, r)));

  const getBooks = async ids => {
    const res = await client.query(
      "SELECT id, title, author_id FROM books WHERE id IN ($1)",
      ids,
    );
    const rest = funkyReturn(res, ids, (id, record) => id == record.id);
    return rest;
  };

  return {
    book: {
      getBooks: new DataLoader(getBooks),
    },
  };
};

module.exports = { typeDefs, resolvers, loaders };
