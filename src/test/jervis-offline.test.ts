import { offlineAnswer } from "@/lib/campus/knowledge";
import { test, expect } from "vitest";
test("offline grade", () => { expect(offlineAnswer("What grade is 73%?", "auto")).toContain("A-"); });
test("offline bn fee", () => { expect(offlineAnswer("টিউশন ফি কিভাবে দিব?", "auto")).toContain("30%"); });
