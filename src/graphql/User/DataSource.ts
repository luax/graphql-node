import { User } from "./index";
import DataSource from "../datasources/DataSource";
import express from "express";

class UserDataSource extends DataSource<User> {
  users: User[] = [
    {
      id: "1",
      email: "ludvig",
      token: "",
    },
  ];

  serialize = (user: User): string =>
    JSON.stringify({
      id: user.id,
      email: user.email,
    });

  deserialize = (obj: string): User => JSON.parse(obj) as User;

  keyPrefix = "user_";

  async getById(userId: string): Promise<User | undefined> {
    const user = this.users.find(user => user.id === userId);
    return Promise.resolve(user);
  }

  async getByRequest(req: express.Request): Promise<User | undefined> {
    const token = req.headers.authentication
      ? req.headers.authentication[0] || ""
      : "";
    const user = await this.getByToken(token);
    return user;
  }

  async getByToken(token: string): Promise<User | undefined> {
    const user = this.users.find(user => user.token === token);
    return Promise.resolve(user);
  }
}

export default UserDataSource;
