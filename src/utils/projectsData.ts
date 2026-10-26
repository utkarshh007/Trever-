export interface CaseStudy {
  id: string;
  title: string;
  clientIndustry: string;
  category: 'Enterprise' | 'Mobile' | 'AI & Cloud' | 'Web & FinTech';
  summary: string;
  challenge: string;
  solution: string;
  impactMetrics: Array<{ label: string; value: string }>;
  servicesUsed: string[];
  techStack: string[];
  architectureHighlights: string[];
}

export const TREVER_PROJECTS: CaseStudy[] = [
  {
    id: 'enterprise-operations-platform',
    title: 'Multi-Region Operations & Workflow Platform',
    clientIndustry: 'Enterprise Operations Blueprint',
    category: 'Enterprise',
    summary: 'Custom internal operations platform, role-based web portal, and automated event-driven workflow engine designed to replace fragmented legacy tooling.',
    challenge: 'Growing operational teams often rely on disconnected spreadsheets, legacy databases, and manual approval chains that slow down daily execution.',
    solution: 'Trever architectures a modular service-oriented platform using Go, TypeScript, and PostgreSQL, unifying operator portals, audit logging, and third-party API integrations.',
    impactMetrics: [
      { label: 'Architecture Pattern', value: 'Event-Driven Core' },
      { label: 'Access Control', value: 'Granular RBAC' },
      { label: 'Integration Layer', value: 'REST & Webhooks' },
      { label: 'Deployment Model', value: 'Automated CI/CD' },
    ],
    servicesUsed: ['custom-software', 'web-dev', 'software-integration', 'qa-testing'],
    techStack: ['Go', 'TypeScript', 'React', 'PostgreSQL', 'Docker', 'Automated QA'],
    architectureHighlights: [
      'Domain-driven service boundaries with strict schema validation and audit trails',
      'Idempotent webhook and background job queues for reliable third-party sync',
      'Responsive operator dashboard with keyboard-first navigation and role permissions',
    ],
  },
  {
    id: 'connected-mobile-product-suite',
    title: 'Cross-Platform Mobile & Companion Web Suite',
    clientIndustry: 'Mobile & Product Design Blueprint',
    category: 'Mobile',
    summary: 'Cohesive iOS, Android, and web product suite featuring offline-capable local storage, real-time state synchronization, and a shared component design system.',
    challenge: 'Field and consumer applications need responsive touch interfaces that continue working reliably on spotty mobile networks without losing user state.',
    solution: 'Trever combines human-centered UI/UX prototyping with React Native, Swift/Kotlin modules, and an offline-first sync queue backed by a cloud API gateway.',
    impactMetrics: [
      { label: 'Target Platforms', value: 'iOS, Android & Web' },
      { label: 'State Persistence', value: 'Offline-First Sync' },
      { label: 'Design Foundation', value: 'Tokenized UI Kit' },
      { label: 'Quality Gate', value: 'Device & E2E Tests' },
    ],
    servicesUsed: ['mobile-app', 'ui-ux', 'web-dev', 'cybersecurity'],
    techStack: ['React Native', 'Swift', 'Kotlin', 'TypeScript', 'Figma', 'SQLite'],
    architectureHighlights: [
      'Local encrypted SQLite state store with conflict-resilient background cloud sync',
      'Unified Figma-to-code token system ensuring visual parity across mobile and web',
      'Secure token lifecycle management and hardened API transport boundaries',
    ],
  },
  {
    id: 'applied-ai-data-pipeline',
    title: 'Intelligent Document & Analytics Pipeline',
    clientIndustry: 'AI & Data Engineering Blueprint',
    category: 'AI & Cloud',
    summary: 'Data engineering pipeline, retrieval-augmented search service, and interactive business intelligence dashboard for high-volume unstructured and structured data.',
    challenge: 'Organizations accumulate valuable operational documents and event logs but lack clean pipelines to query, classify, and visualize them reliably.',
    solution: 'Trever engineers structured ETL pipelines, vector retrieval indexes with source citations, and real-time analytical dashboards with strict evaluation guardrails.',
    impactMetrics: [
      { label: 'Pipeline Stage', value: 'Automated ETL/ELT' },
      { label: 'AI Capability', value: 'Grounded Retrieval' },
      { label: 'Observability', value: 'Source Citations' },
      { label: 'Reporting Output', value: 'Live BI Views' },
    ],
    servicesUsed: ['ai-ml', 'data-analytics', 'cloud-devops', 'custom-software'],
    techStack: ['Python', 'TypeScript', 'PostgreSQL', 'Vector Search', 'FastAPI', 'SQL'],
    architectureHighlights: [
      'Deterministic ingestion and chunking pipeline with schema validation at every step',
      'Grounded AI retrieval interface that links every generated answer to source records',
      'Executive analytics views powered by indexed warehouse models',
    ],
  },
  {
    id: 'cloud-modernization-foundation',
    title: 'Legacy Monolith Modernization & Cloud Migration',
    clientIndustry: 'Modernization & DevOps Blueprint',
    category: 'Web & FinTech',
    summary: 'Incremental modernization of aging application codebases into containerized cloud services with automated deployment pipelines, security reviews, and monitoring.',
    challenge: 'Rewriting a live legacy system from scratch carries high operational risk, while leaving it untouched slows feature delivery and complicates maintenance.',
    solution: 'Trever applies the strangler-fig pattern to extract critical modules, introduces Infrastructure as Code, and establishes automated Playwright and security test gates.',
    impactMetrics: [
      { label: 'Migration Strategy', value: 'Incremental Strangler' },
      { label: 'Infrastructure', value: 'Terraform IaC' },
      { label: 'Security Posture', value: 'AppSec & Audits' },
      { label: 'Release Flow', value: 'Zero-Downtime CI/CD' },
    ],
    servicesUsed: ['modernization-maintenance', 'cloud-devops', 'cybersecurity', 'consulting-delivery'],
    techStack: ['Terraform', 'Docker', 'Kubernetes', 'TypeScript', 'Playwright', 'Cloud Monitoring'],
    architectureHighlights: [
      'Incremental API routing layer allowing new services to run alongside legacy modules',
      'Version-controlled cloud infrastructure with automated staging and rollback workflows',
      'Comprehensive application security review, dependency hardening, and telemetry alerts',
    ],
  },
];
