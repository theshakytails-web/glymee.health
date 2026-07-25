# AGENTS.md

## Project Overview
Glymee — a diabetes health management platform built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.

## Commands
- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint

## Architecture
```
src/
├── app/
│   ├── layout.tsx       # Root layout: fonts (Manrope, Inter, Atkinson Hyperlegible Next), Material Symbols
│   ├── page.tsx         # Landing page — imports all section components
│   └── globals.css      # Tailwind v4 config with design system tokens (@theme inline)
└── components/
    ├── TopNavBar.tsx    # Fixed nav with mobile hamburger menu
    ├── HeroSection.tsx  # Hero with CTA + dashboard preview
    ├── WhyRootCauseMatters.tsx
    ├── ComparisonSection.tsx
    ├── ConditionsSection.tsx
    ├── ProcessSection.tsx
    ├── ServicesSection.tsx
    ├── AboutSection.tsx
    ├── FAQSection.tsx   # Client component (useState for accordion)
    ├── CTASection.tsx
    └── Footer.tsx
```

## Key Technical Notes

### Tailwind CSS v4
- Config is in `globals.css` via `@theme inline` blocks, NOT a `tailwind.config.ts` file
- Custom colors use `--color-*` prefix (e.g. `--color-primary` → `bg-primary`)
- Custom fonts use `--font-*` prefix (e.g. `--font-headline-md` → `font-headline-md`)

### Design System
- Full tokens in `DESIGN.md` and `globals.css`
- 3 font families: Manrope (headlines), Atkinson Hyperlegible Next (body/medical data), Inter (labels)
- Google Material Symbols for icons (loaded via `<link>` in layout.tsx)
- 8px spacing scale, rounded corners (0.5rem default)

### Fonts loaded via
- `next/font/google`: Manrope, Inter
- Google Fonts `<link>`: Atkinson Hyperlegible Next, Material Symbols

### Component conventions
- Server components by default; `"use client"` only when needed (TopNavBar, FAQSection)
- Tailwind utility classes for styling — no CSS modules
- Semantic color tokens from design system (e.g. `text-on-surface-variant`, `bg-primary`)
