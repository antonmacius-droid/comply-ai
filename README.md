<p align="center">
  <strong>Comply AI</strong><br>
  EU AI Act Compliance Engine — classify, document, and monitor your AI systems.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> · <a href="#features">Features</a> · <a href="#cli">CLI</a> · <a href="#docker">Docker</a> · <a href="#comparison">Comparison</a> · <a href="#license">License</a>
</p>

<p align="center">
  Open-source compliance engine for the EU Artificial Intelligence Act (Regulation 2024/1689).<br>
  Risk classification, checklist generation, model cards, incident tracking, and CI/CD integration.
</p>

```bash
npm install @comply-ai/core
```

MIT + BSL 1.1 | TypeScript-native | Self-hosted

---

## Quick Start

```typescript
import { classifyRisk } from "@comply-ai/core";

const result = classifyRisk({
  name: "Resume Screener",
  category: "employment",
  autonomousDecisions: true,
  affectsNaturalPersons: true,
});

console.log(result.riskLevel);       // "high"
console.log(result.annexIIICategory); // "employment"
console.log(result.applicableArticles); // ["Article 6", "Article 8", ..., "Article 15"]
console.log(result.requirements);    // ["Risk management system", "Data governance", ...]
```

## Features

| Feature | Description |
|---------|-------------|
| **Risk Classification** | Automated 4-tier classification (prohibited / high / limited / minimal) per Articles 5-6 and Annex III |
| **GPAI Assessment** | General-purpose AI model classification with systemic risk detection (Articles 51-56) |
| **Compliance Checklists** | Auto-generated requirement checklists based on risk level (Articles 8-15, 50) |
| **Model Cards** | Generate and validate EU AI Act-compliant model cards |
| **Technical Documentation** | Templates for Article 11 technical documentation |
| **Incident Tracking** | Article 62 serious incident reporting with 72-hour notification tracking |
| **Conformity Assessment** | Internal and third-party assessment workflow (Article 43) |
| **CLI Tool** | `comply-ai classify`, `comply-ai check`, `comply-ai model-card` |
| **CI/CD Integration** | GitHub Actions and GitLab CI templates for automated compliance checks |
| **Dashboard** | Web UI for managing AI systems, documents, and compliance status |
| **Worker Queue** | Background processing for assessments and document generation (BullMQ) |

## Risk Classification Example

```typescript
import { classifyRisk } from "@comply-ai/core";

// Prohibited system
classifyRisk({
  name: "Social Credit Score",
  category: "social_scoring",
  governmentUse: true,
});
// => { riskLevel: "prohibited", prohibitedPractices: ["social_scoring"], ... }

// High-risk system (Annex III)
classifyRisk({
  name: "Loan Approval AI",
  category: "essential_services",
  autonomousDecisions: true,
  affectsNaturalPersons: true,
});
// => { riskLevel: "high", annexIIICategory: "essential_services", requirements: [...] }

// Limited risk (transparency obligations)
classifyRisk({
  name: "Customer Chatbot",
  category: "chatbot",
  interactsWithPersons: true,
});
// => { riskLevel: "limited", requirements: ["Transparency: disclose AI interaction"] }

// GPAI model
classifyRisk({
  name: "Foundation Model v3",
  category: "gpai",
  trainingComputeFlops: 1e26,
});
// => { riskLevel: "gpai", gpaiTier: "systemic_risk", requirements: [...] }
```

## CLI

```bash
npm install -g @comply-ai/cli
```

### Commands

```bash
# Classify an AI system's risk level (offline, no server needed)
comply-ai classify --name "Resume Screener" --category employment --autonomous-decisions
# Output: HIGH RISK (Annex III, Category 4: Employment)
# Requirements: Articles 8-15, Conformity Assessment required

# Run compliance check against Comply AI server
comply-ai check --system-id sys_abc123
# Exit code 1 on failure (CI-friendly)

# Generate a model card
comply-ai model-card generate --name "Resume Screener" --output model-card.json

# Validate an existing model card
comply-ai model-card validate model-card.json

# Show compliance status
comply-ai status --system-id sys_abc123

# Register a new AI system
comply-ai register --name "Resume Screener" --category employment

# Initialize config file
comply-ai init
# Creates .comply-ai.yml
```

### Configuration

```yaml
# .comply-ai.yml
server: https://comply.yourcompany.com
api_key: cai_xxxxxxxxxxxx
default_system_id: sys_abc123
organization: Your Company
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/compliance.yml
name: EU AI Act Compliance
on: [push]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: comply-ai/comply-check@v1
        with:
          server: ${{ secrets.COMPLY_AI_SERVER }}
          api-key: ${{ secrets.COMPLY_AI_API_KEY }}
          system-id: sys_abc123
```

### GitLab CI

```yaml
include:
  - remote: 'https://raw.githubusercontent.com/comply-ai/ci/main/gitlab-ci/comply-check.yml'

comply-check:
  extends: .comply-ai-check
  variables:
    COMPLY_AI_SERVER: $COMPLY_AI_SERVER
    COMPLY_AI_API_KEY: $COMPLY_AI_API_KEY
    COMPLY_AI_SYSTEM_ID: sys_abc123
```

## Docker

```bash
git clone https://github.com/comply-ai/comply-ai.git
cd comply-ai

# Set secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env

# Start all services
docker compose up -d

# Dashboard:  http://localhost:3300
# PostgreSQL: localhost:5432
# Redis:      localhost:6379
```

### Services

| Service | Description | Port |
|---------|-------------|------|
| `comply-web` | Next.js dashboard & API | 3300 |
| `comply-worker` | BullMQ background workers | — |
| `postgres` | PostgreSQL 16 | 5432 |
| `redis` | Redis 7 (job queue, caching) | 6379 |

### Co-deployment with Bulwark AI

Comply AI and [Bulwark AI](https://github.com/antonmacius-droid/bulwark-ai) share the same Redis instance when co-deployed. Use the same `comply-net` Docker network.

## Architecture

```
                    ┌─────────────────────────────────┐
                    │         Comply AI Dashboard       │
                    │         (Next.js @ :3300)         │
                    └──────────┬──────────┬────────────┘
                               │          │
                    ┌──────────▼──┐  ┌────▼───────────┐
                    │  PostgreSQL  │  │  Redis + BullMQ │
                    │  (Systems,   │  │  (Job queue,    │
                    │   Docs,      │  │   caching)      │
                    │   Audit)     │  │                 │
                    └─────────────┘  └────┬────────────┘
                                          │
                               ┌──────────▼──────────┐
                               │    comply-worker     │
                               │  (Risk assessments,  │
                               │   Doc generation,    │
                               │   Notifications)     │
                               └─────────────────────┘

  CLI / CI                       @comply-ai/core
  ┌───────────┐                  ┌──────────────────┐
  │ comply-ai │ ───── uses ────▶ │ Risk classifier  │
  │   CLI     │                  │ Model cards      │
  └─────┬─────┘                  │ Checklists       │
        │                        │ EU AI Act types  │
        │ HTTP                   └──────────────────┘
        ▼
  Comply AI Server API
  GET  /api/v1/compliance/check
  POST /api/v1/systems/register
  GET  /api/v1/systems/:id/status
```

## Comparison

| Feature | Comply AI | Vanta | Holistic AI | Daiki AI |
|---------|-----------|-------|-------------|----------|
| **Deployment** | Self-hosted | SaaS only | SaaS only | SaaS only |
| **Open source** | Yes (MIT + BSL) | No | No | No |
| **EU AI Act focus** | Primary focus | Secondary | Partial | Partial |
| **Risk classification** | Automated, Article 5-6 + Annex III | Manual | Partial | Partial |
| **GPAI assessment** | Yes (Art. 51-56) | No | Partial | No |
| **Model cards** | Generate + validate | No | Generate | No |
| **CLI tool** | Yes | No | No | No |
| **CI/CD integration** | GitHub Actions + GitLab | No | No | No |
| **Conformity assessment** | Internal + third-party | No | Partial | No |
| **Incident tracking** | Art. 62 with 72h alerts | Generic | No | No |
| **Pricing** | Free (self-hosted) | $$$$ | $$$$ | $$$ |
| **Data residency** | Your infrastructure | US/EU | US/EU | EU |
| **TypeScript-native** | Yes | N/A | N/A | N/A |
| **Embeddable** | Yes (`npm install`) | No | No | No |

## Packages

| Package | License | Description |
|---------|---------|-------------|
| `@comply-ai/core` | MIT | Risk classification, types, model cards, checklists |
| `@comply-ai/cli` | MIT | CLI tool for compliance checks and classification |
| `@comply-ai/ci` | MIT | GitHub Actions and GitLab CI templates |
| `@comply-ai/web` | BSL 1.1 | Dashboard, API, worker (converts to MIT 2029-04-01) |

## Legal & Compliance Disclaimer

Comply AI provides tools that can assist with EU AI Act compliance workflows, including risk classification, documentation generation, and conformity assessment tracking.

**Use of this software does not by itself ensure compliance with the EU AI Act or any other laws or regulations.**

Users are responsible for:
- Validating classification results against their specific use case
- Ensuring documentation meets their regulatory requirements
- Engaging qualified legal and compliance professionals
- Submitting required registrations to the EU AI Database

The risk classification engine is based on publicly available regulation text and is provided as a decision-support tool, not as legal advice.

## Security Notice

Comply AI processes metadata about AI systems. It does not process or store AI model weights, training data, or end-user data unless explicitly configured.

The compliance assessments generated by this tool are **decision-support outputs** and should be reviewed by qualified compliance professionals before being submitted to regulatory authorities.

## Limitation of Liability

This software is provided "as is", without warranty of any kind. In no event shall the authors or contributors be liable for any damages arising from the use of this software, including but not limited to regulatory fines, compliance failures, or data loss.

For commercial licensing or compliance consulting: **info@afkzonagroup.lt**

## Related Projects

- [Bulwark AI](https://github.com/antonmacius-droid/bulwark-ai) — Enterprise AI governance gateway (PII detection, prompt injection, budgets, audit logging, GDPR/SOC 2)

## License

**Core** (packages/core, packages/cli, packages/ci): **MIT** — use anywhere.

**Dashboard** (packages/web): **BSL 1.1** — free for development and non-commercial use. Commercial production requires a license. Converts to MIT on 2029-04-01.

Copyright (c) 2026 AFKzona Group — info@afkzonagroup.lt

## Roadmap

- [ ] npm publish (@comply-ai/core, @comply-ai/cli)
- [ ] PyPI publish (Python SDK)
- [ ] Postgres integration (currently in-memory)
- [ ] BullMQ background jobs
- [ ] Landing page + docs site
- [ ] Docker image on GHCR
