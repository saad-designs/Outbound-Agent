import { NextRequest, NextResponse } from "next/server";
import { getCRMData, updateLead } from "@/lib/dataBridge";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let forceSimulation = false;
    try {
      const body = await req.json();
      forceSimulation = Boolean(body?.forceSimulation);
    } catch {
      // Body optional
    }

    const crmData = await getCRMData();
    const now = Date.now();
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

    const transitions: { id: string; name: string; oldStatus: string; newStatus: string }[] = [];

    for (const lead of crmData.leads) {
      if (lead.status === "emailed_step_1") {
        const sentTime = lead.sent_at ? new Date(lead.sent_at).getTime() : 0;
        const diff = now - sentTime;

        if (forceSimulation || diff >= THREE_DAYS_MS) {
          await updateLead(lead.id, { status: "follow_up_due" });
          transitions.push({
            id: lead.id,
            name: lead.business_name,
            oldStatus: "emailed_step_1",
            newStatus: "follow_up_due",
          });
        }
      } else if (lead.status === "follow_up_due") {
        const baseTime = lead.follow_up_sent_at
          ? new Date(lead.follow_up_sent_at).getTime()
          : lead.sent_at
          ? new Date(lead.sent_at).getTime()
          : 0;
        const diff = now - baseTime;

        if (forceSimulation || diff >= SIX_DAYS_MS) {
          await updateLead(lead.id, { status: "ghosted_call_required" });
          transitions.push({
            id: lead.id,
            name: lead.business_name,
            oldStatus: "follow_up_due",
            newStatus: "ghosted_call_required",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      transitionsCount: transitions.length,
      transitions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
