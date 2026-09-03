"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type BookType = "ebook" | "paper";

type FormData = {
  desired_start_date: string;
  depositor_bank: string;
  depositor_account: string;
  depositor_name: string;
  deposit_due_date: string;
};

function getNoticeItems(bookType: BookType, duration: string) {
  const common = [
    `코칭기간: ${duration || "관리자 문의"}`,
    "신청 후 3일 이내 입금해주셔야 합니다.",
    "세금계산서 또는 현금영수증 발행이 가능합니다.",
  ];

  if (bookType === "paper") {
    return [
      common[0],
      "진행방식: 직접만남/온라인줌/전화 코칭",
      "코칭횟수: 총 15회",
      common[1],
      common[2],
    ];
  }

  return [
    common[0],
    "진행방식: 온라인 줌 또는 전화 코칭",
    "코칭횟수: 총 3회",
    "강의 동영상 4개 시청 가능",
    common[1],
    common[2],
  ];
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors";

export default function CoachingApplyForm({
  bookType,
  productName,
  duration,
  amount,
  depositBank,
  depositAccount,
  depositHolder,
  memberName,
  memberEmail,
  blocked,
  blockedMessage,
}: {
  bookType: BookType;
  productName: string;
  duration: string;
  amount: number;
  depositBank: string;
  depositAccount: string;
  depositHolder: string;
  memberName: string;
  memberEmail: string;
  blocked: boolean;
  blockedMessage: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/mypage/coachings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_type: bookType, ...data }),
      });
      const json = await res.json();
      if (res.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(json.error ?? "신청에 실패했습니다.");
      }
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-10 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-brand-green" size={28} />
        <p className="text-brand-green font-semibold mb-1">코칭 신청이 접수됐습니다</p>
        <p className="text-sm text-gray-600 mb-5">
          안내드린 계좌로 3일 이내 입금해주시면 확인 후 코칭 일정을 안내드립니다.
        </p>
        <Link
          href="/mypage/coachings"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
        >
          코칭 내역 보기
        </Link>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-10 text-center">
        <AlertTriangle className="mx-auto mb-3 text-amber-500" size={28} />
        <p className="text-amber-700 font-semibold mb-1">이미 진행중인 코칭이 있습니다</p>
        <p className="text-sm text-amber-600 mb-5">{blockedMessage}</p>
        <Link
          href="/mypage/coachings"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
        >
          코칭 내역 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 안내사항 */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-brand-green mb-3">신청 전 안내사항</h2>
        <ul className="space-y-1.5 mb-4">
          {getNoticeItems(bookType, duration).map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 size={15} className="text-brand-green shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-white rounded-lg border border-green-100 px-4 py-3 text-sm text-gray-700 space-y-0.5">
          <p className="font-semibold text-gray-800 mb-1">입금계좌 정보</p>
          <p>은행명 : {depositBank}</p>
          <p>계좌번호 : {depositAccount}</p>
          <p>예금주 : {depositHolder}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* 신청 정보 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">신청 정보</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">신청자</p>
              <p className="font-medium text-gray-800">{memberName} ({memberEmail})</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">상품명</p>
              <p className="font-medium text-gray-800">{productName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">코칭 금액</p>
              <p className="font-medium text-brand-green">₩{amount.toLocaleString("ko-KR")}</p>
            </div>
          </div>
        </div>

        {/* 입력 항목 */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">신청 내용 입력</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              코칭을 시작하고 싶은 날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("desired_start_date", { required: "희망 시작일을 선택하세요." })}
              className={inputClass}
            />
            {errors.desired_start_date && (
              <p className="text-xs text-red-500 mt-1">{errors.desired_start_date.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                이체할 은행명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("depositor_bank", { required: "은행명을 입력하세요." })}
                placeholder="예: 국민은행"
                className={inputClass}
              />
              {errors.depositor_bank && (
                <p className="text-xs text-red-500 mt-1">{errors.depositor_bank.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                계좌번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("depositor_account", { required: "계좌번호를 입력하세요." })}
                placeholder="숫자만 입력"
                className={inputClass}
              />
              {errors.depositor_account && (
                <p className="text-xs text-red-500 mt-1">{errors.depositor_account.message}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                입금인명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("depositor_name", { required: "입금인명을 입력하세요." })}
                placeholder="입금하실 분의 성함"
                className={inputClass}
              />
              {errors.depositor_name && (
                <p className="text-xs text-red-500 mt-1">{errors.depositor_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                입금 예정일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("deposit_due_date", { required: "입금 예정일을 선택하세요." })}
                className={inputClass}
              />
              {errors.deposit_due_date && (
                <p className="text-xs text-red-500 mt-1">{errors.deposit_due_date.message}</p>
              )}
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "신청 중..." : "신청하기"}
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
    </div>
  );
}
