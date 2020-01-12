import { gql, IResolvers, IFieldResolver } from "apollo-server";
import { client, sql, QueryResultRowType } from "../../postgres";
import { Context } from "../context";
import { Book } from "../Book";
import DataLoader from "dataloader";
import { PrimitiveValueExpressionTypeArray } from "slonik";

const typeDefs = gql`
  type Author implements Node {
    id: ID!
    name: String
    books: [Book]
    booksConnection(input: ConnectionInput): BookConnection!
  }

  extend type Query {
    author(id: ID!): Author
  }

  input CreateAuthorInput {
    name: String!
  }

  input UpdateAuthorInput {
    id: ID!
    name: String!
  }

  type CreateAuthorMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    node: Author
  }

  type UpdateAuthorMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    node: Author
  }

  extend type Mutation {
    createAuthor(input: CreateAuthorInput!): CreateAuthorMutationResponse!
    updateAuthor(input: UpdateAuthorInput!): UpdateAuthorMutationResponse!
  }
`;

export interface Author {
  id: string;
  name?: string;
}

const serializeAuthor = (row: QueryResultRowType<string>): Author => ({
  id: row["id"].toString(),
  name: row["name"] as string,
});

const serializeAuthors = (
  rows: readonly QueryResultRowType<string>[],
): Author[] => rows.map(row => serializeAuthor(row));

interface AuthorResolver extends IResolvers {
  Query: {
    author: IFieldResolver<null, Context, { id: string }>;
  };
  Author: {
    books: IFieldResolver<Author, Context, null>;
  };
}

const resolvers: AuthorResolver = {
  Query: {
    author: async (_, { id }, { loaders }): Promise<Author | undefined> =>
      loaders.authors.getById.load(id),
  },
  Author: {
    books: async (author, _, context): Promise<(Book | undefined)[]> => {
      const books = await context.loaders.books.getByAuthorId.load(author.id);
      return books;
    },
  },
};

export interface AuthorLoaders {
  authors: {
    getById: DataLoader<string, Author | undefined>;
  };
}

const loaders = (): AuthorLoaders => ({
  authors: {
    getById: new DataLoader(async ids => {
      const columns = client.columns(["id", "name"]);
      const sqlArray = sql.array(
        ids as PrimitiveValueExpressionTypeArray,
        "int4",
      );
      const res = await client.query(
        sql`SELECT ${columns} FROM authors WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      const authors = serializeAuthors(res);
      return ids.map(id => authors.find(p => p.id === id));
    }),
  },
});

export default {
  typeDefs,
  resolvers,
  loaders,
};
