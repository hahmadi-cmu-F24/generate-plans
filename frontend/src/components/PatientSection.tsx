import { Field } from "./Field";
import { Section } from "./Section";

export function PatientSection(props: {
  firstName: string;
  lastName: string;
  mrn: string;
  dob: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setMrn: (v: string) => void;
  setDob: (v: string) => void;
  patientId: string | null;
}) {

  const mrnTrim = props.mrn.trim();
  const mrnTouched = mrnTrim.length > 0;
  const mrnValid = /^\d{6}$/.test(mrnTrim);

  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dobTouched = props.dob.trim().length > 0;
  const dobValid = !dobTouched || props.dob <= todayStr; // string compare works for YYYY-MM-DD

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

            <div className="row2" style={{ marginTop: 12 }}>
        <Field
          label="Date of Birth"
          required
          value={props.dob}
          onChange={props.setDob}
          placeholder="YYYY-MM-DD"
          inputMode="numeric"
          isInvalid={dobTouched && !dobValid}
          helpText="DOB cannot be after today"
          type="date"
          maxDate={todayStr}
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
