---
name: Healthcare Modernist
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e484d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e797e'
  outline-variant: '#bdc8ce'
  surface-tint: '#006780'
  primary: '#00647c'
  on-primary: '#ffffff'
  primary-container: '#007f9d'
  on-primary-container: '#fafdff'
  inverse-primary: '#6cd3f7'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#6cd3f7'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e61'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-background: '#F8FAFC'
  critical-alert: '#EF4444'
  glucose-optimal: '#10B981'
  glucose-low: '#F59E0B'
  glucose-high: '#EF4444'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built for a healthcare environment where clarity, reliability, and accessibility are paramount. The brand personality is "Clinical Excellence meets Human Connection"—it avoids the cold, sterile feel of traditional medicine in favor of a modern, data-driven startup aesthetic. 

The visual style follows a **Modern/Corporate** movement with elements of **Minimalism**. It utilizes generous white space to reduce cognitive load for patients managing chronic conditions. The interface feels lightweight and optimistic, prioritizing information hierarchy to ensure that critical health data is never obscured by decorative elements.

## Colors

The palette is anchored by a deep Cyan-Blue primary, selected to evoke professional trust and technological precision. A vibrant Emerald Green serves as the secondary color, used primarily for "health-positive" indicators such as stable glucose levels or completed goals. 

An Amber tertiary color is reserved for cautionary states, while a high-contrast Red is used for critical medical alerts. The neutral palette leans toward cool slate tones to maintain a clean, clinical (but not cold) atmosphere. Backgrounds should primarily use the off-white `surface-background` to reduce screen glare and improve readability for users with sensitive vision.

## Typography

Typography is the most critical accessibility tool in this design system. We use **Manrope** for headlines to provide a modern, refined, and confident structure to the page. 

For all body copy and medical data, we utilize **Atkinson Hyperlegible Next**. This font is specifically designed to increase character recognition and improve legibility for users with visual impairments, which is a common secondary concern for diabetes patients. **Inter** is used for functional labels and micro-copy where a systematic, neutral appearance is required to maintain a professional SaaS aesthetic.

## Layout & Spacing

The design system employs a **fluid grid** model with a strict 8px spacing scale to ensure mathematical harmony across all components. 

- **Desktop:** A 12-column grid with a maximum content width of 1280px. This prevents line lengths from becoming too long for comfortable reading.
- **Tablet:** An 8-column grid with 24px margins.
- **Mobile:** A 4-column grid with 16px margins to maximize screen real estate for data charts and logs.

Vertical rhythm is maintained by using multiples of 8px for all margins and paddings, ensuring that elements like "Glucose Log" entries and "Insulin Dose" inputs remain consistent and easy to scan.

## Elevation & Depth

To maintain a sense of modern SaaS sophistication without overwhelming the user, this design system uses **Tonal Layers** combined with **Ambient Shadows**. 

Depth is primarily communicated through subtle shifts in surface color (e.g., a white card on a light gray background). Shadows are used sparingly; they are extra-diffused and low-opacity (typically 4-8% alpha) with a slight blue tint (`#0891B2`) to integrate them into the brand palette. This "soft depth" helps users distinguish interactive dashboard widgets from the static page background without creating visual clutter.

## Shapes

The shape language is defined as **Rounded**, striking a balance between clinical precision and approachable friendliness. 

The standard 0.5rem (8px) radius is applied to cards, input fields, and standard buttons. Larger containers like modals or primary dashboard widgets use 1rem (16px) to soften the interface. This roundedness helps the Glymee interface feel welcoming and less like a daunting medical tool, encouraging daily engagement from users.

## Components

### Buttons
Buttons feature center-aligned text and 0.5rem rounded corners. The primary action button uses a solid fill of the primary Cyan, while secondary buttons use a subtle tonal fill (light cyan with dark cyan text) rather than a ghost-style outline to ensure they remain highly visible for accessibility.

### Cards
Cards are the primary container for health data. They should feature a white background, a very thin (1px) neutral border (`#E2E8F0`), and a soft ambient shadow. This ensures individual data points—like the "Estimated A1c"—are clearly compartmentalized.

### Input Fields
Inputs must have high-contrast labels (Inter Bold) and clear focus states using a 2px outer ring in the primary color. For diabetes management, inputs for numerical data (blood sugar levels) should use large, legible character sizes to prevent entry errors.

### Chips & Badges
Used for tagging meal types (e.g., "High Carb," "Fast Acting") or status indicators. These use a pill-shape (full rounding) and low-saturation background tints to provide categorization without competing with primary actions.

### Progress Indicators
Progress rings and bars for daily goals use the secondary Green color. They should have a thick stroke weight to ensure they are readable at a glance on mobile devices.
