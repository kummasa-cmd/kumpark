"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function CoachingCancelButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("코칭 신청을 삭제하시겠습니까?\n삭제된 내역은 복구할 수 없습니다.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/mypage/coachings/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/mypage/coachings");
        router.refresh();
      } else {
        const json = await res.json();
        alert(json.error ?? "삭제에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 disabled:opacity-40 transition-colors border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg"
    >
      <Trash2 size={14} />
      {loading ? "삭제 중..." : "신청 삭제"}
    </button>
  );
}
