import { describe, expect, it } from "bun:test";

import { uiSurface } from "../../src/ui/surfaces";

describe("automation ui surface", () => {
  it("mounts the automation control room", () => {
    expect(uiSurface.embeddedPages[0]?.route).toBe("/admin/automation");
  });
});
