import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getCRMData } from "@/lib/dataBridge";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, niche, city, limit, url, name, youtubeUrl } = body;

    const scraperDir = path.resolve(process.cwd(), "..", "scraper");
    const scriptPath = path.join(scraperDir, "main.py");

    const args: string[] = [];

    if (mode === "scrape") {
      args.push(
        "--scrape",
        "--niche",
        niche || "Commercial Roofing",
        "--city",
        city || "Austin, TX",
        "--limit",
        String(limit || 2),
        "--dry-run"
      );
    } else if (mode === "audit_url") {
      if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
      }
      args.push(
        "--audit-url",
        url,
        "--name",
        name || "Audited Prospect",
        "--dry-run"
      );
    } else if (mode === "learn_youtube") {
      const targetYt = youtubeUrl || url;
      if (!targetYt) {
        return NextResponse.json({ error: "Missing youtubeUrl parameter" }, { status: 400 });
      }
      args.push(
        "--learn-youtube",
        targetYt,
        "--dry-run"
      );
    } else {
      return NextResponse.json({ error: `Unknown mode: ${mode}` }, { status: 400 });
    }

    // Run python process with timeout
    const result = await new Promise<{ code: number | null; stdout: string; stderr: string }>(
      (resolve) => {
        const pythonCmd = process.env.PYTHON_PATH || "python";
        const child = spawn(pythonCmd, [scriptPath, ...args], {
          cwd: scraperDir,
          env: { ...process.env },
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        const timer = setTimeout(() => {
          child.kill();
          resolve({ code: -1, stdout, stderr: stderr + "\nProcess timed out (60s)" });
        }, 60000);

        child.on("close", (code) => {
          clearTimeout(timer);
          resolve({ code, stdout, stderr });
        });

        child.on("error", (err) => {
          clearTimeout(timer);
          resolve({ code: 1, stdout, stderr: err.message });
        });
      }
    );

    // Refresh CRM data to pick up the newly scraped lead(s)
    const freshData = await getCRMData();

    return NextResponse.json({
      success: result.code === 0,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      data: freshData,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
