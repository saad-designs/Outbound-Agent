import { NextRequest, NextResponse } from "next/server";
import { getCRMData, updateLead, updatePlaybook, addInvoice } from "@/lib/dataBridge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCRMData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: "Missing id or updates" }, { status: 400 });
    }

    if (type === "playbook") {
      const updated = await updatePlaybook(id, updates);
      return NextResponse.json({ success: true, updated });
    } else {
      // Default type is lead
      const updated = await updateLead(id, updates);
      return NextResponse.json({ success: true, updated });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoice = await addInvoice(body);
    return NextResponse.json({ success: true, invoice });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
