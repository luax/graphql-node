import { gql, IResolvers, IFieldResolver } from "apollo-server";
import { Context } from "../context";
import express from "express";
import { MutationResponse } from "../Root";

const users: User[] = [
  {
    id: "1",
    email: "ludvig",
    token: "",
  },
];

const typeDefs = gql`
  type User implements Node {
    id: ID!
    email: String!
  }

  input UpdateUserEmailInput {
    id: ID!
    email: String!
  }

  type UpdateUserEmailMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    node: User
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    updateUserEmail(
      input: UpdateUserEmailInput!
    ): UpdateUserEmailMutationResponse!
  }
`;

export interface User {
  id: string;
  email: string;
  token: string | string[];
}

interface UpdateUserEmailInput {
  input: {
    id: string;
    email: string;
  };
}

interface UpdateUserEmailMutationResponse extends MutationResponse {
  node?: User;
}

interface UserResolver extends IResolvers {
  Query: {
    me: IFieldResolver<null, Context, {}>;
  };
  Mutation: {
    updateUserEmail: IFieldResolver<null, Context, UpdateUserEmailInput>;
  };
}

const resolvers: UserResolver = {
  Query: {
    me: (_, _args, { user }, _info): User => user,
  },
  Mutation: {
    updateUserEmail: (
      _,
      { input: { id, email } },
      _context,
      _info,
    ): UpdateUserEmailMutationResponse => {
      const user = users.find(user => user.id === id);
      if (user) {
        user.email = email;
        return {
          code: "200",
          success: true,
          message: "User email was successfully updated",
          node: user,
        };
      }
      return {
        code: "400",
        success: false,
        message: "Could not update user",
      };
    },
  },
};

export interface UserLoaders {
  users: {
    get: (req: express.Request) => Promise<User>;
  };
}

const loaders = (): UserLoaders => ({
  users: {
    get: async (req): Promise<User> => {
      const token = req.headers.authentication || "";
      const user = users[0];
      return Promise.resolve({ ...user, token });
    },
  },
});

export default {
  typeDefs,
  resolvers,
  loaders,
};
