# TSUKIFLOW DECISION CORPUS

**Lineage: Prêtture (2021–22) → TsukiFlow (v1). Status: ratified by the founder's word — "the advanced and future-ready version of Prêtture."**

*How to read: each Part opens with its governing question. Each entry states the **Answer** (the decision) and the **Solution** (how it is built). Appendices freeze schema, commands, and events. The closing register lists the four decisions reserved to you, with my recommendation.*

---

## PART I — IDENTITY & STRATEGY
*What are we, for whom, and what do we refuse to become?*

**Q1. What is TsukiFlow, in one sentence?**
* **Answer:** Prêtture's successor — the same conservation-ledger laws, rebuilt as an AI-native, config-driven manufacturing spine with modern surfaces.
* **Solution:** README north-star (§0 Oath) is the governing text; every PR cites the clause it serves; recognizability test (§Q40) gates v1 release.

**Q2. Which manufacturing paradigm is the beachhead?**
* **Answer:** Discrete assembly with job-work mix (the V3/V4 world), because it exercises the DAG, co-products, scrap bank, and settlement at once — while the engine stays paradigm-agnostic.
* **Solution:** Ship three config packs at v1: `discrete` (default), `jobwork`, `process-chain`; pack = JSON of process templates, UOM sets, tax presets, tracker cards, report catalog.

**Q3. Who is the primary persona?**
* **Answer:** Three readers of one ledger: the plant controller (cost truth), the production supervisor (execution), the owner (settlement & dues).
* **Solution:** One ledger, three projections: Costing Analysis tree, Production Tracker board, Settlement & Dues dashboard — no persona gets a private copy of truth.

**Q4. What do we refuse to carry from Prêtture?**
* **Answer:** Modal stacks four deep, toast-only truth, forty-click master creation, truncated legends, fork-per-vertical, chain-only routing.
* **Solution:** Non-Negotiables list in README §3; UX review gate blocks any PR reintroducing them; each refusal maps to a named replacement (Q57–Q63).

**Q5. Migrate old tenants or win new ones?**
* **Answer:** Both, in order: prove greenfield first (demo tenant passes recognizability test), then open the import bridge.
* **Solution:** P2 import wizard (masters + opening balances + outstanding bills); historical transactions arrive as archived reports, never as live ledger rows (Q72).

**Q6. How do we keep an oral specification alive?**
* **Answer:** By writing it down where machines can read it: this corpus + lineage map + YUZU memory entries with provenance to video timestamps.
* **Solution:** Every decision here becomes a `yuzu_memory` row citing part/question; future amendments follow Q86 governance.

---

## PART II — DOMAIN MODEL & INVARIANTS
*What exists, and what must always be true of it?*

**Q7. What is the atom of traceability?**
* **Answer:** The **lot**: immutable, born at GRN split or process completion, custodied per stage.
* **Solution:** `lots(id, tenant_id, item_fk, born_at, born_by_doc, kind: raw|wip|fg|scrap)`; append-only `lot_movements(id, lot_fk, kind: split|merge|issue|consume|wastage|surplus|return|transfer, qty, rate, doc_ref)`.

**Q8. Which laws are non-negotiable?**
* **Answer:** Mass: `issued = consumed + wastage + surplus + returned`. Cost: `total = consumption + absorbed wastage + process + other`.
* **Solution:** Three witnesses — Pydantic at edge, domain service mid, DB `CHECK`/trigger last (e.g., `chk_conservation` on completion lines); property tests Q77.

**Q9. Where does wastage cost go?**
* **Answer:** Absorbed into approved output unit cost; surplus returns to stock at its original rate; only true loss leaves the balance sheet.
* **Solution:** Rollup formula `unit_cost = (consumed_cost + wastage_cost + process_cost + other) / approved_qty`; periodic costing shows the four components separately (proven by V2: 99,000/300 = 330).

**Q10. Is scrap waste or product?**
* **Answer:** Planned scrap is a **product** (routed SKU, stocked, valued, netted by MRP); unplanned waste is a **log** with a disposal route.
* **Solution:** `items.class in (raw, wip, fg, scrap, consumable)`; scrap outputs carry route edges; `waste_logs` remains for post-hoc disposal only.

**Q11. Process vs stage vs JWO — three names, three things?**
* **Answer:** Yes: **process** = registry template with fiscal & policy attributes; **stage** = a process bound into a BOM (with toggle + starting flag); **JWO** = one executable batch against a stage.
* **Solution:** `process_masters`, `bom_process_bindings(bom_fk, process_fk, enabled, is_starting)`, `jwos(binding_fk, lot_batch, processor_fk, status…)`.

**Q12. How is routing expressed?**
* **Answer:** As a **disposition DAG**: edges per output SKU carrying disposition (`approved|rejected`), action (`next_process|leave|finish|move_wh`), target process/warehouse, processor, `max_rejection_pct`.
* **Solution:** `route_edges` materialized from versioned JSON DSL (Q33); UI matrix Q57.

**Q13. May the graph contain cycles?**
* **Answer:** Never across process nodes; material recirculation (scrap bank → consumption) is legal because stock breaks the cycle in time.
* **Solution:** Validator topologically sorts process nodes on every BOM save; stock-sourced consumption edges are excluded from the sort.

**Q14. How many entrances does a route have?**
* **Answer:** Exactly one: a single `is_starting` binding per BOM, mutable with revision and toast-confirm (V4 evidence).
* **Solution:** Partial unique index `UNIQUE(bom_id) WHERE is_starting`; change writes a revision row.

**Q15. What shape is a completion?**
* **Answer:** A multi-line output document: each output line has qty, rate, hours, amount; each input line has consumed/wastage/surplus.
* **Solution:** `jwo_outputs`, `jwo_consumptions`; conservation checked per input line, cost rolled per output line.

**Q16. How do forks and joins behave?**
* **Answer:** Fork = several output edges from one process; join = consumption lines drawn from several prior stage stocks; join-stage JWO checks *projected* availability (on-hand + open upstream JWOs), not a hard lock.
* **Solution:** Availability service returns `{on_hand, expected, shortfall}` per source; UI shows both.

**Q17. What is "Reserve"?**
* **Answer:** A virtual internal party wearing three hats — vendor, warehouse, processor — for buffer/consignment stock formalized through PO→GRN→lot.
* **Solution:** `parties.is_internal=true`; `warehouses.kind in (physical, virtual, stage)`; processor combobox lists internal parties first.

**Q18. Quantities, units, money — which numerics?**
* **Answer:** `NUMERIC(18,6)` for quantities, `NUMERIC(18,2)` for money; never floats; UOM conversions in a master table; base currency INR at v1 with currency master reserved.
* **Solution:** Column types enforced by migration lint; `uom_conversions(from,to,factor)`.

**Q19. Where do tax identities live?**
* **Answer:** Per process (HSN, GST rate, inclusive/exclusive) and per item; documents compute `tax_lines` at save; registers are projections.
* **Solution:** `process_masters(hsn, gst_rate, tax_type)`; GST purchase/sales registers derived from `tax_lines`, not re-keyed.

**Q20. How are document numbers born?**
* **Answer:** Per tenant, per doctype, finyear-prefixed series (`PO21-22MW/1`); gapless not required, auditable always.
* **Solution:** `doc_series(tenant, doctype, prefix, next_n)` row locked with `SELECT … FOR UPDATE` at issue time.

---

## PART III — TRANSACTIONAL ARCHITECTURE
*Where does the atomic boundary fall, and what travels outside it?*

**Q21. Status update, saga, or what?**
* **Answer:** Neither extreme: **one ACID unit-of-work for all state; transactional outbox for all effects.**
* **Solution:** Command handler wraps ledger writes + `outbox_events` inserts in a single `db.begin()`; dispatcher drains post-commit.

**Q22. What is forbidden inside the transaction?**
* **Answer:** LLM calls, PDF rendering, email, payment gateways, external webhooks.
* **Solution:** Each becomes an idempotent outbox consumer with retry; the ledger never waits on the world.

**Q23. How do double-taps die?**
* **Answer:** `Idempotency-Key` header on every command; replay returns the stored result.
* **Solution:** `idempotency_keys(key, command_hash, response_json, created_at)`; kiosk offline queue reuses the same keys (Q35).

**Q24. How is concurrent completion tamed?**
* **Answer:** Row locks in fixed order (lot → stage stock → JWO) plus optimistic `version` on the JWO aggregate; isolation READ COMMITTED.
* **Solution:** Lock-order documented in code comments; chaos tests Q79.

**Q25. How are human steps modeled?**
* **Answer:** As two commands joined by state, never one transaction and never compensated: completion, then approval.
* **Solution:** JWO state machine `IN_PROGRESS → COMPLETED → (APPROVED | REJECTED)`; policy decides whether the third state is implicit (Q26).

**Q26. Which approval policies exist?**
* **Answer:** Three, per process: `AUTO_100`, `ON_COMPLETE`, `SEPARATE_STEP`; the last exposes an approved/rejected qty gate with reason codes.
* **Solution:** Enum on `process_masters.approve_policy`; approval queue inbox Q61.

**Q27. Does the system forget on request?**
* **Answer:** It forgives, never forgets: undo is a compensating ledger event, not a delete.
* **Solution:** `revisions(doc_ref, seq, actor, delta_json, inverse_cmd)`; undo toast issues the inverse command (Q60).

**Q28. May anything be hard-deleted?**
* **Answer:** No. Masters deactivate; documents void with reason; ledger rows are eternal.
* **Solution:** `status in (active, inactive)` / `(draft, posted, void)`; void writes a mirror event.

**Q29. What happens when a consumer fails three times?**
* **Answer:** It goes to dead-letter, and a human is told in money-terms: "books correct; processor bill not yet generated; retry scheduled."
* **Solution:** `dead_letter(event_id, error, attempts)`; Nerve Center alert contract carries document ref + business impact sentence.

**Q30. How does the outside world subscribe?**
* **Answer:** Outbox events are re-published as signed tenant webhooks.
* **Solution:** `webhook_subscriptions(tenant, url, event_types, secret)`; HMAC signer; delivery log with replay.

**Q31. How are tenants isolated?**
* **Answer:** Shared schema, `tenant_id` on every row, Postgres RLS as the second wall after application filters.
* **Solution:** Session GUC `app.tenant` set by middleware; RLS policies on all ledger tables; lint rule fails PRs missing tenant FK.

**Q32. How do verticals arrive without forks?**
* **Answer:** As versioned config packs (Q2), never code branches.
* **Solution:** `tenant_config(pack_name, version, json)`; pack schema validated by Pydantic; upgrade = new version row + migration note.

**Q33. Where does the routing graph persist?**
* **Answer:** As a versioned JSON DSL document (the founder's zero-migration instinct), validated on write and materialized to relational edges for queries.
* **Solution:** `bom_routings(bom_fk, version, json)`; projection job rebuilds `route_edges`; simulator reads the JSON directly (Q50).

**Q34. How do tracker and MIS stay fast?**
* **Answer:** Reads never walk the raw ledger: materialized read models (stage buckets, cost rollups, dues) are updated inside the same transaction that changes them.
* **Solution:** `mv_stage_buckets`, `mv_cost_rollups`, `mv_dues` refreshed incrementally by triggers/consumers; full rebuild script for drift repair.

**Q35. What if the factory loses the internet?**
* **Answer:** The kiosk keeps working: commands queue locally with idempotency keys and sync on reconnect; conflicts become a review queue, not silent overwrites.
* **Solution:** IndexedDB command queue; `POST /sync` replays in order; server rejects stale versions → review items.

---

## PART IV — LEDGERS, DOCUMENTS & MONEY
*The thirteen ledgers, settled in order.*

**Q36. What is the MRP equation?**
* **Answer:** `shortfall = gross_req(order_qty × per-unit explosion, per color/size) − on_hand − expected_on_open_PO − scrap_bank_available`.
* **Solution:** `POST /mrp/check` returns per-item rows with red shortfall; persisted snapshot for audit.

**Q37. Design-time explosion and order-time MRP — one service or two?**
* **Answer:** One explosion service, two callers: BOM preview ("Overall Material Needed") and order netting.
* **Solution:** Shared recursive expander over `route_edges` + consumption qty, memoized per BOM version.

**Q38. How partial is a GRN?**
* **Answer:** Fully partial: line selection, per-line qty ≤ pending, per-line lot split; PO lines track received/pending.
* **Solution:** `grn_lines(po_line_fk, qty, lots[])`; PO line aggregates via trigger; "Select SKU" interstitial retained.

**Q39. When may lots split or merge?**
* **Answer:** Split anywhere stock moves; merge only same item + same rate + same stage, expressed as paired movements so lineage survives.
* **Solution:** `lot_movements.kind in (split, merge)` with parent/child refs; merge validator enforces the triple equality.

**Q40. What gates the release of production?**
* **Answer:** The **Start Production** command: validates netted shortfall = 0 (or a reasoned override), then seeds JWO 1 at the starting process with its default processor; the order wears a "Production Started" chip.
* **Solution:** `production_releases(order_fk, jwo_fk, override_reason?)`; this is the recognizability test's ignition.

**Q41. From where may a JWO draw material?**
* **Answer:** Multi-source: any warehouse or any prior stage's approved stock; custody transfers to the processor named on the JWO.
* **Solution:** `jwo_issues(source_kind: warehouse|stage, source_fk, lot_fk, qty)`.

**Q42. What does the completion command accept?**
* **Answer:** Outputs (qty/rate/hours), per-input consumed/wastage/surplus, policy-driven approval fields, `is_billed`, party doc refs, attachments — one POST, one transaction.
* **Solution:** `POST /jwo/{id}/complete` with the Q8 validators; emits `jwo.completed`, `stock.moved`, `cost.rolled`, optionally `payable.spawned`.

**Q43. How does work become payable?**
* **Answer:** `is_billed` on completion births a **JRN**, which drafts a **service bill** (vendor = processor, amount = process cost); GRN `is_billed` births **goods bills**; both share one bill ledger with `kind`.
* **Solution:** Bill-generator consumer; `bills(kind: goods|service, ref_doc, vendor_fk, net, due…)`.

**Q44. How do dues and partial payments behave?**
* **Answer:** `due = net − Σ payments`; payments carry mode/ref/date; aging is a read model; the dues screen is the owner's dashboard.
* **Solution:** `payments(bill_fk, amount, mode, ref, date)`; `mv_dues` with buckets 0-30/31-60/61+.

**Q45. How do goods come back?**
* **Answer:** Returns and credit notes are inverse documents referencing original lines; they move stock back and adjust dues; reasons are coded.
* **Solution:** `returns(kind: purchase|sales, origin_doc, lines[], reason)`; posts mirror movements.

**Q46. In what order is cost rolled?**
* **Answer:** Topologically per lot-stage at completion time; each stage's unit cost feeds the next as consumed cost — the progressive chain (330→380→510→540→590).
* **Solution:** `cost_rollups(lot_fk, stage_fk, consumption, wastage, process, other, unit_cost, cycle_min)` recomputed in-tx.

**Q47. How is variance explained, not just shown?**
* **Answer:** Standard (design-time BOM cost) vs actual rollup, decomposed into price, usage, wastage, and process components, each with a YUZU-written sentence.
* **Solution:** Variance view + auditor narrative (Q67).

**Q48. Whose clock measures cycle time?**
* **Answer:** The lot's: release timestamp → finish-production timestamp, with per-stage dwell; reported in periodic costing ("7 minutes").
* **Solution:** Timestamps on `production_releases`, `jwos`, `finish_productions`.

**Q49. How does production end?**
* **Answer:** With an explicit **Finish Production** transfer: stage approved stock → product warehouse as an FG lot; the lot's production lifecycle closes.
* **Solution:** `POST /lots/{id}/finish` with `transfer_to` warehouse; emits `fg.received`.

**Q50. Which reports ship at v1?**
* **Answer:** The registry ships: Periodic Production Costing, Costing Analysis tree, Stock Summary (per warehouse/stage), Purchase & Sales Registers, GST Purchase/Sales, Dues & Aging, Job-Work Analysis, Order Fulfillment Journey — all Excel + PDF exportable, tracker filter bar included.
* **Solution:** `report_registry(id, spec_json, columns, formats)`; simulator ("what-if routing") reads `bom_routings` JSON without saving.

---

## PART V — API & COMMANDS
*What verbs does the system answer to?*

**Q51. REST or commands?**
* **Answer:** Both, honestly: CQRS-lite — `POST` command endpoints named as verbs on aggregates (`/jwo/{id}/complete`), `GET` read-model endpoints for queries.
* **Solution:** FastAPI routers per aggregate; OpenAPI tags mirror ledger names.

**Q52. How many times is an invariant checked?**
* **Answer:** Thrice: Pydantic at the edge, domain service in the middle, DB constraint as last witness.
* **Solution:** Shared validator module imported by all three layers; trigger tests assert the DB catches what the others miss.

**Q53. How do lists behave?**
* **Answer:** Cursor pagination everywhere; tracker/list filters (wastage toggle, summary qty|cost, group-by, item filter) are query params with per-user saved presets.
* **Solution:** `filter_presets(user_fk, screen, json)`.

**Q54. Who renders exports?**
* **Answer:** Server renders Excel for big sets via outbox job; client renders branded PDFs (jsPDF) for documents; downloads are links with expiry.
* **Solution:** `export_jobs` + signed URLs.

**Q55. Who may see what?**
* **Answer:** JWT with role scopes per tenant; navigation itself is role-scoped (V2's three-tile home was a feature, not a bug); RLS backs it.
* **Solution:** `role_packs` in config; nav manifest derived server-side.

**Q56. How is abuse limited?**
* **Answer:** Per-tenant token buckets on commands, a separate generous pool for kiosk sync, strict pool for exports.
* **Solution:** Limiter config per route class; 429 carries retry-after.

---

## PART VI — UI/UX
*Where does the ledger meet the glove?*

**Q57. How is the disposition matrix presented?**
* **Answer:** As an inline-editable table per process: sticky item column, grouped header pairs (Approved path | Rejected path), horizontal scroll instead of truncation, column-glossary popover.
* **Solution:** Component spec frozen; no ellipsis on semantic columns, ever.

**Q58. What replaces the donut?**
* **Answer:** A **conservation bar** per stage card whose segments (Under-production, Approved, Rejected, Surplus, Wastage) always sum to issued; DETAILS opens the bucket table; drill reaches stock lines.
* **Solution:** Tracker card component; filter FAB retained (wastage toggle, qty|cost, group-by, export).

**Q59. Inline minting or bulk masters?**
* **Answer:** Both, one validator: `CREATE NEW` combobox stays as the fast path; a bulk wizard (paste/import rows) joins for onboarding.
* **Solution:** Shared master-service; bulk wizard reports per-row errors without aborting the batch.

**Q60. How does undo feel?**
* **Answer:** A 10-second undo toast on reversible commands plus a revision-history drawer on every document; undo issues the inverse ledger event.
* **Solution:** Revision drawer component; undo availability declared per command in a registry.

**Q61. Where do approvals live?**
* **Answer:** In a Nerve Center inbox queue for `SEPARATE_STEP` items, with approved/rejected qty inputs and reason codes; the queue is a read model over JWO state.
* **Solution:** Queue card links straight to the lot's ledger rows.

**Q62. What may a toast say?**
* **Answer:** Only "command received/committed"; truth lives in ledger views and queues. No toast is ever the sole record of a financial fact.
* **Solution:** UX lint: toasts reference a document id the user can open.

**Q63. What does the kiosk show?**
* **Answer:** One screen per open JWO: outputs with big steppers, consumption pre-filled from issues, wastage/surplus inputs, offline badge, glove-sized targets.
* **Solution:** Kiosk route reuses the completion command unchanged.

**Q64. How is the costing tree seen?**
* **Answer:** As a recursive DAG (D3) with per-node formula tooltips (`material + process = total; ÷ qty = unit`); click drills to the rollup row; waste/surplus nodes colored distinctly.
* **Solution:** Costing analysis page reads `cost_rollups`.

**Q65. Accessibility and locale?**
* **Answer:** Keyboard-navigable matrices, focus-trapped modals, `en-IN` number grouping, externalized strings for future locales.
* **Solution:** i18n pack + a11y CI checks.

---

## PART VII — YUZU AI STATIONS
*Where may intelligence act, and where may it only speak?*

**Q66. May the LLM write to the ledger?**
* **Answer:** Never directly. It drafts **proposals** (BoM from a spec sheet, remark text, reason-code suggestions) that a human accepts; proposals are entities with status.
* **Solution:** `yuzu_proposals(kind, payload, status: proposed|accepted|dismissed)`; acceptance flows through normal commands.

**Q67. What does the auditor station watch?**
* **Answer:** Outbox events, checking invariants and anomalies — negative stock, rate spikes, conservation near-breaches, approval lag — and writing explanations that cite ledger rows.
* **Solution:** Deterministic rule engine first; LLM narrates only what rules flagged; zero-false-silence policy: every anomaly gets a card.

**Q68. What does the memory station hold?**
* **Answer:** This corpus, the lineage map, ADR amendments, and video-provenance notes, embedded for retrieval-augmented answers that cite section and ledger row.
* **Solution:** `yuzu_memory(entry, provenance, embedding)`; retrieval restricted to tenant scope.

**Q69. What if the gateway is down?**
* **Answer:** The auditor's rules run locally always; narration degrades to templates; the clerk queues proposals for later.
* **Solution:** Engine interface with `local` and `remote` implementations (the dual-engine instinct, kept).

**Q70. What guardrails bind the AI?**
* **Answer:** No cross-tenant context in prompts, full prompt/response logging, per-tenant cost caps, and a kill-switch that leaves the ledger fully functional without AI.
* **Solution:** Gateway middleware + feature flag; TsukiFlow must be boringly complete with YUZU off.

---

## PART VIII — DATA, MIGRATION & OPERATIONS
*How does the body stay healthy?*

**Q71. What is the schema strategy?**
* **Answer:** Alembic-managed relational core; JSON columns only for config packs and routing DSL, each with a validated Pydantic schema; read models materialized (Q34).
* **Solution:** Repo layout `models/ ledger| masters| readmodels`; migration lint forbids float columns and missing tenant FKs.

**Q72. How does Prêtture data arrive?**
* **Answer:** Masters, opening stock (as opening lots with rates), and outstanding bills migrate; historical transactions arrive as archived PDFs/reports, not live rows.
* **Solution:** Import wizard with reconciliation report: migrated balances vs legacy trial balance, to the paisa.

**Q73. How are opening balances booked?**
* **Answer:** As an `OPENING` GRN variant exempt from conservation with reason code, lot-born at import rate.
* **Solution:** Doc kind + audit flag; excluded from cycle-time stats.

**Q74. How is disaster survived?**
* **Answer:** PITR + nightly logical dumps; outbox replayable; read models rebuildable from ledger alone — the ledger is the backup.
* **Solution:** Runbook with quarterly restore drills; rebuild script timed as an SLO.

**Q75. What is observed?**
* **Answer:** Command latency, conservation-violation count (SLO: zero), outbox lag, dead-letter depth, costing recompute drift, kiosk sync backlog.
* **Solution:** Metrics catalog + one dashboard per persona (Q3).

**Q76. How are secrets and keys held?**
* **Answer:** Env-injected, per-tenant encryption keys for webhooks, rotation documented; no tenant data in logs beyond ids.
* **Solution:** Logging filter scrubs payloads to references.

---

## PART IX — TESTING & QUALITY
*How do we prove the oath?*

**Q77. How is conservation proven?**
* **Answer:** Property-based tests generate random completion payloads and assert the law; raw-SQL violation tests assert the DB trigger catches what services miss.
* **Solution:** Hypothesis strategies per command; trigger test suite named `test_last_witness.py`.

**Q78. What is the golden fixture?**
* **Answer:** The Video-2 chain reproduced exactly: 500 M split 201/202 → cut 300 PCS @330 → 380 → 510 → 540 → 590 → ₹1,77,000 total = 95k + 10k + 72k, cycle 7 minutes; any drift fails the build.
* **Solution:** Golden JSON files + report snapshots; the fixture is the regression suite's heart.

**Q79. How is concurrency tested?**
* **Answer:** Chaos tests: double-completion, double-issue, offline-kiosk replay, concurrent lot splits — asserting idempotency, lock order, and review-queue behavior.
* **Solution:** Pytest marker `@chaos`; CI job with parallel workers against one DB.

**Q80. How is costing regression-tested?**
* **Answer:** Hand-computed rollups (wastage absorption, scrap netting, multi-source issue) asserted to the paisa on small fixtures; variance decomposition checked component-wise.
* **Solution:** Unit tests mirroring Q9/Q46 formulas.

---

## PART X — DELIVERY, SEQUENCING & GOVERNANCE
*In what order does the future arrive, and who may change the plan?*

**Q81. What is the sprint order?**
* **Answer:** S1 spine schema + validators → S2 GRN/lots + MRP → S3 JWO completion + costing → S4 settlement + MIS → S5 tracker/matrix UI + undo → S6 YUZU auditor + memory → S7 kiosk/offline → S8 import bridge.
* **Solution:** Maps to P0 (S1–S3), P1 (S4, S8), P2 (S5–S7); each sprint ends with a balancing report.

**Q82. What is v1 "done"?**
* **Answer:** The recognizability test passes on the demo tenant, golden fixtures green, non-negotiables audit clean, and one external witness (you) completes an order on a tablet in a noisy room without calling anyone.
* **Solution:** Release checklist signed against these four gates.

**Q83. How are releases cut?**
* **Answer:** Trunk-based with feature flags per config pack; ledger migrations always backward-compatible for one minor version.
* **Solution:** Flag registry; expand-contract migration pattern.

**Q84. What is the documentation contract?**
* **Answer:** Every ledger table, command, and event carries a docstring citing the corpus question that justified it (e.g., `lots` ← Q7).
* **Solution:** Doc-gen script fails CI on uncited public entities.

**Q85. How is support knowledge seeded?**
* **Answer:** The corpus + lineage map ship as in-app help; YUZU memory answers "why does it work this way?" with citations instead of folklore.
* **Solution:** Help drawer queries Q68 retrieval.

**Q86. How may this document change?**
* **Answer:** Only by amendment: an ADR-lite entry (date, question, decision, consequence) appended below; the north-star clauses require your explicit signature to alter.
* **Solution:** `docs/adr/` folder; amendment PR template references this corpus.

---

## APPENDIX A — CORE SCHEMA (frozen names)
`lots`, `lot_movements`, `process_masters`, `bom_process_bindings`, `bom_routings`, `route_edges`, `jwos`, `jwo_issues`, `jwo_outputs`, `jwo_consumptions`, `production_releases`, `finish_productions`, `cost_rollups`, `warehouses`, `stage_stocks`, `parties`, `bills`, `payments`, `returns`, `jrns`, `grns`, `grn_lines`, `purchase_orders`, `po_lines`, `sales_orders`, `so_lines`, `items`, `uom_conversions`, `doc_series`, `outbox_events`, `dead_letter`, `idempotency_keys`, `revisions`, `filter_presets`, `report_registry`, `tenant_config`, `role_packs`, `yuzu_proposals`, `yuzu_memory`, `webhook_subscriptions`, `export_jobs`, read models `mv_stage_buckets`, `mv_cost_rollups`, `mv_dues`.

## APPENDIX B — COMMAND CATALOG (v1)
* `POST /mrp/check`
* `POST /purchase-orders`
* `POST /grn` (+`/grn/{id}/lots/define`)
* `POST /orders/{id}/start-production`
* `POST /jwo`
* `POST /jwo/{id}/complete`
* `POST /jwo/{id}/approve`
* `POST /lots/{id}/finish`
* `POST /bills/{id}/payments`
* `POST /returns`
* `POST /masters/*` (inline & bulk)
* `POST /sync` (kiosk)
* `POST /undo/{revision_id}`

## APPENDIX C — EVENT CATALOG (outbox → webhooks)
`lot.birthed`, `lot.split`, `lot.merged`, `stock.moved`, `stock.custodied`, `jwo.released`, `jwo.completed`, `jwo.approved`, `jwo.rejected`, `cost.rolled`, `fg.received`, `payable.spawned`, `bill.posted`, `payment.recorded`, `return.posted`, `anomaly.flagged`, `export.ready`.

---

## CLOSING REGISTER — the four decisions that remain yours

| Reserved question | Ratified recommendation |
| :-- | :-- |
| **First paying segment** | The job-work garment & discrete fabricator shops already living on Prêtture — they recognize the laws instantly. |
| **Pricing metric** | Per lot processed per month, not per user: the ledger, not the seat, is the product. |
| **First hire** | A backend ledger engineer who finds joy in constraints; UI can borrow, the conservation law cannot. |
| **Brand** | Keep **TsukiFlow** outward, print "Lineage: Prêtture" in the footer inward — successors honor their ancestors publicly. |
