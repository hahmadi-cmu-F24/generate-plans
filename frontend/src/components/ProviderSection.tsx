import { Field } from "./Field";
import { Section } from "./Section";

export function ProviderSection(props: {
  providerName: string;
  npi: string;
  setProviderName: (v: string) => void;
  setNpi: (v: string) => void;
  providerId: string | null;
}) {
  return (
    <Section title="Provider">
      <div className="row2Wide">
        <Field label="Provider Name" required value={props.providerName} onChange={props.setProviderName} placeholder="Dr Example" />
        <Field label="NPI (10 digits)" required value={props.npi} onChange={props.setNpi} placeholder="1234567890" />
      </div>

      <div style={{ marginTop: 10, color: "#444" }}>
        {props.providerId ? (
          <>
            Created provider ID: <span className="mono">{props.providerId}</span>
          </>
        ) : (
          <span className="muted">Not created yet</span>
        )}
      </div>
    </Section>
  );
}
