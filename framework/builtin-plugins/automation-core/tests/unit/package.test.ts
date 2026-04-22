import { describe, expect, it } from "bun:test";
import manifest from "../../package";

describe("plugin manifest", () => {
  it("keeps a stable package id and capability surface", () => {
    expect(manifest.id).toBe("automation-core");
    expect(manifest.kind).toBe("plugin");
    expect(manifest.providesCapabilities).toContain("automation.routines");
  });
});
