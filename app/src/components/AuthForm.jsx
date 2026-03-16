import axios from "axios";
import useState from "react";

export default function AuthForm() {
  const [userAuth, setUserAuth] = useState({
    user: "",
    password: "",
  });

  // function HandleUserAuth() {
  //
  // }

  return (
    <section>
      <form action="/api/user" method="POST">
        <div>
          <button
            onclick={function (event) {
              console.log(this.innerText);
            }}
          >
            Login
          </button>
          <button
            onclick={function (event) {
              console.log(this.innerText);
            }}
          >
            Register
          </button>
        </div>
        <fieldset name="Auth"></fieldset>
        <label for="user"></label>
        <input type="text" name="user" value="" placeholder="username" />
        <label for="password"></label>
        <input
          type="text"
          name="password"
          value=""
          placeholder="password"
          hidden
        />
      </form>
    </section>
  );
}
