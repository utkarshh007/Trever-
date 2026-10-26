import React from 'react';
import { Cpu, Lock, Rocket, Zap } from 'lucide-react';
import InteractiveCard from './InteractiveCard';
import StaggeredHeading from './StaggeredHeading';

export default function AboutSection() {
  return (
    <section
      id="about"
      data-sc-act="flow"
      className="relative z-10 py-16 lg:py-24 bg-transparent border-t border-slate-800/60"
    >
      <div className="sc-wrap max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Story & Philosophy */}
          <div
            data-sc-in
            data-sc-stagger="60"
            className="lg:col-span-5 flex flex-col gap-6 text-left"
          >
            <StaggeredHeading
              as="h2"
              text="Built by engineers who stay close to the code."
              className="sc-display sc-display--md font-extrabold text-white"
            />

            <p className="sc-body text-slate-200 text-base leading-[1.84] max-w-[60ch]">
              Trever is a software development company founded on architectural clarity, clean modular code, and transparent execution. We partner with organizations to build new digital products, connect complex software ecosystems, and modernize legacy systems.
            </p>

            <p className="sc-body text-slate-300 text-base leading-[1.84] max-w-[60ch]">
              Every project is structured around direct collaboration between software architects, product designers, cloud engineers, and quality specialists from initial discovery through ongoing support.
            </p>
          </div>

          {/* Right Column: Asymmetric 2x2 Engineering Principles */}
          <div
            data-sc-in
            data-sc-stagger="60"
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <InteractiveCard className="group p-6 sm:p-7 rounded-2xl flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#070b0e] border border-slate-800 text-emerald-400 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <StaggeredHeading
                  as="h3"
                  text="Modular Domain Boundaries"
                  className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors"
                />
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-[1.8]">
                Decoupled software services with clear contracts make your platform straightforward to extend, test, and maintain over years of growth.
              </p>
            </InteractiveCard>

            <InteractiveCard className="group p-6 sm:p-7 rounded-2xl flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#070b0e] border border-slate-800 text-emerald-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <StaggeredHeading
                  as="h3"
                  text="Security by Design"
                  className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors"
                />
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-[1.8]">
                From threat modeling and application security reviews to hardened authentication and dependency audits, security is built into every release.
              </p>
            </InteractiveCard>

            <InteractiveCard className="group p-6 sm:p-7 rounded-2xl flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#070b0e] border border-slate-800 text-emerald-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <StaggeredHeading
                  as="h3"
                  text="Operational Clarity"
                  className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors"
                />
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-[1.8]">
                We focus on tangible engineering improvements: eliminating manual workflow bottlenecks, unifying scattered data, and stabilizing slow systems.
              </p>
            </InteractiveCard>

            <InteractiveCard className="group p-6 sm:p-7 rounded-2xl flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#070b0e] border border-slate-800 text-emerald-400 shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <StaggeredHeading
                  as="h3"
                  text="Repeatable Delivery"
                  className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors"
                />
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-[1.8]">
                Automated CI/CD pipelines, infrastructure as code, and ongoing maintenance workflows keep production deployments predictable.
              </p>
            </InteractiveCard>
          </div>
        </div>
      </div>
    </section>
  );
}
