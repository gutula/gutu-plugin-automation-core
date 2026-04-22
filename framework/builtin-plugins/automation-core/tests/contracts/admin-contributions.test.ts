import { describe, expect, it } from "bun:test";

import { adminContributions } from "../../src/ui/admin.contributions";

describe("automation admin contributions", () => {
  it("registers control room and inbox routes", () => {
    expect(adminContributions.workspaces[0]?.id).toBe("automation");
    expect(adminContributions.pages[0]?.route).toBe("/admin/automation");
    expect(adminContributions.pages[1]?.route).toBe("/admin/automation/inbox");
  });
});
