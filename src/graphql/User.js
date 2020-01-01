const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: String!
    email: String!
  }
  extend type Query {
    me: User
  }
`;

const resolvers = {
  Query: {
    me: async (_, _args, { user }, _info) => user,
  },
};

const getUser = req => {
  const token = req.headers.authentication || "";
  return {
    id: 1,
    email: "ludvig",
    token,
  };
};

module.exports = { typeDefs, resolvers, getUser };
