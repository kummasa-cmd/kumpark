"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarPlus, X } from "lucide-react";

interface CoachingOption {
  id: number;
  product_name: string;
  book_type: string;
  category: string;
  session_count: number;
  used_count: number;
  start_date: string;
  end_date: string | null;
}

interface ScheduleItem {
  id: number;
  coaching_id: number;
  product_name: string;
  session_date: string;
  session_time: string;
  status: "pending" | "confirmed" | "rejected" | "completed";
  member_memo: string | null;
  admin_memo: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; cls: string; dot: string }> = {
  pending: { label: "확인중", cls: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-400" },
  confirmed: { label: "확정", cls: "bg-green-50 text-green-700", dot: "bg-brand-green" },
  completed: { label: "완료", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  rejected: { label: "반려", cls: "bg-red-50 text-red-600", dot: "bg-red-400" },
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function todayStr() {
  const now = new Date();
  return toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
}

function CancelButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("신청을 취소하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/mypage/coaching-schedules/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const json = await res.json();
        alert(json.error ?? "취소에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors"
    >
      <X size={12} /> 신청 취소
    </button>
  );
}

export default function CoachingScheduleCalendar({
  coachings,
  schedules,
}: {
  coachings: CoachingOption[];
  schedules: ScheduleItem[];
}) {
  const router = useRouter();
  const today = todayStr();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [coachingId, setCoachingId] = useState<number | null>(coachings[0]?.id ?? null);
  const [time, setTime] = useState("10:00");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const s of schedules) {
      const list = map.get(s.session_date) ?? [];
      list.push(s);
      map.set(s.session_date, list);
    }
    return map;
  }, [schedules]);

  const eligibleCoachings = useMemo(
    () =>
      coachings.filter((c) => {
        if (!selectedDate) return false;
        if (selectedDate < c.start_date) return false;
        if (c.end_date && selectedDate > c.end_date) return false;
        return c.used_count < c.session_count;
      }),
    [coachings, selectedDate]
  );

  useEffect(() => {
    if (eligibleCoachings.length === 0) return;
    if (!eligibleCoachings.find((c) => c.id === coachingId)) {
      setCoachingId(eligibleCoachings[0].id);
    }
  }, [eligibleCoachings, coachingId]);

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

  const handleApply = async () => {
    setError("");
    setSuccess("");
    if (!selectedDate || !coachingId) return;

    const requestedAt = new Date(`${selectedDate}T${time}:00+09:00`);
    if (requestedAt.getTime() < Date.now() + 3 * 60 * 60 * 1000) {
      setError("이미 지난 시간이거나 현재로부터 3시간 이내인 시간에는 신청할 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/mypage/coaching-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coaching_id: coachingId,
          session_date: selectedDate,
          session_time: time,
          memo: memo.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess("코칭 일정이 신청됐습니다. (이메일 발송 포함)");
        setMemo("");
        router.refresh();
      } else {
        setError(json.error ?? "신청에 실패했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (coachings.length === 0 && schedules.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
        <p className="text-sm text-gray-400">
          코칭중 상태의 코칭 내역이 있을 때 일정을 신청할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
      {/* 달력 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-brand-green hover:text-brand-green transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="font-semibold text-gray-800">
            {cursor.year}년 {cursor.month + 1}월
          </p>
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
            const isPast = dateStr < today;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-start pt-1.5 gap-1 transition-colors ${
                  isSelected
                    ? "bg-brand-green text-white"
                    : isPast
                    ? "text-gray-300 hover:bg-gray-50"
                    : "text-gray-700 hover:bg-green-50"
                }`}
              >
                <span>{d}</span>
                {daySchedules.length > 0 && (
                  <span className="flex gap-0.5">
                    {daySchedules.slice(0, 3).map((s) => (
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

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400" /> 확인중</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-green" /> 확정</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> 완료</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> 반려</span>
        </div>
      </div>

      {/* 사이드 패널 */}
      <div className="space-y-4">
        {/* 잔여 신청 횟수 */}
        {coachings.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-400">잔여 신청 가능 횟수</p>
            {coachings.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate">{c.product_name}</span>
                <span className="text-brand-green font-semibold shrink-0 ml-2">
                  {Math.max(0, c.session_count - c.used_count)}/{c.session_count}회
                </span>
              </div>
            ))}
          </div>
        )}

        {!selectedDate ? (
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-10 text-center">
            <p className="text-sm text-gray-400">날짜를 선택하세요.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="font-semibold text-gray-800 text-sm">{selectedDate}</p>

            {selectedSchedules.length > 0 && (
              <div className="space-y-2">
                {selectedSchedules.map((s) => {
                  const st = STATUS_LABEL[s.status];
                  return (
                    <div key={s.id} className="border border-gray-100 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">{s.session_time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{s.product_name}</p>
                      {s.member_memo && (
                        <p className="text-xs text-gray-400">요청사항: {s.member_memo}</p>
                      )}
                      {s.admin_memo && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5 mt-1">
                          관리자 메모: {s.admin_memo}
                        </p>
                      )}
                      {s.status === "pending" && (
                        <div className="pt-1">
                          <CancelButton id={s.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedDate < today ? (
              <p className="text-xs text-gray-400">지난 날짜는 신청할 수 없습니다.</p>
            ) : eligibleCoachings.length === 0 ? (
              <p className="text-xs text-gray-400">이 날짜에 신청 가능한 코칭이 없습니다.</p>
            ) : (
              <div className="space-y-2.5 pt-1 border-t border-gray-50">
                {eligibleCoachings.length > 1 && (
                  <select
                    value={coachingId ?? ""}
                    onChange={(e) => setCoachingId(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-green"
                  >
                    {eligibleCoachings.map((c) => (
                      <option key={c.id} value={c.id}>{c.product_name}</option>
                    ))}
                  </select>
                )}
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green"
                />
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={2}
                  placeholder="요청사항 (선택)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green resize-none"
                />
                {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                {success && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
                <button
                  onClick={handleApply}
                  disabled={loading || !(eligibleCoachings.find((c) => c.id === coachingId))}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-green text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
                >
                  <CalendarPlus size={14} /> {loading ? "신청 중..." : "이 날짜로 신청하기"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
