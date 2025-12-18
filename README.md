# CricTrackPro

> A cricket score tracking platform combining international match data with user-generated local cricket records.

<div align="center">

**[Live Demo](#) • [Documentation](#) • [Issues](https://github.com/yourrepo/issues)**

</div>

---

## Table of Contents

- [Quick Start](#quick-start)
- [Product Overview](#product-overview)
- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [Access Control Model](#access-control--collaboration-model)
- [Prototype Details](#prototype-details)
- [Risks & Metrics](#risks--open-questions)
- [Roadmap](#roadmap)
- [About This Project](#about-this-project)

---

##  Quick Start

### Prerequisites

- **Node.js** (v14 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crictrachpro.git
   cd crictrachpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**  
   Visit `http://localhost:3000`

---

## 📱 Product Overview

**CricTrackPro** is a digital scorebook for amateur and local cricket. It lets players and organizers own, preserve, and showcase their personal cricket records—enabling weekend league players to move beyond scattered WhatsApp threads and notebooks.

### Core Philosophy

- **Not** a replacement for professional cricket analytics platforms
- **Not** designed for ball-by-ball international predictive analysis
- **Focused on** grassroots-level record keeping and community

---

## Problem & Solution

### The Problem

While international cricket data is everywhere, **local and amateur cricket remains largely undocumented**.

Players and organizers struggle with:

- ❌ No permanent ownership of local match records
- ❌ Loss of personal statistics over time
- ❌ Scattered scorekeeping across WhatsApp, notebooks, or spreadsheets
- ❌ Limited visibility of league or friendly matches beyond the ground

Existing cricket apps optimize for professional cricket, leaving a **gap for grassroots-level record keeping**.

### Target Users

**Primary Personas:**
- Amateur cricketers
- Weekend league organizers and players

**Non-Goals:**
- Deep analytical breakdowns of international cricket
- Replacement for professional scoring/broadcast systems
- Ball-by-ball predictive analytics (at this stage)

---

## Key Features

### 1. International Matches (Read-Only)
- Live and recent international match scores
- Data sourced from free, publicly available cricket APIs
- View-only experience for reliability

### 2. User-Generated Matches & Tournaments
- Create local matches, leagues, or tournaments
- Add players and assign an admin role
- Admin-controlled scoring and match progression
- Automatic player profile linking
- Public visibility of local scorecards

---

## Architecture & Design Decisions

### Jobs To Be Done (JTBD)

> When I open the app, I want to quickly view live international matches and live local matches created by users, so that I can stay updated while also tracking matches I personally play in or care about.

### Two Distinct Experiences

| Component | Behavior | Purpose |
|-----------|----------|---------|
| **International Matches** | Read-only | Reliability + clarity |
| **User-Created Matches** | Admin-editable | Ownership + control |

---

## Access Control & Collaboration Model

| User Type | International Matches | User-Created Matches |
|-----------|----------------------|---------------------|
| Any User | ✅ Read-only | ✅ View all |
| Match Admin | ✅ Read-only | ✅ Full edit + scoring |
| Non-Admin | ✅ Read-only | ✅ View only |

**Design Philosophy:**
- Admin-only editing reduces collaboration complexity
- Minimizes conflict resolution overhead in MVP
- Admin retains deliberate control over match closure

---

## 🔧 Prototype Details

### Current State
- ✅ Fully clickable user flows
- ✅ Mocked data (no backend persistence)
- ✅ Navigation & role clarity validated
- ✅ Match creation and viewing flows

### Validated Through Prototype
- Navigation patterns
- Role clarity and permissions
- Match creation workflows
- User profile flows

### 📌 Important Note
> The prototype focuses on **product behavior and decision logic**, not technical implementation. No engineering code is claimed.

---

## 🛠️ Tools Used

- **Google AI Studio** – Prototype generation and interaction flows
- **Node.js** – Backend runtime
- **Gemini API** – AI-powered features

---

## ⚖️ Key Tradeoffs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Speed vs Accuracy** | Speed + mocked data | Faster iteration before building full scoring engine |
| **Free APIs vs Reliability** | Free APIs | Validate user demand before investing in paid sources |
| **Collaboration Model** | Admin-only editing | Reduce complexity; avoid multi-scorer conflict resolution |

---

## ⚠️ Risks & Open Questions

### Scaling
- How will the system handle increased concurrent usage during live matches?

### Retention
- How do we sustain engagement beyond match days?

### Abuse Prevention
- How do we prevent incorrect or malicious scoring by admins?

### Data Accuracy
- How dependent are we on free external API reliability?

---

## Success Metrics (Hypothetical)

- **Match Creation Rate** – Local matches per daily active user
- **Profile Completion Rate** – User signup to profile completion ratio
- **Engagement** – DAU / MAU ratio
- **Organizer Retention** – Repeat match creation by same organizers

---

## 🗺️ Roadmap

### Phase 2: Local League Management
- Season-based leagues
- Points tables and standings

### Phase 3: Advanced Personal Stats
- Batting and bowling summaries
- Player comparisons against league averages
- Contextual insights inspired by international-level statistics

---

##  About This Project

This project is part of my **Product Management portfolio**, created to demonstrate:

✅ End-to-end PRD thinking  
✅ Clear scoping and tradeoffs  
✅ Consumer + systems product judgement  
✅ Comfort working with AI-assisted product tooling  

**Intent:** Emphasize product clarity and decision-making over technical implementation.

---

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 💬 Questions?

Feel free to open an issue or reach out for questions about the product strategy or implementation.

**Happy tracking! 🏏**
