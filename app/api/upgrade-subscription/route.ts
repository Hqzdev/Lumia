import { NextRequest, NextResponse } from "next/server";
import { updateUserSubscription } from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  const { userId, subscription } = await req.json();
  console.log("API: userId:", userId, "subscription:", subscription);
  if (!userId || !subscription) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  try {
    await updateUserSubscription({ userId, subscription });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DB error:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
} 