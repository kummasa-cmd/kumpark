import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureCoachingTable } from "@/lib/ensure-tables";

const BOOK_TYPES = ["paper", "ebook"];
const CATEGORIES = ["group", "individual"];
const STATUSES = ["pending", "in_progress", "completed", "refunded"];

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureCoachingTable();
  const { rows } = await pool.query(
    `SELECT c.id, c.member_id, c.book_type, c.category, c.product_name, c.amount,
            TO_CHAR(c.start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(c.end_date, 'YYYY-MM-DD') AS end_date,
            c.session_count, c.completed_count, c.status,
            m.name AS member_name, m.nickname AS member_nickname, m.phone AS member_phone
     FROM coachings c
     JOIN members m ON m.id = c.member_id
     WHERE c.id = $1`,
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "상태가 올바르지 않습니다." }, { status: 400 });
  }
  if (!start_date) {
    return NextResponse.json({ error: "코칭시작일은 필수입니다." }, { status: 400 });
  }

  try {
    const { rowCount } = await pool.query(
      `UPDATE coachings
       SET member_id=$1, book_type=$2, category=$3, product_name=$4, amount=$5,
           start_date=$6, end_date=$7, session_count=$8, completed_count=$9, status=$10, updated_at=NOW()
       WHERE id=$11`,
      [
        member_id, book_type, category, product_name, amount ?? 0,
        start_date, end_date || null, session_count ?? 0, completed_count ?? 0, status,
        params.id,
      ]
    );
    if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23503") {
      return NextResponse.json({ error: "존재하지 않는 회원입니다." }, { status: 400 });
    }
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { rowCount } = await pool.query(`DELETE FROM coachings WHERE id = $1`, [params.id]);
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
