"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false });

type Category = { id: number; name: string };

type PostData = {
  id: number;
  title: string;
  author_name: string;
  content: string;
  is_notice: boolean;
  created_at: string;
  category_id: number | null;
};

type FormData = {
  title: string;
  author_name: string;
  content: string;
  is_notice: boolean;
  created_at: string;
  category_id: string;
};

export default function PostForm({
  boardId,
  defaultAuthor,
  categories = [],
  useCategory = false,
  post,
}: {
  boardId: number;
  defaultAuthor: string;
  categories?: Category[];
  useCategory?: boolean;
  post?: PostData;
}) {
  const isEdit = !!post;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    defaultValues: isEdit
      ? {
          title: post.title,
          author_name: post.author_name,
          content: post.content,
          is_notice: post.is_notice,
          created_at: post.created_at,
          category_id: post.category_id ? String(post.category_id) : "",
        }
      : {
          title: "",
          author_name: defaultAuthor,
          content: "",
          is_notice: false,
          created_at: today,
          category_id: "",
        },
  });

  const onSubmit = async (data: FormData) => {
    if (!data.content || data.content === "<p></p>") {
      setError("내용을 입력하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: data.title,
        author_name: data.author_name,
        content: data.content,
        is_notice: Boolean(data.is_notice),
        created_at: data.created_at,
      };
      if (useCategory && data.category_id) {
        body.category_id = Number(data.category_id);
      } else {
        body.category_id = null;
      }

      const url = isEdit
        ? `/api/admin/posts/${post.id}`
        : `/api/admin/boards/${boardId}/posts`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        router.push(
          isEdit
            ? `/admin/site/boards/${boardId}/posts/${post.id}`
            : `/admin/site/boards/${boardId}/posts`
        );
        router.refresh();
      } else {
        setError(json.error ?? "처리에 실패했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const metaCols = useCategory ? "grid-cols-1 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3";

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
            placeholder="게시물 제목"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div className={`grid ${metaCols} gap-4`}>
          {useCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">카테고리</label>
              <select
                {...register("category_id")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white"
              >
                <option value="">선택 안함</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              작성자 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("author_name", { required: "작성자를 입력하세요." })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
            />
            {errors.author_name && (
              <p className="text-xs text-red-500 mt-1">{errors.author_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">등록일</label>
            <input
              type="date"
              {...register("created_at")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer py-2.5">
              <input
                type="checkbox"
                {...register("is_notice")}
                className="w-4 h-4 accent-brand-green"
              />
              <span className="text-sm font-medium text-gray-700">공지글로 설정</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          내용 <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-gray-400 font-normal">
            이미지 아이콘을 클릭하여 파일을 업로드할 수 있습니다 (JPG·PNG·GIF·WebP, 5MB 이하)
          </span>
        </label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichEditor value={field.value} onChange={field.onChange} />
          )}
        />
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
          {loading ? "처리 중..." : isEdit ? "수정하기" : "게시물 등록"}
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
