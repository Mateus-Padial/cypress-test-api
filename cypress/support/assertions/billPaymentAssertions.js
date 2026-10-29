/// <reference types="cypress" />
import { createRulesAssertions } from "./rulesAssertionsFactory";

export const billPaymentAssertions = {
  ...createRulesAssertions(),
};
