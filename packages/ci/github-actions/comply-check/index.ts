import * as core from "@actions/core";

interface CheckResult {
  status: "pass" | "fail" | "warning";
  systemId: string;
  riskLevel: string;
  checks: Array<{
    name: string;
    status: "pass" | "fail" | "warning";
    message: string;
  }>;
  timestamp: string;
}

async function run(): Promise<void> {
  try {
    const server = core.getInput("server", { required: true }).replace(/\/+$/, "");
    const apiKey = core.getInput("api-key", { required: true });
    const systemId = core.getInput("system-id", { required: true });
    const failOnWarning = core.getInput("fail-on-warning") === "true";
    const timeout = parseInt(core.getInput("timeout") || "30000", 10);

    core.info(`Running compliance check for system: ${systemId}`);
    core.info(`Server: ${server}`);

    const url = `${server}/api/v1/compliance/check?system_id=${encodeURIComponent(systemId)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "comply-ai-github-action/0.1.0",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      core.setFailed(
        `Compliance check request failed: HTTP ${response.status} — ${errorText}`
      );
      return;
    }

    const data = (await response.json()) as CheckResult;

    // Set outputs
    core.setOutput("status", data.status);
    core.setOutput("risk-level", data.riskLevel);

    const passed = data.checks.filter((c) => c.status === "pass").length;
    const failed = data.checks.filter((c) => c.status === "fail").length;
    const warnings = data.checks.filter((c) => c.status === "warning").length;

    core.setOutput("checks-passed", passed.toString());
    core.setOutput("checks-failed", failed.toString());
    core.setOutput("checks-warning", warnings.toString());

    // Log results
    core.info("");
    core.info(`Risk Level: ${data.riskLevel.toUpperCase()}`);
    core.info(`Timestamp: ${data.timestamp}`);
    core.info("");

    for (const check of data.checks) {
      if (check.status === "pass") {
        core.info(`  PASS  ${check.name}`);
      } else if (check.status === "warning") {
        core.warning(`  WARN  ${check.name}: ${check.message}`);
      } else {
        core.error(`  FAIL  ${check.name}: ${check.message}`);
      }
    }

    core.info("");
    core.info(`${passed} passed, ${warnings} warnings, ${failed} failed`);

    // Determine outcome
    if (data.status === "fail") {
      core.setFailed(
        `Compliance check FAILED: ${failed} check(s) failed for system ${systemId}`
      );
    } else if (data.status === "warning" && failOnWarning) {
      core.setFailed(
        `Compliance check has ${warnings} warning(s) and fail-on-warning is enabled`
      );
    } else if (data.status === "warning") {
      core.warning(
        `Compliance check passed with ${warnings} warning(s)`
      );
    } else {
      core.info("All compliance checks passed.");
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        core.setFailed("Compliance check timed out");
      } else {
        core.setFailed(`Compliance check error: ${error.message}`);
      }
    } else {
      core.setFailed("Unknown error during compliance check");
    }
  }
}

run();
