export {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server";
import { GraphQLFormattedError, GraphQLError } from "graphql";

export const formatError = (err: GraphQLError): GraphQLFormattedError => {
  if (err.message.startsWith("Database Error: ")) {
    return new Error("Internal server error");
  }
  return err;
};
