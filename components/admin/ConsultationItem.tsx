"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown, Mail, CheckCircle, Trash2, StickyNote,
} from "lucide-react";

export interface Consultation {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "pending" | "resolved";
  reply: string | null;
  memo: string | null;
  member_name: string | null;
  created_at: string;
  replied_at: string | null;
}

export default function ConsultationItem({ c }: { c: Consultation }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"reply" | "memo">("reply");

  const [reply, setReply] = useState(c.reply ?? "");
  const [memo, setMemo] = useState(c.memo ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const call = async (body: object) => {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/consultations/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "오류가 발생했습니다."); return false; }
      return true;
    } catch { setError("서버에 연결할 수 없습니다."); return false; }
    finally { setLoading(false); }
  };

  const handleStatus = async () => {
    const newStatus = c.status === "pending" ? "resolved" : "pending";
    if (await call({ action: "status", status: newStatus })) router.refresh();
  };

  const handleReply = async () => {
    if (await call({ action: "reply", reply })) {
      setSuccess("답변이 전송되었습니다. (메일 발송 포함)");
      router.refresh();
    }
  };

  const handleMemo = async () => {
    if (await call({ action: "memo", memo })) {
      setSuccess("메모가 저장되었습니다.");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`"${c.subject}" 상담을 삭제하시겠습니까?`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/consultations/${c.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else { const j = await res.json(); setError(j.error ?? "삭제 실패"); }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* 요약 행 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
            {c.member_name && (
              <span className="text-xs bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded">
                회원
              </span>
            )}
            <span className="text-xs text-gray-400">{c.email}</span>
            {c.phone && <span className="text-xs text-gray-400">{c.phone}</span>}
          </div>
          <p className="text-sm font-medium text-gray-700 truncate">{c.subject}</p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.message}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            c.status === "pending"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-green-50 text-green-700"
          }`}>
            {c.status === "pending" ? "미처리" : "처리완료"}
          </span>
          <span className="text-xs text-gray-400">{c.created_at}</span>
          <ChevronDown
            size={14}
            className={`text-gray-300 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* 상세 패널 */}
      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          {/* 문의 전문 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1.5">문의 내용</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3">
              {c.message}
            </p>
          </div>

          {/* 탭 */}
          <div className="flex gap-1 border-b border-gray-100">
            <button
              onClick={() => setTab("reply")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                tab === "reply"
                  ? "border-brand-green text-brand-green"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center gap-1.5"><Mail size={12} /> 답변 {c.reply ? "수정" : "작성"}</span>
            </button>
            <button
              onClick={() => setTab("memo")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                tab === "memo"
                  ? "border-brand-green text-brand-green"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="flex items-center gap-1.5"><StickyNote size={12} /> 내부 메모</span>
            </button>
          </div>

          {tab === "reply" && (
            <div className="space-y-2">
              {c.replied_at && (
                <p className="text-xs text-gray-400">마지막 발송: {c.replied_at}</p>
              )}
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={5}
                placeholder="신청자에게 보낼 답변을 입력하세요. 저장 시 이메일로 자동 발송됩니다."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
              />
              <button
                onClick={handleReply}
                disabled={loading || !reply.trim()}
                className="inline-flex items-center gap-1.5 text-xs bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
              >
                <Mail size={12} /> {loading ? "발송 중..." : "답변 저장 & 이메일 발송"}
              </button>
            </div>
          )}

          {tab === "memo" && (
            <div className="space-y-2">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                placeholder="내부 메모 (신청자에게는 보이지 않습니다)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
              />
              <button
                onClick={handleMemo}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <StickyNote size={12} /> {loading ? "저장 중..." : "메모 저장"}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
            <button
              onClick={handleStatus}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                c.status === "pending"
                  ? "border-green-200 text-green-700 hover:bg-green-50"
                  : "border-yellow-200 text-yellow-700 hover:bg-yellow-50"
              }`}
            >
              <CheckCircle size={12} />
              {c.status === "pending" ? "처리완료로 변경" : "미처리로 변경"}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto"
            >
              <Trash2 size={12} /> 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
