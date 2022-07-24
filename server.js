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

const upload = multer();

const exphbs = require("express-handlebars");

const stripJs = require("strip-js");

const cloudinary = require("cloudinary").v2;
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      createURL: function (url, id) {
        return url + id;
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      categoryURL: function (first, second) {
        return first + "?category=" + second;
      },
    },
  })
);
app.set("view engine", ".hbs");

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    route == "/" ? "/" : "/" + route.replace(/\/(.*)/, "");
  app.locals.viewingCategory = req.query.category;
  next();
});

cloudinary.config({
  cloud_name: "sarry-seneca",
  api_key: "382965665789623",
  api_secret: "2MRfsVKsPm-Nbci6gOwgPJfyQ0k",
  secure: true,
});

const streamifier = require("streamifier");
const { brotliDecompress } = require("zlib");
const { stringify } = require("querystring");

const HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT);
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(
        parseInt(req.query.category)
      );
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = (await blog.getPostById(parseInt(req.params.id)))[0];
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData });
});

app.get("/posts", (req, res) => {
  let category = req.query.category;
  let minDate = req.query.minDate;
  if (category) {
    blog
      .getPostsByCategory(parseInt(category))
      .then((data) => {
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else if (minDate) {
    blog
      .getPostsByMinDate(minDate)
      .then((data) => {
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  } else {
    blog
      .getAllPosts()
      .then((data) => {
        res.render("posts", { posts: data });
      })
      .catch((err) => {
        res.render("posts", { message: "no results" });
      });
  }
});

app.get("/post/:value", (req, res) => {
  let val = req.params.value;
  blog
    .getPostById(parseInt(val))
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      console.log("message: " + err);
    });
});

app.get("/posts/add", (req, res) => {
  res.render("addPost");
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
    blog.addPost(req.body).then(
      (data) => {
        res.redirect("/posts");
      }
      // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
    );
  }
});

app.get("/categories", (req, res) => {
  blog
    .getCategories()
    .then((data) => {
      console.log(data);
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.use((req, res) => {
  res.status(404).render("error");
});

blog
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, onHttpStart);
  })
  .catch((err) => {
    console.log(err);
  });
