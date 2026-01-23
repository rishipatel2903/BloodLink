# Modular Architecture - Blood Bank Management System

This document defines the development phases and technical specifications for the Blood Bank System. The project is divided into **8 Independent Modules**, focusing strictly on the **User** and **Blood Bank Organization** ecosystems.

---

## 🟢 Phase 1: Foundation & Security

### **Module 1: Auth & Gateway Core**
**Goal:** Secure the platform and handle identity for Users and Organizations.
**Tech:** Spring Security (OAuth2 + JWT), Google Auth SDK, React Context API.

- **1.1 Global Authentication System**
  - [ ] **Dual Login Portals**: Separate login UI for Users (Personal) vs Organizations (Business).
  - [ ] **Google OAuth Integration**: One-click sign-in for individual users.
  - [ ] **JWT Token Management**: Stateless session handling with Access/Refresh tokens.
  - [ ] **Role-Based Access Control (RBAC)**:
    - `ROLE_USER`: Can request/donate.
    - `ROLE_ORG`: Can manage inventory/events.
  - [ ] **Email Verification**: OTP-based entry for first-time signups.
  - [ ] **User Profile Engine**: Manages `BloodGroup`, `LastDonatedDate`, and `NotificationPreferences`.

- **1.2 Organization Licensing Layer**
  - [ ] **License Management**: Organization inputs License No. during signup.
  - [ ] **Status Handling**: Account is created as `PENDING`. (Activation handled via direct DB toggle/backend script, ensuring no "Admin Dashboard" is needed).

---

## 🟡 Phase 2: Core Business Logic

### **Module 2: Blood Inventory Engine**
**Goal:** Real-time tracking of blood units preventing "Ghost Stock" and expired usage.
**Tech:** MongoDB (Aggregations), Spring Scheduler.

- **2.1 Batch Management**
  - [ ] **Entity Structure**: Track `BatchID`, `CollectionDate`, `ExpiryDate`, `SourceDonorID` (anonymized).
  - [ ] **Automated Expiry**: Nightly Cron Job (`@Scheduled`) to move expired units to `DISCARDED` status.
  - [ ] **Threshold Alerts**: Logic to flag when `A+` or `O-` stock drops below safety levels.

### **Module 3: The "Life Line" (Request & Donation Flow)**
**Goal:** The core state machine handling the exchange of blood.
**Tech:** Spring State Machine.

- **3.1 Donation Workflow (User -> Bank)**
  - [ ] **Eligibility Engine**: Checks "Last Donated Date" + "Gender" rules (3 vs 4 months).
  - [ ] **Digital Health Questionnaire**: Pre-donation yes/no quiz (e.g., "Recent travel?").
  - [ ] **Appointment Booking**: Scheduling a slot at the bank.
  - [ ] **Verification**: Two-factor handshake (User shows QR Code -> Bank Scans to confirm donation).

- **3.2 Urgent Request Workflow (Bank -> User)**
  - [ ] **Blind Matching Algorithm**: Find users within **10km** radius with matching blood group.
  - [ ] **Privacy Shield**: Bank sees "5 Matching Donors Found" but *not* their names/numbers.
  - [ ] **Broadcast Trigger**: Initiates the Kafka event for notifications.

- **3.3 Blood Retrieval Workflow (User -> Bank)**
  - [ ] **Search Engine**: User searches available stock by Blood Group + Location.
  - [ ] **Reservation Logic**: User reserves unit -> Status `RESERVED` for 24h (TTL).
  - [ ] **Collection Verification**: Bank validates User ID upon pickup -> Status `FULFILLED`.

---

## 🔴 Phase 3: Hardware & Real-Time

### **Module 4: Notification Hub**
**Goal:** High-speed delivery of life-saving alerts without crashing the server.
**Tech:** Apache Kafka, AWS SDK (SNS/SES), WebSockets.

- **4.1 Architecture**
  - [ ] **Kafka Producer**: `InventoryService` publishes `LOW_STOCK_ALERT` or `URGENT_NEED` events.
  - [ ] **Notification Microservice**: Consumes events and dispatches via AWS.
  - [ ] **Channel Routing**:
    - **Critical**: SMS (AWS SNS) + WhatsApp (Twilio/Meta).
    - **Standard**: Email (AWS SES) + In-App Push (FCM).

---

## 🔵 Phase 4: User Experience (Frontend)

### **Module 5: User Dashboard ("The Hero's Journey")**
**Goal:** Gamify the experience to encourage repeat donations.
**Tech:** React, Recharts, Framer Motion.

- **5.1 Visual Components**
  - [ ] **Impact Timeline**: "Your donation on Jan 12 saved a life at City Hospital."
  - [ ] **Live Eligibility Tracker**: Circular progress bar counting down to next donation.
  - [ ] **Donation History Card**: Downloadable PDF report of lifetime donations.
  - [ ] **My Requests**: Status tracker for blood specifically requested by the user.

### **Module 6: Organization Dashboard ("Mission Control")**
**Goal:** Efficient management for hospital staff.
**Tech:** React Table, D3.js.

- **6.1 Operational Views**
  - [ ] **Inventory & Expiry Matrix**: Heatmap showing aging blood units.
  - [ ] **Donor Management**: Check-in donors via QR scan.
  - [ ] **Audit Trail View**: See exactly who updated stock and when.
  - **7.1 Integrated Reports**: (Merged from Analytics Module)
    - **Supply/Demand Analysis**: Charts showing stock trends directly on the dashboard.
    - **Waste Reduction**: Visual alerts for expiring blood.

---

## 🟣 Phase 5: Integrity

### **Module 8: System Integrity (Audit Logs)**
**Goal:** Complete traceability for compliance and theft prevention (Backend Process).
**Tech:** Spring AOP (Aspect Oriented Programming), Immutable Collections.

- **8.1 Audit Trail**
  - [ ] **Action Logging**: Auto-log every `INSERT`, `UPDATE`, `DELETE` on Inventory/Request tables.
  - [ ] **Fields**: `Timestamp`, `ActorID` (User/Org), `ActionType`, `OldValue`, `NewValue`, `IPAddress`.
  - [ ] **Tamper Proofing**: Logic to prevent deletion of Audit Logs (Write-Once-Read-Many).

