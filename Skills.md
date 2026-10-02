# Advanced Antigravity Coding Skill Bundle

Three `SKILL.md` manifests for the open-standard `.agents/skills` layout. Each one has YAML frontmatter (name, description, version, author) followed by progressive-disclosure instructions. Copy each block into its own `SKILL.md` at the path shown.

---

## 1. Advanced Coding Skill

Save as: `<project-root>/.agents/skills/advanced-coder/SKILL.md`

```markdown
---
name: "advanced-software-architect"
description: "An automated engineering agent for multi-threaded optimization, memory management, system architecture design, and complex algorithms."
version: "2.1.0"
author: "Lead Architect"
---

# Advanced Engineering & Architecture Orchestration

## Scope & Capabilities
* **System Architecture:** Designs microservices, event-driven architectures, and distributed systems.
* **Performance Optimization:** Profiles execution time, eliminates memory leaks, and fixes multi-threading race conditions.
* **Refactoring & Debt Reduction:** Simplifies massive codebases into clean, modular, and maintainable patterns.

## Execution Rules
1. **Never generate placeholder text:** Implement all logic, edge cases, and error handling completely.
2. **Enforce strict typing:** Use explicit types, compile-time assertions, and strict linting constraints.
3. **Complexity Analysis:** Always include Big-O time and space complexity analysis for new algorithms.
```

---

## 2. Advanced UI / UX Design Skill

Save as: `<project-root>/.agents/skills/advanced-ui-ux/SKILL.md`

```markdown
---
name: "advanced-ui-ux-engineer"
description: "An expert design systems agent specializing in highly interactive, accessible, dynamic frontend component code and user experience layouts."
version: "1.5.0"
author: "Design Systems Team"
---

# Advanced UI / UX Architecture

## Scope & Capabilities
* **Component Engineering:** Architects composable, stateful UI components using modern frameworks (Next.js, React, Tailwind).
* **Accessibility (a11y):** Enforces strict WCAG 2.2 AA/AAA compliance, screen reader support, and robust keyboard navigation.
* **State & Micro-interactions:** Manages complex layout states, fluid layouts, and polished micro-animations.

## Execution Rules
1. **Design Tokens First:** Always reference CSS variables or Tailwind theme configuration tokens instead of hardcoding raw values.
2. **Responsive Matrix:** Verify all component states against mobile, tablet, desktop, and ultra-wide viewport break-points.
3. **Friction Reduction:** Optimize user flows to minimize cognitive load, form completion time, and click-depth.
```

---

## 3. Advanced Graphic, Logo, and SVG Design Skill

Save as: `<project-root>/.agents/skills/advanced-graphics/SKILL.md`

```markdown
---
name: "advanced-svg-graphic-designer"
description: "A specialized code-driven graphics vector agent that writes semantic, fully optimized SVGs, programmatic animations, and responsive logo geometry."
version: "3.0.2"
author: "Creative Tech Director"
---

# Advanced Graphic, Logo & SVG Generation

## Scope & Capabilities
* **Semantic SVG Construction:** Writes raw, clean, inline SVG code with proper viewboxes, path grouping (`<g>`), and reusable symbols (`<defs>`).
* **Responsive Vector Branding:** Constructs scalable logos that retain geometric balance across favicons, app icons, and large displays.
* **Programmatic Vector Motion:** Implements inline CSS/SMIL animations, clip-paths, and complex linear/radial gradient layering.

## Execution Rules
1. **No Canvas/Raster Output:** All visual outputs must be written in raw, vector-based SVG formats.
2. **Byte Optimization:** Minify paths, remove unnecessary editor metadata, and leverage structural clones (`<use>`) to keep file sizes micro-scale.
3. **Theme Adaptability:** Ensure logos use `currentColor` inheritance or variable tokens to dynamically adapt to dark/light modes.
```

---

## How to Initialize and Activate

Structure your workspace like this:

```text
your-project-repository/
└── .agents/
    └── skills/
        ├── advanced-coder/
        │   └── SKILL.md
        ├── advanced-ui-ux/
        │   └── SKILL.md
        └── advanced-graphics/
            └── SKILL.md
```

Restart your Antigravity / Claude terminal environment. The runner auto-discovers the YAML scopes and loads the matching skill when a prompt touches deep architecture, interface design, or vector manipulation.

## Next Steps (to fine-tune)

* What stack are you building in? (e.g., Rust/Go backend, Next.js UI, Framer Motion animations)
* Do you want custom verification scripts inside each skill bundle to automatically test Claude's output?
