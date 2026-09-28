"use client";

import { RefreshCw } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

export type CaptchaHandle = { reset: () => void };

type Props = {
  inputProps: UseFormRegisterReturn;
  error?: string;
  onToken: (token: string) => void;
  onReset: () => void;
};

const CaptchaField = forwardRef<CaptchaHandle, Props>(function CaptchaField(
  { inputProps, error, onToken, onReset },
  ref
) {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    onToken("");
    try {
      const res = await fetch("/api/auth/captcha", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        setImage(json.image);
        onToken(json.token);
      }
    } finally {
      setLoading(false);
    }
  }, [onToken]);

  useEffect(() => {
    load();
  }, [load]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onReset();
      load();
    },
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        자동 가입 방지 <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-14 w-[170px] rounded-lg border border-gray-200 bg-gray-100 overflow-hidden">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="자동 가입 방지 숫자 이미지" width={170} height={56} />
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            onReset();
            load();
          }}
          disabled={loading}
          aria-label="새 이미지 받기"
          className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-brand-green hover:border-brand-green transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <input
        {...inputProps}
        inputMode="numeric"
        autoComplete="off"
        placeholder="이미지의 숫자 5자리를 입력하세요"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
});

export default CaptchaField;
