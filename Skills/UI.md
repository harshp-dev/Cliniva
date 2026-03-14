# Cliniva UI Design System

> A comprehensive design system for building a world-class, cohesive, and delightful healthcare application experience.

---

## 1. Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Background** | `#FAF3E1` | Primary page background, cards, surfaces |
| **Surface** | `#F5E7C6` | Elevated surfaces, subtle sections, hover states |
| **Accent** | `#FA8112` | CTAs, highlights, links, focus states, key actions |
| **Text** | `#222222` | All body text, headings, labels |

### Color Philosophy

- **Background (`#FAF3E1`)**: Warm, soft cream that reduces eye strain and feels approachable. Use as the dominant surface.
- **Surface (`#F5E7C6`)**: Slightly warmer for cards, modals, and elevated content. Creates subtle hierarchy.
- **Accent (`#FA8112`)**: Use sparingly and strategically. Reserve for:
  - Primary buttons
  - Active/hover states on interactive elements
  - Links (default and hover)
  - Icons that indicate action or importance
  - Progress indicators and badges
- **Text (`#222222`)**: Near-black for maximum readability. All typography uses this color by default.

### Accent Usage Rules

- **Minimal but attractive**: Never flood the UI with orange. Aim for 1–3 accent touches per screen.
- **Purposeful**: Every orange element should guide attention or signal action.
- **Contrast**: Orange on cream backgrounds meets WCAG AA for large text; ensure sufficient contrast for small text.

---

## 2. Typography

### Font Family

**Bricolage Grotesque** — Modern, friendly, highly legible. Supports variable weights (200–800) and optical sizes (12–96).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap" rel="stylesheet">
```

### CSS Variables

```css
:root {
  --font-primary: 'Bricolage Grotesque', system-ui, sans-serif;
  --color-bg: #FAF3E1;
  --color-surface: #F5E7C6;
  --color-accent: #FA8112;
  --color-text: #222222;
}
```

### Type Scale

| Role | Weight | Size | Line Height | Use Case |
|------|--------|------|-------------|----------|
| H1 | 700 | 2rem–2.5rem | 1.2 | Page titles |
| H2 | 600 | 1.5rem–1.75rem | 1.3 | Section headers |
| H3 | 600 | 1.25rem | 1.35 | Card titles, subsections |
| Body | 400 | 1rem | 1.5 | Paragraphs, descriptions |
| Small | 400 | 0.875rem | 1.4 | Captions, labels |
| Button | 600 | 0.9375rem–1rem | 1.2 | CTA text |

### Typography Rules

- **All text is `#222222`** unless it is a link, active state, or highlighted element (then use `#FA8112`).
- Use `font-optical-sizing: auto` for Bricolage Grotesque.
- Limit line length to 60–75 characters for body text.

---

## 3. Animation & Motion (GSAP)

### Setup

Use GSAP with ScrollTrigger for scroll-based animations and smooth scrolling across the application.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

### Smooth Scroll

Enable smooth scrolling globally:

```javascript
gsap.registerPlugin(ScrollTrigger);

// Smooth scroll for the whole document
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    // Optional: custom scroll behavior
  }
});
```

Or use CSS for native smooth scroll:

```css
html {
  scroll-behavior: smooth;
}
```

### Micro-Animations on Scroll

**Text reveal on scroll** — Fade and slide up:

```javascript
gsap.utils.toArray('.reveal-text').forEach(elem => {
  gsap.from(elem, {
    scrollTrigger: {
      trigger: elem,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    y: 24,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  });
});
```

**Staggered list items**:

```javascript
gsap.from('.stagger-item', {
  scrollTrigger: {
    trigger: '.stagger-container',
    start: 'top 80%'
  },
  y: 20,
  opacity: 0,
  stagger: 0.1,
  duration: 0.5,
  ease: 'power2.out'
});
```

### Animation Principles

- **Duration**: 0.3–0.6s for micro-interactions; 0.6–1s for larger reveals.
- **Easing**: Prefer `power2.out` or `power3.out` for natural deceleration.
- **Purpose**: Every animation should support understanding or feedback, not decoration.
- **Reduced motion**: Respect `prefers-reduced-motion: reduce` and disable non-essential animations.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 4. UI/UX Design Guidelines

### Visual Hierarchy

1. **Primary**: One clear focal point per screen (hero, main CTA, key metric).
2. **Secondary**: Supporting content (cards, lists, sections).
3. **Tertiary**: Metadata, hints, footnotes.

Use size, weight, spacing, and color (including accent) to establish hierarchy.

### Spacing System

Use a consistent scale (e.g., 4px base):

- `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`

Apply consistently for padding, margins, and gaps.

### Component Patterns

- **Buttons**: Primary = accent background; Secondary = outline or surface background.
- **Cards**: Surface background, subtle shadow or border, rounded corners (8–12px).
- **Inputs**: Clear focus state with accent ring; labels above fields.
- **Links**: Text color `#222222`, accent on hover/active.

### Accessibility

- **Contrast**: Text `#222222` on `#FAF3E1` exceeds WCAG AA.
- **Focus**: Visible focus ring using accent color.
- **Touch targets**: Minimum 44×44px for interactive elements.
- **Labels**: All inputs have visible, associated labels.

### Responsive Behavior

- Mobile-first layout.
- Breakpoints: 640px, 768px, 1024px, 1280px.
- Typography scales down on small screens; spacing adjusts proportionally.

### Loading & Feedback

- Skeleton loaders in surface color.
- Success/error states with clear color and icon.
- Disabled states: reduced opacity, no pointer events.

---

## 5. Implementation Checklist

- [ ] Apply color variables (`--color-bg`, `--color-surface`, `--color-accent`, `--color-text`) globally.
- [ ] Set Bricolage Grotesque as the primary font.
- [ ] Ensure all text is `#222222`; use `#FA8112` only for highlights and CTAs.
- [ ] Integrate GSAP + ScrollTrigger for scroll-based animations.
- [ ] Enable smooth scroll (CSS or JS).
- [ ] Add text reveal and stagger animations to key sections.
- [ ] Respect `prefers-reduced-motion` for accessibility.
- [ ] Use the spacing scale consistently.
- [ ] Maintain 1–3 accent touches per screen.
- [ ] Test contrast and focus states across components.

---

## 6. Quick Reference

```css
/* Colors */
--color-bg: #FAF3E1;
--color-surface: #F5E7C6;
--color-accent: #FA8112;
--color-text: #222222;

/* Font */
font-family: 'Bricolage Grotesque', system-ui, sans-serif;
```

**Rule of thumb**: Black text everywhere, orange only where it matters.
