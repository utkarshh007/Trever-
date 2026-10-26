import React, { useEffect } from 'react';
import ScrollTimelineBackground from './components/ScrollTimelineBackground';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductTimelineSection from './components/ProductTimelineSection';
import ServicesSection from './components/ServicesSection';
import WorkSection from './components/WorkSection';
import AboutSection from './components/AboutSection';
import ProcessSection from './components/ProcessSection';
import EstimatorContactSection from './components/EstimatorContactSection';
import Footer from './components/Footer';

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root?: HTMLElement) => {
        layout: () => void;
        read: () => void;
        destroy: () => void;
      };
      reduce: boolean;
      instances: Array<{
        layout: () => void;
        read: () => void;
        destroy: () => void;
      }>;
    };
  }
}

export default function App() {
  useEffect(() => {
    if (!window.ScrollCraft) return;
    // Clean up any existing instances before mounting
    while (window.ScrollCraft.instances.length > 0) {
      const prev = window.ScrollCraft.instances[0];
      prev.destroy();
    }
    const instance = window.ScrollCraft.mount(document.body);
    const timer = window.setTimeout(() => {
      instance.layout();
      instance.read();
    }, 150);

    return () => {
      window.clearTimeout(timer);
      instance.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#070b0e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Scroll Craft top progress indicator & film grain */}
      <span data-sc-progress aria-hidden="true" />
      <div className="sc-grain" aria-hidden="true" />

      {/* Full-Website Scroll-Driven 3D + GSAP Product Timeline Background */}
      <ScrollTimelineBackground />

      <Header />
      <main id="main-content" className="relative z-10 flex-grow">
        <Hero />
        <ProductTimelineSection />
        <ServicesSection />
        <WorkSection />
        <ProcessSection />
        <AboutSection />
        <EstimatorContactSection />
      </main>
      <Footer />
    </div>
  );
}

