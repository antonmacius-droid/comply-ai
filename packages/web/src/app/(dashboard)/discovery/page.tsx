'use client';

import { useState, useEffect } from 'react';
import { Card, KpiCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiscoveredRepo {
  repoName: string;
  repoUrl: string;
  detectedFrameworks: string[];
  detectedUsage: string;
  suggestedRiskLevel: 'high' | 'limited' | 'minimal';
  confidence: number;
  lastCommit: string;
  stars: number;
  language: string;
  registered?: boolean;
}

interface ScanResult {
  id: string;
  org: string;
  scannedAt: string;
  totalReposScanned: number;
  aiReposFound: number;
  results: DiscoveredRepo[];
}

// ---------------------------------------------------------------------------
// Mock previously scanned results
// ---------------------------------------------------------------------------

function mapApiScan(scan: Record<string, unknown>): ScanResult {
  const results = ((scan.results as Array<Record<string, unknown>>) || []).map((r) => ({
    repoName: (r.repoName as string) || '',
    repoUrl: (r.repoUrl as string) || '',
    detectedFrameworks: (r.detectedFrameworks as string[]) || [],
    detectedUsage: (r.detectedUsage as string) || '',
    suggestedRiskLevel: (r.suggestedRiskLevel as 'high' | 'limited' | 'minimal') || 'minimal',
    confidence: (r.confidence as number) || 0,
    lastCommit: (r.lastCommit as string) || '',
    stars: (r.stars as number) || 0,
    language: (r.language as string) || '',
    registered: r.registered as boolean | undefined,
  }));
  return {
    id: (scan.id as string) || '',
    org: (scan.org as string) || '',
    scannedAt: (scan.scannedAt as string) || '',
    totalReposScanned: (scan.totalReposScanned as number) || 0,
    aiReposFound: (scan.aiReposFound as number) || results.length,
    results,
  };
}

// simulateScan removed — now uses API

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  limited: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  minimal: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
};

const langColors: Record<string, string> = {
  Python: '#3B82F6',
  TypeScript: '#6366F1',
  JavaScript: '#EAB308',
  Go: '#06B6D4',
  Rust: '#F97316',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DiscoveryPage() {
  const [orgName, setOrgName] = useState('acme-corp');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [registeredRepos, setRegisteredRepos] = useState<Set<string>>(new Set());
  const [loadingScans, setLoadingScans] = useState(true);

  // Fetch previous scans from API
  useEffect(() => {
    setLoadingScans(true);
    fetch('/api/v1/discovery')
      .then((r) => r.json())
      .then((json) => {
        const scanResults = ((json.data || []) as Array<Record<string, unknown>>).map(mapApiScan);
        setScans(scanResults);
        const registeredSet = new Set(
          scanResults.flatMap((s) => s.results.filter((r) => r.registered).map((r) => r.repoName))
        );
        setRegisteredRepos(registeredSet);
      })
      .catch(() => {})
      .finally(() => setLoadingScans(false));
  }, []);

  const totalDiscovered = scans.reduce((sum, s) => sum + s.aiReposFound, 0);
  const totalRegistered = registeredRepos.size;

  async function handleScan() {
    if (!orgName.trim() || scanning) return;

    setScanning(true);
    setScanProgress(0);
    setCurrentScan(null);

    // Show progressive scanning UI
    const steps = [10, 25, 45, 65, 80, 95];
    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setScanProgress(steps[step]!);
        step++;
      }
    }, 300);

    try {
      const res = await fetch('/api/v1/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org: orgName.trim() }),
      });
      const json = await res.json();
      clearInterval(interval);
      setScanProgress(100);

      if (res.ok && json.data?.result) {
        const scan = mapApiScan(json.data.result);
        setCurrentScan(scan);
        setScans((prev) => [scan, ...prev]);
      }
    } catch (err) {
      console.error('Failed to run discovery scan:', err);
      clearInterval(interval);
    }

    setTimeout(() => {
      setScanning(false);
      setScanProgress(0);
    }, 500);
  }

  function handleRegister(repoName: string) {
    setRegisteredRepos((prev) => new Set([...prev, repoName]));
  }

  const displayResults = currentScan?.results ?? [];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          AI System Discovery
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          Automatically discover AI/ML systems in your GitHub organization
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Total Scans" value={scans.length} />
        <KpiCard label="AI Repos Found" value={totalDiscovered} />
        <KpiCard label="Registered" value={totalRegistered} change={`${totalDiscovered - totalRegistered} pending`} changeType={totalDiscovered - totalRegistered > 0 ? 'negative' : 'positive'} />
        <KpiCard label="Last Scan" value={scans[0] ? new Date(scans[0].scannedAt).toLocaleDateString() : 'Never'} />
      </div>

      {/* Scan controls */}
      <Card style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 16px' }}>
          Scan Organization
        </h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, maxWidth: 400 }}>
            <Input
              label="GitHub Organization"
              placeholder="e.g., acme-corp"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <Button
            onClick={handleScan}
            disabled={scanning || !orgName.trim()}
            style={{ marginBottom: 0, flexShrink: 0 }}
          >
            {scanning ? 'Scanning...' : 'Scan Organization'}
          </Button>
        </div>

        {/* Progress indicator */}
        {scanning && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                Scanning repositories...
              </span>
              <span style={{ fontSize: 12, color: '#6366F1', fontWeight: 600 }}>
                {scanProgress}%
              </span>
            </div>
            <div style={{ background: '#E2E8F0', borderRadius: 6, height: 8, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 6,
                  width: `${scanProgress}%`,
                  background: 'linear-gradient(90deg, #6366F1, #818CF8)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
              Checking Dockerfiles, requirements.txt, package.json for AI/ML frameworks...
            </div>
          </div>
        )}
      </Card>

      {/* Current scan results */}
      {displayResults.length > 0 && (
        <Card padding={false} style={{ marginBottom: 24 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Scan Results
              </h2>
              {currentScan && (
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {currentScan.totalReposScanned} repos scanned &middot; {currentScan.aiReposFound} AI systems found &middot; {new Date(currentScan.scannedAt).toLocaleString()}
                </div>
              )}
            </div>
            <Badge variant="info">{displayResults.length} discovered</Badge>
          </div>

          {displayResults.map((repo, i) => {
            const isRegistered = registeredRepos.has(repo.repoName);
            const risk = riskColors[repo.suggestedRiskLevel] || riskColors.minimal;

            return (
              <div
                key={repo.repoName}
                style={{
                  padding: '16px 24px',
                  borderBottom: i < displayResults.length - 1 ? '1px solid #F1F5F9' : 'none',
                  transition: 'background 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                        {repo.repoName}
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: risk.text,
                        background: risk.bg,
                        border: `1px solid ${risk.border}`,
                        padding: '2px 8px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {repo.suggestedRiskLevel} risk
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#6366F1',
                        background: '#EEF2FF',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}>
                        {repo.confidence}% confidence
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 8 }}>
                      {repo.detectedUsage}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {/* Frameworks */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {repo.detectedFrameworks.map((fw) => (
                          <span
                            key={fw}
                            style={{
                              fontSize: 10,
                              fontWeight: 500,
                              color: '#475569',
                              background: '#F1F5F9',
                              padding: '2px 8px',
                              borderRadius: 4,
                              border: '1px solid #E2E8F0',
                            }}
                          >
                            {fw}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94A3B8' }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: langColors[repo.language] || '#94A3B8',
                        }} />
                        {repo.language}
                      </div>

                      <span style={{ fontSize: 11, color: '#94A3B8' }}>
                        Last commit: {new Date(repo.lastCommit).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginLeft: 16, flexShrink: 0 }}>
                    {isRegistered ? (
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#16A34A',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        padding: '6px 14px',
                        borderRadius: 6,
                        display: 'inline-block',
                      }}>
                        Registered
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => handleRegister(repo.repoName)}>
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Previous scans */}
      <Card padding={false}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Previous Scans</h2>
        </div>
        {scans.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>No previous scans. Run your first scan above.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Organization', 'Date', 'Repos Scanned', 'AI Systems Found', 'Status'].map((h) => (
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
              {scans.map((scan) => (
                <tr key={scan.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{scan.org}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>
                    {new Date(scan.scannedAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>
                    {scan.totalReposScanned}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: scan.aiReposFound > 0 ? '#6366F1' : '#94A3B8',
                    }}>
                      {scan.aiReposFound}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant="success">Complete</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
