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
  const mrnTrim = props.mrn.trim();
  const mrnTouched = mrnTrim.length > 0;
  const mrnValid = /^\d{6}$/.test(mrnTrim);

  return (
    <Section title="Patient">
      <div className="row3">
        <Field
          label="First Name"
          required
          value={props.firstName}
          onChange={props.setFirstName}
          placeholder="Ada"
        />

        <Field
          label="Last Name"
          required
          value={props.lastName}
          onChange={props.setLastName}
          placeholder="Lovelace"
        />

        <Field
            label="MRN (6 digits)"
            required
            value={props.mrn}
            onChange={(v) => props.setMrn(v.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            isInvalid={mrnTouched && !mrnValid}
            helpText="MRN must be exactly 6 digits"
            />

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
