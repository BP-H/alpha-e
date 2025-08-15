import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RadialMenu, { RadialMenuItem } from "./RadialMenu";

describe("RadialMenu keyboard navigation", () => {
  const noop = () => {};

  it("cycles through dynamic emoji counts", async () => {
    const { getByRole } = render(
      <RadialMenu
        center={{ x: 0, y: 0 }}
        onClose={noop}
        config={([
          {
            id: "chat",
            label: "Chat",
            icon: "💬",
            action: noop,
          },
          {
            id: "react",
            label: "React",
            icon: "👏",
            items: ["😀", "😃", "😄"].map((e, i) => ({
              id: `emoji-${i}`,
              label: `React ${e}`,
              icon: e,
              action: noop,
            })),
          },
        ] satisfies RadialMenuItem[])}
      />
    );

    const menu = getByRole("menu");

    fireEvent.keyDown(menu, { key: "ArrowRight" }); // focus React
    fireEvent.keyDown(menu, { key: "Enter" }); // open react submenu

    await waitFor(() =>
      expect(menu.getAttribute("aria-activedescendant")).toBe(
        "assistant-menu-item-emoji-0"
      )
    );

    fireEvent.keyDown(menu, { key: "ArrowRight" });
    await waitFor(() =>
      expect(menu.getAttribute("aria-activedescendant")).toBe(
        "assistant-menu-item-emoji-1"
      )
    );

    fireEvent.keyDown(menu, { key: "ArrowRight" });
    await waitFor(() =>
      expect(menu.getAttribute("aria-activedescendant")).toBe(
        "assistant-menu-item-emoji-2"
      )
    );

    fireEvent.keyDown(menu, { key: "ArrowRight" });
    await waitFor(() =>
      expect(menu.getAttribute("aria-activedescendant")).toBe(
        "assistant-menu-item-emoji-0"
      )
    );
  });
});

