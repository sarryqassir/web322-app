const blog = require("./blog-service");

const express = require("express");

const app = express();

const path = require("path");

app.use(express.static("public"));

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT);
}

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/about.html"));
});

app.get("/blog", (req, res) => {
  blog
    .getPublishedPosts()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("message: " + err);
    });
});

app.get("/posts", (req, res) => {
  blog
    .getAllPosts()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("message: " + err);
    });
});

app.get("/categories", (req, res) => {
  blog
    .getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log("message: " + err);
    });
});

app.use((req, res) => {
  res.status(404).send("Page not found");
});

blog
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log(err);
  });
