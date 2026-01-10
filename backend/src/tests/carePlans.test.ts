import request from "supertest";
import { createApp } from "../app";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./testDb";

describe("Care plan generation and download", () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    await connectTestDB();
    app = createApp(); // create app after DB is ready
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

  async function createOrder(patientId: string, providerId: string) {
    const res = await request(app).post("/orders").send({
      patientId,
      providerId,
      medicationName: "IVIG",
      primaryDiagnosis: "G70.00",
      additionalDiagnoses: ["I10"],
      medicationHistory: ["prednisone 10mg daily"],
      patientRecordsText: "Example patient records text",
    });

    expect(res.status).toBe(201);

    const id = res.body.id ?? res.body._id;
    expect(id).toBeTruthy();

    return id as string;
  }

  it("generates and downloads a care plan for an order", async () => {
    const patientId = await createPatient();
    const providerId = await createProvider();
    const orderId = await createOrder(patientId, providerId);

    // Generate care plan
    const gen = await request(app).post(`/orders/${orderId}/care-plan`);
    expect(gen.status).toBe(201);
    expect(gen.body.orderId).toBe(orderId);
    expect(gen.body.generator).toBe("mock");

    // Download care plan
    const dl = await request(app).get(`/orders/${orderId}/care-plan/download`);

    expect(dl.status).toBe(200);
    expect(dl.headers["content-type"]).toContain("text/plain");
    expect(dl.text).toContain("Care Plan");
    expect(dl.text).toContain("IVIG");
    expect(dl.text).toContain("G70.00");
  });

  it("is idempotent: generating twice returns existing care plan", async () => {
    const patientId = await createPatient();
    const providerId = await createProvider();
    const orderId = await createOrder(patientId, providerId);

    const r1 = await request(app).post(`/orders/${orderId}/care-plan`);
    expect(r1.status).toBe(201);

    const r2 = await request(app).post(`/orders/${orderId}/care-plan`);
    expect(r2.status).toBe(200);
    expect(r2.body.orderId).toBe(orderId);
  });
});
