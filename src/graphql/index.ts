import merge from "lodash/merge";
import context from "./context";
import Root from "./Root";
import User from "./User";
import Book from "./Book";
import Author from "./Author";
import UserDataSource from "./User/DataSource";
import BookDataSource from "./Book/DataSource";
import AuthorDataSource from "./Author/DataSource";
import { IResolvers } from "apollo-server";
import { DocumentNode } from "graphql";

const typeDefs: DocumentNode[] = [
  Root.typeDefs,
  User.typeDefs,
  Author.typeDefs,
  Book.typeDefs,
];

const resolvers: IResolvers = merge(
  Root.resolvers,
  User.resolvers,
  Author.resolvers,
  Book.resolvers,
);

export type DataSources = {
  author: AuthorDataSource;
  book: BookDataSource;
  user: UserDataSource;
};

const dataSources = (): DataSources => ({
  author: new Author.DataSource(),
  book: new Book.DataSource(),
  user: new User.DataSource(),
});

export default {
  typeDefs,
  resolvers,
  context,
  // models,
  dataSources,
};
