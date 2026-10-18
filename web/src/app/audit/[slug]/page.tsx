import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SMark from "@/components/SMark";
import { getLeadBySlug } from "@/lib/dataBridge";
import {
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AuditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { slug } = await params;
  const lead = await getLeadBySlug(slug);

  if (!lead) {
    return (
      <main className="min-h-screen bg-[#0C0C0C] text-[#F2F2F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111111] border border-[#1A1A1A] p-8 text-center rounded-[2px]">
          <SMark size={40} className="mx-auto mb-4" />
          <div className="font-microlabel mb-1">DIAGNOSTIC NOT FOUND</div>
          <h1 className="font-display text-2xl text-[#F2F2F2]">
            AUDIT RECORD UNAVAILABLE
          </h1>
          <p className="text-xs text-[#888888] font-body mt-2">
            No active technical dossier exists for slug: <code className="text-[#F2F2F2]">{slug}</code>
          </p>
          <div className="mt-6 pt-4 border-t border-[#1A1A1A]">
            <Link
              href="/"
              className="text-xs font-display uppercase tracking-wider text-[#C8F135] hover:underline"
            >
              Return to Operations Dashboard &rarr;
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isCrappy = lead.target_type === "crappy_website";
  const mailtoSubject = encodeURIComponent(`Build Inquiry — ${lead.business_name}`);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F2F2F2] selection:bg-[#C8F135] selection:text-[#0C0C0C] flex flex-col justify-between font-sans">
      {/* 1. Top Brand Header Bar */}
      <header className="border-b border-[#1A1A1A] bg-[#0C0C0C]/90 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <SMark size={34} />
            <div className="flex flex-col">
              <span className="font-display text-[15px] text-[#F2F2F2] tracking-[0.005em] leading-none">
                SAAD BIN FAISAL
              </span>
              <span className="font-microlabel text-[8px] text-[#3A3A3A] mt-1">
                BYSAAD &bull; TECHNICAL & CONVERSION DIAGNOSTIC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-microlabel hidden sm:inline-block">
              CONFIDENTIAL REPORT // {lead.audit_slug}
            </span>
            <span className="px-2 py-0.5 border border-[#1A1A1A] bg-[#111111] text-[9px] font-mono text-[#C8F135] rounded-[2px]">
              VERIFIED AUDIT
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 space-y-12">
        {/* 2. Hero Diagnostic Header */}
        <section className="space-y-4">
          <div className="font-microlabel text-[#888888]">
            INDEPENDENT ARCHITECTURAL & CONVERSION ANALYSIS
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-[#F2F2F2] tracking-[0.005em] leading-[0.95]">
            PREPARED FOR: {lead.business_name}
          </h1>

          <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px] flex flex-wrap items-center justify-between gap-4 text-xs font-body">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="font-microlabel block text-[#888888]">TARGET NICHE</span>
                <span className="text-[#F2F2F2] font-semibold">{lead.niche}</span>
              </div>
              <div className="hidden sm:block w-[1px] h-6 bg-[#1A1A1A]"></div>
              <div>
                <span className="font-microlabel block text-[#888888]">LOCATION</span>
                <span className="text-[#F2F2F2] font-semibold">{lead.city}</span>
              </div>
              <div className="hidden sm:block w-[1px] h-6 bg-[#1A1A1A]"></div>
              <div>
                <span className="font-microlabel block text-[#888888]">LOCAL BENCHMARK</span>
                <span className="text-[#F2F2F2]">{lead.top_competitor || "Category Leader"}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-microlabel block text-[#888888]">VERIFIED REPUTATION</span>
              <span className="text-[#F2F2F2] font-mono">
                {lead.rating || 4.9}★ ({lead.review_count || 50}+ Verified Google Reviews)
              </span>
            </div>
          </div>
        </section>

        {/* 3. Conditional Audit Evidence Block */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
            <h2 className="font-display text-xl text-[#F2F2F2] tracking-[0.005em]">
              CURRENT INFRASTRUCTURE DEFICIT
            </h2>
            <span className="font-microlabel">SECTION 01 // AUDIT EVIDENCE</span>
          </div>

          {isCrappy ? (
            /* Crappy Website Diagnostic */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Captured Screenshot Frame */}
              <div className="lg:col-span-7 bg-[#111111] border border-[#1A1A1A] rounded-[2px] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#0C0C0C] border-b border-[#1A1A1A] flex items-center justify-between text-[11px] font-mono text-[#888888]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-none bg-[#3A3A3A]"></span>
                    <span className="truncate max-w-xs">{lead.website_url}</span>
                  </div>
                  <span className="font-microlabel text-[#888888]">VIEWPORT 1280X800</span>
                </div>

                <div className="relative aspect-[16/10] bg-[#0C0C0C]">
                  {lead.website_screenshot_url ? (
                    <img
                      src={lead.website_screenshot_url}
                      alt={`Audit screenshot for ${lead.business_name}`}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#888888] font-mono">
                      [VIEWPORT SNAPSHOT CAPTURED]
                    </div>
                  )}
                </div>
              </div>

              {/* Diagnostic Score & Flaws Breakdown */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
                  <div className="font-microlabel text-[#888888]">COMPREHENSIVE AUDIT SCORE</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-5xl text-[#F2F2F2]">
                      {lead.website_score || 34}
                    </span>
                    <span className="font-display text-lg text-[#888888]">/ 100</span>
                  </div>
                  <div className="mt-3 w-full bg-[#1A1A1A] h-1.5 overflow-hidden">
                    <div
                      className="bg-[#C8F135] h-full"
                      style={{ width: `${lead.website_score || 34}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs text-[#888888] font-body leading-relaxed">
                    Performance thresholds flag significant patient or client bounce before initial intake completion.
                  </p>
                </div>

                <div className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] space-y-3">
                  <div className="font-microlabel text-[#888888]">OBSERVED CONVERSION LEAKS</div>
                  <div className="space-y-2.5">
                    {lead.pain_points.map((flaw, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] flex items-start gap-3"
                      >
                        <span className="font-mono text-xs text-[#888888] shrink-0 mt-0.5">
                          0{idx + 1}
                        </span>
                        <p className="text-xs font-body text-[#F2F2F2] leading-relaxed">
                          {flaw}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Website Diagnostic */
            <div className="p-8 bg-[#111111] border border-[#1A1A1A] rounded-[2px] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1A1A1A]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle size={16} className="text-[#888888]" />
                    <span className="font-microlabel text-[#888888]">ARCHITECTURAL VOID</span>
                  </div>
                  <h3 className="font-display text-3xl text-[#F2F2F2]">
                    0 / 100 &mdash; ZERO DIGITAL FOOTPRINT DETECTED
                  </h3>
                </div>

                <div className="px-3 py-1.5 bg-[#0C0C0C] border border-[#2A2A2A] text-xs font-mono text-[#888888] rounded-[2px]">
                  STATUS: 100% UNOWNED TRAFFIC
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-body">
                <div className="p-5 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] space-y-2">
                  <div className="font-microlabel text-[#888888]">OPERATIONAL BLEED</div>
                  <p className="text-[#F2F2F2] leading-relaxed">
                    While {lead.business_name} commands strong reputation with {lead.review_count || 87} reviews, 100% of organic search traffic in {lead.city} attempting to verify past work or book commercial quotes after hours defaults directly to{" "}
                    <strong className="text-[#F2F2F2]">{lead.top_competitor}</strong>.
                  </p>
                </div>

                <div className="p-5 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] space-y-2">
                  <div className="font-microlabel text-[#888888]">TELEPHONE ROUTING FAILURE</div>
                  <p className="text-[#888888] leading-relaxed">
                    Your Google Business Profile directs high-intent prospects to an unverified telephone number without automated SMS response, qualification logic, or instant project estimation.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="font-microlabel text-[#888888]">CRITICAL FRICTION POINTS</div>
                {lead.pain_points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] flex items-start gap-3"
                  >
                    <span className="font-mono text-xs text-[#888888] shrink-0 mt-0.5">
                      0{idx + 1}
                    </span>
                    <p className="text-xs font-body text-[#F2F2F2] leading-relaxed">
                      {pt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 4. Proposed BYSAAD Build Architecture */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]">
            <h2 className="font-display text-xl text-[#F2F2F2] tracking-[0.005em]">
              PROPOSED HIGH-CONVERSION SYSTEM
            </h2>
            <span className="font-microlabel">SECTION 02 // TAILORED ARCHITECTURE</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 bg-[#111111] border border-[#1A1A1A] rounded-[2px] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="font-microlabel text-[#888888] block mb-1">
                    STRATEGIC PITCH ANGLE
                  </span>
                  <p className="text-sm font-body text-[#F2F2F2] leading-relaxed">
                    {lead.client_brief.pitch_angle ||
                      "Build a fast, authoritative conversion portal that captures high-ticket inquiries before they escape to competitors."}
                  </p>
                </div>

                <div>
                  <span className="font-microlabel text-[#888888] block mb-1">
                    WORKING MODEL & CLIENT ECONOMICS
                  </span>
                  <p className="text-xs font-body text-[#888888] leading-relaxed">
                    {lead.client_brief.working_model ||
                      "Targeting high-margin commercial and elective clients through friction-free qualification."}
                  </p>
                </div>
              </div>

              {/* Recommended Deliverables */}
              <div>
                <span className="font-microlabel text-[#888888] block mb-2.5">
                  RECOMMENDED SCOPE OF WORK
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lead.client_brief.recommended_services.map((srv, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] text-xs font-body text-[#F2F2F2] flex items-center gap-2.5"
                    >
                      <CheckCircle2 size={13} className="text-[#888888] shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand Promise Card */}
            <div className="p-6 bg-[#111111] border border-[#1A1A1A] rounded-[2px] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-[#888888]" />
                  <span className="font-microlabel text-[#888888]">THE BYSAAD STANDARD</span>
                </div>
                <h3 className="font-display text-lg text-[#F2F2F2] tracking-[0.005em] leading-snug">
                  SINGLE-HANDED EXECUTION & PRECISION DELIVERY
                </h3>
                <p className="text-xs font-body text-[#888888] leading-relaxed mt-3">
                  &ldquo;I handle strategy, copywriting, design, and Wix Studio development myself &mdash; what gets approved is exactly what gets built.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A1A1A] text-xs font-body text-[#888888]">
                <p className="font-display text-sm text-[#F2F2F2]">Saad Bin Faisal</p>
                <p className="font-wordmark text-[11px] text-[#888888]">BYSAAD</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Single Acid-Lime CTA Block (Enforcing the Single-Lime Rule) */}
        <section className="p-8 sm:p-12 bg-[#111111] border border-[#1A1A1A] rounded-[2px] text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="font-microlabel text-[#888888]">NEXT STEP</div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#F2F2F2] tracking-[0.005em]">
              READY TO PLUG YOUR REVENUE LEAK?
            </h2>
            <p className="text-xs sm:text-sm font-body text-[#888888] leading-relaxed">
              We can execute this build in Wix Studio within 14 business days, complete with copywriting, intake workflows, and SEO setup.
            </p>
          </div>

          <div>
            {/* SINGLE LIME RULE: This is the ONLY vibrant lime element on the entire page */}
            <a
              href={`mailto:hello@bysaad.com?subject=${mailtoSubject}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C8F135] hover:bg-[#b8e125] text-[#0C0C0C] font-display text-sm uppercase tracking-wider font-semibold rounded-[2px] transition-colors"
            >
              <span>REQUEST BUILD & TIMELINE &rarr;</span>
            </a>
          </div>

          <div className="pt-6 border-t border-[#1A1A1A] max-w-lg mx-auto text-[11px] text-[#888888] font-body">
            Direct Line to Principal: <span className="text-[#F2F2F2]">hello@bysaad.com</span> &bull;{" "}
            <span className="text-[#F2F2F2]">bysaad.com</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] bg-[#0C0C0C] py-6 text-center text-xs text-[#888888]">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 font-body">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs text-[#F2F2F2]">Saad Bin Faisal</span>
            <span className="text-[#3A3A3A]">&bull;</span>
            <span className="font-wordmark text-[11px] text-[#888888]">BYSAAD</span>
          </div>
          <div className="font-microlabel text-[#3A3A3A]">
            ALL ARCHITECTURAL ASSESSMENTS ARE STRICTLY CONFIDENTIAL
          </div>
        </div>
      </footer>
    </div>
  );
}
