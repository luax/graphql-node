import { IResolvers, IFieldResolver } from "apollo-server";
import { AppContext } from "src/graph/types";
import { Author } from "src/graph/Author";
import { Book } from ".";

interface BookResolvers extends IResolvers {
  Query: {
    books: IFieldResolver<null, AppContext, null>;
    book: IFieldResolver<null, AppContext, { id: string }>;
  };
  Book: {
    author: IFieldResolver<Book, AppContext, null>;
  };
}

const resolvers: BookResolvers = {
  Query: {
    books: async (_, _args, { dataSources }): Promise<Book[]> =>
      dataSources.book.getBooks(),
    book: async (_, { id }, { dataSources }): Promise<Book | undefined> =>
      dataSources.book.getById(id),
  },
  Book: {
    author: async (book, _, { dataSources }): Promise<Author | undefined> => {
      const author = await dataSources.author.getById(book.authorId);
      return author;
    },
  },
};

export default resolvers;
