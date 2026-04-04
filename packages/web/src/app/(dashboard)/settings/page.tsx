'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConnectionStatus {
  connected: boolean;
  testing: boolean;
  lastTested?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Team mock data
// ---------------------------------------------------------------------------

const teamMembers = [
  { name: 'Anton K.', email: 'anton@comply.ai', role: 'Admin', lastActive: '2 min ago' },
  { name: 'Maria L.', email: 'maria@comply.ai', role: 'Editor', lastActive: '1 hour ago' },
  { name: 'Jan D.', email: 'jan@comply.ai', role: 'Editor', lastActive: '3 hours ago' },
  { name: 'Sarah M.', email: 'sarah@comply.ai', role: 'Viewer', lastActive: '1 day ago' },
];

const roleVariant: Record<string, 'danger' | 'warning' | 'default'> = {
  Admin: 'danger',
  Editor: 'warning',
  Viewer: 'default',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  // Organization
  const [orgName, setOrgName] = useState('Acme Financial Corp');
  const [orgSlug, setOrgSlug] = useState('acme-financial');
  const [orgEmail, setOrgEmail] = useState('compliance@acme-financial.eu');

  // Bulwark connection
  const [bulwarkUrl, setBulwarkUrl] = useState('https://bulwark.acme-financial.eu');
  const [bulwarkKey, setBulwarkKey] = useState('bwk_sk_live_1234567890abcdef');
  const [bulwarkSyncInterval, setBulwarkSyncInterval] = useState('5');
  const [bulwarkStatus, setBulwarkStatus] = useState<ConnectionStatus>({ connected: true, testing: false });

  // GitHub integration
  const [githubToken, setGithubToken] = useState('ghp_1234567890abcdef1234567890abcdef12345678');
  const [githubOrg, setGithubOrg] = useState('acme-corp');
  const [githubAutoScan, setGithubAutoScan] = useState(true);
  const [githubStatus, setGithubStatus] = useState<ConnectionStatus>({ connected: true, testing: false });

  // Notifications
  const [notifEmail, setNotifEmail] = useState('compliance-alerts@acme-financial.eu');
  const [notifSlack, setNotifSlack] = useState('https://hooks.slack.com/services/T00/B00/xxxx');
  const [notifOverdueIncidents, setNotifOverdueIncidents] = useState(true);
  const [notifMonitoringAlerts, setNotifMonitoringAlerts] = useState(true);
  const [notifDiscoveryResults, setNotifDiscoveryResults] = useState(false);

  function testBulwarkConnection() {
    setBulwarkStatus({ connected: false, testing: true });
    setTimeout(() => {
      setBulwarkStatus({ connected: true, testing: false, lastTested: new Date().toISOString() });
    }, 1500);
  }

  function testGithubConnection() {
    setGithubStatus({ connected: false, testing: true });
    setTimeout(() => {
      setGithubStatus({ connected: true, testing: false, lastTested: new Date().toISOString() });
    }, 1200);
  }

  function maskValue(val: string, visibleChars: number = 8): string {
    if (val.length <= visibleChars) return val;
    return val.slice(0, visibleChars) + '••••••••••••••••';
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          Organization settings, integrations, and notification preferences
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
        {/* Organization details */}
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 20px' }}>
            Organization
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            <Input label="Slug" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} />
          </div>
          <Input label="Primary Contact Email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <Button size="sm">Save Changes</Button>
          </div>
        </Card>

        {/* Bulwark AI connection */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Bulwark AI Gateway
              </h2>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                Connect to your Bulwark AI governance gateway for policy enforcement, audit logs, and monitoring
              </div>
            </div>
            {bulwarkStatus.testing ? (
              <Badge variant="warning">Testing...</Badge>
            ) : bulwarkStatus.connected ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="danger">Disconnected</Badge>
            )}
          </div>

          <Input
            label="Bulwark URL"
            value={bulwarkUrl}
            onChange={(e) => setBulwarkUrl(e.target.value)}
            placeholder="https://your-bulwark-instance.com"
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="API Key"
              type="password"
              value={bulwarkKey}
              onChange={(e) => setBulwarkKey(e.target.value)}
              placeholder="bwk_sk_..."
            />
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: -8, marginBottom: 12 }}>
              Stored securely. Shown as: {maskValue(bulwarkKey)}
            </div>
          </div>

          <Select
            label="Sync Interval"
            value={bulwarkSyncInterval}
            onChange={(e) => setBulwarkSyncInterval(e.target.value)}
            options={[
              { value: '1', label: 'Every 1 minute' },
              { value: '5', label: 'Every 5 minutes' },
              { value: '15', label: 'Every 15 minutes' },
              { value: '30', label: 'Every 30 minutes' },
              { value: '60', label: 'Every hour' },
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Last Synced</div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>2026-04-04 12:34 UTC</div>
            </div>
            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Entries Synced</div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>2,847 audit entries</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" size="sm" onClick={testBulwarkConnection} disabled={bulwarkStatus.testing}>
              {bulwarkStatus.testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </Card>

        {/* GitHub Integration */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                GitHub Integration
              </h2>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                Connect to GitHub for automatic AI system discovery across your organization repos
              </div>
            </div>
            {githubStatus.testing ? (
              <Badge variant="warning">Testing...</Badge>
            ) : githubStatus.connected ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="danger">Disconnected</Badge>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <Input
              label="Personal Access Token"
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_..."
            />
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: -8, marginBottom: 12 }}>
              Requires <code style={{ fontSize: 10, background: '#F1F5F9', padding: '1px 4px', borderRadius: 3 }}>repo</code> and <code style={{ fontSize: 10, background: '#F1F5F9', padding: '1px 4px', borderRadius: 3 }}>read:org</code> scopes. Shown as: {maskValue(githubToken, 4)}
            </div>
          </div>

          <Input
            label="Organization Name"
            value={githubOrg}
            onChange={(e) => setGithubOrg(e.target.value)}
            placeholder="your-org-name"
          />

          {/* Auto-scan toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#F8FAFC',
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            marginTop: 8,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>Automatic Discovery Scan</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Automatically scan for new AI/ML repositories weekly
              </div>
            </div>
            <button
              onClick={() => setGithubAutoScan(!githubAutoScan)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                background: githubAutoScan ? '#6366F1' : '#CBD5E1',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#FFFFFF',
                position: 'absolute',
                top: 3,
                left: githubAutoScan ? 23 : 3,
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" size="sm" onClick={testGithubConnection} disabled={githubStatus.testing}>
              {githubStatus.testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button size="sm">Save</Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 20px' }}>
            Notification Preferences
          </h2>

          <Input
            label="Alert Email"
            value={notifEmail}
            onChange={(e) => setNotifEmail(e.target.value)}
            placeholder="alerts@your-company.com"
          />

          <div style={{ position: 'relative' }}>
            <Input
              label="Slack Webhook URL"
              type="password"
              value={notifSlack}
              onChange={(e) => setNotifSlack(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: -8, marginBottom: 12 }}>
              Optional. Receives real-time notifications for critical alerts.
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, marginTop: 4 }}>
            Notification Triggers
          </div>

          {[
            { label: 'Overdue Incident Notifications', desc: 'Alert when incidents exceed 72-hour Art. 62 deadline', value: notifOverdueIncidents, set: setNotifOverdueIncidents },
            { label: 'Monitoring Alerts', desc: 'Alert when monitoring checks fail or show warnings', value: notifMonitoringAlerts, set: setNotifMonitoringAlerts },
            { label: 'Discovery Results', desc: 'Alert when new AI systems are discovered in scans', value: notifDiscoveryResults, set: setNotifDiscoveryResults },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#F8FAFC',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{item.desc}</div>
              </div>
              <button
                onClick={() => item.set(!item.value)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: item.value ? '#6366F1' : '#CBD5E1',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  position: 'absolute',
                  top: 3,
                  left: item.value ? 23 : 3,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button size="sm">Save Preferences</Button>
          </div>
        </Card>

        {/* Team */}
        <Card padding={false}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Team Members</h2>
            <Button size="sm">+ Invite Member</Button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Last Active', ''].map((h) => (
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
              {teamMembers.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: '#EEF2FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#6366F1',
                        }}
                      >
                        {m.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{m.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={roleVariant[m.role]}>{m.role}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8' }}>{m.lastActive}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
