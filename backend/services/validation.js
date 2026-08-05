import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  MAX_PAGE,
  MAX_PER_PAGE,
} from "./constants.js";

export function validatePagination({
  page = DEFAULT_PAGE,
  perpage = DEFAULT_PER_PAGE,
}) {
  const currentPage = Number(page);
  const perPage = Number(perpage);

  if (
    !Number.isSafeInteger(currentPage) ||
    currentPage < 1 ||
    currentPage > MAX_PAGE ||
    !Number.isSafeInteger(perPage) ||
    perPage < 1 ||
    perPage > MAX_PER_PAGE
  ) {
    return null;
  }

  // ponytail: MAX_PAGE caps offsets; use cursor pagination if feeds outgrow it.
  return { currentPage, perPage, offset: (currentPage - 1) * perPage };
}
