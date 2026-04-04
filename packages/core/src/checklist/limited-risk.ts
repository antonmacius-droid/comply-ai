/**
 * Limited-risk AI system compliance checklist
 *
 * Based on EU AI Act Article 50 — Transparency obligations.
 */

import type { Checklist, ChecklistItem } from "./types.js";

const LIMITED_RISK_ITEMS: ChecklistItem[] = [
  // -----------------------------------------------------------------
  // Article 50(1) — AI systems interacting with natural persons
  // -----------------------------------------------------------------
  {
    id: "LR-TR-01",
    requirement: "Disclose AI interaction to users",
    article: "Art. 50(1)",
    description:
      "Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that the natural persons concerned are informed that they are interacting with an AI system, unless this is obvious from the circumstances and context of use. This obligation does not apply to AI systems authorised by law to detect, prevent, investigate, and prosecute criminal offences, subject to safeguards for third-party rights and freedoms.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec", "procedure"],
    category: "Transparency — AI Interaction",
  },
  {
    id: "LR-TR-02",
    requirement: "Ensure disclosure is clear and timely",
    article: "Art. 50(1)",
    description:
      "The information that a person is interacting with an AI system must be provided in a clear and distinguishable manner at the latest at the time of the first interaction or exposure.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Transparency — AI Interaction",
  },

  // -----------------------------------------------------------------
  // Article 50(2) — Emotion recognition / biometric categorisation
  // -----------------------------------------------------------------
  {
    id: "LR-TR-03",
    requirement: "Inform persons exposed to emotion recognition",
    article: "Art. 50(3)",
    description:
      "Users of an AI system that generates or manipulates text which is published with the purpose of informing the public on matters of public interest shall disclose that the content has been artificially generated or manipulated. This does not apply where the content is part of an evidently creative, satirical, or fictional work.",
    mandatory: true,
    evidenceTypes: ["document", "procedure"],
    category: "Transparency — Emotion Recognition",
  },
  {
    id: "LR-TR-04",
    requirement: "Inform persons exposed to biometric categorisation",
    article: "Art. 50(3)",
    description:
      "Deployers of emotion recognition or biometric categorisation systems shall inform the natural persons exposed thereto of the operation of the system and process personal data in compliance with GDPR, the Law Enforcement Directive, and applicable national law.",
    mandatory: true,
    evidenceTypes: ["document", "procedure", "policy"],
    category: "Transparency — Biometric Categorisation",
  },

  // -----------------------------------------------------------------
  // Article 50(4) — Deep fakes / synthetic content
  // -----------------------------------------------------------------
  {
    id: "LR-TR-05",
    requirement: "Label AI-generated or manipulated content (deep fakes)",
    article: "Art. 50(4)",
    description:
      "Deployers of AI systems that generate or manipulate image, audio, or video content constituting a deep fake shall disclose that the content has been artificially generated or manipulated. This does not apply to content that is part of an evidently artistic, creative, satirical, or fictional work, provided that authorship or editorial responsibility is attributed.",
    mandatory: true,
    evidenceTypes: ["technical_spec", "document"],
    category: "Transparency — Synthetic Content",
  },
  {
    id: "LR-TR-06",
    requirement: "Machine-readable marking of AI-generated content",
    article: "Art. 50(4)",
    description:
      "AI-generated or manipulated content shall be marked in a machine-readable format and be detectable as artificially generated or manipulated. Providers shall use state-of-the-art technical solutions, including watermarking, metadata identifications, cryptographic methods, or other suitable means.",
    mandatory: true,
    evidenceTypes: ["technical_spec", "test_result"],
    category: "Transparency — Synthetic Content",
  },

  // -----------------------------------------------------------------
  // Article 50(5) — AI-generated text on public interest matters
  // -----------------------------------------------------------------
  {
    id: "LR-TR-07",
    requirement: "Disclose AI-generated text published on matters of public interest",
    article: "Art. 50(5)",
    description:
      "Where AI-generated text is published with the purpose of informing the public on matters of public interest, the deployer shall disclose that the content has been artificially generated. Exception: content subject to human editorial review where a natural/legal person holds editorial responsibility.",
    mandatory: true,
    evidenceTypes: ["document", "procedure"],
    category: "Transparency — AI-Generated Text",
  },

  // -----------------------------------------------------------------
  // General best practices for limited-risk systems
  // -----------------------------------------------------------------
  {
    id: "LR-BP-01",
    requirement: "Provide accessible information about AI system capabilities and limitations",
    article: "Art. 50",
    description:
      "Even where not strictly mandatory, providing clear information about the AI system's capabilities, limitations, and intended purpose promotes trust and helps users make informed decisions. This is a recommended best practice.",
    mandatory: false,
    evidenceTypes: ["document"],
    category: "Best Practices",
  },
  {
    id: "LR-BP-02",
    requirement: "Implement user feedback mechanism",
    article: "Art. 50",
    description:
      "Implement a mechanism for users to report issues, provide feedback, or flag inaccuracies in the AI system's outputs. While not a strict Article 50 requirement, it supports the transparency goals of the regulation.",
    mandatory: false,
    evidenceTypes: ["technical_spec", "procedure"],
    category: "Best Practices",
  },
];

export function getLimitedRiskChecklist(): Checklist {
  return {
    title: "Limited-Risk AI System Compliance Checklist",
    description:
      "Checklist based on EU AI Act Article 50 transparency obligations for AI systems that interact with persons, perform emotion recognition or biometric categorisation, or generate synthetic content.",
    riskLevel: "limited",
    items: LIMITED_RISK_ITEMS,
  };
}

/**
 * Get only the mandatory transparency requirements.
 */
export function getMandatoryTransparencyItems(): ChecklistItem[] {
  return LIMITED_RISK_ITEMS.filter((item) => item.mandatory);
}
