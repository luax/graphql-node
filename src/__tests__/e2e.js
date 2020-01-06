const graphql = require("../graphql");
const { startServer, createApolloServer } = require("../server");
const { client } = require("../postgres");
const axios = require("axios");

describe("e2e", () => {
  let serverInfo;

  beforeAll(async () => {
    serverInfo = await startServer(createApolloServer(graphql));
    client.initialize();
  });

  afterAll(async () => {
    serverInfo.server.close();
    await client.end();
  });

  test("gets a list of books", async () => {
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

  test("gets a book", async () => {
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

  test("gets an author", async () => {
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

  test("paginated list of books with last", async () => {
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

  test("paginated list of books with first", async () => {
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
