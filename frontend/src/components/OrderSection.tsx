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
  patientRecordsFile: File | null;
  setPatientRecordsFile: (f: File | null) => void;
  fileInputKey: number;
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

        <div style={{ marginTop: 10 }}>
          <label className="label">
            <div className="labelTitle">
              Patient Records File (optional: .txt or .pdf)
            </div>

            <input
              key={props.fileInputKey}
              type="file"
              accept=".txt,.pdf,text/plain,application/pdf"
              onChange={(e) => props.setPatientRecordsFile(e.target.files?.[0] ?? null)}
            />

          </label>

          {props.patientRecordsFile ? (
            <div className="muted" style={{ marginTop: 6 }}>
              Selected file: <strong>{props.patientRecordsFile.name}</strong>
            </div>
          ) : (
            <div className="muted" style={{ marginTop: 6 }}>
              If a file is uploaded, it will be used instead of the text above.
            </div>
          )}
        </div>
      </div> 

      <div style={{ marginTop: 10, color: "#444" }}>
        {props.orderId ? (
          <>
            Created order ID: <span className="mono">{props.orderId}</span>
          </>
        ) : (
          <span className="muted">Order not created yet</span>
        )}
      </div>
    </Section>
  );
}
