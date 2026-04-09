## Why

The `/pay` endpoint accepts payments regardless of the current order status. Users can pay multiple times for the same order (when it's already `PAID` or `SHIPPED`), which is incorrect. The API should enforce the `PENDING → PAID` transition and reject duplicate payments.

## What Changes

- Add validation to the `POST /pay` endpoint: reject payment if order status is not `PENDING`, returning an error response.
- Update the frontend to display an error message when payment is rejected (the frontend already supports `{"error": "..."}` responses but the API never returns them).

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `order`: The `/pay` endpoint must reject requests when order status is not `PENDING`, returning `{"error": "..."}` with an appropriate HTTP status code.
- `ui`: The UI must surface the error message returned by the API when a duplicate payment is attempted.

## Impact

- **Backend**: `back-end/store-api.py` — `/pay` endpoint needs a status check before transitioning.
- **Frontend**: `front-end/index.html` — Already handles error responses; may need minor adjustments.
- **Tests**: Backend and frontend tests need new scenarios for duplicate payment rejection.
