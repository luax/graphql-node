import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import DataSource from "./DataSource";

export interface Book {
  id: string;
  authorId: string;
  title?: string;
}

export default {
  typeDefs,
  resolvers,
  DataSource,
};
