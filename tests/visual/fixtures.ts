import { expect, test as base } from "@playwright/test";
import { installDeterminism } from "./determinism";

export const test = base.extend({
  page: async ({ page }, run) => {
    await installDeterminism(page);
    await run(page);
  },
});

export { expect };
