/// <reference types="cypress" />
import { fileValidationService } from "./services";

Cypress.Commands.add("validateFile", (relativeCsvPath, options = {}) =>
  fileValidationService.validate({ csvPath: relativeCsvPath, ...options }),
);
