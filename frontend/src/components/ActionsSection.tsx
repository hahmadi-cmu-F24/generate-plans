import { Section } from "./Section";
import { api } from "../api";

export function ActionsSection(props: {
  busy: boolean;
  canSubmit: boolean;
  orderId: string | null;
  carePlanId: string | null;
  generator: string | null;
  onCreateAll: () => void;
  onGenerate: () => void;
  onReset: () => void;
}) {
  const downloadUrl = props.orderId ? api.downloadCarePlanUrl(props.orderId) : null;

  return (
    <Section title="Actions">
      <div className="actions">
        <button
          className="btn btnPrimary"
          onClick={props.onCreateAll}
          disabled={!props.canSubmit || props.busy}
          title={!props.canSubmit ? "Fill all required fields first" : "Create patient, provider, and order"}
        >
          {props.busy ? "Working…" : "Create Patient + Provider + Order"}
        </button>

        <button
          className="btn"
          onClick={props.onGenerate}
          disabled={!props.orderId || props.busy}
          title={!props.orderId ? "Create an order first" : "Generate care plan"}
        >
          {props.busy ? "Working…" : "Generate Care Plan"}
        </button>

        <button className="btn" onClick={props.onReset} disabled={props.busy}>
          Reset status
        </button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        <div>
          {props.carePlanId ? (
            <>
              Care plan generated: <span className="mono">{props.carePlanId}</span>{" "}
              {props.generator ? <span className="badge">generator: {props.generator}</span> : null}
            </>
          ) : (
            <span className="muted">No care plan generated yet</span>
          )}
        </div>

        {downloadUrl ? (
          <div>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                pointerEvents: props.carePlanId ? "auto" : "none",
                opacity: props.carePlanId ? 1 : 0.5,
                textDecoration: "underline",
              }}
              title={props.carePlanId ? "Download care plan" : "Generate a care plan first"}
            >
              Download care plan (.txt)
            </a>
          </div>
        ) : null}

        <div className="footer">
          Tip: If you get a <strong>409</strong>, the backend detected a deterministic duplicate (patient MRN, provider
          NPI, or duplicate order key).
        </div>
      </div>
    </Section>
  );
}
