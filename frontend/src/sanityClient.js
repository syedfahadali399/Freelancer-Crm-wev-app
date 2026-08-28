import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "ekcv08go",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false,
});