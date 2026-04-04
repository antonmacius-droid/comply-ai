import { describe, it, expect } from "vitest";
import { generateModelCard } from "../model-card/generator.js";
import { validateModelCard } from "../model-card/validator.js";
import { ModelCardSchema } from "../model-card/schema.js";
import type { ModelCardInput } from "../model-card/generator.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createValidInput(overrides?: Partial<ModelCardInput>): ModelCardInput {
  return {
    name: "TestModel",
    version: "1.0.0",
    provider: "TestCorp",
    purpose: "Classify customer support tickets",
    intendedUsers: ["Customer support teams"],
    trainingDataDescription:
      "100K labelled support tickets from 2020-2024",
    metrics: [
      {
        name: "accuracy",
        value: 0.92,
        description: "Overall accuracy on test set",
        dataset: "internal-test-v2",
      },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Model Card Generator
// ---------------------------------------------------------------------------

describe("generateModelCard", () => {
  it("should generate a valid model card with minimal input", () => {
    const card = generateModelCard(createValidInput());

    expect(card.schemaVersion).toBe("1.0");
    expect(card.identification.name).toBe("TestModel");
    expect(card.identification.version).toBe("1.0.0");
    expect(card.identification.provider).toBe("TestCorp");
    expect(card.intendedUse.purpose).toBe("Classify customer support tickets");
    expect(card.trainingData.description).toBe(
      "100K labelled support tickets from 2020-2024"
    );
    expect(card.evaluation.metrics).toHaveLength(1);
    expect(card.generatedAt).toBeDefined();
  });

  it("should include computational resources when provided", () => {
    const card = generateModelCard(
      createValidInput({
        trainingCompute: "4x A100 GPUs for 72 hours",
        trainingComputeFlops: 1e22,
        hardware: "NVIDIA A100 80GB",
        energyConsumption: "500 kWh",
        carbonFootprint: "200 kg CO2",
      })
    );

    expect(card.computationalResources).toBeDefined();
    expect(card.computationalResources!.trainingCompute).toBe(
      "4x A100 GPUs for 72 hours"
    );
    expect(card.computationalResources!.trainingComputeFlops).toBe(1e22);
  });

  it("should include risk mitigation when provided", () => {
    const card = generateModelCard(
      createValidInput({
        identifiedRisks: ["Bias against certain demographics", "Hallucination"],
        mitigationMeasures: [
          "Bias testing across demographics",
          "Output validation layer",
        ],
        residualRisks: ["Edge cases in rare languages"],
        humanOversightMeasures: "Human review of all critical classifications",
      })
    );

    expect(card.riskMitigation).toBeDefined();
    expect(card.riskMitigation!.identifiedRisks).toHaveLength(2);
    expect(card.riskMitigation!.mitigationMeasures).toHaveLength(2);
    expect(card.riskMitigation!.humanOversightMeasures).toBe(
      "Human review of all critical classifications"
    );
  });

  it("should include regulatory info when provided", () => {
    const card = generateModelCard(
      createValidInput({
        riskLevel: "high",
        annexIIICategory: "employment",
        conformityAssessment: "Internal (Annex VI)",
        ceMarking: true,
        applicableArticles: ["Art. 6(2)", "Art. 9", "Art. 10"],
      })
    );

    expect(card.regulatoryInfo).toBeDefined();
    expect(card.regulatoryInfo!.euAIActRiskLevel).toBe("high");
    expect(card.regulatoryInfo!.annexIIICategory).toBe("employment");
    expect(card.regulatoryInfo!.ceMarking).toBe(true);
  });

  it("should omit optional sections when not provided", () => {
    const card = generateModelCard(createValidInput());

    expect(card.computationalResources).toBeUndefined();
    expect(card.riskMitigation).toBeUndefined();
    expect(card.regulatoryInfo).toBeUndefined();
    expect(card.ethicalConsiderations).toBeUndefined();
  });

  it("generated card should pass schema validation", () => {
    const card = generateModelCard(createValidInput());
    const result = ModelCardSchema.safeParse(card);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Model Card Validator
// ---------------------------------------------------------------------------

describe("validateModelCard", () => {
  it("should validate a complete model card as valid", () => {
    const card = generateModelCard(createValidInput());
    const result = validateModelCard(card);

    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.severity === "error")).toHaveLength(0);
    expect(result.completeness).toBeGreaterThan(0);
  });

  it("should reject invalid input (missing required fields)", () => {
    const result = validateModelCard({
      schemaVersion: "1.0",
      identification: { name: "", version: "", provider: "" },
      intendedUse: { purpose: "", intendedUsers: [] },
      trainingData: { description: "" },
      evaluation: { metrics: [] },
    });

    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should reject completely invalid input", () => {
    const result = validateModelCard({ foo: "bar" });
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("should apply high-risk checks when risk level is specified", () => {
    const card = generateModelCard(createValidInput());
    const result = validateModelCard(card, "high");

    // Should have warnings/errors about missing risk mitigation, etc.
    const riskIssues = result.issues.filter(
      (i) => i.article === "Art. 9" || i.article === "Art. 9(2)"
    );
    expect(riskIssues.length).toBeGreaterThan(0);
  });

  it("should pass high-risk validation with complete data", () => {
    const card = generateModelCard(
      createValidInput({
        riskLevel: "high",
        annexIIICategory: "employment",
        identifiedRisks: ["Demographic bias in hiring"],
        mitigationMeasures: ["Regular bias audits"],
        humanOversightMeasures: "HR specialist reviews all AI recommendations",
        outOfScopeUses: ["Final hiring decisions without human review"],
        limitations: ["May not generalise to non-English CVs"],
      })
    );

    const result = validateModelCard(card, "high");
    const errors = result.issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("should apply GPAI checks when risk level is gpai", () => {
    const card = generateModelCard(createValidInput());
    const result = validateModelCard(card, "gpai");

    // Should flag missing architecture, training data sources, etc.
    const gpaiIssues = result.issues.filter(
      (i) => i.article === "Annex XI" || i.article === "Art. 53(1)(d)"
    );
    expect(gpaiIssues.length).toBeGreaterThan(0);
  });

  it("should pass GPAI validation with complete data", () => {
    const card = generateModelCard(
      createValidInput({
        architecture: "Transformer (decoder-only)",
        trainingDataSources: ["Common Crawl", "Wikipedia", "BookCorpus"],
        copyrightCompliance:
          "DSM Directive Art. 4(3) opt-out mechanism implemented",
        trainingCompute: "1024x H100 GPUs",
        trainingComputeFlops: 5e24,
      })
    );

    const result = validateModelCard(card, "gpai");
    const errors = result.issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("should report missing sections", () => {
    const card = generateModelCard(createValidInput());
    const result = validateModelCard(card);

    expect(result.missingSections).toContain("computationalResources");
    expect(result.missingSections).toContain("riskMitigation");
    expect(result.missingSections).toContain("regulatoryInfo");
  });

  it("should calculate completeness score", () => {
    const minimalCard = generateModelCard(createValidInput());
    const minResult = validateModelCard(minimalCard);

    const fullCard = generateModelCard(
      createValidInput({
        providerContact: "contact@test.com",
        modelType: "classifier",
        architecture: "BERT-base",
        trainingDataSources: ["Internal data"],
        knownBiases: ["Some bias"],
        limitations: ["Some limitations"],
        outOfScopeUses: ["Not for medical use"],
        trainingCompute: "4x A100",
        identifiedRisks: ["Risk 1"],
        mitigationMeasures: ["Mitigation 1"],
        riskLevel: "limited",
      })
    );
    const fullResult = validateModelCard(fullCard);

    expect(fullResult.completeness).toBeGreaterThan(minResult.completeness);
  });
});
