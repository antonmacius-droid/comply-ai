/**
 * Post-Market Monitoring Service
 *
 * Manages monitoring checks and health scores for AI systems.
 * Results are simulated for now — will connect to real monitoring
 * infrastructure (Bulwark, logging pipelines, etc.) in Phase 3.
 * In-memory storage — swap arrays for Drizzle queries when Postgres is connected.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MonitoringCheckType =
  | "accuracy_drift"
  | "bias_detection"
  | "performance_degradation"
  | "data_quality"
  | "security_scan"
  | "uptime"
  | "error_rate"
  | "latency";

export type CheckResult = "pass" | "warning" | "fail";

export interface MonitoringCheck {
  id: string;
  systemId: string;
  checkType: MonitoringCheckType;
  result: CheckResult;
  score: number; // 0-100
  details: string;
  metrics: Record<string, number>;
  recommendations: string[];
  runAt: string;
  createdAt: string;
}

export interface SystemHealth {
  systemId: string;
  overallScore: number; // 0-100
  status: "healthy" | "degraded" | "critical";
  checksSummary: {
    total: number;
    pass: number;
    warning: number;
    fail: number;
  };
  lastCheckAt?: string;
  recentChecks: MonitoringCheck[];
}

// ---------------------------------------------------------------------------
// In-memory store (replace with Drizzle table queries)
// ---------------------------------------------------------------------------

const checks: MonitoringCheck[] = [];

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Simulated check runners
// ---------------------------------------------------------------------------

function simulateCheck(
  checkType: MonitoringCheckType
): { result: CheckResult; score: number; details: string; metrics: Record<string, number>; recommendations: string[] } {
  // Simulate realistic results with some randomness
  const rand = Math.random();

  switch (checkType) {
    case "accuracy_drift": {
      const drift = Math.random() * 0.15;
      const score = Math.round((1 - drift) * 100);
      return {
        result: drift < 0.05 ? "pass" : drift < 0.1 ? "warning" : "fail",
        score,
        details: `Model accuracy drift detected at ${(drift * 100).toFixed(1)}% from baseline.`,
        metrics: { drift_percentage: parseFloat((drift * 100).toFixed(2)), baseline_accuracy: 95.2, current_accuracy: parseFloat((95.2 - drift * 100).toFixed(1)) },
        recommendations: drift > 0.05 ? ["Consider retraining the model with recent data", "Review input data distribution for changes"] : [],
      };
    }

    case "bias_detection": {
      const biasScore = Math.random() * 0.2;
      const score = Math.round((1 - biasScore) * 100);
      return {
        result: biasScore < 0.05 ? "pass" : biasScore < 0.12 ? "warning" : "fail",
        score,
        details: `Bias analysis across protected groups. Disparate impact ratio: ${(1 - biasScore).toFixed(3)}.`,
        metrics: { disparate_impact_ratio: parseFloat((1 - biasScore).toFixed(3)), demographic_parity_diff: parseFloat((biasScore * 0.5).toFixed(3)) },
        recommendations: biasScore > 0.05 ? ["Review model outputs across demographic groups", "Consider fairness-aware retraining"] : [],
      };
    }

    case "performance_degradation": {
      const degradation = Math.random() * 0.1;
      const score = Math.round((1 - degradation) * 100);
      return {
        result: degradation < 0.03 ? "pass" : degradation < 0.07 ? "warning" : "fail",
        score,
        details: `Performance degradation of ${(degradation * 100).toFixed(1)}% detected over the monitoring period.`,
        metrics: { f1_score: parseFloat((0.92 - degradation).toFixed(3)), precision: parseFloat((0.94 - degradation * 0.8).toFixed(3)), recall: parseFloat((0.90 - degradation * 1.2).toFixed(3)) },
        recommendations: degradation > 0.03 ? ["Investigate data drift as potential cause", "Schedule model evaluation review"] : [],
      };
    }

    case "data_quality": {
      const qualityIssues = Math.floor(Math.random() * 20);
      const score = Math.max(0, 100 - qualityIssues * 3);
      return {
        result: qualityIssues < 3 ? "pass" : qualityIssues < 10 ? "warning" : "fail",
        score,
        details: `${qualityIssues} data quality issues found in recent input data.`,
        metrics: { missing_values: Math.floor(Math.random() * 5), outliers_detected: Math.floor(Math.random() * 8), schema_violations: Math.floor(Math.random() * 3) },
        recommendations: qualityIssues > 3 ? ["Review data pipeline for quality checks", "Add input validation rules"] : [],
      };
    }

    case "security_scan": {
      const vulns = Math.floor(Math.random() * 5);
      const score = Math.max(0, 100 - vulns * 15);
      return {
        result: vulns === 0 ? "pass" : vulns < 3 ? "warning" : "fail",
        score,
        details: `Security scan completed. ${vulns} potential vulnerabilities identified.`,
        metrics: { vulnerabilities_found: vulns, critical: Math.min(vulns, 1), high: Math.floor(vulns * 0.4), medium: Math.ceil(vulns * 0.6) },
        recommendations: vulns > 0 ? ["Patch identified vulnerabilities", "Review adversarial robustness measures", "Update dependency versions"] : [],
      };
    }

    case "uptime": {
      const uptime = 95 + Math.random() * 5;
      const score = Math.round(uptime);
      return {
        result: uptime > 99.5 ? "pass" : uptime > 98 ? "warning" : "fail",
        score,
        details: `System uptime: ${uptime.toFixed(2)}% over the last 30 days.`,
        metrics: { uptime_percentage: parseFloat(uptime.toFixed(2)), downtime_minutes: Math.round((100 - uptime) * 0.01 * 30 * 24 * 60) },
        recommendations: uptime < 99.5 ? ["Review infrastructure resilience", "Implement automated failover"] : [],
      };
    }

    case "error_rate": {
      const errorRate = Math.random() * 5;
      const score = Math.round(Math.max(0, 100 - errorRate * 10));
      return {
        result: errorRate < 1 ? "pass" : errorRate < 3 ? "warning" : "fail",
        score,
        details: `Error rate: ${errorRate.toFixed(2)}% over the last 24 hours.`,
        metrics: { error_rate_percentage: parseFloat(errorRate.toFixed(2)), total_requests: 10000 + Math.floor(Math.random() * 5000), failed_requests: Math.round(errorRate * 100) },
        recommendations: errorRate > 1 ? ["Investigate error logs for root cause", "Review error handling procedures"] : [],
      };
    }

    case "latency": {
      const p50 = 50 + Math.random() * 150;
      const p99 = p50 * (2 + Math.random() * 3);
      const score = Math.round(Math.max(0, 100 - (p99 / 10)));
      return {
        result: p99 < 500 ? "pass" : p99 < 1000 ? "warning" : "fail",
        score,
        details: `Latency P50: ${p50.toFixed(0)}ms, P99: ${p99.toFixed(0)}ms.`,
        metrics: { p50_ms: parseFloat(p50.toFixed(0)), p95_ms: parseFloat((p50 * 1.8).toFixed(0)), p99_ms: parseFloat(p99.toFixed(0)) },
        recommendations: p99 > 500 ? ["Optimize model inference pipeline", "Consider model quantization or distillation"] : [],
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

export function runCheck(
  systemId: string,
  checkType: MonitoringCheckType
): MonitoringCheck {
  const simulated = simulateCheck(checkType);
  const timestamp = now();

  const check: MonitoringCheck = {
    id: generateId(),
    systemId,
    checkType,
    result: simulated.result,
    score: simulated.score,
    details: simulated.details,
    metrics: simulated.metrics,
    recommendations: simulated.recommendations,
    runAt: timestamp,
    createdAt: timestamp,
  };

  checks.push(check);
  return check;
}

export function listChecks(systemId: string): MonitoringCheck[] {
  return checks
    .filter((c) => c.systemId === systemId)
    .sort(
      (a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime()
    );
}

export function getSystemHealth(systemId: string): SystemHealth {
  const systemChecks = checks.filter((c) => c.systemId === systemId);

  // Get latest check per type
  const latestByType = new Map<MonitoringCheckType, MonitoringCheck>();
  for (const check of systemChecks) {
    const existing = latestByType.get(check.checkType);
    if (!existing || new Date(check.runAt) > new Date(existing.runAt)) {
      latestByType.set(check.checkType, check);
    }
  }

  const latestChecks = Array.from(latestByType.values());
  const totalChecks = latestChecks.length;
  const passCount = latestChecks.filter((c) => c.result === "pass").length;
  const warningCount = latestChecks.filter((c) => c.result === "warning").length;
  const failCount = latestChecks.filter((c) => c.result === "fail").length;

  // Weighted average of latest check scores
  const overallScore =
    totalChecks > 0
      ? Math.round(
          latestChecks.reduce((sum, c) => sum + c.score, 0) / totalChecks
        )
      : 100;

  let status: SystemHealth["status"];
  if (failCount > 0) {
    status = "critical";
  } else if (warningCount > 0) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  const lastCheckAt =
    systemChecks.length > 0
      ? systemChecks.sort(
          (a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime()
        )[0]!.runAt
      : undefined;

  // Return the 10 most recent checks
  const recentChecks = systemChecks
    .sort(
      (a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime()
    )
    .slice(0, 10);

  return {
    systemId,
    overallScore,
    status,
    checksSummary: {
      total: totalChecks,
      pass: passCount,
      warning: warningCount,
      fail: failCount,
    },
    lastCheckAt,
    recentChecks,
  };
}
