// import axios from "axios";
// import { useState } from "react";

export default function AuthForm() {
  // const [userAuth, setUserAuth] = useState({
  //   user: "",
  //   password: "",
  // });

  // function HandleTextAreaChange(e) {
  //   setUserAuth({...userAuth, e.target.name: e.target.value})
  // }

  // function HandleUserAuth() {
  //
  // }

  return (
    <section>
      <form action="/api/user" method="POST">
        <div>
          <a href="/auth/login">Login</a>
          <a href="/auth/register">Register</a>
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
