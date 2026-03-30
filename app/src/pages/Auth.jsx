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
    axios.post("/api/auth/register", userAuth).then(function (response) {
      Navigate("/");
    });
  };
  return (
    <form
      action="/api/auth/register"
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
  const Navigate = useNavigate();
  const [userAuth, setUserAuth] = useState({
    username: "",
    password: "",
  });
  const HandleLoginSubmit = function (event) {
    event.preventDefault();
    axios.post("/api/auth/login", userAuth).then(function (response) {
      Navigate("/");
    });
  };
  return (
    <form action="/api/auth/login" onSubmit={HandleLoginSubmit} method="POST">
      <fieldset name="Auth">
        <legend>Login</legend>
        <label for="email">username</label>
        <input
          type="text"
          name="username"
          value={userAuth.username}
          onChange={function (event) {
            setUserAuth({ ...userAuth, username: event.target.value });
          }}
          placeholder="username"
          autoFocus
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
  const [isRegistering, setIsRegistering] = useState(false);

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
      {isRegistering ? <RegisterForm /> : <LoginForm />}
    </section>
  );
}
