'use client';

import { Card, KpiCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const systemHealth = [
  { name: 'Credit Scoring Model', performance: 'pass', drift: 'warning', bias: 'pass', lastCheck: '2 hours ago' },
  { name: 'Resume Screening AI', performance: 'pass', drift: 'pass', bias: 'pass', lastCheck: '3 hours ago' },
  { name: 'Fraud Detection System', performance: 'pass', drift: 'pass', bias: 'warning', lastCheck: '2 hours ago' },
  { name: 'Customer Support Chatbot', performance: 'pass', drift: 'pass', bias: 'pass', lastCheck: '1 hour ago' },
  { name: 'Recommendation Engine', performance: 'pass', drift: 'pass', bias: 'pass', lastCheck: '4 hours ago' },
  { name: 'Document Summarizer', performance: 'warning', drift: 'pass', bias: 'pass', lastCheck: '2 hours ago' },
];

const recentChecks = [
  { system: 'Credit Scoring Model', type: 'Drift', status: 'warning', detail: 'PSI: 0.18 (threshold: 0.15)', time: '2026-04-04 14:00' },
  { system: 'Document Summarizer', type: 'Performance', status: 'warning', detail: 'Latency p99: 4.2s (threshold: 3s)', time: '2026-04-04 14:00' },
  { system: 'Fraud Detection System', type: 'Bias', status: 'warning', detail: 'DI ratio age group 18-25: 0.78', time: '2026-04-04 14:00' },
  { system: 'Credit Scoring Model', type: 'Performance', status: 'pass', detail: 'AUC: 0.92, F1: 0.87', time: '2026-04-04 14:00' },
  { system: 'Resume Screening AI', type: 'Drift', status: 'pass', detail: 'PSI: 0.04', time: '2026-04-04 10:00' },
  { system: 'Resume Screening AI', type: 'Bias', status: 'pass', detail: 'DI ratio: 0.88 (all groups)', time: '2026-04-04 10:00' },
  { system: 'Customer Support Chatbot', type: 'Performance', status: 'pass', detail: 'Avg response time: 1.2s', time: '2026-04-04 08:00' },
  { system: 'Recommendation Engine', type: 'Performance', status: 'pass', detail: 'CTR: 4.8%, nDCG: 0.72', time: '2026-04-03 14:00' },
];

const statusDot = (s: string) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: s === 'pass' ? '#22C55E' : s === 'warning' ? '#EAB308' : '#EF4444',
  display: 'inline-block' as const,
});

export default function MonitoringPage() {
  const warnings = recentChecks.filter(c => c.status === 'warning').length;
  const failures = recentChecks.filter(c => c.status === 'fail').length;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          Post-Market Monitoring
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          Continuous monitoring of AI system performance, drift, and bias (Article 72)
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Systems Monitored" value={systemHealth.length} />
        <KpiCard label="Checks Today" value={recentChecks.length} change="Running every 6h" changeType="neutral" />
        <KpiCard label="Warnings" value={warnings} change={warnings > 0 ? 'Action needed' : 'All clear'} changeType={warnings > 0 ? 'negative' : 'positive'} />
        <KpiCard label="Failures" value={failures} change="0 critical" changeType="positive" />
      </div>

      {/* System Health Overview */}
      <Card style={{ marginBottom: 24 }} padding={false}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>System Health Overview</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['System', 'Performance', 'Drift', 'Bias', 'Last Check'].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    textAlign: 'left',
                    borderBottom: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {systemHealth.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>
                  {s.name}
                </td>
                {(['performance', 'drift', 'bias'] as const).map(check => (
                  <td key={check} style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={statusDot(s[check])} />
                      <span style={{ fontSize: 12, color: s[check] === 'pass' ? '#16A34A' : s[check] === 'warning' ? '#CA8A04' : '#DC2626', fontWeight: 500 }}>
                        {s[check]}
                      </span>
                    </div>
                  </td>
                ))}
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8' }}>{s.lastCheck}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Recent Checks */}
      <Card>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>Recent Monitoring Checks</h2>
        {recentChecks.map((check, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: i < recentChecks.length - 1 ? '1px solid #F1F5F9' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={statusDot(check.status)} />
              <div>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  <span style={{ fontWeight: 500 }}>{check.system}</span>
                  <span style={{ color: '#94A3B8' }}> &mdash; {check.type}</span>
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{check.detail}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge variant={check.status === 'pass' ? 'success' : check.status === 'warning' ? 'warning' : 'danger'}>
                {check.status}
              </Badge>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{check.time}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
