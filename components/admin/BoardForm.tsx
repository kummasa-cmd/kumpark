"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  slug: string;
  sort_order: number;
  is_visible: boolean;
  user_writable: boolean;
  use_category: boolean;
  use_comment: boolean;
  board_type: string;
};

type Board = {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_visible: boolean;
  user_writable: boolean;
  use_category: boolean;
  use_comment: boolean;
  board_type: string;
};

export default function BoardForm({ board }: { board?: Board }) {
  const isEdit = !!board;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: board
      ? {
          name: board.name,
          slug: board.slug,
          sort_order: board.sort_order,
          is_visible: board.is_visible,
          user_writable: board.user_writable,
          use_category: board.use_category,
          use_comment: board.use_comment,
          board_type: board.board_type,
        }
      : {
          sort_order: 0,
          is_visible: true,
          user_writable: true,
          use_category: false,
          use_comment: false,
          board_type: "general",
        },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/boards/${board!.id}` : "/api/admin/boards",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            sort_order: Number(data.sort_order),
            is_visible: String(data.is_visible) === "true",
            user_writable: String(data.user_writable) === "true",
            use_category: String(data.use_category) === "true",
            use_comment: String(data.use_comment) === "true",
            board_type: data.board_type,
          }),
        }
      );
      const json = await res.json();
      if (res.ok) {
        router.push("/admin/site/boards");
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

  const selectClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5 max-w-lg"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          게시판명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("name", { required: "게시판명을 입력하세요." })}
          placeholder="예) 공지사항"
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          슬러그 <span className="text-red-500">*</span>
          <span className="ml-1.5 text-xs text-gray-400 font-normal">(영소문자·숫자·하이픈만)</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">/community/</span>
          <input
            type="text"
            {...register("slug", {
              required: "슬러그를 입력하세요.",
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: "영소문자, 숫자, 하이픈만 사용 가능합니다.",
              },
            })}
            placeholder="notice"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
        {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
      </div>

      {/* Board type — full width radio group */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">게시판 유형</label>
        <div className="flex gap-3">
          {[
            {
              value: "general",
              label: "일반",
              desc: "모든 사용자가 전체 글을 볼 수 있습니다",
            },
            {
              value: "personal",
              label: "개인",
              desc: "자신이 작성한 글만 볼 수 있습니다 (관리자는 전체 확인 가능)",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 flex items-start gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                "border-gray-200 hover:border-brand-green"
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                {...register("board_type")}
                className="mt-0.5 accent-brand-green"
              />
              <span>
                <span className="block text-sm font-medium text-gray-800">{opt.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">정렬 순서</label>
          <input
            type="number"
            {...register("sort_order")}
            min={0}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">노출 여부</label>
          <select {...register("is_visible")} className={selectClass}>
            <option value="true">노출</option>
            <option value="false">숨김</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">사용자 입력</label>
          <select {...register("user_writable")} className={selectClass}>
            <option value="true">가능</option>
            <option value="false">불가</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">카테고리 사용</label>
          <select {...register("use_category")} className={selectClass}>
            <option value="false">사용안함</option>
            <option value="true">사용</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">댓글 사용</label>
          <select {...register("use_comment")} className={selectClass}>
            <option value="false">사용안함</option>
            <option value="true">사용</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg space-y-0.5">
        <p><strong>일반 게시판</strong>: 로그인 여부와 관계없이 전체 게시물을 볼 수 있습니다.</p>
        <p><strong>개인 게시판</strong>: 자신이 작성한 게시물만 표시됩니다. 관리자는 전체를 확인할 수 있습니다.</p>
        <p><strong>사용자 입력 가능</strong>: 로그인한 회원이 직접 게시물을 작성할 수 있습니다.</p>
        <p><strong>댓글 사용</strong>: 게시물에 댓글 및 답글 기능이 활성화됩니다.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-lg">{error}</div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : isEdit ? "수정하기" : "추가하기"}
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
