// @ladle-only
import type { Story } from "@ladle/react";

import "@unveiled/app/styles/global.css";
import { Button } from "@unveiled/design-system";
import { ArrowRight } from "lucide-react";

export const SecondaryLgPair: Story = () => (
  <div className="flex flex-wrap gap-3 bg-brand-grey p-8">
    <Button asChild variant="secondary" size="lg">
      <a href="/app/en/discover">
        Explore access
        <ArrowRight />
      </a>
    </Button>
    <Button asChild variant="secondary" size="lg">
      <a href="/app/en/how-it-works">
        How it works
        <ArrowRight />
      </a>
    </Button>
  </div>
);

export default {
  title: "shell / HeroCta",
};

