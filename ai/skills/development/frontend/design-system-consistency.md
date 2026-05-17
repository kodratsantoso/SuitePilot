# Skill: Design System Consistency

## Purpose

Ensure all UI components in the AI NetSuite Implementation OS use a consistent visual language — colors, typography, spacing, component variants, and interaction patterns — so the platform feels unified as new features are added across phases.

## When To Use

Use when building new UI components, reviewing existing components, or when visual inconsistency is observed between different parts of the application. Also use at the start of each phase to confirm the design system conventions before building new UI.

## Required Inputs

- shadcn/ui version and configured components
- Tailwind CSS config (`tailwind.config.ts`)
- Existing component patterns in `app/frontend/components/`
- Any brand/color palette decisions

## Process

1. Document the canonical color tokens in use (primary, secondary, destructive, muted, accent).
2. Document the spacing scale being used (Tailwind defaults: 4px base unit).
3. Define badge color conventions: which colors map to which status values.
4. Define typography conventions: heading sizes, body sizes, muted text.
5. Define component variants for common patterns (status badges, health badges, priority chips).
6. Review any new component against the conventions and flag deviations.

## Output Format

Design system conventions documented in `app/frontend/DESIGN_SYSTEM.md`:

```markdown
## Color Conventions
- Status: Active = blue, On Hold = yellow, At Risk = orange, Completed = green, Cancelled = gray
- Health: Green = success, Amber = warning, Red = destructive
- Priority: Critical = red, High = orange, Medium = yellow, Low = gray

## Badge Variants
- Use shadcn/ui Badge component
- variant="default" for neutral, "destructive" for red, custom classes for amber/orange

## Spacing
- Page padding: p-6
- Section gaps: space-y-6
- Card internal padding: p-4

## Typography
- Page title: text-2xl font-semibold
- Section heading: text-lg font-medium
- Table header: text-sm font-medium text-muted-foreground
- Body: text-sm
```

## Validation Rules

- All status values must use the defined color mapping — no ad-hoc colors
- shadcn/ui components must not be restyled with inline styles
- New icons must come from the established icon library (`lucide-react`)

## Risk Checks

- Flag if two components use different colors for the same status value
- Flag if a new component introduces a custom color not in the Tailwind config

## Do Not Do

- Do not introduce a new component library alongside shadcn/ui
- Do not override shadcn/ui component styles with `!important`
- Do not use hex color values directly in JSX — use Tailwind classes

## Example Output

> ProjectHealthBadge conventions: GREEN → `<Badge className="bg-green-100 text-green-800">Green</Badge>`, AMBER → `<Badge className="bg-amber-100 text-amber-800">Amber</Badge>`, RED → `<Badge variant="destructive">Red</Badge>`, UNKNOWN → `<Badge variant="outline">Unknown</Badge>`.
