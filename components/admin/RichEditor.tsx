"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Quote, Code2,
  ImagePlus, Link as LinkIcon,
  Minus, Undo, Redo, Loader2,
} from "lucide-react";
import ImageResizeView from "./ImageResizeView";

// Image 익스텐션 확장: width 속성 + ReactNodeView
const ImageResize = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (el) =>
          (el as HTMLImageElement).style.width ||
          (el as HTMLImageElement).getAttribute("width") ||
          "100%",
        renderHTML: ({ width }) =>
          width ? { style: `width: ${width}` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeView);
  },
});

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarBtn({
  onClick,
  active,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-brand-green text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageResize.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] px-4 py-3 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.ok) {
        editor.chain().focus().setImage({ src: json.url }).run();
      } else {
        alert(json.error ?? "이미지 업로드에 실패했습니다.");
      }
    } catch {
      alert("서버에 연결할 수 없습니다.");
    } finally {
      setUploading(false);
    }
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL을 입력하세요", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-brand-green transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        <ToolbarBtn title="실행 취소" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="다시 실행" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={15} />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn
          title="굵게"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="기울임"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="제목 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="제목 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={15} />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn
          title="글머리 목록"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="번호 목록"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="인용구"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="코드"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={15} />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-200 mx-1" />

        <ToolbarBtn
          title="이미지 업로드 (클릭 후 크기 조절 가능)"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        </ToolbarBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageSelect}
        />
        <ToolbarBtn title="링크 삽입" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="구분선"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}
