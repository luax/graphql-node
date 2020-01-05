const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query

  type Mutation

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }
`;

module.exports = { typeDefs };
