// @ladle-only
import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";

interface DeepLinkPreviewProps {
  language: "EN" | "DE";
  destination: string;
}

function DeepLinkPreview({ language, destination }: DeepLinkPreviewProps) {
  const preview =
    language === "EN"
      ? "After signing in you will be redirected to {destination}."
      : "Nach der Anmeldung wirst du weitergeleitet zu {destination}.";
  return (
    <main className="grid gap-3 bg-brand-grey p-8">
      <div
        id="deep-link-preview"
        role="status"
        aria-live="polite"
        className="rounded-md border border-border bg-muted/40 p-3 text-sm"
      >
        <p>{preview.replace("{destination}", destination)}</p>
        <input
          id="deep-link-redirect-input"
          type="hidden"
          name="callbackURL"
          value={destination}
          readOnly
        />
      </div>
    </main>
  );
}

export default {
  title: "DeepLinkPreservation",
};

export const HappyPath: Story = () => (
  <DeepLinkPreview
    language="EN"
    destination="/app/en/bookings?status=upcoming"
  />
);