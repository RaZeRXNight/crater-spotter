import assert from "node:assert/strict";
import { validatePagination } from "../services/validation.js";

assert.deepEqual(validatePagination({}), {
  currentPage: 1,
  perPage: 10,
  offset: 0,
});
assert.deepEqual(validatePagination({ page: "100", perpage: "10" }), {
  currentPage: 100,
  perPage: 10,
  offset: 990,
});
assert.equal(validatePagination({ page: "101", perpage: "10" }), null);
assert.equal(validatePagination({ page: "1", perpage: "0" }), null);
assert.equal(validatePagination({ page: "invalid", perpage: "10" }), null);
