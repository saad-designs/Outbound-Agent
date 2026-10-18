import { NextRequest, NextResponse } from "next/server";
import { getCRMData, updateLead, updatePlaybook } from "@/lib/dataBridge";
import { Lead } from "@/types/crm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check auto-submitted header
    const autoSubmitted = req.headers.get("auto-submitted") || body.headers?.["auto-submitted"];
    if (autoSubmitted && autoSubmitted.toLowerCase().includes("auto-generated")) {
      return NextResponse.json({ message: "Auto-responder ignored" }, { status: 200 });
    }

    // Support both live webhook payloads and UI simulation payloads
    const replyText = body.text || body.body || body.replyText || "Yes, interested. What are your rates?";
    const senderEmail = body.from || body.sender || body.email;
    const inReplyTo = body["in-reply-to"] || body.inReplyTo || body.outbound_message_id;
    const directLeadId = body.leadId;

    const crmData = await getCRMData();

    // Find the lead
    let matchedLead: Lead | undefined;
    if (directLeadId) {
      matchedLead = crmData.leads.find((l) => l.id === directLeadId);
    } else if (inReplyTo) {
      matchedLead = crmData.leads.find((l) => l.outbound_message_id === inReplyTo);
    } else if (senderEmail) {
      matchedLead = crmData.leads.find(
        (l) => l.email && l.email.toLowerCase() === senderEmail.toLowerCase()
      );
    }

    if (!matchedLead) {
      // Pick first active lead if simulating without explicit ID
      matchedLead = crmData.leads.find((l) => l.status === "emailed_step_1") || crmData.leads[0];
    }

    if (!matchedLead) {
      return NextResponse.json({ error: "No matching lead found" }, { status: 404 });
    }

    // Classify sentiment: HOT vs COLD
    let isHot = false;
    const lowerReply = replyText.toLowerCase();

    const hotKeywords = [
      "interested", "pricing", "cost", "rates", "call", "schedule", "quote",
      "talk", "send", "preview", "prototype", "when", "demo", "sounds good", "yes"
    ];
    const coldKeywords = [
      "unsubscribe", "remove", "not interested", "stop", "no thanks",
      "take me off", "do not contact", "spam", "wrong person"
    ];

    if (coldKeywords.some((kw) => lowerReply.includes(kw))) {
      isHot = false;
    } else if (hotKeywords.some((kw) => lowerReply.includes(kw))) {
      isHot = true;
    } else {
      isHot = true; // Default to hot if ambiguous inquiry
    }

    // Heuristic sentiment classification is primary and deterministic
    // If live Gemini REST classification is desired, GEMINI_API_KEY can be used via fetch

    const newStatus = isHot ? "replied_hot" : "replied_cold";
    const now = new Date().toISOString();

    const updatedLead = await updateLead(matchedLead.id, {
      status: newStatus,
      replied_at: now,
    });

    // Update playbook conversion metrics
    if (matchedLead.director_angle_id) {
      const strat = crmData.playbooks.find((p) => p.id === matchedLead.director_angle_id);
      if (strat) {
        const newReplies = (strat.replies_received || 0) + 1;
        const newHot = (strat.hot_leads_generated || 0) + (isHot ? 1 : 0);
        const sentCount = Math.max(strat.emails_sent || 1, newReplies);
        const newScore = Number(((newReplies / sentCount) * 100).toFixed(1));

        await updatePlaybook(strat.id, {
          replies_received: newReplies,
          hot_leads_generated: newHot,
          conversion_score: newScore,
        });
      }
    }

    return NextResponse.json({
      success: true,
      sentiment: isHot ? "HOT" : "COLD",
      status: newStatus,
      lead: updatedLead,
      replyText,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
