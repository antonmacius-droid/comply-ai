'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

/* ─── Annex IV Section Definitions ─── */
type SectionStatus = 'empty' | 'draft' | 'complete';

interface AnnexSection {
  id: string;
  number: number;
  title: string;
  guidance: string;
  content: string;
  status: SectionStatus;
}

const defaultSections: AnnexSection[] = [
  {
    id: 'general',
    number: 1,
    title: 'General Description',
    guidance: 'Provide the AI system name, version, intended purpose, and developer/provider information. Include the date of the documentation and software version.',
    content: '',
    status: 'empty',
  },
  {
    id: 'detailed',
    number: 2,
    title: 'Detailed Description',
    guidance: 'Describe the algorithms used, data processing logic, training methodologies, and system architecture. Include model type, key design choices, and how the system was built and trained.',
    content: '',
    status: 'empty',
  },
  {
    id: 'design',
    number: 3,
    title: 'Design Specifications',
    guidance: 'Document design choices, computational and hardware resources required, development methodology (e.g., agile, waterfall), and third-party tools or components used.',
    content: '',
    status: 'empty',
  },
  {
    id: 'capabilities',
    number: 4,
    title: 'System Capabilities & Limitations',
    guidance: 'Describe accuracy levels, performance metrics (precision, recall, F1), known limitations, foreseeable misuse scenarios, and conditions under which performance may degrade.',
    content: '',
    status: 'empty',
  },
  {
    id: 'risk',
    number: 5,
    title: 'Risk Management',
    guidance: 'Document risk identification methodology, specific risks identified, mitigation measures implemented, residual risks accepted, and risk monitoring procedures.',
    content: '',
    status: 'empty',
  },
  {
    id: 'data',
    number: 6,
    title: 'Data Governance',
    guidance: 'Describe training data sources, data preparation and cleaning methods, bias detection and mitigation, data gaps identified, and data quality metrics. Include information on data representativeness.',
    content: '',
    status: 'empty',
  },
  {
    id: 'oversight',
    number: 7,
    title: 'Human Oversight Measures',
    guidance: 'Document the human-machine interface design, oversight mechanisms, how a human can intervene or override AI decisions, and who is responsible for oversight.',
    content: '',
    status: 'empty',
  },
  {
    id: 'monitoring',
    number: 8,
    title: 'Monitoring & Updates',
    guidance: 'Describe the post-market monitoring plan, update and re-training procedures, logging capabilities, and how performance degradation is detected and addressed.',
    content: '',
    status: 'empty',
  },
  {
    id: 'standards',
    number: 9,
    title: 'Relevant Standards',
    guidance: 'List EU harmonised standards applied (e.g., ISO/IEC standards), common specifications used, and any voluntary codes of conduct or certifications.',
    content: '',
    status: 'empty',
  },
  {
    id: 'declaration',
    number: 10,
    title: 'Declaration of Conformity',
    guidance: 'Include the provider declaration of conformity, notified body information (if applicable), certificate references, and declaration date and signatory.',
    content: '',
    status: 'empty',
  },
];

/* ─── Mock Document List ─── */
interface DocumentRecord {
  id: string;
  title: string;
  system: string;
  systemId: string;
  type: string;
  status: string;
  version: number;
  date: string;
  author: string;
  sections: AnnexSection[];
}

const initialDocuments: DocumentRecord[] = [];

function mapApiDocToRecord(doc: Record<string, unknown>): DocumentRecord {
  const sections = ((doc.sections as Array<Record<string, unknown>>) || []).map((s, i) => {
    const content = (s.content as string) || '';
    const status: SectionStatus = content.trim().length === 0 ? 'empty' : content.trim().length > 100 ? 'complete' : 'draft';
    return {
      id: (s.id as string) || defaultSections[i]?.id || `s_${i}`,
      number: (s.number as number) || i + 1,
      title: (s.title as string) || defaultSections[i]?.title || `Section ${i + 1}`,
      guidance: (s.guidance as string) || defaultSections[i]?.guidance || '',
      content,
      status,
    };
  });
  return {
    id: doc.id as string,
    title: (doc.title as string) || (doc.type as string) || 'Document',
    system: (doc.systemName as string) || '-',
    systemId: (doc.systemId as string) || '',
    type: (doc.type as string) || 'annex_iv',
    status: (doc.status as string) || 'draft',
    version: (doc.version as number) || 1,
    date: doc.createdAt ? new Date(doc.createdAt as string).toISOString().slice(0, 10) : '-',
    author: (doc.createdBy as string) || '-',
    sections: sections.length > 0 ? sections : [...defaultSections],
  };
}

/* ─── Status helpers ─── */
const statusBadge: Record<SectionStatus, { variant: 'default' | 'warning' | 'success'; label: string }> = {
  empty: { variant: 'default', label: 'Empty' },
  draft: { variant: 'warning', label: 'Draft' },
  complete: { variant: 'success', label: 'Complete' },
};

const docStatusVariant: Record<string, 'default' | 'warning' | 'success'> = {
  draft: 'warning',
  complete: 'success',
  approved: 'success',
};

/* ─── Component ─── */
export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('general');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocSystem, setNewDocSystem] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [saveFlash, setSaveFlash] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [systemOptions, setSystemOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Fetch systems for the dropdown
  useEffect(() => {
    fetch('/api/v1/systems')
      .then((r) => r.json())
      .then((json) => {
        const opts = ((json.data || []) as Array<Record<string, unknown>>).map((s) => ({
          value: s.id as string,
          label: s.name as string,
        }));
        setSystemOptions(opts);
      })
      .catch(() => {});
  }, []);

  // Fetch documents from API
  useEffect(() => {
    setLoadingDocs(true);
    fetch('/api/v1/documents')
      .then((r) => r.json())
      .then((json) => {
        const docs = ((json.data || []) as Array<Record<string, unknown>>).map(mapApiDocToRecord);
        setDocuments(docs);
      })
      .catch(() => {})
      .finally(() => setLoadingDocs(false));
  }, []);

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;
  const activeSection = activeDoc?.sections.find((s) => s.id === activeSectionId) || null;

  const completedCount = activeDoc ? activeDoc.sections.filter((s) => s.status === 'complete').length : 0;
  const totalSections = activeDoc ? activeDoc.sections.length : 10;
  const progressPct = Math.round((completedCount / totalSections) * 100);

  const updateSectionContent = useCallback(
    (content: string) => {
      if (!activeDocId || !activeSectionId) return;
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id !== activeDocId) return doc;
          return {
            ...doc,
            sections: doc.sections.map((s) => {
              if (s.id !== activeSectionId) return s;
              const newStatus: SectionStatus = content.trim().length === 0 ? 'empty' : content.trim().length > 100 ? 'complete' : 'draft';
              return { ...s, content, status: newStatus };
            }),
          };
        })
      );
    },
    [activeDocId, activeSectionId]
  );

  const handleSave = () => {
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  const handleAiAssist = () => {
    if (!activeSection) return;
    setAiLoading(true);
    setTimeout(() => {
      const aiContent = `[AI-Generated Draft for "${activeSection.title}"]\n\nThis section has been pre-filled by AI based on the registered system data. Please review and edit as needed.\n\nThe ${activeSection.title.toLowerCase()} covers the following key areas:\n\n- Key area 1: Description of relevant aspects\n- Key area 2: Technical specifications and details\n- Key area 3: Compliance considerations per EU AI Act\n\nNote: This is a placeholder for the LLM-generated content. In production, this will call the AI endpoint to generate contextually relevant documentation based on the system registry data, risk assessment results, and evidence artifacts.`;
      updateSectionContent(aiContent);
      setAiLoading(false);
    }, 1200);
  };

  const handleCreateDocument = async () => {
    if (!newDocSystem) return;
    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemId: newDocSystem,
          type: 'technical_documentation',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const newDoc = mapApiDocToRecord(json.data);
        // Override title if user provided one
        if (newDocTitle) newDoc.title = newDocTitle;
        setDocuments((prev) => [newDoc, ...prev]);
        setActiveDocId(newDoc.id);
        setActiveSectionId('general');
      }
    } catch (err) {
      console.error('Failed to create document:', err);
    }
    setShowCreateModal(false);
    setNewDocSystem('');
    setNewDocTitle('');
  };

  const handleExportPdf = async () => {
    if (!activeDoc) return;
    try {
      const res = await fetch(`/api/v1/documents/${activeDoc.id}/export`, { method: 'POST' });
      const data = await res.json();
      alert(`PDF export initiated. Job ID: ${data.data?.jobId || 'N/A'}\n\nIn production this will generate and download a PDF.`);
    } catch {
      alert('Export endpoint not yet connected. PDF generation will be available in Phase 3.');
    }
  };

  /* ─── Document List View ─── */
  if (!activeDoc) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Annex IV Document Generator
            </h1>
            <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
              Generate and manage EU AI Act Annex IV technical documentation
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            New Document
          </Button>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Documents', value: documents.length, accent: '#6366F1' },
            { label: 'Complete', value: documents.filter((d) => d.status === 'complete').length, accent: '#22C55E' },
            { label: 'In Progress', value: documents.filter((d) => d.status === 'draft').length, accent: '#F97316' },
            { label: 'Avg. Completion', value: documents.length > 0 ? Math.round(documents.reduce((acc, d) => acc + d.sections.filter((s) => s.status === 'complete').length, 0) / documents.length / 10 * 100) + '%' : '0%', accent: '#3B82F6' },
          ].map((kpi, i) => (
            <Card key={i}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 8 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>{kpi.value}</div>
              <div style={{ width: '100%', height: 3, background: '#F1F5F9', borderRadius: 2, marginTop: 12 }}>
                <div style={{ height: '100%', width: '60%', background: kpi.accent, borderRadius: 2 }} />
              </div>
            </Card>
          ))}
        </div>

        {/* Loading state */}
        {loadingDocs && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B', fontSize: 14 }}>
            Loading documents...
          </div>
        )}

        {/* Document cards */}
        {!loadingDocs && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {documents.map((doc) => {
            const completed = doc.sections.filter((s) => s.status === 'complete').length;
            const pct = Math.round((completed / doc.sections.length) * 100);
            return (
              <div
                key={doc.id}
                onClick={() => { setActiveDocId(doc.id); setActiveSectionId(doc.sections[0]?.id || 'general'); }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  padding: '20px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8M16 17H8M10 9H8" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{doc.title}</div>
                      <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                        {doc.system} &middot; v{doc.version} &middot; {doc.author} &middot; {doc.date}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{completed}/{doc.sections.length} sections</div>
                      <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: pct === 100 ? '#22C55E' : pct > 50 ? '#6366F1' : '#F97316',
                          borderRadius: 3, transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                    <Badge variant={docStatusVariant[doc.status] || 'default'}>{doc.status}</Badge>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}

        {/* Empty state */}
        {!loadingDocs && documents.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px', background: '#FFFFFF',
            borderRadius: 12, border: '1px solid #E2E8F0',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>No documents yet</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Create your first Annex IV technical documentation to get started.</div>
            <Button onClick={() => setShowCreateModal(true)}>Create Document</Button>
          </div>
        )}

        {/* Create Modal */}
        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Annex IV Document">
          <Select
            label="AI System"
            placeholder="Select a registered AI system"
            options={systemOptions}
            value={newDocSystem}
            onChange={(e) => setNewDocSystem(e.target.value)}
          />
          <Input
            label="Document Title (optional)"
            placeholder="Annex IV Technical Documentation"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
          />
          <div style={{
            padding: '14px 16px', background: '#F8FAFC', borderRadius: 8,
            border: '1px solid #E2E8F0', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6366F1' }}>What this creates</span>
            </div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              A structured 10-section document following EU AI Act Annex IV requirements. Each section includes guidance text and can be filled manually or with AI assistance.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDocument} disabled={!newDocSystem}>Create Document</Button>
          </div>
        </Modal>
      </div>
    );
  }

  /* ─── Document Editor View ─── */
  return (
    <div>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setActiveDocId(null)}
            style={{
              background: 'none', border: '1px solid #E2E8F0', borderRadius: 8,
              padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: '#64748B', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {activeDoc.title}
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              {activeDoc.system} &middot; Version {activeDoc.version}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Progress indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
            <div style={{ width: 120, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: progressPct === 100 ? '#22C55E' : '#6366F1',
                borderRadius: 3, transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{completedCount}/{totalSections}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            style={saveFlash ? { background: '#F0FDF4', borderColor: '#22C55E', color: '#16A34A' } : {}}
          >
            {saveFlash ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg> Saved</>
            ) : (
              'Save Draft'
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportPdf}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Editor Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Section Navigator */}
        <Card style={{ position: 'sticky', top: 32 }} padding={false}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Sections</span>
            <span style={{ fontSize: 11, color: '#64748B' }}>{completedCount} of {totalSections} complete</span>
          </div>
          <div style={{ padding: '8px' }}>
            {activeDoc.sections.map((section) => {
              const isActive = section.id === activeSectionId;
              const sb = statusBadge[section.status];
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
                    background: isActive ? '#EEF2FF' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: section.status === 'complete' ? '#22C55E'
                        : section.status === 'draft' ? '#F97316'
                        : isActive ? '#6366F1' : '#E2E8F0',
                      color: section.status !== 'empty' || isActive ? '#FFFFFF' : '#64748B',
                    }}>
                      {section.status === 'complete' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      ) : (
                        section.number
                      )}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#4338CA' : '#334155',
                    }}>
                      {section.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Editor Panel */}
        {activeSection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Section Header */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: '#FFFFFF',
                  }}>
                    {activeSection.number}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {activeSection.title}
                    </h2>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                      Annex IV, Section {activeSection.number}
                    </div>
                  </div>
                </div>
                <Badge variant={statusBadge[activeSection.status].variant}>
                  {statusBadge[activeSection.status].label}
                </Badge>
              </div>

              {/* Guidance */}
              <div style={{
                padding: '14px 16px', background: '#FFFBEB', borderRadius: 8,
                border: '1px solid #FEF3C7', marginBottom: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Guidance</span>
                </div>
                <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
                  {activeSection.guidance}
                </div>
              </div>
            </Card>

            {/* Text Editor */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>Content Editor</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAiAssist}
                  disabled={aiLoading}
                  style={{ background: aiLoading ? '#EEF2FF' : '#FAFAFE', borderColor: '#C7D2FE' }}
                >
                  {aiLoading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 14, height: 14, border: '2px solid #C7D2FE',
                        borderTopColor: '#6366F1', borderRadius: '50%',
                        display: 'inline-block', animation: 'spin 0.8s linear infinite',
                      }} />
                      Generating...
                    </span>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8L8 14l-6-4.8h7.6z" />
                      </svg>
                      <span style={{ color: '#6366F1' }}>AI Assist</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Toolbar */}
              <div style={{
                display: 'flex', gap: 2, padding: '8px 12px', background: '#F8FAFC',
                borderRadius: '8px 8px 0 0', border: '1px solid #E2E8F0', borderBottom: 'none',
              }}>
                {['B', 'I', 'U', '|', 'H1', 'H2', '|', 'List', 'Link'].map((btn, i) => (
                  btn === '|' ? (
                    <div key={i} style={{ width: 1, height: 20, background: '#E2E8F0', margin: '0 4px', alignSelf: 'center' }} />
                  ) : (
                    <button key={i} style={{
                      padding: '4px 8px', background: 'none', border: 'none', borderRadius: 4,
                      cursor: 'pointer', fontSize: 12, fontWeight: btn === 'B' ? 700 : 500,
                      fontStyle: btn === 'I' ? 'italic' : 'normal',
                      textDecoration: btn === 'U' ? 'underline' : 'none',
                      color: '#475569',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      {btn}
                    </button>
                  )
                ))}
              </div>
              <textarea
                value={activeSection.content}
                onChange={(e) => updateSectionContent(e.target.value)}
                placeholder={`Start writing the ${activeSection.title.toLowerCase()} section...\n\nRefer to the guidance above for what to include.`}
                style={{
                  width: '100%', minHeight: 360, padding: '16px 20px',
                  fontSize: 14, lineHeight: 1.7, color: '#0F172A',
                  border: '1px solid #E2E8F0', borderRadius: '0 0 8px 8px',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                  background: '#FFFFFF', boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6366F1'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  {activeSection.content.length} characters &middot; ~{Math.ceil(activeSection.content.split(/\s+/).filter(Boolean).length / 250)} min read
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {activeSection.number > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => {
                      const idx = activeDoc.sections.findIndex((s) => s.id === activeSectionId);
                      if (idx > 0) setActiveSectionId(activeDoc.sections[idx - 1].id);
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                      Previous
                    </Button>
                  )}
                  {activeSection.number < 10 && (
                    <Button variant="ghost" size="sm" onClick={() => {
                      const idx = activeDoc.sections.findIndex((s) => s.id === activeSectionId);
                      if (idx < activeDoc.sections.length - 1) setActiveSectionId(activeDoc.sections[idx + 1].id);
                    }}>
                      Next
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
