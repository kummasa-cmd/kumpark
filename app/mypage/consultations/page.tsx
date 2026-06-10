import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberTables } from "@/lib/ensure-tables";

export const metadata: Metadata = { title: "상담 내역" };
export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureMemberTables();

  const { rows } = await pool.query(
    `SELECT id, subject, message, status,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
     FROM consultations
     WHERE member_id = $1
     ORDER BY created_at DESC`,
    [member.id]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">상담 내역</h1>
        <p className="text-sm text-gray-500 mt-0.5">신청하신 무료상담 내역입니다.</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm mb-4">상담 내역이 없습니다.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
          >
            무료상담 신청하기 <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="font-semibold text-gray-800">{c.subject}</p>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                  c.status === "pending"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-green-50 text-green-700"
                }`}>
                  {c.status === "pending" ? "답변대기" : "처리완료"}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{c.message}</p>
              <p className="text-xs text-gray-400 mt-3">{c.created_at}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
