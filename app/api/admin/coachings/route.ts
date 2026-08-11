import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureCoachingTable } from "@/lib/ensure-tables";

const BOOK_TYPES = ["paper", "ebook"];
const CATEGORIES = ["group", "individual"];
const STATUSES = ["pending", "in_progress", "completed", "refunded"];

export async function POST(req: Request) {
  await ensureCoachingTable();
  const {
    member_id, book_type, category, product_name, amount,
    start_date, end_date, session_count, completed_count, status,
  } = await req.json();

  if (!member_id || !product_name) {
    return NextResponse.json({ error: "회원과 상품명은 필수입니다." }, { status: 400 });
  }
  if (!BOOK_TYPES.includes(book_type)) {
    return NextResponse.json({ error: "유형이 올바르지 않습니다." }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "구분이 올바르지 않습니다." }, { status: 400 });
  }
  if (status && !STATUSES.includes(status)) {
    return NextResponse.json({ error: "상태가 올바르지 않습니다." }, { status: 400 });
  }
  if (!start_date) {
    return NextResponse.json({ error: "코칭시작일은 필수입니다." }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO coachings
         (member_id, book_type, category, product_name, amount, start_date, end_date, session_count, completed_count, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        member_id, book_type, category, product_name,
        amount ?? 0, start_date, end_date || null, session_count ?? 0,
        completed_count ?? 0, status ?? "pending",
      ]
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23503") {
      return NextResponse.json({ error: "존재하지 않는 회원입니다." }, { status: 400 });
    }
    throw e;
  }
}
