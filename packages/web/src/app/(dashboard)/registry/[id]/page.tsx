'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge, RiskBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SystemData {
  id: string;
  name: string;
  description: string;
  purpose: string;
  riskLevel: 'high' | 'limited' | 'minimal' | 'gpai';
  status: string;
  provider: string;
  version: string;
  deploymentType: string;
  createdAt: string;
  updatedAt: string;
  annexIIICategory?: string;
}

const tabs = ['Overview', 'Risk Assessment', 'Documents', 'Evidence', 'Monitoring', 'Incidents'];

function OverviewTab({ system }: { system: SystemData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>System Details</h3>
        {[
          ['Provider', system.provider],
          ['Version', system.version],
          ['Deployment', system.deploymentType || '-'],
          ['Registered', system.createdAt ? new Date(system.createdAt).toLocaleDateString() : '-'],
          ['Last Updated', system.updatedAt ? new Date(system.updatedAt).toLocaleDateString() : '-'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
            <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </Card>
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>Purpose & Scope</h3>
        <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0 }}>{system.purpose || system.description}</p>
        {system.annexIIICategory && (
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#EA580C', marginBottom: 4 }}>Annex III Classification</div>
            <div style={{ fontSize: 13, color: '#9A3412' }}>{system.annexIIICategory}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

function RiskAssessmentTab({ systemId }: { systemId: string }) {
  const [assessments, setAssessments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/assessments?systemId=${systemId}`)
      .then((r) => r.json())
      .then((json) => setAssessments(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [systemId]);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Risk Assessments</h3>
        <Button size="sm">+ New Assessment</Button>
      </div>
      {loading && <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>Loading assessments...</div>}
      {!loading && assessments.length === 0 && (
        <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>No assessments found for this system.</div>
      )}
      {assessments.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{(a.name as string) || `Assessment ${i + 1}`}</span>
            <RiskBadge level={(a.computedRisk as 'high' | 'limited' | 'minimal' | 'gpai') || 'minimal'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{a.createdAt ? new Date(a.createdAt as string).toLocaleDateString() : '-'}</span>
            <Badge variant="success">{(a.status as string) || 'completed'}</Badge>
          </div>
        </div>
      ))}
    </Card>
  );
}

function DocumentsTab({ systemId }: { systemId: string }) {
  const [docs, setDocs] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/documents?systemId=${systemId}`)
      .then((r) => r.json())
      .then((json) => setDocs(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [systemId]);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Compliance Documents</h3>
        <Button size="sm">+ Generate Document</Button>
      </div>
      {loading && <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>Loading documents...</div>}
      {!loading && docs.length === 0 && (
        <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>No documents found for this system.</div>
      )}
      {docs.map((doc, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{(doc.title as string) || (doc.type as string) || 'Document'}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{doc.createdAt ? new Date(doc.createdAt as string).toLocaleDateString() : '-'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant={(doc.status as string) === 'approved' ? 'success' : 'warning'}>{(doc.status as string) || 'draft'}</Badge>
            <Button variant="ghost" size="sm">Download PDF</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

function EvidenceTab({ systemId }: { systemId: string }) {
  const [evidence, setEvidence] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/evidence?systemId=${systemId}`)
      .then((r) => r.json())
      .then((json) => setEvidence(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [systemId]);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Evidence Artifacts</h3>
        <Button size="sm">+ Upload Evidence</Button>
      </div>
      {loading && <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>Loading evidence...</div>}
      {!loading && evidence.length === 0 && (
        <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>No evidence found for this system.</div>
      )}
      {evidence.map((ev, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{(ev.title as string) || 'Evidence'}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {((ev.tags as string[]) || []).map((t) => (
                <span key={t} style={{ fontSize: 10, padding: '1px 6px', background: '#F1F5F9', borderRadius: 4, color: '#64748B' }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge variant="default">{(ev.type as string) || 'file'}</Badge>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{ev.createdAt ? new Date(ev.createdAt as string).toLocaleDateString() : '-'}</span>
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
      <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>
        Monitoring data is available on the dedicated Monitoring page.
      </div>
    </Card>
  );
}

function IncidentsTab({ systemId }: { systemId: string }) {
  const [incidents, setIncidents] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/incidents?systemId=${systemId}`)
      .then((r) => r.json())
      .then((json) => setIncidents(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [systemId]);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>Incidents</h3>
        <Button size="sm" variant="danger">+ Report Incident</Button>
      </div>
      {loading && <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>Loading incidents...</div>}
      {!loading && incidents.length === 0 && (
        <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>No incidents found for this system.</div>
      )}
      {incidents.map((inc, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{inc.title as string}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Detected: {inc.reportedAt ? new Date(inc.reportedAt as string).toLocaleDateString() : '-'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge variant={(inc.severity as string) === 'critical' || (inc.severity as string) === 'high' ? 'danger' : (inc.severity as string) === 'medium' ? 'warning' : 'default'}>
              {inc.severity as string}
            </Badge>
            <Badge variant={(inc.status as string) === 'resolved' ? 'success' : (inc.status as string) === 'investigating' ? 'info' : 'warning'}>
              {inc.status as string}
            </Badge>
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function SystemDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [system, setSystem] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const systemId = params.id as string;

  useEffect(() => {
    if (!systemId) return;
    setLoading(true);
    fetch(`/api/v1/systems/${systemId}`)
      .then((r) => {
        if (!r.ok) throw new Error('System not found');
        return r.json();
      })
      .then((json) => {
        const s = json.data;
        setSystem({
          id: s.id,
          name: s.name,
          description: s.description || '',
          purpose: s.purpose || '',
          riskLevel: s.riskLevel || 'minimal',
          status: s.status || 'draft',
          provider: s.provider || '-',
          version: s.version || '-',
          deploymentType: s.deploymentType || '-',
          createdAt: s.createdAt || '',
          updatedAt: s.updatedAt || '',
          annexIIICategory: s.annexIIICategory,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [systemId]);

  if (loading) {
    return (
      <div>
        <a href="/registry" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748B', textDecoration: 'none', marginBottom: 16 }}>
          &larr; Back to Registry
        </a>
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B', fontSize: 14 }}>Loading system details...</div>
      </div>
    );
  }

  if (error || !system) {
    return (
      <div>
        <a href="/registry" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748B', textDecoration: 'none', marginBottom: 16 }}>
          &larr; Back to Registry
        </a>
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#EF4444', fontSize: 14 }}>
            {error || 'System not found'}
          </div>
        </Card>
      </div>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'Overview': return <OverviewTab system={system!} />;
      case 'Risk Assessment': return <RiskAssessmentTab systemId={systemId} />;
      case 'Documents': return <DocumentsTab systemId={systemId} />;
      case 'Evidence': return <EvidenceTab systemId={systemId} />;
      case 'Monitoring': return <MonitoringTab />;
      case 'Incidents': return <IncidentsTab systemId={systemId} />;
      default: return null;
    }
  }

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
                {system.name}
              </h1>
              <RiskBadge level={system.riskLevel} />
              <Badge variant="success">{system.status}</Badge>
            </div>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0, maxWidth: 700, lineHeight: 1.5 }}>
              {system.description}
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
      {renderTabContent()}
    </div>
  );
}
