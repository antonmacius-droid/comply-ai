'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge, RiskBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const mockSystem = {
  id: '1',
  name: 'Credit Scoring Model',
  description:
    'Machine learning model used for automated credit scoring decisions. Evaluates applicant creditworthiness based on financial history, employment data, and behavioral signals.',
  purpose: 'Automated individual credit scoring affecting access to financial services (Annex III, 5b)',
  riskLevel: 'high' as const,
  status: 'active',
  provider: 'Internal',
  model: 'XGBoost v3.2',
  deploymentType: 'Cloud (AWS EU-West-1)',
  createdAt: '2025-06-15',
  lastAssessed: '2026-03-15',
};

const tabs = ['Overview', 'Risk Assessment', 'Documents', 'Evidence', 'Monitoring', 'Incidents'];

function OverviewTab() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>System Details</h3>
        {[
          ['Provider', mockSystem.provider],
          ['Model', mockSystem.model],
          ['Deployment', mockSystem.deploymentType],
          ['Registered', mockSystem.createdAt],
          ['Last Assessment', mockSystem.lastAssessed],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
            <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </Card>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>Purpose & Scope</h3>
        <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0 }}>{mockSystem.purpose}</p>
        <div style={{ marginTop: 16, padding: '12px 14px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#EA580C', marginBottom: 4 }}>Annex III Classification</div>
          <div style={{ fontSize: 13, color: '#9A3412' }}>Category 5(b) — Credit scoring and creditworthiness assessment</div>
        </div>
      </Card>
    </div>
  );
}

function RiskAssessmentTab() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Risk Assessments</h3>
        <Button size="sm">+ New Assessment</Button>
      </div>
      {[
        { version: 'v3', date: '2026-03-15', assessor: 'Maria L.', status: 'approved', level: 'high' as const },
        { version: 'v2', date: '2025-11-20', assessor: 'Anton K.', status: 'approved', level: 'high' as const },
        { version: 'v1', date: '2025-06-15', assessor: 'Jan D.', status: 'approved', level: 'high' as const },
      ].map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{a.version}</span>
            <RiskBadge level={a.level} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{a.assessor}</span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{a.date}</span>
            <Badge variant="success">{a.status}</Badge>
          </div>
        </div>
      ))}
    </Card>
  );
}

function DocumentsTab() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Compliance Documents</h3>
        <Button size="sm">+ Generate Document</Button>
      </div>
      {[
        { title: 'Annex IV Technical Documentation', type: 'annex_iv', status: 'approved', date: '2026-03-10' },
        { title: 'Risk Assessment Report v3', type: 'risk_report', status: 'approved', date: '2026-03-15' },
        { title: 'Model Card — XGBoost v3.2', type: 'model_card', status: 'review', date: '2026-03-18' },
      ].map((doc, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{doc.title}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{doc.date}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant={doc.status === 'approved' ? 'success' : 'warning'}>{doc.status}</Badge>
            <Button variant="ghost" size="sm">Download PDF</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

function EvidenceTab() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Evidence Artifacts</h3>
        <Button size="sm">+ Upload Evidence</Button>
      </div>
      {[
        { title: 'Model Training Report', type: 'PDF', tags: ['training', 'validation'], date: '2026-03-01' },
        { title: 'Bias Audit Results Q1 2026', type: 'CSV', tags: ['bias', 'audit'], date: '2026-03-12' },
        { title: 'Data Quality Assessment', type: 'PDF', tags: ['data', 'quality'], date: '2026-02-28' },
        { title: 'Performance Benchmarks', type: 'JSON', tags: ['performance'], date: '2026-03-05' },
      ].map((ev, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{ev.title}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {ev.tags.map((t) => (
                <span key={t} style={{ fontSize: 10, padding: '1px 6px', background: '#F1F5F9', borderRadius: 4, color: '#64748B' }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge variant="default">{ev.type}</Badge>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{ev.date}</span>
          </div>
        </div>
      ))}
    </Card>
  );
}

function MonitoringTab() {
  return (
    <Card>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>Monitoring Checks</h3>
      {[
        { type: 'Performance', status: 'pass', date: '2026-04-03 14:00', detail: 'AUC: 0.92, F1: 0.87' },
        { type: 'Drift', status: 'warning', date: '2026-04-03 14:00', detail: 'PSI: 0.18 (threshold: 0.15)' },
        { type: 'Bias', status: 'pass', date: '2026-04-02 10:00', detail: 'DI ratio: 0.84 (compliant)' },
        { type: 'Performance', status: 'pass', date: '2026-04-01 14:00', detail: 'AUC: 0.91, F1: 0.86' },
      ].map((check, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: check.status === 'pass' ? '#22C55E' : check.status === 'warning' ? '#EAB308' : '#EF4444',
            }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{check.type}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{check.detail}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant={check.status === 'pass' ? 'success' : 'warning'}>{check.status}</Badge>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{check.date}</span>
          </div>
        </div>
      ))}
    </Card>
  );
}

function IncidentsTab() {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Incidents</h3>
        <Button size="sm" variant="danger">+ Report Incident</Button>
      </div>
      {[
        { title: 'Unexpected score distribution shift', severity: 'medium', status: 'investigating', date: '2026-03-28' },
        { title: 'API latency spike (>2s)', severity: 'low', status: 'resolved', date: '2026-03-15' },
      ].map((inc, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{inc.title}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Detected: {inc.date}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant={inc.severity === 'critical' ? 'danger' : inc.severity === 'high' ? 'danger' : inc.severity === 'medium' ? 'warning' : 'default'}>
              {inc.severity}
            </Badge>
            <Badge variant={inc.status === 'resolved' ? 'success' : inc.status === 'investigating' ? 'info' : 'warning'}>
              {inc.status}
            </Badge>
          </div>
        </div>
      ))}
    </Card>
  );
}

const tabComponents: Record<string, () => React.ReactElement> = {
  Overview: OverviewTab,
  'Risk Assessment': RiskAssessmentTab,
  Documents: DocumentsTab,
  Evidence: EvidenceTab,
  Monitoring: MonitoringTab,
  Incidents: IncidentsTab,
};

export default function SystemDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const TabContent = tabComponents[activeTab];

  return (
    <div>
      {/* Back link */}
      <a
        href="/registry"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 13,
          color: '#64748B',
          textDecoration: 'none',
          marginBottom: 16,
        }}
      >
        &larr; Back to Registry
      </a>

      {/* Hero Card */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                {mockSystem.name}
              </h1>
              <RiskBadge level={mockSystem.riskLevel} />
              <Badge variant="success">{mockSystem.status}</Badge>
            </div>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0, maxWidth: 700, lineHeight: 1.5 }}>
              {mockSystem.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm">Edit</Button>
            <Button size="sm">Run Assessment</Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #E2E8F0',
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#6366F1' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? '#6366F1' : 'transparent'}`,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <TabContent />
    </div>
  );
}
