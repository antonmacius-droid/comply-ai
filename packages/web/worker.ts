/**
 * Background worker entry point for Comply AI.
 *
 * Starts all BullMQ workers:
 * - Bulwark sync (pulls audit data from Bulwark AI gateway)
 * - Document generation
 * - Discovery (GitHub scanning)
 * - Monitoring checks
 */

import { bulwarkSyncWorker } from "./src/lib/jobs/bulwark-sync.job";
import { discoveryWorker } from "./src/lib/jobs/discovery.job";
import { documentGenWorker } from "./src/lib/jobs/document-gen.job";
import { monitoringWorker } from "./src/lib/jobs/monitoring.job";

console.log("Comply AI worker started");
console.log("Workers active:", [
  "bulwark-sync",
  "discovery",
  "document-gen",
  "monitoring",
].join(", "));

// Keep process alive
process.on("SIGTERM", () => {
  console.log("Worker shutting down...");
  process.exit(0);
});
