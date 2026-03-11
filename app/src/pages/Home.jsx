import "../css/Home.css";
import App from "../components/Maps.jsx";

export function Home() {
  return (
    <>
      <header>
        <h1>Home</h1>
        <nav>
          <a href="/">Home</a>
          <a href="#posts">Posts</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="/auth">Login/Register</a>
        </nav>
      </header>
      <main>
        <section>
          <p>Welcome to the Home page!</p>
          {/* <img */}
          {/*   src="https://thumbs.dreamstime.com/b/map-malawi-africa-regions-blank-map-bahamas-gray-every-island-map-titles-high-quality-map-bahamas-islands-239274905.jpg" */}
          {/*   alt="Placeholder Image" */}
          {/* /> */}
          <App />
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
      </main>
    </>
  );
}

export default Home;
