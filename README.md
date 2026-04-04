<p align="center">
  <strong>Comply AI</strong><br>
  EU AI Act Compliance Engine — classify, document, and monitor your AI systems.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> · <a href="#features">Features</a> · <a href="#screenshots">Screenshots</a> · <a href="#cli">CLI</a> · <a href="#docker">Docker</a> · <a href="#comparison">Comparison</a> · <a href="#license">License</a>
</p>

<p align="center">
  Open-source compliance engine for the EU Artificial Intelligence Act (Regulation 2024/1689).<br>
  Risk classification, checklist generation, model cards, incident tracking, and CI/CD integration.
</p>

<p align="center">
  Built by <a href="https://afkzonagroup.lt"><strong>AFKzona Group</strong></a> · See also <a href="https://github.com/antonmacius-droid/bulwark-ai">Bulwark AI</a>
</p>

```bash
npm install @comply-ai/core
```

MIT + BSL 1.1 | TypeScript-native | Self-hosted

---

## Quick Start

```bash
# Option 1: Docker (recommended)
git clone https://github.com/afkzona/comply-ai.git
cd comply-ai
./scripts/setup.sh
docker compose up -d
# Dashboard: http://localhost:3300

# Option 2: npm
npm install @comply-ai/core
```

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
| **Technical Documentation** | Annex IV document generation with pre-filled templates |
| **Incident Tracking** | Article 62 serious incident reporting with 72-hour notification tracking |
| **Conformity Assessment** | Internal and third-party assessment workflow (Article 43) |
| **CLI Tool** | `comply-ai classify`, `comply-ai check`, `comply-ai model-card`, `comply-ai status`, `comply-ai register`, `comply-ai init` |
| **CI/CD Integration** | GitHub Actions and GitLab CI templates for automated compliance checks |
| **Dashboard** | Web UI for managing AI systems, documents, and compliance status |
| **Landing Page** | Marketing page with feature overview, pricing, and comparison table |
| **Documentation** | Built-in docs site with API reference, CLI guide, and deployment instructions |
| **Worker Queue** | Background processing for assessments and document generation (BullMQ) |

## Screenshots

### Landing Page
Dark-themed marketing landing page with hero section, feature grid, CLI demo, comparison table, and pricing tiers (Open Source free, Team €299/mo, Enterprise €999/mo).

### Dashboard
Overview with KPI cards (total systems, high-risk count, pending assessments, open incidents, compliance score), recent activity feed, risk distribution chart, and upcoming deadlines.

### AI System Registry
Searchable table of registered AI systems with risk level badges, compliance status, provider info, and bulk actions.

### Risk Assessment
Step-by-step risk classification wizard that maps systems to EU AI Act tiers. Shows applicable articles, requirements, and conformity assessment type.

### Document Generator
Annex IV technical documentation builder with section-by-section templates, completion tracking, and PDF export.

### Conformity Assessment
Assessment workflow tracker showing internal/third-party assessment progress, evidence collection, and approval status.

### Post-Market Monitoring
Real-time monitoring dashboard with system health metrics, incident timeline, and Article 62 alert status.

### Documentation Site
Built-in documentation with left sidebar navigation covering API reference, CLI commands, Annex IV guide, Bulwark AI integration, and Docker deployment.

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
git clone https://github.com/afkzona/comply-ai.git
cd comply-ai

# First-run setup (creates .env, checks deps)
./scripts/setup.sh

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

### Development Mode

```bash
# Hot reload with mounted source volumes
docker compose -f docker-compose.yml -f docker-compose.override.yml up
```

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
| **CLI tool** | Yes (6 commands) | No | No | No |
| **CI/CD integration** | GitHub Actions + GitLab | No | No | No |
| **Conformity assessment** | Internal + third-party (Art. 43) | No | Partial | No |
| **Incident tracking** | Art. 62 with 72h alerts | Generic | No | No |
| **Documentation gen** | Annex IV templates | No | Partial | No |
| **Post-market monitoring** | Yes (Art. 72) | No | No | No |
| **Pricing** | Free (self-hosted) | $$$$ | $$$$ | $$$ |
| **Data residency** | Your infrastructure | US/EU | US/EU | EU |
| **TypeScript-native** | Yes | N/A | N/A | N/A |
| **Embeddable** | Yes (`npm install`) | No | No | No |
| **Landing page** | Built-in marketing site | N/A | N/A | N/A |

## Packages

| Package | License | Description |
|---------|---------|-------------|
| `@comply-ai/core` | MIT | Risk classification, types, model cards, checklists |
| `@comply-ai/cli` | MIT | CLI tool for compliance checks and classification |
| `@comply-ai/ci` | MIT | GitHub Actions and GitLab CI templates |
| `@comply-ai/web` | BSL 1.1 | Dashboard, API, worker, landing page (converts to MIT 2029-04-01) |

## Legal & Compliance Disclaimer

Comply AI provides tools that can assist with EU AI Act compliance workflows, including risk classification, documentation generation, and conformity assessment tracking.

**Use of this software does not by itself ensure compliance with the EU AI Act (Regulation 2024/1689) or any other laws or regulations.**

Users are responsible for:
- Validating classification results against their specific use case
- Ensuring documentation meets their regulatory requirements
- Engaging qualified legal and compliance professionals
- Submitting required registrations to the EU AI Database

The risk classification engine is based on publicly available regulation text and is provided as a decision-support tool, not as legal advice. EU AI Act article references (Articles 5-6, 8-15, 43, 50-56, 62, 72, Annex III, Annex IV) are informational and do not constitute legal advice. Users should consult qualified legal counsel for compliance decisions specific to their AI systems and jurisdiction.

## Security Notice

Comply AI processes metadata about AI systems. It does not process or store AI model weights, training data, or end-user data unless explicitly configured.

The compliance assessments generated by this tool are **decision-support outputs** and should be reviewed by qualified compliance professionals before being submitted to regulatory authorities.

## Limitation of Liability

This software is provided "as is", without warranty of any kind. In no event shall the authors or contributors be liable for any damages arising from the use of this software, including but not limited to regulatory fines, compliance failures, or data loss.

For commercial licensing or compliance consulting: **info@afkzonagroup.lt**

## Related Projects

- [Bulwark AI](https://github.com/antonmacius-droid/bulwark-ai) — Enterprise AI governance gateway (PII detection, prompt injection, budgets, audit logging, GDPR/SOC 2)

## Licensing

**Core packages** (core, cli, ci) are **MIT** — use anywhere, no license key needed.

**Dashboard** (packages/web) is **BSL 1.1** — free for development, testing, and non-commercial use. Commercial production use requires a license key.

### Getting a License Key

1. Purchase a license at [afkzonagroup.lt/license](https://afkzonagroup.lt/license)
2. You will receive a key in the format: `COMPLY-TEAM-acme-20270401-a1b2c3d4e5f6a1b2`
3. Add it to your `.env` file:

```bash
# Comply AI license key
COMPLY_LICENSE_KEY=COMPLY-TEAM-acme-20270401-a1b2c3d4e5f6a1b2

# Required for signature verification
LICENSE_SIGNING_SECRET=your-shared-secret
```

4. Restart your application

### How It Works

- **Offline verification** — the key is HMAC-SHA256 signed. Verification recomputes the signature locally. No phone-home, no telemetry, no network calls.
- **No functionality is blocked** — an invalid or missing key shows a yellow "Unlicensed" banner in the dashboard when running in production mode (`NODE_ENV=production`). The software remains fully functional.
- The banner is dismissible per session but reappears on page refresh.

### Plans

| Plan | Use Case |
|------|----------|
| **Pro** | Small teams, single deployment |
| **Team** | Multiple deployments, priority support |
| **Enterprise** | Unlimited deployments, custom terms, SLA |

For custom licensing or compliance consulting: **info@afkzonagroup.lt**

## License

**Core** (packages/core, packages/cli, packages/ci): **MIT** — use anywhere.

**Dashboard** (packages/web): **BSL 1.1** — free for development and non-commercial use. Commercial production requires a license. Converts to MIT on 2029-04-01.

Copyright (c) 2026 [AFKzona Group](https://afkzonagroup.lt) — info@afkzonagroup.lt

## Roadmap

- [x] Risk classification engine (4-tier + GPAI)
- [x] CLI tool (6 commands)
- [x] Web dashboard (10 pages)
- [x] Conformity assessment workflow
- [x] Post-market monitoring
- [x] Incident tracking (Art. 62)
- [x] CI/CD templates (GitHub Actions + GitLab)
- [x] Docker deployment
- [x] Landing page + docs site
- [ ] npm publish (@comply-ai/core, @comply-ai/cli)
- [ ] Docker image on GHCR
- [ ] Postgres integration (replace in-memory storage)
- [ ] Real PDF generation with @react-pdf/renderer
- [ ] AI-assisted document filling (LLM integration)
- [ ] SSO/SAML authentication
- [ ] Python SDK
- [ ] Automated bias/fairness testing integration
- [ ] Multi-language support (EU languages)
