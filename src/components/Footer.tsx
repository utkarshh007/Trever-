import React from 'react';
import { ArrowUpRight, Linkedin, MapPin } from 'lucide-react';
import StaggeredHeading from './StaggeredHeading';

export default function Footer() {
  return (
    <section
      id="finale"
      aria-label="Get Demo and Footer"
      data-sc-act="pin"
      data-sc-span="1.25"
      data-sc-drift="#070b0e"
      className="relative z-10 bg-[#070b0e] border-t border-slate-800/80"
    >
      <div
        data-sc-stage
        data-sc-spotlight
        className="sc-stage flex flex-col justify-between py-10 sm:py-14 px-6"
      >
        {/* Top / Center Closing Resolve Stage (Hold cue so it stays 100% visible at the end of scroll) */}
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="spatial-card rounded-3xl p-8 sm:p-12 lg:p-14 border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-left">
            <div className="flex flex-col gap-5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>READY WHEN YOU ARE</span>
              </div>

              <StaggeredHeading
                as="h2"
                text="Ready to architect software that holds up in production?"
                className="sc-display sc-display--md font-extrabold text-white leading-[1.24]"
              />

              <p className="text-base sm:text-lg text-slate-200 leading-[1.82] max-w-[60ch]">
                Whether you are launching a new platform, building a native mobile application, integrating AI workflows, or modernizing legacy infrastructure, Trever’s engineering team is ready to partner with you.
              </p>
            </div>

            {/* Scroll Craft Magnetic CTA with data-sc-rise="0" per devices.md §9 */}
            <div className="shrink-0">
              <a
                href="#contact"
                data-sc-magnet="0.28"
                data-sc-rise="0"
                className="inline-flex items-center gap-3 px-7 py-4 text-sm sm:text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors whitespace-nowrap shadow-lg"
              >
                <span>Get Demo</span>
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Integrated Colophon Footer inside the Final Stage (no dead tail after the CTA) */}
        <footer className="max-w-7xl w-full mx-auto pt-8 border-t border-slate-800/80 text-slate-400 text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-6">
            <div className="md:col-span-5 flex flex-col gap-3.5">
              <a href="#top" className="inline-flex items-center gap-3 group">
                <img
                  src="/assets/trever-logo.png"
                  alt="Trever Logo"
                  width="32"
                  height="32"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
                />
                <span className="text-xl font-bold text-white">TREVER</span>
              </a>
              <p className="text-sm text-slate-300 leading-[1.8] max-w-[46ch]">
                Custom software development, web and mobile applications, UI/UX design, AI integrations, cloud architecture, cybersecurity, and end-to-end delivery.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Sections
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-sm text-slate-300">
                <a href="#architecture" className="hover:text-emerald-400 transition-colors">
                  Architecture Thesis
                </a>
                <a href="#services" className="hover:text-emerald-400 transition-colors">
                  12 Core Services
                </a>
                <a href="#work" className="hover:text-emerald-400 transition-colors">
                  System Blueprints
                </a>
                <a href="#process" className="hover:text-emerald-400 transition-colors">
                  Delivery Pipeline
                </a>
                <a href="#about" className="hover:text-emerald-400 transition-colors">
                  About Trever
                </a>
                <a href="#contact" className="hover:text-emerald-400 transition-colors">
                  Get Demo
                </a>
              </div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-3">
              <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Contact &amp; Location
              </div>
              <div className="text-sm flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-white">Gurugram</span>
                </div>
                <div>
                  <a href="mailto:hello@trever.dev" className="text-emerald-400 font-mono hover:underline">
                    hello@trever.dev
                  </a>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://www.linkedin.com/company/trever-si"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#090e12] border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                    aria-label="Trever LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs">linkedin.com/company/trever-si</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>© {new Date().getFullYear()} Trever. All rights reserved.</div>
            <div className="flex items-center gap-4 text-xs">
              <a href="#contact" className="hover:text-white">Privacy Policy</a>
              <span aria-hidden="true">·</span>
              <a href="#contact" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
