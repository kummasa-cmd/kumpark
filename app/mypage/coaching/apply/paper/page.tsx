import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ChevronLeft } from "lucide-react";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import pool from "@/lib/db";
import { ensureCoachingTable } from "@/lib/ensure-tables";
import { getCoachingSettings, getCoachingDuration, getEffectivePrice, getDepositAccount } from "@/lib/coaching-settings";
import CoachingApplyForm from "@/components/mypage/CoachingApplyForm";

export const metadata: Metadata = { title: "종이책 코칭 신청" };
export const dynamic = "force-dynamic";

export default async function ApplyPaperCoachingPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureCoachingTable();
  const { rows } = await pool.query(
    `SELECT id FROM coachings
     WHERE member_id = $1 AND book_type = 'paper' AND status IN ('pending', 'in_progress')
     LIMIT 1`,
    [member.id]
  );
  const blocked = rows.length > 0;

  const settings = await getCoachingSettings();
  const duration = getCoachingDuration("paper", settings);
  const amount = getEffectivePrice("paper", settings);
  const deposit = getDepositAccount(settings);

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href="/goods/print"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 종이책 코칭 소개
        </Link>
        <h1 className="text-xl font-bold text-gray-900">종이책 코칭 신청</h1>
        <p className="text-sm text-gray-500 mt-0.5">검마사와 함께하는 1대1 종이책 코칭을 신청합니다.</p>
      </div>
      <CoachingApplyForm
        bookType="paper"
        productName="종이책 코칭"
        duration={duration}
        amount={amount}
        depositBank={deposit.bank}
        depositAccount={deposit.account}
        depositHolder={deposit.holder}
        memberName={member.name}
        memberEmail={member.email}
        blocked={blocked}
        blockedMessage="이미 진행중인 종이책 코칭이 있어 신청할 수 없습니다."
      />
    </div>
  );
}
