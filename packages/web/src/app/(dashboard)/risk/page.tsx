'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/* ─── Data Types ─── */
interface WizardStep {
  id: string;
  number: number;
  title: string;
  description: string;
}

const STEPS: WizardStep[] = [
  { id: 'system', number: 1, title: 'Select AI System', description: 'Choose the system to assess' },
  { id: 'prohibited', number: 2, title: 'Prohibited Practices', description: 'Article 5 prohibited practices check' },
  { id: 'high-risk', number: 3, title: 'High-Risk Classification', description: 'Annex III category assessment' },
  { id: 'gpai', number: 4, title: 'GPAI Check', description: 'General-purpose AI model assessment' },
  { id: 'data', number: 5, title: 'Data Governance', description: 'Data quality and bias scoring' },
  { id: 'oversight', number: 6, title: 'Human Oversight', description: 'Human-in-the-loop assessment' },
  { id: 'review', number: 7, title: 'Review & Submit', description: 'Final summary and submission' },
];

const mockSystems = [
  { id: 'sys_001', name: 'Credit Scoring Model', provider: 'Internal', risk: 'high' },
  { id: 'sys_002', name: 'Customer Support Chatbot', provider: 'OpenAI GPT-4o', risk: 'limited' },
  { id: 'sys_003', name: 'Resume Screening AI', provider: 'Internal', risk: 'high' },
  { id: 'sys_004', name: 'Fraud Detection System', provider: 'Internal', risk: 'high' },
  { id: 'sys_005', name: 'Document Summarizer', provider: 'Anthropic Claude', risk: 'gpai' },
  { id: 'sys_006', name: 'Content Moderation AI', provider: 'Internal', risk: 'limited' },
  { id: 'sys_007', name: 'Emotion Recognition (CCTV)', provider: 'Internal', risk: 'high' },
];

/* ─── Article 5 Prohibited Practices ─── */
const prohibitedQuestions = [
  {
    id: 'p1',
    text: 'Does the system use subliminal techniques to distort behavior causing harm?',
    article: 'Art. 5(1)(a)',
    help: 'AI systems that deploy subliminal techniques beyond a person\'s consciousness to materially distort their behavior in a manner that causes or is likely to cause physical or psychological harm.',
  },
  {
    id: 'p2',
    text: 'Does the system exploit vulnerabilities of specific groups (age, disability, social situation)?',
    article: 'Art. 5(1)(b)',
    help: 'AI systems that exploit any vulnerabilities of a specific group of persons due to their age, physical or mental disability, to materially distort their behavior causing harm.',
  },
  {
    id: 'p3',
    text: 'Does the system perform social scoring by public authorities?',
    article: 'Art. 5(1)(c)',
    help: 'AI systems used by public authorities or on their behalf for the evaluation or classification of the trustworthiness of natural persons based on their social behavior or personal characteristics.',
  },
  {
    id: 'p4',
    text: 'Does the system use real-time remote biometric identification in publicly accessible spaces for law enforcement?',
    article: 'Art. 5(1)(d)',
    help: 'The use of real-time remote biometric identification systems in publicly accessible spaces for the purpose of law enforcement, except in strictly defined limited cases.',
  },
  {
    id: 'p5',
    text: 'Does the system perform untargeted scraping of facial images to build recognition databases?',
    article: 'Art. 5(1)(e)',
    help: 'AI systems that create or expand facial recognition databases through the untargeted scraping of facial images from the internet or CCTV footage.',
  },
  {
    id: 'p6',
    text: 'Does the system infer emotions in workplace or educational settings (without medical/safety reasons)?',
    article: 'Art. 5(1)(f)',
    help: 'AI systems to infer emotions of a natural person in the areas of workplace and education institutions, except where for medical or safety reasons.',
  },
  {
    id: 'p7',
    text: 'Does the system use biometric categorization to deduce race, political opinions, religion, or sexual orientation?',
    article: 'Art. 5(1)(g)',
    help: 'AI systems that categorize individual natural persons based on their biometric data to deduce or infer their race, political opinions, trade union membership, religious beliefs, sex life or sexual orientation.',
  },
  {
    id: 'p8',
    text: 'Does the system assess the risk of natural persons committing criminal offenses solely based on profiling or personality traits?',
    article: 'Art. 5(1)(h)',
    help: 'AI systems used to make risk assessments of natural persons to assess or predict the risk of committing a criminal offence, solely based on profiling or personality traits.',
  },
];

/* ─── Annex III Categories ─── */
const annexIIICategories = [
  { id: '1', title: '1. Biometric Identification & Categorisation', desc: 'Remote biometric identification systems, biometric categorisation based on sensitive attributes.' },
  { id: '2', title: '2. Critical Infrastructure', desc: 'AI used as safety components in management/operation of critical digital infrastructure, road traffic, water/gas/heating/electricity supply.' },
  { id: '3', title: '3. Education & Vocational Training', desc: 'AI determining access to education, evaluating learning outcomes, monitoring prohibited behavior during tests.' },
  { id: '4', title: '4. Employment & Workers Management', desc: 'AI for recruitment, screening, HR decisions, task allocation, monitoring and evaluating workers.' },
  { id: '5a', title: '5a. Essential Public Services', desc: 'AI evaluating eligibility for public assistance benefits and services, creditworthiness assessment.' },
  { id: '5b', title: '5b. Essential Private Services', desc: 'AI used to evaluate creditworthiness or establish credit scores of natural persons (except fraud detection).' },
  { id: '6', title: '6. Law Enforcement', desc: 'AI used as polygraphs, to assess reliability of evidence, predict occurrence of criminal offences, profiling.' },
  { id: '7', title: '7. Migration, Asylum & Border Control', desc: 'AI for risk assessment, document authenticity verification, examination of applications.' },
  { id: '8', title: '8. Administration of Justice', desc: 'AI assisting judicial authorities in researching, interpreting facts and law, and applying the law.' },
];

/* ─── Data Governance Questions ─── */
const dataGovQuestions = [
  { id: 'dg1', text: 'Training data quality assessment performed', help: 'Have you assessed the overall quality, completeness, and accuracy of training datasets?' },
  { id: 'dg2', text: 'Bias testing and mitigation conducted', help: 'Have you tested for and mitigated biases in training, validation, and testing data?' },
  { id: 'dg3', text: 'Data representativeness verified', help: 'Is the data representative of the target population and deployment context?' },
  { id: 'dg4', text: 'Data gaps identified and documented', help: 'Have you identified and documented gaps or limitations in data coverage?' },
  { id: 'dg5', text: 'Data lineage and provenance tracked', help: 'Can you trace the origin, transformations, and quality checks applied to data?' },
];

/* ─── Human Oversight Questions ─── */
const oversightQuestions = [
  { id: 'ho1', text: 'Human-in-the-loop design implemented', help: 'Can a human operator intervene in real-time to override or stop the AI system decisions?' },
  { id: 'ho2', text: 'Human-on-the-loop monitoring established', help: 'Is there a human who monitors the AI system during operation and can intervene when needed?' },
  { id: 'ho3', text: 'Intervention mechanisms documented', help: 'Are the mechanisms for human intervention clearly documented and accessible to operators?' },
  { id: 'ho4', text: 'Operators trained on oversight procedures', help: 'Have human operators been trained on how to effectively oversee and intervene with the AI system?' },
  { id: 'ho5', text: 'Audit trail for human decisions maintained', help: 'Is there an audit trail recording human override decisions and their rationale?' },
];

/* ─── Risk Score Colors ─── */
function getRiskColor(score: number): string {
  if (score >= 80) return '#EF4444';
  if (score >= 60) return '#F97316';
  if (score >= 40) return '#EAB308';
  if (score >= 20) return '#3B82F6';
  return '#22C55E';
}

function getRiskLabel(score: number): string {
  if (score >= 80) return 'Prohibited / Unacceptable';
  if (score >= 60) return 'High Risk';
  if (score >= 40) return 'Limited Risk';
  if (score >= 20) return 'Minimal Risk';
  return 'Very Low Risk';
}

function getRiskBadgeVariant(score: number): 'danger' | 'high' | 'warning' | 'info' | 'success' {
  if (score >= 80) return 'danger';
  if (score >= 60) return 'high';
  if (score >= 40) return 'warning';
  if (score >= 20) return 'info';
  return 'success';
}

/* ─── Component ─── */
export default function RiskAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardStarted, setWizardStarted] = useState(false);

  // Step 1: System
  const [selectedSystem, setSelectedSystem] = useState('');

  // Step 2: Prohibited practices
  const [prohibitedAnswers, setProhibitedAnswers] = useState<Record<string, 'yes' | 'no' | ''>>(
    Object.fromEntries(prohibitedQuestions.map((q) => [q.id, '']))
  );

  // Step 3: High-risk
  const [selectedCategory, setSelectedCategory] = useState('');

  // Step 4: GPAI
  const [isGpai, setIsGpai] = useState<'yes' | 'no' | ''>('');
  const [gpaiSystemicRisk, setGpaiSystemicRisk] = useState<'yes' | 'no' | ''>('');

  // Step 5: Data governance
  const [dataGovScores, setDataGovScores] = useState<Record<string, number>>(
    Object.fromEntries(dataGovQuestions.map((q) => [q.id, 0]))
  );

  // Step 6: Human oversight
  const [oversightScores, setOversightScores] = useState<Record<string, number>>(
    Object.fromEntries(oversightQuestions.map((q) => [q.id, 0]))
  );

  const [submitted, setSubmitted] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);

  /* ─── Risk Score Calculation ─── */
  const riskScore = useMemo(() => {
    let score = 0;

    // Prohibited practices
    const prohibitedYes = Object.values(prohibitedAnswers).filter((v) => v === 'yes').length;
    if (prohibitedYes > 0) score += 40 + prohibitedYes * 5;

    // High-risk category
    if (selectedCategory) score += 25;

    // GPAI
    if (isGpai === 'yes') score += 5;
    if (gpaiSystemicRisk === 'yes') score += 10;

    // Data governance (inverse - lower scores = higher risk)
    const dgTotal = Object.values(dataGovScores).reduce((a, b) => a + b, 0);
    const dgMax = dataGovQuestions.length * 3;
    if (dgMax > 0) score += Math.round((1 - dgTotal / dgMax) * 10);

    // Oversight (inverse)
    const hoTotal = Object.values(oversightScores).reduce((a, b) => a + b, 0);
    const hoMax = oversightQuestions.length * 3;
    if (hoMax > 0) score += Math.round((1 - hoTotal / hoMax) * 10);

    return Math.min(100, Math.max(0, score));
  }, [prohibitedAnswers, selectedCategory, isGpai, gpaiSystemicRisk, dataGovScores, oversightScores]);

  const canAdvance = () => {
    switch (currentStep) {
      case 0: return !!selectedSystem;
      case 1: return Object.values(prohibitedAnswers).every((v) => v !== '');
      case 2: return true; // optional
      case 3: return isGpai !== '';
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  const systemName = mockSystems.find((s) => s.id === selectedSystem)?.name || '';

  /* ─── Risk Score Widget ─── */
  const RiskScoreWidget = () => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', background: '#F8FAFC', borderRadius: 10,
      border: '1px solid #E2E8F0',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: `conic-gradient(${getRiskColor(riskScore)} 0% ${riskScore}%, #E2E8F0 ${riskScore}% 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#F8FAFC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: getRiskColor(riskScore),
        }}>
          {riskScore}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#64748B' }}>Risk Score</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: getRiskColor(riskScore) }}>
          {getRiskLabel(riskScore)}
        </div>
      </div>
    </div>
  );

  /* ─── Dashboard (before wizard) ─── */
  if (!wizardStarted) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Risk Assessment
            </h1>
            <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
              Classify AI systems per EU AI Act risk categories with a guided wizard
            </p>
          </div>
          <Button onClick={() => setWizardStarted(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            New Assessment
          </Button>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Assessments', value: '18', color: '#6366F1' },
            { label: 'High-Risk', value: '4', color: '#F97316' },
            { label: 'Pending Review', value: '3', color: '#EAB308' },
            { label: 'Compliant', value: '11', color: '#22C55E' },
          ].map((s, i) => (
            <Card key={i}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginBottom: 8 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>{s.value}</span>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
              </div>
            </Card>
          ))}
        </div>

        {/* Recent assessments */}
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: '0 0 20px' }}>
            Recent Assessments
          </h2>
          {[
            { system: 'Resume Screening AI', score: 65, status: 'approved', date: '2026-03-15' },
            { system: 'Customer Support Chatbot', score: 32, status: 'submitted', date: '2026-03-12' },
            { system: 'Fraud Detection System', score: 58, status: 'approved', date: '2026-03-10' },
            { system: 'Document Summarizer', score: 22, status: 'approved', date: '2026-03-08' },
            { system: 'Recommendation Engine', score: 15, status: 'approved', date: '2026-02-28' },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${getRiskColor(a.score)}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: getRiskColor(a.score),
                }}>
                  {a.score}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{a.system}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{getRiskLabel(a.score)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{a.date}</span>
                <Badge variant={a.status === 'approved' ? 'success' : 'warning'}>{a.status}</Badge>
              </div>
            </div>
          ))}
        </Card>

        {/* Empty state CTA */}
        <div style={{
          marginTop: 24, padding: '40px', background: 'linear-gradient(135deg, #EEF2FF, #F0F9FF)',
          borderRadius: 12, border: '1px solid #C7D2FE', textAlign: 'center',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
            Start a new risk assessment
          </div>
          <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
            Walk through a guided 7-step wizard covering prohibited practices, high-risk classification, GPAI checks, data governance, and human oversight.
          </div>
          <Button onClick={() => setWizardStarted(true)}>Begin Assessment</Button>
        </div>
      </div>
    );
  }

  /* ─── Wizard View ─── */
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => { setWizardStarted(false); setSubmitted(false); setCurrentStep(0); }}
            style={{
              background: 'none', border: '1px solid #E2E8F0', borderRadius: 8,
              padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748B',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Risk Assessment Wizard
            </h1>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
              {systemName ? `Assessing: ${systemName}` : 'Step-by-step EU AI Act risk classification'}
            </div>
          </div>
        </div>
        <RiskScoreWidget />
      </div>

      {/* Stepper */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32,
        padding: '16px 24px', background: '#FFFFFF', borderRadius: 12,
        border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'auto',
      }}>
        {STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div
                onClick={() => { if (i <= currentStep) setCurrentStep(i); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: i <= currentStep ? 'pointer' : 'default',
                  opacity: !isActive && !isCompleted ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                  minWidth: 0,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600,
                  background: isCompleted ? '#22C55E' : isActive ? '#6366F1' : '#E2E8F0',
                  color: isCompleted || isActive ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.3s',
                }}>
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                  ) : step.number}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#0F172A' : '#64748B',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {step.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 8px', minWidth: 16,
                  background: isCompleted ? '#22C55E' : '#E2E8F0',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card style={{ minHeight: 400 }}>
        {/* ─── Step 1: Select System ─── */}
        {currentStep === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Select AI System</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
              Choose the AI system you want to assess. The system must be registered in your inventory.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mockSystems.map((sys) => (
                <label
                  key={sys.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 10,
                    border: `2px solid ${selectedSystem === sys.id ? '#6366F1' : '#E2E8F0'}`,
                    background: selectedSystem === sys.id ? '#EEF2FF' : '#FFFFFF',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="system"
                    checked={selectedSystem === sys.id}
                    onChange={() => setSelectedSystem(sys.id)}
                    style={{ accentColor: '#6366F1', width: 16, height: 16 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{sys.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Provider: {sys.provider}</div>
                  </div>
                  <Badge variant={sys.risk === 'high' ? 'high' : sys.risk === 'gpai' ? 'gpai' : sys.risk === 'limited' ? 'limited' : 'minimal'}>
                    {sys.risk}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 2: Prohibited Practices ─── */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Prohibited Practices Check</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 4px' }}>
              Article 5 of the EU AI Act prohibits certain AI practices. If any apply, the system cannot be deployed in the EU.
            </p>
            <div style={{
              padding: '10px 14px', background: '#FEF2F2', borderRadius: 8,
              border: '1px solid #FECACA', marginBottom: 24,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>
                Important: Any &quot;Yes&quot; answer flags the system as potentially prohibited under EU AI Act.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {prohibitedQuestions.map((q) => (
                <div key={q.id} style={{
                  padding: '16px 18px', borderRadius: 10,
                  border: '1px solid #E2E8F0', background: '#FFFFFF',
                  transition: 'border-color 0.15s',
                  borderColor: prohibitedAnswers[q.id] === 'yes' ? '#FECACA' : prohibitedAnswers[q.id] === 'no' ? '#BBF7D0' : '#E2E8F0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          background: '#EEF2FF', color: '#6366F1', fontFamily: 'monospace',
                        }}>
                          {q.article}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#0F172A' }}>{q.text}</span>
                      </div>
                      {expandedHelp === q.id && (
                        <div style={{
                          fontSize: 12, color: '#64748B', lineHeight: 1.6,
                          padding: '10px 12px', background: '#F8FAFC', borderRadius: 6, marginTop: 8,
                        }}>
                          {q.help}
                        </div>
                      )}
                      <button
                        onClick={() => setExpandedHelp(expandedHelp === q.id ? null : q.id)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 11, color: '#6366F1', padding: 0, marginTop: 4,
                        }}
                      >
                        {expandedHelp === q.id ? 'Hide details' : 'Show details'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {(['yes', 'no'] as const).map((val) => (
                        <button
                          key={val}
                          onClick={() => setProhibitedAnswers((prev) => ({ ...prev, [q.id]: val }))}
                          style={{
                            padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s',
                            border: `1px solid ${prohibitedAnswers[q.id] === val
                              ? val === 'yes' ? '#EF4444' : '#22C55E'
                              : '#E2E8F0'}`,
                            background: prohibitedAnswers[q.id] === val
                              ? val === 'yes' ? '#FEF2F2' : '#F0FDF4'
                              : '#FFFFFF',
                            color: prohibitedAnswers[q.id] === val
                              ? val === 'yes' ? '#EF4444' : '#22C55E'
                              : '#64748B',
                          }}
                        >
                          {val === 'yes' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 3: High-Risk Classification ─── */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>High-Risk Classification</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
              Does your AI system fall under any Annex III high-risk category? Select the most applicable category, or skip if none apply.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {annexIIICategories.map((cat) => (
                <label
                  key={cat.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 18px', borderRadius: 10,
                    border: `2px solid ${selectedCategory === cat.id ? '#6366F1' : '#E2E8F0'}`,
                    background: selectedCategory === cat.id ? '#EEF2FF' : '#FFFFFF',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.id}
                    onChange={() => setSelectedCategory(cat.id)}
                    style={{ accentColor: '#6366F1', width: 16, height: 16, marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{cat.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>{cat.desc}</div>
                  </div>
                </label>
              ))}
              <button
                onClick={() => setSelectedCategory('')}
                style={{
                  padding: '12px 18px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${selectedCategory === '' ? '#6366F1' : '#E2E8F0'}`,
                  background: selectedCategory === '' ? '#EEF2FF' : '#FFFFFF',
                  textAlign: 'left', fontSize: 14, fontWeight: 500, color: '#64748B',
                }}
              >
                None of the above — system is not high-risk under Annex III
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 4: GPAI Check ─── */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>General-Purpose AI Check</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
              Determine if the AI system uses or is a general-purpose AI model (GPAI) as defined in Article 51+.
            </p>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                Is this system built on or is itself a general-purpose AI model?
              </div>
              <div style={{
                padding: '12px 16px', background: '#F8FAFC', borderRadius: 8,
                border: '1px solid #E2E8F0', marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
                  A GPAI model is an AI model that is trained with a large amount of data using self-supervision at scale, displays significant generality, is capable of competently performing a wide range of distinct tasks, and can be integrated into a variety of downstream systems or applications. Examples: GPT-4, Claude, Gemini, Llama, Mistral.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['yes', 'no'] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => setIsGpai(val)}
                    style={{
                      padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: `2px solid ${isGpai === val ? '#6366F1' : '#E2E8F0'}`,
                      background: isGpai === val ? '#EEF2FF' : '#FFFFFF',
                      color: isGpai === val ? '#6366F1' : '#64748B',
                    }}
                  >
                    {val === 'yes' ? 'Yes, it uses/is GPAI' : 'No, not GPAI'}
                  </button>
                ))}
              </div>
            </div>

            {isGpai === 'yes' && (
              <div style={{
                padding: '20px', background: '#FFFBEB', borderRadius: 10,
                border: '1px solid #FEF3C7',
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
                  Systemic Risk Assessment
                </div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>
                  A GPAI model is classified as having systemic risk if it has high-impact capabilities, including when the cumulative amount of compute used for its training exceeds 10^25 FLOPs, or by Commission decision based on criteria in Annex XIII.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['yes', 'no'] as const).map((val) => (
                    <button
                      key={val}
                      onClick={() => setGpaiSystemicRisk(val)}
                      style={{
                        padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                        border: `2px solid ${gpaiSystemicRisk === val
                          ? val === 'yes' ? '#EF4444' : '#22C55E'
                          : '#E2E8F0'}`,
                        background: gpaiSystemicRisk === val
                          ? val === 'yes' ? '#FEF2F2' : '#F0FDF4'
                          : '#FFFFFF',
                        color: gpaiSystemicRisk === val
                          ? val === 'yes' ? '#EF4444' : '#22C55E'
                          : '#64748B',
                      }}
                    >
                      {val === 'yes' ? 'Yes, systemic risk' : 'No systemic risk'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 5: Data Governance ─── */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Data Governance Scoring</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
              Rate each data governance criterion on a scale of 0-3 based on your system&apos;s data practices (Art. 10).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {dataGovQuestions.map((q) => (
                <div key={q.id} style={{
                  padding: '16px 20px', borderRadius: 10,
                  border: '1px solid #E2E8F0', background: '#FFFFFF',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>
                    {q.text}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>
                    {q.help}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { val: 0, label: 'Not Done', color: '#EF4444' },
                      { val: 1, label: 'Partial', color: '#F97316' },
                      { val: 2, label: 'Mostly', color: '#EAB308' },
                      { val: 3, label: 'Complete', color: '#22C55E' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setDataGovScores((prev) => ({ ...prev, [q.id]: opt.val }))}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                          border: `2px solid ${dataGovScores[q.id] === opt.val ? opt.color : '#E2E8F0'}`,
                          background: dataGovScores[q.id] === opt.val ? `${opt.color}10` : '#FFFFFF',
                          color: dataGovScores[q.id] === opt.val ? opt.color : '#94A3B8',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Data governance progress */}
            <div style={{ marginTop: 20, padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>Data Governance Score</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                  {Object.values(dataGovScores).reduce((a, b) => a + b, 0)}/{dataGovQuestions.length * 3}
                </span>
              </div>
              <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, transition: 'width 0.4s ease',
                  width: `${(Object.values(dataGovScores).reduce((a, b) => a + b, 0) / (dataGovQuestions.length * 3)) * 100}%`,
                  background: `linear-gradient(90deg, #F97316, #22C55E)`,
                }} />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 6: Human Oversight ─── */}
        {currentStep === 5 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Human Oversight Assessment</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
              Evaluate the human oversight mechanisms in place for this AI system (Art. 14).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {oversightQuestions.map((q) => (
                <div key={q.id} style={{
                  padding: '16px 20px', borderRadius: 10,
                  border: '1px solid #E2E8F0', background: '#FFFFFF',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#0F172A', marginBottom: 4 }}>
                    {q.text}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>
                    {q.help}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { val: 0, label: 'Not Done', color: '#EF4444' },
                      { val: 1, label: 'Partial', color: '#F97316' },
                      { val: 2, label: 'Mostly', color: '#EAB308' },
                      { val: 3, label: 'Complete', color: '#22C55E' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => setOversightScores((prev) => ({ ...prev, [q.id]: opt.val }))}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                          border: `2px solid ${oversightScores[q.id] === opt.val ? opt.color : '#E2E8F0'}`,
                          background: oversightScores[q.id] === opt.val ? `${opt.color}10` : '#FFFFFF',
                          color: oversightScores[q.id] === opt.val ? opt.color : '#94A3B8',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Oversight progress */}
            <div style={{ marginTop: 20, padding: '14px 16px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>Human Oversight Score</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                  {Object.values(oversightScores).reduce((a, b) => a + b, 0)}/{oversightQuestions.length * 3}
                </span>
              </div>
              <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, transition: 'width 0.4s ease',
                  width: `${(Object.values(oversightScores).reduce((a, b) => a + b, 0) / (oversightQuestions.length * 3)) * 100}%`,
                  background: `linear-gradient(90deg, #F97316, #22C55E)`,
                }} />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 7: Review & Submit ─── */}
        {currentStep === 6 && !submitted && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Review & Submit</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 24px' }}>
              Review your assessment before submitting. You can go back to any step to make changes.
            </p>

            {/* Risk Level Summary */}
            <div style={{
              padding: '24px', borderRadius: 12,
              background: `${getRiskColor(riskScore)}08`,
              border: `2px solid ${getRiskColor(riskScore)}30`,
              marginBottom: 24, textAlign: 'center',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                background: `conic-gradient(${getRiskColor(riskScore)} 0% ${riskScore}%, #E2E8F0 ${riskScore}% 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%', background: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 800, color: getRiskColor(riskScore),
                }}>
                  {riskScore}
                </div>
              </div>
              <Badge variant={getRiskBadgeVariant(riskScore)} style={{ fontSize: 13, padding: '4px 14px' }}>
                {getRiskLabel(riskScore)}
              </Badge>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 12, maxWidth: 500, margin: '12px auto 0', lineHeight: 1.6 }}>
                {riskScore >= 80
                  ? 'This system triggers prohibited practice flags. Deployment in the EU may not be permissible. Consult legal counsel immediately.'
                  : riskScore >= 60
                  ? 'This system is classified as high-risk and requires full conformity assessment, technical documentation, and ongoing monitoring.'
                  : riskScore >= 40
                  ? 'This system has limited risk obligations, primarily around transparency and user notification.'
                  : 'This system has minimal compliance obligations but should maintain documentation as best practice.'}
              </div>
            </div>

            {/* Summary grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>System</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{systemName}</div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prohibited Flags</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: Object.values(prohibitedAnswers).some((v) => v === 'yes') ? '#EF4444' : '#22C55E' }}>
                  {Object.values(prohibitedAnswers).filter((v) => v === 'yes').length} of {prohibitedQuestions.length}
                </div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Annex III Category</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                  {selectedCategory ? annexIIICategories.find((c) => c.id === selectedCategory)?.title.split('.')[0] : 'None selected'}
                </div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>GPAI Status</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                  {isGpai === 'yes' ? (gpaiSystemicRisk === 'yes' ? 'GPAI with Systemic Risk' : 'GPAI Model') : 'Not GPAI'}
                </div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Data Governance</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                    {Object.values(dataGovScores).reduce((a, b) => a + b, 0)}/{dataGovQuestions.length * 3}
                  </div>
                  <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${(Object.values(dataGovScores).reduce((a, b) => a + b, 0) / (dataGovQuestions.length * 3)) * 100}%`,
                      background: '#6366F1',
                    }} />
                  </div>
                </div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Human Oversight</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>
                    {Object.values(oversightScores).reduce((a, b) => a + b, 0)}/{oversightQuestions.length * 3}
                  </div>
                  <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${(Object.values(oversightScores).reduce((a, b) => a + b, 0) / (oversightQuestions.length * 3)) * 100}%`,
                      background: '#6366F1',
                    }} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Required actions */}
            <Card style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Required Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {riskScore >= 80 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#EF4444' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                    Cease deployment — system triggers prohibited practice provisions
                  </div>
                )}
                {riskScore >= 60 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#F97316' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                      Complete Annex IV technical documentation
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#F97316' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                      Undergo conformity assessment procedure
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#F97316' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                      Establish post-market monitoring system
                    </div>
                  </>
                )}
                {riskScore >= 40 && riskScore < 60 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#EAB308' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                    Ensure transparency obligations are met (Art. 50)
                  </div>
                )}
                {riskScore < 40 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#22C55E' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                    No mandatory requirements. Voluntary codes of conduct recommended.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ─── Submitted State ─── */}
        {currentStep === 6 && submitted && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#F0FDF4', border: '2px solid #22C55E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Assessment Submitted</div>
            <div style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>
              Risk assessment for <strong>{systemName}</strong> has been submitted for review.
            </div>
            <Badge variant={getRiskBadgeVariant(riskScore)} style={{ fontSize: 13, padding: '4px 14px' }}>
              Risk Score: {riskScore} — {getRiskLabel(riskScore)}
            </Badge>
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button variant="secondary" onClick={() => { setWizardStarted(false); setSubmitted(false); setCurrentStep(0); }}>
                Back to Dashboard
              </Button>
              <Button onClick={() => { setSubmitted(false); setCurrentStep(0); setSelectedSystem(''); setProhibitedAnswers(Object.fromEntries(prohibitedQuestions.map((q) => [q.id, '']))); setSelectedCategory(''); setIsGpai(''); setGpaiSystemicRisk(''); setDataGovScores(Object.fromEntries(dataGovQuestions.map((q) => [q.id, 0]))); setOversightScores(Object.fromEntries(oversightQuestions.map((q) => [q.id, 0]))); }}>
                New Assessment
              </Button>
            </div>
          </div>
        )}

        {/* ─── Navigation ─── */}
        {!(currentStep === 6 && submitted) && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 32, paddingTop: 20, borderTop: '1px solid #F1F5F9',
          }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Previous
            </Button>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>
              Step {currentStep + 1} of {STEPS.length}
            </span>
            {currentStep < 6 ? (
              <Button
                onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={!canAdvance()}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Button>
            ) : (
              <Button onClick={() => setSubmitted(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                Submit Assessment
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
