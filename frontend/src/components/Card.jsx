import { useNavigate } from "react-router";
import axios from "axios";

export default function Card({ id, title, comment, admin = false }) {
  const Navigate = useNavigate();

  const DeletePost = async function (event) {
    const button = event.currentTarget;
    button.disabled = true;
    if (window.confirm(`Are you sure you want to delete ${title} post?`)) {
      axios.delete(`/api/pin/${id}`).then(function (response) {
        console.log(response);
        if (!response.data.error) {
          Navigator("/pin/");
        }
      });
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
