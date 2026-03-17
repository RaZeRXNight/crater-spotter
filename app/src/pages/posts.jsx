import { useState } from "react";
export default function Posts(perPage = 10) {
  const [Posts, setPosts] = useState({});

  return (
    <>
      <h1>Posts</h1>
      <table id="posts">
        <thead>
          <tr></tr>
        </thead>
        <tbody></tbody>
        <tfoot>
          <tr></tr>
        </tfoot>
      </table>
    </>
  );
}
