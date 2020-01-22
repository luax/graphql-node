import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import DataSource from "./DataSource";

export interface User {
  id: string;
  email: string;
  token: string | string[];
}

export default {
  typeDefs,
  resolvers,
  DataSource,
};
