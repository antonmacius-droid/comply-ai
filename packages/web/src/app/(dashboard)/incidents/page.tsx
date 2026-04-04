'use client';

import { useState } from 'react';
import { Card, KpiCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const mockIncidents = [
  {
    id: '1',
    title: 'Unexpected score distribution shift',
    system: 'Credit Scoring Model',
    severity: 'medium',
    status: 'investigating',
    detectedAt: '2026-03-28',
    reporter: 'System (Automated)',
    description: 'Monitoring detected a significant shift in credit score distribution for the 25-35 age group.',
  },
  {
    id: '2',
    title: 'Bias detected in gender-based outcomes',
    system: 'Resume Screening AI',
    severity: 'high',
    status: 'open',
    detectedAt: '2026-04-01',
    reporter: 'Maria L.',
    description: 'Disparate impact ratio fell below 0.80 for female applicants in engineering roles.',
  },
  {
    id: '3',
    title: 'API latency spike causing timeouts',
    system: 'Credit Scoring Model',
    severity: 'low',
    status: 'resolved',
    detectedAt: '2026-03-15',
    reporter: 'Jan D.',
    description: 'API response times exceeded 2 seconds for 15 minutes during peak load.',
  },
  {
    id: '4',
    title: 'Model serving incorrect predictions after update',
    system: 'Fraud Detection System',
    severity: 'critical',
    status: 'resolved',
    detectedAt: '2026-02-20',
    reporter: 'System (Automated)',
    description: 'False positive rate jumped to 45% after model version 2.3 deployment. Rolled back immediately.',
  },
  {
    id: '5',
    title: 'Data pipeline failure — stale features',
    system: 'Recommendation Engine',
    severity: 'medium',
    status: 'closed',
    detectedAt: '2026-02-10',
    reporter: 'Anton K.',
    description: 'Feature store pipeline failed causing 6h of stale feature data in recommendations.',
  },
];

const severityVariant: Record<string, 'danger' | 'warning' | 'default'> = {
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'default',
};

const statusVariant: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'default'> = {
  open: 'danger',
  investigating: 'info',
  resolved: 'success',
  closed: 'default',
};

export default function IncidentsPage() {
  const [showReport, setShowReport] = useState(false);

  const open = mockIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const critical = mockIncidents.filter(i => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Incident Management
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
            Track and manage AI system incidents per Article 62 reporting obligations
          </p>
        </div>
        <Button variant="danger" onClick={() => setShowReport(true)}>Report Incident</Button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Total Incidents" value={mockIncidents.length} />
        <KpiCard label="Open / Investigating" value={open} change={open > 0 ? 'Needs attention' : 'All clear'} changeType={open > 0 ? 'negative' : 'positive'} />
        <KpiCard label="Critical" value={critical} change={critical === 0 ? 'None active' : `${critical} active`} changeType={critical > 0 ? 'negative' : 'positive'} />
        <KpiCard label="Avg. Resolution Time" value="3.1d" change="-0.5d from last month" changeType="positive" />
      </div>

      {/* Severity breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Critical', count: mockIncidents.filter(i => i.severity === 'critical').length, color: '#EF4444' },
          { label: 'High', count: mockIncidents.filter(i => i.severity === 'high').length, color: '#F97316' },
          { label: 'Medium', count: mockIncidents.filter(i => i.severity === 'medium').length, color: '#EAB308' },
          { label: 'Low', count: mockIncidents.filter(i => i.severity === 'low').length, color: '#94A3B8' },
        ].map(s => (
          <div
            key={s.label}
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Incidents list */}
      <Card padding={false}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>All Incidents</h2>
        </div>
        {mockIncidents.map((inc, i) => (
          <div
            key={inc.id}
            style={{
              padding: '16px 24px',
              borderBottom: i < mockIncidents.length - 1 ? '1px solid #F1F5F9' : 'none',
              cursor: 'pointer',
              transition: 'background 0.1s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{inc.title}</span>
                  <Badge variant={severityVariant[inc.severity]}>{inc.severity}</Badge>
                  <Badge variant={statusVariant[inc.status]}>{inc.status}</Badge>
                </div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 6 }}>
                  {inc.description}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  {inc.system} &middot; Reported by {inc.reporter} &middot; {inc.detectedAt}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Report modal */}
      <Modal open={showReport} onClose={() => setShowReport(false)} title="Report New Incident" width={600}>
        <Input label="Incident Title" placeholder="Brief description of the incident" />
        <Select
          label="AI System"
          placeholder="Select affected system"
          options={[
            { value: '1', label: 'Credit Scoring Model' },
            { value: '2', label: 'Resume Screening AI' },
            { value: '3', label: 'Fraud Detection System' },
            { value: '4', label: 'Customer Support Chatbot' },
          ]}
        />
        <Select
          label="Severity"
          placeholder="Select severity level"
          options={[
            { value: 'critical', label: 'Critical — System compromised or causing harm' },
            { value: 'high', label: 'High — Significant compliance risk' },
            { value: 'medium', label: 'Medium — Performance degradation' },
            { value: 'low', label: 'Low — Minor issue, no immediate risk' },
          ]}
        />
        <Textarea label="Description" placeholder="Detailed description of what happened, when, and potential impact..." />
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>
            Reporting Obligation
          </div>
          <div style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.5 }}>
            Under Article 62, serious incidents involving high-risk AI systems must be reported to the relevant market surveillance authority without undue delay.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setShowReport(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => setShowReport(false)}>Report Incident</Button>
        </div>
      </Modal>
    </div>
  );
}
