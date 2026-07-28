import { useNavigate } from "react-router";
import api from "../api.js";

export default function Card({ id, title, comment, admin = false }) {
  const Navigate = useNavigate();

  const DeletePost = async function (event) {
    const button = event.currentTarget;
    button.disabled = true;
    if (window.confirm(`Are you sure you want to delete ${title} post?`)) {
      const { err } = await api({ url: `/api/pin/${id}`, method: "DELETE" });
      if (err) return;
      Navigate("/pin/");
    }
  };

  return (
    <div key={id} id="post_card">
      <div>
        <a href={`/pin/${id}`}>
          <h3>{title}</h3>
          <p>{comment}</p>
        </a>
      </div>
      <ul>
        <>
          {admin ? (
            <>
              <a href={`/pin/edit/${id}`}>edit</a>
              <button onClick={DeletePost} type="button">
                Delete
              </button>
            </>
          ) : undefined}
        </>
      </ul>
    </div>
  );
}
