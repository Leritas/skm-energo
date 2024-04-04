import "./App.css";

function App() {
  return (
    <>
      {fetch("http://localhost:4000/api").then((response) => {
        console.log(response);
        return response;
      })}
    </>
  );
}

export default App;
