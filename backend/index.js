const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("ok");
});

app.listen(4000, () => {
  console.log("server i running on port 4000");
});
