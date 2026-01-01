import request from "supertest";
import { createApp } from "../app";
import { clearTestDB, connectTestDB, disconnectTestDB } from "./testDb";

describe("POST /patients", () => {
  const app = createApp();

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  it("creates a patient", async () => {
    const res = await request(app).post("/patients").send({
      firstName: "Ada",
      lastName: "Lovelace",
      mrn: "123456",
    });

    expect(res.status).toBe(201);
    expect(res.body.mrn).toBe("123456");
  });

  it("returns 409 on duplicate MRN", async () => {
    await request(app).post("/patients").send({
      firstName: "Ada",
      lastName: "Lovelace",
      mrn: "123456",
    });

    const res2 = await request(app).post("/patients").send({
      firstName: "Grace",
      lastName: "Hopper",
      mrn: "123456",
    });

    expect(res2.status).toBe(409);
    expect(res2.body.error).toBe("Duplicate entity");
  });
});
