import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft, PenLine, MessageSquare } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCategoryTables, ensurePostMemberCol } from "@/lib/ensure-tables";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { rows } = await pool.query(
    "SELECT name FROM boards WHERE slug = $1 AND is_visible = TRUE",
    [params.slug]
  );
  return { title: rows[0]?.name ?? "게시판" };
}

const PAGE_SIZE = 20;

export default async function CommunityBoardPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  await ensureCategoryTables();
  await ensurePostMemberCol();

  const { rows: boardRows } = await pool.query(
    `SELECT id, name, slug, user_writable,
            COALESCE(use_comment, FALSE) AS use_comment,
            COALESCE(board_type, 'general') AS board_type
     FROM boards WHERE slug = $1 AND is_visible = TRUE`,
    [params.slug]
  );
  const board = boardRows[0];
  if (!board) notFound();

  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  // board_type=personal이면 본인 글만 (비로그인 시 공지만)
  let whereExtra = "";
  const queryParams: (string | number)[] = [board.id, PAGE_SIZE, offset];

  if (board.board_type === "personal") {
    if (member) {
      whereExtra = `AND (p.is_notice = TRUE OR p.member_id = $${queryParams.length + 1})`;
      queryParams.push(member.id);
    } else {
      whereExtra = `AND p.is_notice = TRUE`;
    }
  }

  const countParams: (string | number)[] = [board.id];
  let countExtra = "";
  if (board.board_type === "personal") {
    if (member) {
      countExtra = `AND (p.is_notice = TRUE OR p.member_id = $${countParams.length + 1})`;
      countParams.push(member.id);
    } else {
      countExtra = `AND p.is_notice = TRUE`;
    }
  }

  const [postsRes, countRes] = await Promise.all([
    pool.query(
      `SELECT p.id, p.title, p.author_name, p.is_notice, p.view_count,
              TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at,
              (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count,
              ROW_NUMBER() OVER (
                PARTITION BY p.board_id
                ORDER BY p.created_at ASC, p.id ASC
              ) AS rn
       FROM posts p
       WHERE p.board_id = $1 ${whereExtra}
       ORDER BY p.is_notice DESC, p.created_at DESC
       LIMIT $2 OFFSET $3`,
      queryParams
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total FROM posts p WHERE p.board_id = $1 ${countExtra}`,
      countParams
    ),
  ]);

  const posts = postsRes.rows;
  const total = countRes.rows[0].total;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const canWrite = board.user_writable && !!member;

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/community"
            className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green mb-4 transition-colors"
          >
            <ChevronLeft size={15} /> 커뮤니티
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-text">{board.name}</h1>
            {board.user_writable && (
              member ? (
                <Link
                  href={`/community/${params.slug}/new`}
                  className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
                >
                  <PenLine size={14} /> 글쓰기
                </Link>
              ) : (
                <Link
                  href={`/login?redirect=/community/${params.slug}/new`}
                  className="inline-flex items-center gap-2 border border-gray-200 text-gray-500 text-sm font-medium px-4 py-2 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors"
                >
                  <PenLine size={14} /> 로그인 후 글쓰기
                </Link>
              )
            )}
          </div>
          {board.board_type === "personal" && !member && (
            <p className="text-xs text-brand-muted mt-2">
              개인 게시판입니다.{" "}
              <Link href="/login" className="text-brand-green hover:underline">
                로그인
              </Link>
              하면 자신의 글을 볼 수 있습니다.
            </p>
          )}
        </div>

        {/* 게시물 목록 */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {posts.length === 0 ? (
            <div className="py-16 text-center text-brand-muted text-sm">
              {board.board_type === "personal" && !member
                ? "로그인 후 이용하실 수 있습니다."
                : "아직 게시물이 없습니다."}
              {canWrite && (
                <div className="mt-4">
                  <Link
                    href={`/community/${params.slug}/new`}
                    className="text-brand-green text-sm hover:underline"
                  >
                    첫 글을 작성해 보세요
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/community/${params.slug}/${p.id}`}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.is_notice && (
                          <span className="shrink-0 text-xs bg-brand-green text-white px-1.5 py-0.5 rounded font-medium">
                            공지
                          </span>
                        )}
                        <span
                          className={`font-medium truncate ${
                            p.is_notice ? "text-brand-green" : "text-brand-text"
                          }`}
                        >
                          {p.title}
                        </span>
                        {board.use_comment && p.comment_count > 0 && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 text-xs text-brand-green font-medium">
                            <MessageSquare size={11} />
                            {p.comment_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-muted mt-0.5">
                        {p.author_name} · {p.created_at}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-300">조회 {p.view_count ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-8">
            {page > 1 && (
              <Link
                href={`/community/${params.slug}?page=${page - 1}`}
                className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors"
              >
                이전
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => Math.abs(n - page) <= 2)
              .map((n) => (
                <Link
                  key={n}
                  href={`/community/${params.slug}?page=${n}`}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    n === page
                      ? "bg-brand-green text-white"
                      : "border border-gray-200 text-gray-500 hover:border-brand-green hover:text-brand-green"
                  }`}
                >
                  {n}
                </Link>
              ))}
            {page < totalPages && (
              <Link
                href={`/community/${params.slug}?page=${page + 1}`}
                className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors"
              >
                다음
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
