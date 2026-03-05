import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from "axios";

function App() {
  const [count, setCount] = useState(0);

  const getHome = async () => {
    const url = "http://localhost:8000/api";

    try {
      const response = await axios.get(url);

      const result = await response.data;
      console.log(result);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      <h1>Hello World</h1>
      <button onClick={getHome}>I am a Button</button>
    </>
  );
}

export default App;
