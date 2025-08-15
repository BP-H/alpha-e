import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PortalOrb from "./PortalOrb";
import bus from "../lib/bus";

describe("PortalOrb compose action", () => {
  it("emits compose event when selecting comment", async () => {
    const emitSpy = vi.spyOn(bus, "emit");
    const { getByRole, findByLabelText } = render(
      <PortalOrb onAnalyzeImage={() => {}} />
    );
    const orb = getByRole("button", { name: /ai portal/i });
    fireEvent.keyDown(orb, { key: "Enter" });
    const composeBtn = await findByLabelText("Compose");
    fireEvent.click(composeBtn);
    const commentBtn = await findByLabelText("Comment");
    fireEvent.click(commentBtn);
    expect(emitSpy).toHaveBeenCalledWith("compose", { type: "comment" });
    emitSpy.mockRestore();
  });
});
