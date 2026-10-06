"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, X, Users, UserCheck } from "lucide-react";
import MemberMultiSelect from "./MemberMultiSelect";
import type { SelectedMember } from "./MemberSearchSelect";

const MAX_LENGTH = 1000;

interface Props {
  // 전체 발송 대상(활성 회원) 수
  activeMemberCount: number;
  // 답장 시 미리 선택된 회원
  initialRecipient?: SelectedMember | null;
}

export default function AdminMessageComposeForm({ activeMemberCount, initialRecipient = null }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(initialRecipient));
  const [target, setTarget] = useState<"selected" | "all">("selected");
  const [recipients, setRecipients] = useState<SelectedMember[]>(
    initialRecipient ? [initialRecipient] : []
  );
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const close = () => {
    setOpen(false);
    setContent("");
    setError("");
    setRecipients([]);
    setTarget("selected");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (target === "selected" && recipients.length === 0) return setError("받는 회원을 선택하세요.");
    if (!content.trim()) return setError("쪽지 내용을 입력하세요.");

    const count = target === "all" ? activeMemberCount : recipients.length;
    const label = target === "all" ? `활성 회원 전체(${count}명)` : `선택한 회원 ${count}명`;
    if (count > 1 && !window.confirm(`${label}에게 쪽지를 보내시겠습니까?`)) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, memberIds: recipients.map((r) => r.id), content }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "쪽지 전송에 실패했습니다.");
        return;
      }
      close();
      router.push("/admin/messages?tab=sent");
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

  const modes = [
    { value: "selected", label: "개별 발송", desc: "회원 선택", icon: UserCheck },
    { value: "all", label: "전체 발송", desc: `활성 회원 ${activeMemberCount}명`, icon: Users },
  ] as const;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 w-full"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">회원에게 쪽지 보내기</h2>
        <button type="button" onClick={close} className="text-gray-400 hover:text-gray-600" aria-label="닫기">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = target === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setTarget(m.value)}
              aria-pressed={active}
              className={`flex items-center gap-2.5 border rounded-lg px-3 py-2.5 text-left transition-colors ${
                active ? "border-brand-green bg-green-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Icon size={16} className={active ? "text-brand-green" : "text-gray-400"} />
              <span>
                <span className={`block text-sm font-medium ${active ? "text-brand-green" : "text-gray-700"}`}>
                  {m.label}
                </span>
                <span className="block text-xs text-gray-400">{m.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {target === "selected" ? (
        <div>
          <MemberMultiSelect value={recipients} onChange={setRecipients} />
          <p className="text-xs text-gray-400 mt-1.5">선택한 회원 {recipients.length}명</p>
        </div>
      ) : (
        <p className="text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
          활성 상태인 회원 {activeMemberCount}명 모두에게 같은 쪽지가 전달됩니다.
        </p>
      )}

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
