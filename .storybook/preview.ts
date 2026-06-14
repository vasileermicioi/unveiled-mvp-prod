import type { Preview } from "@storybook/react";
import "../src/styles/global.css";
import { withMockAppContexts } from "./preview-decorators";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withMockAppContexts],
};

export default preview;
