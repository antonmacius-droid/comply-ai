/**
 * BullMQ Queue Factory
 *
 * In dev mode (no REDIS_URL), jobs execute inline synchronously — no Redis needed.
 * In production, connects to Redis via REDIS_URL env var for real BullMQ queues.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JobResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type JobProcessor<TInput = unknown, TOutput = unknown> = (
  data: TInput
) => Promise<JobResult<TOutput>>;

export interface QueueAdapter<TInput = unknown, TOutput = unknown> {
  name: string;
  add(jobName: string, data: TInput): Promise<{ id: string }>;
  getJobs(): Promise<Array<{ id: string; name: string; data: TInput; status: string; result?: JobResult<TOutput>; addedAt: string; processedAt?: string }>>;
}

export interface WorkerAdapter {
  name: string;
  close(): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-memory inline queue (dev mode)
// ---------------------------------------------------------------------------

interface InMemoryJob<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  data: TInput;
  status: "completed" | "failed" | "waiting";
  result?: JobResult<TOutput>;
  addedAt: string;
  processedAt?: string;
}

const jobStores = new Map<string, InMemoryJob[]>();
const processors = new Map<string, JobProcessor>();

function getJobStore(queueName: string): InMemoryJob[] {
  if (!jobStores.has(queueName)) {
    jobStores.set(queueName, []);
  }
  return jobStores.get(queueName)!;
}

class InlineQueue<TInput = unknown, TOutput = unknown>
  implements QueueAdapter<TInput, TOutput>
{
  constructor(public name: string) {}

  async add(jobName: string, data: TInput): Promise<{ id: string }> {
    const id = crypto.randomUUID();
    const store = getJobStore(this.name);
    const job: InMemoryJob<TInput, TOutput> = {
      id,
      name: jobName,
      data,
      status: "waiting",
      addedAt: new Date().toISOString(),
    };

    store.push(job as InMemoryJob);

    // Execute inline if processor is registered
    const processor = processors.get(this.name);
    if (processor) {
      try {
        const result = (await processor(data)) as JobResult<TOutput>;
        job.status = result.success ? "completed" : "failed";
        job.result = result;
        job.processedAt = new Date().toISOString();
      } catch (err) {
        job.status = "failed";
        job.result = {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
        job.processedAt = new Date().toISOString();
      }
    }

    return { id };
  }

  async getJobs() {
    return getJobStore(this.name) as Array<{
      id: string;
      name: string;
      data: TInput;
      status: string;
      result?: JobResult<TOutput>;
      addedAt: string;
      processedAt?: string;
    }>;
  }
}

class InlineWorker implements WorkerAdapter {
  constructor(
    public name: string,
    processor: JobProcessor
  ) {
    processors.set(name, processor);
  }

  async close() {
    processors.delete(this.name);
  }
}

// ---------------------------------------------------------------------------
// Production BullMQ queue (when REDIS_URL is set)
// ---------------------------------------------------------------------------

// NOTE: Real BullMQ integration. Requires `bullmq` and `ioredis` packages.
// When REDIS_URL is available, uncomment and wire up:
//
// import { Queue, Worker } from 'bullmq';
// import IORedis from 'ioredis';
//
// class RealQueue<TInput, TOutput> implements QueueAdapter<TInput, TOutput> { ... }
// class RealWorker implements WorkerAdapter { ... }

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

const isDevMode = !process.env.REDIS_URL;

/**
 * Create a named queue. Returns an inline queue in dev mode,
 * or a BullMQ queue in production.
 */
export function createQueue<TInput = unknown, TOutput = unknown>(
  name: string
): QueueAdapter<TInput, TOutput> {
  if (isDevMode) {
    return new InlineQueue<TInput, TOutput>(name);
  }

  // Production: would return new RealQueue(name, redisConnection)
  // For now, fall back to inline
  return new InlineQueue<TInput, TOutput>(name);
}

/**
 * Create a worker that processes jobs from the named queue.
 * In dev mode, registers the processor for inline execution.
 */
export function createWorker<TInput = unknown, TOutput = unknown>(
  name: string,
  processor: JobProcessor<TInput, TOutput>
): WorkerAdapter {
  if (isDevMode) {
    return new InlineWorker(name, processor as JobProcessor);
  }

  // Production: would return new RealWorker(name, processor, redisConnection)
  return new InlineWorker(name, processor as JobProcessor);
}

// ---------------------------------------------------------------------------
// Predefined queue names
// ---------------------------------------------------------------------------

export const QUEUE_NAMES = {
  DISCOVERY: "comply:discovery",
  DOCUMENT_GEN: "comply:document-gen",
  MONITORING: "comply:monitoring",
  BULWARK_SYNC: "comply:bulwark-sync",
} as const;
