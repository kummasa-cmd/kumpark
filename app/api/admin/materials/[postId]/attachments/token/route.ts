import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

// Vercel rejects request bodies over ~4.5MB before they reach the function,
// so files upload directly from the browser to Blob storage; this route only
// issues a short-lived, scoped token for that direct upload.
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = [
  "pdf", "doc", "docx", "hwp", "hwpx", "ppt", "pptx", "xls", "xlsx",
  "zip", "jpg", "jpeg", "png", "gif", "txt",
];

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
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

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
        if (!ALLOWED_EXT.includes(ext)) {
          throw new Error(`허용되지 않는 파일 형식입니다: .${ext}`);
        }
        return {
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: false,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "업로드 토큰 발급에 실패했습니다." },
      { status: 400 }
    );
  }
}
