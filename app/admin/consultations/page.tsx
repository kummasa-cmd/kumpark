import type { Metadata } from "next";
import pool from "@/lib/db";
import { ensureMemberTables } from "@/lib/ensure-tables";
import ConsultationItem, { type Consultation } from "@/components/admin/ConsultationItem";
import ConsultationSearch from "@/components/admin/ConsultationSearch";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "상담목록" };
export const dynamic = "force-dynamic";

type FilterStatus = "all" | "pending" | "resolved";
const PAGE_SIZE = 10;

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string };
}) {
  await ensureMemberTables();

  const filterStatus = (searchParams.status ?? "all") as FilterStatus;
  const query = searchParams.q?.trim() ?? "";

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filterStatus === "pending")  { conditions.push(`c.status = 'pending'`); }
  if (filterStatus === "resolved") { conditions.push(`c.status = 'resolved'`); }

  if (query) {
    values.push(`%${query}%`);
    const idx = values.length;
    conditions.push(
      `(c.name ILIKE $${idx} OR c.email ILIKE $${idx} OR c.subject ILIKE $${idx})`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query<Consultation>(
    `SELECT c.id, c.name, c.email, c.phone, c.subject, c.message,
            c.status, c.reply, c.memo,
            m.name AS member_name,
            TO_CHAR(c.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
            TO_CHAR(c.replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS replied_at
     FROM consultations c
     LEFT JOIN members m ON m.id = c.member_id
     ${where}
     ORDER BY
       CASE WHEN c.status = 'pending' THEN 0 ELSE 1 END,
       c.created_at DESC`,
    values
  );

  const totalPending = rows.filter((r) => r.status === "pending").length;
  const totalResolved = rows.filter((r) => r.status === "resolved").length;

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tabs: { label: string; value: FilterStatus; count: number }[] = [
    { label: "전체",    value: "all",      count: rows.length },
    { label: "미처리",  value: "pending",  count: totalPending },
    { label: "처리완료", value: "resolved", count: totalResolved },
  ];

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">상담목록</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          전체 {rows.length}건 ·{" "}
          미처리 <span className="text-yellow-600 font-semibold">{totalPending}건</span>
        </p>
      </div>

      {/* 탭 필터 + 검색 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* 탭 */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((t) => (
            <a
              key={t.value}
              href={`/admin/consultations?status=${t.value}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterStatus === t.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  t.value === "pending" && t.count > 0
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {t.count}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* 검색 */}
        <ConsultationSearch defaultValue={query} status={filterStatus} />
      </div>

      {/* 목록 */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-sm text-gray-400">
            {query ? `"${query}" 검색 결과가 없습니다.` : "상담 내역이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pagedRows.map((c) => (
            <ConsultationItem key={c.id} c={c} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/consultations"
        searchParams={{ status: filterStatus !== "all" ? filterStatus : undefined, q: query || undefined }}
      />
    </div>
  );
}
