export default function Card({ id, title, details, props }) {
  return (
    <>
      <div key={id} id="post_card">
        <div>
          <h3>{title}</h3>
          <p>{details}</p>
        </div>
        <ul>
          <button type="button">like</button>
          <button type="button">dislike</button>
          <button type="button">reply</button>
        </ul>
      </div>
    </>
  );
}
