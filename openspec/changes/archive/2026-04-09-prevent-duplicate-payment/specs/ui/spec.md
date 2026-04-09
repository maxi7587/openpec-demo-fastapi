## MODIFIED Requirements

### Requirement: Error Feedback

The UI MUST display API error messages when an invalid transition is attempted, including duplicate payment attempts.

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

#### Scenario: Duplicate payment attempt

- GIVEN an order with status `PAID`
- WHEN the user clicks the Pay button
- THEN the error banner displays the error message from the API
- AND the status badge remains `PAID`
- AND the flow diagram does not change
