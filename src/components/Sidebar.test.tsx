import React from "react";
import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

const handlers: Record<string, Function[]> = {};
vi.mock("../lib/bus", () => ({
  default: {
    on: (event: string, fn: Function) => {
      (handlers[event] ||= []).push(fn);
      return () => {};
    },
    emit: (event: string, payload?: any) => {
      handlers[event]?.forEach(h => h(payload));
    },
  },
}));

import Sidebar from "./Sidebar";
import bus from "../lib/bus";

afterEach(() => {
  cleanup();
});

describe("Sidebar", () => {
  it("responds to bus events and UI controls", async () => {
    const { getByLabelText, queryByLabelText } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // ensure listeners registered
    await waitFor(() => expect(handlers["sidebar:open"]).toBeDefined());

    expect(queryByLabelText(/Close sidebar/i)).toBeNull();

    bus.emit("sidebar:open");
    await waitFor(() => getByLabelText(/Close sidebar/i));

    bus.emit("sidebar:close");
    await waitFor(() => expect(queryByLabelText(/Close sidebar/i)).toBeNull());

    bus.emit("sidebar:toggle");
    await waitFor(() => getByLabelText(/Close sidebar/i));

    fireEvent.click(getByLabelText(/Close sidebar/i));
    await waitFor(() => expect(queryByLabelText(/Close sidebar/i)).toBeNull());

    bus.emit("sidebar:open");
    await waitFor(() => getByLabelText("Close"));
    const closeBtn = getByLabelText("Close");
    fireEvent.click(closeBtn);
    await waitFor(() => expect(queryByLabelText(/Close sidebar/i)).toBeNull());
  });
});
