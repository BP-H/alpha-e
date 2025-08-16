import { describe, expect, it } from "vitest";
import { on, emit } from "./bus";

describe("bus", () => {
  it("handles listener errors via callback", () => {
    const off1 = on("post:react", (_p) => { throw new Error("boom"); });
    let called = false;
    const off2 = on("post:react", (_p) => { called = true; });

    const errors: unknown[] = [];
    emit("post:react", { id: 1, emoji: "👍" }, (err) => errors.push(err));

    expect(errors).toHaveLength(1);
    expect(called).toBe(true);

    off1();
    off2();
  });

  it("rethrows listener errors when no callback provided", () => {
    const off = on("post:react", (_p) => { throw new Error("boom"); });
    expect(() => emit("post:react", { id: 1, emoji: "🔥" })).toThrow("boom");
    off();
  });
});
