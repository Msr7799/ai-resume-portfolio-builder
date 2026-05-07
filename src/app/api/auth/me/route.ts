import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/server/auth";

export async function GET() {
  const user = await requireAuthUser();
  return NextResponse.json({ user });
}
