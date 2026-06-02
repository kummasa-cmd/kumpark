"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Mail, Phone, ExternalLink } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

const snsLinks = [
  { label: "블로그 (네이버)", href: "https://blog.naver.com/kummasa" },
  { label: "스레드", href: "https://www.threads.com/@kumma7" },
  { label: "X (트위터)", href: "https://x.com/kummasa4791" },
  { label: "인스타그램", href: "https://www.instagram.com/kumma7/" },
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // TODO: integrate email service (e.g. Resend, EmailJS)
    console.log("Form submitted:", data);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    reset();
  };

  return (
    <div className="grid md:grid-cols-5 gap-10">
      {/* Form */}
      <div className="md:col-span-3">
        {submitted ? (
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
                  {...register("name", { required: "이름을 입력해주세요" })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
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
                  {...register("email", {
                    required: "이메일을 입력해주세요",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "올바른 이메일 형식이 아닙니다" },
                  })}
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
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
                {...register("phone")}
                type="tel"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
                placeholder="010-0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text mb-1.5">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                {...register("subject", { required: "제목을 입력해주세요" })}
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
                })}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
                placeholder="코칭 문의, 현재 상황, 목표 등을 자유롭게 작성해 주세요."
              />
              {errors.message && (
                <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
              )}
            </div>

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
