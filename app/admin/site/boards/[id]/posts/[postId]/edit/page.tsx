import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensureCategoryTables } from "@/lib/ensure-tables";
import PostForm from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "게시물 수정" };
export const dynamic = "force-dynamic";

export default async function PostEditPage({
  params,
}: {
  params: { id: string; postId: string };
}) {
  await ensureCategoryTables();

  const [boardResult, postResult] = await Promise.all([
    pool.query(
      `SELECT id, name, COALESCE(use_category, FALSE) AS use_category FROM boards WHERE id = $1`,
      [params.id]
    ),
    pool.query(
      `SELECT id, board_id, title, author_name, content,
              COALESCE(is_notice, FALSE) AS is_notice,
              category_id,
              TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM posts WHERE id = $1 AND board_id = $2`,
      [params.postId, params.id]
    ),
  ]);

  if (!boardResult.rows[0] || !postResult.rows[0]) notFound();
  const board = boardResult.rows[0];
  const post = postResult.rows[0];

  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  const adminName = payload
    ? (await pool.query(`SELECT name FROM admins WHERE id = $1`, [payload.id])).rows[0]?.name ??
      "관리자"
    : "관리자";

  let categories: { id: number; name: string }[] = [];
  if (board.use_category) {
    try {
      const { rows: cats } = await pool.query(
        `SELECT id, name FROM board_categories WHERE board_id = $1 ORDER BY sort_order ASC, id ASC`,
        [params.id]
      );
      categories = cats;
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/admin/site/boards/${params.id}/posts/${params.postId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 게시물 상세
        </Link>
        <h1 className="text-xl font-bold text-gray-900">게시물 수정</h1>
        <p className="text-sm text-gray-500 mt-0.5">게시물 정보를 수정합니다.</p>
      </div>

      <PostForm
        boardId={board.id}
        defaultAuthor={adminName}
        categories={categories}
        useCategory={board.use_category}
        post={post}
      />
    </div>
  );
}
