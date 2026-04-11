import axios from "axios";

export function CreateComment({
  commentForm,
  setCommentFormState,
  HandleFormSubmission,
}) {
  async function HandleCommentFormSubmission(event) {
    event.preventDefault();

    axios
      .post("/api/comment", commentForm)
      .then(function (response) {
        console.log(response);
        toast(response.data);
      })
      .catch(function (error) {
        toast(error.message);
      });
  }

  return (
    <>
      <form onSubmit={HandleFormSubmission || HandleCommentFormSubmission}>
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
