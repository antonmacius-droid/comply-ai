'use client';

import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DEMO_MODE } from '@/lib/demo-data';

/* ─── Types ─── */
interface EvidenceRecord {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  systemId: string;
  systemName: string;
  assessmentId: string | null;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  sha256: string;
}

/* ─── Mock Data ─── */
const mockEvidence: EvidenceRecord[] = DEMO_MODE ? [
  {
    id: 'ev_001',
    title: 'Training Data Quality Report',
    description: 'Comprehensive data quality assessment for the credit scoring training dataset.',
    fileName: 'training_data_quality_report_v3.pdf',
    fileSize: 2457600,
    fileType: 'application/pdf',
    systemId: 'sys_001',
    systemName: 'Credit Scoring Model',
    assessmentId: 'ra_001',
    tags: ['data-quality', 'training', 'audit'],
    uploadedBy: 'Maria L.',
    uploadedAt: '2026-03-28T14:30:00Z',
    sha256: 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
  },
  {
    id: 'ev_002',
    title: 'Bias Testing Results',
    description: 'Results of fairness and bias testing across protected characteristics.',
    fileName: 'bias_testing_results_march2026.xlsx',
    fileSize: 891200,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    systemId: 'sys_001',
    systemName: 'Credit Scoring Model',
    assessmentId: 'ra_001',
    tags: ['bias', 'fairness', 'testing'],
    uploadedBy: 'Jan D.',
    uploadedAt: '2026-03-25T10:15:00Z',
    sha256: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
  },
  {
    id: 'ev_003',
    title: 'Human Oversight Protocol',
    description: 'Documentation of human-in-the-loop oversight procedures and escalation paths.',
    fileName: 'human_oversight_protocol_v2.docx',
    fileSize: 340800,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    systemId: 'sys_003',
    systemName: 'Resume Screening AI',
    assessmentId: null,
    tags: ['oversight', 'protocol', 'human-in-the-loop'],
    uploadedBy: 'Anton K.',
    uploadedAt: '2026-03-22T09:00:00Z',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'ev_004',
    title: 'Model Performance Benchmarks',
    description: 'Accuracy, precision, recall, and F1 scores across demographic groups.',
    fileName: 'model_benchmarks_q1_2026.pdf',
    fileSize: 1536000,
    fileType: 'application/pdf',
    systemId: 'sys_004',
    systemName: 'Fraud Detection System',
    assessmentId: null,
    tags: ['performance', 'benchmarks', 'accuracy'],
    uploadedBy: 'Sarah M.',
    uploadedAt: '2026-03-20T16:45:00Z',
    sha256: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
  },
  {
    id: 'ev_005',
    title: 'Risk Management Framework',
    description: 'Organization-wide AI risk management framework aligned with ISO 23894.',
    fileName: 'risk_management_framework.png',
    fileSize: 4205568,
    fileType: 'image/png',
    systemId: 'sys_001',
    systemName: 'Credit Scoring Model',
    assessmentId: 'ra_001',
    tags: ['risk', 'framework', 'ISO'],
    uploadedBy: 'Anton K.',
    uploadedAt: '2026-03-18T11:20:00Z',
    sha256: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
  },
] : [];

const mockSystems = DEMO_MODE ? [
  { value: 'sys_001', label: 'Credit Scoring Model' },
  { value: 'sys_002', label: 'Customer Support Chatbot' },
  { value: 'sys_003', label: 'Resume Screening AI' },
  { value: 'sys_004', label: 'Fraud Detection System' },
  { value: 'sys_005', label: 'Document Summarizer' },
] : [];

const mockAssessments = DEMO_MODE ? [
  { value: '', label: 'None' },
  { value: 'ra_001', label: 'RA-001 — Credit Scoring Model' },
  { value: 'ra_002', label: 'RA-002 — Customer Support Chatbot' },
] : [];

/* ─── Helpers ─── */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return { color: '#EF4444', bg: '#FEF2F2', label: 'PDF' };
  if (mimeType.includes('image')) return { color: '#8B5CF6', bg: '#F5F3FF', label: 'IMG' };
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { color: '#22C55E', bg: '#F0FDF4', label: 'XLS' };
  if (mimeType.includes('word') || mimeType.includes('document')) return { color: '#3B82F6', bg: '#EFF6FF', label: 'DOC' };
  return { color: '#64748B', bg: '#F1F5F9', label: 'FILE' };
}

function generateFakeHash(): string {
  const chars = '0123456789abcdef';
  return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ─── Component ─── */
export default function EvidencePage() {
  const [evidence, setEvidence] = useState<EvidenceRecord[]>(mockEvidence);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<EvidenceRecord | null>(null);
  const [filterSystem, setFilterSystem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadSystem, setUploadSystem] = useState('');
  const [uploadAssessment, setUploadAssessment] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredEvidence = evidence.filter((e) => {
    if (filterSystem && e.systemId !== filterSystem) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.tags.some((t) => t.includes(q));
    }
    return true;
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadFile(files[0]);
      if (!uploadTitle) setUploadTitle(files[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      if (!showUploadModal) setShowUploadModal(true);
    }
  }, [uploadTitle, showUploadModal]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadFile(files[0]);
      if (!uploadTitle) setUploadTitle(files[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleUpload = () => {
    if (!uploadFile || !uploadTitle || !uploadSystem) return;
    setUploading(true);
    setTimeout(() => {
      const system = mockSystems.find((s) => s.value === uploadSystem);
      const newEvidence: EvidenceRecord = {
        id: 'ev_' + Math.random().toString(36).slice(2, 8),
        title: uploadTitle,
        description: uploadDescription,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        fileType: uploadFile.type || 'application/octet-stream',
        systemId: uploadSystem,
        systemName: system?.label || 'Unknown',
        assessmentId: uploadAssessment || null,
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
        uploadedBy: 'Anton K.',
        uploadedAt: new Date().toISOString(),
        sha256: generateFakeHash(),
      };
      setEvidence((prev) => [newEvidence, ...prev]);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadSystem('');
      setUploadAssessment('');
      setUploadTags('');
      setUploadFile(null);
      setUploading(false);
    }, 800);
  };

  const resetUploadForm = () => {
    setShowUploadModal(false);
    setUploadTitle('');
    setUploadDescription('');
    setUploadSystem('');
    setUploadAssessment('');
    setUploadTags('');
    setUploadFile(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Evidence Vault
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
            Upload, manage, and link compliance evidence artifacts
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          Upload Evidence
        </Button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Files', value: evidence.length, accent: '#6366F1' },
          { label: 'Linked to Assessments', value: evidence.filter((e) => e.assessmentId).length, accent: '#22C55E' },
          { label: 'AI Systems Covered', value: new Set(evidence.map((e) => e.systemId)).size, accent: '#3B82F6' },
          { label: 'Total Size', value: formatFileSize(evidence.reduce((a, e) => a + e.fileSize, 0)), accent: '#F97316' },
        ].map((kpi, i) => (
          <Card key={i}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>{kpi.value}</div>
          </Card>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          padding: '32px', borderRadius: 12, marginBottom: 24, textAlign: 'center',
          border: `2px dashed ${isDragging ? '#6366F1' : '#CBD5E1'}`,
          background: isDragging ? '#EEF2FF' : '#FAFBFC',
          transition: 'all 0.2s ease', cursor: 'pointer',
        }}
        onClick={() => setShowUploadModal(true)}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: isDragging ? '#C7D2FE' : '#E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
          transition: 'background 0.2s',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#6366F1' : '#64748B'} strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: isDragging ? '#6366F1' : '#0F172A', marginBottom: 4 }}>
          {isDragging ? 'Drop file here' : 'Drag & drop files here'}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>
          or click to browse. Supports PDF, DOCX, XLSX, PNG, JPG.
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search evidence by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px', fontSize: 13, borderRadius: 8,
              border: '1px solid #E2E8F0', background: '#FFFFFF', outline: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={filterSystem}
          onChange={(e) => setFilterSystem(e.target.value)}
          style={{
            padding: '9px 32px 9px 14px', fontSize: 13, borderRadius: 8,
            border: '1px solid #E2E8F0', background: '#FFFFFF', outline: 'none',
            fontFamily: 'inherit', cursor: 'pointer', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          }}
        >
          <option value="">All Systems</option>
          {mockSystems.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Evidence Table */}
      <Card padding={false}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['File', 'AI System', 'Assessment', 'Tags', 'Uploaded By', 'Date', ''].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B',
                    textAlign: 'left', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEvidence.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#64748B', marginBottom: 4 }}>No evidence found</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Try adjusting your filters or upload new evidence.</div>
                </td>
              </tr>
            ) : (
              filteredEvidence.map((ev) => {
                const icon = getFileIcon(ev.fileType);
                return (
                  <tr
                    key={ev.id}
                    onClick={() => setShowDetailModal(ev)}
                    style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, background: icon.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: icon.color, flexShrink: 0,
                        }}>
                          {icon.label}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{ev.title}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
                            {ev.fileName} &middot; {formatFileSize(ev.fileSize)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9' }}>
                      {ev.systemName}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                      {ev.assessmentId ? (
                        <Badge variant="info">{ev.assessmentId.toUpperCase()}</Badge>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>Unlinked</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {ev.tags.slice(0, 2).map((tag) => (
                          <span key={tag} style={{
                            fontSize: 10, padding: '1px 6px', borderRadius: 4,
                            background: '#F1F5F9', color: '#475569', fontWeight: 500,
                          }}>
                            {tag}
                          </span>
                        ))}
                        {ev.tags.length > 2 && (
                          <span style={{ fontSize: 10, color: '#94A3B8' }}>+{ev.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>
                      {ev.uploadedBy}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>
                      {formatDate(ev.uploadedAt)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #F1F5F9' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Upload Modal */}
      <Modal open={showUploadModal} onClose={resetUploadForm} title="Upload Evidence" width={560}>
        {/* File picker / drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files.length > 0) {
              setUploadFile(e.dataTransfer.files[0]);
              if (!uploadTitle) setUploadTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '24px', borderRadius: 10, marginBottom: 20, textAlign: 'center',
            border: `2px dashed ${uploadFile ? '#22C55E' : isDragging ? '#6366F1' : '#CBD5E1'}`,
            background: uploadFile ? '#F0FDF4' : isDragging ? '#EEF2FF' : '#FAFBFC',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv"
          />
          {uploadFile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{uploadFile.name}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{formatFileSize(uploadFile.size)}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16 }}
              >
                &times;
              </button>
            </div>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" style={{ margin: '0 auto 8px', display: 'block' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
              </svg>
              <div style={{ fontSize: 13, color: '#64748B' }}>Drop file or click to browse</div>
            </>
          )}
        </div>

        <Input
          label="Title"
          placeholder="Evidence title"
          value={uploadTitle}
          onChange={(e) => setUploadTitle(e.target.value)}
        />
        <Textarea
          label="Description"
          placeholder="Brief description of this evidence artifact..."
          value={uploadDescription}
          onChange={(e) => setUploadDescription(e.target.value)}
          rows={2}
        />
        <Select
          label="AI System"
          placeholder="Select system"
          options={mockSystems}
          value={uploadSystem}
          onChange={(e) => setUploadSystem(e.target.value)}
        />
        <Select
          label="Link to Assessment (optional)"
          placeholder="Select assessment"
          options={mockAssessments}
          value={uploadAssessment}
          onChange={(e) => setUploadAssessment(e.target.value)}
        />
        <Input
          label="Tags (comma-separated)"
          placeholder="e.g., data-quality, testing, audit"
          value={uploadTags}
          onChange={(e) => setUploadTags(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={resetUploadForm}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!uploadFile || !uploadTitle || !uploadSystem || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={!!showDetailModal}
        onClose={() => setShowDetailModal(null)}
        title="Evidence Details"
        width={600}
      >
        {showDetailModal && (() => {
          const ev = showDetailModal;
          const icon = getFileIcon(ev.fileType);
          return (
            <div>
              {/* File header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
                padding: '16px 18px', background: '#F8FAFC', borderRadius: 10,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10, background: icon.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: icon.color,
                }}>
                  {icon.label}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{ev.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {ev.fileName} &middot; {formatFileSize(ev.fileSize)}
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'AI System', value: ev.systemName },
                  { label: 'Assessment', value: ev.assessmentId?.toUpperCase() || 'Unlinked' },
                  { label: 'Uploaded By', value: ev.uploadedBy },
                  { label: 'Upload Date', value: formatDate(ev.uploadedAt) },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {ev.description && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Description</div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{ev.description}</div>
                </div>
              )}

              {/* Tags */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Tags</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ev.tags.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* SHA-256 Hash */}
              <div style={{
                padding: '14px 16px', background: '#F8FAFC', borderRadius: 8,
                border: '1px solid #E2E8F0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SHA-256 Integrity Hash</span>
                </div>
                <div style={{
                  fontSize: 11, fontFamily: 'monospace', color: '#475569',
                  wordBreak: 'break-all', lineHeight: 1.6, background: '#FFFFFF',
                  padding: '8px 10px', borderRadius: 6, border: '1px solid #E2E8F0',
                }}>
                  {ev.sha256}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <Button variant="secondary" onClick={() => setShowDetailModal(null)}>Close</Button>
                <Button variant="secondary">Download</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
