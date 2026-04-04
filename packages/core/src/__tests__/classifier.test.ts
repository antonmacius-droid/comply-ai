import { describe, it, expect } from "vitest";
import { classifyRisk } from "../classifier/risk-classifier.js";
import { checkProhibitedPractices } from "../classifier/prohibited-checks.js";
import { matchAnnexIIIByKeywords, ANNEX_III_DEFINITIONS } from "../classifier/annex-iii.js";
import type { ClassificationInput } from "../classifier/risk-classifier.js";

// ---------------------------------------------------------------------------
// Risk Classifier
// ---------------------------------------------------------------------------

describe("classifyRisk", () => {
  // -----------------------------------------------------------------------
  // Prohibited (Article 5)
  // -----------------------------------------------------------------------
  describe("prohibited practices", () => {
    it("should classify social scoring system as prohibited", () => {
      const result = classifyRisk({
        name: "Citizen Trust Score",
        description:
          "A social scoring system that evaluates citizens based on their social behaviour, online activity, and community interactions to assign a trustworthiness score",
        purpose:
          "Score citizens based on social behaviour for access to public services",
        performsSocialScoring: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain("social_scoring");
      expect(result.applicableArticles).toContain("Art. 5");
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should detect social scoring from description alone", () => {
      const result = classifyRisk({
        name: "Community Rating Platform",
        description:
          "Platform that implements social credit scoring to rate citizens based on social behaviour and assign a social rating",
        purpose: "Social scoring of citizens for government services",
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain("social_scoring");
    });

    it("should classify real-time biometric ID in public spaces as prohibited", () => {
      const result = classifyRisk({
        name: "Public Safety Watch",
        description:
          "Real-time facial recognition system deployed in public spaces for identifying individuals in crowds",
        purpose:
          "Real-time biometric identification of individuals in publicly accessible areas",
        usesRealTimeBiometrics: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain(
        "real_time_biometric_identification"
      );
      expect(result.applicableArticles).toContain("Art. 5(1)(h)");
    });

    it("should classify predictive policing by profiling as prohibited", () => {
      const result = classifyRisk({
        name: "CrimePredict Pro",
        description:
          "Predictive policing system that predicts criminal offences based solely on profiling of individuals using personality traits",
        purpose:
          "Predict likelihood of crime based on individual profiling and personality assessment",
        predictsCrimeBySoleProfiling: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain("predictive_policing");
    });

    it("should classify subliminal manipulation as prohibited", () => {
      const result = classifyRisk({
        name: "PersuadeAI",
        description:
          "AI system using subliminal techniques below consciousness threshold to manipulate purchasing behaviour",
        purpose: "Covert manipulation of consumer behaviour through subliminal messaging",
        usesSubliminalTechniques: true,
      });

      expect(result.riskLevel).toBe("prohibited");
      expect(result.prohibitedPractices).toContain("subliminal_manipulation");
    });
  });

  // -----------------------------------------------------------------------
  // High-risk (Annex III)
  // -----------------------------------------------------------------------
  describe("high-risk systems", () => {
    it("should classify CV screening AI as high-risk (employment)", () => {
      const result = classifyRisk({
        name: "ResumeAI Screener",
        description:
          "AI system for automated CV screening and candidate ranking in recruitment processes",
        purpose: "Screen and rank job applicants based on CV/resume analysis",
        category: "employment",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("employment");
      expect(result.applicableArticles).toContain("Art. 6(2)");
      expect(result.requirements.length).toBeGreaterThan(5);
    });

    it("should detect employment category from keywords", () => {
      const result = classifyRisk({
        name: "HireBot",
        description:
          "Automated recruitment system for CV screening and candidate evaluation in hiring processes",
        purpose: "Evaluate job applications and rank candidates for recruitment",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("employment");
    });

    it("should classify credit scoring as high-risk (essential services)", () => {
      const result = classifyRisk({
        name: "CreditScore AI",
        description:
          "AI system that evaluates the creditworthiness of individuals for loan approval decisions",
        purpose: "Assess credit score and creditworthiness for lending decisions",
        category: "essential_services",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("essential_services");
    });

    it("should classify biometric identification as high-risk", () => {
      const result = classifyRisk({
        name: "FaceID Access",
        description:
          "Remote biometric identification system for access control using facial recognition",
        purpose: "Identify individuals remotely via biometric identification",
        category: "biometrics",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("biometrics");
    });

    it("should classify AI proctoring as high-risk (education)", () => {
      const result = classifyRisk({
        name: "ExamGuard AI",
        description:
          "AI proctoring system for monitoring students during exams to detect cheating",
        purpose: "Exam monitoring and cheating detection for educational institutions",
        category: "education",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.annexIIICategory).toBe("education");
    });

    it("should classify safety component as high-risk", () => {
      const result = classifyRisk({
        name: "GridAI Controller",
        description:
          "AI controller for power grid load balancing and fault detection",
        purpose: "Manage electricity distribution as a safety component",
        isSafetyComponent: true,
      });

      expect(result.riskLevel).toBe("high");
      expect(result.applicableArticles).toContain("Art. 6(1)");
    });

    it("should include all required articles for high-risk systems", () => {
      const result = classifyRisk({
        name: "Welfare Eligibility AI",
        description:
          "AI system evaluating eligibility for public assistance benefits and social security",
        purpose: "Determine benefit eligibility for welfare applicants",
        category: "essential_services",
      });

      expect(result.riskLevel).toBe("high");
      // Check key articles are present
      expect(result.applicableArticles).toContain("Art. 9"); // Risk management
      expect(result.applicableArticles).toContain("Art. 10"); // Data governance
      expect(result.applicableArticles).toContain("Art. 13"); // Transparency
      expect(result.applicableArticles).toContain("Art. 14"); // Human oversight
      expect(result.applicableArticles).toContain("Art. 15"); // Accuracy
    });
  });

  // -----------------------------------------------------------------------
  // GPAI (Articles 51-56)
  // -----------------------------------------------------------------------
  describe("GPAI models", () => {
    it("should classify a general-purpose AI model as GPAI", () => {
      const result = classifyRisk({
        name: "GPT-4 Wrapper",
        description:
          "Application built on top of a general-purpose large language model for various tasks",
        purpose: "General-purpose text generation and understanding",
        isGeneralPurpose: true,
      });

      expect(result.riskLevel).toBe("gpai");
      expect(result.applicableArticles).toContain("Art. 51");
      expect(result.applicableArticles).toContain("Art. 53");
      expect(result.isSystemicRisk).toBe(false);
    });

    it("should detect systemic risk for large-scale GPAI models", () => {
      const result = classifyRisk({
        name: "MegaLLM",
        description: "Large language model trained with massive compute",
        purpose: "General-purpose AI foundation model",
        isGeneralPurpose: true,
        trainingComputeFlops: 1e26, // Exceeds 10^25 threshold
      });

      expect(result.riskLevel).toBe("gpai");
      expect(result.isSystemicRisk).toBe(true);
      expect(result.applicableArticles).toContain("Art. 55");
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("should detect systemic risk for models with large EU user base", () => {
      const result = classifyRisk({
        name: "PopularAI",
        description: "Widely used general-purpose AI assistant",
        purpose: "General-purpose AI model",
        isGeneralPurpose: true,
        euRegisteredUsers: 50_000_000, // Exceeds 45M threshold
      });

      expect(result.riskLevel).toBe("gpai");
      expect(result.isSystemicRisk).toBe(true);
    });

    it("should include copyright and training data requirements for GPAI", () => {
      const result = classifyRisk({
        name: "FoundationModel",
        description: "General-purpose foundation model",
        purpose: "Multi-task AI model",
        isGeneralPurpose: true,
      });

      const reqText = result.requirements.join(" ");
      expect(reqText).toContain("copyright");
      expect(reqText).toContain("training data");
      expect(reqText).toContain("technical documentation");
    });
  });

  // -----------------------------------------------------------------------
  // Limited risk (Article 50)
  // -----------------------------------------------------------------------
  describe("limited risk systems", () => {
    it("should classify a customer chatbot as limited risk", () => {
      const result = classifyRisk({
        name: "Customer Support Bot",
        description: "AI chatbot that answers customer questions about products and orders",
        purpose: "Provide automated customer support via conversational AI",
        isChatbot: true,
      });

      expect(result.riskLevel).toBe("limited");
      expect(result.applicableArticles).toContain("Art. 50(1)");
      expect(result.requirements.some((r) => r.includes("interacting with an AI"))).toBe(true);
    });

    it("should classify deepfake generator as limited risk", () => {
      const result = classifyRisk({
        name: "VideoSynth",
        description: "AI system for generating synthetic video content and deepfakes",
        purpose: "Create AI-generated video content",
        generatesDeepfakes: true,
      });

      expect(result.riskLevel).toBe("limited");
      expect(result.applicableArticles).toContain("Art. 50(4)");
      expect(result.requirements.some((r) => r.includes("machine-readable"))).toBe(true);
    });

    it("should classify virtual assistant with disclosure as limited risk", () => {
      const result = classifyRisk({
        name: "Office Assistant AI",
        description: "Virtual assistant that helps schedule meetings and draft emails",
        purpose: "Conversational AI assistant for office productivity",
        isChatbot: true,
        interactsWithPersons: true,
      });

      expect(result.riskLevel).toBe("limited");
    });
  });

  // -----------------------------------------------------------------------
  // Minimal risk (default)
  // -----------------------------------------------------------------------
  describe("minimal risk systems", () => {
    it("should classify a spam filter as minimal risk", () => {
      const result = classifyRisk({
        name: "SpamGuard",
        description: "Email spam filter that uses machine learning to classify spam emails",
        purpose: "Filter unwanted spam emails from inbox",
      });

      expect(result.riskLevel).toBe("minimal");
      expect(result.applicableArticles).toContain("Art. 95");
      expect(result.requirements.some((r) => r.includes("voluntary"))).toBe(true);
    });

    it("should classify recommendation engine as minimal risk", () => {
      const result = classifyRisk({
        name: "ProductRec",
        description: "Product recommendation engine for an e-commerce website",
        purpose: "Suggest products based on browsing and purchase history",
      });

      expect(result.riskLevel).toBe("minimal");
    });

    it("should add GDPR warning for minimal-risk systems processing personal data", () => {
      const result = classifyRisk({
        name: "PersonalizedFeed",
        description: "Content feed personalisation algorithm",
        purpose: "Personalise news feed based on user preferences",
        processesPersonalData: true,
      });

      expect(result.riskLevel).toBe("minimal");
      expect(result.warnings.some((w) => w.includes("GDPR"))).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  describe("edge cases", () => {
    it("should prioritize prohibited over high-risk", () => {
      const result = classifyRisk({
        name: "BiometricCategorizer",
        description:
          "System performing biometric categorisation to infer race and religion from biometric data for social scoring",
        purpose: "Social scoring based on biometric categorisation of sensitive attributes",
        performsSocialScoring: true,
        categorisesBySensitiveBiometrics: true,
        category: "biometrics", // Would be high-risk, but prohibited takes precedence
      });

      expect(result.riskLevel).toBe("prohibited");
    });

    it("should prioritize GPAI classification when isGeneralPurpose is true", () => {
      const result = classifyRisk({
        name: "ChatLLM",
        description: "General-purpose large language model that can function as a chatbot",
        purpose: "General-purpose text generation",
        isGeneralPurpose: true,
        isChatbot: true, // Would be limited risk, but GPAI takes precedence
      });

      expect(result.riskLevel).toBe("gpai");
    });

    it("should handle empty/minimal input gracefully", () => {
      const result = classifyRisk({
        name: "Test",
        description: "A simple test system",
        purpose: "Testing",
      });

      expect(result.riskLevel).toBe("minimal");
      expect(result.rationale.length).toBeGreaterThan(0);
    });

    it("should return high confidence for explicit category matches", () => {
      const result = classifyRisk({
        name: "JudgeAssist",
        description: "AI system assisting judicial authorities in legal research",
        purpose: "Legal research and case law analysis for judges",
        category: "justice",
      });

      expect(result.riskLevel).toBe("high");
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("should warn about law enforcement exemption for real-time biometrics", () => {
      const result = classifyRisk({
        name: "PoliceID",
        description:
          "Real-time biometric identification system for law enforcement in public spaces",
        purpose:
          "Identify suspects in real-time using biometric identification",
        usesRealTimeBiometrics: true,
        hasLawEnforcementExemption: true,
      });

      // With exemption, should NOT be prohibited
      expect(result.riskLevel).not.toBe("prohibited");
    });
  });
});

// ---------------------------------------------------------------------------
// Prohibited Checks (standalone)
// ---------------------------------------------------------------------------

describe("checkProhibitedPractices", () => {
  it("should return empty for a benign system", () => {
    const result = checkProhibitedPractices({
      description: "A simple calculator app",
      purpose: "Perform arithmetic calculations",
    });

    expect(result.isProhibited).toBe(false);
    expect(result.practices).toHaveLength(0);
  });

  it("should detect multiple prohibited practices", () => {
    const result = checkProhibitedPractices({
      description:
        "System for social scoring and subliminal manipulation of citizens",
      purpose: "Social credit scoring with covert manipulation techniques",
      performsSocialScoring: true,
      usesSubliminalTechniques: true,
    });

    expect(result.isProhibited).toBe(true);
    expect(result.practices.length).toBeGreaterThanOrEqual(2);
    const practiceTypes = result.practices.map((p) => p.practice);
    expect(practiceTypes).toContain("social_scoring");
    expect(practiceTypes).toContain("subliminal_manipulation");
  });
});

// ---------------------------------------------------------------------------
// Annex III keyword matching
// ---------------------------------------------------------------------------

describe("matchAnnexIIIByKeywords", () => {
  it("should match recruitment keywords to employment category", () => {
    const matches = matchAnnexIIIByKeywords(
      "AI system for recruitment and CV screening of job applicants"
    );

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]!.category).toBe("employment");
  });

  it("should match credit scoring to essential services", () => {
    const matches = matchAnnexIIIByKeywords(
      "Credit scoring and creditworthiness assessment system"
    );

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]!.category).toBe("essential_services");
  });

  it("should return empty for non-matching text", () => {
    const matches = matchAnnexIIIByKeywords("A weather forecasting app");
    expect(matches).toHaveLength(0);
  });

  it("should have all 8 Annex III categories defined", () => {
    expect(ANNEX_III_DEFINITIONS).toHaveLength(8);
    const categories = ANNEX_III_DEFINITIONS.map((d) => d.category);
    expect(categories).toContain("biometrics");
    expect(categories).toContain("critical_infrastructure");
    expect(categories).toContain("education");
    expect(categories).toContain("employment");
    expect(categories).toContain("essential_services");
    expect(categories).toContain("law_enforcement");
    expect(categories).toContain("migration");
    expect(categories).toContain("justice");
  });
});
