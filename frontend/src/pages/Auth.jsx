import axios from "axios";
import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { toast } from "react-toastify";
import "../css/articles.css";
import "../css/forms.css";

function RegisterForm() {
  const Navigate = useNavigate();
  const [userAuth, setUserAuth] = useState({
    username: "",
    email: "",
    password: "",
  });
  const HandleRegisterSubmit = function (event) {
    event.preventDefault();
    axios
      .post("/api/auth/register", userAuth)
      .then(function (response) {
        toast(response.data.message);
        Navigate("/");
      })
      .catch(function (error) {
        toast(error.message);
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
    event.currentTarget.disabled = true;
    event.preventDefault();
    axios
      .post("/api/auth/login", userAuth)
      .then(function (response) {
        toast(response.data.message);
        Navigate("/");
      })
      .catch(function (error) {
        const statusCode = error.status;

        if (statusCode == 404) {
          toast("User not Found");
        } else if (statusCode == 401) {
          toast("Authenitcation Failed");
        }
      });
    event.currentTarget.disabled = false;
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

function Logout() {
  function HandleLogout(event) {
    event.currentTarget.disabled = true;
    axios
      .delete("/api/auth/logout")
      .then(function (response) {
        toast(response);
        Navigate("/");
      })
      .catch(function (error) {
        toast(error.message);
      });
    event.currentTarget.disabled = false;
  }
  return (
    <section className="h-1/3 w-1/3 self-center flex flex-col justify-center">
      <p>Are you sure you want to log out?</p>
      <button onClick={HandleLogout}>Logout</button>
    </section>
  );
}

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const auth = useLoaderData();

  function isLoggedIn() {
    if (auth && auth.user) {
      return <Logout />;
    } else {
      return isRegistering ? <RegisterForm /> : <LoginForm />;
    }
  }

  const Login = function (_event) {
    setIsRegistering(false);
  };

  const Register = function (_event) {
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
      {isLoggedIn(auth, isRegistering)}
    </section>
  );
}
