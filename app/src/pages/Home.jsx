import "../css/Home.css";
import App from "../components/Maps.jsx";

export default function Home() {
  return (
    <>
      <section>
        <p>Welcome to the Home page!</p>
        <App></App>
      </section>
      <section id="posts">
        <h2>Recent Posts</h2>
        <p>Posts will be displayed here.</p>
        <table id="posts-table">
          <tbody>
            <tr>
              <td>
                <h3>Post Title</h3> <p>Comments Here</p>
              </td>
              <td>
                <h3>Post Title</h3> <p>Comments Here</p>
              </td>
              <td>
                <h3>Post Title</h3> <p>Comments Here</p>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section id="about">
        <p>Posts will be displayed here.</p>
      </section>
    </>
  );
}
