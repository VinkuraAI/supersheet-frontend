# Supersheet Design System

> **Version:** 1.0  
> **Last Updated:** September 30, 2025  
> **Status:** ✅ Implemented across Welcome and Workspace-Setup pages

---

## 🎨 Color Palette

### Primary Colors
| Color Name | Hex Code | Usage | Tailwind Class |
|------------|----------|-------|----------------|
| **Primary Blue** | `#3B82F6` | Buttons, active states, accents | `blue-500` |
| **Dark Blue** | `#2563EB` | Button hovers, darker accents | `blue-600` |
| **Deeper Blue** | `#1D4ED8` | Deep hover states | `blue-700` |
| **Light Blue** | `#EFF6FF` | Blue backgrounds | `blue-50` |
| **Lighter Blue** | `#DBEAFE` | Lighter blue variant | `blue-100` |

### Neutral Colors (Slate)
| Color Name | Hex Code | Usage | Tailwind Class |
|------------|----------|-------|----------------|
| **Slate Dark** | `#1E293B` | Primary text | `slate-800` |
| **Slate Medium Dark** | `#334155` | Secondary text | `slate-700` |
| **Slate Medium** | `#64748B` | Tertiary text, labels | `slate-600` |
| **Slate Light** | `#94A3B8` | Placeholder text | `slate-400` |
| **Slate Border** | `#CBD5E1` | Borders | `slate-300` |
| **Slate Bg Light** | `#F1F5F9` | Light backgrounds | `slate-100` |
| **Slate Bg Lighter** | `#F8FAFC` | Lighter backgrounds | `slate-50` |

### State Colors
| State | Hex Code | Usage | Tailwind Class |
|-------|----------|-------|----------------|
| **Success** | `#10B981` | Success states | `green-500` |
| **Success Dark** | `#059669` | Darker success variant | `green-600` |
| **Error** | `#DC2626` | Error states | `red-600` |
| **Error Dark** | `#B91C1C` | Darker error variant | `red-700` |
| **Warning** | `#F59E0B` | Warning states | `amber-500` |

### Background Gradients
```css
/* Main page background */
background: linear-gradient(to bottom right, #F8FAFC, #EFF6FF, #E0E7FF);
/* Tailwind: bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 */

/* Card hover states */
background: linear-gradient(to bottom right, #EFF6FF, #E0E7FF);
/* Tailwind: bg-gradient-to-br from-blue-50 to-indigo-50 */

/* Primary buttons */
background: linear-gradient(to right, #3B82F6, #2563EB);
/* Tailwind: bg-gradient-to-r from-blue-500 to-blue-600 */

/* Primary buttons (hover) */
background: linear-gradient(to right, #2563EB, #1D4ED8);
/* Tailwind: bg-gradient-to-r from-blue-600 to-blue-700 */

/* Logo container */
background: linear-gradient(to bottom right, #2563EB, #1D4ED8);
/* Tailwind: bg-gradient-to-br from-blue-600 to-blue-700 */
```

---

## 📦 Component Specifications

### 1. Buttons

#### Primary Button
```tsx
className="px-8 py-3.5 rounded-xl font-semibold text-white text-base
           bg-gradient-to-r from-blue-500 to-blue-600
           hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]
           shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40
           transition-all duration-200"
```

**States:**
- **Default:** Gradient `#3B82F6` → `#2563EB`, white text, shadow with 30% opacity
- **Hover:** Gradient `#2563EB` → `#1D4ED8`, scale 1.02, shadow increases to 40% opacity
- **Disabled:** `bg-slate-300`, `text-slate-500`, no shadow, cursor not-allowed

#### Secondary Button (Back/Cancel)
```tsx
className="group flex items-center gap-2 px-4 py-2.5 rounded-lg
           text-slate-600 hover:text-slate-800 hover:bg-slate-100
           transition-all duration-200 font-medium"
```

**States:**
- **Default:** Text `#64748B`, transparent background
- **Hover:** Text `#334155`, background `#F1F5F9`

### 2. Input Fields

#### Text Input
```tsx
className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl 
           focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
           hover:border-slate-400
           transition-all duration-200 text-slate-800 text-base
           placeholder:text-slate-400 bg-white"
```

**States:**
- **Default:** White background, border `#CBD5E1` (2px), text `#1E293B`
- **Hover:** Border `#94A3B8`
- **Focus:** Border `#3B82F6`, ring `#3B82F6` with 20% opacity (4px ring)

#### Textarea
```tsx
className="w-full px-4 py-4 border-2 border-slate-300 rounded-xl 
           focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
           hover:border-slate-400
           transition-all duration-200 text-slate-800 text-sm leading-relaxed
           placeholder:text-slate-400 bg-white resize-none
           font-mono"
```

### 3. Cards

#### Standard Card
```tsx
className="bg-white border-2 border-slate-200 rounded-xl p-6
           shadow-lg shadow-slate-200/50
           hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.01]
           transition-all duration-200"
```

**States:**
- **Default:** White background, border `#E2E8F0`, shadow with 50% opacity
- **Hover:** Shadow increases, scale 1.01

#### Selected Card
```tsx
className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50
           shadow-xl shadow-blue-200/50 scale-[1.02]"
```

### 4. Icons & Logos

#### Logo Container
```tsx
className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl
           flex items-center justify-center shadow-lg shadow-blue-500/30"
```

#### Icon Container (Selected)
```tsx
className="w-12 h-12 rounded-xl flex items-center justify-center
           bg-white shadow-xl shadow-blue-200/50 scale-110
           transition-all duration-300"
```

#### Icon Container (Default)
```tsx
className="w-12 h-12 rounded-xl flex items-center justify-center
           bg-purple-100 group-hover:shadow-xl group-hover:scale-105
           transition-all duration-300"
```

### 5. Progress Indicators

#### Active Step
```tsx
className="w-8 h-8 rounded-full flex items-center justify-center
           bg-gradient-to-br from-blue-500 to-blue-600
           shadow-lg shadow-blue-500/25 ring-4 ring-blue-100
           transition-all duration-300"
```

#### Completed Step
```tsx
className="w-8 h-8 rounded-full flex items-center justify-center
           bg-gradient-to-br from-green-500 to-green-600
           shadow-lg shadow-green-500/25
           transition-all duration-300"
```

#### Progress Bar (Active)
```tsx
className="h-1 w-16 sm:w-24 rounded-full
           bg-gradient-to-r from-blue-500 to-blue-600
           transition-all duration-500"
```

#### Progress Bar (Inactive)
```tsx
className="h-1 w-16 sm:w-24 rounded-full bg-slate-200
           transition-all duration-500"
```

### 6. Selection Indicators

#### Checkmark Badge
```tsx
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center
             shadow-lg shadow-blue-500/30"
>
  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" 
       stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
</motion.div>
```

---

## 🎭 Animation Specifications

### Page Transitions
```tsx
// Fade in from bottom
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Fade in from top
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// Scale and fade
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.5 }}
```

### Stagger Animations
```tsx
// Card stagger
transition={{ duration: 0.4, delay: index * 0.05 }}

// HR options stagger
transition={{ duration: 0.4, delay: index * 0.1 }}
```

### Hover Animations
```tsx
// Button scale
hover:scale-[1.02]
transition-all duration-200

// Card scale
hover:scale-[1.01]
transition-all duration-200

// Icon container scale
group-hover:scale-105
transition-all duration-300
```

### Selection Animations
```tsx
// Checkmark appear
initial={{ scale: 0, rotate: -180 }}
animate={{ scale: 1, rotate: 0 }}

// Arrow icon slide
transition-transform group-hover:-translate-x-1
```

---

## 🔤 Typography

### Headings
| Element | Font Size | Font Weight | Color | Tailwind Classes |
|---------|-----------|-------------|-------|------------------|
| **H1 (Main)** | 36px (2.25rem) | 700 (Bold) | Gradient slate-800 → slate-600 | `text-4xl font-bold` |
| **H2 (Section)** | 30px (1.875rem) | 700 (Bold) | Gradient slate-800 → slate-600 | `text-3xl font-bold` |
| **H3 (Card Title)** | 16px (1rem) | 600 (Semibold) | `#1E293B` or `#1D4A67` (selected) | `text-base font-semibold` |
| **Label** | 14px (0.875rem) | 600 (Semibold) | `#334155` | `text-sm font-semibold` |

### Body Text
| Element | Font Size | Font Weight | Color | Tailwind Classes |
|---------|-----------|-------------|-------|------------------|
| **Body Large** | 18px (1.125rem) | 400 (Regular) | `#64748B` | `text-lg text-slate-600` |
| **Body** | 16px (1rem) | 400 (Regular) | `#64748B` | `text-base text-slate-600` |
| **Body Small** | 14px (0.875rem) | 400 (Regular) | `#64748B` | `text-sm text-slate-600` |
| **Caption** | 12px (0.75rem) | 500 (Medium) | `#94A3B8` | `text-xs font-medium text-slate-500` |

### Gradient Text
```tsx
className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
// For headings

className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
// For brand elements
```

---

## 📐 Spacing & Layout

### Border Radius
| Size | Pixels | Tailwind Class | Usage |
|------|--------|----------------|-------|
| **Small** | 8px | `rounded-lg` | Icons, small elements |
| **Medium** | 12px | `rounded-xl` | Cards, inputs, buttons |
| **Large** | 16px | `rounded-2xl` | Large cards, modals |
| **Full** | 9999px | `rounded-full` | Circles, badges |

### Shadows
```css
/* Small shadow - Cards default */
box-shadow: 0 10px 15px -3px rgba(226, 232, 240, 0.5);
/* Tailwind: shadow-lg shadow-slate-200/50 */

/* Medium shadow - Cards hover */
box-shadow: 0 20px 25px -5px rgba(226, 232, 240, 0.5);
/* Tailwind: shadow-xl shadow-slate-200/50 */

/* Blue shadow - Primary buttons */
box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
/* Tailwind: shadow-lg shadow-blue-500/30 */

/* Blue shadow hover - Primary buttons */
box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.4);
/* Tailwind: shadow-xl shadow-blue-600/40 */

/* Icon shadow */
box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.25);
/* Tailwind: shadow-lg shadow-blue-500/25 */
```

### Padding
| Size | Pixels | Tailwind Class | Usage |
|------|--------|----------------|-------|
| **XS** | 8px | `p-2` | Dense content |
| **Small** | 16px | `p-4` | Compact cards |
| **Medium** | 20px | `p-5` | Standard cards |
| **Large** | 24px | `p-6` | Large cards |
| **XL** | 32px | `p-8` | Main containers |

---

## 🎬 Background Pattern

### SVG Pattern Overlay
```tsx
<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40">
</div>
```

**Pattern Details:**
- Subtle dot pattern
- Color: `#4B5563` (Gray-600)
- Opacity: 3% (dots) + 40% (overlay)
- Size: 60x60px repeat

---

## ✨ Interactive States Summary

### Hover States
- **Buttons:** Scale 1.02, shadow increase
- **Cards:** Scale 1.01, shadow increase, border color change
- **Icons:** Scale 1.05, shadow appear
- **Text Links:** Color darkening, underline

### Focus States
- **Inputs:** Blue border, 4px ring at 20% opacity
- **Buttons:** Blue outline ring
- **Cards:** Blue border, elevated shadow

### Active States
- **Cards:** Blue border, gradient background, elevated shadow
- **Tabs:** Blue bottom border (3px), white background
- **Progress:** Blue gradient fill, ring effect

### Disabled States
- **Buttons:** Gray background, gray text, no shadow, cursor not-allowed
- **Inputs:** Gray background, gray border, reduced opacity

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Grid Layouts
```tsx
// Work type cards
className="grid grid-cols-1 md:grid-cols-2 gap-4"

// HR options
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"

// Skeleton loading
className="grid grid-cols-1 md:grid-cols-2 gap-3"
```

### Text Sizing
```tsx
// Headings - responsive
className="text-3xl sm:text-4xl font-bold"

// Body - responsive
className="text-base sm:text-lg"

// Progress bars - responsive width
className="h-1 w-16 sm:w-24"
```

---

## 🔧 Implementation Notes

### Dependencies
- **Tailwind CSS** v3.x - Utility-first CSS framework
- **Framer Motion** v10.x - Animation library
- **Lucide React** - Icon library
- **Next.js** v13+ - React framework

### Custom Components
1. **3D Icons** (`src/components/icons/3d-icons.tsx`)
   - HiringIcon
   - EmployeeManagementIcon
   - ProjectManagementIcon
   - UsersIcon
   - CodeIcon

### Animation Guidelines
- **Duration:** 200ms for interactions, 300-600ms for page transitions
- **Easing:** Default ease for most animations
- **Delays:** Use stagger delays (0.05-0.1s increments)
- **Scale:** Subtle scales (1.01-1.02 for cards, 1.05-1.1 for icons)

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ Color contrast ratios meet WCAG AA standards
- ✅ Motion respect prefers-reduced-motion

---

## 📄 Pages Implementing This System

1. ✅ **Welcome Page** (`src/app/welcome/page.tsx`)
   - Enhanced branding
   - Refined selection cards
   - Improved animations
   - Comprehensive hover states

2. ✅ **Workspace Setup Page** (`src/app/workspace-setup/page.tsx`)
   - Multi-step form with progress indicator
   - Enhanced input fields
   - Tab navigation
   - Drag-and-drop upload area
   - File upload states

---

## 🚀 Future Enhancements

### Planned Additions
- [ ] Dark mode variant
- [ ] Additional animation presets
- [ ] Custom form validation states
- [ ] Toast notification system
- [ ] Modal/dialog components
- [ ] Table components
- [ ] Data visualization components

### Design Tokens
Consider extracting to CSS variables or Tailwind config:
```js
// tailwind.config.js (future enhancement)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // ... more token definitions
      }
    }
  }
}
```

---

## 📝 Changelog

### Version 1.0 - September 30, 2025
- ✅ Initial design system documentation
- ✅ Implemented across Welcome and Workspace-Setup pages
- ✅ Comprehensive color palette defined
- ✅ Component specifications documented
- ✅ Animation guidelines established
- ✅ Responsive design patterns documented

---

**Maintained by:** Supersheet Design Team  
**Contact:** design@supersheet.com  
**Last Review:** September 30, 2025
