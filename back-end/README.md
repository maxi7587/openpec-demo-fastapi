# Store API — Back-End

A minimal FastAPI application that simulates an order lifecycle with three statuses: **PENDING**, **PAID**, and **SHIPPED**.

## Setup

### 1. Create a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

### 2. Install dependencies

From the project root:

```bash
pip install -r requirements.txt
```

### 3. Run the server

```bash
uvicorn store-api:app --reload
```

The API will be available at **http://localhost:8000**.

FastAPI auto-generated interactive docs are at **http://localhost:8000/docs**.

---

## API Endpoints

### `GET /order`

Returns the current order status.

**Response:**

```json
{ "status": "PENDING" }
```

### `POST /pay`

Transitions the order to `PAID` status.

**Response:**

```json
{ "status": "PAID" }
```

### `POST /ship`

Transitions the order to `SHIPPED` status.

> **Note:** This endpoint currently contains a bug — it allows shipping without payment. See the workshop README for details on the fix.

**Response (buggy):**

```json
{ "status": "SHIPPED" }
```

### `POST /reset`

Resets the order back to `PENDING` status (useful for demo purposes).

**Response:**

```json
{ "status": "PENDING" }
```

---

## Expected Flow

```
PENDING  →  (POST /pay)  →  PAID  →  (POST /ship)  →  SHIPPED
```

The bug: `POST /ship` works even when the order is still `PENDING`, skipping the payment step.
