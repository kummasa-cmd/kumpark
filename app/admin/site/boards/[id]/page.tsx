import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { ensureCategoryTables } from "@/lib/ensure-tables";
import BoardForm from "@/components/admin/BoardForm";

export const metadata: Metadata = { title: "게시판 수정" };
export const dynamic = "force-dynamic";

export default async function BoardEditPage({ params }: { params: { id: string } }) {
  await ensureCategoryTables();

  const { rows } = await pool.query(
    `SELECT id, name, slug, sort_order, is_visible,
            COALESCE(user_writable, TRUE) AS user_writable,
            COALESCE(use_category, FALSE) AS use_category,
            COALESCE(use_comment, FALSE) AS use_comment,
            COALESCE(board_type, 'general') AS board_type
     FROM boards WHERE id = $1`,
    [params.id]
  );

  if (!rows[0]) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/site/boards"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 게시판 목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">게시판 수정</h1>
        <p className="text-sm text-gray-500 mt-0.5">{rows[0].name} 게시판 설정을 수정합니다.</p>
      </div>
      <BoardForm board={rows[0]} />
    </div>
  );
}
