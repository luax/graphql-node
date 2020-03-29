import merge from "lodash/merge";
import Root from "./Root";
import User from "./User";
import Book from "./Book";
import Author from "./Author";
import { IResolvers } from "apollo-server";
import { DocumentNode } from "graphql";
import { DataSources } from "./types";

export const typeDefs: DocumentNode[] = [
  Root.typeDefs,
  User.typeDefs,
  Author.typeDefs,
  Book.typeDefs,
];

export const resolvers: IResolvers = merge(
  Root.resolvers,
  User.resolvers,
  Author.resolvers,
  Book.resolvers,
);

export const dataSources = (): DataSources => ({
  author: new Author.DataSource(),
  book: new Book.DataSource(),
  user: new User.DataSource(),
});

export default {
  typeDefs,
  resolvers,
  dataSources,
};
