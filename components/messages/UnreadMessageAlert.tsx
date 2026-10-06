"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  count: number;
  href: string;
  // 세션 내 중복 알림 방지용 키 (회원/관리자 구분)
  storageKey: string;
}

// 확인하지 않은 쪽지가 있으면 알림창을 띄움.
// 같은 세션에서는 미확인 쪽지 수가 늘어났을 때만 다시 알린다.
export default function UnreadMessageAlert({ count, href, storageKey }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let alerted = 0;
    try {
      alerted = Number(sessionStorage.getItem(storageKey) ?? 0) || 0;
    } catch {
      // storage unavailable — alert anyway
    }

    const remember = (n: number) => {
      try {
        sessionStorage.setItem(storageKey, String(n));
      } catch {
        // ignore
      }
    };

    if (count <= alerted || pathname.startsWith(href)) {
      remember(count);
      return;
    }

    // Defer so the page paints before the blocking dialog opens
    const t = setTimeout(() => {
      remember(count);
      if (window.confirm(`확인하지 않은 쪽지가 ${count}개 있습니다.\n쪽지함으로 이동하시겠습니까?`)) {
        router.push(href);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [count, href, storageKey, pathname, router]);

  return null;
}
