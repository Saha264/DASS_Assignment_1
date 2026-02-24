# Felicity Event Management System

## Project Overview

The Felicity Event Management System is a comprehensive full-stack solution built to streamline the process of organizing, managing, and attending events, specifically tailored for college festivals and clubs. It supports three distinct user roles:

1.  **Admins**: For managing organizers and overseeing the platform.
2.  **Organizers (Clubs)**: For creating events, managing merchandise sales, and checking attendance.
3.  **Participants (Students)**: For discovering events, registering, purchasing merchandise, and joining hackathon teams.

---

## 🛠️ Technology Stack & Justification

This project was built using the **MERN (MongoDB, Express, React, Node.js)** stack. 

### Frontend
*   **React (Vite)**: Chosen for its component-based architecture which makes building modular UIs efficient. Vite was used instead of Create React App for significantly faster development server start times and optimized builds.
*   **Tailwind CSS**: A utility-first CSS framework. Chosen for rapid UI development without writing custom CSS files. It ensures a consistent design system and makes it extremely easy to build responsive, modern interfaces.
*   **React Router DOM**: Essential for handling client-side routing, enabling a seamless Single Page Application (SPA) experience without page reloads as users navigate between dashboards and event pages.
*   **Zustand**: A small, fast, and scalable state-management solution. Used over Redux to manage the global authentication state (`useAuthStore`) because of its minimal boilerplate and straightforward API.
*   **Axios**: Designed to handle HTTP requests. Configured with interceptors to automatically attach JSON Web Tokens (JWT) to secure API calls, simplifying authentication logic across the app.
*   **Socket.io-client**: Used to establish real-time WebSocket connections for the Hackathon Team Chat feature.
*   **date-fns**: A lightweight utility library for date formatting (e.g., converting ISO strings to readable formats like "MMM dd, yyyy").

### Backend
*   **Node.js & Express.js**: Provides a robust, non-blocking asynchronous environment. Express was chosen for its minimal overhead and excellent ecosystem of middleware for building RESTful APIs.
*   **MongoDB & Mongoose**: A NoSQL database is ideal for this project due to the flexible nature of events (e.g., some events need custom form fields, merchandise needs variants). Mongoose provides schemas, validation, and relationships (like Populating a Participant inside an Order).
*   **JSON Web Tokens (JWT)**: Used for stateless, secure authentication. 
*   **Bcrypt.js**: Critical for security; used to securely hash user passwords before storing them in the database.
*   **Multer**: A middleware for handling `multipart/form-data`, specifically chosen to handle image uploads for the Merchandise Payment Verification workflow.
*   **Socket.io**: Integrated with the Express server to handle real-time, bidirectional event-based communication for the team chat rooms.

---

## 🚀 Advanced Features Implemented

### 1. Tier A: Merchandise Payment Approval Workflow 
**Description:** A system for participants to buy merchandise by generating a QR code/ticket only *after* the organizer verifies their payment proof.
*   **Design Choices:** We separated Event Registration from Merchandise Orders. When a user buys merch, it creates an `Order` document in `Pending` status. Multer is used to save the uploaded screenshot to the backend filesystem. 
*   **Implementation Approach:** The Organizer Dashboard features a "Payment Verification" tab. Organizers view the image and click Approve or Reject. Only upon approval does the backend deduct from the `stockLimit` and generate the final QR-coded ticket.

### 2. Tier A: Hackathon Team Registration 
**Description:** Participants can register for "Team Events" by either creating a team and receiving a unique Invite Code, or joining an existing team using that code.
*   **Design Choices:** A distinct `Team` mongoose model was created, linking to the base `Event`. Only the team leader (creator) can remove members.
*   **Technical Decisions:** To prevent incomplete teams from clogging up registrations, individual tickets are *not* generated immediately. Registration is only considered finalized when the team hits the required `teamSize`, at which point the status updates from `Pending` to `Complete`.

### 3. Tier B: Team Members Real-Time Chat 
**Description:** Within a registered team, members have access to a real-time, persistent group chat.
*   **Design Choices:** A hybrid approach using both REST and WebSockets. 
*   **Implementation Approach:** Socket.io is used to create specific "rooms" using the `team._id`. When a user opens their Team Dashboard, they join this room. When a message is sent, Socket.io broadcasts it to everyone in the room for instant UI updates, while simultaneously saving a `Message` document to MongoDB via Mongoose to ensure the chat history persists across page reloads.
(6 Marks)
**Description:** Organizers cannot change their passwords directly if they forget them; they must submit a request to the Admin.
*   **Technical Decisions:** A `PasswordResetRequest` model holds the organizer ID and the new requested password (hashed immediately upon request). Admins have a dashboard to review these. If approved, the Admin controller updates the Organizer's actual password field.

### 5. Tier C: Anonymous Feedback System 
**Description:** After an event concludes, attendees can leave a star rating and comment, with an option to stay anonymous.
*   **Implementation Approach:** Only participants with a `Confirmed` registration status for an event whose date has passed (or is marked `Closed` by the organizer) see the "Leave Feedback" button. If the `isAnonymous` boolean is checked, the backend controller intercepts the data during retrieval and sanitizes the participant's name before sending it to the Organizer's analytics dashboard.

---

## 🗺️ User Flows

### General Flow
1. **Landing Page**: Unauthenticated users arrive at the landing page and can click "Login" or "Get Started".
2. **Authentication**: Users are routed through `/login`. Participants can create an account via `/register`. Admins and Organizers are pre-provisioned or created by Admins. Upon login, the app reads the role from the JWT payload and routes them to their respective dashboards.

### Admin Flow
*   **Path**: `/login` -> `/admin` (Admin Dashboard)
*   **Actions**:
    *   View all registered Organizers (Clubs).
    *   Create a new Organizer (assigns temporary credentials).
    *   Revoke access (Delete) an Organizer.
    *   Navigate to the "Security" tab to review and Approve/Reject Organizer password reset requests.

### Organizer Flow
*   **Path**: `/login` -> `/organizer` (Organizer Dashboard)
*   **Actions**:
    *   **Profile**: Update club description and contact details.
    *   **Event Creation**: Click "+ Create New Event". Choose between Normal, Team/Hackathon, or Merchandise event. Use the dynamic form builder to add custom fields (e.g., "T-shirt Size"). Event is saved as a 'Draft'.
    *   **Event Management**: Publish a draft to make it live. Mark as Ongoing or Completed. View detailed analytics for a specific event.
    *   **Merchandise Orders**: For merch events, open the "Payment Verification Dashboard" to review uploaded payment proofs and approve them.
    *   **Password Reset**: If locked out, use the `/organizer/forgot-password` route to send a request to the Admin.

### Participant Flow
*   **Path**: `/register` -> `/onboarding` -> `/dashboard` (Participant Dashboard)
*   **Actions**:
    *   **Discovery**: View the main dashboard showing Upcoming, Trending, and Recommended events (based on tags).
    *   **Registration (Normal)**: Click an event, fill out any custom fields required by the organizer, and register. Receive a QR code ticket.
    *   **Registration (Merch)**: Click a merch drop, select size/variant, upload a screenshot of payment via the file picker, and submit. Status shows as "Verification Pending".
    *   **Hackathons**: Click a team event. Choose to "Create a Team" (receive a 6-digit invite code) or "Join via Invite Code". Enter the Team Workspace to chat via WebSockets.
    *   **My Events & Feedback**: Navigate to the "My Events" profile tab. View past events and click "Leave Feedback" to submit an anonymous review.

---

## ⚙️ Setup and Installation Instructions

Follow these steps to run the Felicity Event Management System locally.

### Prerequisites
*   Node.js (v16 or higher)
*   MongoDB Instance (Local or MongoDB Atlas)
*   Git

### 1. Clone the Repository
```bash
git clone <repository_url>
cd DASS_Assignment_1
```

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file based on the environment variables needed
touch .env
```
Add the following to your `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/felicity-events # Or your Atlas URI
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

```bash
# Start the backend server (will run on port 5000)
npm run dev
```

### 3. Frontend Setup
Open a new terminal window.
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 4. Seeding the Admin User
To access the Admin dashboard, you need the initial Admin account. After starting your MongoDB server and the Node backend, you can seed the database:
```bash
# In the backend directory
node scripts/seedAdmin.js
```
This will create an Admin user with the email `admin@felicity.com` and password `admin123`. You can use this to log in and start creating Organizers!

### 5. Access the Application
Open your browser and navigate to `http://localhost:5173` to view the frontend application. The backend runs concurrently on `http://localhost:5000`.
