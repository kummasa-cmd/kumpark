const snsLinks = [
  { href: "https://blog.naver.com/kummasa", label: "블로그" },
  { href: "https://www.threads.com/@kumma7", label: "스레드" },
  { href: "https://x.com/kummasa4791", label: "X" },
  { href: "https://www.instagram.com/kumma7/", label: "인스타그램" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-brand-green mb-1">kumpark</p>
            <p className="text-sm text-brand-muted">기록이 모여 브랜드가 되는 공간</p>
          </div>

          <div className="flex gap-4 flex-wrap">
            {snsLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-muted hover:text-brand-green transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-brand-muted leading-relaxed">
            상호명: 모즈나인 | 사업자번호: 830-06-01678
            <br />
            서울시 금천구 범안로 1130. 3층 302호 (가산동, 디지털 엠파이어 빌딩)
            <br />
            대표: 홍성호 | 010-6258-6933 | kummasa@naver.com
          </p>
          <p className="text-xs text-brand-muted mt-3">
            © {new Date().getFullYear()} kumpark. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
