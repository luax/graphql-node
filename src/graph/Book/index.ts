import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import DataSource from "./DataSource";
import { DBModel } from "src/lib";

export class Book implements DBModel {
  id: string;

  authorId: string;

  title?: string;

  ids = new Set(["id"]);

  columns = new Set(["id", "authorId", "title"]);

  constructor(id: string, authorId: string, title: string) {
    this.id = id;
    this.authorId = authorId;
    this.title = title;
  }
}

export default {
  typeDefs,
  resolvers,
  DataSource,
};
