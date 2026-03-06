import "../css/Home.css";

export function Home() {
  return (
    <>
      <header>
        <h1>Home</h1>
        <nav>
          <a href="/">Home</a>
          <a href="#posts">Posts</a>
          <a href="#about">About</a>
        </nav>
      </header>
      <main>
        <section>
          <p>Welcome to the Home page!</p>
          <img
            src="https://via.placeholder.com/600x300"
            alt="Placeholder Image"
          />
        </section>
        <section id="posts">
          <p>Posts will be displayed here.</p>
        </section>
        <section id="about">
          <p>Posts will be displayed here.</p>
        </section>
      </main>
    </>
  );
}

export default Home;
