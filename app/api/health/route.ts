import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW() AS time");
    return NextResponse.json({ ok: true, time: result.rows[0].time });
  } catch (err) {
    console.error("[health]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
