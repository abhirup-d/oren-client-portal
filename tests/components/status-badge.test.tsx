import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders label text", () => {
    render(<StatusBadge label="Active" color="bg-green-500" />);
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("applies color class", () => {
    const { container } = render(
      <StatusBadge label="Draft" color="bg-gray-500" />
    );
    const dot = container.querySelector("span span");
    expect(dot?.className).toContain("bg-gray-500");
  });
});
