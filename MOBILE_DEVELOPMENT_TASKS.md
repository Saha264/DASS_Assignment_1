# 4TheBold Mobile - Development Tasks Breakdown

**Date:** February 14, 2026
**Project:** 4TheBold Mobile (React Native)
**Current Status:** Scaffolded but empty - 0% implementation

---

## Overview

The backend and web frontend are **100% complete and production-ready**. The mobile app has all dependencies installed but **no implementation yet**. Based on the requirements document and `Bold_forum.jsx` template, here are the 3 primary development tasks:

---

## Task 1: Foundation & Authentication Setup

### Goal

Get users authenticated and establish the navigation infrastructure

### Estimated Duration

**1 Sprint (2 weeks)**

### Sub-tasks

#### 1.1 Navigation Setup

- [ ] Configure React Navigation container
- [ ] Set up stack navigators (Auth Stack, Main App Stack)
- [ ] Create navigation types and routing
- [ ] Implement deep linking support
- [ ] Test navigation flow between screens

#### 1.2 Authentication Screens

- [ ] **Splash Screen** - App logo, loading indicator
- [ ] **Login Screen** - Email/password, Google OAuth button
- [ ] **Signup Screen** - Email, password, confirm password
- [ ] **Role Selection Screen** - Choose: Founder, Investor, Enabler, Market
- [ ] **Country Selection Screen** - Select from 11+ countries
- [ ] **Onboarding Completion Screen** - Welcome message, next steps

#### 1.3 Authentication Logic

- [ ] Configure Firebase SDK for React Native
- [ ] Implement email/password authentication
- [ ] Implement Google OAuth flow
- [ ] Set up token management with expo-secure-store
- [ ] Implement auto-refresh (50-minute proactive refresh)
- [ ] Handle authentication errors

#### 1.4 State Management

- [ ] Configure Zustand store structure
- [ ] Create auth store (user, token, role, isAuthenticated)
- [ ] Implement auth context provider
- [ ] Persist auth state to secure storage
- [ ] Implement logout functionality

#### 1.5 API Layer

- [ ] Set up Axios instance with base URL
- [ ] Configure request/response interceptors
- [ ] Add token to Authorization headers
- [ ] Implement error handling
- [ ] Create auth API service:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/consent`

#### 1.6 UI Components

- [ ] Create Button component (primary, secondary, outline)
- [ ] Create Input component (text, password, email)
- [ ] Create LoadingSpinner component
- [ ] Create ErrorMessage component
- [ ] Apply NativeWind (Tailwind) styling

### Acceptance Criteria

- ✅ User can sign up with email/password
- ✅ User can log in with email/password
- ✅ User can select role during onboarding
- ✅ User can select country during onboarding
- ✅ Auth token is securely stored
- ✅ Token refreshes automatically every 50 minutes
- ✅ User remains logged in after app restart
- ✅ Navigation works between screens
- ✅ Logout clears session and returns to login

### Technical Requirements

- React Navigation 7.x configured
- Firebase Auth integrated
- Zustand store working
- expo-secure-store for tokens
- Axios API client ready
- Dark mode support

---

## Task 2: Discussion Forum Module (Mobile)

### Goal

Build the complete Discussion Forum for mobile as per spec and `Bold_forum.jsx` template

### Estimated Duration

**2 Sprints (4 weeks)**

### Sub-tasks

#### 2.1 Forum Feed Screen

- [ ] Create Forum Feed screen component
- [ ] Implement post list with FlatList
- [ ] Add pull-to-refresh functionality
- [ ] Add infinite scroll (pagination)
- [ ] Show stats bar (Active Discussions, Responses, Community)
- [ ] Display post cards with:
  - [ ] Author role badge with icon (♦ Founder, ♣ Investor, ♥ Enabler, ★ Customer, ◆ Job Seeker)
  - [ ] Post title
  - [ ] Context preview (truncated)
  - [ ] Meta tags: Industry, Topic, Intent, Stage, Time
  - [ ] Stakes indicator (💰, ⏰, ⚠️ for decision posts)
  - [ ] Decision outcome badge (if implemented)
  - [ ] Response count
  - [ ] User tags

#### 2.2 Filtering & Sorting

- [ ] Create Filter Panel component (collapsible bottom sheet)
- [ ] Implement filters:
  - [ ] Role dropdown (All, Founder, Investor, Enabler, Customer, Job Seeker)
  - [ ] Stage dropdown (All, Ideation, Pre-Seed, Seed, Series A, Series B, Series C+, Growth)
  - [ ] Industry dropdown (All, SaaS, FinTech, HealthTech, Climate, etc.)
  - [ ] Topic dropdown (All, + 8 topics)
  - [ ] Intent dropdown (All, + 5 intents)
- [ ] Add "Clear All" button
- [ ] Show active filter count badge
- [ ] Implement Sort dropdown:
  - [ ] Sort by Recent (default)
  - [ ] Sort by Engagement
- [ ] Apply filters to API calls

#### 2.3 Create Post Screen

- [ ] Create bottom sheet modal for post creation
- [ ] Implement form fields:
  - [ ] Topic selector (required) - 8 options
  - [ ] Intent selector (required) - 5 options
  - [ ] Stage selector
  - [ ] Industry selector
  - [ ] Country selector (11+ countries)
  - [ ] Title input (max 200 chars with counter)
  - [ ] Content textarea (max 5000 chars, min 150, with counter)
  - [ ] Tags input (comma-separated)
  - [ ] Anonymous toggle
- [ ] Add Stakes section (shown only if intent = "decision"):
  - [ ] Money at Risk input
  - [ ] Timeline input
  - [ ] Irreversible checkbox
- [ ] Implement real-time validation:
  - [ ] Highlight required fields
  - [ ] Enforce minimum content length (150 chars)
  - [ ] Show character counters
- [ ] Add Create Discussion button
- [ ] Call `POST /api/forum/posts` API
- [ ] Handle success/error with toast notifications

#### 2.4 Post Detail Screen

- [ ] Create Post Detail screen
- [ ] Display full post with:
  - [ ] Author role badge
  - [ ] Title
  - [ ] Full content (markdown rendered)
  - [ ] Meta tags
  - [ ] Stakes section (if present)
  - [ ] Decision outcome section (if set)
  - [ ] Response count
  - [ ] View count
- [ ] Show threaded responses (max 3 levels):
  - [ ] Visual indentation for depth
  - [ ] Role badge for responder
  - [ ] Response type badge (INSIGHT, AGREE, RISK, DIFFERENT, QUESTION)
  - [ ] Evidence type badge (if not opinion_only)
  - [ ] Author impact tag (MOST_HELPFUL, CHANGED_MY_VIEW, SAVED_TIME_OR_MONEY)
  - [ ] Response content
  - [ ] Upvote button with count
- [ ] Add fixed bottom "Add Response" button
- [ ] Implement collapse/expand threads
- [ ] Call `GET /api/forum/posts/:id` API

#### 2.5 Add Response Screen

- [ ] Create bottom sheet modal for response
- [ ] Implement form fields:
  - [ ] Response Type selector:
    - 💡 Share Insight
    - ✓ Agree & Build
    - ⚠️ Highlight Risk
    - 🔄 Alternative
    - ❓ Question
  - [ ] Evidence Type selector:
    - 👤 Personal Experience
    - 📊 Portfolio Data
    - 💬 Customer Data
    - 📈 Benchmark
    - ⚖️ Regulatory
    - 💭 Opinion Only
  - [ ] Evidence Description (if not opinion_only)
  - [ ] Content textarea (min 100 chars with counter)
  - [ ] Anonymous toggle
- [ ] Add Submit button
- [ ] Call `POST /api/forum/posts/:postId/responses` API
- [ ] Handle nested replies (parentCommentId)
- [ ] Enforce max depth (3 levels)

#### 2.6 Voting System

- [ ] Add upvote/downvote buttons on posts
- [ ] Add upvote buttons on responses
- [ ] Show current score
- [ ] Disable for non-verified users (with tooltip)
- [ ] Call `POST /api/forum/vote` API
- [ ] Optimistic UI updates
- [ ] Verified user check: account age ≥ 30 days AND has credits

#### 2.7 Reporting System

- [ ] Add "Report" button (3-dot menu)
- [ ] Create report dialog:
  - [ ] Reason selector (Spam, Harassment, Misinformation, Inappropriate, Other)
  - [ ] Description textarea (optional)
- [ ] Call `POST /api/forum/report` API
- [ ] Show confirmation toast

#### 2.8 Edit & Delete

- [ ] Add Edit button (if author, within 24 hours)
- [ ] Pre-fill edit form with existing data
- [ ] Call `PUT /api/forum/posts/:id` API
- [ ] Show "Edited" indicator
- [ ] Add Delete button (if author)
- [ ] Confirm deletion dialog
- [ ] Call `DELETE /api/forum/posts/:id` API

#### 2.9 Reusable Components

- [ ] **PostCard** - Reusable post card with all metadata
- [ ] **ResponseCard** - Response with threading support
- [ ] **FilterPanel** - Collapsible filter controls
- [ ] **StatsBar** - Stats display (Discussions, Responses, Community)
- [ ] **Badge** - Role, Topic, Intent, Stage badges with color mapping
- [ ] **StructuredResponseForm** - Response creation form
- [ ] **CreatePostDialog** - Post creation bottom sheet

#### 2.10 Styling & UX

- [ ] Implement role-based color mapping:
  - Founder: Emerald green
  - Investor: Blue
  - Enabler: Purple
  - Customer: Amber
  - Job Seeker: Cyan
- [ ] Implement topic-based color mapping (8 topics)
- [ ] Implement intent-based color mapping (5 intents)
- [ ] Implement stage-based color mapping (7 stages)
- [ ] Add dark mode support
- [ ] Optimize touch targets (min 44x44 points)
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error states
- [ ] Smooth animations for modals and cards

### API Endpoints to Integrate

```
GET    /api/forum/posts
POST   /api/forum/posts
GET    /api/forum/posts/:id
PUT    /api/forum/posts/:id
DELETE /api/forum/posts/:id
POST   /api/forum/posts/:postId/responses
PUT    /api/forum/posts/:postId/responses/:responseId
DELETE /api/forum/posts/:postId/responses/:responseId
POST   /api/forum/posts/:postId/responses/:responseId/impact
POST   /api/forum/vote
POST   /api/forum/report
```

### Acceptance Criteria

- ✅ User can browse forum posts without login
- ✅ User can filter posts by topic, industry, stage, role, time
- ✅ User can sort by New or Engagement
- ✅ Logged-in user can create post with all required fields
- ✅ User can post anonymously (shows role only)
- ✅ User can add responses with response type and evidence
- ✅ Verified users can upvote/downvote
- ✅ Non-verified users see disabled vote buttons with tooltip
- ✅ Comments thread up to 3 levels deep
- ✅ Reply button disabled at max depth
- ✅ Author can edit post within 24 hours
- ✅ Author can delete own posts/comments
- ✅ User can report content
- ✅ 3 reports = auto-hidden (admin can restore)
- ✅ Posts show stakes section for decision intent
- ✅ Posts show decision outcome if set
- ✅ Pull-to-refresh works
- ✅ Infinite scroll loads more posts
- ✅ Mobile-optimized UI

---

## Task 3: Job Seeker Module (Mobile)

### Goal

Implement credit purchase, profile creation, and Tinder-style swipe interface

### Estimated Duration

**2 Sprints (4 weeks)**

### Sub-tasks

#### 3.1 Credit Purchase Flow

- [ ] Create Credit Purchase screen
- [ ] Display pricing: **₹200 for 2 credits = 1 Year Profile**
- [ ] Integrate Razorpay SDK for React Native
- [ ] Implement payment methods:
  - [ ] UPI
  - [ ] Cards (Credit/Debit)
  - [ ] NetBanking
  - [ ] Wallets
- [ ] Call `POST /api/job-seeker/purchase-credits` API to create order
- [ ] Open Razorpay checkout
- [ ] Call `POST /api/job-seeker/verify-payment` API after payment
- [ ] Show success confirmation with next steps
- [ ] Handle payment failures with error messages

#### 3.2 Profile Creation Flow

- [ ] Create multi-step profile creation wizard
- [ ] Implement progress indicator (Step 1 of 4, etc.)
- [ ] **Step 1: Basic Info**
  - [ ] Current title (required)
  - [ ] Experience level selector (Entry, Mid, Senior, Lead, Executive)
  - [ ] Years of experience (number input)
- [ ] **Step 2: Skills & Expertise**
  - [ ] Skills multi-select (min 3 required)
  - [ ] Resume URL (required)
  - [ ] Certifications (optional, list)
- [ ] **Step 3: Job Preferences**
  - [ ] Preferred roles (multi-select, min 1 required)
  - [ ] Preferred industries (multi-select)
  - [ ] Locations (multi-select)
  - [ ] Remote preference (Remote Only, Hybrid, Onsite, Flexible)
  - [ ] Willing to relocate (Yes/No)
- [ ] **Step 4: Compensation & Availability**
  - [ ] Salary expectations (min/max with currency)
  - [ ] Work type preferences (Full-time, Part-time, Contract, Freelance, Internship, Startup Equity)
  - [ ] Availability status (Actively Looking, Open to Offers, Not Looking)
  - [ ] Notice period (days)
- [ ] Add real-time validation for required fields
- [ ] Show profile completeness percentage
- [ ] Add "Preview" button before submission
- [ ] Call `POST /api/job-seeker/profile` API (deducts 2 credits)
- [ ] Handle errors (e.g., insufficient credits)
- [ ] Navigate to dashboard on success

#### 3.3 Profile Dashboard Screen

- [ ] Create Job Seeker Dashboard screen
- [ ] Display stats cards:
  - [ ] Profile Views (total count)
  - [ ] Unique Viewers (count)
  - [ ] Likes Received (count)
  - [ ] Contacts Received (count)
- [ ] Show profile status:
  - [ ] Active (green)
  - [ ] Expiring Soon (orange, <30 days)
  - [ ] Expired (red)
- [ ] Display expiry countdown (days remaining)
- [ ] Add "Renew Profile" button (if <30 days remaining)
- [ ] Show "Quick Edit" button
- [ ] Implement tabs:
  - [ ] **Viewers Tab**: List of founders who viewed profile
  - [ ] **Likes Tab**: List of founders who liked profile with contact status
- [ ] Call `GET /api/job-seeker/profile` API
- [ ] Call `GET /api/job-seeker/viewers` API
- [ ] Call `GET /api/job-seeker/likes` API

#### 3.4 Founder Browse & Swipe Screen (Founder's View)

- [ ] Create Talent Discovery screen (for Founders)
- [ ] Implement Tinder-style swipe interface:
  - [ ] Use react-native-deck-swiper or similar
  - [ ] Swipe LEFT = Pass
  - [ ] Swipe RIGHT = Interested/Like
  - [ ] Swipe UP = Super Like (optional)
- [ ] Display profile card with:
  - [ ] Name
  - [ ] Current title
  - [ ] Experience level
  - [ ] Years of experience
  - [ ] Top 3 skills (badges)
  - [ ] Salary range
  - [ ] Location(s)
  - [ ] Remote preference
- [ ] Add "Expand" button to view full profile
- [ ] Prevent duplicate swipes (check at backend)
- [ ] Call `POST /api/founder/talent/swipe` API
- [ ] Show "No more profiles" state when deck is empty

#### 3.5 Filter Panel (Founder's View)

- [ ] Create Filter Drawer/Bottom Sheet
- [ ] Implement filters:
  - [ ] Experience Level (multi-select: Entry, Mid, Senior, Lead, Executive)
  - [ ] Industries (multi-select)
  - [ ] Locations (multi-select)
  - [ ] Skills (search + multi-select)
  - [ ] Remote Preference (Remote Only, Hybrid, Onsite, Flexible)
  - [ ] Salary Range (dual slider: min/max)
  - [ ] Availability Status (Actively Looking, Open to Offers, Not Looking)
- [ ] Show "Clear All Filters" button
- [ ] Call `GET /api/founder/talent/browse` API with query params
- [ ] Apply filters to swipe deck

#### 3.6 Profile Detail Modal (Full View)

- [ ] Create full-screen profile modal
- [ ] Display all profile information:
  - [ ] Name, title, experience
  - [ ] Skills (all, not just top 3)
  - [ ] Certifications
  - [ ] Resume link ("Open Resume" button)
  - [ ] LinkedIn link (if provided)
  - [ ] Portfolio link (if provided)
  - [ ] Preferred roles
  - [ ] Preferred industries
  - [ ] Locations
  - [ ] Remote preference
  - [ ] Willing to relocate
  - [ ] Salary expectations
  - [ ] Work type preferences
  - [ ] Availability status
  - [ ] Notice period
- [ ] Add "Like" and "Pass" buttons
- [ ] Add "Close" button

#### 3.7 Contact Reveal Flow

- [ ] Add "Contact" button on liked profiles
- [ ] Show confirmation dialog:
  - "This will reveal [Name]'s email and LinkedIn. Proceed?"
- [ ] Call `POST /api/founder/talent/contact` API
- [ ] Display contact info in modal:
  - [ ] Email (with copy button)
  - [ ] LinkedIn URL (with "Open in Browser" button)
  - [ ] Resume URL (with "Open in Browser" button)
- [ ] Mark as "Contacted" with timestamp
- [ ] Send notification to job seeker (push + in-app)

#### 3.8 Swipe History Screen

- [ ] Create Swipe History screen
- [ ] Implement tab view:
  - [ ] **Liked Tab**: All right-swiped profiles
  - [ ] **Passed Tab**: All left-swiped profiles
- [ ] Show profile cards with:
  - [ ] Name, title, experience
  - [ ] Swipe date
  - [ ] Contacted status (for liked)
  - [ ] Notes (if added)
- [ ] Add search bar (search by name, title, skills)
- [ ] Add "Contact" button for liked profiles
- [ ] Add "Undo Pass" button (P2 priority)
- [ ] Call `GET /api/founder/talent/history` API with query params

#### 3.9 Profile Edit Screen

- [ ] Create Edit Profile screen
- [ ] Pre-fill form with existing data
- [ ] Allow editing all fields except:
  - [ ] User ID
  - [ ] Profile creation date
- [ ] Show updated profile completeness percentage
- [ ] Call `PUT /api/job-seeker/profile` API
- [ ] Handle validation errors
- [ ] Show success toast

#### 3.10 Renewal Flow

- [ ] Add "Renew Profile" button on dashboard
- [ ] Show renewal pricing: ₹200 for 2 credits
- [ ] Check if user has 2+ credits available
- [ ] If yes, confirm renewal without payment
- [ ] If no, redirect to credit purchase flow
- [ ] Call `POST /api/job-seeker/renew` API
- [ ] Extend expiry by 1 year (or add 2 months if renewed at 10 months)
- [ ] Show success confirmation with new expiry date

#### 3.11 Notifications

- [ ] Implement push notifications:
  - [ ] Founder contacts you (push + in-app)
  - [ ] Founder likes your profile (in-app only)
  - [ ] Profile expiry reminders (30 days, 7 days, 1 day - email)
  - [ ] Profile expired (email)
- [ ] Create Notifications screen (list view)
- [ ] Mark notifications as read
- [ ] Navigate to relevant screen on notification tap

#### 3.12 Reusable Components

- [ ] **ProfileCard** - Swipeable profile card
- [ ] **ProfileDetailModal** - Full profile view
- [ ] **FilterDrawer** - Filter controls
- [ ] **StatsWidget** - Dashboard stats display
- [ ] **ViewerCard** - Viewer list item
- [ ] **LikedProfileCard** - Liked profile list item
- [ ] **ContactRevealDialog** - Contact info modal
- [ ] **PaymentSheet** - Razorpay payment interface
- [ ] **ProgressIndicator** - Multi-step form progress
- [ ] **SkillsSelector** - Multi-select for skills
- [ ] **SalaryRangeSlider** - Dual slider for salary

#### 3.13 Business Rules Implementation

- [ ] Profile creation: 2 credits
- [ ] Profile renewal: 2 credits
- [ ] Credit price: ₹100 per credit
- [ ] Minimum purchase: 2 credits (₹200)
- [ ] Profile duration: 1 year from activation
- [ ] Renewal stacks time (renew at 10 months = 14 months total)
- [ ] Expired profiles become invisible but not deleted
- [ ] Can renew up to 30 days before expiry
- [ ] Profile requirements (minimum to be visible):
  - Current title (required)
  - Experience level (required)
  - At least 3 skills (required)
  - Resume URL (required)
  - At least 1 preferred role (required)
  - Salary expectations (required)
- [ ] Founder swiping:
  - No daily limits
  - No credits required
  - One swipe per job seeker (can update notes)
  - Must like before contacting
  - Contact reveals email + LinkedIn permanently

#### 3.14 Styling & UX

- [ ] Match web app color scheme (red/orange gradient theme)
- [ ] Dark mode support
- [ ] Smooth swipe animations
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error states
- [ ] Success/error toasts
- [ ] Optimized touch targets
- [ ] Accessibility labels

### API Endpoints to Integrate

```
POST   /api/job-seeker/purchase-credits
POST   /api/job-seeker/verify-payment
POST   /api/job-seeker/profile
PUT    /api/job-seeker/profile
GET    /api/job-seeker/profile
POST   /api/job-seeker/renew
GET    /api/job-seeker/viewers
GET    /api/job-seeker/likes

POST   /api/founder/talent/swipe
POST   /api/founder/talent/contact
GET    /api/founder/talent/browse
GET    /api/founder/talent/history
PUT    /api/founder/talent/swipe/:swipeId
```

### Acceptance Criteria

- ✅ User can purchase 2 credits for ₹200 via Razorpay
- ✅ Credits appear immediately after payment verification
- ✅ User with 2+ credits can create profile; 2 credits deducted
- ✅ Profile requires: title, experience level, 3+ skills, resume URL, 1+ preferred role, salary
- ✅ Profile visible for 1 year
- ✅ Profile dashboard shows stats: views, likes, contacts
- ✅ Profile status shows Active/Expiring/Expired
- ✅ Expiry countdown visible
- ✅ Founder can browse active profiles with all filters working
- ✅ Founder can swipe like/pass on profiles; swipe recorded; history accessible
- ✅ Founder can contact liked profile; email + LinkedIn revealed; contact marked as contacted
- ✅ Job seeker sees list of viewers with view count and timestamps
- ✅ Job seeker sees list of likers with contact status
- ✅ Job seeker receives in-app notification when liked
- ✅ Job seeker receives push notification when contacted
- ✅ Job seeker receives email reminders at 30, 7, 1 days before expiry
- ✅ User with 2+ credits can renew; time stacks with remaining
- ✅ Mobile-optimized swipe interface

---

## Development Order Recommendation

### Sprint 1-2: Foundation

Complete **Task 1** (Authentication & Navigation)

### Sprint 3-4: Forum Phase 1

Complete **Task 2.1 - 2.5** (Feed, Filters, Create Post, Post Detail, Add Response)

### Sprint 5-6: Forum Phase 2

Complete **Task 2.6 - 2.10** (Voting, Reporting, Edit/Delete, Components, Styling)

### Sprint 7-8: Job Seeker Phase 1

Complete **Task 3.1 - 3.6** (Credit Purchase, Profile Creation, Dashboard, Swipe Interface, Filters, Full View)

### Sprint 9-10: Job Seeker Phase 2

Complete **Task 3.7 - 3.14** (Contact Reveal, History, Edit, Renewal, Notifications, Components, Styling)

---

## Testing Strategy

### Unit Tests

- Component rendering
- API service methods
- State management (Zustand stores)
- Utility functions

### Integration Tests

- Authentication flow
- Post creation flow
- Payment flow
- Profile creation flow

### E2E Tests (Optional)

- User signup → role selection → dashboard
- Create post → add response → vote
- Purchase credits → create profile → get liked → get contacted

### Performance Tests

- Forum feed with 1000+ posts
- Swipe deck with heavy filtering
- Concurrent vote updates

---

## Dependencies Already Installed

✅ React Navigation 7.1.28
✅ Zustand 5.0.11
✅ Axios 1.13.5
✅ NativeWind 4.2.1 (Tailwind CSS)
✅ React Native Reanimated 4.2.1
✅ React Native Gesture Handler 2.30.0
✅ @gorhom/bottom-sheet 5.2.8
✅ expo-secure-store 15.0.8
✅ @react-native-async-storage/async-storage 2.2.0
✅ React Native SVG 15.15.3
✅ @react-native-community/datetimepicker 8.6.0
✅ @react-native-community/slider 5.1.2
✅ Storybook React Native 10.2.1

**Additional Packages Needed:**

- `react-native-deck-swiper` or `react-native-tinder-card` (for swipe interface)
- `react-native-razorpay` (for Razorpay integration)
- `react-native-markdown-display` (for rendering markdown in forum posts)
- Firebase SDK for React Native (if not already included)

---

## Summary

**Total Estimated Duration:** 10 Sprints (20 weeks / ~5 months)

**Breakdown:**

- Task 1 (Auth): 1 sprint
- Task 2 (Forum): 4 sprints
- Task 3 (Job Seeker): 5 sprints

**Note:** These are comprehensive estimates. With focused development and parallel work on UI components, the timeline can be shortened to **8-12 sprints** as originally planned in the development document.

---

**End of Document**
