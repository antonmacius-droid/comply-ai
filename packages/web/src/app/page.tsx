'use client';

import { KpiCard, Card } from '@/components/ui/card';
import { Badge, RiskBadge } from '@/components/ui/badge';

const recentActivity = [
  { action: 'Risk assessment submitted', system: 'Customer Support Chatbot', user: 'Maria L.', time: '2 hours ago' },
  { action: 'Document approved', system: 'Resume Screening AI', user: 'Anton K.', time: '4 hours ago' },
  { action: 'New incident reported', system: 'Credit Scoring Model', user: 'Jan D.', time: '6 hours ago' },
  { action: 'System registered', system: 'Content Moderation AI', user: 'Sarah M.', time: '1 day ago' },
  { action: 'Monitoring alert', system: 'Fraud Detection System', user: 'System', time: '1 day ago' },
];

const systemsByRisk = [
  { level: 'high' as const, count: 4, pct: 30 },
  { level: 'limited' as const, count: 5, pct: 38 },
  { level: 'minimal' as const, count: 3, pct: 23 },
  { level: 'gpai' as const, count: 1, pct: 8 },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          EU AI Act compliance overview for your organization
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <KpiCard
          label="Total AI Systems"
          value={13}
          change="+2 this month"
          changeType="neutral"
        />
        <KpiCard
          label="High-Risk Systems"
          value={4}
          change="1 pending assessment"
          changeType="negative"
        />
        <KpiCard
          label="Pending Assessments"
          value={3}
          change="2 due this week"
          changeType="negative"
        />
        <KpiCard
          label="Open Incidents"
          value={2}
          change="-1 from last week"
          changeType="positive"
        />
        <KpiCard
          label="Compliance Score"
          value="78%"
          change="+4% this month"
          changeType="positive"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Recent Activity */}
        <Card>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Recent Activity
            </h2>
          </div>
          <div>
            {recentActivity.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
                    {item.action}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                    {item.system} &middot; {item.user}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Risk Distribution
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {systemsByRisk.map((item) => (
              <div key={item.level}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <RiskBadge level={item.level} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    {item.count}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: '#F1F5F9',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${item.pct}%`,
                      borderRadius: 3,
                      background:
                        item.level === 'high'
                          ? '#F97316'
                          : item.level === 'limited'
                          ? '#EAB308'
                          : item.level === 'gpai'
                          ? '#3B82F6'
                          : '#22C55E',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Compliance donut placeholder */}
          <div
            style={{
              marginTop: 28,
              padding: '20px 0 0',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#64748B',
                marginBottom: 12,
              }}
            >
              Overall Compliance
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `conic-gradient(#6366F1 0% 78%, #E2E8F0 78% 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#0F172A',
                  }}
                >
                  78%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  10 of 13 systems compliant
                </div>
                <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 500, marginTop: 4 }}>
                  +4% from last assessment
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
            Upcoming Deadlines
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            {
              title: 'Credit Scoring Model — Risk Assessment Due',
              date: 'Apr 10, 2026',
              status: 'urgent',
            },
            {
              title: 'Resume Screening AI — Conformity Re-certification',
              date: 'Apr 25, 2026',
              status: 'upcoming',
            },
            {
              title: 'All High-Risk Systems — Annual Review',
              date: 'May 15, 2026',
              status: 'scheduled',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid #F1F5F9',
                background: '#FAFBFC',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>{item.date}</span>
                <Badge
                  variant={
                    item.status === 'urgent'
                      ? 'danger'
                      : item.status === 'upcoming'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
