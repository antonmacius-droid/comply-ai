'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const assessments = [
  {
    system: 'Credit Scoring Model',
    risk: 'High Risk',
    status: 'in_progress' as const,
    progress: 72,
    total: 47,
    completed: 34,
    notifiedBody: 'TUV Rheinland',
    certificateId: null,
    validUntil: null,
  },
  {
    system: 'Resume Screening AI',
    risk: 'High Risk',
    status: 'certified' as const,
    progress: 100,
    total: 47,
    completed: 47,
    notifiedBody: 'BSI Group',
    certificateId: 'CE-AI-2026-0042',
    validUntil: '2027-03-01',
  },
  {
    system: 'Fraud Detection System',
    risk: 'High Risk',
    status: 'in_progress' as const,
    progress: 45,
    total: 47,
    completed: 21,
    notifiedBody: null,
    certificateId: null,
    validUntil: null,
  },
  {
    system: 'Emotion Recognition (CCTV)',
    risk: 'High Risk',
    status: 'not_started' as const,
    progress: 0,
    total: 47,
    completed: 0,
    notifiedBody: null,
    certificateId: null,
    validUntil: null,
  },
];

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  certified: 'Certified',
};

const statusVariant: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  not_started: 'default',
  in_progress: 'warning',
  submitted: 'info',
  certified: 'success',
};

const sampleChecklist = [
  { ref: 'Art. 9(1)', desc: 'Risk management system established', status: 'compliant' },
  { ref: 'Art. 9(2)', desc: 'Identification and analysis of known and foreseeable risks', status: 'compliant' },
  { ref: 'Art. 10(1)', desc: 'Data governance and management practices', status: 'compliant' },
  { ref: 'Art. 10(2)', desc: 'Training, validation, and testing datasets examination', status: 'non_compliant' },
  { ref: 'Art. 11(1)', desc: 'Technical documentation drawn up', status: 'compliant' },
  { ref: 'Art. 12(1)', desc: 'Automatic logging capabilities', status: 'pending' },
  { ref: 'Art. 13(1)', desc: 'Transparency and provision of information to deployers', status: 'pending' },
  { ref: 'Art. 14(1)', desc: 'Human oversight measures', status: 'compliant' },
  { ref: 'Art. 15(1)', desc: 'Accuracy, robustness, and cybersecurity', status: 'pending' },
];

const checkStatusColors: Record<string, { bg: string; color: string }> = {
  compliant: { bg: '#F0FDF4', color: '#16A34A' },
  non_compliant: { bg: '#FEF2F2', color: '#DC2626' },
  pending: { bg: '#F1F5F9', color: '#64748B' },
  na: { bg: '#F8FAFC', color: '#94A3B8' },
};

export default function ConformityPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          Conformity Assessment
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          Track conformity assessment progress for high-risk AI systems
        </p>
      </div>

      {/* System cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
        {assessments.map((a, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{a.system}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{a.risk}</div>
              </div>
              <Badge variant={statusVariant[a.status]}>{statusLabels[a.status]}</Badge>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Checklist Progress</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{a.completed}/{a.total}</span>
              </div>
              <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${a.progress}%`,
                    background: a.progress === 100 ? '#22C55E' : '#6366F1',
                    borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {a.notifiedBody && (
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Notified Body: <span style={{ color: '#334155', fontWeight: 500 }}>{a.notifiedBody}</span>
                </div>
              )}
              {a.certificateId && (
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Certificate: <span style={{ color: '#334155', fontWeight: 500 }}>{a.certificateId}</span>
                </div>
              )}
              {a.validUntil && (
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Valid Until: <span style={{ color: '#334155', fontWeight: 500 }}>{a.validUntil}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Sample checklist */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Checklist — Credit Scoring Model
            </h2>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              EU AI Act high-risk system requirements (Articles 9-15)
            </div>
          </div>
          <Button size="sm" variant="secondary">Export Checklist</Button>
        </div>

        {sampleChecklist.map((item, i) => {
          const sc = checkStatusColors[item.status];
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < sampleChecklist.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6366F1',
                    background: '#EEF2FF',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                  }}
                >
                  {item.ref}
                </span>
                <span style={{ fontSize: 13, color: '#334155' }}>{item.desc}</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: sc.bg,
                  color: sc.color,
                }}
              >
                {item.status.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
