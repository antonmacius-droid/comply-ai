'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, KpiCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

type CheckType = 'performance' | 'drift' | 'bias' | 'data_quality' | 'security' | 'latency' | 'error_rate' | 'uptime';
type CheckStatus = 'pass' | 'warning' | 'fail';

interface HealthCell {
  checkType: CheckType;
  status: CheckStatus;
  score: number;
  detail: string;
}

interface SystemMonitor {
  id: string;
  name: string;
  lastCheck: string;
  checks: HealthCell[];
}

interface RecentCheck {
  system: string;
  systemId: string;
  type: string;
  status: CheckStatus;
  detail: string;
  score: number;
  time: string;
  recommendations: string[];
  metrics: Record<string, number>;
}

const CHECK_TYPES: CheckType[] = ['performance', 'drift', 'bias', 'data_quality', 'security', 'latency', 'error_rate', 'uptime'];

const CHECK_TYPE_LABELS: Record<CheckType, string> = {
  performance: 'Perf',
  drift: 'Drift',
  bias: 'Bias',
  data_quality: 'Data',
  security: 'Sec',
  latency: 'Lat',
  error_rate: 'Err',
  uptime: 'Up',
};

function randomStatus(): CheckStatus {
  const r = Math.random();
  return r < 0.65 ? 'pass' : r < 0.85 ? 'warning' : 'fail';
}

function randomScore(status: CheckStatus): number {
  if (status === 'pass') return 80 + Math.floor(Math.random() * 20);
  if (status === 'warning') return 55 + Math.floor(Math.random() * 25);
  return 20 + Math.floor(Math.random() * 35);
}

function generateChecks(): HealthCell[] {
  return CHECK_TYPES.map((ct) => {
    const status = randomStatus();
    return {
      checkType: ct,
      status,
      score: randomScore(status),
      detail: `${ct} check — score ${randomScore(status)}`,
    };
  });
}

// Initial data will be loaded from the systems API

// ---------------------------------------------------------------------------
// Trend data (last 30 days simulated)
// ---------------------------------------------------------------------------

function generateTrendData(): Array<{ day: number; pass: number; warning: number; fail: number }> {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    pass: 60 + Math.floor(Math.random() * 25),
    warning: 5 + Math.floor(Math.random() * 15),
    fail: Math.floor(Math.random() * 8),
  }));
}

// ---------------------------------------------------------------------------
// Alert thresholds
// ---------------------------------------------------------------------------

interface AlertThreshold {
  checkType: CheckType;
  warningThreshold: number;
  criticalThreshold: number;
  enabled: boolean;
}

const defaultThresholds: AlertThreshold[] = CHECK_TYPES.map((ct) => ({
  checkType: ct,
  warningThreshold: 75,
  criticalThreshold: 50,
  enabled: true,
}));

// ---------------------------------------------------------------------------
// Heatmap cell colors
// ---------------------------------------------------------------------------

function cellColor(status: CheckStatus): string {
  if (status === 'pass') return '#22C55E';
  if (status === 'warning') return '#EAB308';
  return '#EF4444';
}

function cellBg(status: CheckStatus): string {
  if (status === 'pass') return '#F0FDF4';
  if (status === 'warning') return '#FEFCE8';
  return '#FEF2F2';
}

// ---------------------------------------------------------------------------
// Inline SVG trend chart
// ---------------------------------------------------------------------------

function TrendChart({ data }: { data: Array<{ day: number; pass: number; warning: number; fail: number }> }) {
  const w = 680;
  const h = 140;
  const padX = 30;
  const padY = 20;
  const maxVal = Math.max(...data.map((d) => d.pass + d.warning + d.fail));
  const stepX = (w - padX * 2) / (data.length - 1);

  function toY(val: number): number {
    return h - padY - ((val / maxVal) * (h - padY * 2));
  }

  function toX(idx: number): number {
    return padX + idx * stepX;
  }

  function buildPath(key: 'pass' | 'warning' | 'fail'): string {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d[key]).toFixed(1)}`)
      .join(' ');
  }

  function buildArea(key: 'pass' | 'warning' | 'fail'): string {
    const line = data.map((d, i) => `${toX(i).toFixed(1)} ${toY(d[key]).toFixed(1)}`).join(' L ');
    return `M ${toX(0).toFixed(1)} ${(h - padY).toFixed(1)} L ${line} L ${toX(data.length - 1).toFixed(1)} ${(h - padY).toFixed(1)} Z`;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 140 }}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = h - padY - ((pct / 100) * maxVal / maxVal) * (h - padY * 2);
        return (
          <g key={pct}>
            <line x1={padX} y1={y} x2={w - padX} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 2" />
            <text x={padX - 4} y={y + 3} fontSize="9" fill="#94A3B8" textAnchor="end">{pct}</text>
          </g>
        );
      })}

      {/* Areas */}
      <path d={buildArea('pass')} fill="#22C55E" opacity="0.08" />
      <path d={buildArea('warning')} fill="#EAB308" opacity="0.1" />
      <path d={buildArea('fail')} fill="#EF4444" opacity="0.1" />

      {/* Lines */}
      <path d={buildPath('pass')} fill="none" stroke="#22C55E" strokeWidth="2" />
      <path d={buildPath('warning')} fill="none" stroke="#EAB308" strokeWidth="1.5" strokeDasharray="4 2" />
      <path d={buildPath('fail')} fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 2" />

      {/* X axis labels */}
      {data.filter((_, i) => i % 5 === 0).map((d, i) => (
        <text key={d.day} x={toX(d.day - 1)} y={h - 4} fontSize="9" fill="#94A3B8" textAnchor="middle">
          Day {d.day}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MonitoringPage() {
  const [systems, setSystems] = useState<SystemMonitor[]>([]);
  const [recentChecks, setRecentChecks] = useState<RecentCheck[]>([]);
  const [expandedCheckIdx, setExpandedCheckIdx] = useState<number | null>(null);
  const [runningCheck, setRunningCheck] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [loadingMonitoring, setLoadingMonitoring] = useState(true);

  const trendData = useMemo(() => generateTrendData(), []);

  // Fetch systems from API and generate monitoring data
  useEffect(() => {
    setLoadingMonitoring(true);
    fetch('/api/v1/systems')
      .then((r) => r.json())
      .then((json) => {
        const apiSystems = ((json.data || []) as Array<Record<string, unknown>>).map((s) => ({
          id: s.id as string,
          name: s.name as string,
          lastCheck: 'Not checked yet',
          checks: generateChecks(),
        }));
        setSystems(apiSystems);
        // Generate recent checks from the first few systems
        const recent: RecentCheck[] = apiSystems.slice(0, 4).flatMap((sys) => {
          const checks = sys.checks.filter((c) => c.status !== 'pass').slice(0, 1);
          return checks.map((c) => ({
            system: sys.name,
            systemId: sys.id,
            type: c.checkType,
            status: c.status,
            detail: c.detail,
            score: c.score,
            time: new Date().toISOString().slice(0, 16).replace('T', ' '),
            recommendations: c.status === 'warning' ? ['Review and investigate'] : [],
            metrics: { score: c.score },
          }));
        });
        setRecentChecks(recent);
      })
      .catch(() => {})
      .finally(() => setLoadingMonitoring(false));
  }, []);

  const totalWarnings = systems.reduce((sum, s) => sum + s.checks.filter((c) => c.status === 'warning').length, 0);
  const totalFails = systems.reduce((sum, s) => sum + s.checks.filter((c) => c.status === 'fail').length, 0);
  const avgScore = systems.length > 0 ? Math.round(systems.reduce((sum, s) => sum + s.checks.reduce((cs, c) => cs + c.score, 0) / s.checks.length, 0) / systems.length) : 0;

  function handleRunCheck(systemId: string) {
    setRunningCheck(systemId);
    // Simulate running checks
    setTimeout(() => {
      setSystems((prev) =>
        prev.map((s) =>
          s.id === systemId ? { ...s, checks: generateChecks(), lastCheck: 'Just now' } : s
        )
      );
      setRunningCheck(null);
    }, 800);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Post-Market Monitoring
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
            Continuous monitoring of AI system performance, drift, and bias (Article 72)
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowAlerts(true)}>Alert Configuration</Button>
      </div>

      {loadingMonitoring && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B', fontSize: 14 }}>
          Loading monitoring data...
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Systems Monitored" value={systems.length} />
        <KpiCard label="Avg Health Score" value={`${avgScore}%`} change={avgScore >= 80 ? 'Healthy' : avgScore >= 60 ? 'Degraded' : 'Critical'} changeType={avgScore >= 80 ? 'positive' : 'negative'} />
        <KpiCard label="Warnings" value={totalWarnings} change={totalWarnings > 0 ? 'Action needed' : 'All clear'} changeType={totalWarnings > 0 ? 'negative' : 'positive'} />
        <KpiCard label="Failures" value={totalFails} change={totalFails === 0 ? 'All passing' : `${totalFails} failing`} changeType={totalFails > 0 ? 'negative' : 'positive'} />
      </div>

      {/* System Health Heatmap */}
      <Card style={{ marginBottom: 24 }} padding={false}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>System Health Heatmap</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {(['pass', 'warning', 'fail'] as const).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: cellColor(s) }} />
                <span style={{ fontSize: 11, color: '#64748B', textTransform: 'capitalize' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', minWidth: 180 }}>
                  System
                </th>
                {CHECK_TYPES.map((ct) => (
                  <th key={ct} style={{ padding: '10px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', textAlign: 'center', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', width: 60 }}>
                    {CHECK_TYPE_LABELS[ct]}
                  </th>
                ))}
                <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', textAlign: 'center', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', width: 90 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {systems.map((sys) => (
                <tr key={sys.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{sys.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{sys.lastCheck}</div>
                  </td>
                  {sys.checks.map((cell) => (
                    <td key={cell.checkType} style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <div
                        title={`${cell.checkType}: ${cell.status} (${cell.score})`}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: cellBg(cell.status),
                          border: `2px solid ${cellColor(cell.status)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          fontSize: 11,
                          fontWeight: 700,
                          color: cellColor(cell.status),
                          transition: 'transform 0.15s ease',
                          cursor: 'default',
                        }}
                      >
                        {cell.score}
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: '6px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRunCheck(sys.id)}
                      disabled={runningCheck === sys.id}
                      style={{
                        padding: '5px 12px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: runningCheck === sys.id ? '#94A3B8' : '#6366F1',
                        background: runningCheck === sys.id ? '#F1F5F9' : '#EEF2FF',
                        border: 'none',
                        borderRadius: 6,
                        cursor: runningCheck === sys.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {runningCheck === sys.id ? 'Running...' : 'Run Check'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Trend chart */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Check Results — Last 30 Days</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 3, background: '#22C55E', borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>Pass</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 3, background: '#EAB308', borderRadius: 2, borderStyle: 'dashed' }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>Warning</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 3, background: '#EF4444', borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>Fail</span>
            </div>
          </div>
        </div>
        <TrendChart data={trendData} />
      </Card>

      {/* Recent checks with expandable details */}
      <Card padding={false}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Recent Monitoring Checks</h2>
        </div>
        {recentChecks.map((check, i) => (
          <div key={i}>
            <div
              onClick={() => setExpandedCheckIdx(expandedCheckIdx === i ? null : i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                borderBottom: expandedCheckIdx === i ? 'none' : (i < recentChecks.length - 1 ? '1px solid #F1F5F9' : 'none'),
                cursor: 'pointer',
                transition: 'background 0.1s ease',
                background: expandedCheckIdx === i ? '#F8FAFC' : 'transparent',
              }}
              onMouseEnter={(e) => { if (expandedCheckIdx !== i) e.currentTarget.style.background = '#FAFBFC'; }}
              onMouseLeave={(e) => { if (expandedCheckIdx !== i) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: check.status === 'pass' ? '#22C55E' : check.status === 'warning' ? '#EAB308' : '#EF4444',
                }} />
                <div>
                  <div style={{ fontSize: 13, color: '#334155' }}>
                    <span style={{ fontWeight: 500 }}>{check.system}</span>
                    <span style={{ color: '#94A3B8' }}> — {check.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{check.detail}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge variant={check.status === 'pass' ? 'success' : check.status === 'warning' ? 'warning' : 'danger'}>
                  {check.score}
                </Badge>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{check.time}</span>
                <span style={{ fontSize: 12, color: '#94A3B8', transform: expandedCheckIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  ▾
                </span>
              </div>
            </div>

            {/* Expanded detail */}
            {expandedCheckIdx === i && (
              <div style={{
                padding: '0 24px 16px',
                background: '#F8FAFC',
                borderBottom: i < recentChecks.length - 1 ? '1px solid #F1F5F9' : 'none',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {Object.entries(check.metrics).map(([key, val]) => (
                    <div key={key} style={{ padding: '8px 12px', background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
                        {typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(3)) : val}
                      </div>
                    </div>
                  ))}
                </div>

                {check.recommendations.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                      Recommendations
                    </div>
                    {check.recommendations.map((rec, ri) => (
                      <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366F1', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#475569' }}>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </Card>

      {/* Alert Configuration Modal */}
      <Modal open={showAlerts} onClose={() => setShowAlerts(false)} title="Alert Configuration" width={640}>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
          Configure thresholds for when monitoring checks should trigger warnings or critical alerts.
          Scores below the threshold will flag the respective check.
        </p>

        <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Check Type', 'Warning Below', 'Critical Below', 'Enabled'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    textAlign: 'left',
                    borderBottom: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thresholds.map((t, idx) => (
                <tr key={t.checkType} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#0F172A', textTransform: 'capitalize' }}>
                    {t.checkType.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <input
                      type="number"
                      value={t.warningThreshold}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setThresholds((prev) => prev.map((p, i) => i === idx ? { ...p, warningThreshold: val } : p));
                      }}
                      style={{
                        width: 60,
                        padding: '5px 8px',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        fontSize: 13,
                        color: '#0F172A',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <input
                      type="number"
                      value={t.criticalThreshold}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setThresholds((prev) => prev.map((p, i) => i === idx ? { ...p, criticalThreshold: val } : p));
                      }}
                      style={{
                        width: 60,
                        padding: '5px 8px',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        fontSize: 13,
                        color: '#0F172A',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    <button
                      onClick={() => {
                        setThresholds((prev) => prev.map((p, i) => i === idx ? { ...p, enabled: !p.enabled } : p));
                      }}
                      style={{
                        width: 40,
                        height: 22,
                        borderRadius: 11,
                        border: 'none',
                        background: t.enabled ? '#6366F1' : '#CBD5E1',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        position: 'absolute',
                        top: 3,
                        left: t.enabled ? 21 : 3,
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <Button variant="secondary" onClick={() => setShowAlerts(false)}>Cancel</Button>
          <Button onClick={() => setShowAlerts(false)}>Save Configuration</Button>
        </div>
      </Modal>
    </div>
  );
}
