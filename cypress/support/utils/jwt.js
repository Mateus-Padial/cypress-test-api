/// <reference types="cypress" />

export function isTokenExpired(token, skewSeconds = 30) {
  const parsed = parseJwtPayload(token);
  if (!parsed.hasJwtShape || parsed.exp === undefined) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  return parsed.exp - skewSeconds <= nowSeconds;
}

export function parseJwtPayload(token) {
  if (typeof token !== "string") {
    return { hasJwtShape: false, valid: false, exp: undefined };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { hasJwtShape: false, valid: false, exp: undefined };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return {
      hasJwtShape: true,
      valid: true,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return { hasJwtShape: true, valid: false, exp: undefined };
  }
}

function base64UrlDecode(segment) {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(
    Array.prototype.map
      .call(
        atob(base64),
        (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`,
      )
      .join(""),
  );
}
