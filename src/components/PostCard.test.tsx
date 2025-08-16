import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PostCard from "./PostCard";

vi.mock("../lib/bus", () => ({ default: { on: () => () => {}, emit: () => {} } }));
vi.mock("../lib/ensureModelViewer", () => ({ ensureModelViewer: () => Promise.resolve() }));
vi.mock("./AmbientWorld", () => ({ default: () => <div /> }));

describe("PostCard emoji accessibility", () => {
  it("emoji buttons are focusable after opening the reactions drawer", () => {
    const post = { id: 1 } as any;
    render(<PostCard post={post} />);

    // Open the drawer (button has aria-label or title "React")
    const reactBtn =
      screen.queryByRole('button', { name: /react/i }) ||
      screen.getByTitle(/react/i);
    fireEvent.click(reactBtn!);

    // Now the bar should exist
    const bar = document.querySelector(".pc-emoji-bar") as HTMLElement;
    expect(bar).toBeTruthy();

    const buttons = Array.from(bar.querySelectorAll("button"));
    expect(buttons.length).toBeGreaterThan(0);

    (buttons[0] as HTMLButtonElement).focus();
    expect(document.activeElement).toBe(buttons[0]);
  });
});
