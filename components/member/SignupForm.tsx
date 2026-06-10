"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  nickname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          nickname: data.nickname,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        router.push("/mypage");
        router.refresh();
      } else {
        setError(json.error ?? "회원가입에 실패했습니다.");
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
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { required: "이름을 입력하세요." })}
              placeholder="홍길동"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("nickname", { required: "닉네임을 입력하세요." })}
              placeholder="활동 닉네임"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
            />
            {errors.nickname && <p className="text-xs text-red-500 mt-1">{errors.nickname.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("email", {
              required: "이메일을 입력하세요.",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "올바른 이메일 형식이 아닙니다." },
            })}
            placeholder="example@email.com"
            autoComplete="email"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처</label>
          <input
            {...register("phone")}
            placeholder="010-0000-0000"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("password", {
              required: "비밀번호를 입력하세요.",
              minLength: { value: 8, message: "8자 이상 입력하세요." },
            })}
            placeholder="8자 이상"
            autoComplete="new-password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            비밀번호 확인 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "비밀번호 확인을 입력하세요.",
              validate: (v) => v === password || "비밀번호가 일치하지 않습니다.",
            })}
            placeholder="비밀번호 재입력"
            autoComplete="new-password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-green text-white font-semibold py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        이미 회원이신가요?{" "}
        <Link href="/login" className="text-brand-green font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
