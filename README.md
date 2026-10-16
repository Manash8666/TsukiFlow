# TsukiFlow 🏭
### Autonomous Manufacturing Execution System (MES) & Next-Gen Shop-Floor ERP

[![Live Production Website](https://img.shields.io/badge/Live_Landing_Page-hybrid--studioz.vercel.app%2Ftsukiflow-FF007A?style=for-the-badge&logo=vercel)](https://hybrid-studioz.vercel.app/tsukiflow)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Manash8666%2FTsukiFlow-181717?style=for-the-badge&logo=github)](https://github.com/Manash8666/TsukiFlow)
[![Frontend Stack](https://img.shields.io/badge/Frontend-React_19_+_Vite_+_MUI_v9-61DAFB?style=for-the-badge&logo=react)](https://hybrid-studioz.vercel.app/tsukiflow)
[![Backend Stack](https://img.shields.io/badge/Backend-FastAPI_+_Python_3.11-009688?style=for-the-badge&logo=fastapi)](https://github.com/Manash8666/TsukiFlow)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_%7C_SQLite-4169E1?style=for-the-badge&logo=postgresql)](https://github.com/Manash8666/TsukiFlow)
[![Security Audited](https://img.shields.io/badge/CodeRabbit-QA_Audited-FF5722?style=for-the-badge&logo=security)](https://github.com/Manash8666/TsukiFlow)

---

## 📌 Executive Summary

**TsukiFlow** is an enterprise-grade Manufacturing Execution System (`MES`) and Industrial Resource Planning (`ERP`) platform engineered specifically to serve as the **"Missing Middle"** of manufacturing infrastructure. 

While tier-1 ERPs (such as SAP S/4HANA or Oracle Cloud ERP) manage high-level accounting, balance sheets, and sales orders, they are historically detached from the high-frequency physical reality of the factory floor. TsukiFlow bridges this chasm by connecting plant managers, line supervisors, CNC operators, and quality inspectors to machine hardware, touch-kiosks, and live telemetry at millisecond latency.

### 🌐 Official Live Production Deployment
* **Official Landing Page & Product Hub:** [https://hybrid-studioz.vercel.app/tsukiflow](https://hybrid-studioz.vercel.app/tsukiflow)
* **Interactive Landing Architecture:** Cinematic Shock-grade layout featuring real-time OEE radial counters (94% OEE target, 100% Traceability, 99.2% Yield), 6-stage feature drawer, deployment tier matrix, and deep links to code and live stations.

---

## 🎯 Target Industry Domains

TsukiFlow is purpose-built to address the operational and regulatory requirements of major manufacturing hubs:

| Industrial Sector | Regional Hubs | Key TsukiFlow Solvers |
| :--- | :--- | :--- |
| **Automotive Assembly & Tier-1 CNC** | Pune, Chennai, Gurgaon | Multilevel BoM nesting, JIT work orders, machine downtime tagging, OEE telemetry, IATF 16949 audit trail. |
| **Pharmaceuticals & Biotech** | Hyderabad, Ahmedabad, Ankleshwar | Schedule M & FDA 21 CFR Part 11 compliant GRN quarantine workflows, batch lot release, zero-contamination tracking. |
| **Textiles & Technical Garments** | Surat, Tirupur, Coimbatore | GSM-certified yarn & grey fabric procurement, dye lot tracking, automated scrap/material fall-off calculations. |
| **Precision Electronics & PCB** | Bengaluru, Noida | Serialized item tracking, automated SMT machine status monitoring, yield drop detection. |

---

## ⚡ Core Feature Matrix

### 1. 📊 Executive Command Dashboard (`/`)
* **Real-Time KPIs**: Total Active Work Orders, Plant Capacity Utilization (84% optimal gauge), Critical Stock Depletion, Line Machine Health.
* **Production Status Feed**: Live timeline of active operations across all lines.
* **Quick Dispatch Actions**: One-click creation of urgent plans, inventory requisitions, and machine maintenance tickets.

### 2. 📅 Production Planning & Scheduling (`/production-plan`)
* **Dynamic Work Orders**: Schedule production processes with target quantities, machine assignments, and delivery dates.
* **Status Pipeline**: Transitions across `Planned` ➔ `In Progress` ➔ `Completed` ➔ `On Hold`.
* **Resource Conflict Detection**: Prevents scheduling multiple runs on the same machine line.

### 3. 📦 Inventory & SKU Management (`/inventory-levels`)
* **Classification Matrix**: Categorizes materials into **Raw Materials**, **Work-in-Progress (WIP)**, **Semi-Finished Goods (SFG)**, and **Finished Goods (FG)**.
* **SKU Code Registry**: Unified item catalog supporting variant designations (e.g., `TSK-SHIRT-M-RED`, `TSK-PCM-500`).
* **Depletion Threshold Alerts**: Automatic critical low-stock highlighting when items fall below `200 units`.

### 4. 🚚 Procurement & Waste Analytics (`/procurement`)
* **Purchase Order (PO) Management**: Issue and track POs with vendor binding (e.g., Tata Steel, Hindalco).
* **Goods Receipt Note (GRN) Inspection**: Automated GRN generation with a 3-way QA state machine (`QUARANTINE` ➔ `APPROVED` or `REJECTED`).
* **Scrap & Waste Auditing**: Logging of physical fall-off material in kilograms by disposal route (`Recycled`, `Sold as Scrap`, `Discarded`).

### 5. ⚙️ Engineering & Multilevel Bill of Materials (`/engineering`)
* **Multilevel BoM Tree**: Visual recursive parent-child assembly mapping (e.g., Engine Block ➔ Pistons ➔ Rings ➔ Fasteners).
* **AI-Assisted BoM Generator**: Natural language generation of complete material formulations and cost estimates via YUZU AI.
* **Offline Heuristic Fallback**: Deterministic BoM generation for automotive, pharma, and textile products when offline.
* **Dynamic Workflow Engine**: Configurable, JSON-persisted custom stage pipelines (e.g., `['Procurement', 'Milling', 'Assembly', 'QA', 'Storage']`) requiring **zero schema migrations**.
* **Client Billing & Invoicing**: SOW reference tracking and payment status management (e.g., Tata Motors, Mahindra Aerospace).

### 6. 🔬 Quality Assurance & Traceability (`/product-quality`)
* **End-to-End Genealogy Tracking**: Full forward and backward tracing of raw material batch numbers to finished product serial lots.
* **Defect Root Cause Logging**: Tracking of defect types, inspection timestamps, and QA technician sign-offs.

### 7. 🤖 IoT Equipment Health & OEE Telemetry (`/equipment`)
* **Live Machine Diagnostics**: Continuous monitoring of machine temperature (°C), vibration frequency (mm/s), and cumulative operating hours.
* **Machine State Machine**: Real-time operational modes (`OPERATIONAL`, `MAINTENANCE`, `STOPPED`).
* **Downtime Reason Logging**: Categorized logging of line stoppages (`Setup`, `Machine Fault`, `Material Shortage`, `Operator Absent`).
* **OEE Calculator**: Automated calculation of Overall Equipment Effectiveness (`Availability × Performance × Quality`).

### 8. 📈 Reports & Compliance Engine (`/reports`)
* **Client-Side PDF Generator**: Instant generation of branded, exportable production and quality reports powered by `jsPDF` and `jspdf-autotable`.
* **Dynamic Analytical Visualizations**: Line charts, bar graphs, and yield scatter plots rendered with `Recharts`.

### 9. 🧠 YUZU AI Diagnostic Brain (`/diagnostics` & `/api/ai/*`)
* **Persona**: YUZU acts as an intelligent, conversational manufacturing engineer with domain expertise across Indian industrial corridors.
* **Real-Time Context Synthesis**: Continuously reads database state (offline machines, critical stock, failed tasks, waste logs).
* **Autonomous Action Blocks**: Can execute structured database operations directly from AI responses (e.g., automated plan creation via `{"action": "create_plan"}`).
* **Persistent Memory Bank (`YuzuMemory`)**: Stores operational knowledge and plant policies across sessions (`{"action": "learn"}`).
* **Codebase & Git Telemetry (`/api/ai/codebase`)**: Inspects recent git commits to answer architecture and deployment questions on the fly.
* **Dual-Engine Architecture**: Operates on OpenAI / AgentRouter `gpt-4o-mini`, with automatic fallback to an offline heuristic analyzer.

### 10. 📱 Industrial Touch-First Worker Kiosk (`/kiosk`)
* **Shop-Floor Tablet Optimization**: Big-button tactile interface designed for tablets mounted next to CNC machines and assembly conveyors.
* **Operator Shift Workflow**: Fast station login, one-touch job start/stop, instant scrap entry, and downtime alerts without desktop complexity.

### 11. 🛡️ Enterprise Security & QA Audit Hardening
* **JWT Authentication**: OAuth2 Password bearer token implementation (`bcrypt` salted hashing, 24-hour expiration).
* **Rate Limiting**: Integrated `slowapi` rate limiter on critical AI endpoints (5 requests/minute).
* **Strict CORS Isolation**: Environment-driven CORS configuration restricting API access to verified domains.
* **Crash Resilience**: React `ErrorBoundary` wrapping the core layout with graceful error handling and instant recovery.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client Layer
        Web[Desktop Browser: React 19 + MUI]
        Kiosk[Shop-Floor Touch Tablet: Kiosk Mode]
        Landing[Public Landing Hub: Vercel]
    end

    subgraph API Gateway & Security
        Nginx[Reverse Proxy / Nginx :80]
        CORS[CORS Policy Guard]
        Limiter[SlowAPI Rate Limiter]
        AuthGuard[JWT OAuth2 Security Handler]
    end

    subgraph Application Server [FastAPI Backend :8000]
        PlansRouter[/api/plans]
        InventoryRouter[/api/inventory]
        SupplyRouter[/api/supply]
        MachinesRouter[/api/machines]
        EngineeringRouter[/api/engineering]
        TasksRouter[/api/tasks]
        AIRouter[/api/ai/insights & /codebase]
    end

    subgraph Intelligence & Storage
        YuzuAI[YUZU AI Engine: gpt-4o-mini / Local Heuristics]
        DB[(PostgreSQL 15 / SQLite DB)]
        MemoryBank[(YuzuMemory Facts Store)]
    end

    Web --> Nginx
    Kiosk --> Nginx
    Landing -.-> Web
    Nginx --> CORS --> Limiter --> AuthGuard
    AuthGuard --> PlansRouter
    AuthGuard --> InventoryRouter
    AuthGuard --> SupplyRouter
    AuthGuard --> MachinesRouter
    AuthGuard --> EngineeringRouter
    AuthGuard --> TasksRouter
    AuthGuard --> AIRouter

    AIRouter <--> YuzuAI
    PlansRouter --> DB
    InventoryRouter --> DB
    SupplyRouter --> DB
    MachinesRouter --> DB
    EngineeringRouter --> DB
    TasksRouter --> DB
    YuzuAI --> MemoryBank
```

---

## 💻 Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **Vite 8** | High-performance sub-second builds, modern JSX runtime. |
| **UI Design System** | **Material UI (`MUI`) v9** + **Emotion** | Dark-mode industrial theme, high contrast accessibility. |
| **State Management** | **Redux Toolkit (`RTK Query`)** | Automatic cache invalidation via semantic tags (`Plan`, `Inventory`, `Task`). |
| **Visualization & PDF** | **Recharts 3** + **jsPDF 4** | Interactive shop-floor telemetry charts and instant client-side PDF compilation. |
| **Backend Framework** | **FastAPI** (Python 3.11) | Asynchronous execution, strict type validation with Pydantic v2, OpenAPI docs. |
| **ORM & Database** | **SQLAlchemy** + **PostgreSQL 15 / SQLite** | Dual-mode: SQLite for standalone zero-config dev, PostgreSQL for production Docker. |
| **Security & Limiting** | **Bcrypt** + **Python-Jose** + **SlowAPI** | Industry standard password hashing, JWT authentication, rate limiting. |
| **Containerization** | **Docker** + **Docker Compose** | Multi-container orchestration (Postgres, Backend API, Frontend Nginx). |

---

## 🗄️ Database Schema & Entities

The platform data model comprises 15 relational tables managed via SQLAlchemy:

1. **`users`**: User identities, authentication hashes, and roles.
2. **`products`**: Item master records, unit prices, inventory levels, and `item_type` (Raw, WIP, SFG, FG).
3. **`skus`**: Detailed variant specifications, SKU barcodes, and stock levels.
4. **`orders`**: Customer work orders linked to products and users.
5. **`manufacturing_processes`**: Production plans, quantities, timeline dates, and status.
6. **`user_manufacturing_processes`**: Many-to-many junction table assigning operators to processes.
7. **`tasks`**: Discrete shop-floor tasks assigned to line technicians.
8. **`machines`**: Factory machines, operating hours, temperature, vibration, and operational state.
9. **`downtime_logs`**: Stoppage events, duration in minutes, machine IDs, and failure reasons.
10. **`purchase_orders`**: Procurement purchase orders, vendor names, materials, and quantities.
11. **`grns`**: Goods Receipt Notes with QA quarantine states (`QUARANTINE`, `APPROVED`, `REJECTED`).
12. **`waste_logs`**: Scrap records, weight in kg, disposal methodology, and timestamps.
13. **`boms`**: Top-level Bill of Materials with serialized component dictionaries and cost estimations.
14. **`bom_items`**: Relational parent-child multilevel BoM hierarchies with stage designations.
15. **`invoices`**: Billing records, client names, SOW contract references, and payment statuses.
16. **`custom_workflows`**: Dynamic stage routing pipelines stored in JSON format without schema migrations.
17. **`yuzu_memory`**: Long-term fact store enabling the AI Brain to retain operational rules.

---

## 🚀 Quickstart & Installation

### Option 1: Run with Docker Compose (Recommended)

Make sure you have Docker and Docker Compose installed:

```bash
# Clone the repository
git clone https://github.com/Manash8666/TsukiFlow.git
cd TsukiFlow

# Build and start all services (PostgreSQL, Backend API, Frontend)
docker-compose up --build
```

* **Frontend Web App:** `http://localhost:80`
* **Worker Kiosk:** `http://localhost:80/kiosk`
* **Backend API & Swagger Docs:** `http://localhost:8000/docs`

---

### Option 2: Local Development Setup (Without Docker)

#### 1. Backend Setup (FastAPI)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI server with hot-reload
uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

* The frontend will start at `http://localhost:5173`.
* Access the Kiosk directly at `http://localhost:5173/kiosk`.

---

## 🔑 Default Credentials

Use the pre-seeded credentials to log into the application:

* **Username:** `Admin Samael`
* **Password:** `Lucifer8666`

---

## ⚙️ Environment Configuration

### Backend Configuration (`backend/.env`)

```ini
# Database (Defaults to local SQLite if omitted)
DATABASE_URL=sqlite:///./tsukiflow.db
# For PostgreSQL in Docker:
# DATABASE_URL=postgresql://tsuki_user:tsuki_password@db/tsukiflow

# JWT Secret Key
JWT_SECRET=tsukiflow_production_secret_key_99182

# AI Engine Keys (Optional: local heuristic fallback active if omitted)
OPENAI_API_KEY=sk-your-openai-api-key
AGENT_ROUTER_API_KEY=sk-your-agent-router-key
YUZU_API_BASE=https://api.openai.com/v1

# CORS Allowed Origins
CORS_ORIGINS="http://localhost:80,http://localhost:3000,http://localhost:5173,https://app.tsukiflow.com,https://hybrid-studioz.vercel.app"
```

### Frontend Configuration (`frontend/.env`)

```ini
# Backend API Base URL (Defaults to http://localhost:8000/api if omitted)
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🏛️ The Eight Missing Systems (Core Spine Architecture)

TsukiFlow implements the foundational architectural spine required for zero-fiction, audit-grade discrete and process manufacturing. Without this spine, inventory costing is an estimate, scrap is an unaccounted leak, and subcontracting is a blind spot.

```
[Routing BoM] ➔ [MRP Explosion] ➔ [PO / GRN + Lot Splits] ➔ [JWO + Conservation] ➔ [Actual Costing] ➔ [JRN / AP] ➔ [MIS]
       └──────────────────────── The Financial Lot Ledger is the Constitutional Spine ────────────────────────┘
```

### The Architectural Matrix

| # | System | Prior MES State | The Eight Systems Core Delta |
| :-- | :-- | :-- | :-- |
| 1 | **MRP Explosion Engine** | Reactive `< 200 units` threshold alerts | Order-driven `Req − Avl − OnPO` shortfall computation; one-click shortfall ➔ PO minting |
| 2 | **Process-Routing BoM** | Static parts-tree + isolated JSON pipeline | Stages declare consumable inputs & intermediate produced outputs with scrap factors |
| 3 | **JWO Execution Ledger** | Status pipeline with captive-only assumptions | Unified per-stage Work Order engine supporting **Captive** (shop floor cells) and **Subcontract** (outside processors) |
| 4 | **Lot Ledger & Conservation** | QA genealogy tags; scrap as dead-end waste | First-class financial entity with Barcode, Lineage (`NEW`, `SPLIT`, `DERIVED`); **Physical Conservation Invariant**; recoverable surplus |
| 5 | **Multi-Warehouse Custody** | Single inventory pool; no physical stores | Segregated storage: `WH-RM` (Raw Store), `WH-WIP` (Shop Floor), `WH-FG` (Finished Goods), `WH-SUB` (Vendor Custody) |
| 6 | **Progressive Actual Costing** | Static BoM standard cost estimates | Realized costs rolled per stage DAG; scrap cost *absorbed* into good output unit rate ($Cost = TotalIncurred \div GoodOutput$) |
| 7 | **Accounts Payable & Settlement** | Sales-side client invoices only | Complete AP ledger: Job Receipt Notes (JRN), service vs goods bills, partial dues payments across 5 banking modes |
| 8 | **MIS & Statutory Reporting** | Generic PDF downloads | GSTR-2B Input Tax Credit (ITC) Purchase Register, Job Work Analysis, Rolled Cost Matrix, Aging Dues, 1-Click CSV export |

---

### The Fundamental Conservation Invariant Law

In TsukiFlow, matter cannot appear from nowhere or vanish without a financial trace. Every Job Work Order completion strictly enforces the mathematical identity:

$$\mathbf{Issued \equiv Consumed + Wastage + Surplus}$$

```
                ┌─────────────────────────┐
                │   Issued Lot (500 kg)   │
                └────────────┬────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌─────────────────────────┐
│ Consumed Qty │      │ Wastage Qty  │      │ Surplus Recoverable     │
│   (400 kg)   │      │   (50 kg)    │      │ (50 kg - Stored in RM)  │
└──────┬───────┘      └──────┬───────┘      └─────────────────────────┘
       │                     │
       └─────────┬───────────┘
                 ▼
 ┌────────────────────────────────┐
 │ Output Unit Cost Absorbs Scrap │
 │  ₹(Materials + Scrap + Labor)  │
 └────────────────────────────────┘
```

1. **Consumed (Good Output):** Transforms into a new **Derived Lot** (`lineage_type: DERIVED`) with its own unique barcode and rolled unit cost.
2. **Wastage (Scrap):** Its financial value is absorbed into the unit cost of good output, ensuring realistic COGS.
3. **Surplus (Leftover Material):** **Surplus is never treated as waste.** It is automatically minted as an active inventory lot and returned to `WH-RM` for future order allocation.
4. **Invariant Rejection:** Any completion where $Issued \neq Consumed + Wastage + Surplus$ is rejected by the backend with HTTP 400 and a precise discrepancy calculation.

---

## 📡 REST API Reference

### 1. The Eight Missing Systems (Spine & MRP)

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Spine** | `GET` | `/api/spine/warehouses` | Fetch all physical warehouses (`RAW_MATERIAL`, `WIP_FLOOR`, `FINISHED_GOODS`, `SUBCONTRACT_CUSTODY`) |
| **Spine** | `POST` | `/api/spine/warehouses` | Register a new warehouse location |
| **Spine** | `GET` | `/api/spine/lots` | Retrieve real-time financial lot ledger with balances, unit costs, barcodes |
| **Spine** | `POST` | `/api/spine/lots` | Mint a new parent lot (`lineage_type: NEW`) at Goods Receipt |
| **Spine** | `POST` | `/api/spine/lots/{lot_id}/split` | Split a lot into child lineage lots (`lineage_type: SPLIT`) with barcode generation |
| **Spine** | `GET` | `/api/spine/stage-stocks` | Query stock balances currently under processor or shop-floor stage custody |
| **Spine** | `GET` | `/api/spine/movements` | Audit double-entry inventory movement ledger |
| **Spine** | `POST` | `/api/spine/jwo/{id}/complete-stage` | **Complete JWO stage**: verifies Conservation Invariant, absorbs scrap, mints output lot, recovers surplus, generates JRN bill |
| **MRP** | `GET` | `/api/mrp/routing-boms` | Fetch multi-stage Process-Routing BoMs declaring stage inputs and outputs |
| **MRP** | `POST` | `/api/mrp/routing-boms` | Create or update a Process-Routing BoM specification |
| **MRP** | `POST` | `/api/mrp/explode` | **MRP Explosion Engine**: calculates net shortfall: $Req - Avl - OnPO = Shortfall$ |
| **MRP** | `POST` | `/api/mrp/generate-shortfall-pos` | **1-Click Shortfall ➔ PO**: inherits identified shortfalls directly into vendor POs |
| **MRP** | `GET` | `/api/mrp/jwos` | Fetch Job Work Orders across captive lines and subcontract processors |
| **MRP** | `POST` | `/api/mrp/jwos` | Issue a new stage Job Work Order with material custody issue |
| **MRP** | `GET` | `/api/mrp/bills` | Fetch Accounts Payable dues ledger (JRN service bills & goods bills) |
| **MRP** | `POST` | `/api/mrp/bills/pay` | Record partial or full AP settlement across 5 payment modes (NEFT, RTGS, UPI, etc.) |
| **MRP** | `GET` | `/api/mrp/reports/mis` | Statutory MIS Catalog: GSTR-2B ITC Register, Job Work Analysis, Costing Matrix, Aging Dues |

### 2. Manufacturing & Shop-Floor Telemetry

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & issue JWT bearer token |
| **Auth** | `POST` | `/api/auth/register` | Register line manager identity |
| **Plans** | `GET` | `/api/plans/` | Retrieve active manufacturing production plans |
| **Plans** | `POST` | `/api/plans/` | Schedule new production work order |
| **Inventory** | `GET` | `/api/inventory/` | Fetch inventory levels with stock classifications |
| **Inventory** | `POST` | `/api/inventory/` | Add inventory item |
| **Inventory** | `GET` | `/api/inventory/skus` | Fetch SKU variant catalog |
| **Inventory** | `POST` | `/api/inventory/skus` | Register new SKU code |
| **Supply** | `GET` | `/api/supply/pos` | Retrieve vendor purchase orders |
| **Supply** | `POST` | `/api/supply/grns` | Issue Goods Receipt Note (starts in QUARANTINE) |
| **Supply** | `PUT` | `/api/supply/grns/{id}/status` | Update GRN QA status (APPROVED / REJECTED) |
| **Supply** | `GET` | `/api/supply/waste` | Audit logged material scrap & waste |
| **Supply** | `POST` | `/api/supply/waste` | Record line fall-off scrap in kilograms |
| **Machines** | `GET` | `/api/machines/` | Stream live IoT machine telemetry |
| **Machines** | `POST` | `/api/machines/downtime` | Record machine downtime event & reason |
| **Engineering** | `GET` | `/api/engineering/boms` | Fetch single-level BoMs |
| **Engineering** | `GET` | `/api/engineering/multilevel-boms` | Fetch recursive parent-child BoM trees |
| **Engineering** | `POST` | `/api/engineering/boms/generate` | Generate AI-driven BoM formulation |
| **Engineering** | `GET` | `/api/engineering/workflows` | Retrieve dynamic stage routing pipelines |
| **Engineering** | `POST` | `/api/engineering/workflows` | Update workflow stages (zero schema changes) |
| **Engineering** | `GET` | `/api/engineering/invoices` | Retrieve client contract invoices & SOWs |
| **AI Brain** | `POST` | `/api/ai/insights` | YUZU context-aware shop-floor diagnostic insight |
| **AI Brain** | `POST` | `/api/ai/codebase` | YUZU architectural codebase and commit review |

---

## 🐇 Quality Assurance & Security Hardening

TsukiFlow has undergone comprehensive code quality reviews and audits:

* **Strict CORS Lockdown**: Wildcard CORS (`"*"`) eliminated; explicitly restricted to localhost development servers and verified production domains (`https://hybrid-studioz.vercel.app`).
* **Rate Limiting Guard**: Critical endpoints protected with `slowapi` to prevent API denial-of-service and LLM token exhaustion.
* **Database Connection Pooling**: SQLAlchemy configured with Postgres connection safety and SQLite multi-threading isolation flags.
* **Graceful Degradation**: Application-level React `ErrorBoundary` ensures that frontend rendering anomalies trigger a recovery UI rather than a blank white screen.
* **Deterministic AI Fallback**: If external LLM gateways experience latency or network cuts, YUZU falls back to an offline rule-based heuristic engine reading local database state.

---

## 🤝 Contributing & License

TsukiFlow is open-source software licensed under the **MIT License**. Contributions, bug reports, and pull requests are welcomed via the [GitHub Repository](https://github.com/Manash8666/TsukiFlow).

Developed with pride for precision engineering excellence &bull; Synced with [Hybrid Studioz](https://hybrid-studioz.vercel.app).
