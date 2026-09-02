"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";

interface ScheduleItem {
  id: number;
  coaching_id: number;
  session_date: string;
  session_time: string;
  status: "pending" | "confirmed" | "rejected";
  member_memo: string | null;
  admin_memo: string | null;
  created_at: string;
  member_name: string;
  member_nickname: string | null;
  product_name: string;
  book_type: string;
  category: string;
}

const BOOK_TYPE_LABEL: Record<string, string> = { paper: "종이책", ebook: "전자책" };
const CATEGORY_LABEL: Record<string, string> = { group: "그룹", individual: "개인" };
const STATUS_LABEL: Record<string, { label: string; cls: string; dot: string }> = {
  pending: { label: "확인중", cls: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-400" },
  confirmed: { label: "확정", cls: "bg-green-50 text-green-700", dot: "bg-brand-green" },
  rejected: { label: "반려", cls: "bg-red-50 text-red-600", dot: "bg-red-400" },
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function ScheduleRow({ s }: { s: ScheduleItem }) {
  const router = useRouter();
  const [memo, setMemo] = useState(s.admin_memo ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const st = STATUS_LABEL[s.status];

  const decide = async (status: "confirmed" | "rejected") => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coaching-schedules/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, memo }),
      });
      const json = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(json.error ?? "처리에 실패했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-800">
            {s.member_name}
            {s.member_nickname && <span className="text-gray-400"> ({s.member_nickname})</span>}
            <span className="text-gray-400 font-normal"> · {s.session_time}</span>
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {s.product_name} · {BOOK_TYPE_LABEL[s.book_type] ?? s.book_type} · {CATEGORY_LABEL[s.category] ?? s.category}
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${st.cls}`}>{st.label}</span>
      </div>

      {s.member_memo && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5">요청사항: {s.member_memo}</p>
      )}

      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        rows={2}
        placeholder="회원에게 전달할 메모 (확정/반려 메일에 포함됩니다)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-green resize-none"
      />

      {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={() => decide("confirmed")}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
        >
          <Check size={12} /> 확정
        </button>
        <button
          onClick={() => decide("rejected")}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <X size={12} /> 반려
        </button>
      </div>
    </div>
  );
}

export default function AdminCoachingScheduleCalendar({ schedules }: { schedules: ScheduleItem[] }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const s of schedules) {
      const list = map.get(s.session_date) ?? [];
      list.push(s);
      map.set(s.session_date, list);
    }
    return map;
  }, [schedules]);

  const pendingCount = schedules.filter((s) => s.status === "pending").length;

  const cells = useMemo(() => {
    const firstDay = new Date(cursor.year, cursor.month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const list: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(d);
    return list;
  }, [cursor]);

  const changeMonth = (delta: number) => {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    setSelectedDate(null);
  };

  const selectedSchedules = selectedDate ? (schedulesByDate.get(selectedDate) ?? []) : [];

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-800">{cursor.year}년 {cursor.month + 1}월</p>
            {pendingCount > 0 && (
              <p className="text-xs text-yellow-700">확인 대기 {pendingCount}건</p>
            )}
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, idx) => {
            if (d === null) return <div key={`empty-${idx}`} />;
            const dateStr = toDateStr(cursor.year, cursor.month, d);
            const daySchedules = schedulesByDate.get(dateStr) ?? [];
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-start pt-1.5 gap-1 transition-colors ${
                  isSelected ? "bg-brand-green text-white" : "text-gray-700 hover:bg-green-50"
                }`}
              >
                <span>{d}</span>
                {daySchedules.length > 0 && (
                  <span className="flex gap-0.5">
                    {daySchedules.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" : STATUS_LABEL[s.status].dot
                        }`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> 확인중</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-green" /> 확정</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> 반려</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {!selectedDate ? (
          <div className="px-2 py-10 text-center">
            <p className="text-sm text-gray-400">날짜를 선택하면 신청 내역이 표시됩니다.</p>
          </div>
        ) : selectedSchedules.length === 0 ? (
          <div className="px-2 py-10 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-2">{selectedDate}</p>
            <p className="text-sm text-gray-400">신청 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">{selectedDate}</p>
            {selectedSchedules.map((s) => (
              <ScheduleRow key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
