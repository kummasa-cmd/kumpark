"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function PostDeleteButton({
  postId,
  title,
}: {
  postId: number;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`'${title}' 게시물을 삭제하시겠습니까?\n삭제된 게시물은 복구할 수 없습니다.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
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
      className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
    >
      <Trash2 size={12} />
      삭제
    </button>
  );
}
