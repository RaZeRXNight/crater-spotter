/**
 * page. External State Number that dictates the current page.
 * setPage. External State Handler that controls the page state.
 * HandlePageChange. Pass a Function that returns a Number, indicating the amount of items retrieved.
 */
export function Pagination({ page, setPage, HandlePageChange, perPage = 3 }) {
  /**
   * Handles page decrementing and calls HandlePageChange
   */
  async function HandlePrev(event) {
    const newPage = page - 1;

    if (!newPage) {
      return null;
    }

    setPage(newPage);
    const newCount = await HandlePageChange(newPage, perPage);

    if (newPage > 1) {
      event.currentTarget.disabled = false;
    }
  }

  /**
   * Handles page incrementing and calls HandlePageChange
   */
  async function HandleNext(event) {
    const newPage = page + 1;

    if (!newPage) {
      event.currentTarget.disabled = true;
      return null;
    }

    setPage(newPage);
    const newCount = await HandlePageChange(newPage, perPage);

    if (newCount == perPage) {
      event.currentTarget.disabled = false;
    }
  }

  return (
    <div className="flex flex-row justify-around">
      <button onClick={HandlePrev} type="">
        Back
      </button>
      <button>{page}</button>
      <button onClick={HandleNext} type="">
        Forward
      </button>
    </div>
  );
}
