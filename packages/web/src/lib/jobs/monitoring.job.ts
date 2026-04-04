/**
 * Monitoring Job
 *
 * Scheduled background job that runs performance, drift, and bias checks
 * on AI systems and stores the results via the monitoring service.
 * Currently simulated — real checks will connect to monitoring infrastructure.
 */

import { createQueue, createWorker, QUEUE_NAMES } from "./queue";
import type { JobResult } from "./queue";
import {
  runCheck,
  type MonitoringCheckType,
  type MonitoringCheck,
} from "../services/monitoring.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MonitoringJobInput {
  systemId: string;
  checkTypes: MonitoringCheckType[];
}

export interface MonitoringJobOutput {
  systemId: string;
  checksRun: number;
  results: MonitoringCheck[];
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Job processor
// ---------------------------------------------------------------------------

async function processMonitoring(
  data: MonitoringJobInput
): Promise<JobResult<MonitoringJobOutput>> {
  try {
    const results: MonitoringCheck[] = [];

    for (const checkType of data.checkTypes) {
      const check = runCheck(data.systemId, checkType);
      results.push(check);
    }

    const output: MonitoringJobOutput = {
      systemId: data.systemId,
      checksRun: results.length,
      results,
      completedAt: new Date().toISOString(),
    };

    return { success: true, data: output };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Monitoring checks failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Queue & Worker
// ---------------------------------------------------------------------------

export const monitoringQueue = createQueue<
  MonitoringJobInput,
  MonitoringJobOutput
>(QUEUE_NAMES.MONITORING);

export const monitoringWorker = createWorker<
  MonitoringJobInput,
  MonitoringJobOutput
>(QUEUE_NAMES.MONITORING, processMonitoring);
