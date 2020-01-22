import { IResolvers, IFieldResolver } from "apollo-server";
import { User } from ".";
import { AppContext } from "../types";
import {
  UpdateUserEmailInput,
  UpdateUserEmailMutationResponse,
} from "./typeDefs";

interface UserResolver extends IResolvers {
  Query: {
    me: IFieldResolver<null, AppContext, {}>;
  };
  Mutation: {
    updateUserEmail: IFieldResolver<null, AppContext, UpdateUserEmailInput>;
  };
}

const resolvers: UserResolver = {
  Query: {
    me: (_, _args, { user }, _info): User => user,
  },
  Mutation: {
    updateUserEmail: async (
      _,
      { input: { id, email } },
      { dataSources },
      _info,
    ): Promise<UpdateUserEmailMutationResponse> => {
      const user = await dataSources.user.getById(id);
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

export default resolvers;
