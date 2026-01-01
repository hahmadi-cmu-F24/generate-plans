export function isMongoDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    // MongoServerError code for duplicate key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).code === 11000
  );
}

export function getDuplicateField(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keyPattern = (err as any).keyPattern;
  if (keyPattern && typeof keyPattern === "object") {
    const fields = Object.keys(keyPattern);
    return fields[0] ?? null;
  }
  return null;
}
