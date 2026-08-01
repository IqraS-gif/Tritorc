# Tritorc Relevance Checker

A production-quality, responsive full-stack web application for scanning **PDF and DOCX tender documents** against Tritorc's industrial bolting keyword list to determine procurement relevance.

---

## ✨ Features

- 📂 **Drag-and-drop multi-file upload** — accepts multiple `.pdf` and `.docx` files at once
- 🔍 **Fuzzy keyword matching engine** — case-insensitive matching with regex + Porter Stemmer handling plurals & word variants (e.g. `torque wrench` ↔ `torque wrenches`, `tensioning` ↔ `tensioner`)
- 📊 **Dynamic relevance scoring** — 
  - `0 matches` → **No Relevance**
  - `1–2 matches` → **Possible**
  - `3+ matches` → **High Relevance**
- 📈 **Two Excel report download options**:
  1. **Summary Report** — 4 columns (`Document Name`, `Matched Keywords`, `Match Count`, `Relevance`)
  2. **Detailed Report** — 24 columns matching GeM tender metadata standards (`Tender ID`, `Authority`, `Location`, `Dates`, `Tender Amount`, `EMD`, `Scope of Work`, `Technical/Financial Qualification`, etc.)
- 📱 **Mobile responsive UI** — mobile-first CSS breakpoints supporting desktop, tablet, and smartphone screens
- 🎨 **Red & White Light Theme** — clean high contrast design, SVG icons, zero emojis, zero AI gradients
- ⚡ **Fast & deterministic** — lightweight in-memory parsing, no external AI/LLM API dependency needed

---

## 📄 Included Test Tender Documents

The repository includes pre-built sample GeM tender documents for testing all three relevance tiers:

1. **`GeM-Bidding-High-Relevance.pdf`** (6 Pages)  
   - *Scope*: Refinery Shutdown Maintenance & Controlled Bolting Services (IOCL Gujarat Refinery)  
   - *Result*: **13 matched keywords** → **High Relevance**

2. **`GeM-Bidding-Borderline-Relevance.pdf`** (6 Pages)  
   - *Scope*: General Hardware & Workshop Consumables Procurement (BHEL Haridwar)  
   - *Result*: **2 matched keywords** → **Possible**

3. **`GeM-Bidding-9563430.pdf`** (5 Pages)  
   - *Scope*: Office Stationary & Printing Supply Tender  
   - *Result*: **0 matched keywords** → **No Relevance**

4. **`GeM_Bid_9852104_Formatted.docx`**  
   - *Result*: **14 matched keywords** → **High Relevance** (with full 24-column metadata extraction)

---

## 📁 Project Structure

```
Tritorc-Relevance-Checker/
├── GeM-Bidding-High-Relevance.pdf       ← High Relevance test PDF
├── GeM-Bidding-Borderline-Relevance.pdf ← Borderline test PDF
├── GeM-Bidding-9563430.pdf              ← No Relevance test PDF
├── GeM_Bid_9852104_Formatted.docx       ← Test DOCX file
├── backend/                              Node.js + Express API
│   ├── src/
│   │   ├── app.js                        Express server setup & CORS
│   │   ├── config/
│   │   │   └── keywords.js               Keyword config file (20 default keywords)
│   │   ├── controllers/
│   │   │   └── scanController.js         Scan & report endpoint logic
│   │   ├── middleware/
│   │   │   └── uploadMiddleware.js       Multer memory storage config
│   │   ├── routes/
│   │   │   └── scanRoutes.js             API router (/api/scan, /api/report, /api/report/detailed)
│   │   └── services/
│   │       ├── extractorService.js       PDF (pdf-parse) & DOCX (mammoth) text extraction
│   │       ├── matcherService.js         Regex + Porter Stemmer matching engine
│   │       ├── metadataExtractorService.js 24-column metadata extraction engine
│   │       └── reportService.js          ExcelJS report generators (Summary & Detailed)
│   ├── scripts/
│   │   └── generateGeMSamples.js         Script to generate 6-page test PDFs
│   ├── .env.example
│   └── package.json
│
└── frontend/                             React + Vite (Red & White Light Theme)
    ├── src/
    │   ├── App.jsx                       Main layout & state integration
    │   ├── main.jsx
    │   ├── index.css                     Design system & mobile responsive CSS
    │   ├── components/
    │   │   ├── DropZone.jsx              Drag-and-drop file upload component
    │   │   ├── ProgressBar.jsx           Animated upload/scan progress indicator
    │   │   ├── ResultsTable.jsx          Interactive results view
    │   │   ├── ScanSummary.jsx           Visual stat summary cards
    │   │   └── Toast.jsx                 Toast notifications
    │   ├── hooks/
    │   │   └── useScanner.js             Scanner custom hook & UI state management
    │   └── services/
    │       └── api.js                    Axios API client
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Quick Start (How to Run Locally)

> [!IMPORTANT]
> **⚡ ZERO DATABASE SETUP REQUIRED**: 
> You **DO NOT** need to configure a `MONGODB_URI` or install MongoDB to run the application locally! Core features (**PDF/DOCX file uploading**, **text extraction**, **fuzzy keyword scanning**, **relevance verdict computation**, and **Excel report generation**) function **100% out of the box** without MongoDB.
>
> *(MongoDB connection is purely optional for saving scan history logs — if omitted, the app automatically runs in in-memory mode).*

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

---

### Step 1 — Backend Setup

Open terminal and run:

```bash
cd backend

# Copy environment file (Optional)
copy .env.example .env

# Install dependencies
npm install

# Start Express backend server
npm run dev
```

> 🟢 **Backend URL**: `http://localhost:5000`  
> 🏥 **Health Check**: `http://localhost:5000/health`

---

### Step 2 — Frontend Setup

Open a **second terminal window** and run:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite React frontend server
npm run dev
```

> 🌐 **Frontend URL**: `http://localhost:5173` (Open in browser)

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Server health check |
| `POST` | `/api/scan` | Upload PDF/DOCX files → JSON scan results |
| `POST` | `/api/report` | Download 4-column summary Excel report |
| `POST` | `/api/report/detailed` | Download 24-column detailed Excel report |

---

## ⚙️ Default Keyword List (20 Keywords)

Defined in `backend/src/config/keywords.js`:

1. Hydraulic torque wrench
2. Bolt tensioner
3. Hydraulic bolt tensioning
4. Controlled bolting
5. Flange management
6. Flange joint integrity
7. Torque wrench
8. Stud bolt tensioning
9. Nut splitter
10. Torque multiplier
11. Bolting tools
12. Flange bolt tightening
13. Turnaround services
14. Shutdown maintenance
15. Plant shutdown
16. Bolted joint
17. Pre-tensioning
18. Gasket and flange management
19. Torque calibration
20. Mechanical bolting

---

## 🔬 Keyword Matching Pipeline & Logic

```
   ┌──────────────────────────────────────────────────────────┐
   │        Uploaded Tender Document (PDF / DOCX)             │
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 1. Text Normalization: Lowercase + Collapse Whitespace   │
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2. Stage 1: Strict Word-Boundary Regex Match (\b...\b)   │
   │    Checks exact patterns & morphological suffix variants │
   └────────────────────────────┬─────────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
        Match Found? (YES)            Match Found? (NO)
                 │                             │
                 ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │ Add to Unique Matched Set │ │ Single-Word Keyword?      │
   └───────────────────────────┘ └─────────────┬─────────────┘
                                               │
                                       ┌───────┴───────┐
                                       │ (YES)         │ (NO)
                                       ▼               ▼
                         ┌──────────────────┐ ┌──────────────────┐
                         │ Stage 2: Porter  │ │ Skip (Multi-word │
                         │ Stemmer Fallback │ │ Regex Anchored)  │
                         └─────────┬────────┘ └──────────────────┘
                                   │
                                   ▼
                   ┌────────────────────────────────┐
                   │ Compute Relevance Verdict &    │
                   │ Generate Excel / Visual View   │
                   └────────────────────────────────┘
```

---

### 1. 🎯 Strict Pattern Anchoring vs. False Positive Rejection

We use explicit word-boundary anchors `\b` and controlled optional delimiters `[-\s]?` to eliminate false positives.

| Input Document Text | Target Keyword | Applied Pattern / Rule | Result | Reason |
| :--- | :--- | :--- | :---: | :--- |
| `torque wrench` | Torque wrench | `/\btorque\s+wrench(es)?\b/i` | ✅ MATCH | Exact phrase match |
| `torque wrenches` | Torque wrench | `/\btorque\s+wrench(es)?\b/i` | ✅ MATCH | Plural morphological variant |
| `pre-tensioning` | Pre-tensioning | `/\bpre[-\s]?tensioning\b/i` | ✅ MATCH | Hyphenated variant |
| `pretensioning` | Pre-tensioning | `/\bpre[-\s]?tensioning\b/i` | ✅ MATCH | Single-word closed variant |
| `peanut` | Nut splitter | `/\bnut\s+splitter\b/i` | ❌ REJECT | `\b` boundary prevents partial match on `peanut` |
| `bolting_equipment` | Bolted joint | `/\bbolted\s+joint(s)?\b/i` | ❌ REJECT | Concept boundary mismatch |

---

### 2. 🔍 Fuzzy & Stemmed Variant Matching Matrix

| Keyword Label | Pattern / Stemmer Logic | Supported Document Variants |
| :--- | :--- | :--- |
| **Hydraulic torque wrench** | `/\bhydraulic\s+torque\s+wrench(es|ing|ed)?\b/i` | `hydraulic torque wrench`, `hydraulic torque wrenches`, `hydraulic torque wrenching` |
| **Bolt tensioner** | `/\bbolt\s+tension(er|ers|ing|ed|s)?\b/i` | `bolt tensioner`, `bolt tensioners`, `bolt tensioning`, `bolt tensioned` |
| **Flange management** | `/\bflange\s+manag(ing|ement|er|ers)?\b/i` | `flange management`, `flange managing`, `flange manager` |
| **Pre-tensioning** | `/\bpre[-\s]?tension(ing|ed|er|ers|s)?\b/i` | `pre-tensioning`, `pre tensioning`, `pretensioning`, `pretensioners` |
| **Single-Word Fallback** | `natural.PorterStemmer.stem(token)` | Stems document tokens (`"calibrations"` $\rightarrow$ `"calibrat"`) for single-word targets |

---

## 📄 Submission Files

- `README.md` — Complete project overview and setup guide
- `AI_NOTES.txt` — Prompts used during development and usage breakdown
- `DEPLOY.md` — Comprehensive deployment instructions (Vercel + Railway / Render)
- `keywords.csv` — CSV copy of keyword list

---

## 📄 License

MIT © Tritorc
