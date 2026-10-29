/// <reference types="cypress" />
import { mask, maskBaseUrl, redactSensitiveFields } from "../utils/mask";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function displayValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const PANEL_THEME = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#30363d",
  text: "#e6edf3",
  textMuted: "#8b949e",
  accent: "#2f81f7",
  success: "#3fb950",
  error: "#f85149",
  onAccent: "#ffffff",
};

export function renderApiPanel(
  win,
  { method, url, requestFields, response, token },
) {
  const doc = win.document;
  const t = PANEL_THEME;
  const ok = response.status >= 200 && response.status < 300;
  const statusColor = ok ? t.success : t.error;

  const redactedRequestFields = redactSensitiveFields(requestFields);
  const redactedResponseBody =
    response.body !== null && typeof response.body === "object"
      ? redactSensitiveFields(response.body)
      : response.body;

  const bodyJson =
    typeof redactedResponseBody === "string"
      ? redactedResponseBody
      : redactedResponseBody === undefined
        ? "(sem corpo na resposta)"
        : (JSON.stringify(redactedResponseBody, null, 2) ??
          "(sem corpo na resposta)");
  const evidenceBody =
    bodyJson.length > 100_000
      ? `${bodyJson.slice(0, 100_000)}\n... corpo truncado ...`
      : bodyJson;

  doc.documentElement.style.background = t.bg;
  doc.body.style.background = t.bg;
  doc.body.style.margin = "0";

  doc.body.innerHTML = `
    <div style="font-family:Consolas,Menlo,monospace;font-size:13px;color:${t.text};background:${t.bg};padding:16px;line-height:1.5;min-height:100vh;box-sizing:border-box;">
      <div style="display:flex;align-items:center;gap:8px;border-bottom:2px solid ${t.border};padding-bottom:8px;margin-bottom:12px;">
        <span style="background:${t.accent};color:${t.onAccent};padding:2px 8px;border-radius:4px;font-weight:bold;">${escapeHtml(method)}</span>
        <span style="word-break:break-all;color:${t.text};">${escapeHtml(maskBaseUrl(url))}</span>
        <span style="margin-left:auto;background:${statusColor};color:${t.onAccent};padding:2px 10px;border-radius:4px;font-weight:bold;">${escapeHtml(response.status)}</span>
      </div>

      <div style="font-weight:bold;color:${t.textMuted};margin:10px 0 4px;">REQUEST</div>
      <table style="border-collapse:collapse;width:100%;">
        <tr><td style="color:${t.textMuted};padding:2px 8px;">authorization-vertem-servico-financeiro</td><td style="padding:2px 8px;color:${t.text};">${escapeHtml(
          mask(token),
        )}</td></tr>
        ${Object.entries(redactedRequestFields || {})
          .map(
            ([k, v]) =>
              `<tr><td style="color:${t.textMuted};padding:2px 8px;">form: ${escapeHtml(k)}</td><td style="padding:2px 8px;color:${t.text};">${escapeHtml(displayValue(v))}</td></tr>`,
          )
          .join("")}
      </table>

      <div style="font-weight:bold;color:${t.textMuted};margin:14px 0 4px;">RESPONSE BODY</div>
      <pre style="background:${t.surface};border:1px solid ${t.border};border-radius:6px;padding:12px;overflow:auto;max-height:520px;white-space:pre-wrap;color:${t.text};">${escapeHtml(evidenceBody)}</pre>
    </div>`;
}
