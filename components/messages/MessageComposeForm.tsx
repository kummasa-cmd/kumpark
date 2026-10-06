"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X } from "lucide-react";

const MAX_LENGTH = 1000;

// 회원 → 관리자 쪽지 작성 (관리자 발송은 AdminMessageComposeForm)
interface Props {
  endpoint: string;
  // 발송 후 이동할 보낸 쪽지 목록
  sentHref: string;
}

export default function MessageComposeForm({ endpoint, sentHref }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const close = () => {
    setOpen(false);
    setContent("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) return setError("쪽지 내용을 입력하세요.");

    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "쪽지 전송에 실패했습니다.");
        return;
      }
      close();
      router.push(sentHref);
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-brand-green text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
      >
        <Send size={14} /> 쪽지 보내기
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3 w-full"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">관리자에게 쪽지 보내기</h2>
        <button type="button" onClick={close} className="text-gray-400 hover:text-gray-600" aria-label="닫기">
          <X size={16} />
        </button>
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          maxLength={MAX_LENGTH}
          rows={6}
          placeholder="쪽지 내용을 입력하세요."
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-1">
          {content.length} / {MAX_LENGTH}자
        </p>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-1.5 bg-brand-green text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60"
        >
          <Send size={14} /> {sending ? "보내는 중..." : "보내기"}
        </button>
      </div>
    </form>
  );
}
