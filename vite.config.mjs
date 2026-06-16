import { resolve as resolvePath } from "node:path";
import tailwindcss from "@tailwindcss/vite";

const rewriteTailwindSources = () => ({
  name: "ladle-tailwind-source-rewriter",
  enforce: "pre",
  transform(code, id) {
    if (!id.includes("global.css")) {
      return null;
    }
    const projectRoot = process.cwd();
    const rewritten = code.replace(
      /@source\s+"([^"]+)"/g,
      (_, pattern) => `@source "${resolvePath(projectRoot, pattern)}"`,
    );
    return { code: rewritten, map: null };
  },
});

export default {
  plugins: [rewriteTailwindSources(), tailwindcss()],
};
