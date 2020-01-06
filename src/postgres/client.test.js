const { client, sql } = require("./index");

describe("client", () => {
  beforeAll(() => {
    client.initialize();
  });

  afterAll(async () => {
    await client.end();
  });

  test("returns now", async () => {
    const res = await client.query(sql`SELECT NOW() as now`);
    expect(res).toBeTruthy();
  });

  test("returns an error", async () => {
    expect(
      client.query(sql`SELECT NOW as now`),
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test("handles sql injection", async () => {
    const userInput = "; DROP TABLE authors; as foo";
    const res = await client.query(sql`SELECT ${userInput} as test`);
    expect(res[0].test).toEqual(userInput);
    expect(
      client.query(sql`SELECT ${sql.identifier([userInput])} as test`),
    ).rejects.toThrow(`column "${userInput}" does not exist`);
  });
});
