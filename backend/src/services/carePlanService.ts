import { OrderModel } from "../models/Order";
import { PatientModel } from "../models/Patient";
import { ProviderModel } from "../models/Provider";

function template(params: {
  patientName: string;
  mrn: string;
  provider: string;
  medicationName: string;
  primaryDx: string;
  records: string;
}) {
  const { patientName, mrn, provider, medicationName, primaryDx, records } = params;

  // Fixed headings = predictable/compliance-friendly
  return `Care Plan (Draft) — Prompt v1

Patient: ${patientName} (MRN: ${mrn})
Referring Provider: ${provider}
Medication: ${medicationName}
Primary Diagnosis: ${primaryDx}

1. Problem list / Drug therapy problems
- [Draft] Need therapy for ${primaryDx}
- [Draft] Monitor for adverse effects / contraindications based on record

2. Goals (SMART)
- [Draft] Achieve improvement in symptoms/function per clinical context
- [Draft] Avoid serious adverse events during therapy course

3. Pharmacist interventions / plan
- [Draft] Verify indication, dosing, pre-meds as applicable
- [Draft] Coordinate admin details and counseling

4. Monitoring plan & labs
- [Draft] Baseline vitals/labs per therapy standards
- [Draft] Ongoing monitoring schedule

5. Patient education & counseling
- [Draft] What to expect, warning signs, when to call clinic

6. Follow-up & documentation
- [Draft] Document in EMR and arrange follow-up timeline

Notes (source excerpt):
${records.slice(0, 1200)}
`;
}

export async function generateCarePlanText(orderId: string) {
  const order = await OrderModel.findById(orderId).lean();
  if (!order) return { kind: "not_found" as const };

  const [patient, provider] = await Promise.all([
    PatientModel.findById(order.patientId).lean(),
    ProviderModel.findById(order.providerId).lean(),
  ]);

  if (!patient || !provider) return { kind: "inconsistent" as const };

  const planText = template({
    patientName: `${patient.firstName} ${patient.lastName}`,
    mrn: patient.mrn,
    provider: `${provider.name} (NPI: ${provider.npi})`,
    medicationName: order.medicationName,
    primaryDx: order.primaryDiagnosis,
    records: order.patientRecordsText,
  });

  return { kind: "ok" as const, planText, generator: "mock" as const, promptVersion: "v1" };
}
