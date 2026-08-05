const MAX_PAGE = 100;
const MAX_PER_PAGE = 10;

export function validatePagination({ page = "1", perpage = "10" }) {
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

  // ponytail: page 100 caps offsets at 990 rows; use cursor pagination if feeds outgrow it.
  return { currentPage, perPage, offset: (currentPage - 1) * perPage };
}
