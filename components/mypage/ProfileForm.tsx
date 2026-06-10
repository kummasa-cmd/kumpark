"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface Member {
  id: number;
  name: string;
  nickname: string;
  email: string;
  phone?: string;
  blog_url?: string;
  threads_url?: string;
  instagram_url?: string;
  x_url?: string;
  brunch_url?: string;
  youtube_url?: string;
  homepage_url?: string;
  sms_yn: string;
  email_yn: string;
}

type FormData = {
  name: string;
  nickname: string;
  phone: string;
  blog_url: string;
  threads_url: string;
  instagram_url: string;
  x_url: string;
  brunch_url: string;
  youtube_url: string;
  homepage_url: string;
  sms_yn: string;
  email_yn: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const SNS_FIELDS = [
  { key: "blog_url",       label: "블로그 URL",        placeholder: "https://blog.naver.com/..." },
  { key: "threads_url",    label: "스레드 URL",         placeholder: "https://www.threads.net/..." },
  { key: "instagram_url",  label: "인스타그램 URL",     placeholder: "https://www.instagram.com/..." },
  { key: "x_url",          label: "X (트위터) URL",     placeholder: "https://x.com/..." },
  { key: "brunch_url",     label: "브런치스토리 URL",   placeholder: "https://brunch.co.kr/..." },
  { key: "youtube_url",    label: "유튜브 URL",         placeholder: "https://www.youtube.com/..." },
  { key: "homepage_url",   label: "홈페이지 URL",       placeholder: "https://..." },
] as const;

export default function ProfileForm({ member }: { member: Member }) {
  const router = useRouter();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: member.name,
      nickname: member.nickname,
      phone: member.phone ?? "",
      blog_url: member.blog_url ?? "",
      threads_url: member.threads_url ?? "",
      instagram_url: member.instagram_url ?? "",
      x_url: member.x_url ?? "",
      brunch_url: member.brunch_url ?? "",
      youtube_url: member.youtube_url ?? "",
      homepage_url: member.homepage_url ?? "",
      sms_yn: member.sms_yn,
      email_yn: member.email_yn,
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = watch("new_password");

  const onSubmit = async (data: FormData) => {
    if (data.new_password && data.new_password !== data.confirm_password) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/mypage/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          nickname: data.nickname,
          phone: data.phone,
          blog_url: data.blog_url,
          threads_url: data.threads_url,
          instagram_url: data.instagram_url,
          x_url: data.x_url,
          brunch_url: data.brunch_url,
          youtube_url: data.youtube_url,
          homepage_url: data.homepage_url,
          sms_yn: data.sms_yn,
          email_yn: data.email_yn,
          current_password: data.current_password || undefined,
          new_password: data.new_password || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess("정보가 저장되었습니다.");
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

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors";
  const sectionCls = "bg-white rounded-xl border border-gray-100 p-5 space-y-4";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* 기본 정보 */}
      <div className={sectionCls}>
        <h3 className="font-semibold text-gray-800 text-sm">기본 정보</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "이름을 입력하세요." })}
              className={inputCls}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("nickname", { required: "닉네임을 입력하세요." })}
              className={inputCls}
            />
            {errors.nickname && <p className="text-xs text-red-500 mt-1">{errors.nickname.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">이메일</label>
          <input
            value={member.email}
            disabled
            className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">연락처</label>
          <input {...register("phone")} placeholder="010-0000-0000" className={inputCls} />
        </div>
      </div>

      {/* SNS / URL */}
      <div className={sectionCls}>
        <h3 className="font-semibold text-gray-800 text-sm">SNS / URL</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {SNS_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
              <input
                {...register(key)}
                placeholder={placeholder}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 수신 설정 */}
      <div className={sectionCls}>
        <h3 className="font-semibold text-gray-800 text-sm">수신 설정</h3>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("sms_yn")} value="Y" className="rounded text-brand-green" />
            SMS 수신 동의
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("email_yn")} value="Y" className="rounded text-brand-green" />
            이메일 수신 동의
          </label>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className={sectionCls}>
        <h3 className="font-semibold text-gray-800 text-sm">비밀번호 변경</h3>
        <p className="text-xs text-gray-400">변경하지 않으려면 비워두세요.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">현재 비밀번호</label>
            <input
              type="password"
              {...register("current_password")}
              placeholder="현재 비밀번호"
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">새 비밀번호</label>
            <input
              type="password"
              {...register("new_password", {
                minLength: { value: 8, message: "8자 이상 입력하세요." },
              })}
              placeholder="8자 이상"
              autoComplete="new-password"
              className={inputCls}
            />
            {errors.new_password && <p className="text-xs text-red-500 mt-1">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">새 비밀번호 확인</label>
            <input
              type="password"
              {...register("confirm_password", {
                validate: (v) => !newPassword || v === newPassword || "비밀번호가 일치하지 않습니다.",
              })}
              placeholder="새 비밀번호 재입력"
              autoComplete="new-password"
              className={inputCls}
            />
            {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-brand-green text-white font-semibold px-8 py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60"
      >
        {loading ? "저장 중..." : "저장하기"}
      </button>
    </form>
  );
}
