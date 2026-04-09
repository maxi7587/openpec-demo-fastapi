# Order Specification

## Purpose

Defines the order lifecycle — the only entity in the system — and the rules governing its state transitions. This is the core business logic: getting transitions wrong means shipping unpaid orders.

## Entities

- **Order**
  - `status`: enum [`PENDING`, `PAID`, `SHIPPED`] — default `PENDING`

## State Machine

```
PENDING  →(pay)→  PAID  →(ship)→  SHIPPED
```

## Requirements

### Requirement: Pay Order

The system SHALL transition an order from `PENDING` to `PAID` when the pay operation is invoked. The system MUST reject payment if the order is not in `PENDING` status, returning a 400 response with an error message.

#### Scenario: Successful payment

- GIVEN an order with status `PENDING`
- WHEN the user invokes `POST /pay`
- THEN the order status becomes `PAID`
- AND the response contains `{"status": "PAID"}`

#### Scenario: Pay when already paid

- GIVEN an order with status `PAID`
- WHEN the user invokes `POST /pay`
- THEN the system MUST reject the request with HTTP 400
- AND the response contains `{"error": "Order already paid"}`
- AND the order status remains `PAID`

#### Scenario: Pay when already shipped

- GIVEN an order with status `SHIPPED`
- WHEN the user invokes `POST /pay`
- THEN the system MUST reject the request with HTTP 400
- AND the response contains `{"error": "Order already paid"}`
- AND the order status remains `SHIPPED`

#### Scenario: Successful shipment

- GIVEN an order with status `PAID`
- WHEN the user invokes `POST /ship`
- THEN the order status becomes `SHIPPED`
- AND the response contains `{"status": "SHIPPED"}`

#### Scenario: Ship when already shipped

- GIVEN an order with status `SHIPPED`
- WHEN the user invokes `POST /ship`
- THEN the system MUST reject the request with an error
- AND the order status remains `SHIPPED`

### Requirement: View Order

The system SHALL return the current order status without side effects.

#### Scenario: Read current status

- GIVEN an order in any status
- WHEN the user invokes `GET /order`
- THEN the response contains the current status
- AND the order status is not modified

## Rules

| Rule | Constraint | On |
|------|------------|----|
| `cannot_pay_twice` | Order MUST be `PENDING` to accept payment | `pay` |
