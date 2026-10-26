/**
 * Pure deterministic math for Trever's Signature Move:
 * The `--sc-p` Isometric Cube-to-12-Service Circuit Unfolder.
 */

export interface CircuitNodeLayout {
  serviceId: string;
  index: number;
  quadrant: 0 | 1 | 2 | 3;
  /** SVG coordinates (in a 1000x560 viewBox) where the circuit trace originates on the cube perimeter */
  originX: number;
  originY: number;
  /** SVG elbow coordinates for the 45-degree / isometric circuit bend */
  elbowX: number;
  elbowY: number;
  /** SVG terminal coordinates where the service node sits */
  terminalX: number;
  terminalY: number;
  /** Normalized progress threshold (0..1) at which this node's circuit trace finishes locking in */
  activationThreshold: number;
}

export interface UnfoldState {
  clampedProgress: number;
  /** Isometric sub-cube separation in pixels (0..26) */
  cubeExplodePx: number;
  /** Core rotation angle in degrees */
  coreRotationDeg: number;
  /** SVG strokeDashoffset (from pathLength down to 0) */
  traceDashOffset: number;
  /** Number of service nodes (1..12) whose circuits have energized at this progress */
  energizedNodeCount: number;
  /** Index of the scroll-highlighted quadrant (0..3) */
  activeQuadrantIndex: number;
}

const SERVICE_IDS = [
  'custom-software',
  'web-dev',
  'software-integration',
  'mobile-app',
  'ui-ux',
  'ai-ml',
  'cloud-devops',
  'data-analytics',
  'qa-testing',
  'cybersecurity',
  'modernization-maintenance',
  'consulting-delivery',
];

/**
 * Computes deterministic SVG circuit coordinates for all 12 Trever services
 * radiating from the central isometric cube at (500, 280).
 */
export function getCircuitNodeLayouts(): CircuitNodeLayout[] {
  const centerX = 500;
  const centerY = 280;

  return SERVICE_IDS.map((serviceId, index) => {
    const quadrant = Math.floor(index / 3) as 0 | 1 | 2 | 3;
    const slotInQuadrant = index % 3; // 0, 1, 2

    const isLeft = quadrant === 0 || quadrant === 2;
    const isTop = quadrant === 0 || quadrant === 1;

    const dirX = isLeft ? -1 : 1;
    const dirY = isTop ? -1 : 1;

    const originX = centerX + dirX * 52;
    const originY = centerY + dirY * (24 + slotInQuadrant * 16);

    const verticalSpread = isTop
      ? 68 + slotInQuadrant * 58
      : 344 + slotInQuadrant * 58;

    const elbowX = centerX + dirX * (145 + slotInQuadrant * 22);
    const elbowY = verticalSpread;

    const terminalX = centerX + dirX * 370;
    const terminalY = verticalSpread;

    // Nodes energize progressively between p = 0.06 and p = 0.78
    const activationThreshold = Number((0.06 + (index / 11) * 0.72).toFixed(3));

    return {
      serviceId,
      index,
      quadrant,
      originX,
      originY,
      elbowX,
      elbowY,
      terminalX,
      terminalY,
      activationThreshold,
    };
  });
}

/**
 * Computes the unfolding cube and circuit state from Scroll Craft's `--sc-p` (0..1).
 */
export function computeCubeUnfoldState(progress: number, pathLength = 420): UnfoldState {
  const p = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;

  // Unfold ramps smoothly during the first 75% of the pinned act and holds steady
  const unfoldProgress = Math.min(1, p / 0.78);
  const eased = 1 - Math.pow(1 - unfoldProgress, 3);

  const cubeExplodePx = Number((eased * 24).toFixed(2));
  const coreRotationDeg = Number((eased * 45).toFixed(2));
  const traceDashOffset = Number((pathLength * (1 - eased)).toFixed(2));

  // Always show at least 2 energized nodes at p=0 (greet ground), reaching all 12 by p=0.78
  const energizedNodeCount = Math.min(12, Math.max(2, Math.round(2 + eased * 10)));
  const activeQuadrantIndex = Math.min(3, Math.floor(p * 4));

  return {
    clampedProgress: p,
    cubeExplodePx,
    coreRotationDeg,
    traceDashOffset,
    energizedNodeCount,
    activeQuadrantIndex,
  };
}
