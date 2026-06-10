"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";

interface Props {
  defaultValue: string;
  status: string;
}

export default function ConsultationSearch({ defaultValue, status }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (q: string) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/admin/consultations?${params.toString()}`);
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(inputRef.current?.value ?? ""); }}
      className="relative flex-1 max-w-xs"
    >
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        defaultValue={defaultValue}
        placeholder="이름·이메일·제목 검색"
        className="w-full border border-gray-200 rounded-lg pl-8 pr-8 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors"
      />
      {defaultValue && (
        <button
          type="button"
          onClick={() => { if (inputRef.current) inputRef.current.value = ""; submit(""); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
        >
          <X size={13} />
        </button>
      )}
    </form>
  );
}
