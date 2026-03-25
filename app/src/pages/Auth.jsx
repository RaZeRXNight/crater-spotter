import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import "../css/forms.css";
import "../css/articles.css";

function RegisterForm() {
  const [userAuth, setUserAuth] = useState({
    user: "",
    email: "",
    password: "",
  });
  const HandleLoginSubmit = function (event) {};
  return (
    <form action="/api/user" onSubmit={HandleLoginSubmit} method="POST">
      <fieldset name="Auth">
        <legend>Register</legend>
        <label for="username">username</label>
        <input
          type="text"
          name="username"
          value={userAuth.email}
          placeholder="username"
          required
        />
        <label for="email">email</label>
        <input
          type="email"
          name="email"
          value={userAuth.email}
          placeholder="email"
          required
        />
        <label for="password">password</label>
        <input
          type="password"
          name="password"
          value={userAuth.password}
          placeholder="password"
          required
          autoComplete="current-password"
        />
      </fieldset>

      <button type="submit">Submit</button>
    </form>
  );
}

function LoginForm() {
  const [userAuth, setUserAuth] = useState({
    email: "",
    password: "",
  });
  const HandleLoginSubmit = function (event) {};
  return (
    <form action="/api/user" onSubmit={HandleLoginSubmit} method="POST">
      <fieldset name="Auth">
        <legend>Register</legend>
        <label for="email">email</label>
        <input
          type="email"
          name="email"
          value={userAuth.email}
          placeholder="email"
          required
        />
        <label for="password">password</label>
        <input
          type="password"
          name="password"
          value={userAuth.password}
          placeholder="password"
          required
          autoComplete="current-password"
        />
      </fieldset>
      <button type="submit">Submit</button>
    </form>
  );
}

export default function Auth() {
  const Navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(true);

  const Login = function (event) {
    setIsRegistering(false);
  };
  const Register = function (event) {
    setIsRegistering(true);
  };

  return (
    <section>
      <div className="flex flex-row justify-around">
        <button onClick={Login} type="">
          Login
        </button>
        <button onClick={Register} type="">
          Register
        </button>
      </div>
      {isRegistering ? RegisterForm() : LoginForm()}
    </section>
  );
}
