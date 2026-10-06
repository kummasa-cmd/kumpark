"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2, Users } from "lucide-react";

type Recipient = { member_id: number; name: string; nickname: string; read_at: string | null };

interface Props {
  broadcast: {
    id: number;
    content: string;
    target: "all" | "selected";
    created_at: string;
    recipient_count: number;
    read_count: number;
    first_member_name: string | null;
    admin_name: string | null;
  };
}

// 여러 회원에게 보낸 쪽지 묶음 — 확인 현황을 회원별로 펼쳐 볼 수 있다
export default function BroadcastMessageItem({ broadcast: b }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title =
    b.target === "all"
      ? `To. 전체 회원 (${b.recipient_count}명)`
      : `To. ${b.first_member_name ?? "회원"}${b.recipient_count > 1 ? ` 외 ${b.recipient_count - 1}명` : ""}`;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && recipients === null) {
      setLoadError(false);
      const res = await fetch(`/api/admin/messages/broadcasts/${b.id}`).catch(() => null);
      if (res?.ok) setRecipients(await res.json());
      else setLoadError(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 쪽지를 관리자 쪽지함에서 삭제하시겠습니까?\n회원들의 쪽지함에서는 삭제되지 않습니다.")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/messages/broadcasts/${b.id}`, { method: "DELETE" }).catch(() => null);
    setDeleting(false);
    if (res?.ok) router.refresh();
    else window.alert("쪽지 삭제에 실패했습니다. 다시 시도해 주세요.");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left px-5 py-4 flex items-start gap-3"
        aria-expanded={open}
      >
        <Users size={14} className="mt-1 text-gray-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-medium text-gray-800">{title}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                b.target === "all" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
              }`}
            >
              {b.target === "all" ? "전체 발송" : "선택 발송"}
            </span>
            {b.admin_name && <span className="text-xs text-gray-400">보낸 관리자 {b.admin_name}</span>}
          </div>
          <p className={`text-sm mt-1 text-gray-500 ${open ? "hidden" : "truncate"}`}>{b.content}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-gray-400">{b.created_at}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            읽음 {b.read_count}/{b.recipient_count}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-300 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 pl-11 space-y-3">
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words bg-gray-50 rounded-lg px-4 py-3 leading-relaxed">
            {b.content}
          </p>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">회원별 확인 현황</p>
            {loadError ? (
              <p className="text-xs text-red-500">확인 현황을 불러오지 못했습니다.</p>
            ) : recipients === null ? (
              <p className="text-xs text-gray-400">불러오는 중...</p>
            ) : (
              <ul className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
                {recipients.map((r) => (
                  <li key={r.member_id} className="flex items-center justify-between px-3 py-1.5 text-xs">
                    <span className="text-gray-700">
                      {r.name}
                      {r.nickname && <span className="text-gray-400"> ({r.nickname})</span>}
                    </span>
                    {r.read_at ? (
                      <span className="text-green-700">읽음 {r.read_at}</span>
                    ) : (
                      <span className="text-gray-400">안읽음</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 size={12} /> {deleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
