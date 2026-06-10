"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

const SIZES = [
  { label: "100%", value: "100%" },
  { label: "80%", value: "80%" },
  { label: "50%", value: "50%" },
  { label: "30%", value: "30%" },
];

export default function ImageResizeView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const { src, alt, width } = node.attrs as {
    src: string;
    alt?: string;
    width?: string;
  };
  const currentWidth = width ?? "100%";

  return (
    <NodeViewWrapper>
      <div className="relative inline-block max-w-full my-1">
        <img
          src={src}
          alt={alt ?? ""}
          draggable={false}
          style={{ width: currentWidth, display: "block" }}
          className={`max-w-full transition-shadow ${
            selected
              ? "ring-2 ring-brand-green ring-offset-1 rounded-sm"
              : ""
          }`}
        />

        {selected && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/75 backdrop-blur-sm rounded-lg px-2 py-1 z-10 whitespace-nowrap">
            <span className="text-xs text-gray-300 pr-1 my-auto select-none">크기:</span>
            {SIZES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  updateAttributes({ width: opt.value });
                }}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                  currentWidth === opt.value
                    ? "bg-brand-green text-white"
                    : "text-white hover:bg-white/25"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
