import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Play, Pause, RotateCcw, Eye } from 'lucide-react';
import StaggeredHeading from './StaggeredHeading';

declare global {
  interface Window {
    __timelines?: Record<string, gsap.core.Timeline>;
  }
}

interface HyperScene {
  index: number;
  startSec: number;
  code: string;
  shortLabel: string;
  kicker: string;
  title: string;
  caption: string;
  metricValue: string;
  metricLabel: string;
}

const HYPER_SCENES: HyperScene[] = [
  {
    index: 0,
    startSec: 0,
    code: '01',
    shortLabel: 'KERNEL',
    kicker: 'DOMAIN KERNEL',
    title: 'Isometric T-Cube Synthesis',
    caption: 'Core domain invariants, strict type contracts, and modular service boundaries lock into place.',
    metricValue: '8 Nodes',
    metricLabel: 'Isometric Logic Core',
  },
  {
    index: 1,
    startSec: 3,
    code: '02',
    shortLabel: 'MESH',
    kicker: 'CAPABILITY MESH',
    title: 'Full-Stack Service Ecosystem',
    caption: 'Custom software, web, native mobile, AI, cloud, QA, and security disciplines interconnect.',
    metricValue: '12 Core',
    metricLabel: 'Engineering Services',
  },
  {
    index: 2,
    startSec: 6,
    code: '03',
    shortLabel: 'FABRIC',
    kicker: 'CLOUD & AI FABRIC',
    title: 'Connected Platform Architecture',
    caption: 'Web, iOS, Android, and cloud API workloads orchestrated through unified event pipelines.',
    metricValue: '4 Targets',
    metricLabel: 'Web, iOS, Android, Cloud',
  },
  {
    index: 3,
    startSec: 9,
    code: '04',
    shortLabel: 'SHIELD',
    kicker: 'QUALITY & SECURITY',
    title: 'Automated Verification Gates',
    caption: 'End-to-end Playwright suites, performance load testing, and application security reviews.',
    metricValue: 'E2E + AppSec',
    metricLabel: 'Integrated Verification',
  },
  {
    index: 4,
    startSec: 12,
    code: '05',
    shortLabel: 'DELIVERY',
    kicker: 'PRODUCTION LIFECYCLE',
    title: 'End-to-End Engineering Execution',
    caption: 'Dedicated engineering teams taking ownership from initial discovery through ongoing support.',
    metricValue: '5 Phases',
    metricLabel: 'Structured Delivery',
  },
];

const HERO_COMP_ID = 'trever-hero-hyperframes';
const TOTAL_DURATION = 15;

interface HyperFramesShowcaseProps {
  scrollScrubProgress?: number;
}

export default function HyperFramesShowcase({ scrollScrubProgress }: HyperFramesShowcaseProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cubeGroupRef = useRef<SVGGElement>(null);
  const trace1Ref = useRef<SVGPathElement>(null);
  const trace2Ref = useRef<SVGPathElement>(null);
  const trace3Ref = useRef<SVGPathElement>(null);
  const pulseRingRef = useRef<SVGCircleElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [posterMode, setPosterMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setIsPlaying(false);
      setPosterMode(true);
    }

    const stageEl = stageRef.current;
    if (!stageEl) return;

    [trace1Ref.current, trace2Ref.current, trace3Ref.current].forEach(p => {
      if (p) {
        const len = p.getTotalLength?.() || 360;
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      }
    });

    const tl = gsap.timeline({
      paused: true,
      onUpdate: () => {
        const t = tl.time();
        setCurrentTime(t);
        const idx = Math.min(HYPER_SCENES.length - 1, Math.floor(t / 3));
        setActiveSceneIdx(idx);
      },
    });

    if (trace1Ref.current) {
      tl.to(trace1Ref.current, { strokeDashoffset: 0, duration: 5.5, ease: 'power2.inOut' }, 0);
    }
    if (trace2Ref.current) {
      tl.to(trace2Ref.current, { strokeDashoffset: 0, duration: 6.5, ease: 'power2.inOut' }, 1.8);
    }
    if (trace3Ref.current) {
      tl.to(trace3Ref.current, { strokeDashoffset: 0, duration: 6.5, ease: 'power2.inOut' }, 4.2);
    }
    if (cubeGroupRef.current) {
      tl.fromTo(
        cubeGroupRef.current,
        { scale: 0.92, rotation: -4, transformOrigin: '50% 50%' },
        { scale: 1.04, rotation: 4, duration: 7.5, ease: 'sine.inOut', yoyo: true, repeat: 1 },
        0
      );
    }
    if (pulseRingRef.current) {
      tl.fromTo(
        pulseRingRef.current,
        { attr: { r: 58 }, opacity: 0.65 },
        { attr: { r: 108 }, opacity: 0.08, duration: 3, ease: 'power2.out', repeat: 4 },
        0
      );
    }

    tlRef.current = tl;
    window.__timelines = window.__timelines || {};
    window.__timelines[HERO_COMP_ID] = tl;

    if (prefersReduced) {
      tl.time(4.5);
    }

    return () => {
      tl.kill();
    };
  }, []);

  // When the user scrolls through the Hero scrub act, let scroll progress nudge the timeline
  useEffect(() => {
    if (
      typeof scrollScrubProgress === 'number' &&
      scrollScrubProgress > 0.02 &&
      scrollScrubProgress < 0.98 &&
      !posterMode &&
      tlRef.current
    ) {
      const targetSec = scrollScrubProgress * TOTAL_DURATION;
      tlRef.current.time(targetSec);
    }
  }, [scrollScrubProgress, posterMode]);

  useEffect(() => {
    if (!isPlaying || posterMode) return;
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTs) * 0.001;
      lastTs = now;
      const tl = tlRef.current;
      if (tl) {
        const nextTime = (tl.time() + dt) % TOTAL_DURATION;
        tl.time(nextTime);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, posterMode]);

  const seekToTime = (targetSec: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION - 0.05, targetSec));
    if (tlRef.current) {
      tlRef.current.time(clamped);
      setCurrentTime(clamped);
      setActiveSceneIdx(Math.min(HYPER_SCENES.length - 1, Math.floor(clamped / 3)));
    }
  };

  const handleSceneSelect = (scene: HyperScene) => {
    setPosterMode(false);
    seekToTime(scene.startSec + 0.8);
  };

  const activeScene = HYPER_SCENES[activeSceneIdx] || HYPER_SCENES[0];
  const progressPct = Math.round((currentTime / TOTAL_DURATION) * 100);

  return (
    <div
      data-testid="hyperframes-showcase"
      className="pointer-events-auto interactive-spotlight-card rounded-2xl border border-emerald-500/30 p-5 sm:p-6 shadow-2xl flex flex-col justify-between gap-5 text-left"
    >
      {/* Top Status Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div
          data-testid="hyperframes-tech-badge"
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#070b0e]/90 border border-slate-800/90 text-xs font-mono"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-slate-400">Motion</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-emerald-400 font-semibold">HyperFrames</span>
        </div>

        <button
          type="button"
          onClick={() => {
            const nextPoster = !posterMode;
            setPosterMode(nextPoster);
            if (nextPoster) {
              setIsPlaying(false);
              seekToTime(4.5);
            } else {
              setIsPlaying(true);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#070b0e] border border-slate-800 hover:border-emerald-500/40 text-xs font-mono text-slate-200 hover:text-white micro-press shrink-0"
          title="Toggle between live motion sequence and static blueprint poster"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>{posterMode ? 'Poster Mode' : 'Live Motion'}</span>
        </button>
      </div>

      {/* Composition Stage */}
      <div
        ref={stageRef}
        data-composition-id={HERO_COMP_ID}
        data-start="0"
        data-width="1920"
        data-height="1080"
        data-duration="15"
        className="relative rounded-xl bg-[#060a0d] border border-slate-800/90 p-5 sm:p-6 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(16,185,129,0.16)_0%,rgba(15,76,92,0.12)_42%,transparent_75%)]"
        />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Left 7 Cols: Active Scene Narrative */}
          <div className="sm:col-span-7 flex flex-col gap-3.5 text-left">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="whitespace-nowrap font-semibold">{activeScene.kicker}</span>
            </div>

            <StaggeredHeading
              as="h2"
              text={activeScene.title}
              className="text-lg sm:text-xl font-bold text-white leading-[1.35]"
            />

            <p className="text-sm text-slate-200 leading-[1.78]">
              {activeScene.caption}
            </p>

            <div className="pt-3 flex items-center gap-5 border-t border-slate-800/80">
              <div className="flex flex-col gap-0.5">
                <div className="text-base font-bold font-mono text-emerald-400 whitespace-nowrap">
                  {activeScene.metricValue}
                </div>
                <div className="text-xs font-mono text-slate-400 whitespace-nowrap">
                  {activeScene.metricLabel}
                </div>
              </div>
              <div className="h-7 w-px bg-slate-800 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <div className="text-base font-bold font-mono text-white whitespace-nowrap">
                  Unified Core
                </div>
                <div className="text-xs font-mono text-slate-400 whitespace-nowrap">
                  Connected Ecosystem
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Animated Isometric Cube & Circuit Graphic + Trever Logo Mark */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <svg
                viewBox="0 0 240 240"
                className="w-full h-full overflow-visible"
                aria-label="Trever Isometric Cube and Circuit Animation"
              >
                <defs>
                  <linearGradient id="hfTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f4c5c" />
                    <stop offset="100%" stopColor="#082832" />
                  </linearGradient>
                  <linearGradient id="hfEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                <circle
                  ref={pulseRingRef}
                  cx="120"
                  cy="120"
                  r="64"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                  opacity="0.35"
                />

                <g ref={cubeGroupRef}>
                  <polygon
                    points="120,38 188,78 120,118 52,78"
                    fill="url(#hfEmeraldGrad)"
                    fillOpacity="0.28"
                    stroke="#34d399"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="52,78 120,118 120,198 52,158"
                    fill="url(#hfTealGrad)"
                    fillOpacity="0.78"
                    stroke="#0f4c5c"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="188,78 120,118 120,198 188,158"
                    fill="#111b22"
                    fillOpacity="0.88"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />

                  <path
                    ref={trace1Ref}
                    d="M 120,38 L 120,118 L 188,78 L 188,158 L 120,198"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <path
                    ref={trace2Ref}
                    d="M 86,58 L 120,78 L 154,58 M 86,138 L 120,158 L 154,138"
                    fill="none"
                    stroke="#6ee7b7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    ref={trace3Ref}
                    d="M 52,118 L 92,142 L 92,182 M 188,118 L 148,142 L 148,182"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {[
                    [120, 38],
                    [188, 78],
                    [52, 78],
                    [120, 118],
                    [120, 198],
                    [92, 142],
                    [148, 142],
                  ].map(([cx, cy], idx) => (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#34d399"
                      stroke="#070b0e"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-11 h-11 rounded-xl bg-[#070b0e]/92 border border-emerald-400/50 p-1.5 shadow-lg flex items-center justify-center">
                  <img
                    src="/assets/trever-logo.png"
                    alt="Trever Cube Logo"
                    width="36"
                    height="36"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Controls */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (posterMode) setPosterMode(false);
              setIsPlaying(prev => !prev);
            }}
            aria-label={isPlaying && !posterMode ? 'Pause motion sequence' : 'Play motion sequence'}
            data-testid="hyperframes-play-toggle"
            className="p-2 rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 micro-press shrink-0"
          >
            {isPlaying && !posterMode ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>

          <div
            role="slider"
            tabIndex={0}
            aria-label="Motion sequence scrubber"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setPosterMode(false);
              seekToTime(ratio * TOTAL_DURATION);
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                seekToTime(currentTime + 1.5);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                seekToTime(currentTime - 1.5);
              }
            }}
            className="relative flex-1 h-2 bg-slate-800/90 rounded-full overflow-hidden cursor-pointer group"
          >
            <div
              className="h-full bg-emerald-400 transition-transform duration-75 origin-left"
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setPosterMode(false);
              seekToTime(0);
              setIsPlaying(true);
            }}
            aria-label="Restart motion sequence"
            className="p-2 rounded-lg bg-[#070b0e] border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 micro-press shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Interactive Scene Chapter Selectors */}
        <div className="grid grid-cols-5 gap-1.5">
          {HYPER_SCENES.map(scene => {
            const isSelected = scene.index === activeSceneIdx;
            return (
              <button
                key={scene.code}
                type="button"
                onClick={() => handleSceneSelect(scene)}
                className={`px-2 py-1.5 rounded-lg text-left border micro-press transition-colors ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-400/60 text-white'
                    : 'bg-[#070b0e]/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                  {scene.code}
                </div>
                <div className="text-[10px] font-medium truncate mt-0.5">
                  {scene.shortLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
