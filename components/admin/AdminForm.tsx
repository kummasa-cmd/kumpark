"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  email: string;
  password: string;
  role: "super" | "admin";
  status: "active" | "inactive";
};

type Admin = {
  id: number;
  name: string;
  email: string;
  role: "super" | "admin";
  status: "active" | "inactive";
};

export default function AdminForm({ admin }: { admin?: Admin }) {
  const isEdit = !!admin;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: admin
      ? { name: admin.name, email: admin.email, role: admin.role, status: admin.status }
      : { role: "admin", status: "active" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    try {
      const body = isEdit && !data.password
        ? { name: data.name, email: data.email, role: data.role, status: data.status }
        : data;

      const res = await fetch(
        isEdit ? `/api/admin/admins/${admin!.id}` : "/api/admin/admins",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      if (res.ok) {
        router.push("/admin/site/admins");
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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("name", { required: "이름을 입력하세요." })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          이메일 <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          {...register("email", { required: "이메일을 입력하세요." })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          비밀번호 {isEdit && <span className="text-gray-400 font-normal">(변경 시에만 입력)</span>}
          {!isEdit && <span className="text-red-500">*</span>}
        </label>
        <input
          type="password"
          {...register("password", { required: isEdit ? false : "비밀번호를 입력하세요." })}
          placeholder={isEdit ? "변경하지 않으면 비워두세요" : "비밀번호 입력"}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">권한</label>
          <select
            {...register("role")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white"
          >
            <option value="admin">관리자</option>
            <option value="super">최고관리자</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">상태</label>
          <select
            {...register("status")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors bg-white"
          >
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-lg">{error}</div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : isEdit ? "수정하기" : "추가하기"}
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
