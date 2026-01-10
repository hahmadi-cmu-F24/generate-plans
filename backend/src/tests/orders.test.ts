import request from "supertest";
import { createApp } from "../app";
import { clearTestDB, connectTestDB, disconnectTestDB } from "./testDb";

describe("POST /orders", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    await connectTestDB();
    app = createApp(); // ✅ create after DB is ready
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  async function createPatient() {
    const res = await request(app).post("/patients").send({
      firstName: "Ada",
      lastName: "Lovelace",
      dob: "1815-12-10", // ✅ required
      mrn: "123456",
    });

    expect(res.status).toBe(201);

    const id = res.body.id ?? res.body._id;
    expect(id).toBeTruthy();

    return id as string;
  }

  async function createProvider() {
    const res = await request(app).post("/providers").send({
      name: "Dr Example",
      npi: "1234567890",
    });

    expect(res.status).toBe(201);

    const id = res.body.id ?? res.body._id;
    expect(id).toBeTruthy();

    return id as string;
  }

  it("blocks duplicate order for same patient+medication+diagnosis", async () => {
    const patientId = await createPatient();
    const providerId = await createProvider();

    const payload = {
      patientId,
      providerId,
      medicationName: "IVIG",
      primaryDiagnosis: "G70.00",
      additionalDiagnoses: ["I10"],
      medicationHistory: ["prednisone 10mg daily"],
      patientRecordsText: "Example records text",
    };

    const r1 = await request(app).post("/orders").send(payload);
    expect(r1.status).toBe(201);

    const r2 = await request(app).post("/orders").send(payload);
    expect(r2.status).toBe(409);
    expect(r2.body.error).toBe("Duplicate entity");
  });
});
