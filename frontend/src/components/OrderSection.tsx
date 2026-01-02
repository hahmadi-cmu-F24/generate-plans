import { Field } from "./Field";
import { TextArea } from "./TextArea";
import { Section } from "./Section";

export function OrderSection(props: {
  medicationName: string;
  primaryDiagnosis: string;
  additionalDxText: string;
  medHistoryText: string;
  patientRecordsText: string;
  setMedicationName: (v: string) => void;
  setPrimaryDiagnosis: (v: string) => void;
  setAdditionalDxText: (v: string) => void;
  setMedHistoryText: (v: string) => void;
  setPatientRecordsText: (v: string) => void;
  orderId: string | null;
}) {
  return (
    <Section title="Order">
      <div className="row2">
        <Field label="Medication Name" required value={props.medicationName} onChange={props.setMedicationName} placeholder="IVIG" />
        <Field label="Primary Diagnosis (ICD-10)" required value={props.primaryDiagnosis} onChange={props.setPrimaryDiagnosis} placeholder="G70.00" />
      </div>

      <div style={{ marginTop: 12 }} className="row2">
        <TextArea
          label="Additional Diagnoses (one ICD-10 per line)"
          value={props.additionalDxText}
          onChange={props.setAdditionalDxText}
          placeholder={"I10\nK21.9"}
          rows={5}
        />
        <TextArea
          label="Medication History (one per line)"
          value={props.medHistoryText}
          onChange={props.setMedHistoryText}
          placeholder={"Prednisone 10 mg daily\nPyridostigmine 60 mg q6h PRN"}
          rows={5}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <TextArea
          label="Patient Records (preprocessed text)"
          required
          value={props.patientRecordsText}
          onChange={props.setPatientRecordsText}
          placeholder="Paste patient records text here..."
          rows={10}
        />
      </div>

      <div style={{ marginTop: 10, color: "#444" }}>
        {props.orderId ? (
          <>
            Created order ID: <span className="mono">{props.orderId}</span>
          </>
        ) : (
          <span className="muted">Not created yet</span>
        )}
      </div>
    </Section>
  );
}
