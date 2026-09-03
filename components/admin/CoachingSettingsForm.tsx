"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Settings = {
  coaching_ebook_duration: string;
  coaching_ebook_price_regular: string;
  coaching_ebook_price_event: string;
  coaching_ebook_event_active: string;
  coaching_paper_duration: string;
  coaching_paper_price_regular: string;
  coaching_paper_price_event: string;
  coaching_paper_event_active: string;
  coaching_deposit_bank: string;
  coaching_deposit_account: string;
  coaching_deposit_holder: string;
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors";
const selectClass = `${inputClass} bg-white`;

function ProductSection({
  title,
  prefix,
  register,
}: {
  title: string;
  prefix: "coaching_ebook" | "coaching_paper";
  register: ReturnType<typeof useForm<Settings>>["register"];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">{title}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">코칭 기간</label>
        <input
          type="text"
          {...register(`${prefix}_duration` as keyof Settings)}
          placeholder="예: 6주"
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">코칭 금액 (평상시)</label>
          <input
            type="number"
            min={0}
            {...register(`${prefix}_price_regular` as keyof Settings)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">코칭 금액 (이벤트시)</label>
          <input
            type="number"
            min={0}
            {...register(`${prefix}_price_event` as keyof Settings)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이벤트 가격 적용여부</label>
        <select {...register(`${prefix}_event_active` as keyof Settings)} className={selectClass}>
          <option value="N">N (평상시 가격 적용)</option>
          <option value="Y">Y (이벤트 가격 적용)</option>
        </select>
      </div>
    </div>
  );
}

function DepositAccountSection({
  register,
}: {
  register: ReturnType<typeof useForm<Settings>>["register"];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">입금 계좌 정보</h2>
      <p className="text-xs text-gray-500 -mt-2">
        회원이 코칭 신청 시 안내되는 입금 계좌 정보입니다. 사이트 전체에 반영됩니다.
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">은행명</label>
          <input
            type="text"
            {...register("coaching_deposit_bank")}
            placeholder="예: 기업은행"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
          <input
            type="text"
            {...register("coaching_deposit_account")}
            placeholder="예: 137-111779-04-013"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
          <input
            type="text"
            {...register("coaching_deposit_holder")}
            placeholder="예: 모즈나인"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

export default function CoachingSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const form = useForm<Settings>();
  const { register, reset, handleSubmit } = form;

  useEffect(() => {
    fetch("/api/admin/coaching-settings")
      .then((r) => r.json())
      .then((data) => {
        reset(data);
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: Settings) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coaching-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setToast({ type: "ok", msg: "저장되었습니다." });
      } else {
        setToast({ type: "err", msg: "저장에 실패했습니다." });
      }
    } catch {
      setToast({ type: "err", msg: "서버에 연결할 수 없습니다." });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <ProductSection title="전자책 코칭" prefix="coaching_ebook" register={register} />
      <ProductSection title="종이책 코칭" prefix="coaching_paper" register={register} />
      <DepositAccountSection register={register} />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
        {toast && (
          <span className={`text-sm ${toast.type === "ok" ? "text-brand-green" : "text-red-500"}`}>
            {toast.msg}
          </span>
        )}
      </div>
    </form>
  );
}
