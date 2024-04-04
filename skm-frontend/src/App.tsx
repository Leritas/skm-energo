import "./App.css";

function App() {
  fetch("http://localhost:4000/api/admin")
    .then((response) => response.json())
    .then((data) => console.log(data));
  return <></>;
}

export default App;
