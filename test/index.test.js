/* eslint-disable no-undef */
import server from "../dist/app.js";
import supertest from "supertest";
const requestWithSupertest = supertest(server);
describe("User Endpoints", () => {
  it("GET /user should show all users", async () => {
    const res = await requestWithSupertest.get("/");
    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
  });
});
