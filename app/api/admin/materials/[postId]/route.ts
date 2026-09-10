import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, category_id, content } = await req.json();
  if (!title?.trim() || !content || content === "<p></p>") {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  const { rowCount } = await pool.query(
    `UPDATE posts AS p
     SET title=$1, content=$2, category_id=$3, updated_at=NOW()
     FROM boards b
     WHERE p.board_id = b.id AND b.slug = 'coaching-materials' AND p.id = $4`,
    [title.trim(), content, category_id || null, params.postId]
  );

  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
