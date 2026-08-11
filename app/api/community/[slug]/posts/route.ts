import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCategoryTables, ensurePostMemberCol, ensureMemberColumns } from "@/lib/ensure-tables";
import { sendCoachingPostAlert } from "@/lib/mailer";

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  await ensureCategoryTables();
  await ensurePostMemberCol();
  await ensureMemberColumns();

  const { rows: boardRows } = await pool.query(
    `SELECT id, slug, user_writable FROM boards WHERE slug = $1 AND is_visible = TRUE`,
    [params.slug]
  );
  const board = boardRows[0];
  if (!board) return NextResponse.json({ error: "게시판을 찾을 수 없습니다." }, { status: 404 });
  if (!board.user_writable) return NextResponse.json({ error: "이 게시판에는 글을 쓸 수 없습니다." }, { status: 403 });

  const { title, content } = await request.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });
  }

  // 닉네임 우선, 없으면 이름
  const { rows: memberRows } = await pool.query(
    "SELECT name, nickname, coaching_yn FROM members WHERE id = $1",
    [member.id]
  );
  if (board.slug === "coaching" && memberRows[0]?.coaching_yn !== "Y") {
    return NextResponse.json({ error: "코칭 신청 회원만 이용할 수 있습니다." }, { status: 403 });
  }
  const authorName = memberRows[0]?.nickname || memberRows[0]?.name || member.name;

  const { rows } = await pool.query(
    `INSERT INTO posts (board_id, title, author_name, member_id, content, is_notice, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, FALSE, NOW(), NOW()) RETURNING id`,
    [board.id, title.trim(), authorName, member.id, content.trim()]
  );

  // 코칭 게시판 글 등록 시 관리자 알림 메일 — 실패해도 글 등록은 성공으로 처리
  if (board.slug === "coaching") {
    const submittedAt = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    sendCoachingPostAlert({
      memberName: authorName,
      title: title.trim(),
      content: content.trim(),
      postId: rows[0].id,
      submittedAt,
    }).catch((err) => console.error("[mailer] 코칭 게시판 알림 메일 발송 실패:", err));
  }

  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}
