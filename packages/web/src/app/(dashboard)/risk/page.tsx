'use client';

import { Card, KpiCard } from '@/components/ui/card';
import { Badge, RiskBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const needsAssessment = [
  { name: 'Content Moderation AI', risk: 'limited' as const, reason: 'Newly registered — no assessment yet' },
  { name: 'Credit Scoring Model', risk: 'high' as const, reason: 'Assessment expires in 6 days' },
  { name: 'Emotion Recognition (CCTV)', risk: 'high' as const, reason: 'Re-assessment required after status change' },
];

const recentAssessments = [
  { system: 'Resume Screening AI', risk: 'high' as const, status: 'approved', assessor: 'Maria L.', date: '2026-03-15' },
  { system: 'Customer Support Chatbot', risk: 'limited' as const, status: 'submitted', assessor: 'Anton K.', date: '2026-03-12' },
  { system: 'Fraud Detection System', risk: 'high' as const, status: 'approved', assessor: 'Jan D.', date: '2026-03-10' },
  { system: 'Document Summarizer', risk: 'gpai' as const, status: 'approved', assessor: 'Sarah M.', date: '2026-03-08' },
  { system: 'Recommendation Engine', risk: 'minimal' as const, status: 'approved', assessor: 'Anton K.', date: '2026-02-28' },
];

const riskDistribution = [
  { level: 'High Risk', count: 4, color: '#F97316', pct: 31 },
  { level: 'Limited Risk', count: 5, color: '#EAB308', pct: 38 },
  { level: 'Minimal Risk', count: 3, color: '#22C55E', pct: 23 },
  { level: 'GPAI', count: 1, color: '#3B82F6', pct: 8 },
];

export default function RiskAssessmentPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          Risk Assessment
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          Assess and classify AI systems per EU AI Act risk categories
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Total Assessments" value={18} change="+3 this month" changeType="neutral" />
        <KpiCard label="Pending Review" value={3} change="1 overdue" changeType="negative" />
        <KpiCard label="High-Risk Systems" value={4} change="30% of total" changeType="neutral" />
        <KpiCard label="Avg. Assessment Time" value="4.2d" change="-0.8d from last quarter" changeType="positive" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Needs Assessment */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Needs Assessment
              </h2>
              <Badge variant="danger">{needsAssessment.length} pending</Badge>
            </div>
            {needsAssessment.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < needsAssessment.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{item.name}</span>
                    <RiskBadge level={item.risk} />
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.reason}</div>
                </div>
                <Button size="sm">Assess</Button>
              </div>
            ))}
          </Card>

          {/* Recent Assessments */}
          <Card>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>
              Recent Assessments
            </h2>
            {recentAssessments.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < recentAssessments.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{a.system}</span>
                  <RiskBadge level={a.risk} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{a.assessor}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{a.date}</span>
                  <Badge variant={a.status === 'approved' ? 'success' : 'warning'}>{a.status}</Badge>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 20px' }}>
            Risk Distribution
          </h2>

          {/* Bar chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {riskDistribution.map((item) => (
              <div key={item.level}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>{item.level}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{item.count}</span>
                </div>
                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.pct}%`,
                      background: item.color,
                      borderRadius: 4,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ marginTop: 24, padding: '16px 0 0', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>Article 6 Classification Summary</div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
              4 systems classified as high-risk under Annex III. All require conformity assessment before market deployment or continued operation.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
