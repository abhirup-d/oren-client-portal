import { describe, it, expect } from "vitest";
import { cn, formatDate, formatFileSize } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });
});

describe("formatDate", () => {
  it("formats ISO date string", () => {
    const result = formatDate("2026-04-01T10:00:00Z");
    expect(result).toBe("Apr 1, 2026");
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1500)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1500000)).toBe("1.4 MB");
  });
});
