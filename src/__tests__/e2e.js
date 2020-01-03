const { startServer } = require("../server");
const { client } = require("../postgres");
const axios = require("axios");

describe("e2e", () => {
  let httpServer;

  beforeAll(async () => {
    httpServer = await startServer();
    client.initialize();
  });

  afterAll(async () => {
    httpServer.server.close();
    await client.end();
  });

  test("gets a list of books", async () => {
    const response = await axios.post(`${httpServer.url}graphql`, {
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

  test("gets a list of books", async () => {
    const response = await axios.post(`${httpServer.url}graphql`, {
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

  test("gets a list of books", async () => {
    const response = await axios.post(`${httpServer.url}graphql`, {
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
