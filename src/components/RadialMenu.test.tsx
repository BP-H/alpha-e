import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RadialMenu from "./RadialMenu";

describe("RadialMenu keyboard navigation", () => {
  const noop = () => {};

  it("cycles through dynamic emoji counts", async () => {
    const { getByRole } = render(
      <RadialMenu
        center={{ x: 0, y: 0 }}
        onClose={noop}
        onChat={noop}
        onReact={noop}
        onComment={noop}
        onRemix={noop}
        onShare={noop}
        onProfile={noop}
        avatarUrl="/avatar.png"
        emojis={["😀", "😃", "😄"]}
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
        "assistant-menu-item-back"
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

