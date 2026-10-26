import React, { useState } from 'react';
import { TREVER_SERVICES } from '../utils/servicesData';
import { calculateProjectScope } from '../utils/calculator';
import { validateInquiryForm, InquiryFormData, ValidationErrors } from '../utils/validation';
import { WorkspaceInquiryPayload } from '../utils/workspaceApi';
import {
  CheckCircle2,
  Mail,
  MapPin,
  Send,
  AlertCircle,
  Linkedin,
} from 'lucide-react';
import MagneticButton from './MagneticButton';
import StaggeredHeading from './StaggeredHeading';

export default function EstimatorContactSection() {
  const [formData, setFormData] = useState<InquiryFormData>({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    projectDescription: '',
    selectedServices: ['custom-software', 'web-dev'],
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const estimate = calculateProjectScope({
    selectedServiceIds: formData.selectedServices,
    complexity: 'growth',
    platformTargets: ['web', 'cloud'],
    requiresMaintenance: true,
    urgentTimeline: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateInquiryForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    setFormData(validation.sanitizedData);
    setErrors({});

    const serviceTitles = validation.sanitizedData.selectedServices.map(
      id => TREVER_SERVICES.find(s => s.id === id)?.title || id
    );
    const teamSummary = estimate.recommendedTeam
      .map(m => `${m.role} (×${m.count})`)
      .join(', ');

    const payload: WorkspaceInquiryPayload = {
      fullName: validation.sanitizedData.fullName,
      email: validation.sanitizedData.email,
      companyName: validation.sanitizedData.companyName,
      phone: validation.sanitizedData.phone,
      projectDescription: validation.sanitizedData.projectDescription,
      selectedServices: serviceTitles,
      complexity: 'growth',
      platforms: ['web', 'cloud'],
      estimatedWeeksMin: estimate.estimatedWeeksMin,
      estimatedWeeksMax: estimate.estimatedWeeksMax,
      estimatedCostRange: estimate.estimatedCostRange,
      recommendedTeamSummary: teamSummary,
      submittedAtIso: new Date().toISOString(),
    };

    try {
      await fetch('/api/inquiries/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Background server logging handled silently
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <section
      id="contact"
      data-sc-act="flow"
      data-sc-drift="#080e13"
      className="relative z-10 py-16 lg:py-24 bg-transparent border-t border-slate-800/60"
    >
      <div className="sc-wrap max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Demo Walkthrough Overview & Direct Contact Details */}
          <div
            data-sc-in
            data-sc-stagger="60"
            className="lg:col-span-5 flex flex-col gap-8 text-left"
          >
            <div className="flex flex-col gap-5">
              <StaggeredHeading
                as="h2"
                text="Schedule an architectural walkthrough or get a demo."
                className="sc-display sc-display--md font-extrabold text-white"
              />
              <p className="sc-body text-slate-300 text-base sm:text-lg leading-[1.82] max-w-[60ch]">
                Connect directly with our software architects and engineering leads to review reference blueprints, discuss your technical requirements, and see how Trever builds production-grade platforms.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl spatial-card flex flex-col gap-5">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3.5">
                Direct Contact Information
              </h3>
              <div className="flex flex-col gap-4 text-sm text-slate-300">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-[#070b0e] border border-slate-800 text-emerald-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="text-xs text-slate-400">Email</div>
                    <a
                      href="mailto:hello@trever.dev"
                      className="text-white hover:text-emerald-400 font-mono truncate block"
                    >
                      hello@trever.dev
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-[#070b0e] border border-slate-800 text-emerald-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="text-xs text-slate-400">Company Address</div>
                    <div className="text-white font-mono">Gurugram</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-lg bg-[#070b0e] border border-slate-800 text-emerald-400 shrink-0">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="text-xs text-slate-400">LinkedIn</div>
                    <a
                      href="https://www.linkedin.com/company/trever-si"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-emerald-400 font-mono truncate block"
                    >
                      linkedin.com/company/trever-si
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Get Demo Form */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="spatial-card rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
              <div className="border-b border-slate-800 pb-4 flex flex-col gap-1.5">
                <StaggeredHeading
                  as="h3"
                  text="Get a Demo with Trever"
                  className="text-xl font-bold text-white"
                />
                <p className="text-sm text-slate-300 leading-[1.75]">
                  Share your project goals and technical requirements below.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col gap-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Demo Request Received</h4>
                  <p className="text-sm text-slate-200 leading-[1.8] text-left">
                    Thank you, <span className="font-semibold text-emerald-300">{formData.fullName}</span>. Our engineering team will review your request and follow up at <span className="font-semibold text-emerald-300">{formData.email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        companyName: '',
                        phone: '',
                        projectDescription: '',
                        selectedServices: ['custom-software', 'web-dev'],
                      });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white underline micro-press"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="full-name" className="text-xs font-mono text-slate-300 block">
                        Full Name <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        id="full-name"
                        type="text"
                        maxLength={100}
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Alex Vance"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#070b0e] border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors ${
                          errors.fullName ? 'border-red-500' : 'border-slate-800'
                        }`}
                      />
                      {errors.fullName && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="work-email" className="text-xs font-mono text-slate-300 block">
                        Work Email <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        id="work-email"
                        type="email"
                        maxLength={254}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. alex@company.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#070b0e] border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors ${
                          errors.email ? 'border-red-500' : 'border-slate-800'
                        }`}
                      />
                      {errors.email && (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="company-name" className="text-xs font-mono text-slate-300 block">
                        Company / Organization
                      </label>
                      <input
                        id="company-name"
                        type="text"
                        maxLength={120}
                        value={formData.companyName}
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. Acme Systems"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b0e] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone-number" className="text-xs font-mono text-slate-300 block">
                        Telephone (Optional)
                      </label>
                      <input
                        id="phone-number"
                        type="tel"
                        maxLength={30}
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#070b0e] border text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors ${
                          errors.phone ? 'border-red-500' : 'border-slate-800'
                        }`}
                      />
                      {errors.phone && <span className="text-xs text-red-400">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="project-brief" className="text-xs font-mono text-slate-300 block">
                      Project Brief &amp; Goals <span className="text-emerald-400">*</span>
                    </label>
                    <textarea
                      id="project-brief"
                      rows={4}
                      maxLength={5000}
                      value={formData.projectDescription}
                      onChange={e => setFormData({ ...formData, projectDescription: e.target.value })}
                      placeholder="Describe what you want to build, key outcomes, target timeline, or existing systems involved..."
                      className={`w-full px-3.5 py-3 rounded-xl bg-[#070b0e] border text-sm leading-[1.7] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors no-scrollbar ${
                        errors.projectDescription ? 'border-red-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.projectDescription && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.projectDescription}
                      </span>
                    )}
                  </div>

                  <MagneticButton
                    type="submit"
                    disabled={isSubmitting}
                    testId="estimator-submit-magnetic"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors disabled:opacity-50 group"
                  >
                    {isSubmitting ? (
                      <span>Validating &amp; Sending...</span>
                    ) : (
                      <>
                        <span>Get Demo</span>
                        <Send className="w-4 h-4 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </>
                    )}
                  </MagneticButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
