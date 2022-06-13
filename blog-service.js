const fs = require("fs");

let posts;
let categories;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        posts = JSON.parse(data);
        fs.readFile("./data/categories.json", "utf8", (err, data) => {
          if (err) {
            reject(err);
          } else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
};

module.exports.getAllPosts = function () {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject("No results returned");
    } else {
      resolve(posts);
    }
  });
};

module.exports.getPublishedPosts = function () {
  return new Promise((resolve, reject) => {
    let posted = posts.filter((post) => post.published === true);

    if (posted.length === 0) {
      reject("No results returned");
    } else {
      resolve(posted);
    }
  });
};

module.exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject("No results returned");
    } else {
      resolve(categories);
    }
  });
};
