/**
 * Auto-Discovery Job
 *
 * Scans a GitHub org for repositories containing AI/ML code.
 * Looks for: Dockerfiles with ML frameworks, requirements.txt with
 * pytorch/tensorflow/transformers, package.json with openai/anthropic.
 *
 * Currently returns simulated mock results — will connect to real
 * GitHub API when tokens are configured.
 */

import { createQueue, createWorker, QUEUE_NAMES } from "./queue";
import type { JobResult } from "./queue";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscoveryInput {
  githubToken: string;
  org: string;
  existingSystemIds: string[];
}

export interface DiscoveredRepo {
  repoName: string;
  repoUrl: string;
  detectedFrameworks: string[];
  detectedUsage: string;
  suggestedRiskLevel: "high" | "limited" | "minimal";
  confidence: number; // 0-100
  lastCommit: string;
  stars: number;
  language: string;
}

export interface DiscoveryOutput {
  org: string;
  scannedAt: string;
  totalReposScanned: number;
  aiReposFound: number;
  results: DiscoveredRepo[];
}

// ---------------------------------------------------------------------------
// In-memory discovery results store
// ---------------------------------------------------------------------------

const discoveryResults: Array<DiscoveryOutput & { id: string }> = [];

export function getDiscoveryResults(): Array<DiscoveryOutput & { id: string }> {
  return [...discoveryResults].sort(
    (a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
  );
}

// ---------------------------------------------------------------------------
// Simulated discovery logic
// ---------------------------------------------------------------------------

function simulateDiscovery(org: string): DiscoveredRepo[] {
  const mockRepos: DiscoveredRepo[] = [
    {
      repoName: `${org}/credit-scoring-model`,
      repoUrl: `https://github.com/${org}/credit-scoring-model`,
      detectedFrameworks: ["scikit-learn", "xgboost", "pandas"],
      detectedUsage: "ML model for automated credit decisions — requirements.txt contains scikit-learn, xgboost",
      suggestedRiskLevel: "high",
      confidence: 94,
      lastCommit: "2026-04-02T14:30:00Z",
      stars: 12,
      language: "Python",
    },
    {
      repoName: `${org}/resume-screener`,
      repoUrl: `https://github.com/${org}/resume-screener`,
      detectedFrameworks: ["transformers", "torch", "huggingface-hub"],
      detectedUsage: "NLP-based resume screening — Dockerfile references transformers, torch",
      suggestedRiskLevel: "high",
      confidence: 97,
      lastCommit: "2026-03-28T09:15:00Z",
      stars: 8,
      language: "Python",
    },
    {
      repoName: `${org}/support-chatbot`,
      repoUrl: `https://github.com/${org}/support-chatbot`,
      detectedFrameworks: ["openai", "langchain"],
      detectedUsage: "Customer support chatbot — package.json includes openai, langchain",
      suggestedRiskLevel: "limited",
      confidence: 91,
      lastCommit: "2026-04-01T16:45:00Z",
      stars: 23,
      language: "TypeScript",
    },
    {
      repoName: `${org}/fraud-detection`,
      repoUrl: `https://github.com/${org}/fraud-detection`,
      detectedFrameworks: ["tensorflow", "keras", "numpy"],
      detectedUsage: "Real-time fraud detection — requirements.txt contains tensorflow, keras",
      suggestedRiskLevel: "high",
      confidence: 96,
      lastCommit: "2026-03-30T11:20:00Z",
      stars: 15,
      language: "Python",
    },
    {
      repoName: `${org}/recommendation-api`,
      repoUrl: `https://github.com/${org}/recommendation-api`,
      detectedFrameworks: ["anthropic", "pinecone-client"],
      detectedUsage: "Product recommendation engine — package.json includes anthropic SDK",
      suggestedRiskLevel: "minimal",
      confidence: 82,
      lastCommit: "2026-04-03T08:00:00Z",
      stars: 5,
      language: "TypeScript",
    },
    {
      repoName: `${org}/document-summarizer`,
      repoUrl: `https://github.com/${org}/document-summarizer`,
      detectedFrameworks: ["transformers", "sentence-transformers"],
      detectedUsage: "Document summarization service — Dockerfile installs transformers",
      suggestedRiskLevel: "limited",
      confidence: 88,
      lastCommit: "2026-03-25T13:10:00Z",
      stars: 3,
      language: "Python",
    },
  ];

  // Randomly exclude 0-1 repos to simulate variation
  const skipIndex = Math.random() > 0.5 ? Math.floor(Math.random() * mockRepos.length) : -1;
  return mockRepos.filter((_, i) => i !== skipIndex);
}

// ---------------------------------------------------------------------------
// Job processor
// ---------------------------------------------------------------------------

async function processDiscovery(
  data: DiscoveryInput
): Promise<JobResult<DiscoveryOutput>> {
  try {
    // Simulate scanning delay (in real implementation, would call GitHub API)
    const results = simulateDiscovery(data.org);

    const output: DiscoveryOutput = {
      org: data.org,
      scannedAt: new Date().toISOString(),
      totalReposScanned: 24 + Math.floor(Math.random() * 20),
      aiReposFound: results.length,
      results,
    };

    // Store the results
    discoveryResults.push({ ...output, id: crypto.randomUUID() });

    return { success: true, data: output };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Discovery scan failed",
    };
  }
}

// ---------------------------------------------------------------------------
// Queue & Worker
// ---------------------------------------------------------------------------

export const discoveryQueue = createQueue<DiscoveryInput, DiscoveryOutput>(
  QUEUE_NAMES.DISCOVERY
);

export const discoveryWorker = createWorker<DiscoveryInput, DiscoveryOutput>(
  QUEUE_NAMES.DISCOVERY,
  processDiscovery
);
