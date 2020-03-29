import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import DataSource from "./DataSource";
import { DBModel } from "src/lib/types";

// export interface Author {
//   id: string;
//   name?: string;
// }

export class Author implements DBModel {
  id: string;

  name?: string;

  ids = new Set(["id"]);

  columns = new Set(["id", "name"]);

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export default {
  typeDefs,
  resolvers,
  DataSource,
};
