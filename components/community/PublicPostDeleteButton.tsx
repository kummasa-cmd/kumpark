"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  postId: number;
  title: string;
  slug: string;
}

export default function PublicPostDeleteButton({ postId, title, slug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${title}"\n\n이 게시물을 삭제하시겠습니까?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/community/${slug}`);
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
      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 size={12} /> 삭제
    </button>
  );
}
