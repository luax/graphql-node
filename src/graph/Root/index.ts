import { gql, IResolvers } from "apollo-server";

const typeDefs = gql`
  type Query

  type Mutation

  type PageInfo {
    # When paginating forwards, the cursor to continue.
    endCursor: String

    # When paginating forwards, are there more items?
    hasNextPage: Boolean!

    # When paginating backwards, are there more items?
    hasPreviousPage: Boolean!

    # When paginating backwards, the cursor to continue.
    startCursor: String
  }

  interface Node {
    id: ID!
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    node: Node
  }

  interface Edge {
    cursor: String!
    node: Node!
  }

  # Paginated collection of Documents. As specified by:
  # https://facebook.github.io/relay/graphql/connections.htm
  interface Connection {
    edges: [Edge]!
    nodes: [Node]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  input ConnectionInput {
    """
    Returns the elements in the list that come after the specified cursor.
    """
    after: String

    """
    Returns the elements in the list that come before the specified cursor.
    """
    before: String

    """
    Returns the first _n_ elements from the list.
    """
    first: Int

    """
    Returns the last _n_ elements from the list.
    """
    last: Int
  }
`;

// Return null on interfaces that are not used as result directly (no ambiguity)
// const resolvers: IResolvers = {
const resolvers: IResolvers = {
  MutationResponse: {
    __resolveType: (): null => null,
  },
  Node: {
    __resolveType: (): null => null,
  },
  Edge: {
    __resolveType: (): null => null,
  },
  Connection: {
    __resolveType: (): null => null,
  },
};

export default {
  typeDefs,
  resolvers,
};
