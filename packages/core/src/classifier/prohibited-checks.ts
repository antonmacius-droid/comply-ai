/**
 * Article 5 — Prohibited AI Practices
 *
 * Regulation (EU) 2024/1689, Article 5 defines eight categories of
 * AI practices that are outright banned in the EU.
 */

import type { ProhibitedPractice } from "../types/eu-ai-act.js";

export interface ProhibitedCheckInput {
  description: string;
  purpose: string;

  /** Does the system assign scores to people based on social behaviour? */
  performsSocialScoring?: boolean;

  /** Does the system target children, elderly, or disabled persons? */
  targetsVulnerableGroups?: boolean;

  /** Does the system use techniques below the threshold of consciousness? */
  usesSubliminalTechniques?: boolean;

  /** Does the system categorise people by biometric data to infer sensitive attributes? */
  categorisesBySensitiveBiometrics?: boolean;

  /** Does the system build/expand facial recognition databases via untargeted scraping? */
  scrapesFacialImages?: boolean;

  /** Does the system infer emotions in workplace or education settings? */
  infersEmotionsAtWork?: boolean;

  /** Does the system perform real-time remote biometric identification in public spaces? */
  usesRealTimeBiometricId?: boolean;

  /** Does the system predict criminal offences based solely on profiling? */
  predictsCrimeBySoleProfiling?: boolean;

  /** Is the system deployed by law enforcement with proper judicial authorisation? */
  hasLawEnforcementExemption?: boolean;
}

export interface ProhibitedCheckResult {
  isProhibited: boolean;
  practices: DetectedProhibitedPractice[];
}

export interface DetectedProhibitedPractice {
  practice: ProhibitedPractice;
  article: string;
  description: string;
  confidence: number; // 0-1
  reason: string;
}

// ---------------------------------------------------------------------------
// Keyword sets for text-based detection
// ---------------------------------------------------------------------------

const SOCIAL_SCORING_KEYWORDS = [
  "social scoring",
  "social credit",
  "citizen score",
  "behaviour score",
  "social rating",
  "trustworthiness score based on social",
  "social behaviour scoring",
];

const SUBLIMINAL_KEYWORDS = [
  "subliminal",
  "below consciousness",
  "subconscious manipulation",
  "manipulative technique",
  "covert manipulation",
  "dark pattern",
];

const VULNERABLE_EXPLOITATION_KEYWORDS = [
  "exploit vulnerable",
  "exploit children",
  "exploit elderly",
  "exploit disabled",
  "exploit mental",
  "targeting vulnerable",
  "manipulate children",
  "manipulate elderly",
];

const BIOMETRIC_CATEGORIZATION_KEYWORDS = [
  "biometric categorisation",
  "biometric categorization",
  "categorise by race",
  "categorize by race",
  "infer religion from biometric",
  "infer political from biometric",
  "infer sexual orientation from biometric",
  "sensitive attribute biometric",
];

const FACIAL_SCRAPING_KEYWORDS = [
  "scraping facial",
  "scrape faces",
  "untargeted scraping",
  "facial recognition database building",
  "mass facial image collection",
  "internet scraping face",
  "cctv scraping face",
];

const EMOTION_WORKPLACE_KEYWORDS = [
  "emotion recognition workplace",
  "emotion detection employee",
  "emotion inference work",
  "emotion recognition school",
  "emotion detection student",
  "emotion inference education",
  "workplace emotion",
  "employee emotion",
];

const REALTIME_BIOMETRIC_KEYWORDS = [
  "real-time biometric identification",
  "real time biometric identification",
  "live facial recognition public",
  "real-time remote biometric",
  "live biometric public space",
  "realtime biometric",
];

const PREDICTIVE_POLICING_KEYWORDS = [
  "predictive policing",
  "predict crime profiling",
  "predict criminal sole profiling",
  "individual risk profiling crime",
  "predict offend based on profiling",
  "crime prediction profiling",
];

// ---------------------------------------------------------------------------
// Detection logic
// ---------------------------------------------------------------------------

function textMatchScore(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      matches++;
    }
  }
  return Math.min(matches / Math.max(keywords.length * 0.3, 1), 1);
}

/**
 * Check if an AI system description matches any prohibited practices.
 *
 * Uses both explicit boolean flags and keyword analysis on the text.
 */
export function checkProhibitedPractices(
  input: ProhibitedCheckInput
): ProhibitedCheckResult {
  const practices: DetectedProhibitedPractice[] = [];
  const fullText = `${input.description} ${input.purpose}`;

  // 1. Social scoring (Art. 5(1)(c))
  const socialScoringScore = input.performsSocialScoring
    ? 1.0
    : textMatchScore(fullText, SOCIAL_SCORING_KEYWORDS);
  if (socialScoringScore > 0.2) {
    practices.push({
      practice: "social_scoring",
      article: "Art. 5(1)(c)",
      description:
        "AI systems used by public authorities or on their behalf for social scoring — evaluating or classifying natural persons based on their social behaviour or personal characteristics, leading to detrimental treatment unrelated to or disproportionate to the original context",
      confidence: socialScoringScore,
      reason: input.performsSocialScoring
        ? "System explicitly performs social scoring"
        : "Description contains social scoring indicators",
    });
  }

  // 2. Exploitation of vulnerable groups (Art. 5(1)(b))
  const vulnerableScore =
    input.targetsVulnerableGroups && input.usesSubliminalTechniques
      ? 1.0
      : input.targetsVulnerableGroups
        ? 0.7
        : textMatchScore(fullText, VULNERABLE_EXPLOITATION_KEYWORDS);
  if (vulnerableScore > 0.2) {
    practices.push({
      practice: "exploitation_vulnerable",
      article: "Art. 5(1)(b)",
      description:
        "AI systems that exploit vulnerabilities of a specific group of persons due to their age, disability, or a specific social or economic situation, with the objective or effect of materially distorting behaviour in a manner that causes significant harm",
      confidence: vulnerableScore,
      reason: input.targetsVulnerableGroups
        ? "System targets vulnerable groups"
        : "Description indicates potential exploitation of vulnerable persons",
    });
  }

  // 3. Subliminal manipulation (Art. 5(1)(a))
  const subliminalScore = input.usesSubliminalTechniques
    ? 1.0
    : textMatchScore(fullText, SUBLIMINAL_KEYWORDS);
  if (subliminalScore > 0.2) {
    practices.push({
      practice: "subliminal_manipulation",
      article: "Art. 5(1)(a)",
      description:
        "AI systems that deploy subliminal techniques beyond a person's consciousness or purposefully manipulative or deceptive techniques, with the objective or effect of materially distorting behaviour, causing significant harm",
      confidence: subliminalScore,
      reason: input.usesSubliminalTechniques
        ? "System uses subliminal techniques"
        : "Description contains subliminal/manipulative technique indicators",
    });
  }

  // 4. Biometric categorisation of sensitive attributes (Art. 5(1)(g))
  const bioCatScore = input.categorisesBySensitiveBiometrics
    ? 1.0
    : textMatchScore(fullText, BIOMETRIC_CATEGORIZATION_KEYWORDS);
  if (bioCatScore > 0.2) {
    practices.push({
      practice: "biometric_categorization_sensitive",
      article: "Art. 5(1)(g)",
      description:
        "AI systems that categorise natural persons based on biometric data to deduce or infer their race, political opinions, trade union membership, religious or philosophical beliefs, sex life, or sexual orientation (excluding lawful use in law enforcement)",
      confidence: bioCatScore,
      reason: input.categorisesBySensitiveBiometrics
        ? "System categorises people by sensitive biometric attributes"
        : "Description indicates biometric categorisation of sensitive attributes",
    });
  }

  // 5. Untargeted scraping for facial recognition (Art. 5(1)(e))
  const scrapingScore = input.scrapesFacialImages
    ? 1.0
    : textMatchScore(fullText, FACIAL_SCRAPING_KEYWORDS);
  if (scrapingScore > 0.2) {
    practices.push({
      practice: "facial_recognition_scraping",
      article: "Art. 5(1)(e)",
      description:
        "AI systems that create or expand facial recognition databases through untargeted scraping of facial images from the internet or CCTV footage",
      confidence: scrapingScore,
      reason: input.scrapesFacialImages
        ? "System scrapes facial images to build recognition databases"
        : "Description indicates untargeted facial image scraping",
    });
  }

  // 6. Emotion inference in workplace/education (Art. 5(1)(f))
  const emotionWorkScore = input.infersEmotionsAtWork
    ? 1.0
    : textMatchScore(fullText, EMOTION_WORKPLACE_KEYWORDS);
  if (emotionWorkScore > 0.2) {
    practices.push({
      practice: "emotion_inference_workplace",
      article: "Art. 5(1)(f)",
      description:
        "AI systems that infer emotions of natural persons in the areas of workplace and education institutions, except where the AI system is intended to be used for medical or safety reasons",
      confidence: emotionWorkScore,
      reason: input.infersEmotionsAtWork
        ? "System infers emotions in workplace or education"
        : "Description indicates emotion inference in workplace/education",
    });
  }

  // 7. Real-time remote biometric identification in public spaces (Art. 5(1)(h))
  if (!input.hasLawEnforcementExemption) {
    const realtimeBioScore = input.usesRealTimeBiometricId
      ? 1.0
      : textMatchScore(fullText, REALTIME_BIOMETRIC_KEYWORDS);
    if (realtimeBioScore > 0.2) {
      practices.push({
        practice: "real_time_biometric_identification",
        article: "Art. 5(1)(h)",
        description:
          "Use of real-time remote biometric identification systems in publicly accessible spaces for law enforcement purposes, except for narrowly defined exceptions (searching for victims, preventing specific imminent threats, locating suspects of specific serious crimes)",
        confidence: realtimeBioScore,
        reason: input.usesRealTimeBiometricId
          ? "System uses real-time biometric identification in public spaces"
          : "Description indicates real-time biometric identification in public spaces",
      });
    }
  }

  // 8. Predictive policing by sole profiling (Art. 5(1)(d))
  const predictiveScore = input.predictsCrimeBySoleProfiling
    ? 1.0
    : textMatchScore(fullText, PREDICTIVE_POLICING_KEYWORDS);
  if (predictiveScore > 0.2) {
    practices.push({
      practice: "predictive_policing",
      article: "Art. 5(1)(d)",
      description:
        "AI systems for making risk assessments of natural persons to assess or predict the risk of a natural person committing a criminal offence, based solely on the profiling of a natural person or on assessing their personality traits and characteristics",
      confidence: predictiveScore,
      reason: input.predictsCrimeBySoleProfiling
        ? "System predicts criminal behaviour based solely on profiling"
        : "Description indicates predictive policing by profiling",
    });
  }

  return {
    isProhibited: practices.length > 0,
    practices,
  };
}
