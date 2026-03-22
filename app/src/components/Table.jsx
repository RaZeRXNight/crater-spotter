import Pagination from "./paginations";

export default function Table(tableHead, tbody, data, props, pagination) {
  return (
    <table id="posts-table">
      <thead></thead>
      {tbody}
      <tfoot>{<Pagination />}</tfoot>
    </table>
  );
}
