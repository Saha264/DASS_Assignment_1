# Quick Evaluation Guide
Follow these steps to quickly test all functional requirements from top to bottom.

## 0. Setup
1. Ensure MongoDB is running locally.
2. In the `backend` folder, run `node scripts/seedAdmin.js`.
3. Start both `backend` and `frontend` with `npm run dev`.

## 1. Admin Flow
1. Go to `http://localhost:5173/login`.
2. Login with Email: `admin@felicity.com` | Password: `admin123`.
3. Create a new Organizer (e.g., "Coding Club"). The system will show a temporary password. Copy this!
4. Logout.

## 2. Organizer Flow (Event Creation)
1. Login with the newly created Organizer email and the temporary password.
2. Update Profile details.
3. Go to **My Events** -> **+ Create New Event**.
4. Create a **Merchandise** event (e.g., "Club Hoodie"). Set stock limit to 10. Click **Publish Event**.
5. Create a **Team (Hackathon)** event. Set Team Size to 2. Click **Publish Event**.
6. Logout.

## 3. Participant Flow A (Registration & Merch)
1. Go to `/register` and create a new Participant account. Pick some tags/interests.
2. Login and navigate to the Home dashboard.
3. Click the **Merchandise** event.
4. Select a size, upload any placeholder image as a "Payment Screen", and Submit.

## 4. Participant Flow A (Teams)
1. Go back to Home and click the **Hackathon / Team** event.
2. Click **Create a Team**. Name it something.
3. You will be redirected to the Team Dashboard. Note the **6-digit Invite Code** on the screen.
4. Send a test message in the live chat to verify websockets.
5. Logout.

## 5. Participant Flow B (Joining Team)
1. Create a *second* Participant account and login.
2. Click the same Hackathon event.
3. Click **Join via Invite Code** and enter the 6-digit code.
4. You are now in the team dashboard. You should see the first participant's chat message!
5. Logout.

## 6. Organizer Flow (Approvals & Feedback)
1. Login as the Organizer again.
2. Go to the Merchandise event. Under the "Payment Verification" tab, you will see Participant A's order. Click **Approve**.
3. Now go to the Hackathon event. Change its status from Published -> Ongoing -> **Completed**.
4. Logout.

## 7. Participant Feedback (Final Step)
1. Login as Participant A.
2. Go to **My Events** -> **Past / Cancelled** tab.
3. The Hackathon event will be there. Click **Leave Feedback**. Submit a 5-star anonymous review.
4. (Optional) Log back in as the Organizer, go to the Hackathon event, and view the aggregate feedback score!

**Testing Complete!** All Tier A, B, and C features verified.
