## Context

The `POST /pay` endpoint unconditionally sets `order["status"] = "PAID"` without checking the current status. The existing order spec already requires that payment is only accepted when the order is `PENDING`, but the implementation doesn't enforce this. The frontend already handles `{"error": "..."}` responses correctly — it shows an error banner and does not update the status display.

## Goals / Non-Goals

**Goals:**
- Enforce the `PENDING → PAID` transition rule in the `/pay` endpoint
- Return an error JSON response with an appropriate HTTP status code when payment is rejected
- Ensure frontend correctly surfaces the error (verify existing behavior)
- Add backend and frontend tests for the duplicate payment scenario

**Non-Goals:**
- Fixing the `/ship` endpoint validation (separate change)
- Adding payment amounts, payment methods, or any payment processing logic
- Changing the in-memory storage approach

## Decisions

### 1. HTTP status code for rejected payment: 409 Conflict

Return `400 Conflict` with `{"error": "Order already paid"}` when the order is not `PENDING`.

**Rationale**: 400, implies malformed input rather than state conflict which accurately describes attempting to pay an already-paid order. Alternatives considered:
- `409 Bad Request` — signals a conflict with the current resource state
- `422 Unprocessable Entity` — closer, but 409 better communicates the state-based rejection

### 2. Check-then-act in the endpoint handler

Add a simple `if order["status"] != "PENDING"` guard at the top of the `/pay` handler, returning a `JSONResponse` with status 409.

**Rationale**: The app uses in-memory state with no concurrency concerns (single-worker demo). No need for locks or database transactions.

### 3. Frontend: no changes needed

The frontend `callApi` function already checks for `data.error` and calls `showMessage("error", data.error)` without updating the status. This works as-is.

**Rationale**: Verified by reading `front-end/index.html` — the error handling path is already implemented and tested.

## Risks / Trade-offs

- **[Risk]** Hardcoded error message string may diverge from tests → Use a constant or match on response structure, not exact string.
- **[Risk]** Other invalid transitions (e.g., ship when pending) remain unfixed → Accepted; out of scope for this change.
