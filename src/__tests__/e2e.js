const { startServer } = require("../server");
const axios = require("axios");

const QUERY = `
  {
    books {
      title
    }
  }
`;

describe("e2e", () => {
  test("gets a list of books", async () => {
    const httpServer = await startServer();
    const response = await axios.post(`${httpServer.url}graphql`, {
      query: QUERY,
      variables: { pageSize: 1, after: "1517949900" },
    });
    expect(response.data).toMatchSnapshot();
    httpServer.server.close();
  });
});
