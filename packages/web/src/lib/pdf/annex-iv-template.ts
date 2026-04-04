/**
 * Annex IV — Technical Documentation Template
 *
 * Defines the 10 sections required by Annex IV of the EU AI Act
 * for technical documentation of high-risk AI systems.
 * Each section includes title, guidance text, article references, and required flag.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnnexIVSection {
  /** Unique key for this section, e.g. "general_description" */
  key: string;
  /** Section number (1-10) */
  sectionNumber: number;
  /** Section title */
  title: string;
  /** Detailed guidance on what to write per the EU AI Act */
  guidance: string;
  /** EU AI Act article/annex references */
  articleReferences: string[];
  /** Whether this section is required (all Annex IV sections are required for high-risk) */
  required: boolean;
}

export interface AnnexIVTemplate {
  title: string;
  description: string;
  version: string;
  sections: AnnexIVSection[];
}

// ---------------------------------------------------------------------------
// Template definition
// ---------------------------------------------------------------------------

export const ANNEX_IV_SECTIONS: AnnexIVSection[] = [
  {
    key: "general_description",
    sectionNumber: 1,
    title: "General Description of the AI System",
    guidance:
      "Provide a general description of the AI system including: " +
      "(a) its intended purpose, the provider's name and address; " +
      "(b) how the AI system interacts with or is used in hardware or software that is not part of the AI system itself; " +
      "(c) the versions of relevant software or firmware and any requirement related to version update; " +
      "(d) the description of all the forms in which the AI system is placed on the market or put into service (e.g. software package embedded into hardware, download, API); " +
      "(e) the description of the hardware on which the AI system is intended to run; " +
      "(f) where the AI system is a component of products, photographs or illustrations showing external features, marking, and internal layout; " +
      "(g) a basic description of the user interface provided to the deployer; " +
      "(h) instructions for use for the deployer and, where applicable, the instructions for installation.",
    articleReferences: ["Annex IV, point 1", "Art. 11(1)"],
    required: true,
  },
  {
    key: "detailed_description",
    sectionNumber: 2,
    title: "Detailed Description of Elements and Development Process",
    guidance:
      "Provide a detailed description of the elements of the AI system and of the process for its development, including: " +
      "(a) the methods and steps performed for the development of the AI system, including, where relevant, recourse to pre-trained systems or tools provided by third parties; " +
      "(b) the design specifications of the system — the general logic of the AI system and of the algorithms; the key design choices including the rationale and assumptions made; the classification choices; what the system is designed to optimise for and the relevance of the different parameters; the decisions about any possible trade-off made regarding the technical solutions adopted; " +
      "(c) the description of the system architecture explaining how software components build on or feed into each other and the process of data flow; the computational resources used (e.g. hardware, cloud infrastructure).",
    articleReferences: ["Annex IV, point 2", "Art. 11(1)"],
    required: true,
  },
  {
    key: "monitoring_functioning",
    sectionNumber: 3,
    title: "Monitoring, Functioning, and Control",
    guidance:
      "Provide detailed information about the monitoring, functioning, and control of the AI system, including: " +
      "(a) the capabilities and limitations of the system including the degree of accuracy for specific persons or groups on which the system is intended to be used and the overall expected level of accuracy; " +
      "(b) the foreseeable unintended outcomes and sources of risks to health and safety, fundamental rights, and discrimination; " +
      "(c) the human oversight measures and the technical measures put in place to facilitate the interpretation of AI system outputs by deployers; " +
      "(d) specifications on input data, as appropriate.",
    articleReferences: ["Annex IV, point 3", "Art. 13", "Art. 14"],
    required: true,
  },
  {
    key: "risk_management",
    sectionNumber: 4,
    title: "Risk Management System",
    guidance:
      "Provide a detailed description of the risk management system in accordance with Article 9, including: " +
      "(a) a description of the risk management process applied throughout the lifecycle; " +
      "(b) identification and analysis of the known and reasonably foreseeable risks; " +
      "(c) estimation and evaluation of risks from both intended use and reasonably foreseeable misuse; " +
      "(d) risk management measures adopted and how residual risks are managed; " +
      "(e) testing performed for risk identification and the results, including testing prior to market placement.",
    articleReferences: ["Annex IV, point 4", "Art. 9"],
    required: true,
  },
  {
    key: "data_governance",
    sectionNumber: 5,
    title: "Data and Data Governance",
    guidance:
      "Describe the training, validation, and testing data used, including: " +
      "(a) the design choices and data collection methodologies (labelling, cleaning, enrichment, aggregation); " +
      "(b) the characteristics of the datasets (size, scope, coverage, main properties); " +
      "(c) information about the suitability of the datasets — how they were obtained and selected; " +
      "(d) examination of possible biases; " +
      "(e) identification of any data gaps or shortcomings and how they were addressed; " +
      "(f) data governance and management practices applied.",
    articleReferences: ["Annex IV, point 5", "Art. 10"],
    required: true,
  },
  {
    key: "testing_validation",
    sectionNumber: 6,
    title: "Testing and Validation",
    guidance:
      "Provide information about the testing and validation procedures used, including: " +
      "(a) the testing and validation methodologies and metrics used; " +
      "(b) the testing data used and the main characteristics of those datasets; " +
      "(c) the results of testing including accuracy metrics and their potential discriminatory impact on specific persons or groups; " +
      "(d) risk mitigation measures adopted in light of the testing results; " +
      "(e) test logs and all test reports dated and signed by responsible persons.",
    articleReferences: ["Annex IV, point 6", "Art. 9(7)", "Art. 15"],
    required: true,
  },
  {
    key: "accuracy_robustness",
    sectionNumber: 7,
    title: "Accuracy, Robustness, and Cybersecurity",
    guidance:
      "Describe the measures taken to achieve appropriate levels of: " +
      "(a) accuracy — declare accuracy levels and metrics in the instructions for use; " +
      "(b) robustness — describe technical solutions to ensure consistency and resilience against errors, faults, or inconsistencies; " +
      "(c) cybersecurity — describe measures against unauthorized access, data poisoning, adversarial examples, model manipulation, and confidentiality attacks; " +
      "(d) technical redundancy solutions, including backup and fail-safe plans.",
    articleReferences: ["Annex IV, point 7", "Art. 15"],
    required: true,
  },
  {
    key: "logging_capabilities",
    sectionNumber: 8,
    title: "Automatic Logging Capabilities",
    guidance:
      "Describe the automatic logging capabilities of the system, including: " +
      "(a) the logging capabilities built into the system architecture; " +
      "(b) what events are recorded (at minimum: period of each use, reference database against which input is checked, input data for search queries, identification of natural persons involved in verification); " +
      "(c) log retention periods and accessibility arrangements; " +
      "(d) how logging enables monitoring for risks and substantial modifications per Article 12.",
    articleReferences: ["Annex IV, point 8", "Art. 12"],
    required: true,
  },
  {
    key: "post_market_monitoring",
    sectionNumber: 9,
    title: "Post-Market Monitoring Plan",
    guidance:
      "Describe the post-market monitoring system to be established by the provider in accordance with Article 72, including: " +
      "(a) the plan for systematic collection and analysis of data on system performance throughout its lifecycle; " +
      "(b) procedures for reporting serious incidents and malfunctions (Article 73); " +
      "(c) methods for detecting model degradation, drift, or bias emergence over time; " +
      "(d) feedback mechanisms from deployers and end users; " +
      "(e) update and corrective action procedures.",
    articleReferences: ["Annex IV, point 9", "Art. 72", "Art. 73"],
    required: true,
  },
  {
    key: "regulatory_compliance",
    sectionNumber: 10,
    title: "Standards and Regulatory Compliance",
    guidance:
      "Provide information about applicable standards and regulatory compliance, including: " +
      "(a) a list of harmonised standards applied in full or in part and, where not applied, descriptions of the solutions adopted to meet the requirements; " +
      "(b) the EU declaration of conformity (Article 47); " +
      "(c) the conformity assessment procedure followed (Article 43) — internal control (Annex VI) or with a notified body (Annex VII); " +
      "(d) where applicable, details of the notified body involved; " +
      "(e) registration in the EU database (Article 49); " +
      "(f) any applicable Union or national law the AI system complies with.",
    articleReferences: ["Annex IV, point 10", "Art. 43", "Art. 47", "Art. 48", "Art. 49"],
    required: true,
  },
];

// ---------------------------------------------------------------------------
// Accessor
// ---------------------------------------------------------------------------

export function getAnnexIVTemplate(): AnnexIVTemplate {
  return {
    title: "Annex IV — Technical Documentation for High-Risk AI Systems",
    description:
      "The technical documentation referred to in Article 11(1) shall contain at least the following information, as applicable to the relevant AI system.",
    version: "1.0.0",
    sections: ANNEX_IV_SECTIONS,
  };
}

export function getAnnexIVSection(key: string): AnnexIVSection | undefined {
  return ANNEX_IV_SECTIONS.find((s) => s.key === key);
}
