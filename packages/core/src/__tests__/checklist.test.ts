import { describe, it, expect } from "vitest";
import {
  getHighRiskChecklist,
  getHighRiskChecklistByCategory,
  getHighRiskCategories,
} from "../checklist/high-risk.js";
import {
  getLimitedRiskChecklist,
  getMandatoryTransparencyItems,
} from "../checklist/limited-risk.js";
import {
  getGPAIChecklist,
  getSystemicRiskItems,
} from "../checklist/gpai.js";

// ---------------------------------------------------------------------------
// High-risk checklist
// ---------------------------------------------------------------------------

describe("high-risk checklist", () => {
  it("should return a non-empty checklist", () => {
    const checklist = getHighRiskChecklist();
    expect(checklist.items.length).toBeGreaterThan(20);
    expect(checklist.riskLevel).toBe("high");
  });

  it("should have unique item IDs", () => {
    const checklist = getHighRiskChecklist();
    const ids = checklist.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should include risk management items (Art. 9)", () => {
    const items = getHighRiskChecklistByCategory("Risk Management");
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.article.includes("Art. 9"))).toBe(true);
  });

  it("should include data governance items (Art. 10)", () => {
    const items = getHighRiskChecklistByCategory("Data Governance");
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((i) => i.article.includes("Art. 10"))).toBe(true);
  });

  it("should include human oversight items (Art. 14)", () => {
    const items = getHighRiskChecklistByCategory("Human Oversight");
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((i) => i.article.includes("Art. 14"))).toBe(true);
  });

  it("should include accuracy/robustness items (Art. 15)", () => {
    const items = getHighRiskChecklistByCategory(
      "Accuracy, Robustness & Cybersecurity"
    );
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((i) => i.article.includes("Art. 15"))).toBe(true);
  });

  it("should include provider obligation items", () => {
    const items = getHighRiskChecklistByCategory("Provider Obligations");
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((i) => i.article.includes("Art. 17"))).toBe(true);
    expect(items.some((i) => i.article.includes("Art. 43"))).toBe(true);
    expect(items.some((i) => i.article.includes("Art. 49"))).toBe(true);
  });

  it("should include deployer obligation items", () => {
    const items = getHighRiskChecklistByCategory("Deployer Obligations");
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((i) => i.article.includes("Art. 26"))).toBe(true);
    expect(items.some((i) => i.article.includes("Art. 27"))).toBe(true);
  });

  it("should have valid categories", () => {
    const categories = getHighRiskCategories();
    expect(categories.length).toBeGreaterThan(5);
    expect(categories).toContain("Risk Management");
    expect(categories).toContain("Data Governance");
    expect(categories).toContain("Human Oversight");
    expect(categories).toContain("Transparency");
  });

  it("every item should have at least one evidence type", () => {
    const checklist = getHighRiskChecklist();
    for (const item of checklist.items) {
      expect(
        item.evidenceTypes.length,
        `Item ${item.id} has no evidence types`
      ).toBeGreaterThan(0);
    }
  });

  it("every item should reference an article", () => {
    const checklist = getHighRiskChecklist();
    for (const item of checklist.items) {
      expect(item.article.length, `Item ${item.id} has no article`).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Limited-risk checklist
// ---------------------------------------------------------------------------

describe("limited-risk checklist", () => {
  it("should return a non-empty checklist", () => {
    const checklist = getLimitedRiskChecklist();
    expect(checklist.items.length).toBeGreaterThan(5);
    expect(checklist.riskLevel).toBe("limited");
  });

  it("should reference Article 50", () => {
    const checklist = getLimitedRiskChecklist();
    expect(checklist.items.some((i) => i.article.includes("Art. 50"))).toBe(
      true
    );
  });

  it("should include deep fake labelling requirements", () => {
    const checklist = getLimitedRiskChecklist();
    const deepfakeItems = checklist.items.filter(
      (i) =>
        i.article.includes("Art. 50(4)") ||
        i.description.toLowerCase().includes("deep fake")
    );
    expect(deepfakeItems.length).toBeGreaterThan(0);
  });

  it("should include chatbot disclosure requirements", () => {
    const checklist = getLimitedRiskChecklist();
    const chatbotItems = checklist.items.filter(
      (i) => i.article.includes("Art. 50(1)")
    );
    expect(chatbotItems.length).toBeGreaterThan(0);
  });

  it("getMandatoryTransparencyItems should filter correctly", () => {
    const mandatory = getMandatoryTransparencyItems();
    const all = getLimitedRiskChecklist().items;

    expect(mandatory.length).toBeLessThanOrEqual(all.length);
    expect(mandatory.every((i) => i.mandatory)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GPAI checklist
// ---------------------------------------------------------------------------

describe("GPAI checklist", () => {
  it("should return standard GPAI items", () => {
    const checklist = getGPAIChecklist(false);
    expect(checklist.items.length).toBeGreaterThan(5);
    expect(checklist.riskLevel).toBe("gpai");
    // Should NOT include systemic risk items
    expect(checklist.items.some((i) => i.id.startsWith("GPAI-SR"))).toBe(false);
  });

  it("should include systemic risk items when requested", () => {
    const checklist = getGPAIChecklist(true);
    const standardOnly = getGPAIChecklist(false);

    expect(checklist.items.length).toBeGreaterThan(standardOnly.items.length);
    expect(checklist.items.some((i) => i.id.startsWith("GPAI-SR"))).toBe(true);
  });

  it("should reference Art. 53 for standard obligations", () => {
    const checklist = getGPAIChecklist(false);
    expect(checklist.items.some((i) => i.article.includes("Art. 53"))).toBe(
      true
    );
  });

  it("should reference Art. 55 for systemic risk", () => {
    const srItems = getSystemicRiskItems();
    expect(srItems.some((i) => i.article.includes("Art. 55"))).toBe(true);
  });

  it("should include copyright compliance items", () => {
    const checklist = getGPAIChecklist(false);
    const copyrightItems = checklist.items.filter(
      (i) => i.category === "Copyright Compliance"
    );
    expect(copyrightItems.length).toBeGreaterThan(0);
  });

  it("should include training data transparency items", () => {
    const checklist = getGPAIChecklist(false);
    const tdItems = checklist.items.filter(
      (i) => i.category === "Training Data Transparency"
    );
    expect(tdItems.length).toBeGreaterThan(0);
    expect(tdItems.some((i) => i.article.includes("Art. 53(1)(d)"))).toBe(true);
  });

  it("getSystemicRiskItems should return only SR items", () => {
    const items = getSystemicRiskItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.id.startsWith("GPAI-SR"))).toBe(true);
  });
});
