import { OrderModel } from "../models/Order";
import { PatientModel } from "../models/Patient";
import { ProviderModel } from "../models/Provider";
import { getOpenAIClient } from "../llm/openaiClient";

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

  const [patient, providerDoc] = await Promise.all([
    PatientModel.findById(order.patientId).lean(),
    ProviderModel.findById(order.providerId).lean(),
  ]);

  if (!patient || !providerDoc) return { kind: "inconsistent" as const };

  const llmProvider = (process.env.LLM_PROVIDER ?? "mock").toLowerCase();

  if (llmProvider === "openai") {
    try{
      const client = getOpenAIClient();
      const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

      const system = `You are a clinical pharmacy assistant. Produce a care plan ONLY using the exact headings and order shown. Keep it concise, actionable, and do not invent patient facts.`;

      const user = `Use the template below and fill it based ONLY on the provided patient record text.

      TEMPLATE (must keep headings):
      1. Problem list / Drug therapy problems (DTPs)
      2. Goals (SMART)
      3. Pharmacist interventions / plan
      4. Monitoring plan & labs
      5. Patient education / adherence
      6. Follow-up & documentation

      PATIENT CONTEXT:
      Patient: ${patient.firstName} ${patient.lastName} (MRN: ${patient.mrn})
      Referring Provider: ${providerDoc.name} (NPI: ${providerDoc.npi})
      Medication: ${order.medicationName}
      Primary Dx: ${order.primaryDiagnosis}
      Additional Dx: ${(order.additionalDiagnoses ?? []).join(", ") || "None"}
      Medication history: ${(order.medicationHistory ?? []).join("; ") || "None"}

      PATIENT RECORDS:
      ${order.patientRecordsText}
      `;

      const resp = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
      });

      const planText = resp.choices[0]?.message?.content?.trim();
      if (!planText) {
        return { kind: "fail" as const };
      }

      return { kind: "ok" as const, planText, generator: "openai" as const, promptVersion: "v1" };
    } catch(err) {
      // Fallback to deterministic mock/template instead of failing the request
      const planText = template({
        patientName: `${patient.firstName} ${patient.lastName}`,
        mrn: patient.mrn,
        provider: `${providerDoc.name} (NPI: ${providerDoc.npi})`,
        medicationName: order.medicationName,
        primaryDx: order.primaryDiagnosis,
        records: order.patientRecordsText,
      });

      return {
        kind: "ok" as const,
        planText,
        generator: "mock_fallback" as const,
        promptVersion: "v1",
        warning: "OpenAI unavailable; used template fallback",
      };
    }
  }

  const planText = template({
    patientName: `${patient.firstName} ${patient.lastName}`,
    mrn: patient.mrn,
    provider: `${providerDoc.name} (NPI: ${providerDoc.npi})`,
    medicationName: order.medicationName,
    primaryDx: order.primaryDiagnosis,
    records: order.patientRecordsText,
  });

  return { kind: "ok" as const, planText, generator: "mock" as const, promptVersion: "v1" };
}
