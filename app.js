const express = require("express");

const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");

const app = express();
const port = 8080;

// app.use(bodyParser.urlencoded({ extended: true }));  // x-www-form-urlencoded through <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.listen(port);
