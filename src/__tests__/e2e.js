const { startServer } = require("../server");
const axios = require("axios");

describe("e2e", () => {
  test("gets a list of books", async () => {
    const httpServer = await startServer();
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
    httpServer.server.close();
  });

  test("gets a list of books", async () => {
    const httpServer = await startServer();
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
    httpServer.server.close();
  });

  test("gets a list of books", async () => {
    const httpServer = await startServer();
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
    httpServer.server.close();
  });
});
