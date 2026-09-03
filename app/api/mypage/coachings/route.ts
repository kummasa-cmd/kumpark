import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCoachingTable } from "@/lib/ensure-tables";
import { sendCoachingApplicationAlert } from "@/lib/mailer";
import { getCoachingSettings, getEffectivePrice } from "@/lib/coaching-settings";

async function getMe() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberToken(token);
}

const BOOK_TYPES = ["ebook", "paper"] as const;
const BOOK_TYPE_LABEL: Record<string, string> = { ebook: "전자책", paper: "종이책" };
const PRODUCT_NAME: Record<string, string> = { ebook: "전자책 코칭", paper: "종이책 코칭" };
const SESSION_COUNT = 3;

export async function POST(request: Request) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureCoachingTable();

  const {
    book_type,
    desired_start_date,
    depositor_bank,
    depositor_account,
    depositor_name,
    deposit_due_date,
  } = await request.json();

  if (!BOOK_TYPES.includes(book_type)) {
    return NextResponse.json({ error: "유형이 올바르지 않습니다." }, { status: 400 });
  }
  if (
    !desired_start_date ||
    !String(depositor_bank ?? "").trim() ||
    !String(depositor_account ?? "").trim() ||
    !String(depositor_name ?? "").trim() ||
    !deposit_due_date
  ) {
    return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }

  const { rows: activeRows } = await pool.query(
    `SELECT id FROM coachings
     WHERE member_id = $1 AND book_type = $2 AND status IN ('pending', 'in_progress')
     LIMIT 1`,
    [me.id, book_type]
  );
  if (activeRows.length > 0) {
    return NextResponse.json(
      { error: `이미 진행중인 ${BOOK_TYPE_LABEL[book_type]} 코칭이 있어 신청할 수 없습니다.` },
      { status: 409 }
    );
  }

  const productName = PRODUCT_NAME[book_type];
  const settings = await getCoachingSettings();
  const amount = getEffectivePrice(book_type, settings);

  const { rows } = await pool.query(
    `INSERT INTO coachings
       (member_id, book_type, category, product_name, amount, session_count, status,
        desired_start_date, depositor_bank, depositor_account, depositor_name, deposit_due_date)
     VALUES ($1,$2,'individual',$3,$4,$5,'pending',$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      me.id,
      book_type,
      productName,
      amount,
      SESSION_COUNT,
      desired_start_date,
      String(depositor_bank).trim(),
      String(depositor_account).trim(),
      String(depositor_name).trim(),
      deposit_due_date,
    ]
  );

  const { rows: memberRows } = await pool.query(
    `SELECT nickname FROM members WHERE id = $1`,
    [me.id]
  );

  sendCoachingApplicationAlert({
    memberName: me.name,
    memberNickname: memberRows[0]?.nickname || null,
    bookTypeLabel: BOOK_TYPE_LABEL[book_type],
    productName,
    amount,
    desiredStartDate: desired_start_date,
    depositorBank: String(depositor_bank).trim(),
    depositorAccount: String(depositor_account).trim(),
    depositorName: String(depositor_name).trim(),
    depositDueDate: deposit_due_date,
    submittedAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
  }).catch((err) => console.error("[mailer] 코칭 신청 메일 발송 실패:", err));

  return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
}
