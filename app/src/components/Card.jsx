export default function Card({ id, title, comment, interactive = false }) {
  return (
    <a href={`/pin/${id}`}>
      <div key={id} id="post_card">
        <div>
          <h3>{title}</h3>
          <p>{comment}</p>
        </div>
        <ul>
          {!interactive || (
            <>
              <button type="button">like</button>
              <button type="button">dislike</button>
              <button type="button">reply</button>
            </>
          )}
        </ul>
      </div>
    </a>
  );
}
