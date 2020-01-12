import { client, sql } from "./index";

describe("client", () => {
  beforeAll(() => {
    client.initialize();
  });

  afterAll(async () => {
    await client.end();
  });

  it("returns now", async () => {
    const res = await client.query(sql`SELECT NOW() as now`);
    expect(res).toBeTruthy(); // eslint-disable-line
  });

  it("returns an error", async () => {
    expect.assertions(1);
    try {
      await client.query(sql`SELECT NOW as now`);
    } catch (e) {
      // eslint-disable-next-line jest/no-try-expect
      expect(e.message).toMatchSnapshot();
    }
  });

  it("handles sql injection", async () => {
    expect.assertions(2);
    const userInput = "; DROP TABLE authors; as foo";
    const res = await client.query(sql`SELECT ${userInput} as test`);
    expect(res[0].test).toStrictEqual(userInput);
    try {
      await client.query(sql`SELECT ${sql.identifier([userInput])} as test`);
    } catch (e) {
      // eslint-disable-next-line jest/no-try-expect
      expect(e.message).toMatch(`column "${userInput}" does not exist`);
    }
  });
});
