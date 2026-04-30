# VineOps — Claude Code Project Template

Copy this file to the root of any new VineOps project as `CLAUDE.md` and fill in the
`[FILL IN]` placeholders before starting your first session.

---

## COMPANY & VISION

**VineOps, LLC** — AI-powered operations consulting for the wine and spirits industry.
**Owner:** Chris Clark (Technology & Operations) + Andy Clark (Industry & Relationships)
**Parent entity:** Oakling Systems LLC
**Mission:** Deliver intelligence, automation, and analytics across the entire beverage
supply chain — for suppliers, distributors, retailers, and restaurants.

**Four-tier platform:**
| Tier | Target customer | Core value |
|---|---|---|
| Suppliers | Wine/spirits producers & importers | Channel visibility, demand forecasting, depletion data |
| Distributors | Regional distributors $10M–$150M revenue | Margin intelligence, rep automation, ops dashboards |
| Retail | Independent wine/spirits retailers | Inventory intelligence, category management, POS analytics |
| Restaurants | Independent restaurants & groups | Beverage program margin, wine list optimization, staff training |

**Analytics ladder (cross-cutting):**
- Descriptive — What happened (dashboards, reports)
- Predictive — What will happen (churn scoring, demand forecasting)
- Prescriptive — What to do next (AI-generated action recommendations)

---

## THIS PROJECT

**Project name:** [FILL IN]
**Tier(s) served:** [Suppliers / Distributors / Retail / Restaurants / Cross-cutting]
**Type:** [Client portal / Marketing page / Automation workflow / Analytics service / Other]
**Status:** [In Progress / Live / Paused]
**Live URL:** [FILL IN or N/A]
**Repo:** [FILL IN — GitHub URL]

**Purpose (one paragraph):**
[FILL IN — What does this project do and why does it exist?]

---

## BRAND IDENTITY

**VineOps colors:**
```
--burgundy:  #6B1F2A   (primary brand, CTAs, accents)
--gold:      #C4A75E   (secondary accent, eyebrows, highlights)
--dark:      #2E2E3E   (dark sections, body text)
--cream:     #F5F3EF   (light section backgrounds)
--white:     #FFFFFF
```

**Typography:**
- Headings: Playfair Display (serif) — Google Fonts
- Body: Inter (sans-serif) — Google Fonts

**Voice & tone:**
- Industry-insider, not tech-bro
- Confident but not salesy
- Specific over vague ("$10M–$150M distributors" not "mid-market companies")
- No emojis in UI copy
- Em dash (—) preferred over comma for subordinate clauses

**DWD client portal overrides (if applicable):**
- Primary: #0A2240 (navy), Accent: #D4A017 (amber)
- Header has "Confidential" pill and DWD badge

---

## TECH STACK

**Dashboard app (React):**
- React 18 + Vite + TypeScript
- Tailwind CSS (use inline `style` for dynamic colors — JIT purging issue)
- Recharts (charts)
- Papa Parse (CSV ingestion)

**Marketing site (static):**
- Plain HTML + CSS (no build step)
- Playfair Display + Inter via Google Fonts
- Calendly popup widget for consultation booking
- Formspree for contact form submissions

**Automation platform:**
- n8n (workflow orchestration)
- FastAPI (Python analytics microservice)
- PostgreSQL + TimescaleDB
- Redis (cache)
- Docker Compose

**Infrastructure:**
- Hosting: Bluehost shared hosting (`ftp.pjy.dwk.mybluehost.me`)
- Domain root: `public_html` (Bluehost addon domain, cannot be changed)
- CI/CD: GitHub Actions → FTP Deploy
- Repo: `ChrisOakling/vineops-margin-watcher` (private)

---

## DEPLOY PIPELINE

```
git push origin main
  → GitHub Actions (.github/workflows/deploy.yml)
  → npm ci && npm run build && npm run build:dwd
  → FTP: vineops-site/     → /          (marketing site root)
  → FTP: dist/             → /dashboard/ (React dashboard)
  → FTP: dwd-demo-dist/    → /dwd-demo/  (DWD client portal)
```

**Critical rules:**
- Marketing site FTP step has NO `dangerous-clean-slate` — safe for other subdirectories
- DWD step uses `dangerous-clean-slate: true` — scoped to `/dwd-demo/` only
- Always run `npm run build` before pushing — CI runs `tsc` strictly
- Unused imports/variables fail the TypeScript build — remove them when deleting components

**FTP credentials (in GitHub Secrets):**
- `FTP_USER` — `vineopspub@vineops.ai`
- `FTP_PASSWORD` — stored in GitHub repo settings

**Caching:**
- `.htaccess` sets `no-cache` headers for HTML files to prevent Bluehost CDN stale serving
- HTML changes are immediate after deploy (no manual cache purge needed)
- Bluehost CDN cannot be manually purged — `no-cache` headers are the only lever

---

## REPOSITORY STRUCTURE

```
/
├── src/                        # React dashboard app
│   ├── components/             # Shared UI components (used by dashboard + DWD)
│   ├── hooks/
│   │   ├── useAppState.ts      # Central useReducer — margin tab state
│   │   ├── useDerivedData.ts   # Memoized KPIs, rep/vendor/account aggregations
│   │   ├── useDeliveryData.ts  # Delivery + route planning data
│   │   ├── useAccountIntelligence.ts
│   │   └── usePortfolioIntelligence.ts
│   ├── utils/
│   │   └── csvParser.ts        # UTF-16 SAP CSV decode (critical — do not simplify)
│   └── types/index.ts          # Canonical TypeScript types
│
├── dwd-demo/                   # DWD client portal (separate Vite build)
│   └── src/
│       ├── DWDApp.tsx          # Mirrors App.tsx with DWD branding
│       ├── DWDHeader.tsx       # Navy header, amber badge, Confidential pill
│       └── dwd.css             # DWD color overrides
│
├── vineops-site/               # Marketing site (static HTML/CSS — deploys to /)
│   ├── index.html
│   ├── style.css
│   ├── vineops-logo.png
│   ├── winecellar.jpg
│   └── .htaccess               # no-cache headers + SPA rewrite rules
│
├── vineops-site-draft/         # Local preview draft (do not deploy)
│
├── public/
│   └── delivery-data.csv       # Synthetic Colorado delivery data (1,344 stops)
│
├── analytics/                  # FastAPI Python analytics microservice
│   ├── main.py
│   ├── models/
│   ├── services/
│   │   ├── ingestion.py        # UTF-16 CSV → PostgreSQL
│   │   ├── snapshots.py        # Pass 1: daily KPI snapshot
│   │   ├── comparative.py      # Pass 2: deltas vs prior periods
│   │   ├── predictive.py       # Pass 3: churn + demand forecast
│   │   └── prescriptive.py     # Pass 4: AI action recommendations (template-driven)
│   └── prompts/
│
├── n8n/                        # Importable n8n workflow JSON files
├── infra/                      # Docker Compose stacks + Postgres schema
├── Docs/                       # Documentation, sample reports, sample CSV
│
├── vite.config.ts              # Dashboard build config (base: /)
├── vite.dwd.config.ts          # DWD build config (base: /dwd-demo/)
└── .github/workflows/deploy.yml
```

---

## DEVELOPMENT WORKFLOW

**Dashboard (React):**
```bash
npm install
npm run dev          # http://localhost:5173
# Drag Docs/Sample.csv onto upload zone to load data
npm run build        # Output → dist/
npm run build:dwd    # Output → dwd-demo-dist/
```

**Marketing site:**
```bash
# Open vineops-site-draft/index.html directly in browser (file://)
# No build step — edit HTML/CSS and refresh
# When ready: copy to vineops-site/ and commit
```

**Automation platform (local):**
```bash
cd infra
docker compose -f docker-compose.phase1.yml up -d
# Services: postgres:5432, redis:6379, n8n:5678, analytics:8000
```

---

## CODING CONVENTIONS

**TypeScript:**
- Strict mode — unused variables/imports fail the build
- Always remove imports when removing components from JSX
- Types defined in `src/types/index.ts` — Python models must match field semantics

**Tailwind / CSS:**
- Dynamic color classes (e.g. `text-[${color}]`) get purged by JIT — use inline `style` instead
- VineOps CSS variables defined in `style.css` `:root` block

**DWD rule:**
- All UI changes must be applied to BOTH `src/App.tsx` AND `dwd-demo/src/DWDApp.tsx`
- Shared components in `src/components/` cover both automatically

**AI Recommendations:**
- Use template-driven logic only — do NOT call Claude API from the browser or analytics service
- `prescriptive.py` generates recommendations from computed data, not LLM calls

**Comments:**
- No comments explaining what code does — only add when WHY is non-obvious
- No multi-line docstrings or block comment headers

---

## DATA LAYER

**SAP Sales CSV (ERP export):**
- Encoding: UTF-16 LE with BOM — must decode before passing to Papa Parse
- Delimiter: tab-delimited
- `Mgn$` column may decode as `MgnS` or `Mgn ` — csvParser uses headerAliasMap
- Net Value and Mgn$ are comma-formatted ("1,259.64") — strip commas before parseFloat
- Margin % values are already percentages (24.65 = 24.65%) — NOT decimals
- **Column name swap:** `Sold-to party` = account NAME, `Sold-to pt` = numeric code
- Rejected orders (non-empty Rejection Reason) excluded from aggregations

**Delivery CSV (`public/delivery-data.csv`):**
- Colorado Front Range synthetic data
- 8 routes, 21 accounts, 1,344 stops, Jan–Apr 2026
- Problem accounts: LAVETTI'S STONE PIZZA (14/64 failed), CARVER'S WESTBROOK#601 (12/64)
- Worst route: Denver Central (10.2% fail rate)

**KPI formulas (match exactly between frontend and backend):**
```
weightedAvgMarginPct = sum(margin_dollars) / sum(net_value) * 100
lowMarginCount       = rows where margin_percent < threshold (default 18%)
criticalCount        = rows where margin_percent < 15%
```

---

## EXTERNAL SERVICES

| Service | Purpose | Where configured |
|---|---|---|
| Bluehost FTP | Deploy target | GitHub Secrets: FTP_USER, FTP_PASSWORD |
| Calendly | Consultation booking | `https://calendly.com/chris-oaklingsystems/free-discovery-call-meeting` |
| Formspree | Contact form email | Form ID: `mpqkowzd` → `chris@vineops.ai` |
| cPanel Directory Privacy | DWD portal password protection | Bluehost cPanel (server-side, no code) |
| GitHub Actions | CI/CD | `.github/workflows/deploy.yml` |
| Docker (local) | Automation platform dev | `infra/docker-compose.phase1.yml` |

**DWD portal credentials (cPanel Directory Privacy):**
- Username: `demouser` / Password: `Wonderful26!`
- Set server-side — no `.htaccess` Basic Auth (doesn't work on shared hosting)

---

## KNOWN LANDMINES

1. **TypeScript build:** Unused imports fail CI — always clean up after removing components
2. **Bluehost domain root:** `vineops.ai` addon domain is locked to `public_html` — cannot change
3. **dangerous-clean-slate on marketing step:** Do NOT add it — it will wipe `/dashboard/` and `/dwd-demo/`
4. **DWD Vite base path:** Must be `/dwd-demo/` — was `/vineops/dwd-demo/` before domain migration
5. **Bluehost CDN:** HTML changes may appear stale — `.htaccess` no-cache headers prevent this; no manual purge available
6. **Formspree:** Requires an account with a form ID — email-direct endpoint format is deprecated
7. **CSV column names:** `Sold-to party` = name (not code), `Sold-to pt` = code (not name) — opposite of what labels suggest
8. **Margin %:** Already in percent units in the CSV — do not multiply by 100
9. **DWD sync state:** If FTP deploy shows "0 files" on DWD step, `dangerous-clean-slate: true` fixes stale sync state

---

## CONTACTS & LINKS

- **Chris Clark** — Technology & Operations — `chris@vineops.ai`
- **Andy Clark** — Industry & Relationships
- **Live site:** `https://vineops.ai`
- **Dashboard:** `https://vineops.ai/dashboard/`
- **DWD portal:** `https://vineops.ai/dwd-demo/`
- **GitHub repo:** `https://github.com/ChrisOakling/vineops-margin-watcher` (private)
- **Oakling Systems:** `https://oaklingsystems.com`
