const { gql } = require("apollo-server");

const typeDefs = gql`
  type Query {
    date: String
  }
`;


const resolvers = {
  Query: {
    date: () => Date.now()
  },
};

module.exports = { typeDefs, resolvers };