import { gql } from "apollo-server";
import { MutationResponse } from "../types";
import { User } from ".";

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

export interface UpdateUserEmailInput {
  input: {
    id: string;
    email: string;
  };
}

export type UpdateUserEmailMutationResponse = MutationResponse<User>;

export default typeDefs;
