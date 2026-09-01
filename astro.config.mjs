import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  output: "static",
  devToolbar: { enabled: false },
  integrations: [react()],
});
