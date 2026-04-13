import axios from "axios";
import { toast } from "react-toastify";
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
  const commentData = await axios
    .get(`/api/comment/`, {
      headers: {
        Accept: "application/json",
        postid: id,
        perPage: perPage || 10,
        page: page || 1,
      },
    })
    .then(function (response) {
      const data = response.data.message;

      if (response.error) {
        toast.error(data);
        return null;
      }
      return data;
    });

  return commentData;
}

function massDisableChildren(node, bool) {
  const elements = node.elements;
  for (let element of elements) {
    element.disabled = bool;
  }
  // node.elements.map((element) => {
  //   element.disabled = bool;
  // });
}

export async function HandleCommentFormSubmission(event, commentForm) {
  const form = event.currentTarget;
  event.preventDefault();
  massDisableChildren(form, true);

  axios
    .post("/api/comment", commentForm)
    .then(function (response) {
      const data = response.data.message;
      if (response.data.error) {
        toast.error(data);
        return null;
      }
      setTimeout(() => {}, 1000);
      toast.success("Created Comment");
      return data;
    })
    .catch(function (error) {
      toast.error(error.message);
    });
  massDisableChildren(form, false);
}

export function CreateComment({
  commentForm,
  setCommentFormState,
  HandleFormSubmission,
}) {
  return (
    <>
      <form onSubmit={HandleFormSubmission}>
        <fieldset>
          <legend>Comment</legend>
          <textarea
            type="text"
            name="comment"
            value={commentForm.comment}
            height={"full"}
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
  const DeletePost = async function (event) {
    const button = event.currentTarget;
    button.disabled = true;

    if (window.confirm(`Are you sure you want to delete this comment?`)) {
      axios.delete(`/api/comment/${id}`).then(function (response) {
        const data = response.data.message;
        if (!response.data.error) {
          toast.success(response.data.message);
          document.getElementById(`comment_card_${id}`).hidden = true;
          return true;
        }
        toast.error(data);
        return false;
      });
    }
  };

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
