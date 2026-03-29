---
paths:
  - "src/**/*.css"
---

# CSS Styling

- Use plain CSS with native nesting syntax. Never use Tailwind utility classes.
- Always use CSS custom properties from `src/app/globals.css` instead of hardcoded color, spacing, font, radius, shadow, or transition values.
- Use CSS nesting extensively for organization.
- Write base styles for mobile first. Add desktop styles in separate `@media (min-width: 768px)` blocks. Never nest media queries inside selectors.
- Always wrap hover styles in `@media (hover: hover)` to prevent sticky hover states on touch devices.
- Use `clsx` directly for conditional classes in components.
- Do not style HTML tags directly (e.g. `input`, `select`, `div`). Always use CSS classes instead, unless there is a strong reason not to.
