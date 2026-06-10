import { NextResponse } from "next/server";
import { MEMBER_COOKIE } from "@/lib/member-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(MEMBER_COOKIE);
  return response;
}
