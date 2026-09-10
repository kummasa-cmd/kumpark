import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Pencil, Paperclip } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { ensureCategoryTables, ensurePostAttachmentsTable } from "@/lib/ensure-tables";
import PostDeleteButton from "@/components/admin/PostDeleteButton";

export const metadata: Metadata = { title: "자료 상세" };
export const dynamic = "force-dynamic";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default async function MaterialViewPage({
  params,
}: {
  params: { postId: string };
}) {
  await ensureCategoryTables();
  await ensurePostAttachmentsTable();

  const { rows: postRows } = await pool.query(
    `SELECT p.id, p.title, p.content, p.view_count,
            bc.name AS category_name,
            TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     LEFT JOIN board_categories bc ON bc.id = p.category_id
     WHERE p.id = $1 AND b.slug = 'coaching-materials'`,
    [params.postId]
  );
  if (!postRows[0]) notFound();
  const post = postRows[0];

  const { rows: attachments } = await pool.query(
    `SELECT id, file_name, file_size, download_count
     FROM post_attachments WHERE post_id = $1 ORDER BY id ASC`,
    [params.postId]
  );
  const totalDownloads = attachments.reduce((sum, a) => sum + a.download_count, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/coachings/materials"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 코칭 자료실
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {post.category_name && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {post.category_name}
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
            </div>
            <p className="text-sm text-gray-500">
              {post.created_at} · 조회 {post.view_count} · 다운로드 {totalDownloads}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/coachings/materials/${post.id}/edit`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={12} /> 수정
            </Link>
            <PostDeleteButton postId={post.id} title={post.title} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {attachments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-1">
            첨부파일 · 다운로드 통계
          </p>
          {attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-gray-700 min-w-0">
                <Paperclip size={13} className="shrink-0 text-gray-400" />
                <span className="truncate">{a.file_name}</span>
                <span className="shrink-0 text-xs text-gray-400">{formatSize(a.file_size)}</span>
              </span>
              <span className="shrink-0 text-xs font-medium text-brand-green">
                다운로드 {a.download_count}회
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
