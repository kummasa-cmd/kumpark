"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  nickname: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  memo: string;
  blog_url: string;
  threads_url: string;
  instagram_url: string;
  x_url: string;
  brunch_url: string;
  youtube_url: string;
  homepage_url: string;
  sms_yn: string;
  email_yn: string;
  coaching_yn: string;
};

type Member = {
  id: number;
  name: string;
  nickname: string;
  email: string;
  phone: string;
  status: string;
  memo: string;
  blog_url: string;
  threads_url: string;
  instagram_url: string;
  x_url: string;
  brunch_url: string;
  youtube_url: string;
  homepage_url: string;
  sms_yn: string;
  email_yn: string;
  coaching_yn: string;
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors";
const selectClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white";

export default function MemberForm({ member }: { member?: Member }) {
  const isEdit = !!member;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: isEdit
      ? {
          name: member.name,
          nickname: member.nickname,
          email: member.email,
          phone: member.phone ?? "",
          password: "",
          status: member.status,
          memo: member.memo ?? "",
          blog_url: member.blog_url ?? "",
          threads_url: member.threads_url ?? "",
          instagram_url: member.instagram_url ?? "",
          x_url: member.x_url ?? "",
          brunch_url: member.brunch_url ?? "",
          youtube_url: member.youtube_url ?? "",
          homepage_url: member.homepage_url ?? "",
          sms_yn: member.sms_yn ?? "Y",
          email_yn: member.email_yn ?? "Y",
          coaching_yn: member.coaching_yn ?? "N",
        }
      : {
          name: "", nickname: "", email: "", phone: "", password: "",
          status: "active", memo: "",
          blog_url: "", threads_url: "", instagram_url: "", x_url: "",
          brunch_url: "", youtube_url: "", homepage_url: "",
          sms_yn: "Y", email_yn: "Y", coaching_yn: "N",
        },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const body = {
        ...data,
        phone: data.phone || null,
        memo: data.memo || null,
        blog_url: data.blog_url || null,
        threads_url: data.threads_url || null,
        instagram_url: data.instagram_url || null,
        x_url: data.x_url || null,
        brunch_url: data.brunch_url || null,
        youtube_url: data.youtube_url || null,
        homepage_url: data.homepage_url || null,
        ...(isEdit && !data.password ? { password: undefined } : {}),
      };

      const res = await fetch(
        isEdit ? `/api/admin/members/${member!.id}` : "/api/admin/members",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      if (res.ok) {
        router.push("/admin/members");
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">기본 정보</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("name", { required: "이름을 입력하세요." })}
              placeholder="홍길동"
              className={inputClass}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("nickname", { required: "닉네임을 입력하세요." })}
              placeholder="활동 닉네임"
              className={inputClass}
            />
            {errors.nickname && <p className="text-xs text-red-500 mt-1">{errors.nickname.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email", { required: "이메일을 입력하세요." })}
              placeholder="example@email.com"
              className={inputClass}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처</label>
            <input
              type="tel"
              {...register("phone")}
              placeholder="010-0000-0000"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              비밀번호 {!isEdit && <span className="text-red-500">*</span>}
              {isEdit && <span className="text-xs text-gray-400 font-normal ml-1">(변경 시에만 입력)</span>}
            </label>
            <input
              type="password"
              {...register("password", {
                validate: (v) => {
                  if (!isEdit && !v) return "비밀번호를 입력하세요.";
                  if (v && v.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
                  return true;
                },
              })}
              placeholder={isEdit ? "변경하지 않으려면 비워두세요" : "8자 이상"}
              className={inputClass}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">상태</label>
            <select {...register("status")} className={selectClass}>
              <option value="active">정상</option>
              <option value="inactive">정지</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">코칭여부</label>
            <select {...register("coaching_yn")} className={selectClass}>
              <option value="N">N (코칭 미신청)</option>
              <option value="Y">Y (코칭 신청 회원)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">메모</label>
          <textarea
            {...register("memo")}
            rows={2}
            placeholder="관리자 메모 (선택)"
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* SNS / URL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">SNS / URL</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: "blog_url" as const, label: "블로그 URL" },
            { name: "threads_url" as const, label: "스레드 URL" },
            { name: "instagram_url" as const, label: "인스타그램 URL" },
            { name: "x_url" as const, label: "X(트위터) URL" },
            { name: "brunch_url" as const, label: "브런치스토리 URL" },
            { name: "youtube_url" as const, label: "유튜브 URL" },
            { name: "homepage_url" as const, label: "홈페이지 URL" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              <input
                type="url"
                {...register(field.name)}
                placeholder="https://"
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 수신 설정 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">수신 설정</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SMS 수신</label>
            <select {...register("sms_yn")} className={selectClass}>
              <option value="Y">수신 동의 (Y)</option>
              <option value="N">수신 거부 (N)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일 수신</label>
            <select {...register("email_yn")} className={selectClass}>
              <option value="Y">수신 동의 (Y)</option>
              <option value="N">수신 거부 (N)</option>
            </select>
          </div>
        </div>
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
          {loading ? "처리 중..." : isEdit ? "수정하기" : "등록하기"}
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
