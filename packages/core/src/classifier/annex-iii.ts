/**
 * Annex III — High-risk AI system areas
 *
 * Regulation (EU) 2024/1689, Annex III defines eight areas of high-risk
 * AI systems. Each area has numbered subcategories that trigger high-risk
 * classification under Article 6(2).
 */

import type { AnnexIIICategory } from "../types/eu-ai-act.js";

export interface AnnexIIISubcategory {
  id: string; // e.g. "III.1.a"
  description: string;
  examples: string[];
  keywords: string[];
}

export interface AnnexIIICategoryDefinition {
  category: AnnexIIICategory;
  title: string;
  annexReference: string;
  subcategories: AnnexIIISubcategory[];
}

/**
 * Complete Annex III definitions with subcategories matching the regulation.
 */
export const ANNEX_III_DEFINITIONS: AnnexIIICategoryDefinition[] = [
  // -------------------------------------------------------------------
  // 1. Biometrics (Annex III, point 1)
  // -------------------------------------------------------------------
  {
    category: "biometrics",
    title: "Biometrics",
    annexReference: "Annex III, point 1",
    subcategories: [
      {
        id: "III.1.a",
        description:
          "Remote biometric identification systems, excluding verification systems that confirm a person is who they claim to be",
        examples: [
          "Facial recognition for identification in public spaces",
          "Gait recognition systems",
          "Voice identification in crowds",
        ],
        keywords: [
          "biometric identification",
          "facial recognition",
          "face recognition",
          "gait recognition",
          "voice identification",
          "iris scanning",
          "fingerprint identification",
          "remote identification",
        ],
      },
      {
        id: "III.1.b",
        description:
          "Biometric categorisation systems that categorise natural persons based on biometric data to deduce race, political opinions, trade union membership, religious or philosophical beliefs, sex life, or sexual orientation (excluding lawful labelling or filtering of biometric datasets or law enforcement categorisation)",
        examples: [
          "Systems inferring ethnicity from facial features",
          "Systems classifying religious beliefs from appearance",
        ],
        keywords: [
          "biometric categorisation",
          "biometric classification",
          "demographic classification",
          "ethnicity detection",
          "race detection",
          "gender classification biometric",
        ],
      },
      {
        id: "III.1.c",
        description: "Emotion recognition systems",
        examples: [
          "Emotion detection in job interviews",
          "Sentiment analysis from facial expressions",
          "Stress detection systems",
        ],
        keywords: [
          "emotion recognition",
          "emotion detection",
          "sentiment analysis face",
          "facial expression analysis",
          "stress detection",
          "affect recognition",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // 2. Critical infrastructure (Annex III, point 2)
  // -------------------------------------------------------------------
  {
    category: "critical_infrastructure",
    title: "Management and operation of critical infrastructure",
    annexReference: "Annex III, point 2",
    subcategories: [
      {
        id: "III.2.a",
        description:
          "AI systems intended to be used as safety components in the management and operation of critical digital infrastructure, road traffic, or supply of water, gas, heating and electricity",
        examples: [
          "AI controlling power grid distribution",
          "Traffic management AI systems",
          "Water treatment plant AI control",
          "Gas pipeline monitoring AI",
          "Smart grid optimisation with safety-critical decisions",
        ],
        keywords: [
          "critical infrastructure",
          "power grid",
          "electricity",
          "water supply",
          "gas supply",
          "heating",
          "traffic management",
          "road traffic",
          "digital infrastructure",
          "safety component",
          "energy management",
          "utility management",
          "smart grid",
          "pipeline",
          "SCADA",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // 3. Education and vocational training (Annex III, point 3)
  // -------------------------------------------------------------------
  {
    category: "education",
    title: "Education and vocational training",
    annexReference: "Annex III, point 3",
    subcategories: [
      {
        id: "III.3.a",
        description:
          "AI systems intended to determine access to or admission to educational and vocational training institutions at all levels",
        examples: [
          "University admission screening",
          "School placement algorithms",
          "Scholarship selection AI",
        ],
        keywords: [
          "admission",
          "enrollment",
          "university admission",
          "school placement",
          "scholarship selection",
          "student selection",
          "educational access",
        ],
      },
      {
        id: "III.3.b",
        description:
          "AI systems intended to evaluate learning outcomes, including when used to steer the learning process",
        examples: [
          "Automated essay grading",
          "AI-based exam scoring",
          "Adaptive learning systems that determine progression",
        ],
        keywords: [
          "grading",
          "scoring",
          "exam evaluation",
          "essay grading",
          "learning assessment",
          "student evaluation",
          "academic performance",
          "learning outcome",
        ],
      },
      {
        id: "III.3.c",
        description:
          "AI systems intended to determine the appropriate level of education for an individual and influence their access to education",
        examples: [
          "AI systems assigning students to ability groups",
          "Systems determining special education placement",
        ],
        keywords: [
          "education level",
          "ability grouping",
          "student tracking",
          "educational pathway",
          "special education placement",
        ],
      },
      {
        id: "III.3.d",
        description:
          "AI systems intended to monitor and detect prohibited behaviour of students during tests",
        examples: [
          "AI proctoring systems",
          "Cheating detection during exams",
          "Online exam monitoring",
        ],
        keywords: [
          "proctoring",
          "exam monitoring",
          "cheating detection",
          "test monitoring",
          "exam surveillance",
          "academic integrity",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // 4. Employment, workers management (Annex III, point 4)
  // -------------------------------------------------------------------
  {
    category: "employment",
    title: "Employment, workers management, and access to self-employment",
    annexReference: "Annex III, point 4",
    subcategories: [
      {
        id: "III.4.a",
        description:
          "AI systems intended to be used for recruitment or selection of natural persons, in particular to place targeted job advertisements, to analyse and filter job applications, and to evaluate candidates",
        examples: [
          "CV/resume screening AI",
          "Automated candidate ranking",
          "AI job interview assessment",
          "Targeted job advertisement placement",
        ],
        keywords: [
          "recruitment",
          "hiring",
          "CV screening",
          "resume screening",
          "candidate evaluation",
          "candidate ranking",
          "job application",
          "talent acquisition",
          "applicant tracking",
          "interview assessment",
          "job advertisement targeting",
        ],
      },
      {
        id: "III.4.b",
        description:
          "AI systems intended to make or substantially influence decisions affecting terms of work-related relationships, promotion, and termination of work-related contractual relationships, to allocate tasks based on individual behaviour or personal traits, and to monitor and evaluate performance",
        examples: [
          "AI-based promotion decisions",
          "Automated performance evaluation",
          "Task allocation based on worker monitoring",
          "Termination recommendation systems",
          "Workforce productivity monitoring",
        ],
        keywords: [
          "performance evaluation",
          "promotion decision",
          "termination",
          "task allocation",
          "worker monitoring",
          "employee monitoring",
          "workforce management",
          "productivity monitoring",
          "performance review",
          "worker performance",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // 5. Access to essential private/public services (Annex III, point 5)
  // -------------------------------------------------------------------
  {
    category: "essential_services",
    title: "Access to and enjoyment of essential private services and essential public services and benefits",
    annexReference: "Annex III, point 5",
    subcategories: [
      {
        id: "III.5.a",
        description:
          "AI systems intended to evaluate the creditworthiness of natural persons or establish their credit score, excluding AI systems used for detecting financial fraud",
        examples: [
          "Credit scoring algorithms",
          "Loan approval AI",
          "Creditworthiness assessment",
          "Mortgage risk evaluation",
        ],
        keywords: [
          "credit score",
          "credit scoring",
          "creditworthiness",
          "loan approval",
          "lending decision",
          "mortgage",
          "credit assessment",
          "financial risk assessment",
          "credit rating",
        ],
      },
      {
        id: "III.5.b",
        description:
          "AI systems intended to evaluate eligibility for public assistance benefits and services, and to grant, reduce, revoke, or reclaim such benefits and services",
        examples: [
          "Welfare eligibility AI",
          "Social benefit allocation",
          "Public housing assignment",
        ],
        keywords: [
          "public assistance",
          "welfare",
          "social benefit",
          "public housing",
          "benefit eligibility",
          "social security",
          "unemployment benefit",
          "disability benefit",
        ],
      },
      {
        id: "III.5.c",
        description:
          "AI systems intended to evaluate and classify emergency calls, including for dispatching emergency services or prioritising patients in emergency healthcare triage",
        examples: [
          "Emergency call classification",
          "Patient triage AI",
          "Emergency dispatch optimisation",
        ],
        keywords: [
          "emergency call",
          "triage",
          "emergency dispatch",
          "911",
          "112",
          "patient priority",
          "emergency classification",
        ],
      },
      {
        id: "III.5.d",
        description:
          "AI systems intended to be used for risk assessment and pricing in relation to natural persons in the case of life and health insurance",
        examples: [
          "Health insurance risk scoring",
          "Life insurance pricing AI",
          "Insurance underwriting AI for health/life policies",
        ],
        keywords: [
          "health insurance",
          "life insurance",
          "insurance risk",
          "insurance pricing",
          "insurance underwriting",
          "actuarial",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // 6. Law enforcement (Annex III, point 6)
  // -------------------------------------------------------------------
  {
    category: "law_enforcement",
    title: "Law enforcement",
    annexReference: "Annex III, point 6",
    subcategories: [
      {
        id: "III.6.a",
        description:
          "AI systems intended to be used to assess the risk of a natural person becoming the victim of criminal offences",
        examples: ["Victim risk assessment tools", "Crime victim prediction"],
        keywords: [
          "victim risk",
          "crime victim",
          "victimisation risk",
          "victim prediction",
        ],
      },
      {
        id: "III.6.b",
        description:
          "AI systems intended to be used as polygraphs and similar tools",
        examples: [
          "AI lie detection",
          "Deception detection systems",
          "AI polygraph",
        ],
        keywords: [
          "polygraph",
          "lie detection",
          "deception detection",
          "truth verification",
        ],
      },
      {
        id: "III.6.c",
        description:
          "AI systems intended to evaluate the reliability of evidence in the course of investigation or prosecution of criminal offences",
        examples: [
          "Evidence reliability scoring",
          "Digital forensics AI",
          "Evidence analysis AI",
        ],
        keywords: [
          "evidence reliability",
          "evidence evaluation",
          "digital forensics",
          "criminal evidence",
          "forensic analysis",
        ],
      },
      {
        id: "III.6.d",
        description:
          "AI systems intended to assess the risk of a natural person for offending or re-offending, not based solely on profiling or on assessment of personality traits (excluding those supporting human assessment based on objective and verifiable facts directly linked to criminal activity)",
        examples: [
          "Recidivism prediction",
          "Criminal risk assessment",
          "Re-offending likelihood AI",
        ],
        keywords: [
          "recidivism",
          "re-offending",
          "criminal risk",
          "offending risk",
          "risk of re-offence",
        ],
      },
      {
        id: "III.6.e",
        description:
          "AI systems intended to be used for profiling of natural persons in the course of detection, investigation, or prosecution of criminal offences",
        examples: [
          "Criminal profiling AI",
          "Suspect profiling systems",
          "Behavioural profiling for law enforcement",
        ],
        keywords: [
          "criminal profiling",
          "suspect profiling",
          "offender profiling",
          "law enforcement profiling",
          "behavioural profiling",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // 7. Migration, asylum, border control (Annex III, point 7)
  // -------------------------------------------------------------------
  {
    category: "migration",
    title: "Migration, asylum, and border control management",
    annexReference: "Annex III, point 7",
    subcategories: [
      {
        id: "III.7.a",
        description:
          "AI systems intended to be used as polygraphs and similar tools or to detect the emotional state of a natural person at border crossings",
        examples: [
          "Border control lie detection",
          "Emotion detection at borders",
          "Traveller deception screening",
        ],
        keywords: [
          "border polygraph",
          "border lie detection",
          "border emotion",
          "traveller screening",
        ],
      },
      {
        id: "III.7.b",
        description:
          "AI systems intended to assess risks, including a security risk, a risk of irregular immigration, or a health risk, posed by a natural person who intends to enter or has entered the territory of a Member State",
        examples: [
          "Immigration risk assessment",
          "Border security risk scoring",
          "Health risk screening at borders",
        ],
        keywords: [
          "immigration risk",
          "border security",
          "border risk",
          "irregular immigration",
          "health risk border",
          "security screening",
        ],
      },
      {
        id: "III.7.c",
        description:
          "AI systems intended to assist competent public authorities for the examination of applications for asylum, visa, and residence permits and associated complaints with regard to the eligibility of applicants",
        examples: [
          "Asylum application processing AI",
          "Visa eligibility assessment",
          "Residence permit evaluation AI",
        ],
        keywords: [
          "asylum",
          "visa application",
          "residence permit",
          "asylum application",
          "immigration application",
          "refugee status",
        ],
      },
      {
        id: "III.7.d",
        description:
          "AI systems intended to be used for detecting, recognising, or identifying natural persons in the context of migration, asylum, and border control management, excluding verification of travel documents",
        examples: [
          "Migrant identification systems",
          "Border biometric identification",
          "Asylum seeker identification",
        ],
        keywords: [
          "migrant identification",
          "border identification",
          "asylum seeker identification",
          "border biometric",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // 8. Administration of justice and democratic processes (Annex III, point 8)
  // -------------------------------------------------------------------
  {
    category: "justice",
    title: "Administration of justice and democratic processes",
    annexReference: "Annex III, point 8",
    subcategories: [
      {
        id: "III.8.a",
        description:
          "AI systems intended to assist a judicial authority in researching and interpreting facts and the law and in applying the law to a concrete set of facts, or to be used in a similar way in alternative dispute resolution",
        examples: [
          "AI legal research tools influencing judicial decisions",
          "Sentencing recommendation AI",
          "Case outcome prediction for judges",
          "AI arbitration support",
        ],
        keywords: [
          "judicial",
          "sentencing",
          "legal research",
          "case outcome",
          "court decision",
          "dispute resolution",
          "arbitration",
          "judicial decision",
          "legal interpretation",
        ],
      },
      {
        id: "III.8.b",
        description:
          "AI systems intended to influence the outcome of an election or referendum or the voting behaviour of natural persons in the exercise of their vote in elections or referenda (excluding AI systems whose output does not directly interact with natural persons, such as tools used to organise, optimise and structure political campaigns from an administrative and logistic point of view)",
        examples: [
          "Political micro-targeting AI",
          "Voter behaviour manipulation systems",
          "Election outcome influence systems",
        ],
        keywords: [
          "election",
          "referendum",
          "voting",
          "political targeting",
          "voter influence",
          "election influence",
          "political campaign targeting",
        ],
      },
    ],
  },
];

/**
 * Look up the full definition for a given Annex III category.
 */
export function getAnnexIIIDefinition(
  category: AnnexIIICategory
): AnnexIIICategoryDefinition | undefined {
  return ANNEX_III_DEFINITIONS.find((d) => d.category === category);
}

/**
 * Keyword-based matching: given a text, find Annex III categories whose
 * keywords appear in the description.
 */
export function matchAnnexIIIByKeywords(
  text: string
): { category: AnnexIIICategory; matchedSubcategories: AnnexIIISubcategory[]; score: number }[] {
  const lower = text.toLowerCase();
  const results: {
    category: AnnexIIICategory;
    matchedSubcategories: AnnexIIISubcategory[];
    score: number;
  }[] = [];

  for (const def of ANNEX_III_DEFINITIONS) {
    const matchedSubcategories: AnnexIIISubcategory[] = [];
    let totalScore = 0;

    for (const sub of def.subcategories) {
      let subScore = 0;
      for (const kw of sub.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          subScore++;
        }
      }
      if (subScore > 0) {
        matchedSubcategories.push(sub);
        totalScore += subScore;
      }
    }

    if (matchedSubcategories.length > 0) {
      results.push({
        category: def.category,
        matchedSubcategories,
        score: totalScore,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results;
}
