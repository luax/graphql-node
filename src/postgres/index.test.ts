import pg, { sql } from "./index";

describe("postgres", () => {
  beforeAll(() => {
    pg.initialize();
  });

  afterAll(async () => {
    await pg.end();
  });

  it("returns now", async () => {
    const res = await pg.query(sql`SELECT NOW() as now`);
    expect(res).toBeTruthy(); // eslint-disable-line
  });

  it("returns an error", async () => {
    expect.assertions(1);
    try {
      await pg.query(sql`SELECT NOW as now`);
    } catch (e) {
      // eslint-disable-next-line jest/no-try-expect
      expect(e.message).toMatchSnapshot();
    }
  });

  it("handles sql injection", async () => {
    expect.assertions(2);
    const userInput = "; DROP TABLE authors; as foo";
    const res = await pg.query(sql`SELECT ${userInput} as test`);
    expect(res[0].test).toStrictEqual(userInput);
    try {
      await pg.query(sql`SELECT ${sql.identifier([userInput])} as test`);
    } catch (e) {
      // eslint-disable-next-line jest/no-try-expect
      expect(e.message).toMatch(`column "${userInput}" does not exist`);
    }
  });
});
