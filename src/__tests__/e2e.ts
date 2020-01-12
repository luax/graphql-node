import graphql from "../graphql";
import { startServer, createApolloServer } from "../server";
import { client } from "../postgres";
import axios from "axios";
import { ServerInfo } from "../server/express";

describe("e2e", () => {
  let serverInfo: ServerInfo;

  beforeAll(() => {
    serverInfo = startServer(createApolloServer(graphql));
    client.initialize();
  });

  afterAll(async () => {
    serverInfo.server.close();
    await client.end();
  });

  it("gets a list of books", async () => {
    const response = await axios.post(`${serverInfo.url}graphql`, {
      query: `
        {
          books {
            id
            title
            author {
              id
              name
              books {
                id
                title
                author {
                  id
                  name
                }
              }
            }
          }
        }
      `,
    });
    expect(response.data).toMatchSnapshot();
  });

  it("gets a book", async () => {
    const response = await axios.post(`${serverInfo.url}graphql`, {
      query: `
        {
          book(id: 1) {
            id
            title,
            author {
              name
              books {
                id
                title
              }
            }
          }
        }
      `,
    });
    expect(response.data).toMatchSnapshot();
  });

  it("gets an author", async () => {
    const response = await axios.post(`${serverInfo.url}graphql`, {
      query: `
        {
          author(id: 1) {
            id
            name
            books {
              id
              title,
              author {
                id
                name
              }
            }
          }
        }
      `,
    });
    expect(response.data).toMatchSnapshot();
  });
});
