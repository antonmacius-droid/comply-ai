'use client';

import { useState } from 'react';

/* ──────────────────────── Types ──────────────────────── */

interface DocSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

/* ──────────────────────── Code Block ──────────────────────── */

function Code({ children, lang }: { children: string; lang?: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        margin: '16px 0',
        border: '1px solid #E2E8F0',
      }}
    >
      {lang && (
        <div
          style={{
            background: '#F1F5F9',
            padding: '6px 16px',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {lang}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: '16px 20px',
          background: '#0F172A',
          fontFamily:
            '"SF Mono", "Fira Code", Menlo, Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.7,
          color: '#E2E8F0',
          overflowX: 'auto',
        }}
      >
        {children}
      </pre>
    </div>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#0F172A',
        margin: '32px 0 12px',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, margin: '0 0 16px' }}>
      {children}
    </p>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', margin: '16px 0' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
          border: '1px solid #E2E8F0',
          borderRadius: 8,
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#334155',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '10px 14px',
                    color: '#475569',
                    borderBottom: '1px solid #F1F5F9',
                    fontFamily: ci === 0 ? 'monospace' : 'inherit',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────── Sections ──────────────────────── */

const sections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: (
      <>
        <P>
          Comply AI is an open-source EU AI Act compliance engine. It provides risk
          classification, document generation, conformity assessment tracking, and
          post-market monitoring for AI systems.
        </P>

        <H3>Installation</H3>
        <Code lang="bash">{`# Install the core library
npm install @comply-ai/core

# Install the CLI tool globally
npm install -g @comply-ai/cli

# Or use Docker
docker compose up -d`}</Code>

        <H3>Quick Start</H3>
        <Code lang="typescript">{`import { classifyRisk } from "@comply-ai/core";

const result = classifyRisk({
  name: "Resume Screener",
  category: "employment",
  autonomousDecisions: true,
  affectsNaturalPersons: true,
});

console.log(result.riskLevel);         // "high"
console.log(result.annexIIICategory);  // "employment"
console.log(result.requirements);      // ["Risk management system", ...]`}</Code>

        <H3>Project Structure</H3>
        <Code lang="text">{`comply-ai/
├── packages/
│   ├── core/       # Risk classification, types, model cards (MIT)
│   ├── cli/        # CLI tool for compliance checks (MIT)
│   ├── ci/         # GitHub Actions + GitLab CI templates (MIT)
│   └── web/        # Dashboard, API, worker (BSL 1.1)
├── docker-compose.yml
└── Dockerfile`}</Code>
      </>
    ),
  },
  {
    id: 'risk-classification',
    title: 'Risk Classification API',
    content: (
      <>
        <P>
          The risk classification engine maps AI systems to EU AI Act risk tiers
          based on Articles 5-6, Annex I, and Annex III. It supports all four tiers:
          prohibited, high, limited, and minimal risk, plus GPAI assessment.
        </P>

        <H3>classifyRisk(input)</H3>
        <P>
          Classifies an AI system into the appropriate risk tier based on its
          characteristics and use case.
        </P>

        <Table
          headers={['Parameter', 'Type', 'Required', 'Description']}
          rows={[
            ['name', 'string', 'Yes', 'Name of the AI system'],
            ['category', 'string', 'Yes', 'Use case category (employment, biometric, etc.)'],
            ['autonomousDecisions', 'boolean', 'No', 'System makes autonomous decisions'],
            ['affectsNaturalPersons', 'boolean', 'No', 'Decisions affect natural persons'],
            ['interactsWithPersons', 'boolean', 'No', 'System interacts with people directly'],
            ['governmentUse', 'boolean', 'No', 'Used by government/public authorities'],
            ['trainingComputeFlops', 'number', 'No', 'FLOPS used for training (GPAI)'],
          ]}
        />

        <H3>Risk Categories</H3>
        <Table
          headers={['Category', 'Enum Value', 'Annex III']}
          rows={[
            ['Biometric identification', 'biometric', 'Category 1'],
            ['Critical infrastructure', 'critical_infrastructure', 'Category 2'],
            ['Education and training', 'education', 'Category 3'],
            ['Employment', 'employment', 'Category 4'],
            ['Essential services', 'essential_services', 'Category 5'],
            ['Law enforcement', 'law_enforcement', 'Category 6'],
            ['Migration & border', 'migration', 'Category 7'],
            ['Justice & democracy', 'justice', 'Category 8'],
            ['Social scoring', 'social_scoring', 'Prohibited'],
            ['General purpose AI', 'gpai', 'Articles 51-56'],
          ]}
        />

        <H3>Response</H3>
        <Code lang="typescript">{`interface ClassificationResult {
  riskLevel: "prohibited" | "high" | "limited" | "minimal" | "gpai";
  confidence: number;
  annexIIICategory?: string;
  prohibitedPractices?: string[];
  applicableArticles: string[];
  requirements: string[];
  gpaiTier?: "standard" | "systemic_risk";
  conformityAssessment: "internal" | "third_party" | "not_required";
}`}</Code>

        <H3>Examples</H3>
        <Code lang="typescript">{`// Prohibited system
classifyRisk({
  name: "Social Credit Score",
  category: "social_scoring",
  governmentUse: true,
});
// => { riskLevel: "prohibited", prohibitedPractices: ["social_scoring"] }

// High-risk system
classifyRisk({
  name: "Loan Approval AI",
  category: "essential_services",
  autonomousDecisions: true,
  affectsNaturalPersons: true,
});
// => { riskLevel: "high", annexIIICategory: "essential_services" }

// GPAI with systemic risk
classifyRisk({
  name: "Foundation Model v3",
  category: "gpai",
  trainingComputeFlops: 1e26,
});
// => { riskLevel: "gpai", gpaiTier: "systemic_risk" }`}</Code>
      </>
    ),
  },
  {
    id: 'cli-reference',
    title: 'CLI Reference',
    content: (
      <>
        <P>
          The Comply AI CLI provides six commands for risk classification, compliance
          checks, model card management, status monitoring, system registration, and
          project initialization.
        </P>

        <H3>comply-ai classify</H3>
        <P>
          Classify an AI system&apos;s risk level. Runs offline with no server required.
        </P>
        <Code lang="bash">{`comply-ai classify \\
  --name "Resume Screener" \\
  --category employment \\
  --autonomous-decisions \\
  --affects-natural-persons

# Output:
# Risk Level: HIGH (Annex III, Category 4: Employment)
# Articles: 6, 8, 9, 10, 11, 12, 13, 14, 15
# Conformity Assessment: Third-party required`}</Code>

        <H3>comply-ai check</H3>
        <P>
          Run compliance check against a Comply AI server. Returns exit code 1 on
          failure, making it CI/CD-friendly.
        </P>
        <Code lang="bash">{`comply-ai check --system-id sys_abc123 --server https://comply.company.com
# Exit 0 = compliant, Exit 1 = non-compliant`}</Code>

        <H3>comply-ai model-card</H3>
        <P>Generate or validate EU AI Act model cards.</P>
        <Code lang="bash">{`# Generate a new model card
comply-ai model-card generate \\
  --name "Resume Screener" \\
  --output model-card.json

# Validate an existing model card
comply-ai model-card validate model-card.json`}</Code>

        <H3>comply-ai status</H3>
        <P>Show compliance status for a registered AI system.</P>
        <Code lang="bash">{`comply-ai status --system-id sys_abc123`}</Code>

        <H3>comply-ai register</H3>
        <P>Register a new AI system with the Comply AI server.</P>
        <Code lang="bash">{`comply-ai register \\
  --name "Resume Screener" \\
  --category employment \\
  --description "AI system for screening job applications"`}</Code>

        <H3>comply-ai init</H3>
        <P>Initialize a configuration file in the current directory.</P>
        <Code lang="bash">{`comply-ai init
# Creates .comply-ai.yml`}</Code>

        <H3>Configuration File</H3>
        <Code lang="yaml">{`# .comply-ai.yml
server: https://comply.yourcompany.com
api_key: cai_xxxxxxxxxxxx
default_system_id: sys_abc123
organization: Your Company`}</Code>
      </>
    ),
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    content: (
      <>
        <P>
          The Comply AI web dashboard exposes a REST API for managing AI systems,
          running compliance checks, and generating documentation.
        </P>

        <H3>Authentication</H3>
        <P>
          Include your API key in the Authorization header:
        </P>
        <Code lang="bash">{`curl -H "Authorization: Bearer cai_xxxxxxxxxxxx" \\
  https://comply.company.com/api/v1/systems`}</Code>

        <H3>Endpoints</H3>
        <Table
          headers={['Method', 'Path', 'Description']}
          rows={[
            ['GET', '/api/v1/systems', 'List all registered AI systems'],
            ['POST', '/api/v1/systems/register', 'Register a new AI system'],
            ['GET', '/api/v1/systems/:id', 'Get system details'],
            ['PUT', '/api/v1/systems/:id', 'Update system details'],
            ['DELETE', '/api/v1/systems/:id', 'Delete a system'],
            ['GET', '/api/v1/systems/:id/status', 'Get compliance status'],
            ['POST', '/api/v1/systems/:id/classify', 'Run risk classification'],
            ['GET', '/api/v1/compliance/check', 'Run compliance check'],
            ['POST', '/api/v1/documents/generate', 'Generate technical documentation'],
            ['GET', '/api/v1/documents/:id', 'Get generated document'],
            ['POST', '/api/v1/incidents', 'Report a serious incident'],
            ['GET', '/api/v1/incidents', 'List incidents'],
            ['POST', '/api/v1/conformity/:id/start', 'Start conformity assessment'],
            ['GET', '/api/v1/conformity/:id', 'Get assessment status'],
            ['GET', '/api/v1/monitoring/:id/metrics', 'Get monitoring metrics'],
          ]}
        />

        <H3>Register a System</H3>
        <Code lang="bash">{`POST /api/v1/systems/register
Content-Type: application/json

{
  "name": "Resume Screener",
  "category": "employment",
  "description": "AI system for screening job applications",
  "autonomousDecisions": true,
  "affectsNaturalPersons": true,
  "provider": "Internal",
  "version": "2.1.0"
}`}</Code>

        <H3>Classification Response</H3>
        <Code lang="json">{`{
  "systemId": "sys_abc123",
  "riskLevel": "high",
  "annexIIICategory": "employment",
  "applicableArticles": ["Article 6", "Article 8", "Article 9", "Article 10",
                          "Article 11", "Article 12", "Article 13", "Article 14",
                          "Article 15"],
  "requirements": [
    "Risk management system",
    "Data governance",
    "Technical documentation",
    "Record-keeping",
    "Transparency",
    "Human oversight",
    "Accuracy, robustness, security"
  ],
  "conformityAssessment": "third_party",
  "classifiedAt": "2026-04-04T10:00:00Z"
}`}</Code>
      </>
    ),
  },
  {
    id: 'annex-iv',
    title: 'Annex IV Documentation',
    content: (
      <>
        <P>
          EU AI Act Annex IV specifies the requirements for technical documentation
          of high-risk AI systems. Comply AI generates documentation templates that
          cover all required sections.
        </P>

        <H3>Required Sections</H3>
        <Table
          headers={['Section', 'Annex IV Reference', 'Description']}
          rows={[
            ['General description', '1(a)', 'Intended purpose, developer identity, version'],
            ['System components', '1(b)', 'Interaction with other systems and hardware'],
            ['Development methodology', '2(a)', 'Design specifications, architecture, algorithms'],
            ['Training data', '2(b)', 'Data sets used, provenance, preparation methods'],
            ['Validation & testing', '2(c)', 'Metrics, test logs, dates, adversarial testing'],
            ['Risk management', '2(d)', 'Risk management measures per Article 9'],
            ['Human oversight', '2(e)', 'Measures per Article 14'],
            ['Changes and updates', '3', 'Pre-determined changes, update mechanisms'],
            ['Monitoring plan', '4', 'Post-market monitoring system per Article 72'],
            ['Conformity procedure', '5', 'Description of conformity procedure applied'],
          ]}
        />

        <H3>Generate Documentation</H3>
        <Code lang="typescript">{`import { generateAnnexIVDoc } from "@comply-ai/core";

const doc = generateAnnexIVDoc({
  systemId: "sys_abc123",
  name: "Resume Screener",
  provider: "Your Company",
  intendedPurpose: "Screen and rank job applications using NLP",
  riskLevel: "high",
  // ... additional fields
});

// doc.sections contains all Annex IV sections with templates
// doc.completionPercentage shows how much is filled in`}</Code>

        <H3>Document Lifecycle</H3>
        <P>
          Technical documentation must be kept up-to-date throughout the AI
          system&apos;s lifecycle. Comply AI tracks document versions and flags when
          updates are needed based on system changes.
        </P>
      </>
    ),
  },
  {
    id: 'bulwark-integration',
    title: 'Bulwark AI Integration',
    content: (
      <>
        <P>
          Comply AI integrates with Bulwark AI for runtime AI governance. While
          Comply AI handles pre-deployment compliance (classification, documentation,
          conformity), Bulwark AI handles runtime governance (PII detection, prompt
          injection defense, budget controls, audit logging).
        </P>

        <H3>Architecture</H3>
        <Code lang="text">{`Pre-deployment (Comply AI)     Runtime (Bulwark AI)
┌──────────────────────┐      ┌──────────────────────┐
│ Risk Classification  │      │ PII Detection        │
│ Documentation        │      │ Prompt Injection     │
│ Conformity Assessment│ ───> │ Budget Controls      │
│ Checklist Generation │      │ Audit Logging        │
│ CI/CD Gates          │      │ GDPR/SOC 2           │
└──────────────────────┘      └──────────────────────┘`}</Code>

        <H3>Shared Docker Network</H3>
        <P>
          When co-deployed, Comply AI and Bulwark AI share the same Redis instance
          and Docker network for efficient communication.
        </P>
        <Code lang="yaml">{`# docker-compose.yml (add to comply-ai)
services:
  comply-web:
    networks:
      - comply-net
      - bulwark-net  # shared with Bulwark AI

networks:
  comply-net:
    driver: bridge
  bulwark-net:
    external: true
    name: bulwark-ai_default`}</Code>

        <H3>API Integration</H3>
        <Code lang="typescript">{`// In your application code
import { classifyRisk } from "@comply-ai/core";
import { BulwarkClient } from "@bulwark-ai/sdk";

// Pre-deployment: classify risk
const classification = classifyRisk({ name: "Chatbot", category: "chatbot" });

// Runtime: enforce governance
const bulwark = new BulwarkClient({ url: "http://bulwark:8080" });
const response = await bulwark.proxy({
  model: "gpt-4",
  messages: [{ role: "user", content: userInput }],
  policies: ["pii-detection", "prompt-injection"],
});`}</Code>
      </>
    ),
  },
  {
    id: 'docker-deployment',
    title: 'Docker Deployment',
    content: (
      <>
        <P>
          Comply AI ships as a multi-container Docker application with the web
          dashboard, background worker, PostgreSQL, and Redis.
        </P>

        <H3>Quick Start</H3>
        <Code lang="bash">{`git clone https://github.com/afkzona/comply-ai.git
cd comply-ai

# Run the setup script
./scripts/setup.sh

# Start all services
docker compose up -d

# Dashboard available at http://localhost:3300`}</Code>

        <H3>Services</H3>
        <Table
          headers={['Service', 'Description', 'Port']}
          rows={[
            ['comply-web', 'Next.js dashboard and API', '3300'],
            ['comply-worker', 'BullMQ background workers', '-'],
            ['postgres', 'PostgreSQL 16 database', '5432'],
            ['redis', 'Redis 7 (job queue, caching)', '6379'],
          ]}
        />

        <H3>Environment Variables</H3>
        <Table
          headers={['Variable', 'Default', 'Description']}
          rows={[
            ['DATABASE_URL', 'postgres://comply:comply@postgres:5432/complyai', 'PostgreSQL connection string'],
            ['REDIS_URL', 'redis://redis:6379', 'Redis connection string'],
            ['NEXTAUTH_URL', 'http://localhost:3300', 'NextAuth callback URL'],
            ['NEXTAUTH_SECRET', '(generated)', 'NextAuth session secret'],
            ['PORT', '3300', 'Web server port'],
          ]}
        />

        <H3>Production Deployment</H3>
        <Code lang="bash">{`# Build production image
docker compose build

# Run with custom env
NEXTAUTH_SECRET=$(openssl rand -base64 32) \\
DATABASE_URL=postgres://user:pass@db:5432/complyai \\
docker compose up -d

# Health check
curl http://localhost:3300/api/health`}</Code>

        <H3>Development Mode</H3>
        <Code lang="bash">{`# Use the dev override
docker compose -f docker-compose.yml -f docker-compose.override.yml up

# This mounts source code and enables hot reload`}</Code>
      </>
    ),
  },
];

/* ──────────────────────── Docs Page ──────────────────────── */

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div
      style={{
        paddingTop: 64,
        minHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          minHeight: 'calc(100vh - 64px)',
          borderRight: '1px solid #E2E8F0',
          padding: '32px 0',
          position: 'fixed',
          top: 64,
          left: 0,
          bottom: 0,
          overflowY: 'auto',
          background: '#FAFBFC',
        }}
      >
        <div
          style={{
            padding: '0 20px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#94A3B8',
              marginBottom: 12,
            }}
          >
            Documentation
          </div>
        </div>

        <nav style={{ padding: '0 8px' }}>
          {sections.map((section) => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '9px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: isActive ? '#4F46E5' : '#475569',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 450,
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: 2,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {section.title}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            margin: '32px 20px 0',
            padding: '16px',
            borderRadius: 10,
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#4F46E5',
              marginBottom: 6,
            }}
          >
            Need help?
          </div>
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
            Open an issue on{' '}
            <a
              href="https://github.com/afkzona/comply-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6366F1', textDecoration: 'none' }}
            >
              GitHub
            </a>{' '}
            or email{' '}
            <a
              href="mailto:info@afkzonagroup.lt"
              style={{ color: '#6366F1', textDecoration: 'none' }}
            >
              info@afkzonagroup.lt
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 260,
          padding: '40px 56px 80px',
          maxWidth: 840,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          {currentSection.title}
        </h1>
        <div
          style={{
            width: 40,
            height: 3,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #6366F1, #818CF8)',
            marginBottom: 32,
          }}
        />
        <div>{currentSection.content}</div>

        {/* Disclaimer */}
        <div
          style={{
            marginTop: 64,
            padding: '16px 20px',
            borderRadius: 10,
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#92400E',
              marginBottom: 4,
            }}
          >
            Disclaimer
          </div>
          <p
            style={{
              fontSize: 12,
              color: '#78350F',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Comply AI provides tools that assist with EU AI Act compliance workflows.
            Article references are informational and do not constitute legal advice.
            Consult qualified legal counsel for compliance decisions.
          </p>
        </div>
      </main>
    </div>
  );
}
