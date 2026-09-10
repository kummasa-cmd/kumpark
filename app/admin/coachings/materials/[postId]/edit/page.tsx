import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import {
  ensureCategoryTables,
  ensurePostAttachmentsTable,
  ensureCoachingMaterialCategories,
} from "@/lib/ensure-tables";
import MaterialForm from "@/components/admin/MaterialForm";

export const metadata: Metadata = { title: "자료 수정" };
export const dynamic = "force-dynamic";

export default async function MaterialEditPage({
  params,
}: {
  params: { postId: string };
}) {
  await ensureCategoryTables();
  await ensurePostAttachmentsTable();
  await ensureCoachingMaterialCategories();

  const { rows: postRows } = await pool.query(
    `SELECT p.id, p.title, p.content, p.category_id, p.board_id
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     WHERE p.id = $1 AND b.slug = 'coaching-materials'`,
    [params.postId]
  );
  if (!postRows[0]) notFound();
  const post = postRows[0];

  const [{ rows: categories }, { rows: attachments }] = await Promise.all([
    pool.query(
      `SELECT id, name FROM board_categories WHERE board_id = $1 ORDER BY sort_order ASC, id ASC`,
      [post.board_id]
    ),
    pool.query(
      `SELECT id, file_name, file_size, download_count
       FROM post_attachments WHERE post_id = $1 ORDER BY id ASC`,
      [post.id]
    ),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/admin/coachings/materials/${post.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 자료 상세
        </Link>
        <h1 className="text-xl font-bold text-gray-900">자료 수정</h1>
        <p className="text-sm text-gray-500 mt-0.5">자료 정보를 수정합니다.</p>
      </div>

      <MaterialForm categories={categories} post={post} initialAttachments={attachments} />
    </div>
  );
}
