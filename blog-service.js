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

module.exports.addPost = (postData) => {
  return new Promise((resolve, reject) => {
    if (postData.length === 0) {
      reject();
    }

    if (postData.published === undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }
    postData.id = posts.length + 1;
    posts.push(postData);
    resolve();
  });
};

module.exports.getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    let fPosts = posts.filter((post) => post.category === category);

    if (fPosts.length === 0) {
      reject("No results returned");
    } else {
      resolve(fPosts);
    }
  });
};

module.exports.getPostsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    let minDate = posts.filter(
      (post) => new Date(post.postDate) >= new Date(minDateStr)
    );

    if (minDate.length === 0) {
      reject("No results returned");
    } else {
      resolve(minDate);
    }
  });
};

module.exports.getPostById = (id) => {
  return new Promise((resolve, reject) => {
    let idPosts = posts.filter((post) => post.id === id);
    if (idPosts.length === 0) {
      reject("No results returned");
    } else {
      resolve(idPosts);
    }
  });
};
