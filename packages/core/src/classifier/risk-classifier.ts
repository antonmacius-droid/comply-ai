/**
 * Risk Classifier — Main classification engine
 *
 * Implements the EU AI Act's risk-based classification framework.
 * Checks Article 5 (prohibited), Annex III (high-risk), GPAI (Art. 51-56),
 * limited risk (Art. 50), and defaults to minimal.
 */

import type {
  RiskLevel,
  AnnexIIICategory,
  ProhibitedPractice,
} from "../types/eu-ai-act.js";
import { checkProhibitedPractices } from "./prohibited-checks.js";
import { matchAnnexIIIByKeywords, getAnnexIIIDefinition } from "./annex-iii.js";

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface ClassificationInput {
  /** Name of the AI system */
  name: string;
  /** Detailed description of what the system does */
  description: string;
  /** Stated purpose / intended use */
  purpose: string;
  /** Explicitly declared Annex III category (if known) */
  category?: AnnexIIICategory;
  /** Is this a general-purpose AI model (e.g. LLM, foundation model)? */
  isGeneralPurpose?: boolean;
  /** Does the system use real-time biometric identification? */
  usesRealTimeBiometrics?: boolean;
  /** Primary domain the system targets */
  targetsDomain?: string;
  /** Does it specifically affect vulnerable groups (children, disabled, elderly)? */
  affectsVulnerableGroups?: boolean;
  /** Does the system make autonomous decisions without human oversight? */
  makesAutonomousDecisions?: boolean;
  /** Does the system process personal data? */
  processesPersonalData?: boolean;
  /** Is a chatbot, virtual assistant, or conversational AI? */
  isChatbot?: boolean;
  /** Does it generate or manipulate images/audio/video (deepfake potential)? */
  generatesDeepfakes?: boolean;
  /** Does it interact directly with natural persons? */
  interactsWithPersons?: boolean;
  /** Is it a safety component of a product covered by EU harmonisation legislation? */
  isSafetyComponent?: boolean;
  /** Training compute in FLOPs (relevant for GPAI systemic risk threshold: 10^25) */
  trainingComputeFlops?: number;
  /** Estimated number of registered users in the EU */
  euRegisteredUsers?: number;
  /** Explicit prohibited-practice flags */
  performsSocialScoring?: boolean;
  usesSubliminalTechniques?: boolean;
  categorisesBySensitiveBiometrics?: boolean;
  scrapesFacialImages?: boolean;
  infersEmotionsAtWork?: boolean;
  predictsCrimeBySoleProfiling?: boolean;
  hasLawEnforcementExemption?: boolean;
}

export interface ClassificationResult {
  /** Determined risk level */
  riskLevel: RiskLevel;
  /** Confidence in the classification (0-1) */
  confidence: number;
  /** Human-readable reasons for the classification */
  rationale: string[];
  /** Detected prohibited practices (Art. 5) */
  prohibitedPractices: ProhibitedPractice[];
  /** Applicable EU AI Act articles */
  applicableArticles: string[];
  /** Requirements that apply to this system */
  requirements: string[];
  /** Warnings or caveats about the classification */
  warnings: string[];
  /** If high-risk, the matched Annex III category */
  annexIIICategory?: AnnexIIICategory;
  /** If GPAI, whether systemic risk applies */
  isSystemicRisk?: boolean;
}

// ---------------------------------------------------------------------------
// Limited-risk keyword indicators (Article 50)
// ---------------------------------------------------------------------------

const LIMITED_RISK_KEYWORDS = [
  "chatbot",
  "virtual assistant",
  "conversational ai",
  "deepfake",
  "synthetic media",
  "generated content",
  "text generation",
  "image generation",
  "voice synthesis",
  "emotion recognition",
  "ai-generated",
  "machine-generated",
];

// ---------------------------------------------------------------------------
// Classifier implementation
// ---------------------------------------------------------------------------

/**
 * Classify an AI system's risk level under the EU AI Act.
 *
 * The classification follows the regulation's hierarchy:
 * 1. Prohibited practices (Article 5) — checked first
 * 2. High-risk (Annex III + safety components under Art. 6)
 * 3. GPAI model obligations (Articles 51-56)
 * 4. Limited risk / transparency obligations (Article 50)
 * 5. Minimal risk (default)
 */
export function classifyRisk(input: ClassificationInput): ClassificationResult {
  const rationale: string[] = [];
  const applicableArticles: string[] = [];
  const requirements: string[] = [];
  const warnings: string[] = [];
  let confidence = 0.5; // baseline

  const fullText = `${input.name} ${input.description} ${input.purpose} ${input.targetsDomain ?? ""}`;

  // -----------------------------------------------------------------
  // Step 1: Check Article 5 — Prohibited practices
  // -----------------------------------------------------------------
  const prohibitedResult = checkProhibitedPractices({
    description: input.description,
    purpose: input.purpose,
    performsSocialScoring: input.performsSocialScoring,
    targetsVulnerableGroups: input.affectsVulnerableGroups,
    usesSubliminalTechniques: input.usesSubliminalTechniques,
    categorisesBySensitiveBiometrics: input.categorisesBySensitiveBiometrics,
    scrapesFacialImages: input.scrapesFacialImages,
    infersEmotionsAtWork: input.infersEmotionsAtWork,
    usesRealTimeBiometricId: input.usesRealTimeBiometrics,
    predictsCrimeBySoleProfiling: input.predictsCrimeBySoleProfiling,
    hasLawEnforcementExemption: input.hasLawEnforcementExemption,
  });

  if (prohibitedResult.isProhibited) {
    const practices = prohibitedResult.practices;
    const maxConfidence = Math.max(...practices.map((p) => p.confidence));

    for (const p of practices) {
      rationale.push(
        `Prohibited under ${p.article}: ${p.reason}`
      );
      applicableArticles.push(p.article);
    }

    applicableArticles.push("Art. 5");
    requirements.push(
      "This AI system is PROHIBITED under the EU AI Act and may not be placed on the market, put into service, or used in the EU"
    );
    requirements.push(
      "Existing deployments must be terminated immediately"
    );
    requirements.push(
      "Penalties for prohibited practices: up to EUR 35 million or 7% of worldwide annual turnover (Art. 99(3))"
    );

    return {
      riskLevel: "prohibited",
      confidence: maxConfidence,
      rationale,
      prohibitedPractices: practices.map((p) => p.practice),
      applicableArticles: [...new Set(applicableArticles)],
      requirements,
      warnings: [
        "CRITICAL: This system matches one or more prohibited AI practices. Deploying it in the EU is illegal.",
      ],
    };
  }

  // -----------------------------------------------------------------
  // Step 2: Check GPAI (Articles 51-56)
  // -----------------------------------------------------------------
  if (input.isGeneralPurpose) {
    applicableArticles.push("Art. 51", "Art. 52", "Art. 53");
    rationale.push(
      "System is identified as a general-purpose AI model (Art. 51)"
    );

    const isSystemicRisk =
      (input.trainingComputeFlops != null &&
        input.trainingComputeFlops >= 1e25) ||
      (input.euRegisteredUsers != null && input.euRegisteredUsers >= 45_000_000);

    if (isSystemicRisk) {
      applicableArticles.push("Art. 51(2)", "Art. 55");
      rationale.push(
        "GPAI model classified as systemic risk — training compute >= 10^25 FLOPs or >= 45M EU users (Art. 51(2))"
      );
      requirements.push(
        "Perform model evaluation including adversarial testing (Art. 55(1)(a))"
      );
      requirements.push(
        "Assess and mitigate systemic risks (Art. 55(1)(b))"
      );
      requirements.push(
        "Track, document, and report serious incidents to the AI Office and national authorities (Art. 55(1)(c))"
      );
      requirements.push(
        "Ensure adequate cybersecurity protection (Art. 55(1)(d))"
      );
      confidence = 0.9;
    } else {
      confidence = 0.85;
    }

    requirements.push(
      "Draw up and maintain technical documentation (Art. 53(1)(a), Annex XI)"
    );
    requirements.push(
      "Provide information and documentation to downstream providers (Art. 53(1)(b))"
    );
    requirements.push(
      "Put in place a policy to comply with EU copyright law (Art. 53(1)(c))"
    );
    requirements.push(
      "Publish a sufficiently detailed summary of training data (Art. 53(1)(d))"
    );

    // Check if it also falls into high-risk via downstream use
    const annexMatches = matchAnnexIIIByKeywords(fullText);
    if (input.category || annexMatches.length > 0) {
      warnings.push(
        "This GPAI model may also trigger high-risk obligations if integrated into a high-risk AI system (Art. 6(3)). Downstream deployers bear high-risk compliance duties."
      );
    }

    return {
      riskLevel: "gpai",
      confidence,
      rationale,
      prohibitedPractices: [],
      applicableArticles: [...new Set(applicableArticles)],
      requirements,
      warnings,
      isSystemicRisk,
    };
  }

  // -----------------------------------------------------------------
  // Step 3: Check Annex III — High-risk categories
  // -----------------------------------------------------------------
  let annexCategory: AnnexIIICategory | undefined = input.category;
  let highRiskScore = 0;

  // If category is explicitly provided, trust it
  if (input.category) {
    const def = getAnnexIIIDefinition(input.category);
    if (def) {
      highRiskScore = 0.9;
      rationale.push(
        `Explicitly categorised under ${def.annexReference}: ${def.title}`
      );
      applicableArticles.push("Art. 6(2)", def.annexReference);
    }
  }

  // Also do keyword matching for automatic detection
  const annexMatches = matchAnnexIIIByKeywords(fullText);
  if (annexMatches.length > 0) {
    const topMatch = annexMatches[0]!;
    const normalizedScore = Math.min(topMatch.score / 3, 1);

    if (!annexCategory && normalizedScore > 0.3) {
      annexCategory = topMatch.category;
      const def = getAnnexIIIDefinition(topMatch.category);
      if (def) {
        highRiskScore = Math.max(highRiskScore, normalizedScore);
        rationale.push(
          `Keyword analysis matched ${def.annexReference}: ${def.title} (matched subcategories: ${topMatch.matchedSubcategories.map((s) => s.id).join(", ")})`
        );
        applicableArticles.push("Art. 6(2)", def.annexReference);
      }
    } else if (annexCategory && normalizedScore > 0.3) {
      // Reinforce existing match
      highRiskScore = Math.max(highRiskScore, normalizedScore);
    }

    // Warn about other potential categories
    for (const match of annexMatches.slice(1)) {
      if (match.score >= 2) {
        const def = getAnnexIIIDefinition(match.category);
        if (def) {
          warnings.push(
            `System may also relate to ${def.annexReference}: ${def.title}`
          );
        }
      }
    }
  }

  // Safety component check (Art. 6(1))
  if (input.isSafetyComponent) {
    highRiskScore = Math.max(highRiskScore, 0.85);
    rationale.push(
      "System is a safety component of a product covered by EU harmonisation legislation (Art. 6(1))"
    );
    applicableArticles.push("Art. 6(1)");
  }

  // Autonomous decisions affecting rights
  if (input.makesAutonomousDecisions && input.processesPersonalData) {
    highRiskScore = Math.max(highRiskScore, highRiskScore + 0.15);
    if (highRiskScore < 0.5) {
      warnings.push(
        "System makes autonomous decisions with personal data — consider whether this falls under a high-risk category"
      );
    }
  }

  if (highRiskScore > 0.4) {
    applicableArticles.push(
      "Art. 8",
      "Art. 9",
      "Art. 10",
      "Art. 11",
      "Art. 12",
      "Art. 13",
      "Art. 14",
      "Art. 15"
    );
    applicableArticles.push("Art. 16", "Art. 17");
    applicableArticles.push("Art. 26"); // deployer obligations
    applicableArticles.push("Art. 49"); // EU database registration

    requirements.push(
      "Establish a risk management system (Art. 9)"
    );
    requirements.push(
      "Data governance: ensure training, validation, and testing datasets are relevant, representative, and free from errors (Art. 10)"
    );
    requirements.push(
      "Draw up technical documentation before placing on market (Art. 11, Annex IV)"
    );
    requirements.push(
      "Implement automatic logging/record-keeping (Art. 12)"
    );
    requirements.push(
      "Design for transparency — provide clear instructions for use to deployers (Art. 13)"
    );
    requirements.push(
      "Enable effective human oversight of the system (Art. 14)"
    );
    requirements.push(
      "Achieve appropriate levels of accuracy, robustness, and cybersecurity (Art. 15)"
    );
    requirements.push(
      "Implement a quality management system (Art. 17)"
    );
    requirements.push(
      "Undergo conformity assessment before placing on market (Art. 43)"
    );
    requirements.push(
      "Register in the EU database for high-risk AI systems (Art. 49)"
    );
    requirements.push(
      "Affix CE marking (Art. 48)"
    );
    requirements.push(
      "Post-market monitoring system (Art. 72)"
    );
    requirements.push(
      "Report serious incidents to market surveillance authorities (Art. 73)"
    );

    if (annexCategory === "biometrics") {
      requirements.push(
        "Biometric systems require third-party conformity assessment (Art. 43(1))"
      );
    }

    // Deployer-side obligations
    requirements.push(
      "Deployers: conduct fundamental rights impact assessment for public-sector high-risk AI or certain private-sector uses (Art. 27)"
    );

    return {
      riskLevel: "high",
      confidence: Math.min(highRiskScore, 0.95),
      rationale,
      prohibitedPractices: [],
      applicableArticles: [...new Set(applicableArticles)],
      requirements,
      warnings,
      annexIIICategory: annexCategory,
    };
  }

  // -----------------------------------------------------------------
  // Step 4: Check limited risk (Article 50 — transparency obligations)
  // -----------------------------------------------------------------
  let limitedRiskScore = 0;

  if (input.isChatbot) {
    limitedRiskScore += 0.7;
    rationale.push(
      "System is a chatbot / conversational AI — Art. 50(1) requires disclosure that users are interacting with an AI system"
    );
    applicableArticles.push("Art. 50(1)");
    requirements.push(
      "Inform users that they are interacting with an AI system (Art. 50(1))"
    );
  }

  if (input.generatesDeepfakes) {
    limitedRiskScore += 0.7;
    rationale.push(
      "System generates or manipulates image/audio/video content — Art. 50(4) requires disclosure of AI-generated content"
    );
    applicableArticles.push("Art. 50(4)");
    requirements.push(
      "Disclose that content has been artificially generated or manipulated (Art. 50(4))"
    );
    requirements.push(
      "Mark AI-generated content in a machine-readable format (Art. 50(4))"
    );
  }

  if (input.interactsWithPersons && !input.isChatbot) {
    limitedRiskScore += 0.3;
  }

  // Keyword check
  const lowerText = fullText.toLowerCase();
  let limitedKeywordHits = 0;
  for (const kw of LIMITED_RISK_KEYWORDS) {
    if (lowerText.includes(kw)) {
      limitedKeywordHits++;
    }
  }
  if (limitedKeywordHits > 0) {
    limitedRiskScore += Math.min(limitedKeywordHits * 0.2, 0.5);
  }

  if (limitedRiskScore > 0.3) {
    if (applicableArticles.length === 0) {
      applicableArticles.push("Art. 50");
    }

    if (requirements.length === 0) {
      requirements.push(
        "Ensure transparency obligations under Art. 50 are met"
      );
    }

    // Generic transparency requirements
    if (input.interactsWithPersons) {
      requirements.push(
        "If the system detects emotions or categorises by biometric data, inform the exposed persons (Art. 50(3))"
      );
    }

    return {
      riskLevel: "limited",
      confidence: Math.min(limitedRiskScore, 0.9),
      rationale:
        rationale.length > 0
          ? rationale
          : [
              "System triggers transparency obligations under Article 50 based on keyword analysis",
            ],
      prohibitedPractices: [],
      applicableArticles: [...new Set(applicableArticles)],
      requirements,
      warnings,
    };
  }

  // -----------------------------------------------------------------
  // Step 5: Default — Minimal risk (Article 95)
  // -----------------------------------------------------------------
  rationale.push(
    "No prohibited practices, high-risk categories, GPAI indicators, or transparency obligations detected — classified as minimal risk"
  );
  applicableArticles.push("Art. 95");

  requirements.push(
    "No mandatory requirements — voluntary codes of conduct encouraged (Art. 95)"
  );

  if (input.processesPersonalData) {
    warnings.push(
      "While minimal risk under the AI Act, this system processes personal data and must still comply with GDPR"
    );
  }

  return {
    riskLevel: "minimal",
    confidence: Math.max(0.6, 1 - limitedRiskScore - highRiskScore),
    rationale,
    prohibitedPractices: [],
    applicableArticles: [...new Set(applicableArticles)],
    requirements,
    warnings,
  };
}
