import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { ensureCoachingTable } from "@/lib/ensure-tables";
import CoachingForm from "@/components/admin/CoachingForm";

export const metadata: Metadata = { title: "코칭수정" };
export const dynamic = "force-dynamic";

export default async function CoachingEditPage({
  params,
}: {
  params: { id: string };
}) {
  await ensureCoachingTable();

  const { rows } = await pool.query(
    `SELECT c.id, c.member_id, c.book_type, c.category, c.product_name, c.amount,
            TO_CHAR(c.start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(c.end_date, 'YYYY-MM-DD') AS end_date,
            c.session_count, c.completed_count, c.status,
            m.name AS member_name, m.nickname AS member_nickname, m.phone AS member_phone
     FROM coachings c
     JOIN members m ON m.id = c.member_id
     WHERE c.id = $1`,
    [params.id]
  );
  if (!rows[0]) notFound();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href="/admin/coachings"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 코칭목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">코칭수정</h1>
        <p className="text-sm text-gray-500 mt-0.5">코칭 신청 정보를 수정하세요.</p>
      </div>
      <CoachingForm coaching={rows[0]} />
    </div>
  );
}
