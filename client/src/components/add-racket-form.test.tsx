import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddRacketForm from "./add-racket-form";

describe("AddRacketForm", () => {
  it("disables submit when inputs are empty and calls onAdd when valid", () => {
    const onAdd = vi.fn();
    render(<AddRacketForm onAdd={onAdd} />);

    const button = screen.getByTestId("button-add-racket");
    expect(button).toBeDisabled();

    fireEvent.change(screen.getByTestId("input-brand"), { target: { value: "Babolat" } });
    fireEvent.change(screen.getByTestId("input-model"), { target: { value: "Pure Drive" } });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(onAdd).toHaveBeenCalledWith("Babolat", "Pure Drive");
  });
});


