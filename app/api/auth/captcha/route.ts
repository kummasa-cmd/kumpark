import { NextResponse } from "next/server";
import { createCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const captcha = await createCaptcha();
    return NextResponse.json(captcha, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[auth/captcha]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
