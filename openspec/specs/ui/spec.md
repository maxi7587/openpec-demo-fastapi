# UI Specification

## Purpose

Defines how the frontend reflects order state and communicates errors to the user. The UI is a thin layer over the API — it MUST surface API errors clearly so the workshop audience can see when a transition is rejected.

## Requirements

### Requirement: Status Display

The UI SHALL display the current order status and visually indicate which step in the flow is active.

#### Scenario: Page load

- GIVEN the API is running
- WHEN the user opens the frontend
- THEN the current order status is fetched from `GET /order`
- AND the status badge and flow diagram reflect the current state

#### Scenario: API unreachable

- GIVEN the API is not running
- WHEN the user opens the frontend or clicks any action
- THEN an error message is displayed indicating the server is unreachable

### Requirement: Error Feedback

The UI MUST display API error messages when an invalid transition is attempted.

#### Scenario: Invalid transition rejected by API

- GIVEN the API returns a response containing an `error` field
- WHEN the user clicks an action button (Pay or Ship)
- THEN the error message is displayed in a visible error banner
- AND the status badge and flow diagram are NOT updated

#### Scenario: Successful transition

- GIVEN the API returns a response containing a `status` field
- WHEN the user clicks an action button
- THEN a success message is displayed
- AND the status badge and flow diagram update to the new state

### Requirement: Request Log

The UI SHOULD log every API request and response so the workshop audience can follow the sequence of calls.

#### Scenario: Action performed

- GIVEN the user clicks any action button
- WHEN the API responds (success or error)
- THEN a log entry showing the HTTP method, path, and response body is prepended to the log panel
