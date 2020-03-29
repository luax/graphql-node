import { DocumentNode } from "graphql";
import { IResolvers } from "apollo-server";
import express from "express";
import postgres from "src/postgres";

export interface Context {
  req: express.Request;
  db: postgres;
}

export interface DBModel {
  ids: Set<string>;
  columns: Set<string>;
}

// GraphQL types below
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
