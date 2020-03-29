import { IResolvers, IFieldResolver } from "apollo-server";
import { Author } from ".";
// import Auth from "../Auth";
import { ConnectionInput, Connection } from "src/lib";
import { ConnectionUtils } from "src/lib/utils";
import { AppContext, Book } from "src/graph/types";

export interface AuthorResolver extends IResolvers {
  Query: {
    author: IFieldResolver<null, AppContext, { id: string }>;
  };
  Author: {
    books: IFieldResolver<Author, AppContext, null>;
    booksConnection: IFieldResolver<
      Author,
      AppContext,
      { input: ConnectionInput }
    >;
  };
}

const resolvers: AuthorResolver = {
  Query: {
    author: async (_, { id }, context, info): Promise<Author | undefined> => {
      // const author = await context.dataSources.author.getById(id);
      const author = await context.dataSources.author.getByIdTest(id, info);
      return author;
      // const user = await Auth.authenticate(context);
      // if (Auth.authorized(user, author)) {
      //   return author;
      // }
      // return undefined;
    },
  },
  Author: {
    books: (author, _, { dataSources }): Promise<(Book | undefined)[]> =>
      dataSources.book.getByAuthorId(author.id),
    // eslint-disable-next-line max-statements
    booksConnection: async (
      author,
      { input },
      { dataSources },
    ): Promise<Connection<Book>> => {
      const {
        before,
        after,
        isFirst,
        isLast,
        limit,
      } = await ConnectionUtils.getArguments<Book>(
        input,
        async (cursor: string) => dataSources.book.getById(cursor),
      );
      const ids = await dataSources.book.getIdsByPagination({
        primaryKey: author.id,
        limit,
        before: before ? before.id : null,
        after: after ? after.id : null,
        isFirst,
        isLast,
      });
      const maybeBooks = await Promise.all(
        ids.map(id => dataSources.book.getById(id)),
      );
      const books = maybeBooks.filter(
        (f: Book | undefined): f is Book => f !== undefined,
      );
      const edges = books.map(book => ({
        node: book,
        cursor: book.id,
      }));
      const firstEdge = edges[0];
      const lastEdge = edges[edges.length - 1];
      const startCursor = firstEdge ? firstEdge.cursor.toString() : null;
      const endCursor = lastEdge ? lastEdge.cursor.toString() : null;
      const hasNextPage = (): Promise<boolean> =>
        dataSources.book.paginationHasNextPage(author.id, endCursor);
      const hasPreviousPage = (): Promise<boolean> =>
        dataSources.book.paginationHasPreviousPage(author.id, endCursor);
      const totalCount = (): Promise<number> =>
        dataSources.book.totalCountByAuthorId(author.id);
      return {
        nodes: books,
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor,
          endCursor,
        },
        totalCount,
      };
    },
  },
};

export default resolvers;
