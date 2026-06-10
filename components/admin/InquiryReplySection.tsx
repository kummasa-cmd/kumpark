"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Inquiry {
  id: number;
  subject: string;
  message: string;
  status: string;
  reply: string | null;
  member_name: string;
  member_email: string;
  created_at: string;
  replied_at: string | null;
}

export default function InquiryReplySection({ inquiry: q }: { inquiry: Inquiry }) {
  const router = useRouter();
  const [reply, setReply] = useState(q.reply ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReply = async () => {
    if (!reply.trim()) { setError("답변 내용을 입력하세요."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${q.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const json = await res.json();
        setError(json.error ?? "답변 저장에 실패했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <details className="bg-white rounded-xl border border-gray-100 group">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
            q.status === "pending"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-green-50 text-green-700"
          }`}>
            {q.status === "pending" ? "미답변" : "답변완료"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{q.subject}</p>
            <p className="text-xs text-gray-400">{q.member_name} · {q.member_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <p className="text-xs text-gray-400 hidden sm:block">{q.created_at}</p>
          <ChevronDown size={16} className="text-gray-400 transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1">문의 내용</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{q.message}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1.5">
            관리자 답변{q.replied_at ? ` · ${q.replied_at}` : ""}
          </p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="답변 내용을 입력하세요"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          <button
            onClick={handleReply}
            disabled={loading}
            className="mt-2 bg-brand-green text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60"
          >
            {loading ? "저장 중..." : q.reply ? "답변 수정" : "답변 등록"}
          </button>
        </div>
      </div>
    </details>
  );
}
