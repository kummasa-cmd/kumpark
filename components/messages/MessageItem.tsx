"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Reply, Trash2 } from "lucide-react";

export type MessageItemData = {
  id: number;
  content: string;
  created_at: string;
  read_at: string | null;
  counterpart: string;
  counterpartSub?: string;
};

interface Props {
  message: MessageItemData;
  box: "received" | "sent";
  // 받은 쪽지 읽음 처리 API (예: /api/mypage/messages/{id}/read)
  readEndpoint?: string;
  // 본인 쪽지함에서 삭제하는 API (예: /api/mypage/messages/{id})
  deleteEndpoint?: string;
  replyHref?: string;
}

export default function MessageItem({ message, box, readEndpoint, deleteEndpoint, replyHref }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [readAt, setReadAt] = useState(message.read_at);
  const [deleting, setDeleting] = useState(false);
  const isUnread = box === "received" && !readAt;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && isUnread && readEndpoint) {
      setReadAt("now");
      const res = await fetch(readEndpoint, { method: "PATCH" }).catch(() => null);
      if (res?.ok) router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!deleteEndpoint) return;
    if (!window.confirm("이 쪽지를 삭제하시겠습니까?\n상대방의 쪽지함에서는 삭제되지 않습니다.")) return;
    setDeleting(true);
    const res = await fetch(deleteEndpoint, { method: "DELETE" }).catch(() => null);
    setDeleting(false);
    if (res?.ok) {
      router.refresh();
    } else {
      window.alert("쪽지 삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm transition-colors ${
        isUnread ? "border-brand-green/40" : "border-gray-100"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className="w-full text-left px-5 py-4 flex items-start gap-3"
        aria-expanded={open}
      >
        <span
          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isUnread ? "bg-brand-green" : "bg-transparent"}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className={`text-sm text-gray-800 ${isUnread ? "font-bold" : "font-medium"}`}>
              {message.counterpart}
            </span>
            {message.counterpartSub && (
              <span className="text-xs text-gray-400">{message.counterpartSub}</span>
            )}
          </div>
          <p
            className={`text-sm mt-1 ${open ? "hidden" : "truncate"} ${
              isUnread ? "text-gray-800" : "text-gray-500"
            }`}
          >
            {message.content}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-gray-400">{message.created_at}</span>
          {box === "sent" ? (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                message.read_at ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {message.read_at ? "읽음" : "안읽음"}
            </span>
          ) : (
            isUnread && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">새 쪽지</span>
            )
          )}
          <ChevronDown
            size={14}
            className={`text-gray-300 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 pl-10">
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words bg-gray-50 rounded-lg px-4 py-3 leading-relaxed">
            {message.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              {box === "sent"
                ? message.read_at
                  ? `상대방 확인: ${message.read_at}`
                  : "상대방이 아직 확인하지 않았습니다."
                : null}
            </p>
            <div className="flex items-center gap-3">
              {replyHref && (
                <Link
                  href={replyHref}
                  className="flex items-center gap-1 text-xs text-brand-green hover:underline"
                >
                  <Reply size={12} /> 답장
                </Link>
              )}
              {deleteEndpoint && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={12} /> {deleting ? "삭제 중..." : "삭제"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
