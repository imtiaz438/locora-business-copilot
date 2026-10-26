import React from 'react';
import {
  ShieldCheck,
  Globe,
  Building2,
  MapPin,
  Star,
  Sparkles,
  Users,
  ListChecks,
  ArrowRight,
  FileSearch,
} from 'lucide-react';

// Sample AI-visibility report for dentists — a noindex sales asset built from
// the approved draft (dentist-beachhead-drafts-2026-10-23.md §3 + the Oct 25
// draft). Every number on this page is illustrative and labelled as such: no
// real business names, no real review text, no outcome claims.
export function SampleDentalReportView() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sample banner */}
      <section className="bg-amber-50 border-b border-amber-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed font-sans">
            <strong className="font-heading">SAMPLE REPORT — illustrative.</strong>{' '}
            Practice details and scores on this page are examples, not a real business.
            They show what your own free checkup report looks like — run it on your
            practice to see your real results.
          </p>
        </div>
      </section>

      {/* Report header */}
      <section className="px-6 pt-12 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-8">
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-[#059669] uppercase tracking-wider font-heading">
                  AI Visibility Checkup — Sample Report
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading leading-tight">
                  Sample Dental Studio — Austin, TX
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  A fictional practice, used to show the format of a real LocoraAI
                  checkup report section by section.
                </p>
              </div>
              <div className="text-center shrink-0">
                <div className="w-32 h-32 rounded-full border-8 border-emerald-100 flex flex-col items-center justify-center bg-emerald-50">
                  <span className="text-4xl font-black text-slate-900 font-heading">68</span>
                  <span className="text-xs font-semibold text-slate-500 font-sans">/ 100</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-sans">
                  Illustrative visibility score
                  <br />
                  (example, not a real scan)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report sections */}
      <section className="px-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-6">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <FileSearch className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">1. Overall score — illustrative</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              An example of how the report opens: one overall score, then the sections
              below, with the highest-impact fixes first. Your real report replaces every
              example number with your live scan results.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">2. Website health — illustrative example findings</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed font-sans list-disc pl-5">
              <li>Example finding: Dentist structured data is present on the homepage.</li>
              <li>Example finding: No dedicated service page for one high-value treatment in this example (implants) — so patients searching that treatment see less specific content.</li>
              <li>Example finding: Page load on mobile is slower than the example target shown in the report.</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">3. Google Business Profile / local signals — illustrative</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed font-sans list-disc pl-5">
              <li>Example finding: Primary category set, hours and photos present in this example.</li>
              <li>Example finding: Two services in this example have no description — the report lists exactly which fields are blank, so nothing is guessed.</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">4. Maps presence — illustrative</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed font-sans list-disc pl-5">
              <li>Example finding: The example practice surfaces in Maps results for its own neighbourhood in this example, and less consistently for searches from further away. The real report shows the actual locations tested, not a generic radius claim.</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">5. Reviews — illustrative (no real review text)</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed font-sans list-disc pl-5">
              <li>Example format only: review count, average rating, recency and response rate, as the live report displays them.</li>
              <li>Example finding: Most recent reviews in this example are unanswered — the report flags unanswered reviews without quoting any real reviewer.</li>
            </ul>
            <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-heading mb-2">
                HIPAA-safe reply example
              </p>
              <p className="text-sm text-emerald-900 leading-relaxed font-sans italic">
                "Thank you so much for the kind words! Our team works hard to make every
                visit comfortable, and feedback like yours means a lot to us. We
                appreciate you choosing our practice!"
              </p>
              <p className="text-xs text-emerald-700 mt-2 font-sans">
                The pattern: thank the reviewer, speak generally, never confirm someone
                is a patient, and move specifics offline.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">6. AI visibility — illustrative</h2>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600 leading-relaxed font-sans list-disc pl-5">
              <li>Example finding: In this example, an AI assistant names a competing practice first for a conversational implant question, because that practice's service page and reviews are easier for the assistant to cite. The real report tests whether AI assistants can find and cite <em>your</em> practice — it does not promise a ranking outcome.</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">7. Competitor snapshot — illustrative (no real names)</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-sans">
              Example format: "Practice A" and "Practice B" placeholders, showing how the
              report compares the scanned practice with the practices Google and AI
              actually surface instead. No real competitor names, scores or claims appear
              in this sample.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-3">
              <ListChecks className="w-5 h-5 text-[#059669]" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">8. Prioritised fixes — illustrative (actions, not outcome promises)</h2>
            </div>
            <ol className="space-y-2.5 text-sm text-slate-600 leading-relaxed font-sans list-decimal pl-5">
              <li>Add descriptions to the two blank GBP services in this example.</li>
              <li>Publish one dedicated service page for the missing treatment.</li>
              <li>Answer the unanswered reviews with HIPAA-safe replies.</li>
              <li>Add Dentist schema details the example is missing (services, opening hours, sameAs links).</li>
              <li>Re-run the checkup after the fixes to see the updated live score.</li>
            </ol>
            <p className="text-sm text-slate-500 leading-relaxed font-sans mt-4">
              No fix above promises new patients, cases, rankings or revenue — the report
              shows what to fix and in what order; results come from the practice's own
              follow-through.
            </p>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 pb-20 pt-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#04241c] rounded-3xl px-8 py-10 sm:p-12 text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Run this checkup on your practice — free
            </h2>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-sans max-w-xl mx-auto">
              No signup, no credit card to see your score and top issues.
            </p>
            <a
              href="/checkup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer font-heading"
            >
              Get My Free Checkup <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-xs text-emerald-100/60 font-sans">
              This page is a sample. Your report is generated from a live scan of your
              own practice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
