export interface TimelineStage {
  index: number;
  code: string;
  id: string;
  title: string;
  subtitle: string;
  range: [number, number];
  architectureState: string;
  throughputMetric: string;
  latencyMetric: string;
  description: string;
}

export const PRODUCT_TIMELINE_STAGES: TimelineStage[] = [
  {
    index: 0,
    code: '01',
    id: 'genesis-kernel',
    title: 'Core Domain Kernel',
    subtitle: 'System Initialization & Zero-Trust Foundation',
    range: [0.0, 0.16],
    architectureState: 'Domain Foundation',
    throughputMetric: 'Strict Schema Contracts',
    latencyMetric: 'Zero-Trust Identity',
    description:
      'Every Trever product begins as a strictly typed domain kernel with cryptographic identity, clean schema boundaries, and deterministic state primitives.',
  },
  {
    index: 1,
    code: '02',
    id: 'product-timeline',
    title: 'Microservices Decomposition',
    subtitle: 'Event-Driven Circuit Bus & API Mesh',
    range: [0.16, 0.34],
    architectureState: 'Distributed Service Mesh',
    throughputMetric: 'Event-Driven Streams',
    latencyMetric: 'Typed API Contracts',
    description:
      'As product scope expands, the core decomposes into isolated compute blocks connected via asynchronous Kafka streams and low-latency gRPC/GraphQL conduits.',
  },
  {
    index: 2,
    code: '03',
    id: 'capability-mesh',
    title: '12-Node Capability Matrix',
    subtitle: 'Web, Native Mobile, AI Inference & Cloud DevOps',
    range: [0.34, 0.52],
    architectureState: 'Unified Client & Cloud',
    throughputMetric: 'Cross-Platform Sync',
    latencyMetric: 'Shared Design Tokens',
    description:
      'Client surfaces, native iOS/Android binaries, vector RAG pipelines, and automated security scanners synchronize around the core architecture.',
  },
  {
    index: 3,
    code: '04',
    id: 'production-telemetry',
    title: 'High-Throughput Execution',
    subtitle: 'Real-Time Telemetry & Fraud/Risk Stream Processing',
    range: [0.52, 0.70],
    architectureState: 'Resilient Runtime',
    throughputMetric: 'Multi-Region Failover',
    latencyMetric: 'End-to-End Observability',
    description:
      'In production, distributed data packets traverse multi-region clusters with automated failover, real-time observability, and zero data loss.',
  },
  {
    index: 4,
    code: '05',
    id: 'delivery-pipeline',
    title: '5-Phase Continuous Delivery',
    subtitle: 'Automated QA Gates, SAST/DAST & Blue-Green Deploys',
    range: [0.70, 0.86],
    architectureState: 'Automated Release Gates',
    throughputMetric: 'CI/CD & IaC Pipelines',
    latencyMetric: 'Zero-Downtime Deploys',
    description:
      'Every commit passes through deterministic unit suites, Playwright E2E browser verification, and Terraform infrastructure reconciliation.',
  },
  {
    index: 5,
    code: '06',
    id: 'sovereign-launch',
    title: 'Sovereign Enterprise Scale',
    subtitle: 'Multi-Region Equilibrium & 99.99% SLA Support',
    range: [0.86, 1.0],
    architectureState: 'Production Operations',
    throughputMetric: 'Multi-Region HA',
    latencyMetric: 'Managed Engineering SLA',
    description:
      'The complete software platform converges into a hardened, self-healing production system backed by Trever senior engineering support.',
  },
];

export interface BackgroundSceneState {
  stageIndex: number;
  localProgress: number;
  explodeFactor: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cubeRotation: [number, number, number];
  orbitalRadius: number;
  circuitPulseIntensity: number;
}

/**
 * Calculates a normalized scroll progress value between 0 and 1.
 */
export function calculateScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0 || !Number.isFinite(maxScroll)) {
    return 0;
  }
  const raw = scrollTop / maxScroll;
  if (!Number.isFinite(raw)) {
    return 0;
  }
  return Math.min(1, Math.max(0, raw));
}

/**
 * Converts normalized progress (0..1) into an integer percentage (0..100) for ARIA attributes.
 */
export function progressToPercentage(progress: number): number {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  return Math.round(clamped * 100);
}

/**
 * Resolves the active product timeline stage and local intra-stage progress (0..1)
 * for any normalized scroll progress (0..1).
 */
export function getTimelineStageForProgress(progress: number): {
  stage: TimelineStage;
  localProgress: number;
} {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  for (let i = 0; i < PRODUCT_TIMELINE_STAGES.length; i++) {
    const stage = PRODUCT_TIMELINE_STAGES[i];
    const [start, end] = stage.range;
    if (p <= end || i === PRODUCT_TIMELINE_STAGES.length - 1) {
      const span = Math.max(0.0001, end - start);
      const localProgress = Math.min(1, Math.max(0, (p - start) / span));
      return { stage, localProgress };
    }
  }
  return { stage: PRODUCT_TIMELINE_STAGES[0], localProgress: 0 };
}

/**
 * Deterministically computes the 3D background architecture state from normalized scroll progress.
 */
export function computeBackgroundSceneState(progress: number): BackgroundSceneState {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const { stage, localProgress } = getTimelineStageForProgress(p);

  // Smooth bell-curve explosion across the middle stages, converging at start and end
  // Peaks around p = 0.35..0.55
  const explodeWave = Math.sin(p * Math.PI);
  const explodeFactor = Number((explodeWave * 0.85).toFixed(4));

  // Camera orbits smoothly around the central T-Cube architecture
  const angle = p * Math.PI * 1.65 + 0.72;
  const distance = 7.2 - Math.sin(p * Math.PI) * 0.9;
  const camX = Number((Math.cos(angle) * distance).toFixed(3));
  const camY = Number((3.9 + Math.cos(p * Math.PI * 2) * 1.1).toFixed(3));
  const camZ = Number((Math.sin(angle) * distance).toFixed(3));

  // Offset camera target horizontally so the 3D cube frames naturally in right-hand negative space
  const targetX = Number((-1.45 + Math.sin(p * Math.PI * 2) * 0.65).toFixed(3));
  const targetY = Number((Math.sin(p * Math.PI * 2) * 0.2).toFixed(3));

  // Continuous deterministic cube rotation
  const rotX = Number((p * Math.PI * 0.75).toFixed(3));
  const rotY = Number((p * Math.PI * 2.25).toFixed(3));
  const rotZ = Number((Math.sin(p * Math.PI * 2) * 0.2).toFixed(3));

  const orbitalRadius = Number((2.3 + explodeFactor * 1.1).toFixed(3));
  const circuitPulseIntensity = Number((2.5 + explodeWave * 2.5).toFixed(3));

  return {
    stageIndex: stage.index,
    localProgress: Number(localProgress.toFixed(3)),
    explodeFactor,
    cameraPosition: [camX, camY, camZ],
    cameraTarget: [targetX, targetY, 0],
    cubeRotation: [rotX, rotY, rotZ],
    orbitalRadius,
    circuitPulseIntensity,
  };
}
