import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Eye, Layers, Maximize2, RefreshCw, Zap } from 'lucide-react';

interface NodeInfo {
  title: string;
  category: string;
  description: string;
  metric: string;
}

const CIRCUIT_NODES: NodeInfo[] = [
  {
    title: 'Core Software Engine',
    category: 'Architecture',
    description: 'High-concurrency microservices layer routing API requests with sub-10ms latency.',
    metric: '99.99% Uptime',
  },
  {
    title: 'Circuit Event Bus',
    category: 'Integration',
    description: 'Asynchronous streaming pipeline connecting external APIs, DBs, and message brokers.',
    metric: '450k Events/sec',
  },
  {
    title: 'AI & Inference Matrix',
    category: 'Intelligence',
    description: 'Embedded LLM and vector search nodes providing automated intelligence & risk scoring.',
    metric: 'Sub-35ms Inference',
  },
  {
    title: 'Cloud Edge & Security Shield',
    category: 'Security & DevOps',
    description: 'Zero-trust auth, encrypted state storage, and automated multi-region deployment.',
    metric: 'SOC2 / HIPAA Grade',
  },
];

export default function InteractiveCube3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<'default' | 'exploded' | 'circuit' | 'top'>('default');
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(CIRCUIT_NODES[0]);
  const [showCircuits, setShowCircuits] = useState(true);
  const [showCore, setShowCore] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const subCubesRef = useRef<THREE.Mesh[]>([]);
  const circuitLinesRef = useRef<THREE.LineSegments | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetExplodeRef = useRef(0);
  const currentExplodeRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Detect software WebGL
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

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Scene setup
    const scene = new THREE.Scene();

    // Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(5.5, 4.5, 6.5);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 15;
    controls.minDistance = 3;
    controls.autoRotate = !isSoftwareGl;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // Lighting
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(8, 12, 6);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x0f4c5c, 0x0b1013, 1.8);
    scene.add(hemiLight);

    const tealPointLight = new THREE.PointLight(0x10b981, 3.5, 12);
    tealPointLight.position.set(0, 0, 0);
    scene.add(tealPointLight);

    // Main Group representing Trever's geometric cube logo structure
    const mainGroup = new THREE.Group();
    cubeGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // Materials based on Trever branding
    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x0f4c5c,
      roughness: 0.25,
      metalness: 0.65,
    });

    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0x054d36,
      emissiveIntensity: 0.3,
    });

    const darkCharcoalMat = new THREE.MeshStandardMaterial({
      color: 0x1c272e,
      roughness: 0.35,
      metalness: 0.8,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f4c5c,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Sub-cube geometry layout forming the 3D isometric T-cube
    const boxGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const subCubes: THREE.Mesh[] = [];

    // Grid positions for 2x2x2 cube block layout
    const cubePositions = [
      { pos: [-0.5, -0.5, -0.5], mat: darkCharcoalMat, name: 'Base-Rear' },
      { pos: [0.5, -0.5, -0.5], mat: tealMat, name: 'Base-Right' },
      { pos: [-0.5, 0.5, -0.5], mat: tealMat, name: 'Mid-Left' },
      { pos: [0.5, 0.5, -0.5], mat: darkCharcoalMat, name: 'Mid-Rear' },
      { pos: [-0.5, -0.5, 0.5], mat: tealMat, name: 'Front-Left' },
      { pos: [0.5, -0.5, 0.5], mat: darkCharcoalMat, name: 'Front-Base' },
      { pos: [-0.5, 0.5, 0.5], mat: emeraldMat, name: 'Front-Top-Left' },
      { pos: [0.5, 0.5, 0.5], mat: emeraldMat, name: 'Front-Top-Center' },
    ];

    cubePositions.forEach(({ pos, mat, name }) => {
      const mesh = new THREE.Mesh(boxGeo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.userData = { initialPos: new THREE.Vector3(pos[0], pos[1], pos[2]), name };
      mainGroup.add(mesh);
      subCubes.push(mesh);
    });
    subCubesRef.current = subCubes;

    // Outer Glass Bounding Box
    const outerGlassGeo = new THREE.BoxGeometry(2.1, 2.1, 2.1);
    const outerGlass = new THREE.Mesh(outerGlassGeo, glassMat);
    mainGroup.add(outerGlass);

    // Circuit Line Pathways overlayed on faces
    const circuitPoints: THREE.Vector3[] = [];
    const radius = 1.06;

    // Etch circuit paths around faces
    const facePaths = [
      // Top face circuit loop
      [new THREE.Vector3(-0.8, radius, -0.8), new THREE.Vector3(-0.8, radius, 0.2), new THREE.Vector3(0.2, radius, 0.2), new THREE.Vector3(0.2, radius, 0.8)],
      [new THREE.Vector3(-0.4, radius, -0.4), new THREE.Vector3(0.6, radius, -0.4), new THREE.Vector3(0.6, radius, 0.6)],
      // Front face circuit loop
      [new THREE.Vector3(-0.8, -0.8, radius), new THREE.Vector3(-0.8, 0.2, radius), new THREE.Vector3(0.2, 0.2, radius), new THREE.Vector3(0.8, 0.2, radius)],
      [new THREE.Vector3(-0.2, -0.6, radius), new THREE.Vector3(-0.2, 0.6, radius), new THREE.Vector3(0.6, 0.6, radius)],
      // Right face circuit loop
      [new THREE.Vector3(radius, -0.8, -0.4), new THREE.Vector3(radius, -0.2, -0.4), new THREE.Vector3(radius, -0.2, 0.6), new THREE.Vector3(radius, 0.6, 0.6)],
    ];

    facePaths.forEach(path => {
      for (let i = 0; i < path.length - 1; i++) {
        circuitPoints.push(path[i], path[i + 1]);
      }
    });

    const circuitLinesGeo = new THREE.BufferGeometry().setFromPoints(circuitPoints);
    const circuitLinesMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 2,
    });
    const circuitLines = new THREE.LineSegments(circuitLinesGeo, circuitLinesMat);
    mainGroup.add(circuitLines);
    circuitLinesRef.current = circuitLines;

    // Circuit Glowing Nodes
    const nodesGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const glowNodeMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    });

    const nodePositions = [
      new THREE.Vector3(-0.8, radius, 0.8),
      new THREE.Vector3(0.6, radius, 0.6),
      new THREE.Vector3(0.8, 0.2, radius),
      new THREE.Vector3(radius, 0.6, 0.6),
    ];

    nodePositions.forEach((pos, idx) => {
      const nodeMesh = new THREE.Mesh(sphereGeo, glowNodeMat);
      nodeMesh.position.copy(pos);
      nodeMesh.userData = { nodeIndex: idx, info: CIRCUIT_NODES[idx] };
      nodesGroup.add(nodeMesh);
    });
    mainGroup.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    // Orbiting Data Packet Particles
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      angles[i] = (i / particleCount) * Math.PI * 2;
      radii[i] = 2.2 + Math.random() * 0.8;
      particlePositions[i * 3] = Math.cos(angles[i]) * radii[i];
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      particlePositions[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // Raycaster for clicking nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodesGroup.children);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.info) {
          setSelectedNode(hit.userData.info as NodeInfo);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            setTimeout(cb, 80);
          }
        };
        setTimeout(poll, 5);
      } catch {
        setTimeout(cb, 80);
      }
    }

    function animate() {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth explosion vector interpolation
      currentExplodeRef.current += (targetExplodeRef.current - currentExplodeRef.current) * 0.08;
      const explodeFactor = currentExplodeRef.current;

      subCubes.forEach(cube => {
        const init = cube.userData.initialPos as THREE.Vector3;
        cube.position.x = init.x + init.x * explodeFactor * 0.8;
        cube.position.y = init.y + init.y * explodeFactor * 0.8;
        cube.position.z = init.z + init.z * explodeFactor * 0.8;
      });

      // Slowly rotate orbit particle ring
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += delta * 0.4;
        positions[i * 3] = Math.cos(angles[i]) * radii[i];
        positions[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Pulse teal point light
      tealPointLight.intensity = 3.0 + Math.sin(elapsedTime * 2.5) * 1.2;

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Preset camera / layout position handlers
  const setPreset = (preset: 'default' | 'exploded' | 'circuit' | 'top') => {
    setActivePreset(preset);
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (preset === 'default') {
      targetExplodeRef.current = 0;
      controls.object.position.set(5.5, 4.5, 6.5);
    } else if (preset === 'exploded') {
      targetExplodeRef.current = 0.65;
      controls.object.position.set(6.5, 5.5, 7.5);
    } else if (preset === 'circuit') {
      targetExplodeRef.current = 0.15;
      controls.object.position.set(3.2, 2.8, 3.8);
    } else if (preset === 'top') {
      targetExplodeRef.current = 0;
      controls.object.position.set(0.1, 9.0, 0.1);
    }
  };

  // Toggle visibility handlers
  useEffect(() => {
    if (subCubesRef.current) {
      subCubesRef.current.forEach(cube => (cube.visible = showCore));
    }
  }, [showCore]);

  useEffect(() => {
    if (circuitLinesRef.current) {
      circuitLinesRef.current.visible = showCircuits;
    }
  }, [showCircuits]);

  useEffect(() => {
    if (nodesGroupRef.current) {
      nodesGroupRef.current.visible = showNodes;
    }
  }, [showNodes]);

  return (
    <div
      className="relative w-full h-[480px] lg:h-[580px] rounded-2xl overflow-hidden glass-panel border border-slate-800 shadow-2xl flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Header Controls Overlay */}
      <div className="p-4 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-medium text-emerald-400 tracking-wider uppercase">
            3D Interactive Circuit Engine
          </span>
        </div>

        {/* View Camera Presets */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setPreset('default')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activePreset === 'default' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Isometric
          </button>
          <button
            onClick={() => setPreset('exploded')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activePreset === 'exploded' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Exploded View
          </button>
          <button
            onClick={() => setPreset('circuit')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activePreset === 'circuit' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Circuit Focus
          </button>
          <button
            onClick={() => setPreset('top')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activePreset === 'top' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Top Spec
          </button>
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Selected Circuit Node Telemetry Overlay Card */}
      {selectedNode && (
        <div className="absolute top-16 left-4 z-10 max-w-xs p-3.5 rounded-xl glass-panel border border-emerald-500/30 bg-slate-950/80 shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-widest">
              {selectedNode.category}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              {selectedNode.metric}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">{selectedNode.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">{selectedNode.description}</p>
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Click nodes to inspect architecture components</span>
          </div>
        </div>
      )}

      {/* Bottom Collapsible Control Dock */}
      <div className="p-4 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        {/* Layer Toggles */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showCore}
              onChange={e => setShowCore(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <span>Logic Cubes</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showCircuits}
              onChange={e => setShowCircuits(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <span>Circuit Lines</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showNodes}
              onChange={e => setShowNodes(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <span>Data Nodes</span>
          </label>
        </div>

        {/* Interaction Hint */}
        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Drag to rotate · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
