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
      dob: "1815-12-10", // ✅ required
      mrn: "123456",
    });

    // helpful if it fails again
    // console.log(res.status, res.body);

    expect(res.status).toBe(201);
    expect(res.body.mrn).toBe("123456");

    // If your API returns dob, it might be an ISO string like "1815-12-10T00:00:00.000Z"
    // so don't assert exact formatting unless your API guarantees it.
    expect(res.body.id || res.body._id).toBeTruthy();
  });

  it("returns 409 on duplicate MRN", async () => {
    const res1 = await request(app).post("/patients").send({
      firstName: "Ada",
      lastName: "Lovelace",
      dob: "1815-12-10",
      mrn: "123456",
    });
    expect(res1.status).toBe(201);

    const res2 = await request(app).post("/patients").send({
      firstName: "Grace",
      lastName: "Hopper",
      dob: "1906-12-09",
      mrn: "123456", // duplicate
    });

    expect(res2.status).toBe(409);
    expect(res2.body.error).toBe("Duplicate entity");
  });
});
