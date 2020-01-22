import { gql } from "apollo-server";

const typeDefs = gql`
  extend type Query {
    author(id: ID!): Author
  }

  type Author implements Node {
    id: ID!
    name: String
    books: [Book]
    booksConnection(input: ConnectionInput): BookConnection!
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

export default typeDefs;
