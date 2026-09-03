"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import MemberSearchSelect, { type SelectedMember } from "./MemberSearchSelect";

type FormData = {
  book_type: string;
  category: string;
  product_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  session_count: number;
  completed_count: number;
  status: string;
};

type Coaching = {
  id: number;
  member_id: number;
  member_name: string;
  member_nickname: string;
  member_phone: string | null;
  book_type: string;
  category: string;
  product_name: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  session_count: number;
  completed_count: number;
  status: string;
  desired_start_date?: string | null;
  depositor_bank?: string | null;
  depositor_account?: string | null;
  depositor_name?: string | null;
  deposit_due_date?: string | null;
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors";
const selectClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white";

export default function CoachingForm({ coaching }: { coaching?: Coaching }) {
  const isEdit = !!coaching;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<SelectedMember | null>(
    isEdit
      ? {
          id: coaching!.member_id,
          name: coaching!.member_name,
          nickname: coaching!.member_nickname,
          phone: coaching!.member_phone,
        }
      : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: isEdit
      ? {
          book_type: coaching!.book_type,
          category: coaching!.category,
          product_name: coaching!.product_name,
          amount: coaching!.amount,
          start_date: coaching!.start_date,
          end_date: coaching!.end_date ?? "",
          session_count: coaching!.session_count,
          completed_count: coaching!.completed_count,
          status: coaching!.status,
        }
      : {
          book_type: "ebook",
          category: "individual",
          product_name: "",
          amount: 0,
          start_date: "",
          end_date: "",
          session_count: 0,
          completed_count: 0,
          status: "pending",
        },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    if (!member) {
      setError("회원을 검색하여 선택해주세요.");
      return;
    }
    const totalSessions = Number(data.session_count) || 0;
    const completedSessions = Number(data.completed_count) || 0;
    if (completedSessions > totalSessions) {
      setError("완료횟수는 총횟수를 초과할 수 없습니다.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...data,
        member_id: member.id,
        amount: Number(data.amount) || 0,
        session_count: totalSessions,
        completed_count: completedSessions,
        end_date: data.end_date || null,
      };

      const res = await fetch(
        isEdit ? `/api/admin/coachings/${coaching!.id}` : "/api/admin/coachings",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      if (res.ok) {
        router.push("/admin/coachings");
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

  const hasApplicationInfo =
    isEdit &&
    (coaching!.desired_start_date ||
      coaching!.depositor_bank ||
      coaching!.depositor_account ||
      coaching!.depositor_name ||
      coaching!.deposit_due_date);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {hasApplicationInfo && (
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-amber-700 border-b border-amber-100 pb-3">
            회원 신청 정보 (읽기 전용)
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">희망 코칭 시작일</p>
              <p className="font-medium text-gray-800">{coaching!.desired_start_date || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">입금 예정일</p>
              <p className="font-medium text-gray-800">{coaching!.deposit_due_date || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">이체 은행명</p>
              <p className="font-medium text-gray-800">{coaching!.depositor_bank || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">계좌번호</p>
              <p className="font-medium text-gray-800">{coaching!.depositor_account || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">입금인명</p>
              <p className="font-medium text-gray-800">{coaching!.depositor_name || "-"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">회원 선택</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            회원 <span className="text-red-500">*</span>
          </label>
          <MemberSearchSelect value={member} onChange={setMember} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">코칭 정보</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">유형</label>
            <select {...register("book_type")} className={selectClass}>
              <option value="paper">종이책</option>
              <option value="ebook">전자책</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">구분</label>
            <select {...register("category")} className={selectClass}>
              <option value="group">그룹</option>
              <option value="individual">개인</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            상품명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("product_name", { required: "상품명을 입력하세요." })}
            placeholder="예: 전자책 코칭"
            className={inputClass}
          />
          {errors.product_name && <p className="text-xs text-red-500 mt-1">{errors.product_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">금액 (원)</label>
          <input
            type="number"
            {...register("amount", { min: 0 })}
            placeholder="0"
            className={inputClass}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">총횟수</label>
            <input
              type="number"
              {...register("session_count", { min: 0 })}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">완료횟수</label>
            <input
              type="number"
              {...register("completed_count", { min: 0 })}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              코칭시작일 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("start_date", { required: "코칭시작일을 선택하세요." })}
              className={inputClass}
            />
            {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">코칭종료일</label>
            <input type="date" {...register("end_date")} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">상태</label>
          <select {...register("status")} className={selectClass}>
            <option value="pending">입금대기</option>
            <option value="in_progress">코칭중</option>
            <option value="completed">코칭종료</option>
            <option value="refunded">환불</option>
          </select>
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
