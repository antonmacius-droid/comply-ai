'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge, RiskBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type SystemRow = Record<string, unknown> & {
  id: string;
  name: string;
  riskLevel: 'high' | 'limited' | 'minimal' | 'gpai';
  status: string;
  provider: string;
  model: string;
  lastAssessed: string;
};

const statusStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: '#F0FDF4', color: '#16A34A' },
  draft: { bg: '#F1F5F9', color: '#64748B' },
  archived: { bg: '#FEF2F2', color: '#94A3B8' },
};

export default function RegistryPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [filterRisk, setFilterRisk] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [systems, setSystems] = useState<SystemRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for registration modal
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formRisk, setFormRisk] = useState('');
  const [formDeployment, setFormDeployment] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formModel, setFormModel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSystems = async () => {
    try {
      const params = new URLSearchParams();
      if (filterRisk) params.set('riskLevel', filterRisk);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/v1/systems?${params.toString()}`);
      const json = await res.json();
      const data = (json.data || []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        name: s.name as string,
        riskLevel: (s.riskLevel || 'minimal') as SystemRow['riskLevel'],
        status: (s.status || 'draft') as string,
        provider: (s.provider || '-') as string,
        model: (s.modelName || s.version || '-') as string,
        lastAssessed: s.updatedAt ? new Date(s.updatedAt as string).toISOString().slice(0, 10) : '-',
      }));
      setSystems(data);
    } catch (err) {
      console.error('Failed to fetch systems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, [filterRisk, filterStatus]);

  const handleRegister = async () => {
    if (!formName.trim() || !formDesc.trim() || formDesc.trim().length < 10) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDesc.trim(),
          purpose: formPurpose.trim() || formDesc.trim(),
          riskLevel: formRisk || undefined,
          providerType: formProvider.trim() || undefined,
          modelName: formModel.trim() || undefined,
          deploymentType: formDeployment || undefined,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormName(''); setFormDesc(''); setFormPurpose('');
        setFormRisk(''); setFormDeployment('');
        setFormProvider(''); setFormModel('');
        fetchSystems();
      }
    } catch (err) {
      console.error('Failed to register system:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = systems;

  const columns = [
    {
      key: 'name',
      header: 'System Name',
      render: (row: SystemRow) => (
        <span style={{ fontWeight: 500, color: '#0F172A' }}>{row.name}</span>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Risk Level',
      width: 130,
      render: (row: SystemRow) => <RiskBadge level={row.riskLevel} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: 100,
      render: (row: SystemRow) => {
        const st = statusStyles[row.status] || statusStyles.draft;
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 500,
              background: st.bg,
              color: st.color,
            }}
          >
            {row.status}
          </span>
        );
      },
    },
    { key: 'provider', header: 'Provider', width: 120 },
    { key: 'model', header: 'Model', width: 150 },
    { key: 'lastAssessed', header: 'Last Assessed', width: 130 },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            AI System Registry
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
            Register and manage all AI systems under EU AI Act scope
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Register System</Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          style={{
            padding: '6px 32px 6px 12px',
            fontSize: 13,
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            color: '#334155',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            fontFamily: 'inherit',
          }}
        >
          <option value="">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="limited">Limited Risk</option>
          <option value="minimal">Minimal Risk</option>
          <option value="gpai">GPAI</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '6px 32px 6px 12px',
            fontSize: 13,
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            background: '#FFFFFF',
            color: '#334155',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            fontFamily: 'inherit',
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <div
          style={{
            fontSize: 13,
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            marginLeft: 8,
          }}
        >
          {filtered.length} system{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B', fontSize: 14 }}>
          Loading systems...
        </div>
      )}

      {/* Table */}
      {!loading && <DataTable<SystemRow>
        columns={columns}
        data={filtered}
        onRowClick={(row) => router.push(`/registry/${row.id}`)}
      />}

      {/* Register Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register AI System" width={600}>
        <Input label="System Name" placeholder="e.g., Customer Support Chatbot" value={formName} onChange={(e) => setFormName(e.target.value)} />
        <Textarea label="Description" placeholder="Brief description of what this AI system does (min 10 chars)..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
        <Input label="Purpose" placeholder="What is the intended purpose under EU AI Act?" value={formPurpose} onChange={(e) => setFormPurpose(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Select
            label="Risk Level"
            placeholder="Select risk level"
            value={formRisk}
            onChange={(e) => setFormRisk(e.target.value)}
            options={[
              { value: 'high', label: 'High Risk' },
              { value: 'limited', label: 'Limited Risk' },
              { value: 'minimal', label: 'Minimal Risk' },
              { value: 'gpai', label: 'GPAI' },
            ]}
          />
          <Select
            label="Deployment Type"
            placeholder="Select type"
            value={formDeployment}
            onChange={(e) => setFormDeployment(e.target.value)}
            options={[
              { value: 'cloud', label: 'Cloud' },
              { value: 'on-premise', label: 'On-Premise' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'edge', label: 'Edge' },
            ]}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Provider / Vendor" placeholder="e.g., OpenAI, Internal" value={formProvider} onChange={(e) => setFormProvider(e.target.value)} />
          <Input label="Model Name" placeholder="e.g., GPT-4o, XGBoost v3" value={formModel} onChange={(e) => setFormModel(e.target.value)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleRegister} disabled={submitting}>
            {submitting ? 'Registering...' : 'Register System'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
