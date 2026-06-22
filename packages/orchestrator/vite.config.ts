import { defineConfig } from "vite";
import { dispatchPlugin } from "./src/dev-proxy";

export default defineConfig({
  root: ".",
  server: {
    port: 4320,
    strictPort: true,
    host: "127.0.0.1",
  },
  plugins: [dispatchPlugin()],
});
