## MODIFIED Requirements

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
