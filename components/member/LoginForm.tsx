"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

type FormData = { email: string; password: string };

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/mypage";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(json.error ?? "로그인에 실패했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
          <input
            type="email"
            {...register("email", { required: "이메일을 입력하세요." })}
            placeholder="example@email.com"
            autoComplete="email"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
          <input
            type="password"
            {...register("password", { required: "비밀번호를 입력하세요." })}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="text-brand-green font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
