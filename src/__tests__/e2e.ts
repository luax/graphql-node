import graphql from "src/graphql";
import { context } from "../lib";
import { startServer, createApolloServer } from "src/server";
import postgres from "src/postgres";
import axios from "axios";
import { ServerInfo } from "src/server/express";

describe("e2e", () => {
  let serverInfo: ServerInfo;

  beforeAll(async () => {
    serverInfo = await startServer(createApolloServer({ ...graphql, context }));
    postgres.initialize();
  });

  afterAll(async () => {
    serverInfo.server.close();
    await postgres.end();
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

  it("paginated list of books with last", async () => {
    const response = await axios.post(`${serverInfo.url}graphql`, {
      query: `
        {
          author(id: 1) {
            booksConnection(input: { last: 2, after: "3", before: "10" }) {
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
              edges {
                node {
                  id,
                  title
                }
                cursor
              }
            }
          }
        }
      `,
    });
    expect(response.data).toMatchSnapshot();
  });

  it("paginated list of books with first", async () => {
    const response = await axios.post(`${serverInfo.url}graphql`, {
      query: `
        {
          author(id: 1) {
            booksConnection(input: { first: 2, after: "3", before: "10" }) {
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
              edges {
                node {
                  id,
                  title
                }
                cursor
              }
            }
          }
        }
      `,
    });
    expect(response.data).toMatchSnapshot();
  });
});
