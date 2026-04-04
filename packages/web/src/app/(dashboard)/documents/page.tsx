'use client';

import { useState } from 'react';
import { Card, KpiCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';

const mockDocuments = [
  { id: '1', title: 'Annex IV Technical Documentation — Credit Scoring Model', system: 'Credit Scoring Model', type: 'annex_iv', status: 'approved', version: 3, date: '2026-03-10', author: 'Maria L.' },
  { id: '2', title: 'Risk Assessment Report v3 — Credit Scoring Model', system: 'Credit Scoring Model', type: 'risk_report', status: 'approved', version: 3, date: '2026-03-15', author: 'Maria L.' },
  { id: '3', title: 'Model Card — Resume Screening AI', system: 'Resume Screening AI', type: 'model_card', status: 'review', version: 2, date: '2026-03-18', author: 'Anton K.' },
  { id: '4', title: 'Annex IV Technical Documentation — Fraud Detection System', system: 'Fraud Detection System', type: 'annex_iv', status: 'approved', version: 2, date: '2026-03-05', author: 'Jan D.' },
  { id: '5', title: 'Risk Assessment Report — Customer Support Chatbot', system: 'Customer Support Chatbot', type: 'risk_report', status: 'draft', version: 1, date: '2026-03-20', author: 'Sarah M.' },
  { id: '6', title: 'Model Card — Document Summarizer', system: 'Document Summarizer', type: 'model_card', status: 'approved', version: 1, date: '2026-02-20', author: 'Anton K.' },
];

const typeLabels: Record<string, string> = {
  annex_iv: 'Annex IV',
  risk_report: 'Risk Report',
  model_card: 'Model Card',
};

const statusVariant: Record<string, 'success' | 'warning' | 'default'> = {
  approved: 'success',
  review: 'warning',
  draft: 'default',
};

export default function DocumentsPage() {
  const [showGenerate, setShowGenerate] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Compliance Documents
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
            Generate, manage, and export EU AI Act compliance documentation
          </p>
        </div>
        <Button onClick={() => setShowGenerate(true)}>+ Generate Document</Button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Total Documents" value={mockDocuments.length} />
        <KpiCard label="Approved" value={mockDocuments.filter(d => d.status === 'approved').length} />
        <KpiCard label="In Review" value={mockDocuments.filter(d => d.status === 'review').length} />
        <KpiCard label="Drafts" value={mockDocuments.filter(d => d.status === 'draft').length} />
      </div>

      {/* Documents list */}
      <Card padding={false}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Document', 'System', 'Type', 'Version', 'Status', 'Date', ''].map((h) => (
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
            {mockDocuments.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A' }}>
                  {doc.title}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{doc.system}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge variant="info">{typeLabels[doc.type]}</Badge>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>v{doc.version}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge variant={statusVariant[doc.status]}>{doc.status}</Badge>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8' }}>{doc.date}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <Button variant="ghost" size="sm">
                    Download PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Generate modal */}
      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Compliance Document">
        <Select
          label="AI System"
          placeholder="Select a system"
          options={[
            { value: '1', label: 'Credit Scoring Model' },
            { value: '2', label: 'Resume Screening AI' },
            { value: '3', label: 'Customer Support Chatbot' },
            { value: '4', label: 'Fraud Detection System' },
          ]}
        />
        <Select
          label="Document Type"
          placeholder="Select document type"
          options={[
            { value: 'annex_iv', label: 'Annex IV Technical Documentation' },
            { value: 'risk_report', label: 'Risk Assessment Report' },
            { value: 'model_card', label: 'Model Card' },
          ]}
        />
        <div style={{ padding: '12px 14px', background: '#F1F5F9', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>
            What this will generate
          </div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
            A structured compliance document based on the selected system&apos;s registered data, risk assessment, and evidence artifacts. You can review and edit before approving.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setShowGenerate(false)}>Cancel</Button>
          <Button onClick={() => setShowGenerate(false)}>Generate</Button>
        </div>
      </Modal>
    </div>
  );
}
