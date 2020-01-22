import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import DataSource from "./DataSource";

export interface Author {
  id: string;
  name?: string;
}

export default {
  typeDefs,
  resolvers,
  DataSource,
};
