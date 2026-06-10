"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type Settings = {
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_badge: string;
  banner_interval: string;
  banner_1_label: string;
  banner_2_label: string;
  banner_3_label: string;
};

const BANNERS = [
  { no: 1, key: "banner_1_label" as const, src: "/images/my_banner1.png" },
  { no: 2, key: "banner_2_label" as const, src: "/images/my_banner2.jpg" },
  { no: 3, key: "banner_3_label" as const, src: "/images/main_banner3.png" },
];

export default function SiteMainForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const { register, reset, handleSubmit } = useForm<Settings>();

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((data) => {
        reset(data);
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: Settings) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
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
      {/* Hero section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">히어로 섹션</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메인 제목 1행</label>
          <input
            type="text"
            {...register("hero_title_1")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            메인 제목 2행
            <span className="ml-1.5 text-xs text-brand-green font-normal">(녹색 강조로 표시)</span>
          </label>
          <input
            type="text"
            {...register("hero_title_2")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            서브 텍스트
            <span className="ml-1.5 text-xs text-gray-400 font-normal">(줄바꿈 지원)</span>
          </label>
          <textarea
            rows={4}
            {...register("hero_subtitle")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">뱃지 텍스트</label>
          <input
            type="text"
            {...register("hero_badge")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
      </div>

      {/* Banner settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">배너 설정</h2>

        {BANNERS.map((b) => (
          <div key={b.no} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-xs font-semibold text-gray-500 w-6">#{b.no}</span>
            <div className="w-28 flex-shrink-0">
              <p className="text-xs text-gray-400 mb-0.5">이미지</p>
              <p className="text-xs text-gray-600 truncate">{b.src}</p>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-0.5 block">텍스트 (빈칸이면 미표시)</label>
              <input
                type="text"
                {...register(b.key)}
                className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white"
              />
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">자동 전환 간격 (초)</label>
          <input
            type="number"
            {...register("banner_interval")}
            min={3}
            max={60}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
      </div>

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
