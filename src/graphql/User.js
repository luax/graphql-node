const { gql } = require("apollo-server");

const users = [
  {
    id: "1",
    email: "ludvig",
  },
];

const typeDefs = gql`
  type User {
    id: String!
    email: String!
  }

  extend type Query {
    me: User
  }

  input UpdateUserEmailInput {
    id: ID!
    email: String!
  }

  type UpdateUserEmailMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    user: User
  }

  extend type Mutation {
    updateUserEmail(
      input: UpdateUserEmailInput!
    ): UpdateUserEmailMutationResponse!
  }
`;

const resolvers = {
  Query: {
    me: async (_, _args, { user }, _info) => user,
  },
  Mutation: {
    updateUserEmail: async (_, { input: { id, email } }, _context, _info) => {
      const user = users.find(user => user.id === id);
      user.email = email;
      return {
        code: "200",
        success: true,
        message: "User email was successfully updated",
        user,
      };
    },
  },
};

const getUser = _req => {
  // Const token = req.headers.authentication || "";
  return users[0];
};

module.exports = { typeDefs, resolvers, getUser };
