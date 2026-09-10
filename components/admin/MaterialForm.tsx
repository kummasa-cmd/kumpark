"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import { Paperclip, X } from "lucide-react";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

type Category = { id: number; name: string };
type Attachment = { id: number; file_name: string; file_size: number; download_count: number };

type PostData = {
  id: number;
  title: string;
  content: string;
  category_id: number | null;
};

type FormData = {
  title: string;
  content: string;
  category_id: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // keep in sync with app/api/admin/materials/[postId]/attachments/route.ts

export default function MaterialForm({
  categories,
  post,
  initialAttachments = [],
}: {
  categories: Category[];
  post?: PostData;
  initialAttachments?: Attachment[];
}) {
  const isEdit = !!post;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: isEdit
      ? {
          title: post.title,
          content: post.content,
          category_id: post.category_id ? String(post.category_id) : "",
        }
      : { title: "", content: "", category_id: "" },
  });

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const tooBig = picked.filter((f) => f.size > MAX_FILE_SIZE);
    if (tooBig.length > 0) {
      alert(
        `파일 크기는 4MB 이하여야 합니다: ${tooBig.map((f) => f.name).join(", ")}`
      );
    }
    const ok = picked.filter((f) => f.size <= MAX_FILE_SIZE);
    setNewFiles((prev) => [...prev, ...ok]);
    e.target.value = "";
  };

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingAttachment = async (id: number) => {
    if (!confirm("첨부파일을 삭제하시겠습니까?")) return;
    setRemovingId(id);
    try {
      const res = await fetch(`/api/admin/materials/attachments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
      } else {
        const j = await res.json();
        alert(j.error ?? "삭제에 실패했습니다.");
      }
    } finally {
      setRemovingId(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!data.content || data.content === "<p></p>") {
      setError("내용을 입력하세요.");
      return;
    }
    if (!data.category_id) {
      setError("분류를 선택하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body = {
        title: data.title,
        content: data.content,
        category_id: Number(data.category_id),
      };
      const url = isEdit ? `/api/admin/materials/${post.id}` : `/api/admin/materials`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "처리에 실패했습니다.");
        setLoading(false);
        return;
      }

      const postId = isEdit ? post.id : json.id;

      // Upload one file per request: bundling several files into a single
      // multipart body can exceed Vercel's request size limit even when
      // each file is individually under the per-file cap.
      for (const f of newFiles) {
        const fd = new FormData();
        fd.append("files", f);
        const upRes = await fetch(`/api/admin/materials/${postId}/attachments`, {
          method: "POST",
          body: fd,
        });
        if (!upRes.ok) {
          const message = await upRes
            .json()
            .then((j) => j.error as string | undefined)
            .catch(() => undefined);
          setError(message ?? `첨부파일 업로드에 실패했습니다: ${f.name}`);
          setLoading(false);
          return;
        }
      }

      router.push(`/admin/coachings/materials/${postId}`);
      router.refresh();
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("title", { required: "제목을 입력하세요." })}
            placeholder="자료 제목"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            분류 <span className="text-red-500">*</span>
          </label>
          <select
            {...register("category_id", { required: "분류를 선택하세요." })}
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white"
          >
            <option value="">선택하세요</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>
          )}
          {categories.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">
              분류를 불러오지 못했습니다. 페이지를 새로고침해 주세요.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용 <span className="text-red-500">*</span>
        </label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => <RichEditor value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          첨부파일
          <span className="ml-2 text-xs text-gray-400 font-normal">
            PDF·문서·이미지·압축파일 (개당 4MB 이하)
          </span>
        </label>

        {attachments.length > 0 && (
          <ul className="space-y-1.5">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="flex items-center gap-2 text-gray-700 min-w-0">
                  <Paperclip size={13} className="shrink-0 text-gray-400" />
                  <span className="truncate">{a.file_name}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatSize(a.file_size)} · 다운로드 {a.download_count}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeExistingAttachment(a.id)}
                  disabled={removingId === a.id}
                  className="shrink-0 text-gray-400 hover:text-red-500 disabled:opacity-40"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {newFiles.length > 0 && (
          <ul className="space-y-1.5">
            {newFiles.map((f, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-2 text-sm bg-green-50 rounded-lg px-3 py-2"
              >
                <span className="flex items-center gap-2 text-gray-700 min-w-0">
                  <Paperclip size={13} className="shrink-0 text-gray-400" />
                  <span className="truncate">{f.name}</span>
                  <span className="shrink-0 text-xs text-gray-400">{formatSize(f.size)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeNewFile(idx)}
                  className="shrink-0 text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <input type="file" multiple onChange={handleFilePick} className="text-sm" />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : isEdit ? "수정하기" : "자료 등록"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
