# Remix of Clarity Crafted

*Use the inspiration in the screenshot
# Maya Chen Portfolio - Product Specification

## 1. Product Overview

Maya Chen Portfolio is a modern, minimalist portfolio website showcasing the work and experience of a product designer specializing in Product Design and Creative Direction. The site features an elegant dark theme with sophisticated animations, emphasizing clarity and purpose through thoughtful typography and spatial design. Built with Next.js App Router, React, TypeScript, Framer Motion, and Tailwind CSS, this portfolio delivers a premium, interactive experience that highlights over a decade of design expertise across leading technology companies. The architecture leverages server components for optimal performance while using client components strategically for interactive animations and dynamic content.

## 2. Key Features & Requirements

### Navigation Bar

**Requirements:**
- Fixed positioning that remains visible during scroll
- Backdrop blur effect for visual depth when overlaying content
- Breadcrumb-style navigation showing current location
- Smooth transitions when navigating between pages
- Maintain z-index hierarchy to stay above page content

**Mock Data:**
- Home page: "Maya Chen / Home"
- Case study page: "Maya Chen / Verve"

**Visual Requirements:**
- Fixed top positioning with `fixed top-0 left-0 right-0 z-50`
- Backdrop blur using `backdrop-blur-xl bg-black/40`
- Container with `max-w-7xl mx-auto px-8 py-6`
- Text styling: `text-sm font-medium text-white/90 tracking-wide`
- Bottom border: `border-b border-white/10`
- Breadcrumb separator "/" in `text-white/40`
- Hover state on clickable name: `hover:text-white transition-colors duration-200`

### Hero Section (Home Page)

**Requirements:**
- Display animated typewriter effect with multiple overlapping text layers
- Create visual depth through opacity variations on stacked text
- Show professional tagline and extended description
- Feature large showcase video or image with smooth loading
- Implement smooth entrance animations on page load

**Mock Data:**
- **Animated Name:** "Maya Chen" (cycling through typewriter/fade effects)
- **Tagline:** "Product Design & Creative Direction."
- **Description:** "Crafting products with clarity and purpose for over a decade."
- **Featured Visual:** Large video/image showcasing company logo animation (e.g., abstract geometric blocks forming a brand mark)

**Visual Requirements:**
- Hero container: `min-h-screen flex flex-col justify-center px-8 py-32 max-w-7xl mx-auto`
- Animated text layers:
  - Multiple instances of name stacked with `absolute` positioning
  - Opacity variations: `opacity-100`, `opacity-60`, `opacity-30`, `opacity-10`
  - Text size: `text-8xl md:text-9xl font-bold text-white leading-none`
  - Letter spacing: `tracking-tight`
  - Each layer offset by 2-4px for depth effect
- Tagline: `text-2xl md:text-3xl font-semibold text-white mt-16 mb-4`
- Description: `text-xl text-zinc-400 font-medium max-w-2xl`
- Featured showcase:
  - Container: `mt-24 rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5`
  - Aspect ratio: `aspect-video` or `aspect-[16/10]`
  - Video/image: `w-full h-full object-cover`
  - Animation: fade in from below with 0.6s delay

### Experience Section (Home Page)

**Requirements:**
- Display chronological work history with interactive cards
- Each card links to corresponding case study page (when available)
- Show company icon, name, date range, and role
- Implement hover states with arrow reveal animation
- Personal projects section clearly differentiated

**Mock Data:**
- **Work Experience:**
  - **Verve** (2024-Present) - Design Director
    - Icon: Purple/violet gradient abstract geometric mark
    - Links to /verve case study
  - **Spotify** (2020-2024) - Staff Designer
    - Icon: Green circle with sound wave pattern
    - Links to case study
  - **Figma** (2016-2020) - Senior Designer
    - Icon: Orange to red gradient with connected nodes
    - Links to case study
  - **Notion** (2012-2016) - Senior Designer
    - Icon: Black and white stylized "N" mark
    - Links to case study
- **Personal Projects:**
  - **Explorations + Motion** (no date)
    - Icon: Colorful grid pattern with abstract shapes
    - Links to project showcase

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Card container: `flex flex-col gap-2`
- Individual card:
  - Base: `flex items-center gap-6 px-3 py-3 rounded-xl transition-all duration-200`
  - Hover: `bg-white/5 hover:bg-white/[0.08]`
  - Cursor: `cursor-pointer` for clickable items
- Company icon:
  - Size: `w-9 h-9 rounded`
  - Wrapper: `flex-shrink-0`
  - Border: `border border-white/10`
- Text layout:
  - Container: `flex-1 flex items-center justify-between`
  - Left content: `flex flex-col gap-1`
  - Company name: `text-base font-semibold text-white`
  - Date and role wrapper: `flex items-center gap-2 text-sm`
  - Date: `text-zinc-600 font-medium`
  - Separator: `text-zinc-600` (·)
  - Role: `text-zinc-500 font-medium`
- Arrow icon:
  - Base: `opacity-0 transition-opacity duration-200`
  - Hover: `group-hover:opacity-100`
  - Color: `text-zinc-600`
  - Size: `w-5 h-5`

### Education Section (Home Page)

**Requirements:**
- Display academic credentials in clean, non-interactive format
- Show degree name, institution, and date range
- Maintain visual hierarchy with typography weights
- Provide clear separation between entries

**Mock Data:**
- **Master of Fine Arts (M.F.A.)** 2010-2012
  - Rhode Island School of Design
- **Interaction Design** 2011-2012
  - Copenhagen Institute of Interaction Design

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Entry spacing: `flex flex-col gap-8`
- Degree line:
  - Wrapper: `flex items-baseline gap-3 mb-2`
  - Degree name: `text-base font-semibold text-white`
  - Date: `text-sm text-zinc-600 font-medium`
- Institution: `text-sm text-zinc-500 font-medium`

### About Section (Home Page)

**Requirements:**
- Present multi-paragraph biography with emphasized keywords
- Highlight specific expertise areas (Product, Motion, Sound, Brand)
- Maintain comfortable reading rhythm with proper spacing
- Use typography to create visual hierarchy

**Mock Data:**
- "Over a decade of experience crafting digital products, brands and experiences that are used by millions of people every day."
- "Embracing growth, I continually combine extensive experience in **Product**, **Motion**, **Sound** and **Brand**-Design"
- "I am dedicated to shaping a better future through Design. My approach always puts people first — from clients to users."
- "Curious and optimistic."

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Paragraph container: `flex flex-col gap-6`
- Regular text: `text-[17px] leading-relaxed text-zinc-400 font-medium`
- Bold keywords: `font-semibold text-white` inline within paragraphs
- Last line: `text-[17px] leading-relaxed text-zinc-400 font-medium italic`

### Contact Section (Home Page)

**Requirements:**
- Display contact methods and social links in two-column layout
- Show live local time for location
- Include icons for each contact method
- External links indicated with arrow icon
- Responsive single-column layout on mobile

**Mock Data:**
- **Contact Column:**
  - Email: hello@mayachen.design
  - LinkedIn: linkedin.com/in/mayachen (external link)
  - Dribbble: dribbble.com/mayachen (external link)
- **Location Column:**
  - San Francisco, USA 🇺🇸
  - Current time: 3:36 PM (dynamically updated)

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Two-column grid: `grid grid-cols-1 md:grid-cols-2 gap-12`
- Column header: `text-base font-semibold text-white mb-6`
- Link items:
  - Container: `flex items-center gap-3 py-2 group`
  - Icon wrapper: `w-5 h-5 text-zinc-400`
  - Text: `text-[17px] text-zinc-400 font-medium hover:text-white transition-colors duration-200`
  - External arrow: `w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200`
- Location display:
  - Text: `text-[17px] text-zinc-400 font-medium flex items-center gap-2`
  - Flag emoji: `text-xl`
- Time display:
  - Text: `text-[17px] text-zinc-500 font-medium mt-2`
  - Format: 12-hour with AM/PM

### Footer (Home Page)

**Requirements:**
- Display copyright and location information
- Maintain minimal, unobtrusive design
- Align with overall site aesthetic

**Mock Data:**
- Left: "© Maya Chen"
- Right: "Made in California"

**Visual Requirements:**
- Container: `border-t border-white/10 mt-32`
- Inner wrapper: `max-w-7xl mx-auto px-8 py-12 flex justify-between items-center`
- Copyright text: `text-sm text-zinc-600 font-medium`
- Location text: `text-sm text-zinc-600 font-medium`
- Responsive: `flex-col gap-4 md:flex-row` for mobile stacking

### Case Study Page - Breadcrumb

**Requirements:**
- Display navigation path with separator
- Make portfolio name clickable to return home
- Show current case study name
- Maintain consistency with main navigation

**Mock Data:**
- "Maya Chen / Verve"

**Visual Requirements:**
- Same styling as main navigation bar
- Clickable name: `hover:text-white cursor-pointer`
- Separator: `text-white/40 mx-2`
- Case study name: `text-white/60`

### Case Study Page - Content

**Requirements:**
- Present case study in focused, readable format
- Constrain text to comfortable line length
- Display images at full width with rounded corners
- Include external links to live projects
- Implement smooth image loading and transitions

**Mock Data:**
- **Title:** "Reimagining Creative Collaboration"
- **Subtitle:** "Verve is the new standard for how creative teams can ideate, prototype, and ship design work together."
- **Role Description:** "As part of Verve's founding design team, I helped craft a **next-generation collaborative design platform** from the ground up. I led early **product design**, **experience design**, **design systems**, and **visual identity**, shaping a tool now trusted by teams worldwide to ideate, iterate, and ship with confidence."
- **External Link:** "verve.design"
- **Image Gallery Descriptions:**
  - Product interface showing task management workflow with status columns: "To do" (blue), "In progress" (orange), "Done" (green), "Locked" (gray)
  - Vibrant gradient slide with purple/blue background and "Sales Proposal" headline
  - Template gallery view showing grid of design template cards
  - Analytics dashboard with line charts, metrics, and performance indicators
  - User portfolio slide with profile photo, bold typography, and project showcase
  - Marketing landing page with large headline "All hands on deck" and team collaboration imagery

**Visual Requirements:**
- Page container: `min-h-screen py-32 px-8`
- Content wrapper: `max-w-[600px] mx-auto`
- Title: `text-4xl md:text-5xl font-bold text-white mb-6 leading-tight`
- Subtitle: `text-xl md:text-2xl text-zinc-400 font-medium mb-12 leading-relaxed`
- Body paragraph: `text-[17px] leading-relaxed text-zinc-400 font-medium mb-8`
- Bold keywords in paragraphs: `font-semibold text-white`
- External link:
  - Text: `text-[#4A9EFF] font-medium hover:text-[#6BB3FF] transition-colors duration-200`
  - Underline: `underline decoration-[#4A9EFF]/40`
  - Display: `inline-flex items-center gap-1`
- Image gallery:
  - Container: `my-16 flex flex-col gap-5`
  - Individual image wrapper: `w-screen max-w-full -mx-8 md:-mx-0 md:w-[calc(100%+16rem)] md:-ml-32`
  - Image: `rounded-xl md:rounded-2xl overflow-hidden`
  - Aspect ratio variations: `aspect-[16/9]` or `aspect-[16/10]` based on content
  - Border: `border border-white/5`
  - Loading: fade-in animation with stagger delay

## 3. Design System

### Color Palette

**Background Colors:**
- Primary Background: `#0A0A0A` (`bg-[#0A0A0A]`)
- Card Background: `#0A0A0A` (same as primary)
- Hover Background: `rgba(255, 255, 255, 0.05)` (`bg-white/5`)
- Strong Hover: `rgba(255, 255, 255, 0.08)` (`bg-white/[0.08]`)

**Text Colors:**
- Primary Text: `#FFFFFF` (`text-white`)
- Secondary Text: `#999999` (`text-zinc-400`)
- Muted Text: `#454545` (`text-zinc-600`)
- Tertiary Text: `#9E9E9E` (`text-zinc-500`)
- Dimmed White: `rgba(255, 255, 255, 0.9)` (`text-white/90`)
- Subdued White: `rgba(255, 255, 255, 0.6)` (`text-white/60`)
- Faded White: `rgba(255, 255, 255, 0.4)` (`text-white/40`)

**Accent Colors:**
- Link Blue: `#4A9EFF` (`text-[#4A9EFF]`)
- Link Blue Hover: `#6BB3FF` (`text-[#6BB3FF]`)

**Border Colors:**
- Primary Border: `rgba(255, 255, 255, 0.1)` (`border-white/10`)
- Subtle Border: `rgba(255, 255, 255, 0.05)` (`border-white/5`)

**Status Colors (for UI elements in images):**
- Blue (To Do): `#3B82F6` (reference only)
- Orange (In Progress): `#F97316` (reference only)
- Green (Done): `#10B981` (reference only)
- Gray (Locked): `#6B7280` (reference only)

### Typography

**Font Families:**
- Primary Font: "Instrument Sans" (system fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- Navigation Brand: "Roobert Bold" (fallback to bold sans-serif if unavailable)

**Font Sizes:**
- Navigation: `0.875rem` (`text-sm`)
- Section Headers: `1rem` (`text-base`)
- Body Text: `1.0625rem` (17px, `text-[17px]`)
- Standard: `1rem` (`text-base`)
- Large: `1.125rem` (`text-lg`)
- Extra Large: `1.25rem` (`text-xl`)
- 2XL: `1.5rem` (`text-2xl`)
- 3XL: `1.875rem` (`text-3xl`)
- 4XL: `2.25rem` (`text-4xl`)
- 5XL: `3rem` (`text-5xl`)
- 8XL: `6rem` (`text-8xl`)
- 9XL: `8rem` (`text-9xl`)

**Font Weights:**
- Regular: `400` (`font-normal`)
- Medium: `500` (`font-medium`)
- Semibold: `600` (`font-semibold`)
- Bold: `700` (`font-bold`)

**Line Heights:**
- None: `1` (`leading-none`)
- Tight: `1.25` (`leading-tight`)
- Relaxed: `1.75` (`leading-relaxed`)
- Body: `1.5` (default with `leading-relaxed`)

**Letter Spacing:**
- Tight: `-0.025em` (`tracking-tight`)
- Normal: `0` (`tracking-normal`)
- Wide: `0.025em` (`tracking-wide`)

### Core Components

**Navigation Component:**
- Container: Fixed top bar with backdrop blur
- Styling: `fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10`
- Inner: `max-w-7xl mx-auto px-8 py-6`
- Text: `text-sm font-medium text-white/90 tracking-wide`
- Separator: `text-white/40 mx-2`
- Hover: `hover:text-white transition-colors duration-200`

**Experience Card Component:**
- Base: `flex items-center gap-6 px-3 py-3 rounded-xl transition-all duration-200`
- Hover: `hover:bg-white/[0.08] cursor-pointer`
- Icon: `w-9 h-9 rounded border border-white/10 flex-shrink-0`
- Content: `flex-1 flex items-center justify-between`
- Title: `text-base font-semibold text-white`
- Meta: `flex items-center gap-2 text-sm`
- Date: `text-zinc-600 font-medium`
- Role: `text-zinc-500 font-medium`
- Arrow: `w-5 h-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200`

**Text Section Component:**
- Container: `max-w-3xl mx-auto px-8 py-24`
- Header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Paragraph: `text-[17px] leading-relaxed text-zinc-400 font-medium`
- Emphasis: `font-semibold text-white` (inline)
- Spacing: `flex flex-col gap-6` for paragraph containers

**Contact Link Component:**
- Container: `flex items-center gap-3 py-2 group`
- Icon: `w-5 h-5 text-zinc-400`
- Text: `text-[17px] text-zinc-400 font-medium hover:text-white transition-colors duration-200`
- External Arrow: `w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200`

**Case Study Image Component:**
- Full-width container: `w-screen max-w-full -mx-8 md:-mx-0 md:w-[calc(100%+16rem)] md:-ml-32`
- Image wrapper: `rounded-xl md:rounded-2xl overflow-hidden border border-white/5`
- Aspect ratio: `aspect-video` or `aspect-[16/10]`
- Object fit: `object-cover`
- Loading: Fade in with Framer Motion

**Button/Link Component (for external links):**
- Base: `inline-flex items-center gap-1 text-[#4A9EFF] font-medium underline decoration-[#4A9EFF]/40`
- Hover: `hover:text-[#6BB3FF] transition-colors duration-200`
- Icon (if present): `w-4 h-4`

### Responsive Design Principles

**Breakpoints:**
- Desktop: `min-width: 1000px` (`min-w-[1000px]`)
- Tablet: `810px - 999px` (`min-w-[810px] max-w-[999px]`)
- Mobile: `max-width: 809px` (`max-w-[809px]`)

**Layout Adaptations:**
- Navigation: Maintains fixed position across all breakpoints, adjusts padding
- Hero text: Scales from `text-8xl` on desktop to `text-6xl` on mobile
- Contact section: Two columns (`grid-cols-2`) on desktop, single column (`grid-cols-1`) on mobile
- Case study images: Full bleed on mobile (`-mx-8`), extended width on desktop
- Container padding: `px-8` on mobile, `px-8 md:px-12 lg:px-8` responsive scaling

**Typography Scaling:**
- Hero name: `text-6xl md:text-8xl lg:text-9xl` (mobile to desktop)
- Hero tagline: `text-xl md:text-2xl lg:text-3xl`
- Case study title: `text-4xl md:text-5xl`
- Case study subtitle: `text-xl md:text-2xl`
- Body text: Consistent `text-[17px]` across breakpoints for readability

**Component Behavior:**
- Experience cards: Full width on all screens, text wraps gracefully
- Education entries: Single column, comfortable spacing
- Footer: Stacks vertically (`flex-col`) on mobile, horizontal (`flex-row`) on desktop
- Navigation breadcrumb: Text size adjusts, maintains readability

### Animation Specifications

**Hero Text Animation (Framer Motion):**
- Effect: Typewriter/fade cycling with layered depth
- Implementation:
  - Multiple text layers with staggered opacity
  - Primary layer: `opacity: 1`, `y: 0`
  - Secondary layer: `opacity: 0.6`, `y: -2px`
  - Tertiary layer: `opacity: 0.3`, `y: -4px`
  - Background layer: `opacity: 0.1`, `y: -6px`
- Animation variants:
  - Initial: `opacity: 0`, `y: 20`
  - Animate: `opacity: [calculated]`, `y: [calculated]`
  - Transition: `duration: 0.8`, `ease: [0.22, 1, 0.36, 1]`
- Cycling: Text fades out and new text fades in with 3-second intervals

**Page Load Animations (Framer Motion):**
- Sections fade in sequentially with stagger
- Initial: `opacity: 0`, `y: 30`
- Animate: `opacity: 1`, `y: 0`
- Transition: `duration: 0.6`, `delay: stagger * 0.1`

**Experience Card Hover (Framer Motion):**
- Background: Smooth transition from transparent to `bg-white/[0.08]`
- Arrow reveal: `opacity` transition from 0 to 100
- Transition: `duration: 0.2`, `ease: 'easeOut'`
- Scale on press: `scale: 0.98` (optional subtle feedback)

**Contact Link Hover:**
- Text color transition: `duration: 0.2s`
- Arrow color transition: `duration: 0.2s`
- Use: `transition-colors duration-200`

**Image Gallery Loading (Framer Motion):**
- Each image fades in with stagger
- Initial: `opacity: 0`, `scale: 0.95`
- Animate: `opacity: 1`, `scale: 1`
- Transition: `duration: 0.5`, `delay: index * 0.1`, `ease: 'easeOut'`

**Scroll Animations:**
- Smooth scroll behavior: `scroll-behavior: smooth` on html
- Sections fade in when entering viewport using Framer Motion's viewport detection
- Threshold: `amount: 0.3` (30% of element visible triggers animation)

**Navigation Backdrop Blur:**
- Always active: `backdrop-blur-xl`
- Background opacity adjusts based on scroll position (optional enhancement)
- Smooth transition when changing pages

### Interaction States

**Experience Cards:**
- Default: `bg-transparent`
- Hover: `bg-white/[0.08]`, arrow `opacity-100`, subtle lift optional
- Active/Click: `bg-white/10` momentarily
- Focus: `outline-2 outline-white/20 outline-offset-2`

**Links (Text Links):**
- Default: `text-zinc-400`
- Hover: `text-white`
- Active: `text-white/80`
- Visited: No change (maintain consistency)

**External Links:**
- Default: `text-[#4A9EFF]` with `underline decoration-[#4A9EFF]/40`
- Hover: `text-[#6BB3FF]`, arrow shifts right 2px
- Active: `text-[#4A9EFF]/80`

**Contact Icons:**
- Default: `text-zinc-400`
- Hover: Arrow `text-zinc-400`, icon maintains color
- Active: Slight scale down `scale-95`

**Navigation Breadcrumb:**
- Name (clickable): Default `text-white/90`, Hover `text-white`
- Current page: `text-white/60` (non-interactive)

### Accessibility Considerations

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Focus indicators: `focus-visible:outline-2 focus-visible:outline-white/20 focus-visible:outline-offset-2`
- Tab order follows visual hierarchy
- Skip link to main content: `Skip to content` link at top

**Screen Readers:**
- Semantic HTML structure (nav, main, section, article)
- Image alt text for all visual content
- ARIA labels for icon-only buttons
- Link text describes destination clearly

**Color Contrast:**
- Primary text on background: WCAG AAA compliant
- Secondary text on background: WCAG AA compliant minimum
- Link blue meets contrast requirements for text
- Interactive elements have sufficient color differentiation

**Motion Sensitivity:**
- Respect `prefers-reduced-motion` media query
- Disable animations when user prefers reduced motion
- Provide alternative focus indicators without motion
- Hero animation can be simplified to fade only

### Performance Optimization

**Image Loading:**
- Use Next.js Image component for automatic optimization
- Implement lazy loading for below-fold images
- Blur placeholder for smoother loading experience
- Specify width and height to prevent layout shift

**Animation Performance:**
- Use Framer Motion's `layout` prop sparingly
- Prefer `opacity` and `transform` for animations (GPU accelerated)
- Avoid animating `height`, `width`, or `top`/`left` properties
- Use `will-change` sparingly and only when necessary

**Font Loading:**
- Preload primary font (Instrument Sans) in document head
- Use `font-display: swap` for faster text rendering
- Subset fonts to include only necessary characters
- Consider variable fonts for fewer HTTP requests

**Code Splitting:**
- Separate client components from server components
- Lazy load Framer Motion animations below the fold
- Dynamic imports for case study pages
- Minimize JavaScript bundle size by using server components where possible

**SEO Metadata:**
- Page titles: "Maya Chen - Product Design & Creative Direction"
- Meta descriptions for home and case study pages
- Open Graph tags for social sharing
- Canonical URLs for each page
- JSON-LD structured data for person/portfolio schema
*Use the inspiration in the screenshot
# Maya Chen Portfolio - Product Specification

## 1. Product Overview

Maya Chen Portfolio is a modern, minimalist portfolio website showcasing the work and experience of a product designer specializing in Product Design and Creative Direction. The site features an elegant dark theme with sophisticated animations, emphasizing clarity and purpose through thoughtful typography and spatial design. Built with Next.js App Router, React, TypeScript, Framer Motion, and Tailwind CSS, this portfolio delivers a premium, interactive experience that highlights over a decade of design expertise across leading technology companies. The architecture leverages server components for optimal performance while using client components strategically for interactive animations and dynamic content.

## 2. Key Features & Requirements

### Navigation Bar

**Requirements:**
- Fixed positioning that remains visible during scroll
- Backdrop blur effect for visual depth when overlaying content
- Breadcrumb-style navigation showing current location
- Smooth transitions when navigating between pages
- Maintain z-index hierarchy to stay above page content

**Mock Data:**
- Home page: "Maya Chen / Home"
- Case study page: "Maya Chen / Verve"

**Visual Requirements:**
- Fixed top positioning with `fixed top-0 left-0 right-0 z-50`
- Backdrop blur using `backdrop-blur-xl bg-black/40`
- Container with `max-w-7xl mx-auto px-8 py-6`
- Text styling: `text-sm font-medium text-white/90 tracking-wide`
- Bottom border: `border-b border-white/10`
- Breadcrumb separator "/" in `text-white/40`
- Hover state on clickable name: `hover:text-white transition-colors duration-200`

### Hero Section (Home Page)

**Requirements:**
- Display animated typewriter effect with multiple overlapping text layers
- Create visual depth through opacity variations on stacked text
- Show professional tagline and extended description
- Feature large showcase video or image with smooth loading
- Implement smooth entrance animations on page load

**Mock Data:**
- **Animated Name:** "Maya Chen" (cycling through typewriter/fade effects)
- **Tagline:** "Product Design & Creative Direction."
- **Description:** "Crafting products with clarity and purpose for over a decade."
- **Featured Visual:** Large video/image showcasing company logo animation (e.g., abstract geometric blocks forming a brand mark)

**Visual Requirements:**
- Hero container: `min-h-screen flex flex-col justify-center px-8 py-32 max-w-7xl mx-auto`
- Animated text layers:
  - Multiple instances of name stacked with `absolute` positioning
  - Opacity variations: `opacity-100`, `opacity-60`, `opacity-30`, `opacity-10`
  - Text size: `text-8xl md:text-9xl font-bold text-white leading-none`
  - Letter spacing: `tracking-tight`
  - Each layer offset by 2-4px for depth effect
- Tagline: `text-2xl md:text-3xl font-semibold text-white mt-16 mb-4`
- Description: `text-xl text-zinc-400 font-medium max-w-2xl`
- Featured showcase:
  - Container: `mt-24 rounded-2xl overflow-hidden bg-zinc-900/50 border border-white/5`
  - Aspect ratio: `aspect-video` or `aspect-[16/10]`
  - Video/image: `w-full h-full object-cover`
  - Animation: fade in from below with 0.6s delay

### Experience Section (Home Page)

**Requirements:**
- Display chronological work history with interactive cards
- Each card links to corresponding case study page (when available)
- Show company icon, name, date range, and role
- Implement hover states with arrow reveal animation
- Personal projects section clearly differentiated

**Mock Data:**
- **Work Experience:**
  - **Verve** (2024-Present) - Design Director
    - Icon: Purple/violet gradient abstract geometric mark
    - Links to /verve case study
  - **Spotify** (2020-2024) - Staff Designer
    - Icon: Green circle with sound wave pattern
    - Links to case study
  - **Figma** (2016-2020) - Senior Designer
    - Icon: Orange to red gradient with connected nodes
    - Links to case study
  - **Notion** (2012-2016) - Senior Designer
    - Icon: Black and white stylized "N" mark
    - Links to case study
- **Personal Projects:**
  - **Explorations + Motion** (no date)
    - Icon: Colorful grid pattern with abstract shapes
    - Links to project showcase

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Card container: `flex flex-col gap-2`
- Individual card:
  - Base: `flex items-center gap-6 px-3 py-3 rounded-xl transition-all duration-200`
  - Hover: `bg-white/5 hover:bg-white/[0.08]`
  - Cursor: `cursor-pointer` for clickable items
- Company icon:
  - Size: `w-9 h-9 rounded`
  - Wrapper: `flex-shrink-0`
  - Border: `border border-white/10`
- Text layout:
  - Container: `flex-1 flex items-center justify-between`
  - Left content: `flex flex-col gap-1`
  - Company name: `text-base font-semibold text-white`
  - Date and role wrapper: `flex items-center gap-2 text-sm`
  - Date: `text-zinc-600 font-medium`
  - Separator: `text-zinc-600` (·)
  - Role: `text-zinc-500 font-medium`
- Arrow icon:
  - Base: `opacity-0 transition-opacity duration-200`
  - Hover: `group-hover:opacity-100`
  - Color: `text-zinc-600`
  - Size: `w-5 h-5`

### Education Section (Home Page)

**Requirements:**
- Display academic credentials in clean, non-interactive format
- Show degree name, institution, and date range
- Maintain visual hierarchy with typography weights
- Provide clear separation between entries

**Mock Data:**
- **Master of Fine Arts (M.F.A.)** 2010-2012
  - Rhode Island School of Design
- **Interaction Design** 2011-2012
  - Copenhagen Institute of Interaction Design

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Entry spacing: `flex flex-col gap-8`
- Degree line:
  - Wrapper: `flex items-baseline gap-3 mb-2`
  - Degree name: `text-base font-semibold text-white`
  - Date: `text-sm text-zinc-600 font-medium`
- Institution: `text-sm text-zinc-500 font-medium`

### About Section (Home Page)

**Requirements:**
- Present multi-paragraph biography with emphasized keywords
- Highlight specific expertise areas (Product, Motion, Sound, Brand)
- Maintain comfortable reading rhythm with proper spacing
- Use typography to create visual hierarchy

**Mock Data:**
- "Over a decade of experience crafting digital products, brands and experiences that are used by millions of people every day."
- "Embracing growth, I continually combine extensive experience in **Product**, **Motion**, **Sound** and **Brand**-Design"
- "I am dedicated to shaping a better future through Design. My approach always puts people first — from clients to users."
- "Curious and optimistic."

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Paragraph container: `flex flex-col gap-6`
- Regular text: `text-[17px] leading-relaxed text-zinc-400 font-medium`
- Bold keywords: `font-semibold text-white` inline within paragraphs
- Last line: `text-[17px] leading-relaxed text-zinc-400 font-medium italic`

### Contact Section (Home Page)

**Requirements:**
- Display contact methods and social links in two-column layout
- Show live local time for location
- Include icons for each contact method
- External links indicated with arrow icon
- Responsive single-column layout on mobile

**Mock Data:**
- **Contact Column:**
  - Email: hello@mayachen.design
  - LinkedIn: linkedin.com/in/mayachen (external link)
  - Dribbble: dribbble.com/mayachen (external link)
- **Location Column:**
  - San Francisco, USA 🇺🇸
  - Current time: 3:36 PM (dynamically updated)

**Visual Requirements:**
- Section container: `max-w-3xl mx-auto px-8 py-24`
- Section header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Two-column grid: `grid grid-cols-1 md:grid-cols-2 gap-12`
- Column header: `text-base font-semibold text-white mb-6`
- Link items:
  - Container: `flex items-center gap-3 py-2 group`
  - Icon wrapper: `w-5 h-5 text-zinc-400`
  - Text: `text-[17px] text-zinc-400 font-medium hover:text-white transition-colors duration-200`
  - External arrow: `w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200`
- Location display:
  - Text: `text-[17px] text-zinc-400 font-medium flex items-center gap-2`
  - Flag emoji: `text-xl`
- Time display:
  - Text: `text-[17px] text-zinc-500 font-medium mt-2`
  - Format: 12-hour with AM/PM

### Footer (Home Page)

**Requirements:**
- Display copyright and location information
- Maintain minimal, unobtrusive design
- Align with overall site aesthetic

**Mock Data:**
- Left: "© Maya Chen"
- Right: "Made in California"

**Visual Requirements:**
- Container: `border-t border-white/10 mt-32`
- Inner wrapper: `max-w-7xl mx-auto px-8 py-12 flex justify-between items-center`
- Copyright text: `text-sm text-zinc-600 font-medium`
- Location text: `text-sm text-zinc-600 font-medium`
- Responsive: `flex-col gap-4 md:flex-row` for mobile stacking

### Case Study Page - Breadcrumb

**Requirements:**
- Display navigation path with separator
- Make portfolio name clickable to return home
- Show current case study name
- Maintain consistency with main navigation

**Mock Data:**
- "Maya Chen / Verve"

**Visual Requirements:**
- Same styling as main navigation bar
- Clickable name: `hover:text-white cursor-pointer`
- Separator: `text-white/40 mx-2`
- Case study name: `text-white/60`

### Case Study Page - Content

**Requirements:**
- Present case study in focused, readable format
- Constrain text to comfortable line length
- Display images at full width with rounded corners
- Include external links to live projects
- Implement smooth image loading and transitions

**Mock Data:**
- **Title:** "Reimagining Creative Collaboration"
- **Subtitle:** "Verve is the new standard for how creative teams can ideate, prototype, and ship design work together."
- **Role Description:** "As part of Verve's founding design team, I helped craft a **next-generation collaborative design platform** from the ground up. I led early **product design**, **experience design**, **design systems**, and **visual identity**, shaping a tool now trusted by teams worldwide to ideate, iterate, and ship with confidence."
- **External Link:** "verve.design"
- **Image Gallery Descriptions:**
  - Product interface showing task management workflow with status columns: "To do" (blue), "In progress" (orange), "Done" (green), "Locked" (gray)
  - Vibrant gradient slide with purple/blue background and "Sales Proposal" headline
  - Template gallery view showing grid of design template cards
  - Analytics dashboard with line charts, metrics, and performance indicators
  - User portfolio slide with profile photo, bold typography, and project showcase
  - Marketing landing page with large headline "All hands on deck" and team collaboration imagery

**Visual Requirements:**
- Page container: `min-h-screen py-32 px-8`
- Content wrapper: `max-w-[600px] mx-auto`
- Title: `text-4xl md:text-5xl font-bold text-white mb-6 leading-tight`
- Subtitle: `text-xl md:text-2xl text-zinc-400 font-medium mb-12 leading-relaxed`
- Body paragraph: `text-[17px] leading-relaxed text-zinc-400 font-medium mb-8`
- Bold keywords in paragraphs: `font-semibold text-white`
- External link:
  - Text: `text-[#4A9EFF] font-medium hover:text-[#6BB3FF] transition-colors duration-200`
  - Underline: `underline decoration-[#4A9EFF]/40`
  - Display: `inline-flex items-center gap-1`
- Image gallery:
  - Container: `my-16 flex flex-col gap-5`
  - Individual image wrapper: `w-screen max-w-full -mx-8 md:-mx-0 md:w-[calc(100%+16rem)] md:-ml-32`
  - Image: `rounded-xl md:rounded-2xl overflow-hidden`
  - Aspect ratio variations: `aspect-[16/9]` or `aspect-[16/10]` based on content
  - Border: `border border-white/5`
  - Loading: fade-in animation with stagger delay

## 3. Design System

### Color Palette

**Background Colors:**
- Primary Background: `#0A0A0A` (`bg-[#0A0A0A]`)
- Card Background: `#0A0A0A` (same as primary)
- Hover Background: `rgba(255, 255, 255, 0.05)` (`bg-white/5`)
- Strong Hover: `rgba(255, 255, 255, 0.08)` (`bg-white/[0.08]`)

**Text Colors:**
- Primary Text: `#FFFFFF` (`text-white`)
- Secondary Text: `#999999` (`text-zinc-400`)
- Muted Text: `#454545` (`text-zinc-600`)
- Tertiary Text: `#9E9E9E` (`text-zinc-500`)
- Dimmed White: `rgba(255, 255, 255, 0.9)` (`text-white/90`)
- Subdued White: `rgba(255, 255, 255, 0.6)` (`text-white/60`)
- Faded White: `rgba(255, 255, 255, 0.4)` (`text-white/40`)

**Accent Colors:**
- Link Blue: `#4A9EFF` (`text-[#4A9EFF]`)
- Link Blue Hover: `#6BB3FF` (`text-[#6BB3FF]`)

**Border Colors:**
- Primary Border: `rgba(255, 255, 255, 0.1)` (`border-white/10`)
- Subtle Border: `rgba(255, 255, 255, 0.05)` (`border-white/5`)

**Status Colors (for UI elements in images):**
- Blue (To Do): `#3B82F6` (reference only)
- Orange (In Progress): `#F97316` (reference only)
- Green (Done): `#10B981` (reference only)
- Gray (Locked): `#6B7280` (reference only)

### Typography

**Font Families:**
- Primary Font: "Instrument Sans" (system fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- Navigation Brand: "Roobert Bold" (fallback to bold sans-serif if unavailable)

**Font Sizes:**
- Navigation: `0.875rem` (`text-sm`)
- Section Headers: `1rem` (`text-base`)
- Body Text: `1.0625rem` (17px, `text-[17px]`)
- Standard: `1rem` (`text-base`)
- Large: `1.125rem` (`text-lg`)
- Extra Large: `1.25rem` (`text-xl`)
- 2XL: `1.5rem` (`text-2xl`)
- 3XL: `1.875rem` (`text-3xl`)
- 4XL: `2.25rem` (`text-4xl`)
- 5XL: `3rem` (`text-5xl`)
- 8XL: `6rem` (`text-8xl`)
- 9XL: `8rem` (`text-9xl`)

**Font Weights:**
- Regular: `400` (`font-normal`)
- Medium: `500` (`font-medium`)
- Semibold: `600` (`font-semibold`)
- Bold: `700` (`font-bold`)

**Line Heights:**
- None: `1` (`leading-none`)
- Tight: `1.25` (`leading-tight`)
- Relaxed: `1.75` (`leading-relaxed`)
- Body: `1.5` (default with `leading-relaxed`)

**Letter Spacing:**
- Tight: `-0.025em` (`tracking-tight`)
- Normal: `0` (`tracking-normal`)
- Wide: `0.025em` (`tracking-wide`)

### Core Components

**Navigation Component:**
- Container: Fixed top bar with backdrop blur
- Styling: `fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10`
- Inner: `max-w-7xl mx-auto px-8 py-6`
- Text: `text-sm font-medium text-white/90 tracking-wide`
- Separator: `text-white/40 mx-2`
- Hover: `hover:text-white transition-colors duration-200`

**Experience Card Component:**
- Base: `flex items-center gap-6 px-3 py-3 rounded-xl transition-all duration-200`
- Hover: `hover:bg-white/[0.08] cursor-pointer`
- Icon: `w-9 h-9 rounded border border-white/10 flex-shrink-0`
- Content: `flex-1 flex items-center justify-between`
- Title: `text-base font-semibold text-white`
- Meta: `flex items-center gap-2 text-sm`
- Date: `text-zinc-600 font-medium`
- Role: `text-zinc-500 font-medium`
- Arrow: `w-5 h-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200`

**Text Section Component:**
- Container: `max-w-3xl mx-auto px-8 py-24`
- Header: `text-base font-semibold text-white/60 mb-12 tracking-wide uppercase`
- Paragraph: `text-[17px] leading-relaxed text-zinc-400 font-medium`
- Emphasis: `font-semibold text-white` (inline)
- Spacing: `flex flex-col gap-6` for paragraph containers

**Contact Link Component:**
- Container: `flex items-center gap-3 py-2 group`
- Icon: `w-5 h-5 text-zinc-400`
- Text: `text-[17px] text-zinc-400 font-medium hover:text-white transition-colors duration-200`
- External Arrow: `w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors duration-200`

**Case Study Image Component:**
- Full-width container: `w-screen max-w-full -mx-8 md:-mx-0 md:w-[calc(100%+16rem)] md:-ml-32`
- Image wrapper: `rounded-xl md:rounded-2xl overflow-hidden border border-white/5`
- Aspect ratio: `aspect-video` or `aspect-[16/10]`
- Object fit: `object-cover`
- Loading: Fade in with Framer Motion

**Button/Link Component (for external links):**
- Base: `inline-flex items-center gap-1 text-[#4A9EFF] font-medium underline decoration-[#4A9EFF]/40`
- Hover: `hover:text-[#6BB3FF] transition-colors duration-200`
- Icon (if present): `w-4 h-4`

### Responsive Design Principles

**Breakpoints:**
- Desktop: `min-width: 1000px` (`min-w-[1000px]`)
- Tablet: `810px - 999px` (`min-w-[810px] max-w-[999px]`)
- Mobile: `max-width: 809px` (`max-w-[809px]`)

**Layout Adaptations:**
- Navigation: Maintains fixed position across all breakpoints, adjusts padding
- Hero text: Scales from `text-8xl` on desktop to `text-6xl` on mobile
- Contact section: Two columns (`grid-cols-2`) on desktop, single column (`grid-cols-1`) on mobile
- Case study images: Full bleed on mobile (`-mx-8`), extended width on desktop
- Container padding: `px-8` on mobile, `px-8 md:px-12 lg:px-8` responsive scaling

**Typography Scaling:**
- Hero name: `text-6xl md:text-8xl lg:text-9xl` (mobile to desktop)
- Hero tagline: `text-xl md:text-2xl lg:text-3xl`
- Case study title: `text-4xl md:text-5xl`
- Case study subtitle: `text-xl md:text-2xl`
- Body text: Consistent `text-[17px]` across breakpoints for readability

**Component Behavior:**
- Experience cards: Full width on all screens, text wraps gracefully
- Education entries: Single column, comfortable spacing
- Footer: Stacks vertically (`flex-col`) on mobile, horizontal (`flex-row`) on desktop
- Navigation breadcrumb: Text size adjusts, maintains readability

### Animation Specifications

**Hero Text Animation (Framer Motion):**
- Effect: Typewriter/fade cycling with layered depth
- Implementation:
  - Multiple text layers with staggered opacity
  - Primary layer: `opacity: 1`, `y: 0`
  - Secondary layer: `opacity: 0.6`, `y: -2px`
  - Tertiary layer: `opacity: 0.3`, `y: -4px`
  - Background layer: `opacity: 0.1`, `y: -6px`
- Animation variants:
  - Initial: `opacity: 0`, `y: 20`
  - Animate: `opacity: [calculated]`, `y: [calculated]`
  - Transition: `duration: 0.8`, `ease: [0.22, 1, 0.36, 1]`
- Cycling: Text fades out and new text fades in with 3-second intervals

**Page Load Animations (Framer Motion):**
- Sections fade in sequentially with stagger
- Initial: `opacity: 0`, `y: 30`
- Animate: `opacity: 1`, `y: 0`
- Transition: `duration: 0.6`, `delay: stagger * 0.1`

**Experience Card Hover (Framer Motion):**
- Background: Smooth transition from transparent to `bg-white/[0.08]`
- Arrow reveal: `opacity` transition from 0 to 100
- Transition: `duration: 0.2`, `ease: 'easeOut'`
- Scale on press: `scale: 0.98` (optional subtle feedback)

**Contact Link Hover:**
- Text color transition: `duration: 0.2s`
- Arrow color transition: `duration: 0.2s`
- Use: `transition-colors duration-200`

**Image Gallery Loading (Framer Motion):**
- Each image fades in with stagger
- Initial: `opacity: 0`, `scale: 0.95`
- Animate: `opacity: 1`, `scale: 1`
- Transition: `duration: 0.5`, `delay: index * 0.1`, `ease: 'easeOut'`

**Scroll Animations:**
- Smooth scroll behavior: `scroll-behavior: smooth` on html
- Sections fade in when entering viewport using Framer Motion's viewport detection
- Threshold: `amount: 0.3` (30% of element visible triggers animation)

**Navigation Backdrop Blur:**
- Always active: `backdrop-blur-xl`
- Background opacity adjusts based on scroll position (optional enhancement)
- Smooth transition when changing pages

### Interaction States

**Experience Cards:**
- Default: `bg-transparent`
- Hover: `bg-white/[0.08]`, arrow `opacity-100`, subtle lift optional
- Active/Click: `bg-white/10` momentarily
- Focus: `outline-2 outline-white/20 outline-offset-2`

**Links (Text Links):**
- Default: `text-zinc-400`
- Hover: `text-white`
- Active: `text-white/80`
- Visited: No change (maintain consistency)

**External Links:**
- Default: `text-[#4A9EFF]` with `underline decoration-[#4A9EFF]/40`
- Hover: `text-[#6BB3FF]`, arrow shifts right 2px
- Active: `text-[#4A9EFF]/80`

**Contact Icons:**
- Default: `text-zinc-400`
- Hover: Arrow `text-zinc-400`, icon maintains color
- Active: Slight scale down `scale-95`

**Navigation Breadcrumb:**
- Name (clickable): Default `text-white/90`, Hover `text-white`
- Current page: `text-white/60` (non-interactive)

### Accessibility Considerations

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Focus indicators: `focus-visible:outline-2 focus-visible:outline-white/20 focus-visible:outline-offset-2`
- Tab order follows visual hierarchy
- Skip link to main content: `Skip to content` link at top

**Screen Readers:**
- Semantic HTML structure (nav, main, section, article)
- Image alt text for all visual content
- ARIA labels for icon-only buttons
- Link text describes destination clearly

**Color Contrast:**
- Primary text on background: WCAG AAA compliant
- Secondary text on background: WCAG AA compliant minimum
- Link blue meets contrast requirements for text
- Interactive elements have sufficient color differentiation

**Motion Sensitivity:**
- Respect `prefers-reduced-motion` media query
- Disable animations when user prefers reduced motion
- Provide alternative focus indicators without motion
- Hero animation can be simplified to fade only

### Performance Optimization

**Image Loading:**
- Use Next.js Image component for automatic optimization
- Implement lazy loading for below-fold images
- Blur placeholder for smoother loading experience
- Specify width and height to prevent layout shift

**Animation Performance:**
- Use Framer Motion's `layout` prop sparingly
- Prefer `opacity` and `transform` for animations (GPU accelerated)
- Avoid animating `height`, `width`, or `top`/`left` properties
- Use `will-change` sparingly and only when necessary

**Font Loading:**
- Preload primary font (Instrument Sans) in document head
- Use `font-display: swap` for faster text rendering
- Subset fonts to include only necessary characters
- Consider variable fonts for fewer HTTP requests

**Code Splitting:**
- Separate client components from server components
- Lazy load Framer Motion animations below the fold
- Dynamic imports for case study pages
- Minimize JavaScript bundle size by using server components where possible

**SEO Metadata:**
- Page titles: "Maya Chen - Product Design & Creative Direction"
- Meta descriptions for home and case study pages
- Open Graph tags for social sharing
- Canonical URLs for each page
- JSON-LD structured data for person/portfolio schema

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://articulate-design-show.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5324f75f-8254-4ef2-8e49-1426f9886204).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
