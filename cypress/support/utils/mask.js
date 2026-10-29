/// <reference types="cypress" />

export function mask(token) {
  if (typeof token !== "string" || token.length === 0) return "(vazio)";
  if (token.length > 16) {
    return `${token.slice(0, 12)}…${token.slice(-6)} (${token.length} chars)`;
  }
  return `***(${token.length} chars)`;
}

const SENSITIVE_FIELD_PATTERN =
  /client[-_]?secret|access[-_]?token|refresh[-_]?token|password|senha|secret|token/i;

export function redactSensitiveFields(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitiveFields);
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELD_PATTERN.test(key)) {
      out[key] = typeof value === "string" ? mask(value) : "(redacted)";
    } else if (value !== null && typeof value === "object") {
      out[key] = redactSensitiveFields(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function maskBaseUrl(url) {
  if (typeof url !== "string" || url.length === 0) return url;
  try {
    const u = new URL(url);
    return `***${u.pathname}${u.search}`;
  } catch {
    return url.startsWith("/") ? `***${url}` : url;
  }
}
