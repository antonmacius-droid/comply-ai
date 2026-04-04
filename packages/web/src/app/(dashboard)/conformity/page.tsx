'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

/* ─── Types ─── */
type ComplianceStatus = 'pending' | 'compliant' | 'non_compliant' | 'na';

interface ChecklistItem {
  id: string;
  articleRef: string;
  articleGroup: string;
  requirement: string;
  status: ComplianceStatus;
  evidenceIds: string[];
  notes: string;
}

interface SystemAssessment {
  id: string;
  name: string;
  risk: string;
  checklist: ChecklistItem[];
}

/* ─── Mock Evidence ─── */
const mockEvidencePool = [
  { id: 'ev_001', title: 'Training Data Quality Report', type: 'PDF' },
  { id: 'ev_002', title: 'Bias Testing Results', type: 'XLSX' },
  { id: 'ev_003', title: 'Human Oversight Protocol', type: 'DOCX' },
  { id: 'ev_004', title: 'Model Performance Benchmarks', type: 'PDF' },
  { id: 'ev_005', title: 'Risk Management Framework', type: 'PNG' },
  { id: 'ev_006', title: 'Incident Response Plan', type: 'PDF' },
  { id: 'ev_007', title: 'Data Governance Policy', type: 'DOCX' },
  { id: 'ev_008', title: 'Security Audit Report', type: 'PDF' },
];

/* ─── Full Checklist Template ─── */
function buildChecklist(): ChecklistItem[] {
  const items: Omit<ChecklistItem, 'status' | 'evidenceIds' | 'notes'>[] = [
    // Art. 9 Risk Management
    { id: 'a9_1', articleRef: 'Art. 9(1)', articleGroup: 'Art. 9 Risk Management', requirement: 'Risk management system established and maintained throughout entire lifecycle' },
    { id: 'a9_2', articleRef: 'Art. 9(2)(a)', articleGroup: 'Art. 9 Risk Management', requirement: 'Identification and analysis of known and reasonably foreseeable risks' },
    { id: 'a9_3', articleRef: 'Art. 9(2)(b)', articleGroup: 'Art. 9 Risk Management', requirement: 'Estimation and evaluation of risks during intended use and foreseeable misuse' },
    { id: 'a9_4', articleRef: 'Art. 9(2)(c)', articleGroup: 'Art. 9 Risk Management', requirement: 'Evaluation of risks based on post-market monitoring data' },
    { id: 'a9_5', articleRef: 'Art. 9(4)', articleGroup: 'Art. 9 Risk Management', requirement: 'Suitable risk management measures adopted to address identified risks' },
    { id: 'a9_6', articleRef: 'Art. 9(5)', articleGroup: 'Art. 9 Risk Management', requirement: 'Testing procedures established to ensure consistent performance' },
    { id: 'a9_7', articleRef: 'Art. 9(7)', articleGroup: 'Art. 9 Risk Management', requirement: 'Residual risks communicated to deployers and documented' },

    // Art. 10 Data Governance
    { id: 'a10_1', articleRef: 'Art. 10(1)', articleGroup: 'Art. 10 Data Governance', requirement: 'Data governance and management practices established for training, validation, and testing data' },
    { id: 'a10_2', articleRef: 'Art. 10(2)(a)', articleGroup: 'Art. 10 Data Governance', requirement: 'Design choices and data collection processes documented' },
    { id: 'a10_3', articleRef: 'Art. 10(2)(b)', articleGroup: 'Art. 10 Data Governance', requirement: 'Data preparation processes documented (annotation, labelling, cleaning, enrichment)' },
    { id: 'a10_4', articleRef: 'Art. 10(2)(f)', articleGroup: 'Art. 10 Data Governance', requirement: 'Examination for biases, gaps, and deficiencies in datasets' },
    { id: 'a10_5', articleRef: 'Art. 10(3)', articleGroup: 'Art. 10 Data Governance', requirement: 'Datasets are relevant, representative, and to extent possible error-free and complete' },
    { id: 'a10_6', articleRef: 'Art. 10(5)', articleGroup: 'Art. 10 Data Governance', requirement: 'Personal data processing conducted with appropriate safeguards' },

    // Art. 11 Technical Documentation
    { id: 'a11_1', articleRef: 'Art. 11(1)', articleGroup: 'Art. 11 Technical Documentation', requirement: 'Technical documentation drawn up before system placed on market or put into service' },
    { id: 'a11_2', articleRef: 'Art. 11(1)', articleGroup: 'Art. 11 Technical Documentation', requirement: 'Documentation compliant with Annex IV requirements' },
    { id: 'a11_3', articleRef: 'Art. 11(2)', articleGroup: 'Art. 11 Technical Documentation', requirement: 'Documentation kept up-to-date when significant modifications occur' },

    // Art. 12 Record-Keeping
    { id: 'a12_1', articleRef: 'Art. 12(1)', articleGroup: 'Art. 12 Record-Keeping', requirement: 'Automatic logging capabilities enabling recording of events during operation' },
    { id: 'a12_2', articleRef: 'Art. 12(2)', articleGroup: 'Art. 12 Record-Keeping', requirement: 'Logging includes period of use, reference database, input data, and identification of persons involved' },
    { id: 'a12_3', articleRef: 'Art. 12(4)', articleGroup: 'Art. 12 Record-Keeping', requirement: 'Logs retained for appropriate period commensurate with intended purpose' },

    // Art. 13 Transparency
    { id: 'a13_1', articleRef: 'Art. 13(1)', articleGroup: 'Art. 13 Transparency', requirement: 'System designed and developed to ensure operation is sufficiently transparent' },
    { id: 'a13_2', articleRef: 'Art. 13(2)', articleGroup: 'Art. 13 Transparency', requirement: 'Instructions for use provided in appropriate digital or non-digital format' },
    { id: 'a13_3', articleRef: 'Art. 13(3)(a)', articleGroup: 'Art. 13 Transparency', requirement: 'Identity and contact details of the provider documented' },
    { id: 'a13_4', articleRef: 'Art. 13(3)(b)', articleGroup: 'Art. 13 Transparency', requirement: 'System characteristics, capabilities, and limitations documented for deployers' },

    // Art. 14 Human Oversight
    { id: 'a14_1', articleRef: 'Art. 14(1)', articleGroup: 'Art. 14 Human Oversight', requirement: 'System designed to be effectively overseen by natural persons during use' },
    { id: 'a14_2', articleRef: 'Art. 14(2)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Human oversight measures identified and built into the system by the provider' },
    { id: 'a14_3', articleRef: 'Art. 14(3)(a)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Measures enabling overseers to fully understand system capabilities and limitations' },
    { id: 'a14_4', articleRef: 'Art. 14(3)(d)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Ability to decide not to use the system or override/reverse output' },
    { id: 'a14_5', articleRef: 'Art. 14(4)', articleGroup: 'Art. 14 Human Oversight', requirement: 'Measures proportionate to risks, level of autonomy, and context of use' },

    // Art. 15 Accuracy, Robustness, Cybersecurity
    { id: 'a15_1', articleRef: 'Art. 15(1)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'System designed to achieve appropriate level of accuracy, robustness, and cybersecurity' },
    { id: 'a15_2', articleRef: 'Art. 15(2)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'Accuracy metrics and levels declared in accompanying instructions of use' },
    { id: 'a15_3', articleRef: 'Art. 15(3)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'System resilient to errors, faults, or inconsistencies in inputs' },
    { id: 'a15_4', articleRef: 'Art. 15(4)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'Technical redundancy solutions including backup or fail-safe plans' },
    { id: 'a15_5', articleRef: 'Art. 15(5)', articleGroup: 'Art. 15 Accuracy, Robustness & Cybersecurity', requirement: 'Appropriate cybersecurity measures to address identified vulnerabilities' },
  ];

  return items.map((item, i) => ({
    ...item,
    status: i < 8 ? 'compliant' : i < 12 ? 'non_compliant' : i < 20 ? 'pending' : 'pending',
    evidenceIds: i < 4 ? ['ev_001', 'ev_005'] : i < 8 ? ['ev_002', 'ev_007'] : [],
    notes: i < 4 ? 'Verified during last review cycle.' : '',
  }));
}

/* ─── Systems ─── */
const systemsList: SystemAssessment[] = [
  { id: 'sys_001', name: 'Credit Scoring Model', risk: 'High Risk', checklist: buildChecklist() },
  {
    id: 'sys_003', name: 'Resume Screening AI', risk: 'High Risk',
    checklist: buildChecklist().map((item, i) => ({
      ...item,
      status: i < 20 ? 'compliant' as ComplianceStatus : 'compliant' as ComplianceStatus,
      evidenceIds: ['ev_003', 'ev_004'],
      notes: 'All items verified.',
    })),
  },
  {
    id: 'sys_004', name: 'Fraud Detection System', risk: 'High Risk',
    checklist: buildChecklist().map((item, i) => ({
      ...item,
      status: i < 10 ? 'compliant' as ComplianceStatus : 'pending' as ComplianceStatus,
      evidenceIds: i < 10 ? ['ev_004'] : [],
    })),
  },
  {
    id: 'sys_007', name: 'Emotion Recognition (CCTV)', risk: 'High Risk',
    checklist: buildChecklist().map((item) => ({
      ...item,
      status: 'pending' as ComplianceStatus,
      evidenceIds: [],
    })),
  },
];

/* ─── Status Config ─── */
const statusConfig: Record<ComplianceStatus, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: 'Pending', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' },
  compliant: { label: 'Compliant', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  non_compliant: { label: 'Non-Compliant', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  na: { label: 'N/A', color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0' },
};

/* ─── Component ─── */
export default function ConformityPage() {
  const [systems, setSystems] = useState<SystemAssessment[]>(systemsList);
  const [selectedSystemId, setSelectedSystemId] = useState<string>(systems[0].id);
  const [evidenceModalItem, setEvidenceModalItem] = useState<string | null>(null);
  const [notesEditItem, setNotesEditItem] = useState<string | null>(null);
  const [notesEditValue, setNotesEditValue] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const selectedSystem = systems.find((s) => s.id === selectedSystemId)!;
  const checklist = selectedSystem.checklist;

  /* ─── Grouped checklist ─── */
  const groups = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const item of checklist) {
      const existing = map.get(item.articleGroup) || [];
      existing.push(item);
      map.set(item.articleGroup, existing);
    }
    return Array.from(map.entries());
  }, [checklist]);

  /* ─── Stats ─── */
  const totalItems = checklist.length;
  const compliantCount = checklist.filter((c) => c.status === 'compliant').length;
  const nonCompliantCount = checklist.filter((c) => c.status === 'non_compliant').length;
  const pendingCount = checklist.filter((c) => c.status === 'pending').length;
  const naCount = checklist.filter((c) => c.status === 'na').length;
  const overallPct = Math.round((compliantCount / (totalItems - naCount || 1)) * 100);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isGroupExpanded = (group: string) => expandedGroups[group] !== false; // default expanded

  const updateItemStatus = (itemId: string, status: ComplianceStatus) => {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id !== selectedSystemId) return sys;
        return {
          ...sys,
          checklist: sys.checklist.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        };
      })
    );
  };

  const linkEvidence = (itemId: string, evidenceId: string) => {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id !== selectedSystemId) return sys;
        return {
          ...sys,
          checklist: sys.checklist.map((item) => {
            if (item.id !== itemId) return item;
            if (item.evidenceIds.includes(evidenceId)) return item;
            return { ...item, evidenceIds: [...item.evidenceIds, evidenceId] };
          }),
        };
      })
    );
  };

  const unlinkEvidence = (itemId: string, evidenceId: string) => {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id !== selectedSystemId) return sys;
        return {
          ...sys,
          checklist: sys.checklist.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, evidenceIds: item.evidenceIds.filter((id) => id !== evidenceId) };
          }),
        };
      })
    );
  };

  const saveNotes = (itemId: string) => {
    setSystems((prev) =>
      prev.map((sys) => {
        if (sys.id !== selectedSystemId) return sys;
        return {
          ...sys,
          checklist: sys.checklist.map((item) =>
            item.id === itemId ? { ...item, notes: notesEditValue } : item
          ),
        };
      })
    );
    setNotesEditItem(null);
  };

  const currentEvidenceItem = checklist.find((c) => c.id === evidenceModalItem);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Conformity Assessment
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
            Interactive compliance checklist per high-risk AI system (Articles 9-15)
          </p>
        </div>
        <Button variant="secondary" onClick={() => alert('PDF export will be available in Phase 3.')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          Export Checklist PDF
        </Button>
      </div>

      {/* System Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${systems.length}, 1fr)`, gap: 12, marginBottom: 28 }}>
        {systems.map((sys) => {
          const isActive = sys.id === selectedSystemId;
          const sysCompliant = sys.checklist.filter((c) => c.status === 'compliant').length;
          const sysTotal = sys.checklist.length;
          const sysPct = Math.round((sysCompliant / sysTotal) * 100);
          return (
            <div
              key={sys.id}
              onClick={() => setSelectedSystemId(sys.id)}
              style={{
                padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${isActive ? '#6366F1' : '#E2E8F0'}`,
                background: isActive ? '#EEF2FF' : '#FFFFFF',
                transition: 'all 0.2s', boxShadow: isActive ? '0 2px 8px rgba(99,102,241,0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{sys.name}</div>
                <Badge variant={isActive ? 'info' : 'default'}>{sys.risk}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>Progress</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{sysCompliant}/{sysTotal}</span>
              </div>
              <div style={{ height: 5, background: isActive ? '#C7D2FE' : '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, transition: 'width 0.5s ease',
                  width: `${sysPct}%`,
                  background: sysPct === 100 ? '#22C55E' : isActive ? '#6366F1' : '#94A3B8',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {selectedSystem.name} — Compliance Checklist
            </h2>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              EU AI Act high-risk system requirements (Articles 9-15)
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {[
              { label: 'Compliant', count: compliantCount, color: '#22C55E' },
              { label: 'Non-Compliant', count: nonCompliantCount, color: '#EF4444' },
              { label: 'Pending', count: pendingCount, color: '#94A3B8' },
              { label: 'N/A', count: naCount, color: '#CBD5E1' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
                <span style={{ fontSize: 11, color: '#64748B' }}>{s.label}: <strong style={{ color: '#334155' }}>{s.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 10, background: '#F1F5F9', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
          <div style={{ height: '100%', width: `${(compliantCount / totalItems) * 100}%`, background: '#22C55E', transition: 'width 0.4s ease' }} />
          <div style={{ height: '100%', width: `${(nonCompliantCount / totalItems) * 100}%`, background: '#EF4444', transition: 'width 0.4s ease' }} />
          <div style={{ height: '100%', width: `${(naCount / totalItems) * 100}%`, background: '#CBD5E1', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: overallPct === 100 ? '#22C55E' : '#6366F1' }}>
            {overallPct}% compliant
          </span>
        </div>
      </Card>

      {/* Grouped Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map(([groupName, items]) => {
          const groupCompliant = items.filter((i) => i.status === 'compliant').length;
          const groupTotal = items.length;
          const groupPct = Math.round((groupCompliant / groupTotal) * 100);
          const expanded = isGroupExpanded(groupName);

          return (
            <Card key={groupName} padding={false}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupName)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '16px 24px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"
                    style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{groupName}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{groupCompliant}/{groupTotal}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 80, height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, transition: 'width 0.4s',
                      width: `${groupPct}%`,
                      background: groupPct === 100 ? '#22C55E' : '#6366F1',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: groupPct === 100 ? '#22C55E' : '#334155', minWidth: 32, textAlign: 'right' }}>
                    {groupPct}%
                  </span>
                </div>
              </button>

              {/* Group Items */}
              {expanded && (
                <div style={{ borderTop: '1px solid #F1F5F9' }}>
                  {items.map((item, i) => {
                    const sc = statusConfig[item.status];
                    const isNotesEditing = notesEditItem === item.id;
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '14px 24px',
                          borderBottom: i < items.length - 1 ? '1px solid #F8FAFC' : 'none',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                background: '#EEF2FF', color: '#6366F1', fontFamily: 'monospace',
                              }}>
                                {item.articleRef}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>
                                {item.requirement}
                              </span>
                            </div>

                            {/* Evidence tags */}
                            {item.evidenceIds.length > 0 && (
                              <div style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
                                {item.evidenceIds.map((evId) => {
                                  const ev = mockEvidencePool.find((e) => e.id === evId);
                                  return (
                                    <span key={evId} style={{
                                      fontSize: 10, padding: '1px 6px', borderRadius: 4,
                                      background: '#EFF6FF', color: '#3B82F6', fontWeight: 500,
                                      display: 'inline-flex', alignItems: 'center', gap: 3,
                                    }}>
                                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19" /></svg>
                                      {ev?.title || evId}
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {/* Notes */}
                            {isNotesEditing ? (
                              <div style={{ marginTop: 8 }}>
                                <textarea
                                  value={notesEditValue}
                                  onChange={(e) => setNotesEditValue(e.target.value)}
                                  placeholder="Add notes..."
                                  style={{
                                    width: '100%', padding: '8px 10px', fontSize: 12, borderRadius: 6,
                                    border: '1px solid #C7D2FE', outline: 'none', fontFamily: 'inherit',
                                    minHeight: 60, resize: 'vertical', boxSizing: 'border-box',
                                  }}
                                />
                                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                  <Button size="sm" onClick={() => saveNotes(item.id)}>Save</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setNotesEditItem(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : item.notes ? (
                              <div
                                onClick={() => { setNotesEditItem(item.id); setNotesEditValue(item.notes); }}
                                style={{
                                  fontSize: 12, color: '#64748B', marginTop: 4, cursor: 'pointer',
                                  padding: '4px 8px', background: '#F8FAFC', borderRadius: 4,
                                  borderLeft: '2px solid #E2E8F0',
                                }}
                              >
                                {item.notes}
                              </div>
                            ) : null}
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {/* Status toggle */}
                            <div style={{ display: 'flex', gap: 2 }}>
                              {(['compliant', 'non_compliant', 'pending', 'na'] as ComplianceStatus[]).map((s) => {
                                const conf = statusConfig[s];
                                const isSelected = item.status === s;
                                return (
                                  <button
                                    key={s}
                                    onClick={() => updateItemStatus(item.id, s)}
                                    title={conf.label}
                                    style={{
                                      padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                                      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                                      border: `1px solid ${isSelected ? conf.border : 'transparent'}`,
                                      background: isSelected ? conf.bg : 'transparent',
                                      color: isSelected ? conf.color : '#CBD5E1',
                                    }}
                                  >
                                    {conf.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Link Evidence button */}
                            <button
                              onClick={() => setEvidenceModalItem(item.id)}
                              title="Link Evidence"
                              style={{
                                padding: '4px 8px', borderRadius: 4, border: '1px solid #E2E8F0',
                                background: '#FFFFFF', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 500,
                                color: '#6366F1',
                              }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19" /></svg>
                              Link
                            </button>

                            {/* Notes button */}
                            <button
                              onClick={() => {
                                if (isNotesEditing) { setNotesEditItem(null); }
                                else { setNotesEditItem(item.id); setNotesEditValue(item.notes); }
                              }}
                              title="Notes"
                              style={{
                                padding: '4px 8px', borderRadius: 4, border: '1px solid #E2E8F0',
                                background: '#FFFFFF', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', fontSize: 10, color: '#64748B',
                              }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Evidence Selector Modal */}
      <Modal
        open={!!evidenceModalItem}
        onClose={() => setEvidenceModalItem(null)}
        title="Link Evidence"
        width={520}
      >
        {currentEvidenceItem && (
          <div>
            <div style={{
              padding: '12px 14px', background: '#F8FAFC', borderRadius: 8,
              marginBottom: 20, border: '1px solid #E2E8F0',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6366F1', marginBottom: 4 }}>{currentEvidenceItem.articleRef}</div>
              <div style={{ fontSize: 13, color: '#334155' }}>{currentEvidenceItem.requirement}</div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Available Evidence</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mockEvidencePool.map((ev) => {
                const isLinked = currentEvidenceItem.evidenceIds.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 8,
                      border: `1px solid ${isLinked ? '#BBF7D0' : '#E2E8F0'}`,
                      background: isLinked ? '#F0FDF4' : '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: '#F1F5F9', color: '#64748B',
                      }}>
                        {ev.type}
                      </span>
                      <span style={{ fontSize: 13, color: '#334155' }}>{ev.title}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (isLinked) unlinkEvidence(currentEvidenceItem.id, ev.id);
                        else linkEvidence(currentEvidenceItem.id, ev.id);
                      }}
                      style={{
                        padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                        border: `1px solid ${isLinked ? '#22C55E' : '#6366F1'}`,
                        background: isLinked ? '#F0FDF4' : '#EEF2FF',
                        color: isLinked ? '#22C55E' : '#6366F1',
                      }}
                    >
                      {isLinked ? 'Unlink' : 'Link'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Button onClick={() => setEvidenceModalItem(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
