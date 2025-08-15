import React from "react";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from "vitest";
import Topbar from "./Topbar";
import bus from "../lib/bus";

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("Topbar", () => {
  it("emits sidebar:toggle when clicking brand orb", () => {
    const emitSpy = vi.spyOn(bus, "emit");
    const { getByRole } = render(<Topbar />);
    const orb = getByRole("button", { name: /open brand menu/i });
    fireEvent.click(orb);
    expect(emitSpy).toHaveBeenCalledWith("sidebar:toggle");
    emitSpy.mockRestore();
  });

  it("updates document data-theme when theme toggle is clicked", async () => {
    const { getByRole } = render(<Topbar />);
    const toggle = getByRole("button", { name: /toggle theme/i });
    expect(document.documentElement.dataset.theme).toBe("dark");
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(document.documentElement.dataset.theme).toBe("light"),
    );
  });
});
