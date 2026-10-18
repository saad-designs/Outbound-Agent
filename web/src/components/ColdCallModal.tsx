import React from "react";
import { Lead } from "@/types/crm";
import { X, Phone, AlertCircle, CheckCircle2 } from "lucide-react";

interface ColdCallModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const ColdCallModal: React.FC<ColdCallModalProps> = ({ lead, onClose }) => {
  if (!lead || !lead.call_battlecard) return null;

  const { hook, problem, soft_close } = lead.call_battlecard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-2xl bg-[#0C0C0C] border border-[#1A1A1A] rounded-[2px] p-6 text-[#F2F2F2]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1A1A1A]">
          <div>
            <div className="font-microlabel mb-1">CALL BATTLECARD // LIVE ENGAGEMENT</div>
            <h2 className="font-display text-2xl text-[#F2F2F2] tracking-[0.005em]">
              {lead.business_name}
            </h2>
            <div className="text-xs text-[#888888] font-body mt-0.5">
              Contact: {lead.contact_name || "Direct Decision Maker"} • {lead.city} • {lead.phone || "No phone listed"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-[#F2F2F2] border border-[#1A1A1A] hover:border-[#3A3A3A] rounded-[2px] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Dial Action */}
        <div className="my-5 p-3.5 bg-[#111111] border border-[#1A1A1A] rounded-[2px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#1A1A1A] bg-[#0C0C0C]">
              <Phone size={16} className="text-[#C8F135]" />
            </div>
            <div>
              <div className="font-microlabel">DIRECT DIAL</div>
              <div className="font-display text-lg tracking-wider text-[#F2F2F2]">
                {lead.phone || "No direct number available"}
              </div>
            </div>
          </div>
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] text-[#F2F2F2] text-xs font-semibold tracking-wider font-display uppercase border border-[#2A2A2A] rounded-[2px] transition-colors"
            >
              Initiate Dial
            </a>
          )}
        </div>

        {/* Script Blocks */}
        <div className="space-y-4">
          {/* Phase 1: Hook */}
          <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#C8F135]"></span>
              <span className="font-microlabel">STEP 1: THE DISARMING HOOK (FIRST 7 SECONDS)</span>
            </div>
            <p className="text-sm font-body text-[#F2F2F2] leading-relaxed">
              &quot;{hook}&quot;
            </p>
          </div>

          {/* Phase 2: Problem */}
          <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#888888]"></span>
              <span className="font-microlabel">STEP 2: THE OPERATIONAL BLEED (THE PROBLEM)</span>
            </div>
            <p className="text-sm font-body text-[#F2F2F2] leading-relaxed">
              &quot;{problem}&quot;
            </p>
          </div>

          {/* Phase 3: Soft Close */}
          <div className="p-4 bg-[#111111] border border-[#1A1A1A] rounded-[2px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#C8F135]"></span>
              <span className="font-microlabel">STEP 3: THE LOW-RESISTANCE CLOSE</span>
            </div>
            <p className="text-sm font-body text-[#F2F2F2] leading-relaxed">
              &quot;{soft_close}&quot;
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#1A1A1A] flex justify-between items-center text-xs text-[#888888]">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-[#888888]" />
            <span className="font-microlabel">BYSAAD RULE: NEVER APOLOGIZE FOR CALLING. LEAD WITH CONCRETE VALUE.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#1A1A1A] hover:border-[#3A3A3A] text-[#F2F2F2] text-xs font-display uppercase tracking-wider rounded-[2px]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColdCallModal;
