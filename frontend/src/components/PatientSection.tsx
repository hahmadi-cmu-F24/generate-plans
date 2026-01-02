import { Field } from "./Field";
import { Section } from "./Section";

export function PatientSection(props: {
  firstName: string;
  lastName: string;
  mrn: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setMrn: (v: string) => void;
  patientId: string | null;
}) {
  return (
    <Section title="Patient">
      <div className="row3">
        <Field label="First Name" required value={props.firstName} onChange={props.setFirstName} placeholder="Ada" />
        <Field label="Last Name" required value={props.lastName} onChange={props.setLastName} placeholder="Lovelace" />
        <Field label="MRN (6 digits)" required value={props.mrn} onChange={props.setMrn} placeholder="123456" />
      </div>

      <div style={{ marginTop: 10, color: "#444" }}>
        {props.patientId ? (
          <>
            Created patient ID: <span className="mono">{props.patientId}</span>
          </>
        ) : (
          <span className="muted">Not created yet</span>
        )}
      </div>
    </Section>
  );
}
