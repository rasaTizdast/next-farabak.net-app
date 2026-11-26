import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        const reduceMotion =
          config.env.commentsReducedMotion === true || config.env.commentsReducedMotion === "true";
        if (reduceMotion && browser.family === "chromium") {
          launchOptions.args.push("--force-prefers-reduced-motion=reduce");
        }
        return launchOptions;
      });
      return config;
    },
  },
});
