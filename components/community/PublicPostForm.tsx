"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { Controller } from "react-hook-form";

const RichEditor = dynamic(() => import("@/components/admin/RichEditor"), { ssr: false });

type FormData = { title: string; content: string };

interface Props {
  slug: string;
  post?: { id: number; title: string; content: string };
  basePath?: string;
}

export default function PublicPostForm({ slug, post, basePath }: Props) {
  const resolvedBasePath = basePath ?? `/community/${slug}`;
  const router = useRouter();
  const isEdit = !!post;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: { title: post?.title ?? "", content: post?.content ?? "" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/community/posts/${post!.id}`
        : `/api/community/${slug}/posts`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        const id = isEdit ? post!.id : json.id;
        router.push(`${resolvedBasePath}/${id}`);
        router.refresh();
      } else {
        setError(json.error ?? "저장에 실패했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register("title", { required: "제목을 입력하세요." })}
          placeholder="제목을 입력하세요"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:border-brand-green transition-colors"
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Controller
          name="content"
          control={control}
          rules={{ required: "내용을 입력하세요." }}
          render={({ field }) => (
            <RichEditor value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.content && (
          <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-green text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60"
        >
          {loading ? "저장 중..." : isEdit ? "수정 완료" : "게시하기"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-200 text-gray-500 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
