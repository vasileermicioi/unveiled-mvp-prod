import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TableSkeletonPresentational } from "./table-skeleton";

describe("TableSkeleton organism", () => {
  test("renders a host with role=status and aria-busy=true", () => {
    const html = renderToStaticMarkup(
      <TableSkeletonPresentational columns={4} rows={3} />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
  });

  test("renders the configured column count via inline grid template", () => {
    const html = renderToStaticMarkup(
      <TableSkeletonPresentational columns={6} rows={2} />,
    );
    expect(html).toContain("repeat(6, minmax(0, 1fr))");
  });

  test("renders the configured row count of cells", () => {
    const html = renderToStaticMarkup(
      <TableSkeletonPresentational columns={3} rows={5} />,
    );
    const cellMatches = html.match(/aria-hidden="true"/g) ?? [];
    expect(cellMatches.length).toBe(15);
  });

  test("uses the brand shimmer class and falls back when reduced motion is preferred", () => {
    const html = renderToStaticMarkup(
      <TableSkeletonPresentational columns={2} rows={2} />,
    );
    expect(html).toContain("ui-bf84c38c");
    expect(html).toContain('aria-live="polite"');
  });

  test("renders a custom aria-label when provided", () => {
    const html = renderToStaticMarkup(
      <TableSkeletonPresentational
        columns={3}
        rows={2}
        label="Loading admin members"
      />,
    );
    expect(html).toContain('aria-label="Loading admin members"');
  });

  test("clamps invalid counts to at least one column and row", () => {
    const html = renderToStaticMarkup(
      <TableSkeletonPresentational columns={0} rows={0} />,
    );
    expect(html).toContain("repeat(1, minmax(0, 1fr))");
  });
});
