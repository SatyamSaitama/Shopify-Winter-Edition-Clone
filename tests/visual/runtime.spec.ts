import { test, expect } from "./fixtures";
import {
  fullScrollPage,
  gotoVisualTarget,
  jsonAttachment,
} from "./helpers";

test("full scroll emits no console errors or uncaught page errors", async ({
  page,
}, testInfo) => {
  const consoleErrors: {
    text: string;
    url?: string;
    line?: number;
    column?: number;
  }[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const location = message.location();
    consoleErrors.push({
      text: message.text(),
      url: location.url || undefined,
      line: location.lineNumber,
      column: location.columnNumber,
    });
  });
  page.on("pageerror", (error) => pageErrors.push(error.stack ?? error.message));

  await gotoVisualTarget(page);
  const scroll = await fullScrollPage(page);
  const report = { scroll, consoleErrors, pageErrors };
  await testInfo.attach("runtime-errors.json", jsonAttachment(report));

  expect.soft(consoleErrors, "console.error messages").toEqual([]);
  expect.soft(pageErrors, "uncaught window errors").toEqual([]);
});
