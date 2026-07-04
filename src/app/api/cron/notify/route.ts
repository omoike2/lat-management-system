import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendReminders } from "@/features/notifications/trigger";

function isAuthorized(req: NextRequest): boolean {
  if (!process.env.CRON_SECRET) return false;
  const bearer = req.headers.get("authorization");
  if (bearer === `Bearer ${process.env.CRON_SECRET}`) return true;
  const qs = req.nextUrl.searchParams.get("secret");
  return qs === process.env.CRON_SECRET;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handler(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handler(req);
}

async function handler(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // dayOfWeek: 0=Mon … 4=Fri. JS getDay(): 0=Sun,1=Mon…6=Sat → offset by -1 mod 7
  const jsDow = now.getDay();
  const dayOfWeek = jsDow === 0 ? 6 : jsDow - 1; // Sun maps to 6 (weekend, no slots)

  // Window: 25–35 minutes from now
  const windowStart = new Date(now.getTime() + 25 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 35 * 60 * 1000);

  // Format HH:MM for comparison against stored startTime strings
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const winStartStr = fmt(windowStart);
  const winEndStr = fmt(windowEnd);

  const slots = await db.timeSlot.findMany({
    where: {
      dayOfWeek,
      available: true,
      startTime: { gte: winStartStr, lte: winEndStr },
    },
    select: { id: true },
  });

  if (slots.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const entries = await db.timetableEntry.findMany({
    where: {
      slotId: { in: slots.map((s) => s.id) },
      reminderSent: false,
    },
    select: { id: true },
  });

  await sendReminders(entries);

  return NextResponse.json({ sent: entries.length });
}
