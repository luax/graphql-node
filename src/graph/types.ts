export { User } from "./User";
export { Book } from "./Book";
export { Author } from "./Author";
import { Context } from "../lib";
import Auth from "./Auth";
import UserDataSource from "./User/DataSource";
import BookDataSource from "./Book/DataSource";
import AuthorDataSource from "./Author/DataSource";

export interface AppContext extends Context {
  dataSources: DataSources;
  auth: Auth;
}

export type DataSources = {
  author: AuthorDataSource;
  book: BookDataSource;
  user: UserDataSource;
};
