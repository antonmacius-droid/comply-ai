'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, KpiCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface MockIncident {
  id: string;
  title: string;
  system: string;
  systemId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  detectedAt: string;
  reporter: string;
  description: string;
  notifiedAuthority: boolean;
  notifiedAt?: string;
  rootCause?: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  affectedUsers?: number;
  correctiveActions: string[];
  preventiveMeasures?: string;
}

function mapApiIncident(inc: Record<string, unknown>): MockIncident {
  return {
    id: inc.id as string,
    title: (inc.title as string) || 'Incident',
    system: (inc.systemName as string) || (inc.systemId as string) || '-',
    systemId: (inc.systemId as string) || '',
    severity: (inc.severity as MockIncident['severity']) || 'medium',
    status: (inc.status as MockIncident['status']) || 'open',
    detectedAt: (inc.reportedAt as string) || (inc.createdAt as string) || new Date().toISOString(),
    reporter: (inc.reportedBy as string) || '-',
    description: (inc.description as string) || '',
    notifiedAuthority: (inc.notifiedAuthority as boolean) || false,
    notifiedAt: inc.notifiedAt as string | undefined,
    rootCause: inc.rootCause as string | undefined,
    resolution: inc.resolution as string | undefined,
    resolvedAt: inc.resolvedAt as string | undefined,
    resolvedBy: inc.resolvedBy as string | undefined,
    affectedUsers: inc.affectedUsers as number | undefined,
    correctiveActions: (inc.correctiveActions as string[]) || [],
    preventiveMeasures: inc.preventiveMeasures as string | undefined,
  };
}

// ---------------------------------------------------------------------------
// Timeline generation
// ---------------------------------------------------------------------------

interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'escalated' | 'resolved' | 'closed';
  description: string;
  actor: string;
  timestamp: string;
}

function buildTimeline(inc: MockIncident): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: `${inc.id}_created`,
      type: 'created',
      description: `Incident reported: ${inc.title}`,
      actor: inc.reporter,
      timestamp: inc.detectedAt,
    },
  ];

  if (inc.status === 'investigating') {
    events.push({
      id: `${inc.id}_investigating`,
      type: 'updated',
      description: 'Status changed to investigating',
      actor: 'System',
      timestamp: new Date(new Date(inc.detectedAt).getTime() + 3600000).toISOString(),
    });
  }

  if (inc.notifiedAuthority && inc.notifiedAt) {
    events.push({
      id: `${inc.id}_escalated`,
      type: 'escalated',
      description: 'Escalated to national authority per Article 62',
      actor: 'Compliance Officer',
      timestamp: inc.notifiedAt,
    });
  }

  if (inc.resolvedAt) {
    events.push({
      id: `${inc.id}_resolved`,
      type: 'resolved',
      description: inc.resolution || 'Incident resolved',
      actor: inc.resolvedBy || 'Unknown',
      timestamp: inc.resolvedAt,
    });
  }

  if (inc.status === 'closed') {
    events.push({
      id: `${inc.id}_closed`,
      type: 'closed',
      description: 'Incident closed after review',
      actor: 'Admin',
      timestamp: new Date(new Date(inc.resolvedAt || inc.detectedAt).getTime() + 86400000).toISOString(),
    });
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// ---------------------------------------------------------------------------
// Deadline calculation
// ---------------------------------------------------------------------------

function calcDeadline(detectedAt: string) {
  const detected = new Date(detectedAt).getTime();
  const deadline = detected + 72 * 60 * 60 * 1000;
  const now = Date.now();
  const hoursRemaining = Math.max(0, (deadline - now) / (1000 * 60 * 60));
  const isOverdue = now > deadline;
  return { deadline: new Date(deadline).toISOString(), hoursRemaining, isOverdue };
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const severityColors: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#94A3B8',
};

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

const timelineColors: Record<string, { bg: string; border: string; icon: string }> = {
  created: { bg: '#EFF6FF', border: '#93C5FD', icon: '#3B82F6' },
  updated: { bg: '#FFF7ED', border: '#FDBA74', icon: '#F97316' },
  escalated: { bg: '#FEF2F2', border: '#FCA5A5', icon: '#EF4444' },
  resolved: { bg: '#F0FDF4', border: '#86EFAC', icon: '#22C55E' },
  closed: { bg: '#F8FAFC', border: '#CBD5E1', icon: '#64748B' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<MockIncident[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [, setTick] = useState(0);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [systemOptions, setSystemOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Report form state
  const [reportTitle, setReportTitle] = useState('');
  const [reportSystem, setReportSystem] = useState('');
  const [reportSeverity, setReportSeverity] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Resolve form state
  const [resolveRootCause, setResolveRootCause] = useState('');
  const [resolveResolution, setResolveResolution] = useState('');
  const [resolveActions, setResolveActions] = useState('');
  const [resolvePreventive, setResolvePreventive] = useState('');

  // Fetch systems for dropdown
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

  // Fetch incidents from API
  const fetchIncidents = useCallback(() => {
    setLoadingIncidents(true);
    fetch('/api/v1/incidents')
      .then((r) => r.json())
      .then((json) => {
        const items = ((json.data || []) as Array<Record<string, unknown>>).map(mapApiIncident);
        setIncidents(items);
      })
      .catch(() => {})
      .finally(() => setLoadingIncidents(false));
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Tick every minute for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const selected = incidents.find((i) => i.id === selectedId) ?? null;
  const timeline = selected ? buildTimeline(selected) : [];
  const deadline = selected ? calcDeadline(selected.detectedAt) : null;

  const openCount = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;
  const criticalCount = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length;
  const overdueCount = incidents.filter((i) => {
    if (i.notifiedAuthority || i.status === 'closed' || i.status === 'resolved') return false;
    return calcDeadline(i.detectedAt).isOverdue;
  }).length;

  function handleEscalate() {
    if (!selected) return;
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === selected.id
          ? { ...inc, notifiedAuthority: true, notifiedAt: new Date().toISOString(), status: inc.status === 'open' ? 'investigating' : inc.status }
          : inc
      )
    );
    setShowEscalateConfirm(false);
  }

  function handleResolve() {
    if (!selected) return;
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === selected.id
          ? {
              ...inc,
              status: 'resolved' as const,
              rootCause: resolveRootCause,
              resolution: resolveResolution,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'Anton K.',
              correctiveActions: resolveActions.split('\n').filter(Boolean),
              preventiveMeasures: resolvePreventive || undefined,
            }
          : inc
      )
    );
    setShowResolveForm(false);
    setResolveRootCause('');
    setResolveResolution('');
    setResolveActions('');
    setResolvePreventive('');
  }

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

      {loadingIncidents && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B', fontSize: 14 }}>
          Loading incidents...
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Total Incidents" value={incidents.length} />
        <KpiCard label="Open / Investigating" value={openCount} change={openCount > 0 ? 'Needs attention' : 'All clear'} changeType={openCount > 0 ? 'negative' : 'positive'} />
        <KpiCard label="Critical" value={criticalCount} change={criticalCount === 0 ? 'None active' : `${criticalCount} active`} changeType={criticalCount > 0 ? 'negative' : 'positive'} />
        <KpiCard
          label="Overdue (72h)"
          value={overdueCount}
          change={overdueCount > 0 ? 'Notification required!' : 'All within deadline'}
          changeType={overdueCount > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Severity breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
          const count = incidents.filter((i) => i.severity === sev).length;
          return (
            <div
              key={sev}
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
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: severityColors[sev] }} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{count}</div>
                <div style={{ fontSize: 11, color: '#64748B', textTransform: 'capitalize' }}>{sev}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content: list + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Incidents list */}
        <Card padding={false}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>All Incidents</h2>
          </div>
          {incidents.map((inc, i) => {
            const incDeadline = calcDeadline(inc.detectedAt);
            const isOverdue = !inc.notifiedAuthority && inc.status !== 'resolved' && inc.status !== 'closed' && incDeadline.isOverdue;
            const isSelected = inc.id === selectedId;

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedId(isSelected ? null : inc.id)}
                style={{
                  padding: '14px 24px',
                  borderBottom: i < incidents.length - 1 ? '1px solid #F1F5F9' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isSelected ? '#EEF2FF' : isOverdue ? '#FEF2F2' : 'transparent',
                  borderLeft: isSelected ? '3px solid #6366F1' : isOverdue ? '3px solid #EF4444' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{inc.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Badge variant={severityVariant[inc.severity]}>{inc.severity}</Badge>
                      <Badge variant={statusVariant[inc.status]}>{inc.status}</Badge>
                      {inc.notifiedAuthority && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#6366F1',
                          background: '#EEF2FF',
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}>
                          Art. 62 Notified
                        </span>
                      )}
                      {isOverdue && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#DC2626',
                          background: '#FEE2E2',
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}>
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      {inc.system} &middot; {inc.reporter} &middot; {new Date(inc.detectedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Detail panel */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Incident header */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                    {selected.title}
                  </h2>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge variant={severityVariant[selected.severity]}>{selected.severity}</Badge>
                    <Badge variant={statusVariant[selected.status]}>{selected.status}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 18,
                    color: '#94A3B8',
                    padding: 4,
                  }}
                >
                  ×
                </button>
              </div>

              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                {selected.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 2 }}>System</div>
                  <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{selected.system}</div>
                </div>
                <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 2 }}>Reporter</div>
                  <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{selected.reporter}</div>
                </div>
                <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 2 }}>Detected</div>
                  <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{new Date(selected.detectedAt).toLocaleString()}</div>
                </div>
                <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 2 }}>Affected Users</div>
                  <div style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>{selected.affectedUsers?.toLocaleString() ?? 'N/A'}</div>
                </div>
              </div>

              {/* Actions */}
              {selected.status !== 'resolved' && selected.status !== 'closed' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {!selected.notifiedAuthority && (
                    <Button variant="danger" size="sm" onClick={() => setShowEscalateConfirm(true)}>
                      Escalate to Authority
                    </Button>
                  )}
                  <Button size="sm" onClick={() => setShowResolveForm(true)}>
                    Resolve Incident
                  </Button>
                </div>
              )}
            </Card>

            {/* Art. 62 Notification Deadline */}
            {deadline && selected.status !== 'closed' && (
              <Card>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 12px' }}>
                  Article 62 — Notification Deadline
                </h3>
                {selected.notifiedAuthority ? (
                  <div style={{
                    padding: '14px 18px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#DCFCE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      color: '#16A34A',
                    }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>Authority Notified</div>
                      <div style={{ fontSize: 12, color: '#15803D' }}>
                        Notified at {new Date(selected.notifiedAt!).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '14px 18px',
                    background: deadline.isOverdue ? '#FEF2F2' : '#FFFBEB',
                    border: `1px solid ${deadline.isOverdue ? '#FECACA' : '#FDE68A'}`,
                    borderRadius: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: deadline.isOverdue ? '#DC2626' : '#92400E' }}>
                        {deadline.isOverdue ? 'DEADLINE EXCEEDED' : 'Notification Required'}
                      </div>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: deadline.isOverdue ? '#DC2626' : '#D97706',
                        background: deadline.isOverdue ? '#FEE2E2' : '#FEF3C7',
                        padding: '3px 10px',
                        borderRadius: 20,
                      }}>
                        {deadline.isOverdue
                          ? 'OVERDUE'
                          : `${deadline.hoursRemaining.toFixed(1)}h remaining`
                        }
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ background: '#E2E8F0', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 4,
                          width: `${Math.min(100, ((72 - deadline.hoursRemaining) / 72) * 100)}%`,
                          background: deadline.isOverdue
                            ? '#EF4444'
                            : deadline.hoursRemaining < 12
                            ? '#F97316'
                            : '#EAB308',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: deadline.isOverdue ? '#991B1B' : '#92400E' }}>
                      72-hour notification deadline: {new Date(deadline.deadline).toLocaleString()}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Resolution details (if resolved) */}
            {selected.rootCause && (
              <Card>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 12px' }}>
                  Resolution Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Root Cause</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{selected.rootCause}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Resolution</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{selected.resolution}</div>
                  </div>
                  {selected.correctiveActions.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Corrective Actions</div>
                      {selected.correctiveActions.map((action, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#334155' }}>{action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selected.preventiveMeasures && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Preventive Measures</div>
                      <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{selected.preventiveMeasures}</div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>
                Incident Timeline
              </h3>
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                {/* Vertical line */}
                <div style={{
                  position: 'absolute',
                  left: 9,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: '#E2E8F0',
                }} />

                {timeline.map((event, idx) => {
                  const colors = timelineColors[event.type] || timelineColors.created;
                  return (
                    <div key={event.id} style={{ position: 'relative', paddingBottom: idx < timeline.length - 1 ? 20 : 0 }}>
                      {/* Dot */}
                      <div style={{
                        position: 'absolute',
                        left: -22,
                        top: 4,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: colors.bg,
                        border: `2px solid ${colors.border}`,
                        zIndex: 1,
                      }} />

                      <div style={{
                        padding: '8px 14px',
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: colors.icon, textTransform: 'capitalize' }}>
                            {event.type}
                          </span>
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                          {event.description}
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                          by {event.actor}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Report modal */}
      <Modal open={showReport} onClose={() => setShowReport(false)} title="Report New Incident" width={600}>
        <Input label="Incident Title" placeholder="Brief description of the incident" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
        <Select
          label="AI System"
          placeholder="Select affected system"
          value={reportSystem}
          onChange={(e) => setReportSystem(e.target.value)}
          options={systemOptions}
        />
        <Select
          label="Severity"
          placeholder="Select severity level"
          value={reportSeverity}
          onChange={(e) => setReportSeverity(e.target.value)}
          options={[
            { value: 'critical', label: 'Critical — System compromised or causing harm' },
            { value: 'high', label: 'High — Significant compliance risk' },
            { value: 'medium', label: 'Medium — Performance degradation' },
            { value: 'low', label: 'Low — Minor issue, no immediate risk' },
          ]}
        />
        <Textarea label="Description" placeholder="Detailed description of what happened, when, and potential impact..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} />
        <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>
            Reporting Obligation
          </div>
          <div style={{ fontSize: 12, color: '#991B1B', lineHeight: 1.5 }}>
            Under Article 62, serious incidents involving high-risk AI systems must be reported to the relevant market surveillance authority within 72 hours of detection.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setShowReport(false)}>Cancel</Button>
          <Button variant="danger" disabled={reportSubmitting || !reportTitle || !reportSystem || !reportSeverity || !reportDescription} onClick={async () => {
            setReportSubmitting(true);
            try {
              const res = await fetch('/api/v1/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemId: reportSystem,
                  severity: reportSeverity,
                  title: reportTitle,
                  description: reportDescription,
                  reportedBy: 'user',
                }),
              });
              if (res.ok) {
                setShowReport(false);
                setReportTitle(''); setReportSystem(''); setReportSeverity(''); setReportDescription('');
                fetchIncidents();
              }
            } catch (err) {
              console.error('Failed to report incident:', err);
            } finally {
              setReportSubmitting(false);
            }
          }}>{reportSubmitting ? 'Reporting...' : 'Report Incident'}</Button>
        </div>
      </Modal>

      {/* Escalate confirmation modal */}
      <Modal open={showEscalateConfirm} onClose={() => setShowEscalateConfirm(false)} title="Escalate to Authority" width={520}>
        <div style={{ padding: '14px 18px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', marginBottom: 6 }}>
            Article 62 — Serious Incident Notification
          </div>
          <div style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.6 }}>
            This will formally notify the relevant national market surveillance authority
            of this incident. Under the EU AI Act, serious incidents involving high-risk
            AI systems must be reported within 72 hours of detection.
          </div>
        </div>
        {selected && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Incident</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{selected.title}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
              {selected.system} &middot; Severity: {selected.severity}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setShowEscalateConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleEscalate}>Confirm Escalation</Button>
        </div>
      </Modal>

      {/* Resolve form modal */}
      <Modal open={showResolveForm} onClose={() => setShowResolveForm(false)} title="Resolve Incident" width={600}>
        <Textarea
          label="Root Cause"
          placeholder="What caused this incident?"
          value={resolveRootCause}
          onChange={(e) => setResolveRootCause(e.target.value)}
        />
        <Textarea
          label="Resolution"
          placeholder="What was done to resolve it?"
          value={resolveResolution}
          onChange={(e) => setResolveResolution(e.target.value)}
        />
        <Textarea
          label="Corrective Actions (one per line)"
          placeholder="List each corrective action on a separate line..."
          value={resolveActions}
          onChange={(e) => setResolveActions(e.target.value)}
        />
        <Textarea
          label="Preventive Measures (optional)"
          placeholder="What will be done to prevent recurrence?"
          value={resolvePreventive}
          onChange={(e) => setResolvePreventive(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setShowResolveForm(false)}>Cancel</Button>
          <Button onClick={handleResolve}>Resolve Incident</Button>
        </div>
      </Modal>
    </div>
  );
}
