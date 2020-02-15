import { AppContext } from "./types";
import { AuthenticationError } from "../lib/errors";
import { User } from "./User";

export default class Auth {
  static async authenticate({ req, dataSources }: AppContext): Promise<User> {
    const user = await dataSources.user.getByRequest(req);
    if (!user)
      throw new AuthenticationError(
        "you must be logged in to query this schema",
      );
    return user;
  }

  // static authorized(_user: User, _model: Authorizable): boolean {
  //   throw new AuthenticationError(
  //     "you don't have access to this resource",
  //   );
  //   return true;
  // }
}
