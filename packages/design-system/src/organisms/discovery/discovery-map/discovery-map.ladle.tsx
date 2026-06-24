import { DiscoveryMapPresentational } from "./discovery-map";
import {
  buildMockSelectedEvent,
  makeMockDiscoveryMapProps,
  mockDiscoveryMapMarkers,
} from "./discovery-map.mock";

export const Default = () => (
  <div className="max-w-5xl">
    <DiscoveryMapPresentational {...makeMockDiscoveryMapProps()} />
  </div>
);

export const MarkerSelected = () => {
  const props = makeMockDiscoveryMapProps({
    selectedMarkerId: "evt-1",
    selectedEvent: buildMockSelectedEvent(mockDiscoveryMapMarkers, "evt-1"),
  });
  return (
    <div className="max-w-5xl">
      <DiscoveryMapPresentational {...props} />
    </div>
  );
};

export const Empty = () => (
  <div className="max-w-5xl">
    <DiscoveryMapPresentational
      {...makeMockDiscoveryMapProps({
        markerPositions: [],
        hasMarkers: false,
        markerCountLabel: "0 events on map",
      })}
    />
  </div>
);

export const MemberSurface = () => (
  <div className="max-w-5xl">
    <DiscoveryMapPresentational
      {...makeMockDiscoveryMapProps({
        surface: "member",
        surfaceLabel: "Member discovery map",
        regionLabel: "Member discovery map",
      })}
    />
  </div>
);

export default {
  title: "Organisms / Discovery / Map",
  parameters: {
    ladle: { skipCoverage: true },
    chromatic: { disable: true },
    serverSide: false,
  },
};
