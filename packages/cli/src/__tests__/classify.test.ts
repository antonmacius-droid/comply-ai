import { describe, it, expect } from "vitest";
import { classifyRisk } from "@comply-ai/core";

// ---------------------------------------------------------------------------
// CLI-level tests for risk classification using @comply-ai/core
// ---------------------------------------------------------------------------

describe("classifyRisk via core", () => {
  // -------------------------------------------------------------------------
  // Prohibited practices (Article 5)
  // -------------------------------------------------------------------------
  describe("prohibited detection", () => {
    it("should classify social scoring as prohibited", () => {
      const result = classifyRisk({
        name: "Citizen Trust Score",
        description:
          "A social scoring system that evaluates citizens based on social behaviour",
        purpose: "Score citizens based on social behaviour",
        performsSocialScoring: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain("social_scoring");
    });

    it("should classify subliminal manipulation as prohibited", () => {
      const result = classifyRisk({
        name: "PersuadeAI",
        description:
          "AI system using subliminal techniques to manipulate behaviour",
        purpose: "Covert manipulation of consumer behaviour",
        usesSubliminalTechniques: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain("subliminal_manipulation");
    });

    it("should classify real-time biometric ID as prohibited", () => {
      const result = classifyRisk({
        name: "Public Safety Watch",
        description:
          "Real-time facial recognition in public spaces for identifying individuals",
        purpose: "Real-time biometric identification in public areas",
        usesRealTimeBiometrics: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain(
        "real_time_biometric_identification"
      );
    });

    it("should classify predictive policing as prohibited", () => {
      const result = classifyRisk({
        name: "CrimePredict",
        description:
          "Predictive policing based solely on profiling individuals",
        purpose: "Predict crime based on individual profiling",
        predictsCrimeBySoleProfiling: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain("predictive_policing");
    });
  });

  // -------------------------------------------------------------------------
  // High-risk Annex III categories
  // -------------------------------------------------------------------------
  describe("high-risk Annex III categories", () => {
    it("should classify employment/recruitment as high-risk", () => {
      const result = classifyRisk({
        name: "Resume Screener",
        description: "Automated CV screening and candidate ranking",
        purpose: "Screen and rank job applicants",
        category: "employment",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("employment");
      expect(result.applicableArticles).toContain("Art. 6(2)");
    });

    it("should classify biometrics as high-risk", () => {
      const result = classifyRisk({
        name: "FaceID Access",
        description: "Remote biometric identification for access control",
        purpose: "Identify individuals via biometric identification",
        category: "biometrics",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("biometrics");
    });

    it("should classify education as high-risk", () => {
      const result = classifyRisk({
        name: "ExamGuard AI",
        description: "AI proctoring system for monitoring exams",
        purpose: "Exam monitoring and cheating detection",
        category: "education",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("education");
    });

    it("should classify essential services (credit scoring) as high-risk", () => {
      const result = classifyRisk({
        name: "CreditScore AI",
        description: "Evaluates creditworthiness for loan approval",
        purpose: "Assess credit score for lending decisions",
        category: "essential_services",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("essential_services");
    });

    it("should classify law enforcement as high-risk", () => {
      const result = classifyRisk({
        name: "EvidenceAnalyzer",
        description: "AI system for analyzing evidence in criminal investigations",
        purpose: "Assist law enforcement with evidence analysis",
        category: "law_enforcement",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("law_enforcement");
    });

    it("should classify migration as high-risk", () => {
      const result = classifyRisk({
        name: "BorderCheck AI",
        description: "AI for processing asylum applications",
        purpose: "Assist with migration and asylum processing",
        category: "migration",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("migration");
    });

    it("should classify justice as high-risk", () => {
      const result = classifyRisk({
        name: "JudgeAssist",
        description: "AI assisting judicial authorities in legal research",
        purpose: "Legal research and case law analysis",
        category: "justice",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("justice");
    });

    it("should include required articles for high-risk systems", () => {
      const result = classifyRisk({
        name: "Welfare AI",
        description: "AI for evaluating welfare benefit eligibility",
        purpose: "Determine benefit eligibility",
        category: "essential_services",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.applicableArticles).toContain("Art. 9");
      expect(result.applicableArticles).toContain("Art. 10");
      expect(result.applicableArticles).toContain("Art. 13");
      expect(result.applicableArticles).toContain("Art. 14");
      expect(result.applicableArticles).toContain("Art. 15");
    });
  });

  // -------------------------------------------------------------------------
  // Minimal risk (default)
  // -------------------------------------------------------------------------
  describe("minimal risk", () => {
    it("should classify a spam filter as minimal risk", () => {
      const result = classifyRisk({
        name: "SpamGuard",
        description: "Email spam filter using machine learning",
        purpose: "Filter unwanted spam emails from inbox",
      });

      expect(result.riskLevel).toBe("minimal");
      expect(result.applicableArticles).toContain("Art. 95");
    });

    it("should classify a recommendation engine as minimal risk", () => {
      const result = classifyRisk({
        name: "ProductRec",
        description: "Product recommendation engine for e-commerce",
        purpose: "Suggest products based on purchase history",
      });

      expect(result.riskLevel).toBe("minimal");
    });

    it("should include voluntary codes of conduct for minimal risk", () => {
      const result = classifyRisk({
        name: "WeatherPredict",
        description: "Weather forecasting model",
        purpose: "Predict weather conditions",
      });

      expect(result.riskLevel).toBe("minimal");
      expect(result.requirements.some((r) => r.includes("voluntary"))).toBe(
        true
      );
    });
  });

  // -------------------------------------------------------------------------
  // GPAI
  // -------------------------------------------------------------------------
  describe("GPAI models", () => {
    it("should classify general-purpose AI as GPAI", () => {
      const result = classifyRisk({
        name: "FoundationModel",
        description: "General-purpose large language model",
        purpose: "General-purpose text generation",
        isGeneralPurpose: true,
      });

      expect(result.riskLevel).toBe("gpai");
      expect(result.applicableArticles).toContain("Art. 51");
    });

    it("should detect systemic risk for high-compute GPAI", () => {
      const result = classifyRisk({
        name: "MegaLLM",
        description: "Large language model with massive compute",
        purpose: "General-purpose AI foundation model",
        isGeneralPurpose: true,
        trainingComputeFlops: 1e26,
      });

      expect(result.riskLevel).toBe("gpai");
      expect(result.isSystemicRisk).toBe(true);
      expect(result.applicableArticles).toContain("Art. 55");
    });
  });

  // -------------------------------------------------------------------------
  // Limited risk
  // -------------------------------------------------------------------------
  describe("limited risk", () => {
    it("should classify chatbot as limited risk", () => {
      const result = classifyRisk({
        name: "Support Bot",
        description: "AI chatbot for customer support",
        purpose: "Automated customer support",
        isChatbot: true,
      });

      expect(result.riskLevel).toBe("limited");
      expect(result.applicableArticles).toContain("Art. 50(1)");
    });

    it("should classify deepfake generator as limited risk", () => {
      const result = classifyRisk({
        name: "VideoSynth",
        description: "AI for generating synthetic video content",
        purpose: "Create AI-generated video content",
        generatesDeepfakes: true,
      });

      expect(result.riskLevel).toBe("limited");
      expect(result.applicableArticles).toContain("Art. 50(4)");
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe("edge cases", () => {
    it("should prioritize prohibited over high-risk", () => {
      const result = classifyRisk({
        name: "SocialScorer",
        description: "Social scoring with biometric categorisation",
        purpose: "Social credit scoring of citizens",
        performsSocialScoring: true,
        category: "biometrics",
      });

      expect(result.riskLevel).toBe("prohibited");
    });

    it("should handle minimal input gracefully", () => {
      const result = classifyRisk({
        name: "Test",
        description: "A test system",
        purpose: "Testing",
      });

      expect(result.riskLevel).toBe("minimal");
      expect(result.rationale.length).toBeGreaterThan(0);
    });
  });
});
