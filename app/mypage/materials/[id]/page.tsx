import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft, Paperclip, Download } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { rows } = await pool.query(
    `SELECT p.title FROM posts p JOIN boards b ON b.id = p.board_id
     WHERE p.id = $1 AND b.slug = 'coaching-materials'`,
    [params.id]
  );
  return { title: rows[0]?.title ?? "코칭 자료실" };
}

export default async function MyMaterialDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center text-sm text-gray-400">
        로그인이 필요합니다.
      </div>
    );
  }

  const { rows: memberRows } = await pool.query(
    `SELECT coaching_yn FROM members WHERE id = $1`,
    [member.id]
  );
  if (memberRows[0]?.coaching_yn !== "Y") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
        <p className="text-sm text-gray-400">코칭 신청 회원만 이용할 수 있는 자료실입니다.</p>
      </div>
    );
  }

  const { rows: postRows } = await pool.query(
    `SELECT p.id, p.title, p.content, p.view_count,
            bc.name AS category_name,
            TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     LEFT JOIN board_categories bc ON bc.id = p.category_id
     WHERE p.id = $1 AND b.slug = 'coaching-materials'`,
    [params.id]
  );
  const post = postRows[0];
  if (!post) notFound();

  await pool.query(
    `UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1`,
    [post.id]
  );

  const { rows: attachments } = await pool.query(
    `SELECT id, file_name, file_size FROM post_attachments WHERE post_id = $1 ORDER BY id ASC`,
    [post.id]
  );

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/mypage/materials"
          className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green mb-3 transition-colors"
        >
          <ChevronLeft size={15} /> 코칭 자료실
        </Link>
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {post.category_name && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {post.category_name}
              </span>
            )}
            <h1 className="text-xl font-bold text-brand-text">{post.title}</h1>
          </div>
          <p className="text-sm text-brand-muted">
            {post.created_at} · 조회 {(post.view_count ?? 0) + 1}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-2">
          <p className="text-sm font-medium text-brand-text mb-1">첨부파일</p>
          {attachments.map((a) => (
            <a
              key={a.id}
              href={`/api/mypage/materials/${post.id}/attachments/${a.id}`}
              className="flex items-center justify-between gap-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2.5 transition-colors"
            >
              <span className="flex items-center gap-2 text-gray-700 min-w-0">
                <Paperclip size={13} className="shrink-0 text-gray-400" />
                <span className="truncate">{a.file_name}</span>
                <span className="shrink-0 text-xs text-gray-400">{formatSize(a.file_size)}</span>
              </span>
              <Download size={14} className="shrink-0 text-brand-green" />
            </a>
          ))}
        </div>
      )}

      <div>
        <Link
          href="/mypage/materials"
          className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green transition-colors"
        >
          <ChevronLeft size={15} /> 목록으로
        </Link>
      </div>
    </div>
  );
}
