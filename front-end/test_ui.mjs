/**
 * Tests derived from openspec/specs/ui/spec.md scenarios.
 *
 * Run with: node --test front-end/test_ui.mjs
 *
 * Uses Node.js built-in test runner (no dependencies).
 * Mocks DOM and fetch to unit-test the UI functions in isolation.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ── Minimal DOM mock ───────────────────────────────────────────────────

function makeElement(id, opts = {}) {
  return {
    id,
    textContent: "",
    className: opts.className || "",
    innerHTML: "",
    children: [],
    classList: {
      _classes: new Set(),
      toggle(cls, force) {
        force ? this._classes.add(cls) : this._classes.delete(cls);
      },
      contains(cls) {
        return this._classes.has(cls);
      },
    },
    prepend(child) {
      this.children.unshift(child);
    },
  };
}

let elements;
let domListeners;

function resetDOM() {
  elements = {
    status: makeElement("status", { className: "status-value" }),
    message: makeElement("message", { className: "message" }),
    log: makeElement("log"),
    "step-PENDING": makeElement("step-PENDING"),
    "step-PAID": makeElement("step-PAID"),
    "step-SHIPPED": makeElement("step-SHIPPED"),
  };
  domListeners = {};
}

// Globals expected by the UI code
globalThis.document = {
  getElementById(id) {
    return elements[id];
  },
  createElement(tag) {
    return makeElement(`_created_${tag}`);
  },
};

globalThis.window = {
  addEventListener(event, fn) {
    domListeners[event] = fn;
  },
};

// ── Re-implement UI functions (extracted from index.html) ──────────────

const API = "http://localhost:8000";
let fetchMock;

globalThis.fetch = (...args) => fetchMock(...args);

function updateStatus(status) {
  const el = elements["status"];
  el.textContent = status;
  el.className = "status-value " + status;

  ["PENDING", "PAID", "SHIPPED"].forEach((s) => {
    elements["step-" + s].classList.toggle("active", s === status);
  });
}

function showMessage(type, text) {
  const el = elements["message"];
  el.textContent = text;
  el.className = "message " + type;
}

function logRequest(method, path, data) {
  const log = elements["log"];
  const entry = document.createElement("div");
  entry.className = "log-entry";

  const isError = data.error;
  const statusClass = isError ? "err" : "ok";
  const body = JSON.stringify(data);

  entry.innerHTML = `<span class="method">${method}</span> <span class="url">${path}</span> → <span class="${statusClass}">${body}</span>`;
  log.prepend(entry);
}

async function callApi(method, path) {
  const msg = elements["message"];
  msg.className = "message"; // hide

  try {
    const res = await fetch(API + path, { method });
    const data = await res.json();

    logRequest(method, path, data);

    if (data.error) {
      showMessage("error", data.error);
    } else {
      showMessage("success", `Status → ${data.status}`);
      updateStatus(data.status);
    }
  } catch (err) {
    logRequest(method, path, { error: err.message });
    showMessage("error", "Could not reach API. Is the server running?");
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function mockFetchSuccess(responseData) {
  fetchMock = async () => ({
    json: async () => responseData,
  });
}

function mockFetchError(errorMessage) {
  fetchMock = async () => {
    throw new Error(errorMessage);
  };
}

// ── Requirement: Status Display ────────────────────────────────────────

describe("Status Display", () => {
  beforeEach(() => resetDOM());

  it("Scenario: Page load — fetches status and updates badge + flow diagram", async () => {
    mockFetchSuccess({ status: "PENDING" });

    await callApi("GET", "/order");

    assert.equal(elements["status"].textContent, "PENDING");
    assert.ok(
      elements["status"].className.includes("PENDING"),
      "Badge should have PENDING class"
    );
    assert.ok(
      elements["step-PENDING"].classList.contains("active"),
      "PENDING step should be active"
    );
    assert.ok(
      !elements["step-PAID"].classList.contains("active"),
      "PAID step should not be active"
    );
  });

  it("Scenario: API unreachable — shows error message", async () => {
    mockFetchError("fetch failed");

    await callApi("GET", "/order");

    assert.ok(
      elements["message"].className.includes("error"),
      "Should show error message"
    );
    assert.ok(
      elements["message"].textContent.includes("Could not reach API"),
      "Should mention server unreachable"
    );
  });
});

// ── Requirement: Error Feedback ────────────────────────────────────────

describe("Error Feedback", () => {
  beforeEach(() => resetDOM());

  it("Scenario: Invalid transition rejected by API — shows error, does NOT update status", async () => {
    // Set initial state
    updateStatus("PAID");
    mockFetchSuccess({ error: "Order already paid" });

    await callApi("POST", "/pay");

    // Error banner shown
    assert.ok(
      elements["message"].className.includes("error"),
      "Should display error"
    );
    assert.equal(elements["message"].textContent, "Order already paid");

    // Status NOT updated (still PAID)
    assert.equal(elements["status"].textContent, "PAID");
    assert.ok(
      elements["step-PAID"].classList.contains("active"),
      "PAID should still be active"
    );
  });

  it("Scenario: Successful transition — shows success and updates status", async () => {
    updateStatus("PENDING");
    mockFetchSuccess({ status: "PAID" });

    await callApi("POST", "/pay");

    assert.ok(
      elements["message"].className.includes("success"),
      "Should display success"
    );
    assert.equal(elements["status"].textContent, "PAID");
    assert.ok(
      elements["step-PAID"].classList.contains("active"),
      "PAID step should be active"
    );
    assert.ok(
      !elements["step-PENDING"].classList.contains("active"),
      "PENDING step should no longer be active"
    );
  });
});

// ── Requirement: Request Log ───────────────────────────────────────────

describe("Request Log", () => {
  beforeEach(() => resetDOM());

  it("Scenario: Action performed — log entry prepended with method, path, and response", async () => {
    mockFetchSuccess({ status: "PAID" });

    await callApi("POST", "/pay");

    const logEl = elements["log"];
    assert.equal(logEl.children.length, 1, "Should have one log entry");

    const entry = logEl.children[0];
    assert.ok(entry.innerHTML.includes("POST"), "Log should contain method");
    assert.ok(entry.innerHTML.includes("/pay"), "Log should contain path");
    assert.ok(
      entry.innerHTML.includes('"status":"PAID"'),
      "Log should contain response body"
    );
    assert.ok(
      entry.innerHTML.includes('class="ok"'),
      "Success responses should use ok class"
    );
  });

  it("Scenario: Error response — log entry shows error styling", async () => {
    mockFetchSuccess({ error: "Not allowed" });

    await callApi("POST", "/ship");

    const entry = elements["log"].children[0];
    assert.ok(
      entry.innerHTML.includes('class="err"'),
      "Error responses should use err class"
    );
  });

  it("Scenario: Multiple actions — newest entry prepended first", async () => {
    mockFetchSuccess({ status: "PAID" });
    await callApi("POST", "/pay");

    mockFetchSuccess({ status: "SHIPPED" });
    await callApi("POST", "/ship");

    const logEl = elements["log"];
    assert.equal(logEl.children.length, 2, "Should have two log entries");

    // Newest first (prepend)
    assert.ok(
      logEl.children[0].innerHTML.includes("/ship"),
      "Most recent entry should be first"
    );
  });
});
