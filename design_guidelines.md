# Event Ticket Booking System - Design Guidelines

## Design Approach: Reference-Based (Eventbrite + Ticketmaster + Airbnb)

Drawing inspiration from Eventbrite's clean event discovery, Ticketmaster's interactive seat selection, and Airbnb's card-based browsing experience. This creates a modern, trustworthy platform that balances excitement with functionality.

## Core Design Principles
1. **Visual Discovery First**: Events are experiential - lead with compelling imagery
2. **Progressive Trust Building**: From browse → details → seat selection → payment
3. **Clarity in Complexity**: Simplify multi-step processes (browsing, booking, checkout)
4. **Dual User Experience**: Seamless switching between attendee and organizer modes

## Color Palette

**Light Mode:**
- Primary: 266 80% 55% (Vibrant purple - excitement and entertainment)
- Primary Hover: 266 80% 48%
- Secondary: 220 15% 25% (Dark slate for text/UI)
- Accent: 340 75% 55% (Coral pink for CTAs and highlights)
- Background: 0 0% 100%
- Surface: 220 15% 97%
- Border: 220 10% 88%

**Dark Mode:**
- Primary: 266 70% 60%
- Primary Hover: 266 70% 65%
- Secondary: 220 15% 85%
- Accent: 340 70% 60%
- Background: 220 15% 10%
- Surface: 220 12% 15%
- Border: 220 10% 25%

## Typography
- **Primary Font**: Inter (via Google Fonts) - modern, highly legible
- **Accent Font**: Poppins (for headings) - friendly, approachable
- **Scale**: text-sm (0.875rem), text-base (1rem), text-lg (1.125rem), text-xl (1.25rem), text-2xl (1.5rem), text-3xl (1.875rem), text-4xl (2.25rem)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## Layout System
- **Container**: max-w-7xl mx-auto for main content areas
- **Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 (p-4, m-8, gap-6, etc.)
- **Grid System**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for event cards
- **Consistent Vertical Rhythm**: py-12 (mobile), py-16 (tablet), py-24 (desktop) for sections

## Component Library

### Navigation
- **Public Header**: Logo left, search bar center, "Become an Organizer" and user avatar/sign-in right
- **Organizer Dashboard**: Sidebar navigation with Dashboard, My Events, Analytics, Settings
- Sticky header with subtle shadow on scroll (shadow-sm)

### Event Cards
- **Image**: aspect-ratio-16/9 rounded-lg with hover scale effect (hover:scale-[1.02])
- **Content**: Event title (text-lg font-semibold), date/time, location, price starting from
- **Badge**: Floating category badge (top-left on image)
- **Layout**: Card format with shadow-md hover:shadow-xl transition

### Event Detail Page
- **Hero Section**: Full-width event image (h-96) with gradient overlay for title/date/venue
- **Sticky Booking Panel**: Right sidebar (lg:w-96) with ticket selection, price summary, book button
- **Tabs**: Description, Venue Details, Reviews, FAQ
- **Interactive Map**: Embedded venue location with directions

### Seat Selection Interface
- **Venue Layout**: SVG-based seat grid with color coding (available: gray-200, selected: purple, taken: gray-400)
- **Legend**: Clear color indicators for seat status
- **Selected Summary**: Fixed bottom panel showing selected seats and running total
- **Zoom Controls**: +/- buttons for large venues

### Ticket Types
- **Card Layout**: Each type as a card with icon, name, price, features list
- **Quantity Selector**: Stepper buttons (- / number / +) with max limit per type
- **Visual Hierarchy**: VIP cards with subtle gradient background, General standard, Early Bird with badge

### Shopping Cart
- **Slide-out Panel**: From right side (w-96) with backdrop
- **Item List**: Event image thumbnail, title, ticket type, quantity, price
- **Summary**: Subtotal, fees, total with prominent checkout button

### Payment Checkout
- **Two-Column**: Payment form left (lg:w-2/3), order summary right (lg:w-1/3)
- **Progress Indicator**: Steps (Cart → Payment → Confirmation) at top
- **Stripe Elements**: Styled to match design system with focus states
- **Trust Signals**: Security badges, encrypted message near payment form

### Ticket Dashboard
- **Filter Tabs**: Upcoming, Past Events with count badges
- **Ticket Cards**: Event image, details, QR code (expandable), download/share actions
- **QR Code Display**: Large, scannable with event name and booking reference

### Organizer Dashboard
- **Stats Cards**: Grid of key metrics (Total Sales, Tickets Sold, Events) with icons and trend indicators
- **Event Management Table**: Sortable columns (Event, Date, Status, Sold/Capacity, Actions)
- **Create Event Form**: Multi-step wizard (Basic Info → Tickets → Venue → Preview)

## Images

### Hero Sections
- **Homepage Hero**: Large hero image (h-[600px]) showing crowd at vibrant event with overlay text "Discover Amazing Events Near You"
- **Event Detail**: Event-specific image with gradient overlay for readability
- **Category Pages**: Category-themed headers (concerts, sports, theater)

### Event Cards
- Each event displays promotional image (aspect-16/9)
- Fallback gradient if no image provided

### Organizer Dashboard
- Empty state illustrations for "No events yet" with friendly graphics
- Success confirmations with celebratory imagery

### Trust Elements
- Payment security badges (Stripe, SSL icons)
- Event organizer profile photos in dashboard

## Animations
Use sparingly - only for:
- Card hover effects (subtle scale + shadow)
- Seat selection click feedback (bounce)
- Cart slide-in/out transitions
- Loading states for payment processing

## Accessibility
- Focus states with visible purple ring (ring-2 ring-primary)
- Keyboard navigation for seat selection grid
- ARIA labels for all interactive elements
- Color contrast meets WCAG AA standards in both modes
- Screen reader announcements for cart updates

## Responsive Breakpoints
- Mobile-first approach
- sm: 640px (phone landscape)
- md: 768px (tablets)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)

**Mobile Adaptations:**
- Stack booking panel below event details
- Simplified seat selection with zoom
- Bottom sheet for filters
- Hamburger menu navigation