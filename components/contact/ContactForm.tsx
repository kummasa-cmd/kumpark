"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, ExternalLink, Lock } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

interface ContactFormProps {
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
}

const snsLinks = [
  { label: "블로그 (네이버)", href: "https://blog.naver.com/kummasa" },
  { label: "스레드", href: "https://www.threads.com/@kumma7" },
  { label: "X (트위터)", href: "https://x.com/kummasa4791" },
  { label: "인스타그램", href: "https://www.instagram.com/kumma7/" },
];

export default function ContactForm({ memberName, memberEmail, memberPhone }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const isLoggedIn = Boolean(memberEmail);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: memberName ?? "",
      email: memberEmail ?? "",
      phone: memberPhone ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setSubmitted(true);
        reset({ name: memberName ?? "", email: memberEmail ?? "", phone: memberPhone ?? "" });
      } else {
        setError(json.error ?? "전송에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    }
  };

  return (
    <div className="grid md:grid-cols-5 gap-10">
      {/* Form */}
      <div className="md:col-span-3">
        {!isLoggedIn ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <Lock size={28} className="mx-auto mb-3 text-brand-green" />
            <h3 className="text-lg font-bold text-brand-text mb-2">로그인 후 상담을 신청할 수 있습니다</h3>
            <p className="text-brand-muted text-sm mb-6">
              스팸 방지를 위해 회원만 상담 글을 남길 수 있습니다.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/login?redirect=/contact"
                className="bg-brand-green text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="border border-gray-300 text-brand-text text-sm font-semibold px-6 py-2.5 rounded-lg hover:border-brand-green transition-colors"
              >
                회원가입
              </Link>
            </div>
          </div>
        ) : submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <p className="text-2xl mb-2">✓</p>
            <h3 className="text-lg font-bold text-brand-text mb-2">문의가 접수되었습니다</h3>
            <p className="text-brand-muted text-sm">
              빠른 시일 내에 이메일로 연락드리겠습니다.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-sm text-brand-green underline"
            >
              다시 문의하기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  readOnly
                  className="w-full border border-gray-200 bg-gray-50 text-brand-muted rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                  placeholder="홍길동"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text mb-1.5">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  readOnly
                  type="email"
                  className="w-full border border-gray-200 bg-gray-50 text-brand-muted rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                휴대폰 번호 <span className="text-brand-muted font-normal">(선택)</span>
              </label>
              <input
                {...register("phone", {
                  pattern: { value: /^[0-9+\-\s()]{8,20}$/, message: "올바른 휴대폰 번호 형식이 아닙니다" },
                })}
                type="tel"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
                placeholder="010-0000-0000"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                {...register("subject", {
                  required: "제목을 입력해주세요",
                  maxLength: { value: 100, message: "100자 이내로 입력해주세요" },
                })}
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
                placeholder="전자책 그룹 코칭 문의"
              />
              {errors.subject && (
                <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                문의 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("message", {
                  required: "문의 내용을 입력해주세요",
                  minLength: { value: 10, message: "10자 이상 입력해주세요" },
                  maxLength: { value: 3000, message: "3000자 이내로 입력해주세요" },
                })}
                maxLength={3000}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
                placeholder="코칭 문의, 현재 상황, 목표 등을 자유롭게 작성해 주세요."
              />
              {errors.message && (
                <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-green text-white font-semibold py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "전송 중..." : "문의 보내기"}
            </button>
          </form>
        )}
      </div>

      {/* Contact info */}
      <aside className="md:col-span-2 space-y-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-sm font-bold text-brand-text mb-4">직접 연락</h3>
          <div className="space-y-3">
            <a
              href="mailto:kummasa@naver.com"
              className="flex items-center gap-3 text-sm text-brand-muted hover:text-brand-green transition-colors"
            >
              <Mail size={16} className="flex-shrink-0" />
              kummasa@naver.com
            </a>
            <a
              href="tel:01062586933"
              className="flex items-center gap-3 text-sm text-brand-muted hover:text-brand-green transition-colors"
            >
              <Phone size={16} className="flex-shrink-0" />
              010-6258-6933
            </a>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-sm font-bold text-brand-text mb-4">SNS</h3>
          <div className="space-y-3">
            {snsLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-brand-muted hover:text-brand-green transition-colors"
              >
                <ExternalLink size={14} className="flex-shrink-0" />
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-brand-muted leading-relaxed">
            <strong className="text-brand-text">응답 시간 안내</strong>
            <br />
            평일 09:00 – 18:00
            <br />
            주말 및 공휴일은 다음 영업일 답변
          </p>
        </div>
      </aside>
    </div>
  );
}
