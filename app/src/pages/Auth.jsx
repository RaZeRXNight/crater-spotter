import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import "../css/forms.css";
import "../css/articles.css";

function RegisterForm() {
  const Navigate = useNavigate();
  const [userAuth, setUserAuth] = useState({
    username: "",
    email: "",
    password: "",
  });
  const HandleRegisterSubmit = function (event) {
    event.preventDefault();
    axios.post("/api/user/register", userAuth).then(function (response) {
      Navigate("/dashboard");
    });
  };
  return (
    <form
      action="/api/user/register"
      onSubmit={HandleRegisterSubmit}
      method="POST"
    >
      <fieldset name="Auth">
        <legend>Register</legend>
        <label for="username">username</label>
        <input
          autoFocus
          type="text"
          name="username"
          value={userAuth.username}
          onChange={function (event) {
            setUserAuth({ ...userAuth, username: event.target.value });
          }}
          placeholder="username"
          required
          minLength={3}
          maxlength={52}
        />
        <label for="email">email</label>
        <input
          type="email"
          name="email"
          value={userAuth.email}
          onChange={function (event) {
            setUserAuth({ ...userAuth, email: event.target.value });
          }}
          placeholder="email"
          required
        />
        <label for="password">password</label>
        <input
          type="password"
          name="password"
          value={userAuth.password}
          onChange={function (event) {
            setUserAuth({ ...userAuth, password: event.target.value });
          }}
          placeholder="password"
          minLength={8}
          maxlength={52}
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
          onChange={function (event) {
            setUserAuth({ ...userAuth, email: event.target.value });
          }}
          placeholder="email"
          required
        />
        <label for="password">password</label>
        <input
          type="password"
          name="password"
          minLength={8}
          maxlength={52}
          value={userAuth.password}
          onChange={function (event) {
            setUserAuth({ ...userAuth, password: event.target.value });
          }}
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
