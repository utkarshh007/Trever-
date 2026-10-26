import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TREVER_SERVICES, ServiceItem } from '../utils/servicesData';
import { getCircuitNodeLayouts, computeCubeUnfoldState } from '../utils/cubeCircuitMath';
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Cpu,
  Globe,
  Network,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wrench,
  X,
  ArrowRight,
} from 'lucide-react';
import MagneticButton from './MagneticButton';
import InteractiveCard from './InteractiveCard';
import StaggeredHeading from './StaggeredHeading';

const ICON_MAP: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-4 h-4 text-emerald-400" />,
  Globe: <Globe className="w-4 h-4 text-emerald-400" />,
  Smartphone: <Smartphone className="w-4 h-4 text-emerald-400" />,
  Palette: <Palette className="w-4 h-4 text-emerald-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-emerald-400" />,
  Cloud: <Cloud className="w-4 h-4 text-emerald-400" />,
  CheckCircle2: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
  BarChart3: <BarChart3 className="w-4 h-4 text-emerald-400" />,
  Network: <Network className="w-4 h-4 text-emerald-400" />,
  Wrench: <Wrench className="w-4 h-4 text-emerald-400" />,
  Users: <Users className="w-4 h-4 text-emerald-400" />,
};

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [actProgress, setActProgress] = useState<number>(0.25);
  const [userLockedServiceId, setUserLockedServiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'core' | 'product' | 'cloud' | 'advisory'>('all');
  const [modalService, setModalService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    if (!modalService) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalService(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalService]);

  const circuitLayouts = useMemo(() => getCircuitNodeLayouts(), []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setActProgress(1);
      return;
    }

    const syncFromScrollCraft = () => {
      const raw = el.style.getPropertyValue('--sc-p');
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        setActProgress(parsed);
      }
    };

    syncFromScrollCraft();
    const observer = new MutationObserver(syncFromScrollCraft);
    observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('scroll', syncFromScrollCraft, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', syncFromScrollCraft);
    };
  }, []);

  const unfoldState = useMemo(() => computeCubeUnfoldState(actProgress, 420), [actProgress]);

  // Determine which service is highlighted in the Inspector (either user-selected or scroll-driven)
  const scrollDrivenIndex = Math.min(
    TREVER_SERVICES.length - 1,
    Math.max(0, unfoldState.energizedNodeCount - 1)
  );
  const activeServiceId = userLockedServiceId || TREVER_SERVICES[scrollDrivenIndex].id;
  const activeService =
    TREVER_SERVICES.find(s => s.id === activeServiceId) || TREVER_SERVICES[0];

  const subCubeOffsets = [
    { dx: -1, dy: -0.9, fill: '#0f4c5c' },
    { dx: 1, dy: -0.9, fill: '#10b981' },
    { dx: -1.1, dy: 0, fill: '#16242c' },
    { dx: 1.1, dy: 0, fill: '#0f4c5c' },
    { dx: -0.8, dy: 0.95, fill: '#10b981' },
    { dx: 0.8, dy: 0.95, fill: '#34d399' },
    { dx: 0, dy: -1.2, fill: '#34d399' },
    { dx: 0, dy: 1.2, fill: '#0f4c5c' },
  ];

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-label="Trever 12 Software Engineering Services"
      data-sc-act="flow"
      data-sc-drift="#081217"
      className="relative z-10 py-20 lg:py-28 bg-transparent border-t border-slate-800/60"
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col gap-8">
        {/* Header Row + Discipline Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span>CONNECTED CAPABILITIES · 12 ENGINEERING DISCIPLINES</span>
            </div>
            <StaggeredHeading
              as="h2"
              text="One engineering core unfolding into twelve connected capabilities."
              className="sc-display sc-display--md font-extrabold text-white leading-[1.26]"
            />
          </div>

          {/* Discipline Filter Controls */}
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-1.5 p-1.5 bg-[#070b0e]/95 rounded-xl border border-slate-800 shrink-0">
            {[
              { key: 'all', label: 'All (12)' },
              { key: 'core', label: 'Core & Web' },
              { key: 'product', label: 'Mobile & UX' },
              { key: 'cloud', label: 'Cloud & AI' },
              { key: 'advisory', label: 'Security & QA' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg micro-press whitespace-nowrap shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-emerald-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Signature Move Stage: Left 7 Cols Unfolding Cube + 12 Circuit Nodes, Right 5 Cols Live Inspector */}
        <div
          data-testid="cube-circuit-unfolder"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left 7 Cols: Interactive Unfolding Cube & 12-Node Circuit Matrix */}
          <div className="lg:col-span-7 spatial-card rounded-2xl p-5 sm:p-7 flex flex-col justify-between gap-6">
            {/* Isometric SVG Unfolding Cube Schematic (Visible on Tablet/Desktop) */}
            <div className="hidden sm:block relative w-full h-48 lg:h-52 rounded-xl bg-[#060a0d] border border-slate-800/90 overflow-hidden">
              <svg
                viewBox="0 0 1000 320"
                className="w-full h-full"
                aria-label="Unfolding Trever Isometric Cube and 12 Service Circuit"
              >
                <defs>
                  <linearGradient id="peakCircuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0f4c5c" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>

                {/* 12 Radiating Circuit Conduits Driven by --sc-p */}
                {circuitLayouts.map((layout, idx) => {
                  const scaledOriginY = 160 + (layout.originY - 280) * 0.55;
                  const scaledElbowY = 160 + (layout.elbowY - 280) * 0.55;
                  const scaledTermY = 160 + (layout.terminalY - 280) * 0.55;
                  const d = `M ${layout.originX} ${scaledOriginY} L ${layout.elbowX} ${scaledElbowY} L ${layout.terminalX} ${scaledTermY}`;
                  const isEnergized = idx < unfoldState.energizedNodeCount;
                  const isFocused = layout.serviceId === activeService.id;

                  return (
                    <g key={layout.serviceId}>
                      {/* Base dim circuit trace */}
                      <path
                        d={d}
                        fill="none"
                        stroke="#0f4c5c"
                        strokeOpacity="0.35"
                        strokeWidth="1.5"
                      />
                      {/* Scroll-energized emerald circuit trace */}
                      <path
                        d={d}
                        fill="none"
                        stroke={isFocused ? '#6ee7b7' : 'url(#peakCircuitGrad)'}
                        strokeWidth={isFocused ? '2.8' : '1.8'}
                        strokeDasharray="420"
                        strokeDashoffset={unfoldState.traceDashOffset}
                        strokeLinecap="round"
                      />
                      {/* Terminal Node Dot */}
                      <circle
                        cx={layout.terminalX}
                        cy={scaledTermY}
                        r={isFocused ? 6.5 : isEnergized ? 5 : 3.5}
                        fill={isFocused ? '#6ee7b7' : isEnergized ? '#10b981' : '#16242c'}
                        stroke="#070b0e"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}

                {/* Central Unfolding Trever Isometric Cube (8 Sub-Cubes separating by cubeExplodePx) */}
                <g transform="translate(500, 160)">
                  <circle
                    r={44 + unfoldState.cubeExplodePx * 1.1}
                    fill="none"
                    stroke="#10b981"
                    strokeOpacity="0.3"
                    strokeDasharray="4 6"
                  />
                  {subCubeOffsets.map((sub, i) => {
                    const tx = (sub.dx * unfoldState.cubeExplodePx).toFixed(1);
                    const ty = (sub.dy * unfoldState.cubeExplodePx).toFixed(1);
                    return (
                      <g key={i} transform={`translate(${tx}, ${ty})`}>
                        <polygon
                          points="0,-18 20,-8 0,2 -20,-8"
                          fill={sub.fill}
                          fillOpacity="0.85"
                          stroke="#34d399"
                          strokeWidth="1"
                        />
                        <polygon
                          points="-20,-8 0,2 0,22 -20,12"
                          fill="#0f4c5c"
                          fillOpacity="0.9"
                          stroke="#10b981"
                          strokeWidth="0.9"
                        />
                        <polygon
                          points="20,-8 0,2 0,22 20,12"
                          fill="#111d24"
                          fillOpacity="0.92"
                          stroke="#10b981"
                          strokeWidth="0.9"
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Central Official Trever Logo Mark Core */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 rounded-xl bg-[#070b0e]/95 border border-emerald-400/60 p-1.5 shadow-lg flex items-center justify-center">
                  <img
                    src="/assets/trever-logo.png"
                    alt="Trever Core Logo"
                    width="32"
                    height="32"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* All 12 Interactive Service Terminal Nodes (2-column grid for comfortable width and zero truncation) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {TREVER_SERVICES.map((service, idx) => {
                const matchesTab = activeTab === 'all' || service.category === activeTab;
                if (!matchesTab) return null;

                const isSelected = service.id === activeService.id;
                const isEnergized = idx < unfoldState.energizedNodeCount;

                return (
                  <button
                    key={service.id}
                    type="button"
                    data-testid={`service-card-${service.id}`}
                    onClick={() => setUserLockedServiceId(service.id)}
                    onDoubleClick={() => setModalService(service)}
                    className={`group text-left p-4 rounded-xl border micro-press flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/65 border-emerald-400 text-white shadow-md'
                        : isEnergized
                        ? 'bg-[#091217]/90 border-emerald-500/30 text-slate-200 hover:border-emerald-400/60'
                        : 'bg-[#070b0e]/75 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="p-2 rounded-lg bg-[#070b0e] border border-slate-800 shrink-0 mt-0.5">
                      {ICON_MAP[service.iconName] || <Cpu className="w-4 h-4 text-emerald-400" />}
                    </span>
                    <div className="min-w-0 flex-1 flex flex-col gap-1">
                      <div className="text-sm font-bold leading-snug group-hover:text-emerald-300">
                        {service.title}
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {service.shortDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Active Capability Specification Inspector */}
          <InteractiveCard className="lg:col-span-5 lg:sticky lg:top-28 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 text-left">
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-[#070b0e] border border-emerald-500/40 shrink-0">
                    {ICON_MAP[activeService.iconName]}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                      Connected Service Terminal
                    </span>
                    <StaggeredHeading
                      as="h3"
                      text={activeService.title}
                      className="text-xl sm:text-2xl font-bold text-white leading-[1.32]"
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-[1.82]">
                {activeService.fullDesc}
              </p>

              <div className="flex flex-col gap-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  What This Discipline Includes
                </div>
                <ul className="flex flex-col gap-2.5">
                  {activeService.capabilities.map((cap, i) => (
                    <li
                      key={i}
                      className="px-3.5 py-2.5 rounded-xl bg-[#070b0e]/90 border border-slate-800/90 text-sm text-slate-200 leading-relaxed flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex flex-col gap-1.5">
                <div className="text-xs font-mono text-emerald-400 uppercase">
                  Operational Value
                </div>
                <p className="text-sm text-slate-200 leading-[1.78]">
                  {activeService.businessImpact}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModalService(activeService)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 micro-press"
              >
                <span>Open Deliverable Specs</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <MagneticButton
                href="#contact"
                strength={0.22}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg whitespace-nowrap"
              >
                <span>Get Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>
          </InteractiveCard>
        </div>
      </div>

      {/* Service Detailed Specifications Modal */}
      {modalService && (
        <div
          onClick={() => setModalService(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05080a]/90 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar spatial-card border border-emerald-500/40 bg-[#0b1116] rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 cursor-default text-left"
          >
            <button
              type="button"
              onClick={() => setModalService(null)}
              aria-label="Close Service Specifications"
              className="absolute top-5 right-5 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white micro-press"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {ICON_MAP[modalService.iconName]}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  Service Specifications
                </span>
                <StaggeredHeading
                  as="h3"
                  text={modalService.title}
                  className="text-2xl font-bold text-white leading-[1.32]"
                />
              </div>
            </div>

            <p className="text-base text-slate-200 leading-[1.82]">
              {modalService.fullDesc}
            </p>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Key Deliverables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modalService.deliverables.map((deliv, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 leading-relaxed flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Representative Technologies
              </h4>
              <div className="text-sm font-mono text-slate-300 leading-relaxed">
                {modalService.techStack.join(' · ')}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setModalService(null)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white whitespace-nowrap shrink-0 micro-press"
              >
                Close Specs
              </button>
              <MagneticButton
                href="#contact"
                onClick={() => setModalService(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg whitespace-nowrap shrink-0"
              >
                <span>Get Demo</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
