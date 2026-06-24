export default {
  stories: [
    "src/**/*.ladle.tsx",
    "../app/src/**/*.ladle.tsx",
    "../../tests/features/**/*.ladle.tsx",
    "../../tests/ladle/**/*.ladle.tsx",
  ],
  base: "/ladle/",
  viteConfig: "./vite.config.mjs",
};
