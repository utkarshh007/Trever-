import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Compass, Layers, Code, ShieldCheck, Rocket } from 'lucide-react';
import InteractiveCard from './InteractiveCard';
import StaggeredHeading from './StaggeredHeading';

interface ProcessStep {
  step: string;
  title: string;
  duration: string;
  summary: string;
  icon: React.ReactNode;
  deliverables: string[];
  tools: string[];
  clientRole: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    step: '01',
    title: 'Discovery & Strategic Planning',
    duration: 'Phase 1',
    summary:
      'We unpack your business objectives, map technical requirements, evaluate existing system constraints, and formulate a clear technical roadmap.',
    icon: <Compass className="w-5 h-5 text-emerald-400" />,
    deliverables: [
      'System Requirements Specification',
      'Technical Architecture Blueprint',
      'Project Scope & Sprint Backlog',
      'Risk & Integration Assessment',
    ],
    tools: ['Miro', 'Figma', 'Notion', 'Architecture Decision Records'],
    clientRole: 'Stakeholder interviews and functional requirement sign-off.',
  },
  {
    step: '02',
    title: 'Architecture & UI/UX Design',
    duration: 'Phase 2',
    summary:
      'Our designers and architects craft interactive prototypes, establish component design systems, and specify database schemas and API contracts.',
    icon: <Layers className="w-5 h-5 text-emerald-400" />,
    deliverables: [
      'Interactive Figma Prototypes',
      'Design System & Component Tokens',
      'Database Schema Models',
      'REST / GraphQL API Specification',
    ],
    tools: ['Figma', 'Storybook', 'DbDiagram', 'OpenAPI'],
    clientRole: 'Prototype review, feedback sessions, and design approval.',
  },
  {
    step: '03',
    title: 'Agile Sprint Engineering',
    duration: 'Phase 3',
    summary:
      'Engineers build your platform in structured agile sprints, deploying working software to a staging environment for continuous review.',
    icon: <Code className="w-5 h-5 text-emerald-400" />,
    deliverables: [
      'Modular TypeScript / Go / Python Code',
      'Automated Unit & Integration Tests',
      'Live Staging Environment Access',
      'Regular Sprint Walkthroughs',
    ],
    tools: ['GitHub', 'Linear / Jira', 'Docker', 'Vite / Next.js'],
    clientRole: 'Sprint review attendance and feature acceptance feedback.',
  },
  {
    step: '04',
    title: 'QA, Security & Load Testing',
    duration: 'Phase 4',
    summary:
      'Validate performance under load, execute application security reviews, run automated browser test suites, and verify accessibility.',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    deliverables: [
      'Automated E2E Test Suite',
      'Load & Performance Benchmark Report',
      'Application Security Review',
      'WCAG AA Accessibility Verification',
    ],
    tools: ['Playwright', 'k6', 'Static & Dynamic Analysis', 'Observability'],
    clientRole: 'User acceptance sign-off and pre-launch review.',
  },
  {
    step: '05',
    title: 'Cloud Launch & Ongoing Support',
    duration: 'Phase 5',
    summary:
      'Execute production deployment to cloud infrastructure, configure health monitoring and alerting, and provide ongoing maintenance and support.',
    icon: <Rocket className="w-5 h-5 text-emerald-400" />,
    deliverables: [
      'Production Cloud Deployment',
      'Automated CI/CD Release Pipeline',
      'Telemetry & Health Monitoring',
      'Ongoing Maintenance & Support',
    ],
    tools: ['AWS / GCP', 'Kubernetes', 'Terraform', 'Monitoring Suites'],
    clientRole: 'Production launch and ongoing roadmap prioritization.',
  },
];

export default function ProcessSection() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const activeStep = PROCESS_STEPS[activeStepIndex];

  return (
    <section
      id="process"
      data-sc-act="flow"
      data-sc-drift="#091015"
      className="relative z-10 pt-14 pb-20 lg:pt-18 lg:pb-24 bg-transparent border-t border-slate-800/60"
    >
      <div className="sc-wrap max-w-7xl mx-auto px-6">
        <div
          data-sc-in
          data-sc-stagger="60"
          className="max-w-3xl mb-14 flex flex-col gap-5 text-left"
        >
          <StaggeredHeading
            as="h2"
            text="A transparent five-phase delivery pipeline."
            className="sc-display sc-display--md font-extrabold text-white"
          />
          <p className="sc-body text-slate-300 text-base sm:text-lg leading-[1.82] max-w-[64ch]">
            Structured milestones, clear deliverables, regular sprint demos, and automated quality gates keep software delivery predictable from kickoff to production.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Step Selector Column */}
          <div
            data-sc-in
            data-sc-stagger="50"
            className="lg:col-span-5 flex flex-col gap-3"
          >
            {PROCESS_STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              return (
                <button
                  key={step.step}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border micro-press flex items-center justify-between group ${
                    isActive
                      ? 'spatial-card border-emerald-400/60 text-white shadow-xl'
                      : 'bg-[#090e12]/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                      {step.step}
                    </span>
                    <div className="flex flex-col gap-1 text-left">
                      <div className={`text-sm sm:text-base font-bold leading-snug ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs font-mono text-slate-400">{step.duration}</div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive ? 'text-emerald-400 translate-x-1' : 'text-slate-600 group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Detailed Step Specification Display Card */}
          <InteractiveCard
            tiltStrength={1.2}
            className="lg:col-span-7 rounded-2xl p-6 sm:p-8 lg:p-9 flex flex-col gap-6 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#070b0e] border border-slate-800">
                  {activeStep.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-emerald-400">{activeStep.duration}</span>
                  <StaggeredHeading
                    as="h3"
                    text={activeStep.title}
                    className="text-xl sm:text-2xl font-bold text-white"
                  />
                </div>
              </div>
              <span className="text-xs font-mono text-slate-300 tabular-nums shrink-0">
                Step {activeStep.step} / 05
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-[1.82] max-w-[64ch]">
              {activeStep.summary}
            </p>

            <div className="flex flex-col gap-3.5">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Phase Deliverables</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeStep.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#070b0e]/85 border border-slate-800 text-sm text-slate-200 leading-[1.7] flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 sm:p-5 rounded-xl bg-[#070b0e]/80 border border-slate-800 flex flex-col gap-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Your Collaboration</div>
                <div className="text-sm text-slate-200 leading-[1.78]">{activeStep.clientRole}</div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-[#070b0e]/80 border border-slate-800 flex flex-col gap-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Representative Tooling</div>
                <div className="text-sm font-mono text-slate-200 leading-[1.78]">
                  {activeStep.tools.join(' · ')}
                </div>
              </div>
            </div>
          </InteractiveCard>
        </div>
      </div>
    </section>
  );
}
