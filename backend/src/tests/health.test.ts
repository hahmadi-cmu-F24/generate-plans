import request from "supertest";
import { createApp } from "../app";
/*No database or external dependencies are required
This confirms:
The Express app boots correctly
routing works
HTTP request/response cycle functions
Supertest is wired correctly
JSON responses serialize properly*/

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = createApp();
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});