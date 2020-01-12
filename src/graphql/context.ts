import { Loaders } from ".";
import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { AuthenticationError } from "./errors";
import { User } from "./User";

export interface Context {
  loaders: Loaders;
  user: User;
}

const makeContext = (makeLoaders: () => Loaders) => async (
  args: ExpressContext,
): Promise<Context> => {
  const loaders = makeLoaders();
  const user = await loaders.users.get(args.req);
  if (!user)
    throw new AuthenticationError("you must be logged in to query this schema");
  return {
    loaders,
    user,
  };
};

export default makeContext;
