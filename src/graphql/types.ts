import { DocumentNode } from "graphql";
import { IResolvers } from "apollo-server";

export interface Model<T> {
  typeDefs: DocumentNode;
  resolvers: IResolvers;
  loaders: () => T;
}

export interface PageInfo {
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
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
  edges: Edge<T>[];
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface ConnectionInput {
  after: string;
  before: string;
  first: number;
  last: number;
}

export interface PaginationInput {
  primaryKey: string | number;
  before: number;
  after: number;
  limit: number;
  isFirst: boolean;
  isLast: boolean;
}
