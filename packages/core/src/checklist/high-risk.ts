/**
 * High-risk AI system compliance checklist
 *
 * Based on EU AI Act Articles 8-15 (requirements for providers)
 * and Articles 16-29 (provider & deployer obligations).
 */

import type { Checklist, ChecklistItem } from "./types.js";

const HIGH_RISK_ITEMS: ChecklistItem[] = [
  // -----------------------------------------------------------------
  // Risk Management System (Article 9)
  // -----------------------------------------------------------------
  {
    id: "HR-RMS-01",
    requirement: "Establish a risk management system",
    article: "Art. 9(1)",
    description:
      "Establish, implement, document, and maintain a risk management system consisting of a continuous iterative process planned and run throughout the entire lifecycle of the high-risk AI system.",
    mandatory: true,
    evidenceTypes: ["document", "policy", "procedure"],
    category: "Risk Management",
  },
  {
    id: "HR-RMS-02",
    requirement: "Identify and analyse known and foreseeable risks",
    article: "Art. 9(2)(a)",
    description:
      "Identify and analyse the known and reasonably foreseeable risks that the high-risk AI system can pose to health, safety, or fundamental rights when used in accordance with its intended purpose.",
    mandatory: true,
    evidenceTypes: ["document", "test_result"],
    category: "Risk Management",
  },
  {
    id: "HR-RMS-03",
    requirement: "Estimate and evaluate risks from misuse",
    article: "Art. 9(2)(b)",
    description:
      "Estimate and evaluate the risks that may emerge when the system is used in accordance with its intended purpose and under conditions of reasonably foreseeable misuse.",
    mandatory: true,
    evidenceTypes: ["document", "test_result"],
    category: "Risk Management",
  },
  {
    id: "HR-RMS-04",
    requirement: "Evaluate risks from post-market monitoring",
    article: "Art. 9(2)(c)",
    description:
      "Evaluate other risks possibly arising, based on the analysis of data gathered from the post-market monitoring system.",
    mandatory: true,
    evidenceTypes: ["monitoring_report", "document"],
    category: "Risk Management",
  },
  {
    id: "HR-RMS-05",
    requirement: "Adopt suitable risk management measures",
    article: "Art. 9(2)(d)",
    description:
      "Adopt appropriate and targeted risk management measures designed to address identified risks, giving due consideration to the effects and possible interactions resulting from combined application of the requirements.",
    mandatory: true,
    evidenceTypes: ["document", "procedure", "test_result"],
    category: "Risk Management",
  },
  {
    id: "HR-RMS-06",
    requirement: "Test to identify appropriate risk management measures",
    article: "Art. 9(7)",
    description:
      "Testing shall be performed at appropriate points during the development process and in any event prior to placing on the market or putting into service.",
    mandatory: true,
    evidenceTypes: ["test_result", "document"],
    category: "Risk Management",
  },

  // -----------------------------------------------------------------
  // Data Governance (Article 10)
  // -----------------------------------------------------------------
  {
    id: "HR-DG-01",
    requirement: "Implement data governance practices for training data",
    article: "Art. 10(2)",
    description:
      "Training, validation, and testing datasets shall be subject to data governance and management practices covering: design choices, data collection processes, relevant data preparation (annotation, labelling, cleaning, enrichment, aggregation), formulation of assumptions, prior assessment of data availability/quantity/suitability, examination of possible biases, identification of data gaps, and appropriate measures to address them.",
    mandatory: true,
    evidenceTypes: ["document", "policy", "procedure"],
    category: "Data Governance",
  },
  {
    id: "HR-DG-02",
    requirement: "Ensure datasets are relevant, representative, and error-free",
    article: "Art. 10(3)",
    description:
      "Training, validation, and testing datasets shall be relevant, sufficiently representative, and to the best extent possible, free of errors and complete in view of the intended purpose.",
    mandatory: true,
    evidenceTypes: ["test_result", "document", "technical_spec"],
    category: "Data Governance",
  },
  {
    id: "HR-DG-03",
    requirement: "Consider statistical properties appropriate to the context",
    article: "Art. 10(3)",
    description:
      "Datasets shall have the appropriate statistical properties, including as regards the persons or groups of persons in relation to whom the system is intended to be used.",
    mandatory: true,
    evidenceTypes: ["test_result", "document"],
    category: "Data Governance",
  },
  {
    id: "HR-DG-04",
    requirement: "Examine datasets for possible biases",
    article: "Art. 10(2)(f)",
    description:
      "Examine training, validation, and testing datasets for possible biases that are likely to affect the health and safety of persons, have a negative impact on fundamental rights, or lead to discrimination.",
    mandatory: true,
    evidenceTypes: ["test_result", "document", "audit_log"],
    category: "Data Governance",
  },

  // -----------------------------------------------------------------
  // Technical Documentation (Article 11)
  // -----------------------------------------------------------------
  {
    id: "HR-TD-01",
    requirement: "Draw up technical documentation",
    article: "Art. 11(1)",
    description:
      "Technical documentation shall be drawn up before the system is placed on the market or put into service and shall be kept up to date. It shall contain at minimum all information set out in Annex IV.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Technical Documentation",
  },
  {
    id: "HR-TD-02",
    requirement: "Include general description of the AI system",
    article: "Annex IV, point 1",
    description:
      "Technical documentation must include: intended purpose, provider name/contact, version, how the system interacts with hardware/software, applicable EU legislation, and a description of the overall system architecture.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Technical Documentation",
  },
  {
    id: "HR-TD-03",
    requirement: "Document the development process",
    article: "Annex IV, point 2",
    description:
      "Document the design specifications, architecture, algorithms used, data requirements, training methodologies, computational resources used, and the key design choices including rationale.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Technical Documentation",
  },

  // -----------------------------------------------------------------
  // Record-Keeping / Logging (Article 12)
  // -----------------------------------------------------------------
  {
    id: "HR-LOG-01",
    requirement: "Design system with automatic logging capability",
    article: "Art. 12(1)",
    description:
      "High-risk AI systems shall technically allow for the automatic recording of events (logs) over the lifetime of the system. Logging capabilities shall conform to recognised standards or common specifications.",
    mandatory: true,
    evidenceTypes: ["technical_spec", "audit_log"],
    category: "Logging & Record-Keeping",
  },
  {
    id: "HR-LOG-02",
    requirement: "Ensure logs enable monitoring of system operation",
    article: "Art. 12(2)",
    description:
      "Logging shall enable monitoring of the operation of the high-risk AI system with respect to the occurrence of situations that may result in the system presenting a risk, or a substantial modification, and facilitate post-market monitoring.",
    mandatory: true,
    evidenceTypes: ["technical_spec", "audit_log", "monitoring_report"],
    category: "Logging & Record-Keeping",
  },
  {
    id: "HR-LOG-03",
    requirement: "Log relevant data for traceability",
    article: "Art. 12(3)",
    description:
      "At minimum, logging shall include: period of each use, reference database used, input data, identification of natural persons involved in verification of results.",
    mandatory: true,
    evidenceTypes: ["audit_log", "technical_spec"],
    category: "Logging & Record-Keeping",
  },

  // -----------------------------------------------------------------
  // Transparency & Instructions for Use (Article 13)
  // -----------------------------------------------------------------
  {
    id: "HR-TR-01",
    requirement: "Ensure transparency of operation for deployers",
    article: "Art. 13(1)",
    description:
      "High-risk AI systems shall be designed and developed in such a way as to ensure that their operation is sufficiently transparent to enable deployers to interpret the system's output and use it appropriately.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec"],
    category: "Transparency",
  },
  {
    id: "HR-TR-02",
    requirement: "Provide instructions for use",
    article: "Art. 13(3)",
    description:
      "Instructions for use shall include: provider identity and contact, system characteristics/capabilities/limitations, intended purpose, performance metrics, known/foreseeable circumstances of misuse, installation/use instructions, human oversight measures, expected lifetime, and maintenance/care instructions.",
    mandatory: true,
    evidenceTypes: ["document"],
    category: "Transparency",
  },

  // -----------------------------------------------------------------
  // Human Oversight (Article 14)
  // -----------------------------------------------------------------
  {
    id: "HR-HO-01",
    requirement: "Design for effective human oversight",
    article: "Art. 14(1)",
    description:
      "High-risk AI systems shall be designed and developed in such a way that they can be effectively overseen by natural persons during the period in which they are in use.",
    mandatory: true,
    evidenceTypes: ["document", "technical_spec", "procedure"],
    category: "Human Oversight",
  },
  {
    id: "HR-HO-02",
    requirement: "Enable human override or intervention",
    article: "Art. 14(4)(d)",
    description:
      "Persons assigned to human oversight must be able to decide not to use the system, disregard/override/reverse its output, and intervene in or interrupt the system (e.g., via a 'stop' button).",
    mandatory: true,
    evidenceTypes: ["technical_spec", "procedure", "test_result"],
    category: "Human Oversight",
  },
  {
    id: "HR-HO-03",
    requirement: "Prevent automation bias",
    article: "Art. 14(4)(b)",
    description:
      "Measures shall be taken to ensure that persons assigned to human oversight remain aware of the possible tendency of automatically relying on or over-relying on the output produced by a high-risk AI system (automation bias).",
    mandatory: true,
    evidenceTypes: ["procedure", "training_record"],
    category: "Human Oversight",
  },

  // -----------------------------------------------------------------
  // Accuracy, Robustness & Cybersecurity (Article 15)
  // -----------------------------------------------------------------
  {
    id: "HR-ARC-01",
    requirement: "Achieve appropriate levels of accuracy",
    article: "Art. 15(1)",
    description:
      "High-risk AI systems shall be designed and developed to achieve an appropriate level of accuracy, robustness, and cybersecurity, and perform consistently in those respects throughout their lifecycle.",
    mandatory: true,
    evidenceTypes: ["test_result", "technical_spec"],
    category: "Accuracy, Robustness & Cybersecurity",
  },
  {
    id: "HR-ARC-02",
    requirement: "Declare accuracy metrics",
    article: "Art. 15(2)",
    description:
      "The levels of accuracy and the relevant accuracy metrics shall be declared in the accompanying instructions of use.",
    mandatory: true,
    evidenceTypes: ["document", "test_result"],
    category: "Accuracy, Robustness & Cybersecurity",
  },
  {
    id: "HR-ARC-03",
    requirement: "Implement technical redundancy / fail-safe",
    article: "Art. 15(4)",
    description:
      "High-risk AI systems shall be resilient against attempts by unauthorised third parties to alter their use, outputs, or performance. Solutions shall include technical redundancy, including backup or fail-safe plans.",
    mandatory: true,
    evidenceTypes: ["technical_spec", "test_result"],
    category: "Accuracy, Robustness & Cybersecurity",
  },
  {
    id: "HR-ARC-04",
    requirement: "Address cybersecurity vulnerabilities",
    article: "Art. 15(5)",
    description:
      "High-risk AI systems shall be resilient as regards attempts by unauthorised third parties to exploit system vulnerabilities — including data poisoning, adversarial examples, model flipping, confidentiality attacks, or model inversion.",
    mandatory: true,
    evidenceTypes: ["test_result", "technical_spec", "third_party_audit"],
    category: "Accuracy, Robustness & Cybersecurity",
  },

  // -----------------------------------------------------------------
  // Provider Obligations (Articles 16-17, 26)
  // -----------------------------------------------------------------
  {
    id: "HR-PO-01",
    requirement: "Implement a quality management system",
    article: "Art. 17",
    description:
      "Providers shall put in place a quality management system that ensures compliance with the regulation, in a systematic and orderly manner. The QMS shall be documented with policies, procedures, and instructions including: regulatory compliance strategy, design/development procedures, testing/validation/verification procedures, technical specifications and standards, data management systems, the risk management system, post-market monitoring, incident and malfunction reporting, communication with authorities, record-keeping, resource management, and an accountability framework.",
    mandatory: true,
    evidenceTypes: ["document", "policy", "procedure", "certification"],
    category: "Provider Obligations",
  },
  {
    id: "HR-PO-02",
    requirement: "Undergo conformity assessment",
    article: "Art. 43",
    description:
      "Before placing a high-risk AI system on the market, the provider shall subject it to a conformity assessment procedure. For biometric systems: third-party assessment by a notified body. For other Annex III systems: internal control procedure (Annex VI) unless the provider cannot demonstrate conformity to harmonised standards.",
    mandatory: true,
    evidenceTypes: ["certification", "third_party_audit", "document"],
    category: "Provider Obligations",
  },
  {
    id: "HR-PO-03",
    requirement: "Draw up EU declaration of conformity",
    article: "Art. 47",
    description:
      "The provider shall draw up a written EU declaration of conformity for each high-risk AI system and keep it at the disposal of national competent authorities for 10 years after the system has been placed on the market.",
    mandatory: true,
    evidenceTypes: ["document", "certification"],
    category: "Provider Obligations",
  },
  {
    id: "HR-PO-04",
    requirement: "Affix CE marking",
    article: "Art. 48",
    description:
      "The CE marking shall be affixed to the high-risk AI system or, where not possible, on its packaging or accompanying documentation. The marking shall be visible, legible, and indelible.",
    mandatory: true,
    evidenceTypes: ["document"],
    category: "Provider Obligations",
  },
  {
    id: "HR-PO-05",
    requirement: "Register in the EU database",
    article: "Art. 49",
    description:
      "Before placing a high-risk AI system on the market or putting it into service, the provider shall register the system in the EU database referred to in Article 71.",
    mandatory: true,
    evidenceTypes: ["document"],
    category: "Provider Obligations",
  },
  {
    id: "HR-PO-06",
    requirement: "Establish post-market monitoring system",
    article: "Art. 72",
    description:
      "Providers shall establish and document a post-market monitoring system. The system shall actively and systematically collect, document, and analyse relevant data on the performance of the system throughout its lifetime.",
    mandatory: true,
    evidenceTypes: ["document", "procedure", "monitoring_report"],
    category: "Provider Obligations",
  },
  {
    id: "HR-PO-07",
    requirement: "Report serious incidents",
    article: "Art. 73",
    description:
      "Providers of high-risk AI systems placed on the EU market shall report any serious incident to the market surveillance authorities of the Member State(s) where the incident occurred, immediately after the provider has established a causal link, and no later than 15 days.",
    mandatory: true,
    evidenceTypes: ["document", "procedure"],
    category: "Provider Obligations",
  },

  // -----------------------------------------------------------------
  // Deployer Obligations (Article 26-27)
  // -----------------------------------------------------------------
  {
    id: "HR-DO-01",
    requirement: "Use system in accordance with instructions",
    article: "Art. 26(1)",
    description:
      "Deployers shall use high-risk AI systems in accordance with the instructions of use accompanying the systems.",
    mandatory: true,
    evidenceTypes: ["procedure", "training_record"],
    category: "Deployer Obligations",
  },
  {
    id: "HR-DO-02",
    requirement: "Ensure human oversight by trained individuals",
    article: "Art. 26(2)",
    description:
      "Deployers shall assign human oversight to natural persons who have the necessary competence, training, and authority, and the necessary support.",
    mandatory: true,
    evidenceTypes: ["training_record", "procedure"],
    category: "Deployer Obligations",
  },
  {
    id: "HR-DO-03",
    requirement: "Monitor system operation based on instructions",
    article: "Art. 26(5)",
    description:
      "Deployers shall monitor the operation of the high-risk AI system on the basis of the instructions for use and inform providers/distributors of any serious incidents.",
    mandatory: true,
    evidenceTypes: ["monitoring_report", "procedure"],
    category: "Deployer Obligations",
  },
  {
    id: "HR-DO-04",
    requirement: "Conduct fundamental rights impact assessment",
    article: "Art. 27",
    description:
      "Before putting a high-risk AI system into use, deployers that are bodies governed by public law or private entities providing public services, as well as deployers using systems under Annex III points 5(a) (credit scoring) and 5(b) (public benefits), shall perform an assessment of the impact on fundamental rights.",
    mandatory: true,
    evidenceTypes: ["document"],
    category: "Deployer Obligations",
  },
  {
    id: "HR-DO-05",
    requirement: "Inform natural persons of high-risk AI usage",
    article: "Art. 26(11)",
    description:
      "Deployers shall inform natural persons that they are subject to the use of a high-risk AI system. For systems used in law enforcement, migration, asylum, or border control, this obligation may be waived under specific conditions.",
    mandatory: true,
    evidenceTypes: ["procedure", "document"],
    category: "Deployer Obligations",
  },
];

export function getHighRiskChecklist(): Checklist {
  return {
    title: "High-Risk AI System Compliance Checklist",
    description:
      "Comprehensive checklist based on EU AI Act Articles 8-15 (requirements), Articles 16-29 (obligations), and supporting provisions for providers and deployers of high-risk AI systems.",
    riskLevel: "high",
    items: HIGH_RISK_ITEMS,
  };
}

/**
 * Get checklist items for a specific category.
 */
export function getHighRiskChecklistByCategory(
  category: string
): ChecklistItem[] {
  return HIGH_RISK_ITEMS.filter((item) => item.category === category);
}

/**
 * Get all unique categories in the high-risk checklist.
 */
export function getHighRiskCategories(): string[] {
  return [...new Set(HIGH_RISK_ITEMS.map((item) => item.category))];
}
