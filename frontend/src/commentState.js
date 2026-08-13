export function normalizeComments(message, error = null) {
  return {
    rows: Array.isArray(message?.rows) ? message.rows : [],
    count: Number.isFinite(message?.count) ? message.count : 0,
    error,
  };
}

export function appendCommentPage(current, next, page) {
  return {
    rows: [...current.rows, ...next.rows],
    count: next.count,
    page,
    error: next.error,
  };
}

export function replaceCommentPage(current, next, page) {
  return {
    rows: next.rows,
    count: next.count,
    page,
    error: next.error,
  };
}

export function commentPageError(current, error) {
  return {
    ...current,
    loading: false,
    error,
  };
}

export function hasMoreComments({ rows, count }) {
  return rows.length < count;
}
