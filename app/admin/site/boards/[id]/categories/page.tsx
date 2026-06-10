import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "카테고리 관리" };
export const dynamic = "force-dynamic";

export default async function BoardCategoriesPage({ params }: { params: { id: string } }) {
  const { rows: boardRows } = await pool.query(
    `SELECT id, name, slug FROM boards WHERE id = $1`,
    [params.id]
  );
  if (!boardRows[0]) notFound();
  const board = boardRows[0];

  // 테이블이 없을 수 있으므로 안전하게 조회
  let categories: { id: number; name: string; sort_order: number }[] = [];
  try {
    const { rows } = await pool.query(
      `SELECT id, name, sort_order FROM board_categories
       WHERE board_id = $1 ORDER BY sort_order ASC, id ASC`,
      [params.id]
    );
    categories = rows;
  } catch {
    // board_categories 테이블 미존재 시 카테고리 API가 자동 생성함
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
        <h1 className="text-xl font-bold text-gray-900">카테고리 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {board.name} 게시판의 카테고리를 관리합니다.
        </p>
      </div>

      <CategoryManager boardId={board.id} initialCategories={categories} />
    </div>
  );
}
