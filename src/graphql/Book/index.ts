import { gql, IResolvers, IFieldResolver } from "apollo-server";
import { client, sql, QueryResultRowType } from "../../postgres";
import { Context } from "../context";
import { Author } from "../author";
import DataLoader from "dataloader";
import groupBy from "lodash/groupBy";
import { PrimitiveValueExpressionTypeArray } from "slonik";

const typeDefs = gql`
  type Book implements Node {
    id: ID!
    title: String
    author: Author
  }

  type BookEdge implements Edge {
    node: Book!
    cursor: String!
  }

  type BookConnection implements Connection {
    edges: [BookEdge]!
    nodes: [Book]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  extend type Query {
    books: [Book]
    book(id: ID!): Book
  }
`;

export interface Book {
  id: string;
  authorId: string;
  title?: string;
}

const serializeBook = (row: QueryResultRowType<string>): Book => ({
  id: row["id"].toString(),
  authorId: row["author_id"].toString(),
  title: row["title"] as string,
});

const serializeBooks = (rows: readonly QueryResultRowType<string>[]): Book[] =>
  rows.map(row => serializeBook(row));

interface BookResolvers extends IResolvers {
  Query: {
    books: IFieldResolver<null, Context, null>;
    book: IFieldResolver<null, Context, { id: string }>;
  };
  Book: {
    author: IFieldResolver<Book, Context, null>;
  };
}

const resolvers: BookResolvers = {
  Query: {
    books: async (): Promise<Book[]> => {
      const columns = client.columns(["id", "title", "author_id"]);
      const res = await client.query(
        sql`SELECT ${columns} FROM books ORDER BY id ASC`,
      );
      return serializeBooks(res);
    },
    book: async (_, { id }, { loaders }): Promise<Book | undefined> =>
      loaders.books.getById.load(id),
  },
  Book: {
    author: async (book, _, context): Promise<Author | undefined> => {
      const author = await context.loaders.authors.getById.load(book.authorId);
      return author;
    },
  },
};

export interface BookLoaders {
  books: {
    getById: DataLoader<string, Book | undefined>;
    getByAuthorId: DataLoader<string, (Book | undefined)[]>;
  };
}

const loaders = (): BookLoaders => ({
  books: {
    getById: new DataLoader(async ids => {
      const columns = client.columns(["id", "title", "author_id"]);
      const sqlArray = sql.array(
        ids as PrimitiveValueExpressionTypeArray,
        "int4",
      );
      const res = await client.query(
        sql`SELECT ${columns} FROM books WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      const books = serializeBooks(res);
      return ids.map(id => books.find(b => b.id === id));
    }),
    getByAuthorId: new DataLoader(async ids => {
      const columns = client.columns(["id", "title", "author_id"]);
      const sqlArray = sql.array(
        ids as PrimitiveValueExpressionTypeArray,
        "int4",
      );
      const res = await client.query(
        sql`SELECT ${columns} FROM books WHERE author_id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      const books = serializeBooks(res);
      const booksByAuthor = groupBy(books, "authorId");
      return ids.map(authorId => booksByAuthor[authorId]);
    }),
  },
});

export default {
  typeDefs,
  resolvers,
  loaders,
};
