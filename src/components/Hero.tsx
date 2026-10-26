import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import HyperFramesShowcase from './HyperFramesShowcase';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [heroProgress, setHeroProgress] = useState<number>(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const syncProgress = () => {
      const raw = el.style.getPropertyValue('--sc-p');
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        setHeroProgress(parsed);
      }
    };

    syncProgress();
    const observer = new MutationObserver(syncProgress);
    observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('scroll', syncProgress, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', syncProgress);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      data-sc-act="scrub"
      data-sc-span="2.1"
      data-sc-dwell="0.32"
      data-sc-drift="#070b0e"
      className="relative z-10 bg-transparent"
    >
      <div
        data-sc-stage
        className="sc-stage hero-stage flex items-center justify-center pt-24 pb-10 lg:pt-20 lg:pb-12"
      >
        {/* PLANE 1 (Rear Depth Layer): Isometric Architectural Horizon Grid */}
        <div
          aria-hidden="true"
          data-sc-parallax="-1.25"
          className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-45"
        >
          <svg
            viewBox="0 0 1600 900"
            className="w-[1600px] max-w-none h-[900px]"
            fill="none"
          >
            <g stroke="#0f4c5c" strokeWidth="1" opacity="0.55">
              <path d="M 120 140 L 680 140 L 820 280 L 1480 280" />
              <path d="M 180 760 L 620 760 L 780 600 L 1440 600" />
              <circle cx="800" cy="450" r="340" strokeDasharray="3 11" />
              <circle cx="800" cy="450" r="230" stroke="#10b981" strokeOpacity="0.25" />
            </g>
          </svg>
        </div>

        {/* PLANE 2 (Mid-Back Atmospheric & Circuit Plane): Moves at -0.55 rate */}
        <div
          aria-hidden="true"
          data-sc-parallax="-0.55"
          className="absolute inset-0 pointer-events-none flex items-center justify-end pr-[8%] opacity-65"
        >
          <div className="w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16)_0%,rgba(15,76,92,0.14)_45%,transparent_72%)]" />
        </div>

        {/* Corner & Lead Scrims protecting the Hero Copy Block from colliding with 3D background artwork */}
        <div className="sc-scrim sc-scrim--lead" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(180deg,rgba(7,11,14,0.94)_0%,rgba(7,11,14,0.88)_55%,rgba(7,11,14,0.48)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,11,14,0.96)_0%,rgba(7,11,14,0.90)_36%,rgba(7,11,14,0.42)_54%,transparent_76%)]"
        />

        {/* Main Multi-Plane Content Grid (1x Copy Plane + -0.18 Focal Subject Plane) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* PLANE 3 (1x Copy Layer): Greet cue (0 0.92 0) so headline is 100% visible on load */}
            <div
              data-sc-cue="0 0.92 0"
              className="lg:col-span-6 xl:col-span-7 hero-copy-stack"
            >
              <div className="inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.14em] text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Custom Software &amp; Cloud Engineering</span>
              </div>

              <h1 className="sc-display sc-display--xl hero-headline">
                We engineer software systems built to endure.
              </h1>

              <p className="sc-lede hero-lede">
                Trever designs and builds custom business platforms, web and mobile applications, cloud infrastructure, and applied AI systems for teams that need dependable architecture.
              </p>

              {/* Unified Primary CTA + Secondary Services Link */}
              <div className="hero-cta-row">
                <MagneticButton
                  href="#contact"
                  testId="hero-cta-primary"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shrink-0 group shadow-lg"
                >
                  <span>Get Demo</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1" />
                </MagneticButton>

                <MagneticButton
                  href="#services"
                  testId="hero-cta-secondary"
                  strength={0.24}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#0b1318]/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-400/50 rounded-xl transition-colors whitespace-nowrap shrink-0 group"
                >
                  <span>Explore 12 services</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                </MagneticButton>
              </div>
            </div>

            {/* PLANE 4 (Focal Subject Plane at -0.18 rate): HyperFrames Cube & Circuit Stage */}
            <div
              data-sc-parallax="-0.18"
              className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center"
            >
              <HyperFramesShowcase scrollScrubProgress={heroProgress} />
            </div>
          </div>
        </div>

        {/* PLANE 5 (Foreground Overtaking Framing Plane at +0.35 rate + Solid Floor Fade) */}
        <div
          aria-hidden="true"
          data-sc-parallax="0.35"
          className="hidden lg:flex absolute bottom-8 left-0 right-0 z-30 pointer-events-none justify-between items-end max-w-7xl mx-auto px-6 opacity-80"
        >
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-[#070b0e]/90 border border-slate-800/90 text-[11px] font-mono text-slate-300">
            <span className="text-emerald-400 font-semibold">12 CORE DISCIPLINES</span>
            <span aria-hidden="true">·</span>
            <span>CUSTOM SOFTWARE, WEB, MOBILE, CLOUD &amp; AI</span>
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-[#070b0e]/90 border border-slate-800/90 text-[11px] font-mono text-slate-300">
            <span>5-PHASE DELIVERY</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">END-TO-END ARCHITECTURE</span>
          </div>
        </div>

        {/* Section Floor Gradient Fade hiding plane clip boundary (per devices.md §6) */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-20 bg-gradient-to-t from-[#070b0e] to-transparent"
        />
      </div>
    </section>
  );
}
