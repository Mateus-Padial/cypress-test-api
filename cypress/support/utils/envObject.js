export function buildFromEnv(map) {
  const clean = {};
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined && v !== null && !(typeof v === "string" && v === "")) {
      clean[k] = v;
    }
  }
  return clean;
}
