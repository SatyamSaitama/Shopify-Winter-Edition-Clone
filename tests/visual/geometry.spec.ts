import { test, expect } from "./fixtures";
import { gotoVisualTarget, jsonAttachment } from "./helpers";

const expectedSectionIds = [
  "hero",
  "sidekick",
  "agentic",
  "online",
  "retail",
  "marketing",
  "checkout",
  "operations",
  "shop-app",
  "b2b",
  "finance",
  "shipping",
  "developer",
];

test("1728x1080 geometry is finite, ordered, and free of root overflow", async ({
  page,
}, testInfo) => {
  await gotoVisualTarget(page);

  const geometry = await page.evaluate((sectionIds) => {
    const styleProperties = [
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "color",
      "background-color",
      "padding",
      "margin",
      "gap",
      "border-radius",
      "z-index",
      "position",
      "transform",
    ] as const;

    const elements = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => !["SCRIPT", "STYLE", "NOSCRIPT"].includes(element.tagName))
      .map((element, index) => {
        const rect = element.getBoundingClientRect();
        const computed = getComputedStyle(element);
        return {
          index,
          element: `${element.tagName.toLowerCase()}${
            element.id ? `#${element.id}` : ""
          }${
            element.dataset.componentName
              ? `[data-component-name="${element.dataset.componentName}"]`
              : ""
          }`,
          rect: {
            x: rect.x,
            y: rect.y,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
          styles: Object.fromEntries(
            styleProperties.map((property) => [
              property,
              computed.getPropertyValue(property),
            ])
          ),
        };
      });

    const sections = sectionIds.map((id) => {
      const element = document.getElementById(id);
      if (!element) return { id, missing: true as const };
      const rect = element.getBoundingClientRect();
      return {
        id,
        missing: false as const,
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    });

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      document: {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      },
      sections,
      elements,
    };
  }, expectedSectionIds);

  await testInfo.attach("geometry-snapshot.json", jsonAttachment(geometry));

  expect(geometry.viewport).toEqual({
    width: 1728,
    height: 1080,
    devicePixelRatio: 1,
  });
  expect(geometry.document.scrollWidth).toBeLessThanOrEqual(1729);
  expect(geometry.document.scrollHeight).toBeGreaterThan(
    geometry.viewport.height * 20
  );
  expect(geometry.document.scrollHeight).toBeLessThan(
    geometry.viewport.height * 120
  );

  const missing = geometry.sections.filter((section) => section.missing);
  expect(missing, "all 13 chapter sections must exist").toEqual([]);

  const presentSections = geometry.sections.filter(
    (
      section
    ): section is Extract<(typeof geometry.sections)[number], { missing: false }> =>
      !section.missing
  );
  for (const section of presentSections) {
    expect
      .soft(section.width, `${section.id} width`)
      .toBeGreaterThanOrEqual(geometry.viewport.width * 0.95);
    expect.soft(section.height, `${section.id} height`).toBeGreaterThan(0);
  }
  for (let index = 1; index < presentSections.length; index += 1) {
    expect.soft(
      presentSections[index].top,
      `${presentSections[index].id} document order`
    ).toBeGreaterThan(presentSections[index - 1].top);
  }

  const invalidRects = geometry.elements.filter(
    ({ rect }) =>
      Object.values(rect).some((value) => !Number.isFinite(value)) ||
      rect.width < 0 ||
      rect.height < 0
  );
  expect(invalidRects, "all rendered boxes must have finite geometry").toEqual(
    []
  );
});
