import React, { useState } from 'react';
import { TREVER_PROJECTS, CaseStudy } from '../utils/projectsData';
import { ArrowUpRight, CheckCircle2, X, Layers, ArrowRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import StaggeredHeading from './StaggeredHeading';

const SHORT_HEADINGS: Record<string, string> = {
  'enterprise-operations-platform': 'Enterprise Core',
  'connected-mobile-product-suite': 'Mobile Suite',
  'applied-ai-data-pipeline': 'AI Pipeline',
  'cloud-modernization-foundation': 'Cloud Migration',
};

export default function WorkSection() {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);

  React.useEffect(() => {
    if (!selectedCaseStudy) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCaseStudy(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCaseStudy]);

  return (
    <section
      id="work"
      aria-label="Reference Software Architecture Blueprints"
      data-sc-act="pan"
      data-sc-span="3.6"
      data-sc-drift="#0b1319"
      className="relative z-10 bg-transparent border-t border-slate-800/60"
    >
      <div
        data-sc-stage
        className="sc-stage flex flex-col justify-center py-10"
      >
        {/* Horizontal Lateral Pan Rail driven by Scroll Craft */}
        <div
          data-testid="work-pan-rail"
          data-sc-pan="0.06"
          className="trever-pan-rail items-stretch"
        >
          {/* Item 0: Lead Rail Introduction (Always present at p=0 per devices.md §3) */}
          <div className="w-[clamp(21rem,29vw,26rem)] shrink-0 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#070b0e]/90 border border-slate-800/90 text-left">
            <div className="flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Layers className="w-4 h-4 shrink-0" />
                <span>SYSTEM BLUEPRINTS</span>
              </div>
              <StaggeredHeading
                as="h2"
                text="Production architectures built for scale."
                className="sc-display sc-display--md font-extrabold text-white leading-[1.26]"
              />
              <p className="text-sm sm:text-base text-slate-200 leading-[1.82]">
                Representative software system blueprints showing how Trever combines backend engineering, mobile apps, cloud infrastructure, and applied AI.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/80">
              <div className="text-xs font-mono text-slate-300 leading-relaxed">
                Scroll vertically to traverse blueprints laterally, or select any card to inspect full system architecture.
              </div>
            </div>
          </div>

          {/* Items 1..4: The 4 Architectural Blueprint Articles */}
          {TREVER_PROJECTS.map((project, idx) => (
            <article
              key={project.id}
              data-testid={`project-card-${project.id}`}
              className="trever-pan-card flex"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCaseStudy(project)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCaseStudy(project);
                  }
                }}
                className="w-full interactive-spotlight-card rounded-2xl p-6 sm:p-7 cursor-pointer flex flex-col justify-between gap-5 group text-left"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-400">
                    <span className="text-emerald-400 font-semibold">
                      BLUEPRINT 0{idx + 1} · {project.category.toUpperCase()}
                    </span>
                  </div>

                  {/* Short 2-word heading per devices.md §3 */}
                  <div className="flex flex-col gap-1.5">
                    <StaggeredHeading
                      as="h3"
                      text={SHORT_HEADINGS[project.id] || project.category}
                      className="text-2xl font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-[1.3]"
                    />
                    <div className="text-sm font-semibold text-slate-200 leading-snug">
                      {project.title}
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-200 leading-[1.8]">
                    {project.summary}
                  </p>

                  {/* Factual Museum-Style Spec Grid */}
                  <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl bg-[#070b0e]/90 border border-slate-800/85">
                    {project.impactMetrics.map((metric, mIdx) => (
                      <div key={mIdx} className="flex flex-col gap-1">
                        <div className="text-[11px] font-mono text-slate-400">
                          {metric.label}
                        </div>
                        <div className="text-xs sm:text-sm font-bold font-mono text-emerald-400">
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/75 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono text-slate-400 truncate">
                    {project.techStack.slice(0, 4).join(' · ')}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 whitespace-nowrap shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          ))}

          {/* Item 5: Closing Resolution Card in Rail (ensures healthy overflow and clean resolution) */}
          <div className="w-[clamp(20rem,28vw,25rem)] shrink-0 flex flex-col justify-between p-6 sm:p-7 rounded-2xl spatial-card text-left">
            <div className="flex flex-col gap-4">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                Custom Architecture
              </div>
              <StaggeredHeading
                as="h3"
                text="Need a tailored software system?"
                className="text-xl font-bold text-white leading-[1.35]"
              />
              <p className="text-sm sm:text-base text-slate-200 leading-[1.8]">
                Every Trever engagement begins with your domain requirements, existing systems, and operational goals.
              </p>
            </div>

            <div className="pt-5 border-t border-slate-800/80">
              <MagneticButton
                href="#contact"
                strength={0.22}
                className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
              >
                <span>Get Demo</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Case Study / Blueprint Detail Modal */}
      {selectedCaseStudy && (
        <div
          onClick={() => setSelectedCaseStudy(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05080a]/90 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar spatial-card border border-emerald-500/40 bg-[#0b1116] rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 cursor-default text-left"
          >
            <button
              type="button"
              onClick={() => setSelectedCaseStudy(null)}
              aria-label="Close Blueprint"
              className="absolute top-5 right-5 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white micro-press"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                {selectedCaseStudy.clientIndustry} · {selectedCaseStudy.category}
              </div>
              <StaggeredHeading
                as="h3"
                text={selectedCaseStudy.title}
                className="text-2xl sm:text-3xl font-bold text-white leading-[1.3]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              {selectedCaseStudy.impactMetrics.map((metric, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {metric.value}
                  </div>
                  <div className="text-xs text-slate-400">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Problem Context</h4>
                <p className="text-sm text-slate-200 leading-[1.8]">{selectedCaseStudy.challenge}</p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
                <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Trever Architecture</h4>
                <p className="text-sm text-slate-200 leading-[1.8]">{selectedCaseStudy.solution}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">System Highlights</h4>
              <div className="flex flex-col gap-2.5">
                {selectedCaseStudy.architectureHighlights.map((arch, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-sm text-slate-200 leading-relaxed flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{arch}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setSelectedCaseStudy(null)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white micro-press"
              >
                Close Blueprint
              </button>
              <MagneticButton
                href="#contact"
                onClick={() => setSelectedCaseStudy(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
              >
                <span>Get Demo</span>
                <ArrowUpRight className="w-4 h-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
