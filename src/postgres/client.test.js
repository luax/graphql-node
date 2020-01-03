const client = require("./client");

describe("client", () => {
  beforeAll(() => {
    client.initialize();
  });

  afterAll(async () => {
    await client.end();
  });

  test("returns now", async () => {
    const res = await client.query("SELECT NOW() as now");
    expect(res).toBeTruthy();
  });

  test("returns an error", async () => {
    expect(
      client.query("SELECT NOW as now"),
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
