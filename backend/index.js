import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/api/admin", (req, res) => {
  console.log(req);
  res.send({
    age: 21,
    name: "Artem",
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
