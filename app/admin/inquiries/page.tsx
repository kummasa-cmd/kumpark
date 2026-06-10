import type { Metadata } from "next";
import pool from "@/lib/db";
import { ensureMemberTables } from "@/lib/ensure-tables";
import InquiryReplySection from "@/components/admin/InquiryReplySection";

export const metadata: Metadata = { title: "1대1 문의" };
export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await ensureMemberTables();

  const { rows } = await pool.query(`
    SELECT i.id, i.subject, i.message, i.status, i.reply,
           m.name AS member_name, m.email AS member_email,
           TO_CHAR(i.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
           TO_CHAR(i.replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS replied_at
    FROM member_inquiries i
    JOIN members m ON m.id = i.member_id
    ORDER BY
      CASE WHEN i.status = 'pending' THEN 0 ELSE 1 END,
      i.created_at DESC
  `);

  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">1대1 문의</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          전체 {rows.length}건 · 미답변{" "}
          <span className="text-yellow-600 font-semibold">{pending}건</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm">문의 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((q) => (
            <InquiryReplySection key={q.id} inquiry={q} />
          ))}
        </div>
      )}
    </div>
  );
}
