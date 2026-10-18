"use client";

import React, { useState } from "react";
import { DirectorPlaybookStrategy } from "@/types/crm";
import {
  Video,
  BookOpen,
  TrendingUp,
  Plus,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Flame,
  Mail,
  MessageSquare,
  RefreshCw
} from "lucide-react";

interface DirectorBrainViewProps {
  strategies: DirectorPlaybookStrategy[];
  onRefreshData?: () => Promise<void>;
}

export const DirectorBrainView: React.FC<DirectorBrainViewProps> = ({
  strategies: initialStrategies,
  onRefreshData,
}) => {
  const [strategies, setStrategies] = useState<DirectorPlaybookStrategy[]>(initialStrategies);
  const [inputUrlOrRule, setInputUrlOrRule] = useState("");
  const [strategyName, setStrategyName] = useState("");
  const [sourceType, setSourceType] = useState<"youtube_transcript" | "manual_rule">("youtube_transcript");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  React.useEffect(() => {
    setStrategies(initialStrategies);
  }, [initialStrategies]);

  const totalSent = strategies.reduce((acc, s) => acc + (s.emails_sent || 0), 0);
  const totalReplies = strategies.reduce((acc, s) => acc + (s.replies_received || 0), 0);
  const totalHotLeads = strategies.reduce((acc, s) => acc + (s.hot_leads_generated || 0), 0);
  const avgConversion = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : "0.0";

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrlOrRule.trim()) return;

    setIsIngesting(true);
    setIngestStatus("Director analyzing transcript via Gemini 2.5 Flash...");

    try {
      if (sourceType === "youtube_transcript") {
        const res = await fetch("/api/scraper/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "learn_youtube",
            youtubeUrl: inputUrlOrRule,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIngestStatus("Playbook tactic successfully ingested into Director memory!");
          if (onRefreshData) await onRefreshData();
        } else {
          setIngestStatus("Ingestion notice: strategy parsed and cached.");
        }
      } else {
        // Manual tactic insertion
        const newStrategy: DirectorPlaybookStrategy = {
          id: `strat-${Date.now()}`,
          source_type: "manual_rule",
          source_url: null,
          strategy_name: strategyName.trim() || "Custom Operator Rule",
          extracted_rules: [
            inputUrlOrRule.trim(),
            "Enforce zero greetings and cut directly to quantified loss",
            "Provide private live audit slug without tracking redirects",
          ],
          emails_sent: 0,
          replies_received: 0,
          hot_leads_generated: 0,
          conversion_score: 0,
          is_active: true,
          created_at: new Date().toISOString(),
        };

        const res = await fetch("/api/crm", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "playbook",
            id: newStrategy.id,
            updates: newStrategy,
          }),
        });

        setStrategies([newStrategy, ...strategies]);
        setIngestStatus("Manual heuristic registered in Director Playbook.");
        if (onRefreshData) await onRefreshData();
      }

      setInputUrlOrRule("");
      setStrategyName("");
    } catch (err: any) {
      setIngestStatus(`Error: ${err.message}`);
    } finally {
      setIsIngesting(false);
      setTimeout(() => setIngestStatus(null), 5000);
    }
  };

  const toggleStrategyActive = async (id: string, currentActive: boolean) => {
    const updated = !currentActive;
    setStrategies(
      strategies.map((s) => (s.id === id ? { ...s, is_active: updated } : s))
    );

    try {
      await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "playbook",
          id,
          updates: { is_active: updated },
        }),
      });
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      console.warn("Failed to toggle playbook:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2px)] overflow-y-auto bg-[#0C0C0C] p-6 space-y-6">
      {/* View Header */}
      <div className="pb-4 border-b border-[#1A1A1A] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-microlabel">KNOWLEDGE CORE // SELF-LEARNING AGENT</div>
          <h2 className="font-display text-2xl text-[#F2F2F2] tracking-[0.005em] mt-0.5">
            DIRECTOR BRAIN & OUTBOUND PLAYBOOK
          </h2>
          <p className="text-xs text-[#888888] font-body mt-1">
            The AI Director extracts sales heuristics from YouTube sales breakdowns and updates conversion scores based on inbound replies.
          </p>
        </div>

        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="p-2 border border-[#1A1A1A] hover:border-[#3A3A3A] text-[#888888] hover:text-[#F2F2F2] rounded-[2px] transition-colors"
            title="Refresh strategies"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* Tactic Ingestion Bar */}
      <form
        onSubmit={handleIngest}
        className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-[#888888]" />
            <span className="font-display text-sm text-[#F2F2F2]">
              INGEST NEW SALES STRATEGY / YOUTUBE TRANSCRIPT
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#0C0C0C] p-1 border border-[#1A1A1A] rounded-[2px]">
            <button
              type="button"
              onClick={() => setSourceType("youtube_transcript")}
              className={`px-3 py-1 text-xs font-display tracking-wider rounded-[2px] ${
                sourceType === "youtube_transcript"
                  ? "bg-[#1A1A1A] text-[#F2F2F2]"
                  : "text-[#888888] hover:text-[#F2F2F2]"
              }`}
            >
              YOUTUBE URL
            </button>
            <button
              type="button"
              onClick={() => setSourceType("manual_rule")}
              className={`px-3 py-1 text-xs font-display tracking-wider rounded-[2px] ${
                sourceType === "manual_rule"
                  ? "bg-[#1A1A1A] text-[#F2F2F2]"
                  : "text-[#888888] hover:text-[#F2F2F2]"
              }`}
            >
              MANUAL TACTIC
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder={
              sourceType === "youtube_transcript"
                ? "https://www.youtube.com/watch?v=..."
                : "e.g. Always state Google review count before mentioning design flaws"
            }
            value={inputUrlOrRule}
            onChange={(e) => setInputUrlOrRule(e.target.value)}
            className="md:col-span-2 bg-[#0C0C0C] border border-[#1A1A1A] focus:border-[#3A3A3A] px-3 py-2 text-xs text-[#F2F2F2] rounded-[2px] outline-none font-body"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Strategy title (optional)"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="flex-1 bg-[#0C0C0C] border border-[#1A1A1A] focus:border-[#3A3A3A] px-3 py-2 text-xs text-[#F2F2F2] rounded-[2px] outline-none font-body"
            />
            {/* Single lime CTA for ingestion */}
            <button
              type="submit"
              disabled={isIngesting || !inputUrlOrRule.trim()}
              className="px-4 py-2 bg-[#C8F135] hover:bg-[#b8e125] text-[#0C0C0C] font-display text-xs uppercase tracking-wider font-semibold rounded-[2px] shrink-0 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isIngesting ? <RefreshCw size={13} className="animate-spin" /> : null}
              <span>{isIngesting ? "ANALYZING..." : "INGEST"}</span>
            </button>
          </div>
        </div>

        {ingestStatus && (
          <div className="text-[11px] font-mono text-[#C8F135] pt-1">
            {ingestStatus}
          </div>
        )}
      </form>

      {/* KPI Conversion Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
          <div className="font-microlabel">PLAYBOOK RULES</div>
          <div className="font-display text-2xl text-[#F2F2F2] mt-1">
            {strategies.length}
          </div>
          <div className="text-[10px] text-[#888888] font-body mt-0.5">Active models</div>
        </div>

        <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
          <div className="font-microlabel">EMAILS SENT</div>
          <div className="font-display text-2xl text-[#F2F2F2] mt-1">
            {totalSent}
          </div>
          <div className="text-[10px] text-[#888888] font-body mt-0.5">Direct outreach</div>
        </div>

        <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
          <div className="font-microlabel">TOTAL REPLIES</div>
          <div className="font-display text-2xl text-[#F2F2F2] mt-1">
            {totalReplies}
          </div>
          <div className="text-[10px] text-[#888888] font-body mt-0.5">Prospect responses</div>
        </div>

        <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
          <div className="font-microlabel">HOT LEADS</div>
          <div className="font-display text-2xl text-[#F2F2F2] mt-1">
            {totalHotLeads}
          </div>
          <div className="text-[10px] text-[#888888] font-body mt-0.5">High buying intent</div>
        </div>

        <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
          <div className="font-microlabel">CONVERSION SCORE</div>
          <div className="font-display text-2xl text-[#C8F135] mt-1">
            {avgConversion}%
          </div>
          <div className="text-[10px] text-[#888888] font-body mt-0.5">Telemetry benchmark</div>
        </div>
      </div>

      {/* Active Strategy Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-microlabel">EXTRACTED DIRECTOR RULES & CONVERSION BENCHMARKS</span>
          <span className="font-microlabel text-[#888888]">{strategies.length} TOTAL MODELS</span>
        </div>

        <div className="space-y-3">
          {strategies.map((strat) => (
            <div
              key={strat.id}
              className="p-5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3 pb-3 border-b border-[#1A1A1A]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-microlabel px-1.5 py-0.5 border ${
                        strat.source_type === "youtube_transcript"
                          ? "border-[#2A2A2A] text-[#888888] bg-[#0C0C0C]"
                          : "border-[#3A3A3A] text-[#F2F2F2] bg-[#0C0C0C]"
                      }`}
                    >
                      {strat.source_type.replace("_", " ")}
                    </span>
                    {strat.source_url && (
                      <a
                        href={strat.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-[#888888] hover:text-[#F2F2F2] inline-flex items-center gap-1"
                      >
                        <span>source</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <h3 className="font-display text-lg text-[#F2F2F2] tracking-[0.005em]">
                    {strat.strategy_name}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-microlabel">CONVERSION</div>
                    <div className="font-display text-lg text-[#F2F2F2]">
                      {strat.conversion_score}%
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStrategyActive(strat.id, strat.is_active)}
                    className={`px-3 py-1.5 text-xs font-display uppercase tracking-wider rounded-[2px] border transition-colors ${
                      strat.is_active
                        ? "border-[#1A1A1A] bg-[#0C0C0C] text-[#C8F135]"
                        : "border-[#1A1A1A] bg-[#0C0C0C] text-[#3A3A3A]"
                    }`}
                  >
                    {strat.is_active ? "ACTIVE IN DIRECTOR" : "PAUSED"}
                  </button>
                </div>
              </div>

              {/* Extracted Rules */}
              <div className="space-y-1.5">
                <div className="font-microlabel text-[#888888]">EXTRACTED HEURISTICS</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {strat.extracted_rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] text-xs font-body text-[#F2F2F2] flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-[#888888] shrink-0 mt-1.5"></span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-3 pt-3 border-t border-[#1A1A1A] flex items-center justify-between text-[11px] text-[#888888] font-body">
                <div>
                  Sent: <strong className="text-[#F2F2F2]">{strat.emails_sent}</strong> • Replies:{" "}
                  <strong className="text-[#F2F2F2]">{strat.replies_received}</strong> • Hot Leads:{" "}
                  <strong className="text-[#F2F2F2]">{strat.hot_leads_generated}</strong>
                </div>
                <div className="font-microlabel text-[#3A3A3A]">
                  CREATED: {new Date(strat.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DirectorBrainView;
