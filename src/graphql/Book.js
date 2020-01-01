const DataLoader = require("dataloader");
const { AuthenticationError } = require("./errors");
const { client } = require("../postgres");
const { gql } = require("apollo-server");

const typeDefs = gql`
  type Book {
    id: ID!
    title: String
    author: Author
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
    authorId: "J.K. Rowling",
  },
  {
    id: 2,
    title: "Jurassic Park",
    authorId: "Michael Crichton",
  },
];

const resolvers = {
  Query: {
    books: () => books,
    book: (_obj, { id }, context, _info) =>
      context.loaders.books.getBooks.load(id),
  },
  Book: {
    author: (book, _, { user, loaders, models }, _info) => {
      if (!isAuthorized(user)) {
        throw new AuthenticationError("buu");
      }
      const author = loaders.authors.getById.load(book.author_id);
      if (!models.Author.isAuthorized(user)) {
        // TODO: Is this nice?
        throw new AuthenticationError("buu");
      }
      return author;
    },
  },
};

const isAuthorized = user => user !== null;

const loaders = () => ({
  books: {
    getBooks: new DataLoader(async ids => {
      const res = await client.query(
        "SELECT id, title, author_id FROM books WHERE id IN ($1)",
        ids,
      );
      return ids.map(id => res.find(b => b.id == id));
    }),
    getByAuthorId: new DataLoader(async ids => {
      const res = await client.query(
        "SELECT id, title, author_id FROM books WHERE author_id IN ($1)",
        ids,
      );
      return [
        res, // TODO: Allow more to be returned?
      ];
    }),
  },
});

module.exports = { typeDefs, resolvers, loaders, isAuthorized };
