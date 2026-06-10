import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import PostForm from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "게시물 등록" };
export const dynamic = "force-dynamic";

export default async function PostNewPage({ params }: { params: { id: string } }) {
  const { rows } = await pool.query(
    `SELECT id, name, COALESCE(use_category, FALSE) AS use_category FROM boards WHERE id = $1`,
    [params.id]
  );
  if (!rows[0]) notFound();
  const board = rows[0];

  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  const adminName = payload
    ? (await pool.query(`SELECT name FROM admins WHERE id = $1`, [payload.id])).rows[0]?.name ?? "관리자"
    : "관리자";

  let categories: { id: number; name: string }[] = [];
  if (board.use_category) {
    try {
      const { rows: cats } = await pool.query(
        `SELECT id, name FROM board_categories WHERE board_id = $1 ORDER BY sort_order ASC, id ASC`,
        [params.id]
      );
      categories = cats;
    } catch { /* board_categories 미생성 시 빈 배열 */ }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/admin/site/boards/${params.id}/posts`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> {board.name} 게시물 목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">게시물 등록</h1>
        <p className="text-sm text-gray-500 mt-0.5">{board.name}에 새 게시물을 등록합니다.</p>
      </div>

      <PostForm
        boardId={board.id}
        defaultAuthor={adminName}
        categories={categories}
        useCategory={board.use_category}
      />
    </div>
  );
}
