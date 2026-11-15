import assert from "node:assert/strict";
import test from "node:test";
import {
  appendCommentPage,
  commentPageError,
  hasMoreComments,
  normalizeComments,
  replaceCommentPage,
} from "./commentState.js";

test("normalizes a successful response", () => {
  assert.deepEqual(
    normalizeComments({ rows: [{ id: 1 }], count: 1 }),
    { rows: [{ id: 1 }], count: 1, error: null },
  );
});

test("normalizes an empty response", () => {
  assert.deepEqual(
    normalizeComments({ rows: [], count: 0 }),
    { rows: [], count: 0, error: null },
  );
});

test("normalizes a failed response", () => {
  assert.deepEqual(
    normalizeComments(null, "Network error"),
    { rows: [], count: 0, error: "Network error" },
  );
});

test("defensively handles malformed success data", () => {
  assert.deepEqual(
    normalizeComments({ rows: null, count: null }),
    { rows: [], count: 0, error: null },
  );
});

test("appends a successful comment page", () => {
  assert.deepEqual(
    appendCommentPage(
      { rows: [{ id: 1 }], count: 2, page: 1, error: null },
      { rows: [{ id: 2 }], count: 2, error: null },
      2,
    ),
    { rows: [{ id: 1 }, { id: 2 }], count: 2, page: 2, error: null },
  );
});

test("replaces comments after a successful page-one refresh", () => {
  assert.deepEqual(
    replaceCommentPage(
      { rows: [{ id: 2 }], count: 2, page: 2, error: null },
      { rows: [{ id: 1 }], count: 1, error: null },
      1,
    ),
    { rows: [{ id: 1 }], count: 1, page: 1, error: null },
  );
});

test("preserves loaded comments when a later page fails", () => {
  assert.deepEqual(
    commentPageError(
      { rows: [{ id: 1 }], count: 2, page: 1, loading: true, error: null },
      "Network error",
    ),
    {
      rows: [{ id: 1 }],
      count: 2,
      page: 1,
      loading: false,
      error: "Network error",
    },
  );
});

test("shows View More for a partial page", () => {
  assert.equal(hasMoreComments({ rows: [{ id: 1 }], count: 2 }), true);
});

test("hides View More for an empty or complete result", () => {
  assert.equal(hasMoreComments({ rows: [], count: 0 }), false);
  assert.equal(
    hasMoreComments({ rows: [{ id: 1 }, { id: 2 }], count: 2 }),
    false,
  );
});
