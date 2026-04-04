/**
 * General-Purpose AI (GPAI) model compliance checklist
 *
 * Based on EU AI Act Articles 51-56 and Annex XI-XII.
 */

import type { Checklist, ChecklistItem } from "./types.js";

const GPAI_STANDARD_ITEMS: ChecklistItem[] = [
  // -----------------------------------------------------------------
  // Article 53 — Obligations for providers of GPAI models
  // -----------------------------------------------------------------
  {
    id: "GPAI-TD-01",
    requirement: "Draw up and maintain technical documentation",
    article: "Art. 53(1)(a), Annex XI",
    description:
      "Draw up and keep up-to-date the technical documentation of the model, including its training and testing process and the results of its evaluation, which shall contain at a minimum the information set out in Annex XI. This documentation shall be made available to the AI Office and national competent authorities upon request.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Technical Documentation",
  },
  {
    id: "GPAI-TD-02",
    requirement: "Document model architecture and training methodology",
    article: "Annex XI, point 1",
    description:
      "Technical documentation must include: a general description of the GPAI model, the architecture and number of parameters, information about the data used for training (sources, scope, main characteristics, curation methodology), computational resources used, and training methodology.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Technical Documentation",
  },
  {
    id: "GPAI-TD-03",
    requirement: "Document model capabilities and limitations",
    article: "Annex XI, point 2",
    description:
      "Provide a detailed description of the capabilities and limitations of the GPAI model, including foreseeable risks and measures taken to address them.",
    mandatory: true,
    evidenceTypes: ["document", "test_result"],
    category: "Technical Documentation",
  },

  // -----------------------------------------------------------------
  // Article 53(1)(b) — Information for downstream providers
  // -----------------------------------------------------------------
  {
    id: "GPAI-DS-01",
    requirement: "Provide information to downstream providers",
    article: "Art. 53(1)(b), Annex XII",
    description:
      "Draw up and keep up-to-date information and documentation for downstream providers that integrate the GPAI model into their AI systems. The information shall enable downstream providers to understand the model's capabilities and limitations and to comply with their own obligations under the AI Act.",
    mandatory: true,
    evidenceTypes: ["document"],
    category: "Downstream Provider Support",
  },
  {
    id: "GPAI-DS-02",
    requirement: "Provide integration guidance and limitations notice",
    article: "Annex XII",
    description:
      "Documentation for downstream providers must include: intended and reasonably foreseeable uses of the model, the modalities and conditions under which it can be used, capabilities and limitations, modifications made post-training, and performance evaluation results.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Downstream Provider Support",
  },

  // -----------------------------------------------------------------
  // Article 53(1)(c) — Copyright compliance
  // -----------------------------------------------------------------
  {
    id: "GPAI-CR-01",
    requirement: "Put in place a copyright compliance policy",
    article: "Art. 53(1)(c)",
    description:
      "Put in place a policy to comply with Union law on copyright and related rights, in particular to identify and comply with reservations of rights expressed pursuant to Article 4(3) of Directive (EU) 2019/790 (the DSM Directive), including through state-of-the-art technologies.",
    mandatory: true,
    evidenceTypes: ["policy", "document", "procedure"],
    category: "Copyright Compliance",
  },
  {
    id: "GPAI-CR-02",
    requirement: "Respect opt-out mechanisms for text and data mining",
    article: "Art. 53(1)(c)",
    description:
      "Implement mechanisms to identify and respect rights reservations (opt-outs) expressed by rights holders under Article 4(3) of the DSM Directive for text and data mining purposes.",
    mandatory: true,
    evidenceTypes: ["technical_spec", "procedure"],
    category: "Copyright Compliance",
  },

  // -----------------------------------------------------------------
  // Article 53(1)(d) — Training data summary
  // -----------------------------------------------------------------
  {
    id: "GPAI-TS-01",
    requirement: "Publish a sufficiently detailed summary of training data",
    article: "Art. 53(1)(d)",
    description:
      "Draw up and make publicly available a sufficiently detailed summary about the content used for training the GPAI model, according to a template provided by the AI Office. The summary must be generally comprehensive in its scope. The AI Office may provide a template for this purpose.",
    mandatory: true,
    evidenceTypes: ["document"],
    category: "Training Data Transparency",
  },

  // -----------------------------------------------------------------
  // Article 54 — Authorised representatives
  // -----------------------------------------------------------------
  {
    id: "GPAI-REP-01",
    requirement: "Appoint an authorised representative (non-EU providers)",
    article: "Art. 54",
    description:
      "Providers of GPAI models established in third countries shall, prior to making the model available on the Union market, by written mandate appoint an authorised representative established in the Union.",
    mandatory: true,
    evidenceTypes: ["document"],
    category: "Representation",
  },
];

const GPAI_SYSTEMIC_RISK_ITEMS: ChecklistItem[] = [
  // -----------------------------------------------------------------
  // Article 55 — Additional obligations for systemic risk GPAI
  // -----------------------------------------------------------------
  {
    id: "GPAI-SR-01",
    requirement: "Perform model evaluation including adversarial testing",
    article: "Art. 55(1)(a)",
    description:
      "Perform model evaluation in accordance with standardised protocols and tools reflecting the state of the art, including conducting and documenting adversarial testing of the model with a view to identifying and mitigating systemic risks.",
    mandatory: true,
    evidenceTypes: ["test_result", "document", "third_party_audit"],
    category: "Systemic Risk — Evaluation",
  },
  {
    id: "GPAI-SR-02",
    requirement: "Assess and mitigate possible systemic risks",
    article: "Art. 55(1)(b)",
    description:
      "Assess and mitigate possible systemic risks, including their sources, that may stem from the development, the placing on the market, or the use of GPAI models with systemic risk.",
    mandatory: true,
    evidenceTypes: ["document", "test_result", "procedure"],
    category: "Systemic Risk — Mitigation",
  },
  {
    id: "GPAI-SR-03",
    requirement: "Track, document, and report serious incidents",
    article: "Art. 55(1)(c)",
    description:
      "Keep track of, document, and report without undue delay to the AI Office and, as appropriate, to national competent authorities, relevant information about serious incidents and possible corrective measures to address them.",
    mandatory: true,
    evidenceTypes: ["procedure", "document", "monitoring_report"],
    category: "Systemic Risk — Incident Reporting",
  },
  {
    id: "GPAI-SR-04",
    requirement: "Ensure adequate level of cybersecurity protection",
    article: "Art. 55(1)(d)",
    description:
      "Ensure an adequate level of cybersecurity protection for the GPAI model with systemic risk and the physical infrastructure of the model.",
    mandatory: true,
    evidenceTypes: ["technical_spec", "third_party_audit", "test_result"],
    category: "Systemic Risk — Cybersecurity",
  },
];

export function getGPAIChecklist(includeSystemicRisk: boolean = false): Checklist {
  const items = includeSystemicRisk
    ? [...GPAI_STANDARD_ITEMS, ...GPAI_SYSTEMIC_RISK_ITEMS]
    : [...GPAI_STANDARD_ITEMS];

  return {
    title: includeSystemicRisk
      ? "GPAI Model with Systemic Risk — Compliance Checklist"
      : "General-Purpose AI Model — Compliance Checklist",
    description: includeSystemicRisk
      ? "Full checklist for GPAI models with systemic risk under EU AI Act Articles 51-56. Includes all standard GPAI obligations plus additional requirements for models exceeding the systemic risk threshold (10^25 FLOPs)."
      : "Checklist for general-purpose AI models under EU AI Act Articles 51-56. Covers technical documentation, downstream provider information, copyright compliance, and training data transparency.",
    riskLevel: "gpai",
    items,
  };
}

/**
 * Get only the systemic risk additional items.
 */
export function getSystemicRiskItems(): ChecklistItem[] {
  return [...GPAI_SYSTEMIC_RISK_ITEMS];
}
