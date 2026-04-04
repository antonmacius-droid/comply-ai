'use client';

import Link from 'next/link';

/* ──────────────────────────── Icons (inline SVGs) ──────────────────────────── */

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PartialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ──────────────────────────── Section wrapper ──────────────────────────── */

function Section({
  children,
  dark = false,
  id,
}: {
  children: React.ReactNode;
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      style={{
        padding: '96px 32px',
        background: dark ? '#0F172A' : '#FFFFFF',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 14px',
        borderRadius: 100,
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        fontSize: 12,
        fontWeight: 600,
        color: '#818CF8',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────── Landing Page ──────────────────────────── */

export default function LandingPage() {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
          overflow: 'hidden',
          padding: '120px 32px 80px',
        }}
      >
        {/* Background grid effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          }}
        />
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            maxWidth: 840,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px 6px 8px',
              borderRadius: 100,
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                background: '#6366F1',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 100,
                letterSpacing: '0.03em',
              }}
            >
              NEW
            </span>
            <span style={{ fontSize: 13, color: '#C7D2FE', fontWeight: 500 }}>
              Open-source EU AI Act compliance engine
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              color: '#F8FAFC',
              margin: '0 0 24px',
            }}
          >
            EU AI Act
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #818CF8, #6366F1, #A78BFA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Compliance Engine
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: '#94A3B8',
              margin: '0 auto 40px',
              maxWidth: 600,
              fontWeight: 400,
            }}
          >
            Classify, document, and monitor your AI systems.
            <br />
            Avoid{' '}
            <span style={{ color: '#F87171', fontWeight: 600 }}>
              &euro;35M fines
            </span>
            . Ship with confidence.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/registry"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow:
                  '0 0 24px rgba(99, 102, 241, 0.4), 0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
              }}
            >
              Get Started
              <ArrowRightIcon />
            </Link>
            <a
              href="https://github.com/afkzona/comply-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#E2E8F0',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Trust bar */}
          <div
            style={{
              marginTop: 64,
              display: 'flex',
              justifyContent: 'center',
              gap: 48,
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: 'MIT + BSL', label: 'Open Source' },
              { value: '100%', label: 'Self-hosted' },
              { value: 'Art. 5-56', label: 'Full Coverage' },
              { value: 'TypeScript', label: 'Developer Native' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#E2E8F0',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748B',
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PROBLEM ═══════════════ */}
      <Section dark>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel>The Problem</SectionLabel>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#F8FAFC',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            78% of EU companies are unprepared
          </h2>
          <p
            style={{
              fontSize: 18,
              color: '#94A3B8',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            The EU AI Act deadline is August 2026. Non-compliance means fines up
            to &euro;35M or 7% of global revenue.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {[
            {
              stat: '\u20AC35M',
              desc: 'Maximum fine for prohibited practices',
              color: '#EF4444',
            },
            {
              stat: 'Aug 2026',
              desc: 'Enforcement deadline for high-risk AI systems',
              color: '#F59E0B',
            },
            {
              stat: '6 months',
              desc: 'Average compliance project timeline',
              color: '#6366F1',
            },
          ].map((card) => (
            <div
              key={card.stat}
              style={{
                padding: '36px 28px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: card.color,
                  letterSpacing: '-0.03em',
                  marginBottom: 8,
                }}
              >
                {card.stat}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: '#94A3B8',
                  lineHeight: 1.5,
                }}
              >
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <Section>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel>Features</SectionLabel>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Everything you need for EU AI Act compliance
          </h2>
          <p
            style={{
              fontSize: 18,
              color: '#64748B',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            From risk classification to post-market monitoring, all in a single
            open-source platform.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {[
            {
              icon: <ShieldIcon />,
              title: 'Risk Classification',
              desc: 'Automated 4-tier classification per Articles 5-6 and Annex III. Prohibited, high, limited, and minimal risk detection.',
            },
            {
              icon: <FileIcon />,
              title: 'Document Generator',
              desc: 'Generate Annex IV technical documentation, model cards, and compliance checklists with pre-filled templates.',
            },
            {
              icon: <CheckCircleIcon />,
              title: 'Conformity Assessment',
              desc: 'Internal and third-party assessment workflows per Article 43. Track assessment status and evidence collection.',
            },
            {
              icon: <ActivityIcon />,
              title: 'Post-Market Monitoring',
              desc: 'Continuous monitoring of deployed AI systems. Incident tracking with Article 62 compliant 72-hour alerts.',
            },
            {
              icon: <TerminalIcon />,
              title: 'CI/CD Gates',
              desc: 'Block non-compliant AI deployments in your pipeline. GitHub Actions and GitLab CI support out of the box.',
            },
            {
              icon: <LinkIcon />,
              title: 'Bulwark Integration',
              desc: 'Connect with Bulwark AI for runtime governance: PII detection, prompt injection defense, and audit logging.',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              style={{
                padding: '32px 28px',
                borderRadius: 16,
                background: '#FAFBFC',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {feat.icon}
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: '0 0 10px',
                  letterSpacing: '-0.01em',
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: '#64748B',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <Section dark>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#F8FAFC',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Four steps to compliance
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}
        >
          {[
            {
              step: '01',
              title: 'Register',
              desc: 'Register your AI systems in the compliance registry with metadata and purpose descriptions.',
            },
            {
              step: '02',
              title: 'Classify',
              desc: 'Automated risk classification maps your systems to EU AI Act tiers with applicable articles.',
            },
            {
              step: '03',
              title: 'Document',
              desc: 'Generate Annex IV technical documentation, model cards, and conformity assessment checklists.',
            },
            {
              step: '04',
              title: 'Monitor',
              desc: 'Continuous post-market monitoring with incident tracking and automated 72-hour alert workflows.',
            },
          ].map((item) => (
            <div key={item.step} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#818CF8',
                  letterSpacing: '-0.02em',
                }}
              >
                {item.step}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#F8FAFC',
                  margin: '0 0 10px',
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: '#94A3B8',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ CLI DEMO ═══════════════ */}
      <Section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'center',
          }}
        >
          <div>
            <SectionLabel>Developer Experience</SectionLabel>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 16px',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              Compliance from your terminal
            </h2>
            <p
              style={{
                fontSize: 16,
                color: '#64748B',
                lineHeight: 1.7,
                margin: '0 0 24px',
              }}
            >
              Comply AI is developer-native. Classify risk levels, generate
              documentation, and run compliance checks directly from your CLI or
              CI/CD pipeline. No browser required.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {[
                'Offline classification (no server needed)',
                'CI/CD exit codes for pipeline gates',
                'JSON output for automation',
                'Config file for team-wide settings',
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: '#334155',
                    fontWeight: 500,
                  }}
                >
                  <CheckIcon />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Terminal mockup */}
          <div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            }}
          >
            {/* Title bar */}
            <div
              style={{
                background: '#1E293B',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#EF4444',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#F59E0B',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#22C55E',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: '#64748B',
                  marginLeft: 8,
                  fontFamily: 'monospace',
                }}
              >
                terminal
              </span>
            </div>
            {/* Terminal content */}
            <div
              style={{
                background: '#0F172A',
                padding: '24px',
                fontFamily:
                  '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
                fontSize: 13,
                lineHeight: 1.8,
                color: '#E2E8F0',
                overflowX: 'auto',
              }}
            >
              <div>
                <span style={{ color: '#22C55E' }}>$</span>{' '}
                <span style={{ color: '#F8FAFC' }}>comply-ai classify</span>{' '}
                <span style={{ color: '#64748B' }}>
                  --name &quot;Resume Screener&quot; --category employment
                </span>
              </div>
              <div style={{ color: '#475569', margin: '4px 0' }}>&nbsp;</div>
              <div>
                <span style={{ color: '#818CF8' }}>{'  '}Risk Level:</span>{' '}
                <span
                  style={{
                    color: '#F97316',
                    fontWeight: 700,
                  }}
                >
                  HIGH
                </span>
              </div>
              <div>
                <span style={{ color: '#818CF8' }}>{'  '}Annex III:</span>{' '}
                <span style={{ color: '#E2E8F0' }}>
                  Category 4 (Employment)
                </span>
              </div>
              <div>
                <span style={{ color: '#818CF8' }}>{'  '}Articles:</span>{' '}
                <span style={{ color: '#E2E8F0' }}>6, 8, 9, 10, 11, 12, 13, 14, 15</span>
              </div>
              <div>
                <span style={{ color: '#818CF8' }}>{'  '}Requirements:</span>
              </div>
              <div style={{ color: '#94A3B8' }}>
                {'    '}- Risk management system (Art. 9)
              </div>
              <div style={{ color: '#94A3B8' }}>
                {'    '}- Data governance (Art. 10)
              </div>
              <div style={{ color: '#94A3B8' }}>
                {'    '}- Technical documentation (Art. 11)
              </div>
              <div style={{ color: '#94A3B8' }}>
                {'    '}- Transparency obligations (Art. 13)
              </div>
              <div style={{ color: '#94A3B8' }}>
                {'    '}- Human oversight measures (Art. 14)
              </div>
              <div style={{ color: '#475569', margin: '4px 0' }}>&nbsp;</div>
              <div>
                <span style={{ color: '#22C55E' }}>{'  \u2714'}</span>{' '}
                <span style={{ color: '#94A3B8' }}>
                  Conformity assessment required (Art. 43)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════ COMPARISON ═══════════════ */}
      <Section dark>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel>Comparison</SectionLabel>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#F8FAFC',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Why Comply AI?
          </h2>
          <p
            style={{
              fontSize: 18,
              color: '#94A3B8',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            The only open-source, self-hosted, developer-native EU AI Act
            compliance engine.
          </p>
        </div>

        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr>
                {['Feature', 'Comply AI', 'Vanta', 'Holistic AI', 'Daiki AI'].map(
                  (h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: '16px 20px',
                        textAlign: i === 0 ? 'left' : 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        color: i === 1 ? '#818CF8' : '#94A3B8',
                        background:
                          i === 1
                            ? 'rgba(99, 102, 241, 0.08)'
                            : 'rgba(255,255,255,0.02)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                ['Deployment', 'Self-hosted', 'SaaS only', 'SaaS only', 'SaaS only'],
                ['Open Source', 'yes', 'no', 'no', 'no'],
                ['EU AI Act Focus', 'Primary', 'Secondary', 'Partial', 'Partial'],
                ['Risk Classification', 'Automated', 'Manual', 'Partial', 'Partial'],
                ['GPAI Assessment', 'yes', 'no', 'partial', 'no'],
                ['CLI Tool', 'yes', 'no', 'no', 'no'],
                ['CI/CD Integration', 'yes', 'no', 'no', 'no'],
                ['Conformity Assessment', 'yes', 'no', 'partial', 'no'],
                ['Data Residency', 'Your infra', 'US/EU', 'US/EU', 'EU'],
                ['Pricing', 'Free', '$$$$', '$$$$', '$$$'],
              ].map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    let content: React.ReactNode = cell;
                    if (ci > 0) {
                      if (cell === 'yes') content = <CheckIcon />;
                      else if (cell === 'no') content = <XIcon />;
                      else if (cell === 'partial') content = <PartialIcon />;
                    }
                    return (
                      <td
                        key={ci}
                        style={{
                          padding: '14px 20px',
                          textAlign: ci === 0 ? 'left' : 'center',
                          color: ci === 0 ? '#E2E8F0' : '#94A3B8',
                          fontWeight: ci === 0 ? 500 : 400,
                          fontSize: 13,
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background:
                            ci === 1
                              ? 'rgba(99, 102, 241, 0.04)'
                              : 'transparent',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              ci === 0 ? 'flex-start' : 'center',
                          }}
                        >
                          {content}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <Section>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel>Pricing</SectionLabel>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Start free. Scale when ready.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
            maxWidth: 960,
            margin: '0 auto',
          }}
        >
          {[
            {
              name: 'Open Source',
              price: 'Free',
              period: 'forever',
              desc: 'For individual developers and small teams getting started with EU AI Act compliance.',
              features: [
                'Risk classification engine',
                'CLI tool (all commands)',
                'Model card generation',
                'Compliance checklists',
                'Community support',
                'Self-hosted dashboard',
              ],
              cta: 'Get Started',
              ctaHref: 'https://github.com/afkzona/comply-ai',
              highlighted: false,
            },
            {
              name: 'Team',
              price: '\u20AC299',
              period: '/month',
              desc: 'For teams managing multiple AI systems with collaboration and advanced features.',
              features: [
                'Everything in Open Source',
                'Up to 50 AI systems',
                'Team collaboration',
                'Conformity workflows',
                'PDF export',
                'Email + chat support',
                'SSO / SAML',
              ],
              cta: 'Contact Sales',
              ctaHref: 'mailto:info@afkzonagroup.lt',
              highlighted: true,
            },
            {
              name: 'Enterprise',
              price: '\u20AC999',
              period: '/month',
              desc: 'For organizations with complex compliance requirements and dedicated support.',
              features: [
                'Everything in Team',
                'Unlimited AI systems',
                'Dedicated account manager',
                'Custom integrations',
                'On-premise deployment',
                'SLA guarantee',
                'Compliance consulting',
                'Audit trail export',
              ],
              cta: 'Contact Sales',
              ctaHref: 'mailto:info@afkzonagroup.lt',
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              style={{
                padding: '36px 28px',
                borderRadius: 16,
                background: plan.highlighted ? '#0F172A' : '#FAFBFC',
                border: plan.highlighted
                  ? '2px solid #6366F1'
                  : '1px solid #E2E8F0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                ...(plan.highlighted
                  ? {
                      boxShadow:
                        '0 0 40px rgba(99, 102, 241, 0.15), 0 20px 40px rgba(0,0,0,0.1)',
                      transform: 'scale(1.03)',
                    }
                  : {}),
              }}
            >
              {plan.highlighted && (
                <div
                  style={{
                    position: 'absolute',
                    top: -13,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 16px',
                    borderRadius: 100,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Most Popular
                </div>
              )}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: plan.highlighted ? '#818CF8' : '#6366F1',
                  marginBottom: 8,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                {plan.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 42,
                    fontWeight: 900,
                    color: plan.highlighted ? '#F8FAFC' : '#0F172A',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {plan.price}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: plan.highlighted ? '#64748B' : '#94A3B8',
                  }}
                >
                  {plan.period}
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: plan.highlighted ? '#94A3B8' : '#64748B',
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}
              >
                {plan.desc}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 28,
                  flex: 1,
                }}
              >
                {plan.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13,
                      color: plan.highlighted ? '#CBD5E1' : '#475569',
                      fontWeight: 450,
                    }}
                  >
                    <CheckIcon />
                    {f}
                  </div>
                ))}
              </div>
              <a
                href={plan.ctaHref}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 24px',
                  borderRadius: 10,
                  background: plan.highlighted
                    ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                    : 'transparent',
                  border: plan.highlighted
                    ? 'none'
                    : '1px solid #E2E8F0',
                  color: plan.highlighted ? '#fff' : '#334155',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  ...(plan.highlighted
                    ? {
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                      }
                    : {}),
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section
        style={{
          padding: '96px 32px',
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #EEF2FF 50%, #FFFFFF 100%)',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 16px',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}
          >
            Start classifying your AI systems today
          </h2>
          <p
            style={{
              fontSize: 18,
              color: '#64748B',
              lineHeight: 1.6,
              margin: '0 0 36px',
            }}
          >
            Open-source, self-hosted, and built for developers. Get compliant
            before the August 2026 deadline.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://github.com/afkzona/comply-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow:
                  '0 0 24px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Clone from GitHub
            </a>
            <Link
              href="/docs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 32px',
                borderRadius: 10,
                background: '#fff',
                border: '1px solid #E2E8F0',
                color: '#334155',
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              Read the Docs
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ DISCLAIMER ═══════════════ */}
      <section
        style={{
          padding: '32px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            padding: '20px 24px',
            borderRadius: 12,
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#92400E',
              marginBottom: 8,
            }}
          >
            Legal Disclaimer
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
            Use of this software does not by itself ensure compliance with the EU AI
            Act (Regulation 2024/1689) or any other laws or regulations. EU AI Act
            article references are informational and do not constitute legal advice.
            Users should consult qualified legal counsel for compliance decisions.
          </p>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer
        style={{
          padding: '48px 32px',
          background: '#0F172A',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                C
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#E2E8F0',
                  letterSpacing: '-0.01em',
                }}
              >
                Comply AI
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Built by{' '}
              <a
                href="https://afkzonagroup.lt"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#818CF8', textDecoration: 'none' }}
              >
                AFKzona Group
              </a>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <a
              href="https://github.com/afkzona/comply-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                color: '#94A3B8',
                textDecoration: 'none',
              }}
            >
              GitHub
            </a>
            <a
              href="https://github.com/antonmacius-droid/bulwark-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                color: '#94A3B8',
                textDecoration: 'none',
              }}
            >
              Bulwark AI
            </a>
            <Link
              href="/docs"
              style={{
                fontSize: 13,
                color: '#94A3B8',
                textDecoration: 'none',
              }}
            >
              Docs
            </Link>
            <a
              href="mailto:info@afkzonagroup.lt"
              style={{
                fontSize: 13,
                color: '#94A3B8',
                textDecoration: 'none',
              }}
            >
              Contact
            </a>
          </div>

          <div style={{ fontSize: 12, color: '#475569' }}>
            &copy; {new Date().getFullYear()} AFKzona Group. MIT + BSL 1.1
          </div>
        </div>
      </footer>
    </>
  );
}
