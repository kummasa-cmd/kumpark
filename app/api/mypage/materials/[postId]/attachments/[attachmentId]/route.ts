import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { get } from "@vercel/blob";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { hasCoachingBoardAccess } from "@/lib/coaching-access";

export async function GET(
  _req: Request,
  { params }: { params: { postId: string; attachmentId: string } }
) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!(await hasCoachingBoardAccess(member.id))) {
    return NextResponse.json({ error: "이용 권한이 없습니다." }, { status: 403 });
  }

  const { rows } = await pool.query(
    `UPDATE post_attachments AS a
     SET download_count = download_count + 1
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     WHERE a.id = $1 AND a.post_id = $2
       AND p.id = a.post_id AND b.slug = 'coaching-materials'
     RETURNING a.file_name, a.mime_type, a.blob_url`,
    [params.attachmentId, params.postId]
  );
  const file = rows[0];
  if (!file?.blob_url) return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });

  const blob = await get(file.blob_url, { access: "private" });
  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": file.mime_type || blob.blob.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.file_name)}`,
    },
  });
}
