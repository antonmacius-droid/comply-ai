import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  pgEnum,
  index,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer']);

export const riskLevelEnum = pgEnum('risk_level', [
  'unacceptable',
  'high',
  'limited',
  'minimal',
  'gpai',
]);

export const systemStatusEnum = pgEnum('system_status', [
  'draft',
  'active',
  'archived',
]);

export const assessmentStatusEnum = pgEnum('assessment_status', [
  'draft',
  'submitted',
  'approved',
]);

export const docTypeEnum = pgEnum('doc_type', [
  'annex_iv',
  'risk_report',
  'model_card',
]);

export const docStatusEnum = pgEnum('doc_status', [
  'draft',
  'review',
  'approved',
]);

export const conformityStatusEnum = pgEnum('conformity_status', [
  'not_started',
  'in_progress',
  'submitted',
  'certified',
]);

export const checklistStatusEnum = pgEnum('checklist_status', [
  'pending',
  'compliant',
  'non_compliant',
  'na',
]);

export const incidentSeverityEnum = pgEnum('incident_severity', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const incidentStatusEnum = pgEnum('incident_status', [
  'open',
  'investigating',
  'resolved',
  'closed',
]);

export const monitoringCheckTypeEnum = pgEnum('monitoring_check_type', [
  'drift',
  'performance',
  'bias',
  'accuracy_drift',
  'bias_detection',
  'performance_degradation',
  'data_quality',
  'security_scan',
  'uptime',
  'error_rate',
  'latency',
]);

export const monitoringStatusEnum = pgEnum('monitoring_status', [
  'pass',
  'warning',
  'fail',
]);

// ── Tables ─────────────────────────────────────────────────────────────────

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 128 }).notNull().unique(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 320 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('viewer'),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('users_org_id_idx').on(table.orgId),
    index('users_email_idx').on(table.email),
  ]
);

export const aiSystems = pgTable(
  'ai_systems',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    purpose: text('purpose'),
    riskLevel: riskLevelEnum('risk_level').notNull().default('minimal'),
    status: systemStatusEnum('status').notNull().default('draft'),
    providerType: varchar('provider_type', { length: 128 }),
    modelName: varchar('model_name', { length: 255 }),
    deploymentType: varchar('deployment_type', { length: 64 }),
    metadata: jsonb('metadata').default({}),
    bulwarkGatewayId: varchar('bulwark_gateway_id', { length: 128 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('ai_systems_org_id_idx').on(table.orgId),
    index('ai_systems_risk_level_idx').on(table.riskLevel),
    index('ai_systems_status_idx').on(table.status),
  ]
);

export const riskAssessments = pgTable(
  'risk_assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    systemId: uuid('system_id')
      .notNull()
      .references(() => aiSystems.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    assessorId: uuid('assessor_id').references(() => users.id),
    riskLevel: riskLevelEnum('risk_level').notNull(),
    annexIiiCategory: varchar('annex_iii_category', { length: 128 }),
    scores: jsonb('scores').default({}),
    rationale: text('rationale'),
    status: assessmentStatusEnum('status').notNull().default('draft'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('risk_assessments_system_id_idx').on(table.systemId),
    index('risk_assessments_status_idx').on(table.status),
  ]
);

export const complianceDocuments = pgTable(
  'compliance_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    systemId: uuid('system_id')
      .notNull()
      .references(() => aiSystems.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    docType: docTypeEnum('doc_type').notNull(),
    title: varchar('title', { length: 512 }).notNull(),
    content: jsonb('content').default({}),
    status: docStatusEnum('status').notNull().default('draft'),
    pdfPath: text('pdf_path'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('compliance_documents_system_id_idx').on(table.systemId),
    index('compliance_documents_org_id_idx').on(table.orgId),
  ]
);

export const evidence = pgTable(
  'evidence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    systemId: uuid('system_id')
      .notNull()
      .references(() => aiSystems.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 512 }).notNull(),
    description: text('description'),
    filePath: text('file_path'),
    fileType: varchar('file_type', { length: 64 }),
    fileHash: varchar('file_hash', { length: 128 }),
    uploadedBy: uuid('uploaded_by').references(() => users.id),
    tags: jsonb('tags').default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('evidence_system_id_idx').on(table.systemId),
    index('evidence_org_id_idx').on(table.orgId),
  ]
);

export const conformityAssessments = pgTable(
  'conformity_assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    systemId: uuid('system_id')
      .notNull()
      .references(() => aiSystems.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    status: conformityStatusEnum('status').notNull().default('not_started'),
    checklistProgress: jsonb('checklist_progress').default({}),
    notifiedBody: varchar('notified_body', { length: 255 }),
    certificateId: varchar('certificate_id', { length: 128 }),
    validUntil: timestamp('valid_until'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('conformity_assessments_system_id_idx').on(table.systemId),
    index('conformity_assessments_org_id_idx').on(table.orgId),
  ]
);

export const checklistItems = pgTable(
  'checklist_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => conformityAssessments.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    requirementRef: varchar('requirement_ref', { length: 64 }).notNull(),
    description: text('description').notNull(),
    status: checklistStatusEnum('status').notNull().default('pending'),
    evidenceIds: jsonb('evidence_ids').default([]),
    notes: text('notes'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('checklist_items_assessment_id_idx').on(table.assessmentId),
  ]
);

export const incidents = pgTable(
  'incidents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    systemId: uuid('system_id')
      .notNull()
      .references(() => aiSystems.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    severity: incidentSeverityEnum('severity').notNull(),
    title: varchar('title', { length: 512 }).notNull(),
    description: text('description'),
    status: incidentStatusEnum('status').notNull().default('open'),
    detectedAt: timestamp('detected_at').defaultNow().notNull(),
    reportedAt: timestamp('reported_at'),
    resolvedAt: timestamp('resolved_at'),
    reporterId: uuid('reporter_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('incidents_system_id_idx').on(table.systemId),
    index('incidents_org_id_idx').on(table.orgId),
    index('incidents_status_idx').on(table.status),
    index('incidents_severity_idx').on(table.severity),
  ]
);

export const monitoringChecks = pgTable(
  'monitoring_checks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    systemId: uuid('system_id')
      .notNull()
      .references(() => aiSystems.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    checkType: monitoringCheckTypeEnum('check_type').notNull(),
    result: jsonb('result').default({}),
    status: monitoringStatusEnum('status').notNull(),
    checkedAt: timestamp('checked_at').defaultNow().notNull(),
  },
  (table) => [
    index('monitoring_checks_system_id_idx').on(table.systemId),
    index('monitoring_checks_org_id_idx').on(table.orgId),
    index('monitoring_checks_status_idx').on(table.status),
  ]
);

export const auditTrail = pgTable(
  'audit_trail',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id),
    entityType: varchar('entity_type', { length: 64 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    action: varchar('action', { length: 64 }).notNull(),
    changes: jsonb('changes').default({}),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (table) => [
    index('audit_trail_org_id_idx').on(table.orgId),
    index('audit_trail_entity_idx').on(table.entityType, table.entityId),
    index('audit_trail_timestamp_idx').on(table.timestamp),
  ]
);

export const bulwarkConnections = pgTable(
  'bulwark_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' })
      .unique(),
    bulwarkUrl: text('bulwark_url').notNull(),
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    syncInterval: integer('sync_interval').default(300),
    lastSyncedAt: timestamp('last_synced_at'),
  },
  (table) => [
    index('bulwark_connections_org_id_idx').on(table.orgId),
  ]
);

// ── Relations ──────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  aiSystems: many(aiSystems),
  incidents: many(incidents),
  auditTrail: many(auditTrail),
  bulwarkConnection: many(bulwarkConnections),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
}));

export const aiSystemsRelations = relations(aiSystems, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [aiSystems.orgId],
    references: [organizations.id],
  }),
  riskAssessments: many(riskAssessments),
  complianceDocuments: many(complianceDocuments),
  evidence: many(evidence),
  conformityAssessments: many(conformityAssessments),
  incidents: many(incidents),
  monitoringChecks: many(monitoringChecks),
}));

export const riskAssessmentsRelations = relations(
  riskAssessments,
  ({ one }) => ({
    system: one(aiSystems, {
      fields: [riskAssessments.systemId],
      references: [aiSystems.id],
    }),
    assessor: one(users, {
      fields: [riskAssessments.assessorId],
      references: [users.id],
    }),
  })
);

export const complianceDocumentsRelations = relations(
  complianceDocuments,
  ({ one }) => ({
    system: one(aiSystems, {
      fields: [complianceDocuments.systemId],
      references: [aiSystems.id],
    }),
  })
);

export const evidenceRelations = relations(evidence, ({ one }) => ({
  system: one(aiSystems, {
    fields: [evidence.systemId],
    references: [aiSystems.id],
  }),
  uploader: one(users, {
    fields: [evidence.uploadedBy],
    references: [users.id],
  }),
}));

export const conformityAssessmentsRelations = relations(
  conformityAssessments,
  ({ one, many }) => ({
    system: one(aiSystems, {
      fields: [conformityAssessments.systemId],
      references: [aiSystems.id],
    }),
    checklistItems: many(checklistItems),
  })
);

export const checklistItemsRelations = relations(
  checklistItems,
  ({ one }) => ({
    assessment: one(conformityAssessments, {
      fields: [checklistItems.assessmentId],
      references: [conformityAssessments.id],
    }),
  })
);

export const incidentsRelations = relations(incidents, ({ one }) => ({
  system: one(aiSystems, {
    fields: [incidents.systemId],
    references: [aiSystems.id],
  }),
  reporter: one(users, {
    fields: [incidents.reporterId],
    references: [users.id],
  }),
}));

export const monitoringChecksRelations = relations(
  monitoringChecks,
  ({ one }) => ({
    system: one(aiSystems, {
      fields: [monitoringChecks.systemId],
      references: [aiSystems.id],
    }),
  })
);
