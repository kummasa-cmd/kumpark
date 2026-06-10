import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell, Star, MessageSquare, Trophy, Quote, BookOpen,
  ChevronRight, MessageSquare as CommentIcon,
} from "lucide-react";
import pool from "@/lib/db";
import { ensureCategoryTables, ensurePostMemberCol } from "@/lib/ensure-tables";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "검파크 커뮤니티. 공지사항, 코칭 후기, 명언, 자유게시판, 챌린지 게시판.",
};
export const dynamic = "force-dynamic";

function boardIcon(name: string) {
  if (name.includes("공지")) return Bell;
  if (name.includes("후기") || name.includes("코칭")) return Star;
  if (name.includes("명언")) return Quote;
  if (name.includes("자유")) return MessageSquare;
  if (name.includes("챌린지")) return Trophy;
  return BookOpen;
}

function boardColor(name: string) {
  if (name.includes("공지"))  return { bg: "bg-blue-50",   icon: "text-blue-500",   border: "border-blue-100",   title: "text-blue-600"   };
  if (name.includes("후기") || name.includes("코칭")) return { bg: "bg-yellow-50", icon: "text-yellow-500", border: "border-yellow-100", title: "text-yellow-600" };
  if (name.includes("명언"))  return { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100", title: "text-purple-600" };
  if (name.includes("자유"))  return { bg: "bg-green-50",  icon: "text-brand-green",  border: "border-green-100",  title: "text-brand-green"  };
  if (name.includes("챌린지")) return { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100", title: "text-orange-600" };
  return { bg: "bg-gray-50", icon: "text-gray-500", border: "border-gray-100", title: "text-gray-600" };
}

type Board = {
  id: number;
  name: string;
  slug: string;
  use_comment: boolean;
  post_count: number;
};

type Post = {
  id: number;
  board_id: number;
  title: string;
  author_name: string;
  is_notice: boolean;
  created_at: string;
  comment_count: number;
};

export default async function CommunityPage() {
  await ensureCategoryTables();
  await ensurePostMemberCol();

  const [boardsRes, postsRes] = await Promise.all([
    pool.query<Board>(`
      SELECT b.id, b.name, b.slug,
             COALESCE(b.use_comment, FALSE) AS use_comment,
             COUNT(p.id)::int AS post_count
      FROM boards b
      LEFT JOIN posts p ON p.board_id = b.id
      WHERE b.is_visible = TRUE
        AND COALESCE(b.board_type, 'general') = 'general'
      GROUP BY b.id, b.name, b.slug, b.use_comment
      ORDER BY b.sort_order ASC, b.id ASC
    `),
    // 게시판별 최신 5개 — ROW_NUMBER 윈도우 함수 활용
    pool.query<Post>(`
      WITH ranked AS (
        SELECT
          p.id, p.board_id, p.title, p.author_name,
          COALESCE(p.is_notice, FALSE) AS is_notice,
          TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'MM-DD') AS created_at,
          (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count,
          ROW_NUMBER() OVER (
            PARTITION BY p.board_id
            ORDER BY p.is_notice DESC, p.created_at DESC
          ) AS rn
        FROM posts p
        JOIN boards b ON b.id = p.board_id
        WHERE b.is_visible = TRUE
          AND COALESCE(b.board_type, 'general') = 'general'
      )
      SELECT id, board_id, title, author_name, is_notice, created_at, comment_count
      FROM ranked
      WHERE rn <= 5
    `),
  ]);

  const boards = boardsRes.rows;
  const posts = postsRes.rows;

  // board_id별로 posts 그룹핑
  const postsByBoard = posts.reduce<Record<number, Post[]>>((acc, p) => {
    if (!acc[p.board_id]) acc[p.board_id] = [];
    acc[p.board_id].push(p);
    return acc;
  }, {});

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-3">
            Community
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text mb-4">커뮤니티</h1>
          <p className="text-brand-muted">
            같은 꿈을 가진 작가들이 모이는 공간입니다.
            <br />
            함께 쓰고, 함께 성장하세요.
          </p>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16 text-brand-muted">
            <p>게시판이 아직 개설되지 않았습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {boards.map((board) => {
              const Icon = boardIcon(board.name);
              const color = boardColor(board.name);
              const boardPosts = postsByBoard[board.id] ?? [];

              return (
                <div
                  key={board.id}
                  className={`rounded-2xl border ${color.border} bg-white overflow-hidden flex flex-col`}
                >
                  {/* 게시판 헤더 */}
                  <div className={`${color.bg} px-5 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/70 rounded-lg flex items-center justify-center">
                        <Icon size={16} className={color.icon} />
                      </div>
                      <div>
                        <h2 className={`font-bold text-sm ${color.title}`}>{board.name}</h2>
                        <p className="text-xs text-gray-400">게시물 {board.post_count}개</p>
                      </div>
                    </div>
                    <Link
                      href={`/community/${board.slug}`}
                      className={`flex items-center gap-1 text-xs font-medium ${color.title} hover:opacity-70 transition-opacity`}
                    >
                      더보기 <ChevronRight size={13} />
                    </Link>
                  </div>

                  {/* 게시물 목록 */}
                  <div className="flex-1 divide-y divide-gray-50">
                    {boardPosts.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-gray-300">
                        아직 게시물이 없습니다.
                      </div>
                    ) : (
                      boardPosts.map((p) => (
                        <Link
                          key={p.id}
                          href={`/community/${board.slug}/${p.id}`}
                          className="flex items-center gap-2 px-5 py-3 hover:bg-gray-50 transition-colors"
                        >
                          {p.is_notice && (
                            <span className="shrink-0 text-xs bg-brand-green text-white px-1.5 py-0.5 rounded font-medium leading-none">
                              공지
                            </span>
                          )}
                          <span className="flex-1 text-sm text-brand-text truncate">
                            {p.title}
                          </span>
                          <div className="shrink-0 flex items-center gap-2">
                            {board.use_comment && p.comment_count > 0 && (
                              <span className="flex items-center gap-0.5 text-xs text-brand-green font-medium">
                                <CommentIcon size={11} />
                                {p.comment_count}
                              </span>
                            )}
                            <span className="text-xs text-gray-300">{p.created_at}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  {/* 하단 글쓰기 링크 */}
                  <div className={`${color.bg} px-5 py-2.5 border-t ${color.border}`}>
                    <Link
                      href={`/community/${board.slug}`}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      전체 게시물 보기 →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
