'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

export default function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          Organization settings, integrations, and user management
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
        {/* Organization details */}
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 20px' }}>
            Organization
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Organization Name" defaultValue="Acme Financial Corp" />
            <Input label="Slug" defaultValue="acme-financial" />
          </div>
          <Input label="Primary Contact Email" defaultValue="compliance@acme-financial.eu" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <Button size="sm">Save Changes</Button>
          </div>
        </Card>

        {/* Bulwark connection */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Bulwark AI Gateway
              </h2>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                Connect to your Bulwark AI governance gateway for policy enforcement and monitoring
              </div>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>

          <Input label="Bulwark URL" defaultValue="https://bulwark.acme-financial.eu" />
          <Input label="API Key" defaultValue="bwk_••••••••••••••••••••" type="password" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Last Synced</div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>2026-04-04 12:34 UTC</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Sync Interval</div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>Every 5 minutes</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button variant="secondary" size="sm">Test Connection</Button>
            <Button size="sm">Save</Button>
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
                {['Name', 'Email', 'Role', 'Last Active', ''].map(h => (
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
                        {m.name.split(' ').map(n => n[0]).join('')}
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
