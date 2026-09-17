import api from "../api.js";
import { normalizeComments } from "../commentState.js";
import { isAuthorized } from "./Pins";

export function RenderComments({ rows, user }) {
  if (!rows) {
    return undefined;
  }
  return rows.map((row) => {
    if (!row) {
      return null;
    }
    return (
      <Comment
        key={row.id}
        id={row.id}
        authorid={row.authorid}
        authorName={row.authorName}
        title={row.title}
        comment={row.comment}
        admin={user ? isAuthorized(row, user) : false}
      />
    );
  });
}

export async function getComments({ id, page, perPage }) {
  const { err, data } = await api({
    url: "/api/v1/comment/",
    headers: {
      Accept: "application/json",
    },
    params: {
      postid: id,
      perPage: perPage || 10,
      page: page || 1,
    },
  });
  return normalizeComments(data?.message, err);
}

export async function HandleCommentFormSubmission(event, commentForm) {
  event.preventDefault();
  return api({ url: "/api/v1/comment", method: "POST", body: commentForm });
}

export function CreateComment({
  commentForm,
  setCommentFormState,
  HandleFormSubmission,
}) {
  return (
    <>
      <form method="POST" onSubmit={HandleFormSubmission}>
        <fieldset>
          <legend>Comment</legend>
          <textarea
            type="text"
            name="comment"
            value={commentForm.comment}
            height={"full"}
            required
            placeholder="Comment Here"
            onChange={function (params) {
              setCommentFormState({
                ...commentForm,
                comment: params.target.value,
              });
            }}
          ></textarea>
        </fieldset>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export function Comment({ id, authorid, authorName, comment, admin = false }) {
  async function DeletePost() {
    if (window.confirm(`Are you sure you want to delete this comment?`)) {
      const { err } = await api({ url: `/api/v1/comment/${id}`, method: "DELETE" });
      if (err) return;
      document.getElementById(`comment_card_${id}`).hidden = true;
    }
  }

  return (
    <div key={id} id={`comment_card_${id}`}>
      <div>
        {
          // if there isa valid id, we provide a link to the profile.
          authorid ? (
            <a href={`/profile/${authorid}`}>{authorName}</a>
          ) : (
            <h2>{authorName}</h2>
          )
        }
        <p>{comment}</p>
      </div>
      <ul className="flex flex-row justify-end">
        <>
          {admin ? (
            <button onClick={DeletePost} type="button">
              Delete
            </button>
          ) : undefined}
        </>
      </ul>
    </div>
  );
}
