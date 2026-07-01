# Focus Festival Web App - Conceptual System Blueprint

This document explains the core logic, structural architecture, and community safety rules for the Focus Festival Logistics platform. 

---

## 🎯 What the App Does (The Core Value)

Focus Festival can be difficult to get to, and camping can be intimidating for first-time attendees. This app acts as a trusted community matching engine to coordinate two distinct resources:
1. **Tent Spaces:** Linking people with large tents to individuals who need a secure place to sleep.
2. **Car Seats:** Creating a simple lift-share directory to ensure everyone can physically get to the site.

---

## 🛡️ 1. The Safety Gate: Shared Identity Pool

Instead of creating a brand-new sign-up system where anyone can make an unverified account, this web app builds entirely on top of the **VineMe** identity pool.

*   **Accountability Filter:** To use this website, a user **must** log in with their existing *VineMe* church app credentials.
*   **Forced Onboarding:** If a user doesn't have an account, they are directed to download *VineMe* and fill out their service profile first. This guarantees that every host and applicant is a known, accountable member of the church community.
*   **Zero Data Re-entry:** Because the app reads their existing profile, members don't have to re-type their names, phone numbers, or gender configurations.

---

## 🧱 2. Database Isolation (The PostgreSQL Schema Strategy)

The biggest technical challenge is using the *VineMe* database without cluttering or accidentally breaking it. To achieve this, the app uses **Multi-Schema Isolation**.

*   **The Problem:** Normally, databases group tables in a default space called `public`. This is where all your *VineMe* connection group data lives.
*   **The Solution:** This app creates a completely separate workspace namespace inside the database called `focus_festival`. 
*   **The Wall:** The festival tables (`tents`, `cars`, `applications`) sit inside this custom workspace. The mobile app code remains 100% blind to it, meaning you can build, experiment, or entirely delete the festival database layers at the end of summer without risking a single byte of core *VineMe* data.

---

## 🚨 3. Embedded Business & Safety Rules

Because a church festival relies heavily on trust, matching isn't random. The app enforces two major programmatic guardrails:

### Rule A: Strict Gender-Matching Logic
When creating a tent listing, hosts can toggle a `SAME_SEX_ONLY` restriction. 
*   **Automatic Prevention:** When an applicant views a tent, the server checks the applicant's profile gender against the host's profile gender.
*   **UI Enforcement:** If there is a mismatch on a restricted tent, the system completely strips away the "Apply" button and displays a clear safety banner explaining the restriction.

### Rule B: Permission-Based Application State (The Gatekeeper)
Applying to a tent or a car seat does **not** automatically grant a spot.
1. **Application Submitted:** The status is flagged as `PENDING`.
2. **Host Control:** The host sees a private dashboard where they can review the applicant's church profile and choose to `APPROVE` or `REJECT` them.
3. **Atomic Capacity Counting:** To prevent double-booking if multiple people apply for the last spot at the same time, the system uses an atomic database lock. The remaining spaces counter decreases *only* if the available space is verified as greater than 0 at the exact microsecond of approval.

---

## ☁️ 4. Free Tier Cloud Defense (Vercel Optimization)

The app is architected to run entirely on Vercel's free tier. To guarantee you never hit limits or get hit with surprise bot traffic, the security middleware uses a strict path-matching system.

*   **The Filter:** Instead of verifying the user's login token on every single asset request (like background images, styling sheets, or the public landing page), the security layer *only* triggers when a user tries to access a functional page (`/dashboard`, `/tents`, or `/cars`). 
*   **The Benefit:** This stops automated search crawlers or public bots from burning through your free monthly serverless execution allowances, keeping your hosting cost at exactly £0.