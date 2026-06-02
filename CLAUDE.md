# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**검파크 (Kumpark)** — a personal brand website for Korean author 홍성호, targeting aspiring and active writers (35–59). The site sells coaching services and e-books and collects contact inquiries.

- Tagline: "기록이 모여 브랜드가 되는 공간"
- Deployment: Vercel (free tier) with a custom domain (~₩30,000/yr)
- Target completion: 2026-06-30

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS only (no inline CSS) |
| UI components | shadcn/ui |
| Icons | Lucide Icons |
| Forms | React Hook Form |
| Analytics | Google Analytics 4 |

## Commands

```bash
# Install dependencies (after scaffolding)
npm install

# Dev server
npm run dev

# Build & type-check
npm run build

# Lint
npm run lint
```

## Project Structure Conventions

- Pages live in `app/` using the App Router (`page.tsx`, `layout.tsx`)
- Shared UI lives in `components/`
- All code is TypeScript; no `.js` files
- Tailwind CSS classes only — no inline styles, no CSS modules
- Variable names and comments in English

## Site Map

| Route | Purpose |
|---|---|
| `/` | Hero, 3 featured products, CTA |
| `/about` | Profile, author career, book list |
| `/goods` | Coaching products with pricing |
| `/community` | Boards: notices, coaching reviews, quotes, free, challenge |
| `/contact` | Inquiry form + SNS links |
| `/mypage` | Coaching schedule, 1-on-1 inquiry, payment info |

## Design System

**Colors**

| Token | Hex | Usage |
|---|---|---|
| Primary | `#0B7903` | Dark green — main brand color |
| Accent | `#FFE400` | Bright yellow |
| Background | `#FFFFFF` | White |
| Text | `#111827` | Near-black |
| Muted text | `#6B7280` | Gray |

**Typography**
- Korean body: Pretendard (Google Fonts)
- English body: Inter (Google Fonts)
- Headings: Pretendard Bold (weight 700)

**Tone:** minimal, modern, readable — avoid flashy animations or neon colors.

## Products / Pricing

**E-book coaching**
- Group: 6 weeks, ₩150,000
- Individual: 6 weeks, price on request

**Print book coaching (1-on-1)**
- 5 months, price on request
- Weekly call/Zoom + 4 in-person sessions

## Author Content (for seeding)

- 종이책: *루틴의 설계* (모모북스, 2025.08)
- 전자책 11권 (2024.03 – 2026.05); see `requirements.md §8.2` for full list
- Contact: kummasa@naver.com | 010-6258-6933
- SNS: blog.naver.com/kummasa · threads.com/@kumma7 · x.com/kummasa4791 · instagram.com/kumma7

## Key Constraints

- Page load ≤ 3 seconds
- All images in WebP format
- Minimize third-party libraries
- Images sourced from Unsplash or Pexels only
- Mobile-first responsive (desktop 60% / mobile 40% audience split)
- SEO meta tags required on every page
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `style:`, etc.)

## Footer (use verbatim)

```
kumpark | 기록이 모여 브랜드가 되는 공간
상호명: 모즈나인 | 사업자번호: 830-06-01678
서울시 금천구 범안로 1130. 3층 302호 (가산동, 디지털 엠파이어 빌딩)
대표: 홍성호 | 010-6258-6933 | kummasa@naver.com
```
