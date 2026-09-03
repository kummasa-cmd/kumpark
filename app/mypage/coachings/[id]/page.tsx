import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import pool from "@/lib/db";
import { ensureCoachingTable, autoCompleteCoachings } from "@/lib/ensure-tables";
import { getCoachingSettings, getDepositAccount } from "@/lib/coaching-settings";
import CoachingCancelButton from "@/components/mypage/CoachingCancelButton";

export const metadata: Metadata = { title: "코칭 신청 상세" };
export const dynamic = "force-dynamic";

const BOOK_TYPE_LABEL: Record<string, string> = { paper: "종이책", ebook: "전자책" };
const CATEGORY_LABEL: Record<string, string> = { group: "그룹", individual: "개인" };
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:     { label: "입금대기", cls: "bg-yellow-50 text-yellow-700" },
  in_progress: { label: "코칭중",   cls: "bg-blue-50 text-blue-700" },
  completed:   { label: "코칭종료", cls: "bg-green-50 text-green-700" },
  refunded:    { label: "환불",     cls: "bg-red-50 text-red-600" },
};

export default async function MyCoachingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureCoachingTable();
  await autoCompleteCoachings();

  const { rows } = await pool.query(
    `SELECT id, member_id, book_type, category, product_name, amount, status,
            session_count, completed_count,
            TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
            TO_CHAR(desired_start_date, 'YYYY-MM-DD') AS desired_start_date,
            depositor_bank, depositor_account, depositor_name,
            TO_CHAR(deposit_due_date, 'YYYY-MM-DD') AS deposit_due_date,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
     FROM coachings
     WHERE id = $1`,
    [params.id]
  );
  const coaching = rows[0];
  if (!coaching || coaching.member_id !== member.id) notFound();

  const st = STATUS_LABEL[coaching.status] ?? { label: coaching.status, cls: "bg-gray-100 text-gray-500" };
  const formatAmount = (n: number) => `₩${new Intl.NumberFormat("ko-KR").format(n)}`;
  const hasDepositInfo =
    coaching.desired_start_date || coaching.depositor_bank || coaching.depositor_account ||
    coaching.depositor_name || coaching.deposit_due_date;
  const deposit = coaching.status === "pending" ? getDepositAccount(await getCoachingSettings()) : null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href="/mypage/coachings"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 코칭 내역
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">{coaching.product_name}</h1>
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {BOOK_TYPE_LABEL[coaching.book_type] ?? coaching.book_type} · {CATEGORY_LABEL[coaching.category] ?? coaching.category}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">코칭 정보</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-0.5">금액</p>
            <p className="font-medium text-brand-green">{formatAmount(coaching.amount)}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">진행 횟수</p>
            <p className="font-medium text-gray-800">{coaching.completed_count} / {coaching.session_count}회</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">코칭 시작일</p>
            <p className="font-medium text-gray-800">{coaching.start_date ?? "관리자 확인 후 안내"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">코칭 종료일</p>
            <p className="font-medium text-gray-800">{coaching.end_date ?? "-"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">신청일</p>
            <p className="font-medium text-gray-800">{coaching.created_at}</p>
          </div>
        </div>
      </div>

      {hasDepositInfo && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">신청 시 입력한 정보</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">희망 시작일</p>
              <p className="font-medium text-gray-800">{coaching.desired_start_date ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">입금 예정일</p>
              <p className="font-medium text-gray-800">{coaching.deposit_due_date ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">이체 은행명</p>
              <p className="font-medium text-gray-800">{coaching.depositor_bank ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">계좌번호</p>
              <p className="font-medium text-gray-800">{coaching.depositor_account ?? "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">입금인명</p>
              <p className="font-medium text-gray-800">{coaching.depositor_name ?? "-"}</p>
            </div>
          </div>
        </div>
      )}

      {coaching.status === "pending" && deposit && (
        <>
          <div className="bg-green-50 border border-green-100 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-brand-green mb-3">입금계좌 안내</h2>
            <div className="bg-white rounded-lg border border-green-100 px-4 py-3 text-sm text-gray-700 space-y-0.5">
              <p>은행명 : {deposit.bank}</p>
              <p>계좌번호 : {deposit.account}</p>
              <p>예금주 : {deposit.holder}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              위 계좌로 입금해주시면 확인 후 코칭이 시작되며, 코칭 내역에서 진행 상태를 안내드립니다.
            </p>
          </div>

          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-5 py-4">
            <p className="text-sm text-amber-700">입금대기 상태에서는 신청을 삭제할 수 있습니다.</p>
            <CoachingCancelButton id={coaching.id} />
          </div>
        </>
      )}
    </div>
  );
}
