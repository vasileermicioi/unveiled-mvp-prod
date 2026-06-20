import { describe, expect, test } from "bun:test";

import {
  createDiscoveryMapModel,
  DEFAULT_DISCOVERY_MAP_TILE_URL,
  hasDiscoveryMapCoordinates,
  projectDiscoveryMapPosition,
  readDiscoveryMapProviderConfig,
} from "./discovery-map";

describe("discovery map helpers", () => {
  test("reads browser-safe open tile provider config", () => {
    expect(
      readDiscoveryMapProviderConfig({
        PUBLIC_MAP_TILE_URL: "https://tiles.example.com/{z}/{x}/{y}.png",
      }),
    ).toEqual({
      tileUrlTemplate: "https://tiles.example.com/{z}/{x}/{y}.png",
      available: true,
    });

    expect(readDiscoveryMapProviderConfig({})).toEqual({
      tileUrlTemplate: DEFAULT_DISCOVERY_MAP_TILE_URL,
      available: true,
    });
  });

  test("projects berlin coordinates into stable marker positions", () => {
    const position = projectDiscoveryMapPosition(52.52, 13.4);
    expect(position.left).toMatch(/%$/);
    expect(position.top).toMatch(/%$/);
  });

  test("derives fallback coordinates when live coordinates are missing", () => {
    const model = createDiscoveryMapModel({
      events: [
        {
          id: "event-1",
          title: "Event",
          partnerName: "Venue",
          category: "Art",
          dateLabel: "Tomorrow",
          neighborhood: "Mitte",
          address: "Berlin",
          imageUrl: "",
          creditPrice: 2,
          remainingCapacity: 5,
          capacityLabel: "5 available",
          ticketType: "Secret code",
          description: "",
          saved: false,
          ctaLabel: "Book now",
          mapLabel: "Mitte Art",
        },
      ],
      loadState: "ready",
    });

    expect(model.hasMarkers).toBe(true);
    expect(model.fallbackTitle).toBe("Map ready");
    expect(model.markerLabels).toEqual(["Mitte Art"]);
  });

  test("builds selectable markers when coordinates exist", () => {
    const model = createDiscoveryMapModel({
      events: [
        {
          id: "event-1",
          title: "Event",
          partnerName: "Venue",
          category: "Art",
          dateLabel: "Tomorrow",
          neighborhood: "Mitte",
          address: "Berlin",
          imageUrl: "",
          creditPrice: 2,
          remainingCapacity: 5,
          capacityLabel: "5 available",
          ticketType: "Secret code",
          description: "",
          saved: false,
          ctaLabel: "Book now",
          mapLabel: "Mitte Art",
          lat: 52.52,
          lng: 13.4,
        },
      ],
      selectedMarkerId: "event-1",
      loadState: "ready",
    });

    expect(model.hasMarkers).toBe(true);
    expect(model.selectedMarker?.id).toBe("event-1");
    expect(model.markerLabels).toEqual(["Mitte Art"]);
    expect(hasDiscoveryMapCoordinates({ lat: 52.52, lng: 13.4 })).toBe(true);
  });
});
