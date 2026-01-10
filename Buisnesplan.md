Business Plan: "EasyLehrer"
1. Executive Summary
EduSuisse Connect is a dual-sided marketplace tailored for the Swiss education system. It facilitates the buying, selling, and sharing of teaching resources aligned with Lehrplan 21. The platform solves the problem of "cognitive overload" for teachers by utilizing a strict "Visual Calm" design philosophy—hiding complexity by default and prioritizing whitespace.
Unlike generic file-sharing sites, EduSuisse Connect introduces a robust B2B layer (School Accounts) allowing institutions to purchase Team Licenses and manage resources centrally.
________________________________________
2. Product Identity & UX Strategy
2.1 The "Visual Calm" Philosophy
The platform's core differentiator is its interface design, strictly adhering to Requirement 1:
•    Vertical Stacking: Forms avoid horizontal clutter. All inputs are stacked vertically with ample padding.
•    Color Theory:
o    Primary Action Color: Used only for key actions (e.g., "Buy," "Publish," "Save").
o    Secondary Actions: "Cancel" or "Back" buttons are styled as subdued text or "ghost buttons" to reduce visual noise.
•    Progressive Disclosure: Advanced options are always hidden by default (e.g., inside "More Filters" or expandable rows) to prevent decision fatigue.
________________________________________
3. User Ecosystem & Account Management
3.1 Individual Teacher Accounts (B2C)
•    Registration: Teachers sign up with personal data: Name, Canton, Preferred Cycles, and Subjects.
•    Dual Identity: A user can maintain their personal profile while simultaneously being linked to a School Account.
•    Dashboard: Personal "My Library" and "Wishlist" are distinct from school assets.
3.2 School Accounts & Team Management (B2B)
•    Admin Role: A designated School Admin creates the account and manages the "School details."
•    User Management:
o    Admins invite teachers via email.
o    Admins can remove teachers (revoking their access to the School Library).
•    School Library: A centralized repository showing all resources and bundles owned by the school.
o    Feature: Team Licenses. Schools purchase a single license that grants access to all invited teachers.
________________________________________
4. Marketplace Features
4.1 Resource Catalog & Search
•    Default View: Minimalist. Users see only a Wide Search Bar (keywords) and a Main Subject Selector.
•    Advanced Filtering (Collapsible):
o    A "More Filters" button expands to reveal grouped blocks: Cycle, Canton, Quality Status, Price Type, Resource Type, Editable, License Scope, Lehrplan 21 Competence Codes.
o    Mobile Behavior: On mobile, this opens as a bottom sheet/slide-out panel, keeping the main search bar visible at the top.
•    Sorting: A small, unobtrusive control for "Newest" or "Most Downloaded."
4.2 Resource Detail Pages
•    Information Hierarchy:
1.    Top (Primary): Title, Brief Description, Price, Badge (Quality/Editability), and the Buy/Download CTA.
2.    Middle (Metadata): A spaced block showing Subject, Cycle, Canton, and Lehrplan 21 codes.
3.    Bottom (Interactivity): A "Report Resource" text link and a "Related Resources" block.
•    Previews: A gallery displaying watermarked or low-resolution images. Full files are never shown pre-purchase.
•    Related Logic: The "Related Resources" block automatically queries items sharing attributes (e.g., same competence code). Fallback: Same subject.
4.3 Bundles
•    Concept: Sellers group multiple resources into a single SKU with a discounted price.
•    Display: Bundle pages mirror standard pages but replace the file preview with a "List of Included Items" stack.
•    Curriculum Inheritance: Bundles inherit tags (Subject/Cycle) from their contained resources or allow manual overrides.
________________________________________
5. The Creator Workflow (Sellers)
5.1 Multi-Stage Upload Process
To prevent form overwhelm, uploading is broken into 4 distinct steps with a minimal progress indicator:
1.    Basics: Title, Short Description, Language, Resource Type.
2.    Curriculum: Cycle, Main Subject, Canton, and Searchable Lehrplan 21 Dropdowns.
3.    Properties: Price Type (Free/Paid), Price, Editability, License Scope.
4.    Files & Publish: File upload, Preview generation (auto-watermark), and the final "Publish" button.
5.2 Seller Dashboard
A simplified "Control Center" for creators:
•    Top Metrics: Large, clean stats for Net Earnings, Total Downloads, and Followers.
•    Resource List: Rows displaying Title, Status, Downloads, and Earnings.
o    Actions: "Edit" or "Create Bundle" using the primary accent color.
•    Earnings View: A ledger showing Gross Amount, Platform Fee, and Seller Payout per transaction.
________________________________________
6. Financial & Transactional Model
6.1 Purchase Flow
•    Split Payments: The system calculates the split instantly upon transaction.
o    $User Price = Platform Commission + Seller Payout$
•    Global Commission Rate: An Admin setting allows the platform owner to set a global percentage fee (e.g., 20%) that applies to all future sales.
6.2 Licensing Types
1.    Single License: For individual teacher use.
2.    Team/School License: Higher price point, grants access to the "School Library" for all linked users.
________________________________________
7. Quality Assurance & Trust
7.1 Quality Status System
Resources pass through three statuses to ensure trust:
1.    Pending: Newly uploaded.
2.    AI-Checked: Passed automated file checks (virus scan, format validity).
3.    Verified: Manually approved by an Admin.
•    Admin View: A minimalist list showing Title, Seller, Status. Admins click to "Change Status" or add internal notes.
7.2 Reporting Mechanism
•    User Action: A subtle "Report Resource" button on detail pages opens a minimal form (Reason + Optional Comment).
•    Admin Action: Reports appear in a filterable list. Admins can toggle status: Open $\rightarrow$ In Review $\rightarrow$ Resolved $\rightarrow$ Dismissed.
7.3 Ratings & Reviews
•    Structure: Star Rating + Reviewer Name + Short Comment + Date.
•    Design: Visually separated from the main content to avoid clutter. No complex threading or "helpful" voting.
________________________________________
8. Social & Engagement Features
8.1 Following & Feed
•    Follow: A simple button on Seller Profiles.
•    Feed: A "Following" section lists new uploads in reverse chronological order.
•    Notifications: Low-noise. Users are notified of new uploads from followed sellers without intrusive pop-ups.
8.2 Wishlists
•    Function: Users click a heart icon to "Save" items.
•    View: A clean list of saved cards.
o    Smart CTA: If the user hasn't bought it, the button says "Buy". If they have, it changes to "Open".
________________________________________
9. Technical Specifications
9.1 Asset Management
•    Watermarking: The backend must automatically overlay watermarks on image previews or generate low-res versions of PDFs upon upload.
•    Secure Storage: Original files are stored in a non-public bucket (e.g., AWS S3 Private), accessible only via signed URLs generated after purchase verification.
9.2 Mobile Responsiveness
•    Breakpoints: The design prioritizes mobile-first navigation.
•    Modals: Complex interactions (Filtering, Reporting, Uploading) utilize full-screen overlays or bottom sheets on small devices to maximize screen real estate.
________________________________________
10. Roadmap
Phase 1: Core Foundation
•    Develop User/School Auth & Profile Management.
•    Build the 4-Step Upload Wizard with Lehrplan 21 data structure.
•    Implement Catalog with "Hidden" Filters.
Phase 2: Commerce & Wallet
•    Integrate Payment Gateway (Split Payments).
•    Build Seller Dashboard & Admin Commission Settings.
•    Implement "School Library" logic.
Phase 3: Trust & Community
•    Enable Reviews, Ratings, and Reporting workflows.
•    Launch "Follow" system and Notification feed.
•    Launch Beta.
11. Future Features
11.1 AI Bot
•    Create worksheets of text and picture inputs
•    Subscription based
11.2 Plagiatsüberprüfungs AI
