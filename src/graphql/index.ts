import merge from "lodash/merge";
import context from "./context";
import Root from "./Root";
import User, { UserLoaders } from "./User";
import Book, { BookLoaders } from "./Book";
import Author, { AuthorLoaders } from "./Author";
import { IResolvers } from "apollo-server";
import { DocumentNode } from "graphql";
import { Model } from "./types";

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

export type Loaders = BookLoaders & UserLoaders & AuthorLoaders;

const models: Model<BookLoaders | UserLoaders | AuthorLoaders>[] = [Author];

const loaders = (): Loaders =>
  merge(Book.loaders(), User.loaders(), Author.loaders());

export default {
  typeDefs,
  resolvers,
  context: context(loaders),
  loaders,
  models,
};
