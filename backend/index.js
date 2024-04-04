import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/api", (req, res) => {
  console.log(req);
  res.send({
    clen: 13,
    name: "Egor",
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
