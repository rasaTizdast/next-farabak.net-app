# Design System — next-farabak-app-v15

## Brand Colors

| Token               | Hex       | Usage                                                  |
| ------------------- | --------- | ------------------------------------------------------ |
| `--primary-color`   | `#00bfff` | Primary buttons, links, active states, scrollbar thumb |
| `--secondary-color` | `#318ce7` | Secondary elements, hover states                       |
| `--third-color`     | `#1e90ff` | Tertiary accents, subtle UI elements                   |
| `--fourth-color`    | `#0e6aff` | Darker accents, active borders                         |
| `--dark-blue-color` | `#003262` | Header, footer, dark sections titles                   |

_Defined in `src/app/globals.css:20-27`_

### shadcn/ui Design Tokens

The project uses a shadcn/ui design system on top of the brand palette. CSS variables are defined in `src/app/globals.css` and mapped to Tailwind utilities in `tailwind.config.ts`:

| Token                             | Value                           | Tailwind usage               |
| --------------------------------- | ------------------------------- | ---------------------------- |
| `--primary`                       | `195 100% 50%` (`#00bfff`)      | `bg-primary`, `text-primary` |
| `--primary-foreground`            | `0 0% 100%` (white)             | `text-primary-foreground`    |
| `--secondary`                     | `210 79% 55%` (`#318ce7`)       | `bg-secondary`               |
| `--secondary-foreground`          | `0 0% 100%`                     | `text-secondary-foreground`  |
| `--accent`                        | `195 100% 94%` (light blue)     | `bg-accent`, hover states    |
| `--accent-foreground`             | `209 100% 19%` (`#003262`)      | `text-accent-foreground`     |
| `--background`                    | `0 0% 94%` (`#f0f0f0`)          | `bg-background`              |
| `--foreground`                    | `221 39% 11%` (near-black)      | `text-foreground`            |
| `--muted` / `--muted-foreground`  | light gray / slate              | secondary text, disabled     |
| `--destructive`                   | `0 84% 60%` (`#ef4444`)         | `bg-destructive`, errors     |
| `--border` / `--input` / `--ring` | gray-200 / gray-300 / `#00bfff` | borders, focus ring          |
| `--radius`                        | `0.5rem` (8px)                  | `rounded-md`/`lg`            |

Brand extras: `third` (`#1e90ff`), `fourth` (`#0e6aff`), `dark-blue` (`#003262`), `brand.*` namespace.

### RTL Animation Utilities

Custom Tailwind plugin in `tailwind.config.ts` adds logical `end`/`start` slide animations (RTL-aware):
`slide-in-from-end-2`, `slide-in-from-start-2`, `slide-out-to-end-2`, `slide-out-to-start-2`.

### Component Library

23 shadcn primitives in `src/components/ui/` (all `"use client"`, Radix-based):

- **Core:** `button`, `badge`, `card`, `input`, `label`, `textarea`, `separator`, `skeleton`, `switch`, `checkbox`
- **Overlays:** `dialog`, `alert-dialog`, `dropdown-menu`, `tooltip`, `popover`, `alert`, `progress`
- **Data:** `table`, `select`, `tabs`, `accordion`, `radio-group`, `scroll-area`, `toast` (+ `Toaster`, `useToast`)

Plus: `ErrorPage`, `ItemsAccordion` (FAQ items-based accordion).

Dependencies: `class-variance-authority`, `clsx`, `tailwind-merge` (`cn` in `src/lib/utils.ts`), `tailwindcss-animate`, Radix primitives, `lucide-react`.

### Color Usage Guidelines

- Primary actions use `bg-[#00bfff]` or `bg-primary` (via Tailwind extended color)
- Error states: `text-red-500`, `border-red-500`
- Success states: `text-green-500`, `border-green-500`
- Warning/info: Tailwind amber/blue utilities
- Disabled states: `opacity-50`, `cursor-not-allowed`

## Typography

| Property       | Value                               |
| -------------- | ----------------------------------- |
| Primary Font   | `IRANYekanXVF.woff` (variable font) |
| CSS Variable   | `--font-iran-yekan`                 |
| Weight Range   | `100 1000` (variable)               |
| `font-display` | `swap`                              |
| Preloaded      | `preload: true`                     |
| Fallback       | `system-ui, arial`                  |

_Defined in `src/app/layout.tsx:13-20`_

### Text Styles

- Body: `font-iranyekan` applied globally via CSS variable
- Headings: Tailwind `font-bold` + size utilities
- Small/caption: `text-sm`, `text-xs` with `text-gray-400` or `text-gray-500`
- Links: `text-[#00bfff]`, `hover:text-[#318ce7]`

## Spacing & Breakpoints

| Breakpoint | Width  | Notes                               |
| ---------- | ------ | ----------------------------------- |
| `mobile`   | 577px  | Custom breakpoint for mobile-first  |
| `sm`       | 640px  |                                     |
| `md`       | 768px  |                                     |
| `lg`       | 1024px |                                     |
| `xl`       | 1280px |                                     |
| `2xl`      | 1400px | Custom, matches max container width |

_Defined in `tailwind.config.ts`_

### Layout

- Direction: **RTL** (right-to-left)
- Container: responsive padding, constrained at `max-w-7xl`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (common pattern)

## Custom CSS Utilities

_Defined in `src/app/globals.css`_

### `.glass-card`

```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(10px);
border-radius: 12px;
```

Used for cards, modals, overlay panels.

### `.input-field`

```css
border: 1px solid #d1d5db;
border-radius: 8px;
padding: 8px 12px;
transition: border-color 0.2s;
```

Used for form text inputs.

### `.textarea-field`

```css
border: 1px solid #d1d5db;
border-radius: 8px;
padding: 8px 12px;
min-height: 100px;
resize: vertical;
```

### `.responsive-table-wrapper`

```css
overflow-x: auto;
-webkit-overflow-scrolling: touch;
```

Wraps tables for horizontal scroll on mobile.

### `.scrollbar-hide`

Hides scrollbar while preserving scroll functionality.

### `.prose-view`

Styling for TipTap editor output:

- Headings (h1-h4) with appropriate sizes
- Ordered/unordered lists
- Code blocks
- Tables with zebra striping
- Responsive images
- Video embeds

## Component Patterns

### Image Slider (Homepage Hero)

- Component: `src/app/_components/imageSlider/ImageSlider.tsx`
- Dimensions: `1920x900`
- Quality: 90
- First slide: `priority` + `fetchPriority="high"` for LCP
- Remaining slides: `loading="lazy"`
- `placeholder="blur"` with `blurDataURL`

### Product Cards

- Used in: `CategoryGrid.tsx`, `ProductGrid.tsx`, `ProductsShowCase.tsx`
- Structure: Image → Title → Price → Add-to-invoice button
- Image: `width={1340}`, `height={780}`, `quality={75}`
- Responsive grid layout

### Category Slider

- Component: `src/app/(main)/products/_components/CategorySlider.tsx`
- Horizontal scroll with arrow navigation
- Category cards with image and name
- Wrapped in `<Suspense fallback={<SkeletonLoader amount={8} />}>`

### Forms (Auth, Contact, Admin)

- Uses React Hook Form + Yup validation
- Custom `TextInput` component in `src/app/auth/_components/TextInput.tsx`
- Error messages shown inline below inputs
- Persian labels and placeholder text

### Tables (Admin)

- Ant Design tables (`Table` component)
- Used in branches, products, invoices, warehouses
- Skeleton loading via `ProductTableSkeleton`
- Empty state: Ant Design's built-in empty or custom Persian message

### Accordion (FAQ)

- Custom `FaqAccordion` in `src/components/FaqAccordion.tsx`
- Custom `BlogFaqAccordion` in `src/components/BlogFaqAccordion.tsx`
- Uses `content-visibility: auto` for rendering performance
- Persian titles and content

### Skeleton Loaders

Reusable skeleton components:

- `src/app/_components/ui/SkeletonLoader.tsx` — generic, accepts `amount` prop
- `ProductTableSkeleton.tsx` — admin table rows
- `SkeletonFeatures` — product detail page features

## UI States (Persian)

All data-driven components implement these visual states:

### Loading

- Pulsing skeleton placeholders matching final content shape
- `animate-pulse` from Tailwind

### Empty / No Data

| Context  | Persian Text                          |
| -------- | ------------------------------------- |
| Products | `"محصولی یافت نشد"`                   |
| Generic  | `"آیتمی یافت نشد"`                    |
| Invoice  | `"فاکتوری وجود ندارد"`                |
| Search   | `"نتیجه‌ای برای جستجوی شما یافت نشد"` |

### Error

| Context      | Persian Text                         |
| ------------ | ------------------------------------ |
| Data fetch   | `"خطا در دریافت اطلاعات"`            |
| Save         | `"خطا در ذخیره اطلاعات"`             |
| Connection   | `"خطا در برقراری ارتباط با سرور"`    |
| Retry button | `"تلاش مجدد"` / `"دوباره تلاش کنید"` |

### Success

- Toast notifications via `react-hot-toast`
- Persian: `"عملیات با موفقیت انجام شد"`, `"اطلاعات ذخیره شد"`

## Animations

- `fade-in`: scale(0.95) → scale(1) + opacity 0 → 1 (defined in tailwind config)
- `animate-pulse`: used for skeleton loaders
- `animate-spin`: used for loading spinners (via Ant Design `Spin` component)
- Transition: `transition-all duration-200` for hover/active states
