## 1. Backend — Pay endpoint validation

- [x] 1.1 Add status guard to `POST /pay` in `back-end/store-api.py`: if `order["status"] != "PENDING"`, return `JSONResponse({"error": "Order already paid"}, status_code=400)`
- [x] 1.2 Add `from starlette.responses import JSONResponse` import

## 2. Backend tests

- [x] 2.1 Add test: `POST /pay` when status is `PAID` returns 400 with error message and status remains `PAID`
- [x] 2.2 Add test: `POST /pay` when status is `SHIPPED` returns 400 with error message and status remains `SHIPPED`

## 3. Frontend verification

- [x] 3.1 Verify that the existing `callApi` error handling in `front-end/index.html` correctly displays the error banner when `data.error` is present (no code changes expected)

## 4. Frontend tests

- [x] 4.1 Add test: clicking Pay when API returns 400 with `{"error": "..."}` shows error banner and does not update status
