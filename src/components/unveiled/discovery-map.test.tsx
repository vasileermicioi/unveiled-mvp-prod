import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { DiscoveryMapPanel } from "./discovery-map";

const event = {
  id: "event-1",
  title: "Parity Public Opening",
  partnerName: "Parity Partner Venue",
  category: "Art",
  dateLabel: "Tomorrow, 18:00",
  neighborhood: "Mitte",
  address: "Auguststrasse 24, Berlin",
  imageUrl: "",
  creditPrice: 2,
  remainingCapacity: 9,
  capacityLabel: "9 available",
  ticketType: "Secret code" as const,
  description: "",
  saved: false,
  ctaLabel: "Book now",
  mapLabel: "Mitte Art",
  lat: 52.52,
  lng: 13.4,
  mapReady: true,
};

describe("DiscoveryMapPanel", () => {
  test("renders loading and error states", () => {
    expect(
      renderToStaticMarkup(
        <DiscoveryMapPanel
          events={[event]}
          surface="public"
          providerKey="api-key"
          loadStateOverride="loading"
          actionLabel="View event"
          onOpenEvent={() => undefined}
        />,
      ),
    ).toContain("Loading map");

    expect(
      renderToStaticMarkup(
        <DiscoveryMapPanel
          events={[event]}
          surface="public"
          providerKey="api-key"
          loadStateOverride="error"
          actionLabel="View event"
          onOpenEvent={() => undefined}
        />,
      ),
    ).toContain("Map connection failed");
  });

  test("derives marker positions when coordinates are missing", () => {
    const markup = renderToStaticMarkup(
      <DiscoveryMapPanel
        events={[
          {
            ...event,
            lat: undefined,
            lng: undefined,
            mapReady: false,
          },
        ]}
        surface="member"
        providerKey="api-key"
        loadStateOverride="ready"
        actionLabel="Continue to booking"
        onOpenEvent={() => undefined}
      />,
    );

    expect(markup).toContain("Mitte Art");
  });

  test("renders marker labels and selected event details", () => {
    const markup = renderToStaticMarkup(
      <DiscoveryMapPanel
        events={[event]}
        surface="member"
        providerKey="api-key"
        loadStateOverride="ready"
        selectedMarkerIdOverride="event-1"
        actionLabel="Continue to booking"
        onOpenEvent={() => undefined}
      />,
    );

    expect(markup).toContain("Mitte Art");
    expect(markup).toContain("Continue to booking");
    expect(markup).toContain("Parity Public Opening");
    expect(markup).toContain("1 event on map");
    expect(markup).toContain("Previewing event");
    expect(markup).not.toContain("Mitte Art //");
  });
});
