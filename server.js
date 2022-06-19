/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: Sarry Al-Qassir Student ID: 119161206 Date: June 19, 2022
 *
 *  Online (Heroku) Link: https://warm-shelf-44471.herokuapp.com/about
 *
 ********************************************************************************/

const blog = require("./blog-service");

const express = require("express");

const app = express();

const path = require("path");

const multer = require("multer");

const upload = multer(); // no { storage: storage } since we are not using disk storage

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "sarry-seneca",
  api_key: "382965665789623",
  api_secret: "2MRfsVKsPm-Nbci6gOwgPJfyQ0k",
  secure: true,
});

const streamifier = require("streamifier");

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
  let minDate = req.query.minDate;
  let category = req.query.category;
  console.log(minDate);

  if (category) {
    blog
      .getPostsByCategory(parseInt(category))
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log("message: " + err);
      });
  } else if (minDate) {
    blog
      .getPostsByMinDate(minDate)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log("message: " + err);
      });
  } else {
    blog
      .getAllPosts()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log("message: " + err);
      });
  }
});

app.get("/post/:value", (req, res) => {
  let reqValue = req.params.value;
  blog
    .getPostById(parseInt(reqValue))
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      console.log("message: " + err);
    });
});

app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processPost(uploaded.url);
      })
      .catch((err) => {
        console.log("message: " + err);
      });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    blog.addPost(req.body).then((data) => {
      res.redirect("/posts");
    });
  }
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
