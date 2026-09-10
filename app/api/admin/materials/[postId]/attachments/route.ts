import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensurePostAttachmentsTable } from "@/lib/ensure-tables";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = [
  "pdf", "doc", "docx", "hwp", "hwpx", "ppt", "pptx", "xls", "xlsx",
  "zip", "jpg", "jpeg", "png", "gif", "txt",
];

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  await ensurePostAttachmentsTable();

  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: postRows } = await pool.query(
    `SELECT p.id FROM posts p JOIN boards b ON b.id = p.board_id
     WHERE p.id = $1 AND b.slug = 'coaching-materials'`,
    [params.postId]
  );
  if (!postRows[0]) {
    return NextResponse.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const uploaded = [];
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: `허용되지 않는 파일 형식입니다: ${file.name}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `파일 크기는 10MB 이하여야 합니다: ${file.name}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { rows } = await pool.query(
      `INSERT INTO post_attachments (post_id, file_name, file_size, mime_type, file_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, file_name, file_size, download_count`,
      [params.postId, file.name, file.size, file.type || null, buffer]
    );
    uploaded.push(rows[0]);
  }

  return NextResponse.json({ attachments: uploaded }, { status: 201 });
}
