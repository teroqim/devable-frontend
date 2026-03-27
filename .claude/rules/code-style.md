---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
---

# Code Style

- When importing icons from `lucide-react`, always alias with an `Icon` postfix: `import { Home as HomeIcon } from 'lucide-react'`.
- Avoid inline anonymous functions in JSX event handlers. Define handlers as named functions or use `useCallback`.
- Always use existing UI components (e.g. `Button`) instead of raw HTML elements when a suitable component exists.
- Keep component files focused on rendering and event wiring. Move helper functions to utils files.
- Each component must live in its own folder with its CSS file.
- When adding derived data that affects rendering, compute it in the event handler and dispatch to state rather than computing with `useMemo` during render.
