type ApiError = { status: number; data: any };

function isApiError(e: unknown): e is ApiError {
  return typeof e === "object" && e !== null && "status" in e && "data" in e;
}

export function ErrorBox({
  title,
  error,
}: {
  title: string;
  error: unknown;
}) {
  if (!error) return null;

  if (!isApiError(error)) {
    const msg = error instanceof Error ? error.message : "Request failed";
    return (
      <div className="errorBox">
        <div className="errorTitle">{title}</div>
        <div>{msg}</div>
      </div>
    );
  }

  const details = error.status === 400 ? error.data?.details : null;

  return (
    <div className="errorBox">
      <div className="errorTitle">
        {title} (HTTP {error.status})
      </div>
      <div style={{ marginBottom: 8 }}>
        {error.data?.message ?? error.data?.error ?? "Request failed"}
      </div>

      {details ? (
        <div className="mono" style={{ fontSize: 12 }}>
          {Object.entries(details).map(([field, msgs]) => (
            <div key={field}>
              <strong>{field}</strong>:{" "}
              {Array.isArray(msgs) ? msgs.filter(Boolean).join(", ") : String(msgs)}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
