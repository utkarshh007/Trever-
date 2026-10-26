import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import MagneticButton from './MagneticButton';

const NAV_ITEMS = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Blueprints' },
  { id: 'process', label: 'Process' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      let current = '';
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 260 && rect.bottom >= 160) {
            current = item.id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/75 bg-[#070b0e]/92">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single element brand wordmark with Trever logo */}
        <a href="#top" className="flex items-center gap-3 shrink-0 group whitespace-nowrap">
          <img
            src="/assets/trever-logo.png"
            alt="Trever Logo"
            width="32"
            height="32"
            referrerPolicy="no-referrer"
            className="w-8 h-8 object-contain transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
          />
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap transition-colors duration-150 group-hover:text-emerald-300">
            TREVER
          </span>
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link-emil whitespace-nowrap shrink-0 ${
                  isActive ? 'text-emerald-400 font-semibold' : 'hover:text-white'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action button with unified CTA label ("Get Demo") */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <MagneticButton
            href="#contact"
            testId="header-cta-magnetic"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 group"
          >
            <span>Get Demo</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </MagneticButton>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white micro-press"
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#070b0e] px-6 py-6 space-y-4">
          {NAV_ITEMS.map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-200 hover:text-emerald-400"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-200 hover:text-emerald-400"
          >
            About Trever
          </a>
          <MagneticButton
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 text-sm font-semibold text-slate-950 bg-emerald-400 rounded-lg"
          >
            <span>Get Demo</span>
            <ArrowUpRight className="w-4 h-4" />
          </MagneticButton>
        </div>
      )}
    </header>
  );
}
