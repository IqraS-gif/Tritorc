# Tritorc Relevance Checker

A production-quality full-stack web application for scanning **PDF and DOCX tender documents** against Tritorc's industrial bolting keyword list to determine procurement relevance.

---

## ✨ Features

- 📂 **Drag-and-drop upload** — supports multiple PDF/DOCX files at once
- 🔍 **Fuzzy keyword matching** — handles plurals, variants (tensioning, tensioned, tensioner) via regex + Porter Stemmer
- 📊 **Relevance scoring** — dynamically computed: `Yes` (3+ matches) / `Possible` (1-2) / `No` (0)
- 📈 **Excel report** — styled, colour-coded `.xlsx` download with all results
- 🎨 **Clean Red & White Light Theme** — high contrast, crisp borders, zero AI gradients, zero emojis
- ⚡ **Fast & lightweight** — no AI, no embeddings, fully deterministic matching

---

## 📄 Included GeM Tender Test Documents

Two authentic 6-page Government eMarketplace (GeM) tender documents are generated in the root directory for testing:

1. **`GeM-Bidding-High-Relevance.pdf`** (6 Pages / 9,060 chars)  
   - *Scope*: Refinery Shutdown Maintenance & Controlled Bolting Services (IOCL Gujarat Refinery)  
   - *Result*: **13 matched keywords** → Relevance: **Yes**

2. **`GeM-Bidding-Borderline-Relevance.pdf`** (6 Pages / 8,354 chars)  
   - *Scope*: General Hardware & Workshop Consumables Procurement (BHEL Haridwar)  
   - *Result*: **2 matched keywords** → Relevance: **Possible**

---

## 📁 Project Structure

```
DocumentRetrivelTritoric/
├── GeM-Bidding-High-Relevance.pdf       ← 6-Page GeM Test PDF (Yes score)
├── GeM-Bidding-Borderline-Relevance.pdf ← 6-Page GeM Test PDF (Possible score)
├── backend/                              Node.js + Express API
│   ├── src/
│   │   ├── app.js                        Entry point
│   │   ├── config/
│   │   │   └── keywords.js               Keyword config with regex patterns ← edit here
│   │   ├── controllers/
│   │   │   └── scanController.js
│   │   ├── middleware/
│   │   │   └── uploadMiddleware.js
│   │   ├── routes/
│   │   │   └── scanRoutes.js
│   │   └── services/
│   │       ├── extractorService.js       PDF/DOCX text extraction
│   │       ├── matcherService.js         Keyword matching engine
│   │       └── reportService.js          Excel generation
│   ├── scripts/
│   │   └── generateGeMSamples.js         Script to regenerate 6-page GeM PDFs
│   ├── .env.example
│   └── package.json
│
└── frontend/                             React + Vite (Red & White Light Theme)
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── DropZone.jsx
    │   │   ├── ProgressBar.jsx
    │   │   ├── ResultsTable.jsx
    │   │   ├── ScanSummary.jsx
    │   │   └── Toast.jsx
    │   ├── hooks/
    │   │   └── useScanner.js
    │   └── services/
    │       └── api.js
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

---

### 1. Install & Run the Backend

```bash
cd backend

# Copy environment file
copy .env.example .env

# Install dependencies
npm install

# Start dev server (with nodemon hot-reload)
npm run dev
```

> Backend runs at `http://localhost:5000`  
> Health check: `http://localhost:5000/health`

---

### 2. Install & Run the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

> Frontend runs at `http://localhost:5173`

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Server health check |
| `POST` | `/api/scan` | Upload PDF/DOCX files → JSON results |
| `POST` | `/api/report` | Send results → download `.xlsx` report |

---

## ⚙️ Configuration

### Keywords

Edit `backend/src/config/keywords.js` to:
- Add new keywords
- Add regex patterns for new variants
- Change relevance thresholds (the `computeRelevance` function)

---

## 🔬 Matching Algorithm

1. **Text normalisation**: Lowercase + whitespace collapse
2. **Regex patterns**: Each keyword has pre-compiled patterns with `\b` word-boundary anchors
3. **Variant coverage**: Alternation groups like `tension(ing|ed|er|ers|s)?`
4. **Stemming fallback**: Porter Stemmer applied to single-word keywords for robustness
5. **Deduplication**: Each keyword label counted at most once

---

## 📄 License

MIT © Tritorc
