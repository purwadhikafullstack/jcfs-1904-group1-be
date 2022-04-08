require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.API_PORT;

const userRouter = require("./src/routers/users");

app.use(cors("*"));
app.use(express.json());
app.use(express.static("public"));

app.use("/users", userRouter);
app.get("/", (req, res) => {
  res.status(200).send("API IS RUNNING");
});

app.use((error, req, res, next) => {
  console.log({ errorMessage: error.message });
  res.status(500).send({
    status: "ERROR",
    message: error.message,
    data: error,
  });
});

app.listen(port, (err) => {
  if (err) return console.log({ err });
  console.log(`Api is running at port ${port}`);
});
