import React, { useEffect, useState } from 'react';
import {
  calculateScrollProgress,
  getTimelineStageForProgress,
  PRODUCT_TIMELINE_STAGES,
  TimelineStage,
} from '../utils/scrollProgress';
import { Cpu, Layers, ShieldCheck, Activity, GitBranch, Globe } from 'lucide-react';
import InteractiveCard from './InteractiveCard';
import StaggeredHeading from './StaggeredHeading';

const STAGE_ICONS = [
  <Cpu className="w-5 h-5 text-emerald-400" />,
  <GitBranch className="w-5 h-5 text-emerald-400" />,
  <Layers className="w-5 h-5 text-emerald-400" />,
  <Activity className="w-5 h-5 text-emerald-400" />,
  <ShieldCheck className="w-5 h-5 text-emerald-400" />,
  <Globe className="w-5 h-5 text-emerald-400" />,
];

export default function ProductTimelineSection() {
  const [activeStage, setActiveStage] = useState<TimelineStage>(PRODUCT_TIMELINE_STAGES[0]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight || 0;
      const clientHeight = window.innerHeight || doc.clientHeight || 0;
      const p = calculateScrollProgress(scrollTop, scrollHeight, clientHeight);
      const { stage } = getTimelineStageForProgress(p);
      setActiveStage(stage);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jumpToStageScroll = (stage: TimelineStage) => {
    const doc = document.documentElement;
    const maxScroll = Math.max(0, (doc.scrollHeight || 0) - (window.innerHeight || 0));
    const targetProgress = (stage.range[0] + stage.range[1]) * 0.5;
    window.scrollTo({
      top: Math.round(maxScroll * targetProgress),
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="architecture"
      aria-label="Product Architecture Thesis"
      data-sc-act="flow"
      data-sc-drift="#091015"
      className="relative z-10 py-20 lg:py-28 bg-transparent border-t border-slate-800/60"
    >
      <div className="sc-wrap max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left 5 Cols: The Architectural Tension & Thesis */}
          <div
            data-sc-in
            data-sc-stagger="70"
            className="lg:col-span-5 flex flex-col gap-6 text-left"
          >
            <StaggeredHeading
              as="h2"
              text="Fragmented software slows teams down. Unified architecture compounds."
              className="sc-display sc-display--md font-extrabold text-white leading-[1.26]"
            />

            <p className="sc-body text-slate-200 leading-[1.82]">
              Most software debt starts when design, backend engineering, mobile apps, and cloud security are handed to disconnected teams. Interfaces drift from APIs, legacy databases bottleneck new features, and every release requires manual intervention.
            </p>

            <p className="sc-body text-slate-200 leading-[1.82]">
              Trever approaches software as one connected system. Every engagement progresses through six architectural layers—from a strictly typed domain kernel and modular service mesh to automated verification gates and multi-region production operations.
            </p>

            {/* Stage Selector Rail */}
            <div className="pt-2 flex flex-col gap-3">
              {PRODUCT_TIMELINE_STAGES.map(stage => {
                const isSelected = stage.index === activeStage.index;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      setActiveStage(stage);
                      jumpToStageScroll(stage);
                    }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border micro-press flex items-start justify-between gap-4 group ${
                      isSelected
                        ? 'spatial-card border-emerald-400/60 text-white'
                        : 'bg-[#090e12]/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="text-xs font-mono font-semibold text-emerald-400 shrink-0 tabular-nums mt-0.5">
                        {stage.code}
                      </span>
                      <div className="min-w-0 flex flex-col gap-1">
                        <div className="text-sm font-bold leading-snug">{stage.title}</div>
                        <div className="text-xs text-slate-400 leading-relaxed">{stage.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 shrink-0 mt-0.5">
                      {stage.architectureState}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 7 Cols: Active Architecture Specification */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <InteractiveCard className="rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-7 text-left">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#070b0e] border border-slate-800 shrink-0">
                    {STAGE_ICONS[activeStage.index]}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs font-mono text-emerald-400">
                      {activeStage.architectureState}
                    </div>
                    <StaggeredHeading
                      as="h3"
                      text={activeStage.title}
                      className="text-2xl font-bold text-white leading-[1.32]"
                    />
                  </div>
                </div>

                <span className="px-3 py-1 rounded-lg bg-[#070b0e] border border-slate-800 text-xs font-mono text-emerald-400">
                  Layer {activeStage.code}
                </span>
              </div>

              <p className="text-base text-slate-200 leading-[1.82]">
                {activeStage.description}
              </p>

              {/* Authentic Architectural Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#070b0e]/90 border border-slate-800/80 flex flex-col gap-1.5">
                  <div className="text-xs text-slate-400">Structural Focus</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-white leading-relaxed">
                    {activeStage.subtitle}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#070b0e]/90 border border-slate-800/80 flex flex-col gap-1.5">
                  <div className="text-xs text-slate-400">System Guarantee</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-emerald-400 leading-relaxed">
                    {activeStage.latencyMetric}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#070b0e]/90 border border-slate-800/80 flex flex-col gap-1.5">
                  <div className="text-xs text-slate-400">Engineering Standard</div>
                  <div className="text-sm sm:text-base font-bold font-mono text-white leading-relaxed">
                    {activeStage.throughputMetric}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span>
                  Explore how these architectural layers connect across all twelve Trever engineering disciplines.
                </span>
                <a
                  href="#services"
                  className="text-emerald-400 hover:text-emerald-300 font-mono font-semibold whitespace-nowrap"
                >
                  Explore 12 Services ↓
                </a>
              </div>
            </InteractiveCard>
          </div>
        </div>
      </div>
    </section>
  );
}
