"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BannerItem = {
  src: string;
  alt: string;
  label: string | null;
  position: "top-left" | "center" | null;
};

export default function BannerCarousel({
  labels,
  interval,
}: {
  labels: (string | null)[];
  interval: number;
}) {
  const banners: BannerItem[] = [
    { src: "/images/my_banner1.png", alt: "검파크 배너 1", label: labels[0] ?? null, position: "top-left" },
    { src: "/images/my_banner2.jpg",  alt: "검파크 배너 2", label: labels[1] ?? null, position: "center" },
    { src: "/images/main_banner3.png", alt: "검파크 배너 3", label: labels[2] ?? null, position: null },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const ms = Math.max(3, interval) * 1000;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, ms);
    return () => clearInterval(timer);
  }, [interval, banners.length]);

  return (
    <section className="bg-white">
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner, idx) => (
            <div key={idx} className="w-full flex-shrink-0">
              <div className="relative mx-auto md:max-w-[65%]">
                <Image
                  src={banner.src}
                  alt={banner.alt}
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 100vw, 65vw"
                  style={{ width: "100%", height: "auto" }}
                  priority={idx === 0}
                />
                {banner.label && banner.position === "top-left" && (
                  <div className="absolute hidden md:block" style={{ top: "50px", left: "50px" }}>
                    <span className="font-bold text-white px-4 py-2 rounded" style={{ fontSize: "50px", backgroundColor: "#0B7903" }}>
                      {banner.label}
                    </span>
                  </div>
                )}
                {banner.label && banner.position === "center" && (
                  <div className="absolute inset-0 items-center justify-center hidden md:flex">
                    <span className="font-bold text-white px-4 py-2 rounded" style={{ fontSize: "50px", backgroundColor: "#0B7903" }}>
                      {banner.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 py-4">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`배너 ${idx + 1}로 이동`}
            className={`rounded-full transition-all duration-300 ${
              idx === current
                ? "w-6 h-2 bg-brand-green"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
