import { DataSources } from ".";
import { User } from "./User";
import Auth from "./auth";
import { DocumentNode } from "graphql";
import { IResolvers } from "apollo-server";
import { QueryResultRowType } from "slonik";
import express from "express";

// import { DataSource } from "apollo-datasource";

// export interface Model<T> {
//   typeDefs: DocumentNode;
//   resolvers: IResolvers;
//   loaders: () => DataSource;
// }

export interface Context {
  req: express.Request;
}

export interface AppContext extends Context {
  dataSources: DataSources;
  auth: Auth;
}

export interface Model {
  typeDefs: DocumentNode;
  resolvers: IResolvers;
}

export interface PageInfo {
  hasNextPage: boolean | (() => Promise<boolean>);
  hasPreviousPage: boolean | (() => Promise<boolean>);
  endCursor: string | null;
  startCursor: string | null;
}

export interface MutationResponse<T> {
  code: string;
  success: boolean;
  message: string;
  node?: T;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[] | (() => Promise<Edge<T>[]>);
  nodes: T[] | (() => Promise<T[]>);
  pageInfo: PageInfo;
  totalCount: number | (() => Promise<number>);
}

export interface ConnectionInput {
  after: string;
  before: string;
  first: number;
  last: number;
}

export interface ConnectionArguments<T> {
  before: T | "" | undefined;
  after: T | "" | undefined;
  isFirst: boolean;
  isLast: boolean;
  limit: number;
}

export interface PaginationInput {
  primaryKey: string | number;
  before: string | null;
  after: string | null;
  limit: number;
  isFirst: boolean;
  isLast: boolean;
}

// abstract class Serializable<T> {
//   static serializeArray: (r: readonly QueryResultRowType<string>[]) => T[];
//   static  serialize: (r: QueryResultRowType<string>) => T;
// }

// export interface Serializable<T> {
//   // serializeArray: (r: readonly QueryResultRowType<string>[]) => T[];
//   // serialize: (r: QueryResultRowType<string>) => T;
//   static deserialize(r: QueryResultRowType<string>): T;
// }

// abstract class Serializable {
//     abstract serialize (): Object;
//     abstract static deserialize (Object): Serializable;
// }

export abstract class DBSerializable<T> {
  abstract deserialize(row: QueryResultRowType<string>): T;
}
