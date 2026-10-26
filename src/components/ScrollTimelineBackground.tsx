import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import {
  calculateScrollProgress,
  computeBackgroundSceneState,
  getTimelineStageForProgress,
  PRODUCT_TIMELINE_STAGES,
  progressToPercentage,
} from '../utils/scrollProgress';

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

const COMP_ID = 'trever-product-timeline';

export default function ScrollTimelineBackground() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgPath1Ref = useRef<SVGPathElement>(null);
  const svgPath2Ref = useRef<SVGPathElement>(null);
  const svgPath3Ref = useRef<SVGPathElement>(null);
  const svgRingRef = useRef<SVGCircleElement>(null);

  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = window.innerWidth || 1440;
    const height = window.innerHeight || 900;

    // 1. Detect Software WebGL per Three.js skill guidelines
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b0e, 0.042);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(5.4, 3.8, 5.2);

    // Balanced Studio Lighting Rig (Warm Key + Cool Teal Hemisphere + Emerald Core Point + Rim Accent)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    keyLight.position.set(9, 14, 8);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x0f4c5c, 0x070b0e, 1.85);
    scene.add(hemiLight);

    const coreLight = new THREE.PointLight(0x10b981, 3.4, 18);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.35);
    rimLight.position.set(-7, -5, -6);
    scene.add(rimLight);

    // Composite 12-Part Procedural 3D Architecture Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x0f4c5c,
      roughness: 0.2,
      metalness: 0.74,
    });

    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.16,
      metalness: 0.54,
      emissive: 0x064e3b,
      emissiveIntensity: 0.55,
    });

    const charcoalMat = new THREE.MeshStandardMaterial({
      color: 0x162026,
      roughness: 0.44,
      metalness: 0.86,
    });

    const outerShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f4c5c,
      transparent: true,
      opacity: isSoftwareGl ? 0.22 : 0.3,
      roughness: 0.12,
      metalness: 0.15,
      clearcoat: 1.0,
      depthWrite: false,
    });

    // Primary Silhouette: 8 Isometric Logic Sub-Cubes forming Trever T-Cube
    const subCubeGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
    const subCubes: THREE.Mesh[] = [];
    const layout = [
      { pos: [-0.52, -0.52, -0.52], mat: charcoalMat },
      { pos: [0.52, -0.52, -0.52], mat: tealMat },
      { pos: [-0.52, 0.52, -0.52], mat: tealMat },
      { pos: [0.52, 0.52, -0.52], mat: charcoalMat },
      { pos: [-0.52, -0.52, 0.52], mat: tealMat },
      { pos: [0.52, -0.52, 0.52], mat: emeraldMat },
      { pos: [-0.52, 0.52, 0.52], mat: emeraldMat },
      { pos: [0.52, 0.52, 0.52], mat: emeraldMat },
    ];

    layout.forEach(({ pos, mat }, idx) => {
      const mesh = new THREE.Mesh(subCubeGeo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.userData = {
        basePos: new THREE.Vector3(pos[0], pos[1], pos[2]),
        index: idx,
      };
      rootGroup.add(mesh);
      subCubes.push(mesh);
    });

    // Secondary Read: Outer Crystalline Containment Cage
    const cageGeo = new THREE.BoxGeometry(2.22, 2.22, 2.22);
    const cageMesh = new THREE.Mesh(cageGeo, outerShellMat);
    cageMesh.renderOrder = 2;
    rootGroup.add(cageMesh);

    // Accent Detail 1: Etched 3D Circuit Pathways on Cube Perimeter
    const circuitPts: THREE.Vector3[] = [];
    const r = 1.13;
    const traces = [
      [new THREE.Vector3(-0.85, r, -0.85), new THREE.Vector3(-0.85, r, 0.3), new THREE.Vector3(0.3, r, 0.3), new THREE.Vector3(0.3, r, 0.9)],
      [new THREE.Vector3(-0.4, r, -0.4), new THREE.Vector3(0.7, r, -0.4), new THREE.Vector3(0.7, r, 0.7)],
      [new THREE.Vector3(-0.85, -0.85, r), new THREE.Vector3(-0.85, 0.25, r), new THREE.Vector3(0.85, 0.25, r)],
      [new THREE.Vector3(r, -0.85, -0.4), new THREE.Vector3(r, -0.1, -0.4), new THREE.Vector3(r, -0.1, 0.7), new THREE.Vector3(r, 0.7, 0.7)],
    ];
    traces.forEach(t => {
      for (let i = 0; i < t.length - 1; i++) {
        circuitPts.push(t[i], t[i + 1]);
      }
    });
    const circuitGeo = new THREE.BufferGeometry().setFromPoints(circuitPts);
    const circuitMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.9 });
    const circuitSegments = new THREE.LineSegments(circuitGeo, circuitMat);
    rootGroup.add(circuitSegments);

    // Accent Detail 2: 12 Instanced Orbital Capability Satellites (representing Trever's 12 services)
    const satCount = 12;
    const satGeo = new THREE.OctahedronGeometry(0.11, 0);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.95,
      roughness: 0.2,
      metalness: 0.6,
    });
    const satInstanced = new THREE.InstancedMesh(satGeo, satMat, satCount);
    satInstanced.frustumCulled = false;
    rootGroup.add(satInstanced);

    // Contact Grounding Ring
    const ringGeo = new THREE.RingGeometry(2.4, 2.44, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
    });
    const orbitalRingMesh = new THREE.Mesh(ringGeo, ringMat);
    orbitalRingMesh.position.y = -1.65;
    rootGroup.add(orbitalRingMesh);

    // Pre-allocated math helpers (Zero GC in render loop)
    const _dummyMat = new THREE.Matrix4();
    const _dummyPos = new THREE.Vector3();
    const _dummyQuat = new THREE.Quaternion();
    const _dummyScale = new THREE.Vector3(1, 1, 1);
    const _targetVec = new THREE.Vector3(0, 0, 0);

    // State driven by GSAP timeline playhead + live ambient clock + pointer parallax
    const animState = {
      progress: 0,
      pointerX: 0,
      pointerY: 0,
      smoothPointerX: 0,
      smoothPointerY: 0,
    };

    const startTime = performance.now();
    let frameId = 0;
    let isDisposed = false;

    function afterDraw(cb: () => void) {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 85);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 85);
      }
    }

    function applySceneStateAndDraw(ambientSec: number) {
      const s = computeBackgroundSceneState(animState.progress);

      // Smooth pointer parallax interpolation
      animState.smoothPointerX += (animState.pointerX - animState.smoothPointerX) * 0.08;
      animState.smoothPointerY += (animState.pointerY - animState.smoothPointerY) * 0.08;

      // Update sub-cube explosion, pipeline alignment & living idle levitation
      const isPipelineStage = s.stageIndex === 4;
      const idleBreath = prefersReducedMotion ? 0 : Math.sin(ambientSec * 1.6) * 0.04;

      for (let i = 0; i < subCubes.length; i++) {
        const cube = subCubes[i];
        const base = cube.userData.basePos as THREE.Vector3;
        const nodeWave = prefersReducedMotion
          ? 0
          : Math.sin(ambientSec * 2.1 + i * 0.85) * 0.045;

        if (isPipelineStage) {
          const pipelineOffset = (i - 3.5) * 0.55 * s.localProgress;
          cube.position.set(
            base.x * (1 + s.explodeFactor * 0.5) + pipelineOffset,
            base.y * (1 - s.localProgress * 0.35) + nodeWave,
            base.z * (1 + s.explodeFactor * 0.5)
          );
        } else {
          const factor = 1 + s.explodeFactor * 0.95 + idleBreath;
          cube.position.set(
            base.x * factor,
            base.y * factor + nodeWave,
            base.z * factor
          );
        }
      }

      // Scale outer containment cage slightly with explosion + subtle breathing
      const cageScale = 1 + s.explodeFactor * 0.32 + idleBreath * 0.5;
      cageMesh.scale.set(cageScale, cageScale, cageScale);

      // Update 12 orbital capability satellites with continuous orbit + scroll revolution
      const ambientOrbit = prefersReducedMotion ? 0 : ambientSec * 0.32;
      for (let i = 0; i < satCount; i++) {
        const theta =
          (i / satCount) * Math.PI * 2 +
          animState.progress * Math.PI * 3 +
          ambientOrbit;
        const yWave =
          Math.sin(theta * 2 + animState.progress * 6 + ambientOrbit * 2) *
          (0.45 + s.explodeFactor * 0.5);
        _dummyPos.set(
          Math.cos(theta) * s.orbitalRadius,
          yWave,
          Math.sin(theta) * s.orbitalRadius
        );
        const satPulse = prefersReducedMotion
          ? 1
          : 0.88 + Math.sin(ambientSec * 3 + i) * 0.18;
        _dummyScale.setScalar(satPulse);
        _dummyMat.compose(_dummyPos, _dummyQuat, _dummyScale);
        satInstanced.setMatrixAt(i, _dummyMat);
      }
      satInstanced.instanceMatrix.needsUpdate = true;

      // Rotate root group with scroll state + gentle continuous drift + pointer parallax
      const ambientYaw = prefersReducedMotion ? 0 : Math.sin(ambientSec * 0.45) * 0.12;
      const ambientPitch = prefersReducedMotion ? 0 : Math.cos(ambientSec * 0.35) * 0.06;

      rootGroup.rotation.set(
        s.cubeRotation[0] + ambientPitch + animState.smoothPointerY * 0.16,
        s.cubeRotation[1] + ambientYaw + animState.smoothPointerX * 0.22,
        s.cubeRotation[2]
      );

      camera.position.set(
        s.cameraPosition[0] + animState.smoothPointerX * 0.28,
        s.cameraPosition[1] - animState.smoothPointerY * 0.2,
        s.cameraPosition[2]
      );
      _targetVec.set(s.cameraTarget[0], s.cameraTarget[1], s.cameraTarget[2]);
      camera.lookAt(_targetVec);

      const pulseBoost = prefersReducedMotion
        ? 0
        : Math.sin(ambientSec * 2.8) * 0.45;
      coreLight.intensity = s.circuitPulseIntensity + pulseBoost;
      emeraldMat.emissiveIntensity = 0.48 + ( prefersReducedMotion ? 0 : Math.sin(ambientSec * 2.4) * 0.16 );

      renderer.render(scene, camera);
    }

    function runLoop() {
      if (isDisposed) return;
      const elapsedSec = (performance.now() - startTime) * 0.001;
      applySceneStateAndDraw(elapsedSec);

      if (prefersReducedMotion) return;

      if (isSoftwareGl) {
        afterDraw(() => {
          frameId = requestAnimationFrame(runLoop);
        });
      } else {
        frameId = requestAnimationFrame(runLoop);
      }
    }

    // 2. Build Deterministic Paused GSAP Master Timeline (30s total across 6 scenes of 5s each)
    const tl = gsap.timeline({
      paused: true,
      onUpdate: () => {
        animState.progress = tl.progress();
        if (prefersReducedMotion) {
          applySceneStateAndDraw(0);
        }
      },
    });

    // Prepare SVG stroke paths for real-time circuit drawing as user scrolls
    [svgPath1Ref.current, svgPath2Ref.current, svgPath3Ref.current].forEach(path => {
      if (path) {
        const len = path.getTotalLength?.() || 1400;
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len * 0.72 });
      }
    });

    // Scene-by-scene GSAP choreography (6 scenes × 5s = 30s total)
    PRODUCT_TIMELINE_STAGES.forEach((_, idx) => {
      const startSec = idx * 5;
      const selector = `.scene[data-start='${startSec}'] .scene-content > *`;
      tl.from(
        selector,
        {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          ease: idx % 2 === 0 ? 'power3.out' : 'expo.out',
          stagger: 0.1,
        },
        startSec + 0.2
      );
    });

    // Continuous SVG circuit path lighting up across full 30s timeline
    if (svgPath1Ref.current) {
      tl.to(svgPath1Ref.current, { strokeDashoffset: 0, duration: 30, ease: 'none' }, 0);
    }
    if (svgPath2Ref.current) {
      tl.to(svgPath2Ref.current, { strokeDashoffset: 0, duration: 28, ease: 'power2.inOut' }, 1);
    }
    if (svgPath3Ref.current) {
      tl.to(svgPath3Ref.current, { strokeDashoffset: 0, duration: 26, ease: 'power1.inOut' }, 2);
    }
    if (svgRingRef.current) {
      tl.to(
        svgRingRef.current,
        { rotation: 360, transformOrigin: '50% 50%', duration: 30, ease: 'none' },
        0
      );
    }

    // Register master timeline on window.__timelines per HyperFrames contract
    window.__timelines = window.__timelines || {};
    window.__timelines[COMP_ID] = tl;
    window.__timelines['trever-scroll-progress'] = tl;

    const syncWithScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight || 0;
      const clientHeight = window.innerHeight || doc.clientHeight || 0;

      const progress = calculateScrollProgress(scrollTop, scrollHeight, clientHeight);
      const { stage } = getTimelineStageForProgress(progress);

      setActiveStageIdx(stage.index);
      setPercentage(progressToPercentage(progress));

      if (prefersReducedMotion) {
        tl.progress(progress);
        animState.progress = progress;
        applySceneStateAndDraw(0);
      } else {
        gsap.to(tl, {
          progress,
          duration: 0.24,
          ease: 'power3.out',
          overwrite: true,
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion) return;
      const w = window.innerWidth || 1440;
      const h = window.innerHeight || 900;
      animState.pointerX = ((e.clientX / w) - 0.5) * 2;
      animState.pointerY = ((e.clientY / h) - 0.5) * 2;
    };

    const handleResize = () => {
      const w = window.innerWidth || 1440;
      const h = window.innerHeight || 900;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      syncWithScroll();
      if (prefersReducedMotion) applySceneStateAndDraw(0);
    };

    syncWithScroll();
    runLoop();

    window.addEventListener('scroll', syncWithScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('scroll', syncWithScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      tl.kill();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const currentStage = PRODUCT_TIMELINE_STAGES[activeStageIdx] || PRODUCT_TIMELINE_STAGES[0];

  return (
    <div
      id="stage"
      ref={stageRef}
      role="progressbar"
      aria-label="Product architecture scroll timeline"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      data-testid="scroll-progress-bar"
      data-composition-id={COMP_ID}
      data-start="0"
      data-width="1920"
      data-height="1080"
      data-duration="30"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Layered Dimensional Atmosphere */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_58%_42%,rgba(15,76,92,0.26)_0%,rgba(7,11,14,0.9)_72%)]"
      />

      {/* Subtle Isometric Circuit Grid Texture */}
      <div aria-hidden="true" className="absolute inset-0 circuit-grid opacity-55" />

      {/* Full-Viewport GSAP SVG Circuit Blueprint Layer that lights up on scroll */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1920 1080"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-45"
      >
        <defs>
          <linearGradient id="treverCircuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f4c5c" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Base dim circuit tracks */}
        <path
          d="M 80 180 L 420 180 L 580 340 L 580 740 L 820 920 L 1480 920 L 1720 680 L 1840 680"
          stroke="#0f4c5c"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <path
          d="M 1840 220 L 1460 220 L 1280 400 L 960 400 L 760 600 L 280 600 L 120 760"
          stroke="#0f4c5c"
          strokeOpacity="0.25"
          strokeWidth="1"
        />

        {/* Scroll-Illuminated Primary Circuit Conduit */}
        <path
          ref={svgPath1Ref}
          d="M 80 180 L 420 180 L 580 340 L 580 740 L 820 920 L 1480 920 L 1720 680 L 1840 680"
          stroke="url(#treverCircuitGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Scroll-Illuminated Secondary Counter-Conduit */}
        <path
          ref={svgPath2Ref}
          d="M 1840 220 L 1460 220 L 1280 400 L 960 400 L 760 600 L 280 600 L 120 760"
          stroke="url(#treverCircuitGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Isometric Diagonal Bus Trace */}
        <path
          ref={svgPath3Ref}
          d="M 340 960 L 640 660 L 1160 660 L 1540 280 L 1820 280"
          stroke="#34d399"
          strokeOpacity="0.55"
          strokeWidth="1.25"
          strokeLinecap="round"
        />

        {/* Circuit Junction Nodes that illuminate as scroll advances */}
        {[
          { cx: 420, cy: 180, threshold: 0 },
          { cx: 580, cy: 340, threshold: 16 },
          { cx: 960, cy: 400, threshold: 32 },
          { cx: 760, cy: 600, threshold: 50 },
          { cx: 1160, cy: 660, threshold: 68 },
          { cx: 1480, cy: 920, threshold: 84 },
        ].map((node, i) => {
          const lit = percentage >= node.threshold;
          return (
            <g key={i}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={lit ? 6 : 3.5}
                fill={lit ? '#10b981' : '#0f4c5c'}
                fillOpacity={lit ? 0.9 : 0.4}
              />
              {lit && (
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="13"
                  stroke="#34d399"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
              )}
            </g>
          );
        })}

        {/* Rotating Blueprint Compass Ring */}
        <circle
          ref={svgRingRef}
          cx="960"
          cy="540"
          r="390"
          stroke="#10b981"
          strokeOpacity="0.16"
          strokeWidth="1"
          strokeDasharray="4 14"
        />
      </svg>

      {/* Isolated Three.js WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="background-3d-canvas"
        className="absolute inset-0 w-full h-full opacity-90"
      />

      {/* Measured Contrast Scrim ensuring >= 4.5:1 WCAG AA legibility across all scroll frames */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_72%_46%,rgba(7,11,14,0.16)_0%,rgba(7,11,14,0.75)_72%)]"
      />

      {/* HyperFrames-valid Tiled Scene Structure in Ambient Background */}
      {PRODUCT_TIMELINE_STAGES.map((stage, idx) => {
        const startSec = idx * 5;
        const isCurrent = idx === activeStageIdx;
        return (
          <div
            key={stage.id}
            className={`scene clip absolute inset-0 transition-opacity duration-500 ${
              isCurrent ? 'opacity-100' : 'opacity-0'
            }`}
            data-start={String(startSec)}
            data-duration="5"
            data-track-index="0"
          >
            <div className="scene-content sr-only">
              <div>
                <span>STAGE {stage.code} / 06</span>
                <span>{stage.architectureState}</span>
              </div>
              <div>
                {stage.title} · {stage.throughputMetric}
              </div>
            </div>
          </div>
        );
      })}

      {/* Hidden-chrome telemetry node for deterministic test inspection */}
      <div
        data-testid="active-timeline-stage"
        data-stage-code={currentStage.code}
        data-stage-id={currentStage.id}
        className="sr-only"
      >
        {currentStage.code} · {currentStage.title}
      </div>
    </div>
  );
}
