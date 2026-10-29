/// <reference types="cypress" />
import { renderApiPanel } from "../evidence/renderApiPanel";
import { maskBaseUrl } from "../utils/mask";

function afterResponse(
  { method, url, requestFields, token, logName },
  response,
) {
  const maskedUrl = maskBaseUrl(url);
  const log = Cypress.log({
    name: logName,
    message: `${maskedUrl} -> ${response.status}`,
    autoEnd: false,
    consoleProps: () => ({
      request: { method, url: maskedUrl, fields: requestFields },
      status: response.status,
      response: response.body,
    }),
  });

  cy.document({ log: false }).then((doc) => {
    renderApiPanel(doc.defaultView, {
      method,
      url,
      requestFields,
      response,
      token,
    });
    log.snapshot().end();
  });

  return cy.wrap(response, { log: false });
}

export const apiClient = {
  upload({
    url,
    filePath,
    fields,
    requestFields,
    token,
    fileFieldName,
    headers,
    timeout,
    logName = "apiClient:upload",
  }) {
    return cy
      .task("uploadCsv", {
        url,
        filePath,
        token,
        fields,
        fileFieldName,
        headers,
        timeout,
      })
      .then((response) =>
        afterResponse(
          {
            method: "POST",
            url,
            requestFields: requestFields || fields,
            token,
            logName,
          },
          response,
        ),
      );
  },

  request({
    method,
    url,
    body,
    headers,
    qs,
    form,
    timeout,
    token,
    logName = "apiClient:request",
  }) {
    const opts = {
      method,
      url,
      body,
      headers,
      qs,
      form,
      failOnStatusCode: false,
    };
    if (timeout !== undefined) opts.timeout = timeout;
    return cy
      .request(opts)
      .then((response) =>
        afterResponse(
          { method, url, requestFields: body || {}, token, logName },
          response,
        ),
      );
  },
};
