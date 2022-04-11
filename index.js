require("dotenv").config();
const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.API_PORT;

const productsRouter = require("./src/routers/products");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).send("API IS RUNNING");
});
app.use("/products", productsRouter);

app.use((error, req, res, next) => {
  res.status(500).send({
    status: "ERROR",
    message: error.message,
    data: error,
  });
});

if (process.env.NODE_ENV == "production") {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(port, () => {
      console.log(`Listening at ${port}`);
    });
} else {
  app.listen(port, (err) => {
    if (err) return cosole.log({ err });
    console.log(`Api is running at port ${port}`);
  });
}
