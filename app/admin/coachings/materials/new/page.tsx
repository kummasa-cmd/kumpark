import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import pool from "@/lib/db";
import {
  ensureCategoryTables,
  ensureCoachingMaterialsBoard,
  ensureCoachingMaterialCategories,
} from "@/lib/ensure-tables";
import MaterialForm from "@/components/admin/MaterialForm";

export const metadata: Metadata = { title: "자료 등록" };
export const dynamic = "force-dynamic";

export default async function MaterialNewPage() {
  await ensureCategoryTables();
  await ensureCoachingMaterialsBoard();
  await ensureCoachingMaterialCategories();

  const { rows: boardRows } = await pool.query(
    `SELECT id FROM boards WHERE slug = 'coaching-materials'`
  );
  const boardId = boardRows[0]?.id;

  let categories: { id: number; name: string }[] = [];
  if (boardId) {
    const { rows } = await pool.query(
      `SELECT id, name FROM board_categories WHERE board_id = $1 ORDER BY sort_order ASC, id ASC`,
      [boardId]
    );
    categories = rows;
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/coachings/materials"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 코칭 자료실
        </Link>
        <h1 className="text-xl font-bold text-gray-900">자료 등록</h1>
        <p className="text-sm text-gray-500 mt-0.5">코칭 자료실에 새 자료를 등록합니다.</p>
      </div>

      <MaterialForm categories={categories} />
    </div>
  );
}
